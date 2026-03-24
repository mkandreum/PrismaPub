# Build stage
FROM node:20-slim AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Runtime stage
FROM node:20-slim

WORKDIR /app

# Install fonts required for SVG/ticket image rendering with Sharp/librsvg
RUN apt-get update && apt-get install -y --no-install-recommends fonts-liberation fonts-noto-color-emoji && rm -rf /var/lib/apt/lists/*

# Install production dependencies only
COPY package*.json ./
RUN npm install --omit=dev && npm install -g tsx

# Copy build files
COPY --from=builder /app/dist ./dist
COPY server.ts ./server.ts

# Copy entrypoint
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Persistence volumes
VOLUME ["/app/data", "/app/uploads"]

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["tsx", "server.ts"]
