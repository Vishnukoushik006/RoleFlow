# ─── Stage 1: Build Frontend ─────────────────────────
FROM node:20-alpine AS client-builder
WORKDIR /app/client

COPY client/package*.json ./
RUN npm ci

COPY client/ ./
RUN npm run build

# ─── Stage 2: Production Server ──────────────────────
FROM node:20-alpine AS production
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5001

# Copy server package files and install production dependencies only
COPY server/package*.json ./server/
WORKDIR /app/server
RUN npm ci --only=production

# Copy server code
COPY server/ ./

# Copy built frontend assets from stage 1
COPY --from=client-builder /app/client/dist /app/client/dist

# Create uploads directory
RUN mkdir -p uploads && chown -R node:node /app

USER node
EXPOSE 5001

CMD ["node", "server.js"]
