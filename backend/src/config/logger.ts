import winston from 'winston';
import { config } from './index';

const { combine, timestamp, json, colorize, simple } = winston.format;

export const logger = winston.createLogger({
  level: 'info',
  format:
    config.nodeEnv === 'production'
      ? combine(timestamp(), json())
      : combine(colorize(), timestamp(), simple()),
  transports: [new winston.transports.Console()],
});
