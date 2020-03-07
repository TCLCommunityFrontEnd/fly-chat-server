FROM node:10.13.0

WORKDIR /app

COPY . /app/

EXPOSE 3012

RUN npm install -g cnpm --registry=https://registry.npm.taobao.org \
&& cnpm install

CMD ["node","app.js"]
