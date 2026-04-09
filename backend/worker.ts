import { logger } from './src/config/logger';
import './src/workers/mediaWorker'; // registers the BullMQ worker

logger.info('Media worker process started', { pid: process.pid });

// Graceful shutdown
async function shutdown(signal: string): Promise<void> {
  logger.info(`Received ${signal}, shutting down worker gracefully`);
  process.exit(0);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
