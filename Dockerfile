FROM mhart/alpine-node:10
ARG BUNDLER
WORKDIR /usr/src
COPY package.json ./
RUN yarn install
COPY . .
RUN yarn build
RUN mv ./dist /public