FROM hub.nexdev.net/base/node:20.9.0-alpine AS builder
WORKDIR /app

COPY ./package.json /app/package.json
COPY ./package-lock.json /app/package-lock.json

RUN npm install

# RUN npm run reg \
#     && yarn install --production \
#     && npx mod-pruner prune --force

COPY ./src/ .

EXPOSE 5000
CMD ["npm", "build-pro"]