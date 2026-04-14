FROM node:22-alpine AS base
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npx prisma generate --schema=src/prisma/schema.prisma
RUN npx tsc
RUN cp -r src/prisma dist/

# Production stage
FROM node:22-alpine AS production
WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY --from=base /app/dist ./dist
COPY --from=base /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=base /app/node_modules/@prisma ./node_modules/@prisma

EXPOSE 3000
CMD ["sh", "-c", "npx prisma migrate deploy --schema=dist/prisma/schema.prisma && node dist/index.js"]
