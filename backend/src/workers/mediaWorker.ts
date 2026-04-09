import path from 'path';
import fs from 'fs';
import { Worker, Job } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import sharp from 'sharp';
import ffmpeg from 'fluent-ffmpeg';
import { redisConnection } from '../queues/mediaQueue';
import { logger } from '../config/logger';
import { config } from '../config';

const prisma = new PrismaClient();

interface MediaJobData {
  mediaId: string;
  filePath: string;
  type: 'IMAGE' | 'VIDEO';
}

// Ensure thumbnails directory exists
const thumbsDir = path.resolve(config.uploadDir, '..', 'thumbnails');
if (!fs.existsSync(thumbsDir)) fs.mkdirSync(thumbsDir, { recursive: true });

function buildThumbPath(filePath: string, ext: string): string {
  const basename = path.basename(filePath, path.extname(filePath));
  return path.join(thumbsDir, `${basename}-thumb${ext}`);
}

// Returns the web-accessible relative URL for the thumbnail
function buildThumbUrl(filePath: string, ext: string): string {
  const basename = path.basename(filePath, path.extname(filePath));
  return `/thumbnails/${basename}-thumb${ext}`;
}

async function processImage(filePath: string, thumbPath: string): Promise<sharp.Metadata> {
  await sharp(filePath)
    .resize(300, 300, { fit: 'cover' })
    .toFile(thumbPath);

  return sharp(filePath).metadata();
}

function processVideo(filePath: string, thumbPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    ffmpeg(filePath)
      .on('end', () => resolve())
      .on('error', (err: Error) => reject(err))
      .screenshots({
        timestamps: ['00:00:00'],
        filename: path.basename(thumbPath),
        folder: path.dirname(thumbPath),
        size: '300x300',
      });
  });
}

export const mediaWorker = new Worker<MediaJobData>(
  'media-processing',
  async (job: Job<MediaJobData>) => {
    const { mediaId, filePath, type } = job.data;

    logger.info('Worker job started', { jobId: job.id, mediaId, type });

    // Mark as PROCESSING
    await prisma.media.update({
      where: { id: mediaId },
      data: { status: 'PROCESSING' },
    });

    try {
      if (type === 'IMAGE') {
        const thumbPath = buildThumbPath(filePath, '.jpg');
        const thumbUrl = buildThumbUrl(filePath, '.jpg');
        const metadata = await processImage(filePath, thumbPath);

        await prisma.media.update({
          where: { id: mediaId },
          data: {
            status: 'COMPLETED',
            thumbPath: thumbUrl,
            metadata: JSON.parse(JSON.stringify(metadata)),
            processedAt: new Date(),
          },
        });

        logger.info('Worker job completed', { jobId: job.id, mediaId, type: 'IMAGE' });
      } else {
        const thumbPath = buildThumbPath(filePath, '.jpg');
        const thumbUrl = buildThumbUrl(filePath, '.jpg');
        await processVideo(filePath, thumbPath);

        await prisma.media.update({
          where: { id: mediaId },
          data: {
            status: 'COMPLETED',
            thumbPath: thumbUrl,
            processedAt: new Date(),
          },
        });

        logger.info('Worker job completed', { jobId: job.id, mediaId, type: 'VIDEO' });
      }
    } catch (err) {
      logger.error('Worker job failed', {
        jobId: job.id,
        mediaId,
        message: (err as Error).message,
        stack: (err as Error).stack,
      });

      await prisma.media.update({
        where: { id: mediaId },
        data: { status: 'FAILED' },
      });

      // Re-throw so BullMQ marks the job as failed and applies retry backoff
      throw err;
    }
  },
  {
    connection: redisConnection,
    concurrency: 5,
  }
);

mediaWorker.on('failed', (job, err) => {
  logger.error('Job permanently failed', {
    jobId: job?.id,
    mediaId: job?.data?.mediaId,
    message: err.message,
  });
});
