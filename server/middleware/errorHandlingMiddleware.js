const { captureException } = require('../components/sentry.js');
const config =  require('../config/index.js');


const errorHandler = (err, req, res, next) =>{
    console.error(err);
    if(config.NODE_ENV === 'development'){
        res.status(500).json({ error: err.stack });
    }else{
        captureException(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
    errorHandler,
    asyncHandler
};

