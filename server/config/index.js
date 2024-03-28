const dotenv = require('dotenv');
const path = require('path');

dotenv.config({
    path: path.resolve(__dirname, `${process.env?.NODE_ENV?.toLowerCase() || 'development'}.env`)
});

module.exports = {
    NODE_ENV : process.env['NODE_ENV'] || 'development',
    PORT : process.env['PORT'] || 5000,

    REDIS_HOST: process.env['REDIS_HOST'] || '10.18.200.131',
    REDIS_PORT: process.env['REDIS_PORT'] || 16379,
    REDIS_PASSWORD: process.env['REDIS_PASSWORD'] || 'foo1@bared',
    REDIS_DATABASE: process.env['REDIS_DATABASE'] || 14,
    REDIS_EXPIRES: process.env['REDIS_EXPIRES'] || 30,

    JWT_ID: process.env['JWT_ID'],
    JWT_EXPIRES: process.env['JWT_EXPIRES'],
    SECRET_KEY: process.env['SECRET_KEY'],

    SENTRY_DNS: process.env['SENTRY_DNS'],

    CHALLENGE_SETTINGS: {
        RANDOM_NUM_CHALLENGES: process.env['RANDOM_NUM_CHALLENGES'],
        NUM_CHALLENGE_IDS: process.env['NUM_CHALLENGE_IDS'] || '',
    
        MIN: process.env['MIN_RANDOM_NUMBER'],
        MAX: process.env['MAX_RANDOM_NUMBER'],
    
        RANDOM_LENGTH_STRING: process.env['RANDOM_LENGTH_STRING'],
        RANDOM_LENGTH_ARRAY: process.env['RANDOM_LENGTH_ARRAY'],
        RANDOM_LENGTH_OBJECT: process.env['RANDOM_LENGTH_OBJECT']
    }
}