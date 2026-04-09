import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { saveAndEnqueue, getMediaStatus } from '../services/media.service';
import { logger } from '../config/logger';

const prisma = new PrismaClient();

export async function uploadMedia(req: Request, res: Response): Promise<void> {
  const { id: patientId } = req.params;

  // Verify patient exists
  try {
    const patient = await prisma.patient.findUnique({ where: { id: patientId } });
    if (!patient) {
      res.status(404).json({ message: 'Patient not found' });
      return;
    }
  } catch (err) {
    logger.error('Patient lookup failed during upload', {
      message: (err as Error).message,
      stack: (err as Error).stack,
    });
    res.status(500).json({ message: 'Internal server error' });
    return;
  }

  const file = req.file;
  if (!file) {
    res.status(400).json({ message: 'No file uploaded. Use field name "file".' });
    return;
  }

  try {
    const mediaId = await saveAndEnqueue(patientId, file);
    res.status(202).json({ mediaId });
  } catch (err) {
    logger.error('Media upload failed', {
      patientId,
      message: (err as Error).message,
      stack: (err as Error).stack,
    });
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function mediaStatus(req: Request, res: Response): Promise<void> {
  const { id } = req.params;

  try {
    const media = await getMediaStatus(id);
    if (!media) {
      res.status(404).json({ message: 'Media not found' });
      return;
    }
    res.json(media);
  } catch (err) {
    logger.error('Media status fetch failed', {
      mediaId: id,
      message: (err as Error).message,
      stack: (err as Error).stack,
    });
    res.status(500).json({ message: 'Internal server error' });
  }
}
