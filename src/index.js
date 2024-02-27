const express = require('express');
const cors = require('cors');
const config =  require('./config/index.js');
const { getAsync, setAsync } = require('./redis.js');
const jwt = require('jsonwebtoken');

const { getChallenges, executeChallenges } = require('./challenges/index.js');
const { errorHandler, asyncHandler } = require('./middleware/errorHandlingMiddleware.js');
const { verifyTokenMiddleware } = require('./middleware/jwtTokenMiddleware.js');

const app = express();

app.use(cors())

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