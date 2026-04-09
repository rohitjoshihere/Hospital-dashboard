import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from '../config/logger';

// Prisma known error codes we want to surface cleanly
const PRISMA_NOT_FOUND = 'P2025';
const PRISMA_UNIQUE_VIOLATION = 'P2002';

interface PrismaError extends Error {
  code?: string;
  meta?: Record<string, unknown>;
}

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  // Zod validation errors
  if (err instanceof ZodError) {
    res.status(400).json({
      message: 'Validation error',
      errors: err.flatten(),
    });
    return;
  }

  const prismaErr = err as PrismaError;

  // Prisma: record not found
  if (prismaErr.code === PRISMA_NOT_FOUND) {
    res.status(404).json({ message: 'Resource not found' });
    return;
  }

  // Prisma: unique constraint violation
  if (prismaErr.code === PRISMA_UNIQUE_VIOLATION) {
    res.status(409).json({ message: 'Resource already exists', meta: prismaErr.meta });
    return;
  }

  // Multer file size error
  if (err.message?.includes('File too large')) {
    res.status(413).json({ message: 'File exceeds 10MB limit' });
    return;
  }

  // Log all unhandled errors with full stack
  logger.error('Unhandled error', {
    route: req.originalUrl,
    method: req.method,
    message: err.message,
    stack: err.stack,
  });

  res.status(500).json({ message: 'Internal server error' });
}
