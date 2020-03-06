FROM node:10.13.0

WORKDIR /app

COPY . /app/

EXPOSE 3010

RUN node app.js