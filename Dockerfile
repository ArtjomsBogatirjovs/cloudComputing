
FROM node:14

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

COPY alpr-worker.js .

RUN npm install

EXPOSE 3000

CMD ["node", "app.js"]