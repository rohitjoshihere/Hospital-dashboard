import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();

  res.on('finish', () => {
    const responseTimeMs = Date.now() - start;
    const level = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info';

    logger[level]('HTTP request', {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      responseTimeMs,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
  });

  next();
}
