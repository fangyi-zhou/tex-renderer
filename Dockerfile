FROM node:current

RUN apt update && apt install texlive-latex-extra latexmk -y && rm -rf /var/lib/apt/lists

WORKDIR /usr/src/app

COPY package.json yarn.lock ./

RUN yarn install

COPY . .

RUN yarn build

RUN cd app && tsc

ENV NODE_ENV production

CMD [ "node", "app/main.js" ]
