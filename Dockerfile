FROM node:20-slim

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./
COPY src ./src
COPY docs ./docs

RUN npm ci
RUN npm run build

ENV PORT=3000
EXPOSE 3000

CMD ["node", "dist/index.js"]
