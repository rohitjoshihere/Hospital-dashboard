import winston from 'winston';

const { combine, timestamp, json, colorize, simple } = winston.format;

const isProduction = process.env['NODE_ENV'] === 'production';

export const logger = winston.createLogger({
  level: 'info',
  format: isProduction
    ? combine(timestamp(), json())
    : combine(colorize(), timestamp(), simple()),
  transports: [new winston.transports.Console()],
});
