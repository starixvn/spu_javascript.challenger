const Sentry = require("@sentry/node");
const { SENTRY_DNS } = require('../config/index');

let initialized = false;

const initSentry = () => {
    if (!initialized) {
        Sentry.init({ dsn: SENTRY_DNS });
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