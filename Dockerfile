FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

EXPOSE 5000

CMD ["sh", "-c", "npx knex migrate:latest --knexfile ./knexfile.ts && node dist/server.js"]
