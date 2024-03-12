const redis = require('redis');
const config =  require('./config/index.js');

const redisClient = redis.createClient({
  password: config.REDIS_PASSWORD,
  socket: {
    host: config.REDIS_HOST,
    port: config.REDIS_PORT,
    ssl: false,
    connectTimeout: 5000,
    keepAlive: 30000
  },
  database: config.REDIS_DATABASE,
});

(async () => { 
    await redisClient
    .on('error', err => console.log('Redis Client Error', err))
    .connect();
})(); 

async function setAsync(key, value, callback) {
  redisClient.set(key, value, (err, reply) => {
    if (err) {
      console.error('Error setting key-value pair:', err);
      callback(err, null);
    } else {
      console.log('Key-value pair set successfully:', reply);
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