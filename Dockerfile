ARG TRANSFORM_CONFIG
FROM hub.nexdev.net/base/node:20.9.0-alpine AS builder
WORKDIR /app

COPY ./package.json /app/package.json
COPY ./package-lock.json /app/package-lock.json

RUN npm install

ENV NODE_ENV production

RUN if [ "$TRANSFORM_CONFIG" = "LOCAL" ]; then \
        export NODE_ENV=local; \
        echo "print check in if"; \
    else \
        echo "TRANSFORM_CONFIG123 $TRANSFORM_CONFIG"; \
    fi

COPY ./src/ .

EXPOSE 5000
CMD ["npm", "run", "build-local"]