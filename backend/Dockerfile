FROM node:20-alpine

WORKDIR /app

COPY backend/package*.json ./
COPY backend/tsconfig.json ./
COPY backend/tsconfig.build.json ./
COPY backend/nest-cli.json ./
COPY backend/prisma ./prisma/
COPY samples ./samples/
RUN npm install
RUN npx prisma generate

COPY backend/src ./src/
COPY backend/test ./test/
COPY backend/eslint.config.mjs ./

RUN npm run build

EXPOSE 3000

CMD ["node", "dist/src/main.js"]
