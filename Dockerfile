FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
# Enable pnpm
RUN corepack enable pnpm && pnpm i --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
ENV NEXT_TELEMETRY_DISABLED=1

# Set build-time environment variables (adjust these values as needed)
ENV NEXTAUTH_URL=https://dashboard.osborncarrental.com
ENV NEXTAUTH_SECRET=76/7b1EBPbkxZqD+hYv/4fKJMC4cdKFLHa6W+j0crLA=
ENV NEXT_PUBLIC_API_HOST=https://api.osborncarrental.com/api/v1
ENV NEXT_PUBLIC_BASIC_AUTH_USER=LINhzGdEo9
ENV NEXT_PUBLIC_BASIC_AUTH_PASSWORD=l5vEiYS7HO
ENV NEXT_PUBLIC_SENTRY_DSN=
ENV UPLOADTHING_TOKEN=eyJhcGlLZXkiOiJza19saXZlX2M1ZjYwMzg1ZDk0YjcyMWE4ZGE0MTY5YjQzOWEyZWM3YTc3MDQ3M2U4MWZkM2ZjNGRiYzYwMmZkZGU3ZGI5NDEiLCJhcHBJZCI6InF4YXhhbWd5MXEiLCJyZWdpb25zIjpbInNlYTEiXX0=
ENV NEXT_DISABLE_SWC_WORKERS=1

# Build the application
RUN corepack enable pnpm && pnpm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXTAUTH_URL=https://dashboard.osborncarrental.com
ENV NEXTAUTH_SECRET=76/7b1EBPbkxZqD+hYv/4fKJMC4cdKFLHa6W+j0crLA=
ENV NEXT_PUBLIC_API_HOST=https://api.osborncarrental.com/api/v1
ENV NEXT_PUBLIC_BASIC_AUTH_USER=LINhzGdEo9
ENV NEXT_PUBLIC_BASIC_AUTH_PASSWORD=l5vEiYS7HO
ENV NEXT_PUBLIC_SENTRY_DSN=
ENV UPLOADTHING_TOKEN=eyJhcGlLZXkiOiJza19saXZlX2M1ZjYwMzg1ZDk0YjcyMWE4ZGE0MTY5YjQzOWEyZWM3YTc3MDQ3M2U4MWZkM2ZjNGRiYzYwMmZkZGU3ZGI5NDEiLCJhcHBJZCI6InF4YXhhbWd5MXEiLCJyZWdpb25zIjpbInNlYTEiXX0=
# Uncomment the following line in case you want to disable telemetry during runtime.
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000

# server.js is created by next build from the standalone output
# https://nextjs.org/docs/pages/api-reference/next-config-js/output
CMD HOSTNAME="0.0.0.0" node server.js

