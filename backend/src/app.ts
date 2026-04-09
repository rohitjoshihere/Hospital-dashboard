import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import { requestLogger } from './middleware/requestLogger';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth.routes';
import patientRoutes from './routes/patient.routes';
import mediaRoutes from './routes/media.routes';
import doctorRoutes from './routes/doctor.routes';
import { logger } from './config/logger';
import { config } from './config';

const app = express();

// ── Body parsing ──────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Static file serving for uploads and thumbnails ───────────────────────────
app.use('/uploads', express.static(path.resolve(config.uploadDir)));
app.use('/thumbnails', express.static(path.resolve(config.uploadDir, '..', 'thumbnails')));

// ── Structured request logging ────────────────────────────────────────────────
app.use(requestLogger);

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api', mediaRoutes);

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((_req: Request, res: Response): void => {
  res.status(404).json({ message: 'Route not found' });
});

// ── Centralized error handler (must be last) ──────────────────────────────────
app.use(errorHandler);

// Handle uncaught exceptions and unhandled rejections
process.on('uncaughtException', (err: Error) => {
  logger.error('Uncaught exception', { message: err.message, stack: err.stack });
  process.exit(1);
});

process.on('unhandledRejection', (reason: unknown) => {
  logger.error('Unhandled rejection', { reason });
});

export default app;
