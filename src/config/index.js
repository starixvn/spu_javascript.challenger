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

    JWT_ID: process.env['JWT_ID'],
    JWT_EXPIRES: process.env['JWT_EXPIRES'],
    SECRET_KEY: process.env['SECRET_KEY'],

    RANDOM_NUM_CHALLENGES: process.env['RANDOM_NUM_CHALLENGES'],
    RANDOM_LENGTH_STRING: process.env['RANDOM_LENGTH_STRING'],
    MIN: process.env['MIN'],
    MAX: process.env['MAX'],
    RANDOM_LENGTH_ARRAY: process.env['RANDOM_LENGTH_ARRAY']
}