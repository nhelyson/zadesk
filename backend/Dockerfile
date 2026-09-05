# Dockerfile Backend Node.js
FROM node:22-alpine AS base

# Install OpenSSL needed by Prisma on Alpine
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

# Copy dependency definitions and prisma schema first for caching
COPY package*.json ./
COPY prisma ./prisma/

RUN npm install --legacy-peer-deps

# Generate Prisma Client
RUN npx prisma generate

# Copy the rest of the application code
COPY . .

EXPOSE 4000

CMD ["sh", "-c", "npx prisma db push && npm start"]
