# Build stage
FROM node:20-alpine AS builder

RUN npm install -g pnpm

WORKDIR /app

# Copy workspace files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY packages ./packages
COPY apps/api ./apps/api

# Install dependencies
RUN pnpm install --frozen-lockfile

# Generate Prisma client
RUN pnpm --filter @assetsally/database generate

# Build the API
RUN pnpm --filter @assetsally/api build

# Production stage
FROM node:20-alpine AS runner

RUN npm install -g pnpm

WORKDIR /app

# Copy built files
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/package.json ./
COPY --from=builder /app/packages/database/node_modules/.prisma ./node_modules/.prisma

EXPOSE 3001

ENV NODE_ENV=production
ENV PORT=3001

CMD ["node", "dist/main"]
