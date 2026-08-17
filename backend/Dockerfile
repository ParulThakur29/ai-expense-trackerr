FROM node:22-bookworm

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci --omit=dev --ignore-scripts --no-audit --no-fund

RUN npm rebuild better-sqlite3 --foreground-scripts

COPY . .

EXPOSE 3000

CMD ["npm", "start"]