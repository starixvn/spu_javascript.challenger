FROM hub.nexdev.net/base/node:20.9.0-alpine AS builder

ARG TRANSFORM_CONFIG

WORKDIR /app

COPY ./package.json /app/package.json
COPY ./package-lock.json /app/package-lock.json

RUN npm install

COPY ./src/ .

EXPOSE 5000
RUN if [ "$TRANSFORM_CONFIG" = "LOCAL" ]; then \
        export NODE_ENV=local; \
        echo "print local"; \
    else \
        export NODE_ENV=production; \
        echo "print pro $TRANSFORM_CONFIG"; \
    fi
CMD ["npm", "run", "build-local"]
