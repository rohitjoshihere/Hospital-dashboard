import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { PrismaClient } from '@prisma/client';
import { config } from '../config';
import { mediaQueue } from '../queues/mediaQueue';
import { logger } from '../config/logger';

type MediaType = 'IMAGE' | 'VIDEO';

const prisma = new PrismaClient();

// ── Ensure upload + thumbnail directories exist ───────────────────────────────
const uploadsDir = path.resolve(config.uploadDir);
const thumbsDir = path.resolve(config.uploadDir, '..', 'thumbnails');

for (const dir of [uploadsDir, thumbsDir]) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

// ── Multer disk storage ───────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

function fileFilter(
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
): void {
  const allowed = /jpeg|jpg|png|gif|webp|mp4|mov|avi|mkv|webm/;
  const ext = path.extname(file.originalname).toLowerCase().slice(1);
  if (allowed.test(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type: ${ext}`));
  }
}

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

// ── Detect media type from mimetype ──────────────────────────────────────────
function resolveMediaType(mimetype: string): MediaType {
  return mimetype.startsWith('video/') ? 'VIDEO' : 'IMAGE';
}

// ── Save media record + enqueue job (non-blocking) ───────────────────────────
export async function saveAndEnqueue(
  patientId: string,
  file: Express.Multer.File
): Promise<string> {
  const type = resolveMediaType(file.mimetype);

  const media = await prisma.media.create({
    data: {
      patientId,
      filePath: file.path,
      type,
      status: 'PENDING',
    },
  });

  // Fire-and-forget — API returns 202 immediately
  await mediaQueue.add('process-media', {
    mediaId: media.id,
    filePath: file.path,
    type,
  });

  logger.info('Media enqueued', { mediaId: media.id, type, patientId });

  return media.id;
}

// ── Get media status ──────────────────────────────────────────────────────────
export async function getMediaStatus(mediaId: string) {
  return prisma.media.findUnique({
    where: { id: mediaId },
    select: {
      id: true,
      status: true,
      type: true,
      thumbPath: true,
      metadata: true,
      uploadedAt: true,
      processedAt: true,
    },
  });
}
