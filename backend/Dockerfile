FROM node:20-alpine AS base
WORKDIR /usr/src/app

COPY package*.json ./
COPY prisma ./prisma/
RUN npm install

COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /usr/src/app

COPY --from=base /usr/src/app/node_modules ./node_modules
COPY --from=base /usr/src/app/dist ./dist
COPY --from=base /usr/src/app/prisma ./prisma
COPY --from=base /usr/src/app/package*.json ./

EXPOSE 3000

CMD npx prisma migrate deploy \
  && npm run prisma:seed \
  && node dist/src/main.js
