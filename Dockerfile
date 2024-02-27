FROM hub.nexdev.net/base/node:20.9.0-alpine AS builder
WORKDIR /app

COPY ./package.json /app/package.json
COPY ./package-lock.json /app/package-lock.json

RUN npm install

COPY ./src/ .

ENV NODE_ENV production

ARG DEPLOY_ENV
RUN if [ "$DEPLOY_ENV" = "LOCAL" ]; then \
        echo "test deploy $DEPLOY_ENV"; \
    fi

EXPOSE 5000
CMD ["npm", "run", "build-local"]