const redis = require('redis');
const { captureException } = require("./sentry.js");

const {REDIS_HOST, REDIS_PORT, REDIS_DATABASE, REDIS_EXPIRES, REDIS_PASSWORD} =  require('../config/index.js');

let redisClient = createClient();

(async () => { 
    await redisClient
    .on('error', err => {
    })
    .connect();
})(); 

async function setAsync(key, value, ex = REDIS_EXPIRES) {
  try{
    redisClient.set(key, value, {EX: ex});
  }catch(err){
    captureException(err.message);
  }
}

async function getAsync(key) {
  return await redisClient.get(key);
}

async function existAsync(key) {
  return await redisClient.exists(key);
}

function createClient() {
  return redis.createClient({
    password: REDIS_PASSWORD,
    socket: {
      host: REDIS_HOST,
      port: REDIS_PORT,
      ssl: false,
      connectTimeout: 5000,
      keepAlive: 30000,
      reconnectStrategy: (attempts) => {
        return 5000;
      },
    },
    database: REDIS_DATABASE,
  })
}

module.exports = {
  setAsync,
  getAsync,
  existAsync,
  redisClient
};