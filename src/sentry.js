const Sentry = require("@sentry/node");

let initialized = false;

const initSentry = () => {
    if (!initialized) {
        Sentry.init({ dsn: 'https://ed8e16114a244f55b83976f89b313361@sentry.nexdev.net/141' });
    }

    initialized = true;
};

const captureException = (message) => {
    initSentry();
    Sentry.captureException(message)
};

module.exports = {
  captureException,
};