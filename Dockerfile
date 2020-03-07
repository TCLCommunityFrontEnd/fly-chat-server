FROM node:10.13.0

WORKDIR /app

COPY . /app/

EXPOSE 3010

RUN npm install -g cnpm --registry=https://registry.npm.taobao.org \
&& cnpm install && node app.js
