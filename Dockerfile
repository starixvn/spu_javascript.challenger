FROM hub.nexdev.net/base/node:20.9.0-alpine AS builder

ARG TRANSFORM_CONFIG

WORKDIR /app

COPY ./package.json /app/package.json
COPY ./package-lock.json /app/package-lock.json

RUN npm install

ENV NODE_ENV $TRANSFORM_CONFIG

COPY ./src/ .
COPY ./client/build/ .

ENV TZ="America/La_Paz"

EXPOSE 5000

CMD ["npm", "run", "build-pro"]
