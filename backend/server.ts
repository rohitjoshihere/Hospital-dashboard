import app from './src/app';
import { config } from './src/config';
import { logger } from './src/config/logger';

app.listen(config.port, () => {
  logger.info(`API server running`, { port: config.port, env: config.nodeEnv });
});
