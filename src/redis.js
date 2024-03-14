const redis = require('redis');
const {REDIS_HOST, REDIS_PORT, REDIS_DATABASE, REDIS_EXPIRES, REDIS_PASSWORD} =  require('./config/index.js');

const redisClient = redis.createClient({
  password: REDIS_PASSWORD,
  socket: {
    host: REDIS_HOST,
    port: REDIS_PORT,
    ssl: false,
    connectTimeout: 5000,
    keepAlive: 30000
  },
  database: REDIS_DATABASE,
});

(async () => { 
    await redisClient
    .on('error', err => console.log('Redis Client Error', err))
    .connect();
})(); 

async function setAsync(key, value, callback, ex = REDIS_EXPIRES) {
  redisClient.set(key, value, {EX: ex}, (err, reply) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, reply);
    }
    redisClient.disconnect();
  });
}

async function getAsync(key) {
  return await redisClient.get(key);
}

async function existAsync(key) {
  return await redisClient.exists(key);
}

module.exports = {
  setAsync,
  getAsync,
  existAsync,
  redisClient
};