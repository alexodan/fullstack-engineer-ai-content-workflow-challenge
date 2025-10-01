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

# Create startup script with better error handling
RUN echo '#!/bin/sh' > /usr/src/app/start.sh && \
    echo 'set -e' >> /usr/src/app/start.sh && \
    echo 'echo "🔄 Running database migrations..."' >> /usr/src/app/start.sh && \
    echo 'npx prisma migrate deploy' >> /usr/src/app/start.sh && \
    echo 'echo "✅ Migrations completed"' >> /usr/src/app/start.sh && \
    echo 'echo "🌱 Running database seed..."' >> /usr/src/app/start.sh && \
    echo 'npm run prisma:seed || echo "⚠️  Seeding failed or skipped"' >> /usr/src/app/start.sh && \
    echo 'echo "🚀 Starting application..."' >> /usr/src/app/start.sh && \
    echo 'node dist/src/main.js' >> /usr/src/app/start.sh && \
    chmod +x /usr/src/app/start.sh

CMD ["/usr/src/app/start.sh"]
