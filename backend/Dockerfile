FROM node:20-alpine AS base

# ffmpeg for video thumbnails, openssl for Prisma on alpine/musl
RUN apk add --no-cache ffmpeg openssl openssl-dev

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma
RUN npx prisma generate

COPY . .

# Create upload and thumbnail directories
RUN mkdir -p /app/uploads /app/thumbnails

# Default command — overridden per service in docker-compose.yml
CMD ["npx", "ts-node", "server.ts"]
