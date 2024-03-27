const { RATE_LIMIT_TIMEOUT, RATE_LIMIT_REQUEST} = require('../constants/index.js');

const requestCounts = {};

const rateLimit = (req, res, next) =>{
    const ip = req.ip;
    const userAgent = req.get('User-Agent');
    const key = `${ip}-${userAgent}`;

    if (!requestCounts[key]) {
        requestCounts[key] = 0;
    }

    requestCounts[key]++;

    if (requestCounts[key] > RATE_LIMIT_REQUEST) {
        return res.status(429).send('Too many requests, please try again later.');
    }

    setTimeout(() => {
        requestCounts[key] = 0;
    }, RATE_LIMIT_TIMEOUT);

    next();
}

module.exports = {
    rateLimit
};