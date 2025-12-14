FROM node:20-slim

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist ./dist
COPY docs ./docs

CMD ["node", "dist/index.js"]
