const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const config =  require('./config/index.js');
const { getAsync, setAsync } = require('./redis.js');
const { getChallenges, executeChallenges } = require('./challenges/index.js');

const app = express();

app.use(cors())

app.use(express.json());

app.get('/healthz', (req, res) => {
  res.status(200).send(config.NODE_ENV);
});

app.get('/api/getToken', async (req, res) => {
  const {JWT_ID, SECRET_KEY, JWT_EXPIRES} = config;
  const token = jwt.sign(
    { id: JWT_ID },
      SECRET_KEY,
    { expiresIn: JWT_EXPIRES });

  res.json(token);
});

app.get('/api/getChallenges', async (req, res) => {
  const challenges = getChallenges();
  const json = {
    id: req.query.sessionId,
    challenges: challenges
  };

  const challengeExpected = executeChallenges(challenges);

  console.log('challengeExpected', challengeExpected);

  if(req.query?.sessionId){
    await setAsync(`Challenge:${req.query.sessionId}`, challengeExpected , (err, reply) => {
      if (err) {
        console.error('Error setting Redis key:', err);
      } else {
        console.log('Redis key set successfully:', reply);
      }
    });
  }

  res.json(JSON.stringify(json));
});

const verifyTokenMiddleware = (req, res, next) => {
  const token = req.headers.authorization;
  if (token) {
    const tokenString = token.startsWith('Bearer ') ? token.slice(7) : token;
    jwt.verify(tokenString, config.SECRET_KEY, (err, decoded) => {
        if (err) {
            console.error(err);
            res.status(403).json({ message: 'Token verification failed' });
        } else {
            req.user = decoded;
            next();
        }
    });
  } else {
      res.status(401).json({ message: 'Token not provided' });
  }
};

app.post('/api/verify', verifyTokenMiddleware, async (req, res) => {
  const requestData = req.body;
  console.log('verify', requestData.id);
  const expect = await getAsync(`Challenge:${requestData.id}`);
  const message = expect === requestData.result ? 'verified' : 'bot detect';

  console.log(message);
  res.json({ message: message});
});

app.listen(config.PORT, () => {
  console.log(`Server is running on http://localhost:${config.PORT}`);
});

function parseCookies(req) {
  const cookieHeader = req.headers.cookie;
  const cookies = {};

  if (cookieHeader) {
    cookieHeader.split(';').forEach((cookie) => {
      const parts = cookie.split('=');
      const name = parts[0].trim();
      const value = parts[1].trim();
      cookies[name] = value;
    });
  }

  return cookies;
}