const { captureException } = require('../sentry.js');

const errorHandler = (err, req, res, next) =>{
    captureException(err);
    res.status(500).json({ error: 'Internal Server Error' });
}

const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
    errorHandler,
    asyncHandler
  };

