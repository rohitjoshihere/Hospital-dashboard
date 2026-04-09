import winston from 'winston';

const { combine, timestamp, json, colorize, printf, errors } = winston.format;

const isProduction = process.env['NODE_ENV'] === 'production';

// Human-readable format for development
const devFormat = combine(
  colorize({ all: true }),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  errors({ stack: true }),
  printf((info) => {
    const level = info.level as string;
    const message = info.message as string;
    const ts = info['timestamp'] as string | undefined;
    const stack = info['stack'] as string | undefined;
    const { level: _l, message: _m, timestamp: _t, stack: _s, ...meta } = info;
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
