FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .
COPY prisma ./prisma
RUN npx prisma generate
RUN npm run build

# Producción
FROM node:20-alpine
WORKDIR /app

COPY --from=builder /app ./

ENV NODE_ENV=production
EXPOSE 3000

CMD ["npm", "run", "start"]
