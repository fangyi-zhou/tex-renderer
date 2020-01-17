FROM node:buster

RUN apt update && apt install texlive-latex-extra latexmk -y && rm -rf /var/lib/apt/lists

WORKDIR /usr/src/app

COPY package.json yarn.lock ./

RUN yarn install

COPY . .

RUN yarn build

EXPOSE 8080

ENV NODE_ENV production

CMD [ "node", "main.js" ]
