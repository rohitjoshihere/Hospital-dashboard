FROM node:20-alpine

# ffmpeg for video thumbnail extraction
RUN apk add --no-cache ffmpeg

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma
RUN npx prisma generate

COPY . .

# Default command — overridden per service in docker-compose.yml
CMD ["npx", "ts-node", "server.ts"]
