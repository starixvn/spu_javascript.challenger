const express = require('express');
const cors = require('cors');
const config =  require('./config/index.js');
const { getAsync, setAsync } = require('./redis.js');
const jwt = require('jsonwebtoken');

const { getChallenges, executeChallenges } = require('./challenges/index.js');
const { errorHandler, asyncHandler } = require('./middleware/errorHandlingMiddleware.js');
const { verifyTokenMiddleware } = require('./middleware/jwtTokenMiddleware.js');

const app = express();

// app.use((req, res, next) => {
//   res.setHeader('Access-Control-Allow-Origin', '*');
//   res.setHeader('Access-Control-Allow-Credentials','true');
//   res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
//   res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Amz-Version-Id');
//   next();
// });

app.use(cors());

// app.use(cors({
//   allowedHeaders: ['Content-Type', 'Authorization', 'x-amz-version-id']
// }));

app.use(express.json());

app.get('/healthz', (req, res) => {
  res.status(200).send(process.env);
});

app.get('/testSentry', asyncHandler(async (req, res, next) => {
  throw new Error('testSentry');
}));

app.get('/api/getToken', asyncHandler(async (req, res) => {
  const {JWT_ID, SECRET_KEY, JWT_EXPIRES} = config;
  const token = jwt.sign(
    { id: JWT_ID },
      SECRET_KEY,
    { expiresIn: JWT_EXPIRES });

  res.json(token);
}));

app.get('/api/getChallenges', asyncHandler(async (req, res) => {
  console.log('getChallenges', req.query.sessionId);
  console.log(req.headers['x-amz-version-id']);
  const cookies = parseCookies(req);
  console.log('cookies', cookies)

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
        captureException(err);
      } else {
        console.log('Redis key set successfully:', reply);
      }
    });
  }

  res.json(JSON.stringify(json));
}));

app.post('/api/verify', verifyTokenMiddleware, asyncHandler(async (req, res) => {
  const requestData = req.body;
  const expect = await getAsync(`Challenge:${requestData.id}`);
  const message = expect === requestData.result ? 'verified' : 'bot detect';
  res.json({ message: message});
}));

app.use(errorHandler)

app.listen(config.PORT, () => {
  console.log(`Server is running on http://localhost:${config.PORT}`);
});

const parseCookies = req => {
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