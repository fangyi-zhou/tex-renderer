FROM node:stretch

RUN apt update && apt install texlive-full -y

WORKDIR /usr/src/app

COPY package.json yarn.lock ./

RUN yarn install

COPY . .

RUN yarn build

EXPOSE 8080
CMD [ "node", "main.js" ]
