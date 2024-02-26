FROM hub.nexdev.net/base/node:20.9.0-alpine AS builder
WORKDIR /app

COPY ./package.json /app/package.json
COPY ./package-lock.json /app/package-lock.json

RUN ls -al

RUN npm install --progress

COPY ./src/ .

EXPOSE 5000
CMD ["npm", "run", "build-pro"]