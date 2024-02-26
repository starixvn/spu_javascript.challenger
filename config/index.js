const dotenv = require('dotenv');
const path = require('path');

dotenv.config({
    path: path.resolve(__dirname, `${process.env.NODE_ENV}.env`)
});

module.exports = {
    NODE_ENV : process.env['NODE_ENV'] || 'development',
    PORT : process.env['PORT'],

    REDIS_HOST: process.env['REDIS_HOST'],
    REDIS_PORT: process.env['REDIS_PORT'],
    REDIS_PASSWORD: process.env['REDIS_PASSWORD'],
    REDIS_DATABASE: process.env['REDIS_DATABASE'],

    JWT_ID: process.env['JWT_ID'],
    JWT_EXPIRES: process.env['JWT_EXPIRES'],
    SECRET_KEY: process.env['SECRET_KEY'],
}