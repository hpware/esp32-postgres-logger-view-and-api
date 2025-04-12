# Build stage
FROM oven/bun:1 AS builder
WORKDIR /app
COPY package*.json ./
COPY bun.lock* ./
COPY . .

# Production stage
FROM oven/bun:1-slim AS runner
WORKDIR /app
RUN apt-get update && apt-get install -y wget && rm -rf /var/lib/apt/lists/*
COPY --from=builder /app/app/ ./app/
COPY --from=builder /app/package.json ./
COPY --from=builder /app/bun.lock* ./
COPY .env .env
RUN bun install --production

# Environment Variables
ARG POSTGRES
ENV POSTGRES=${POSTGRES}
ENV HOST=0.0.0.0
ENV PORT=3000
ENV NODE_ENV=production

EXPOSE 3000
CMD ["bun", "./app/index.ts"]