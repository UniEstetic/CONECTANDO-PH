# Stage 1: Install dependencies
FROM node:20 AS deps

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm@9 && pnpm install --frozen-lockfile

# Stage 2: Build the application
FROM node:20 AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Next.js build
RUN npm install -g pnpm@9 && pnpm build

# Stage 3: Production runner
FROM node:20 AS runner

WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
