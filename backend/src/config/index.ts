import dotenv from 'dotenv';
dotenv.config();

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required environment variable: ${key}`);
  return value;
}

export const config = {
  port: parseInt(process.env['PORT'] ?? '3001', 10),
  databaseUrl: requireEnv('DATABASE_URL'),
  redisUrl: requireEnv('REDIS_URL'),
  jwtSecret: requireEnv('JWT_SECRET'),
  uploadDir: process.env['UPLOAD_DIR'] ?? './uploads',
  nodeEnv: process.env['NODE_ENV'] ?? 'development',
} as const;
