FROM https://hub.nexdev.net/base/node:20.9.0-alpine AS builder
WORKDIR /app

COPY package.json yarn.lock

RUN npm install

RUN npm run reg \
    && yarn install --production \
    && npx mod-pruner prune --force

COPY ./src/ .

USER node
ENV PATH /app/node_modules/.bin:$PATH
COPY --from=builder /app .

ENV TZ="America/La_Paz"

EXPOSE 5000
CMD ["npm", "build-pro"]