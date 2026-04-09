import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { logger } from './config/logger';
import authRoutes from './routes/auth.routes';
import patientRoutes from './routes/patient.routes';
import mediaRoutes from './routes/media.routes';

const app = express();

// ── Body parsing ──────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Request logging ───────────────────────────────────────────────────────────
app.use((req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();
  res.on('finish', () => {
    logger.info('HTTP request', {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      responseTimeMs: Date.now() - start,
    });
  });
  next();
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api', mediaRoutes);

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((_req: Request, res: Response): void => {
  res.status(404).json({ message: 'Route not found' });
});

// ── Centralized error handler ─────────────────────────────────────────────────
app.use((err: Error, req: Request, res: Response, _next: NextFunction): void => {
  logger.error('Unhandled error', {
    route: req.originalUrl,
    message: err.message,
    stack: err.stack,
  });
  res.status(500).json({ message: 'Internal server error' });
});

export default app;
