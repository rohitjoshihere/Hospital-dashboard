import winston from 'winston';

const { combine, timestamp, json, colorize, printf, errors } = winston.format;

const isProduction = process.env['NODE_ENV'] === 'production';

// Human-readable format for development
const devFormat = combine(
  colorize({ all: true }),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  errors({ stack: true }),
  printf((info: { level: string; message: string; timestamp?: string; stack?: string; [key: string]: unknown }) => {
    const { level, message, timestamp: ts, stack, ...meta } = info;
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `${ts} [${level}]: ${stack ?? message}${metaStr}`;
  })
);

// Structured JSON format for production
const prodFormat = combine(
  timestamp(),
  errors({ stack: true }),
  json()
);

export const logger = winston.createLogger({
  level: isProduction ? 'info' : 'debug',
  format: isProduction ? prodFormat : devFormat,
  transports: [new winston.transports.Console()],
  // Prevent winston from exiting on uncaught exceptions
  exitOnError: false,
});
