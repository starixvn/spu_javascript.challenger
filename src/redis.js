const redis = require('redis');
const config =  require('../config/index.js');

const redisClient = redis.createClient({
  password: config.REDIS_PASSWORD,
  socket: {
    host: config.REDIS_HOST,
    port: config.REDIS_PORT,
  },
  database: config.REDIS_DATABASE,
});

(async () => { 
  await redisClient.connect(); 
})(); 

redisClient.on('connect', () => {
  console.log('Connected to Redis server');
});

redisClient.on('error', (err) => {
  console.error('Error connecting to Redis server:', err);
  redisClient.quit();
});

async function setAsync(key, value, callback) {
  redisClient.set(key, value, (err, reply) => {
    if (err) {
      console.error('Error setting key-value pair:', err);
      callback(err, null);
    } else {
      console.log('Key-value pair set successfully:', reply);
      callback(null, reply);
    }
    redisClient.quit();
  });
}

async function getAsync(key) {
  return await redisClient.get(key);
}

module.exports = {
  setAsync,
  getAsync,
  redisClient
};