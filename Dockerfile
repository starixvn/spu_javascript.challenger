FROM hub.nexdev.net/base/node:20.9.0-alpine AS client-builder

WORKDIR /app/client

COPY client/package*.json ./

RUN npm install

COPY client/ .

RUN npm run build

FROM hub.nexdev.net/base/node:20.9.0-alpine AS builder

ARG TRANSFORM_CONFIG

WORKDIR /app

COPY --from=client-builder /app/client/build ./client/build

COPY ./package.json /app/package.json
COPY ./package-lock.json /app/package-lock.json

RUN npm install

ENV NODE_ENV $TRANSFORM_CONFIG

COPY ./server/ .

ENV TZ="America/La_Paz"

EXPOSE 5000

CMD ["npm", "run", "build-pro"]