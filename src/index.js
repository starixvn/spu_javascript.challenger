const express = require('express');
const cors = require('cors');
const config =  require('./config/index.js');
const { getAsync, setAsync } = require('./redis.js');
const jwt = require('jsonwebtoken');

const { getChallenges, executeChallenges } = require('./challenges/index.js');
const { errorHandler, asyncHandler } = require('./middleware/errorHandlingMiddleware.js');
const { verifyTokenMiddleware } = require('./middleware/jwtTokenMiddleware.js');

const app = express();

app.use(cors());

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
  if(req.headers['res-ck-x']){
    const challenges = await getChallenges();
    const challengeExpected = executeChallenges(challenges);
    const parseJson = JSON.stringify({id: challenges.map(x => x.id).join(','), expected: challengeExpected});
  
    await setAsync(`Challenge:${req.headers['res-ck-x']}`, parseJson , (err, reply) => {
      if (err) {
        captureException(err);
      }
    });
  
    res.json(challenges.map(challenge => challenge.encode));
  }
}));

app.post('/api/verify', verifyTokenMiddleware, asyncHandler(async (req, res) => {
  const challengeId = req.headers['res-ck-x'];
  const requestData = req.headers['res-fetch-x'];

  const challenge = await getAsync(`Challenge:${challengeId}`);

  const parseJson = JSON.parse(challenge);

  if(parseJson?.expected){
    const challengeResult = {
      chlId: parseJson.id,
      expect: parseJson.expected,
      actual: requestData,
      executeTime: req.headers['res-aet-x'] - req.headers['res-bet-x']
    }
  
    await setAsync(`Challenge:${req.headers['res-ck-x']}`, JSON.stringify(challengeResult) , (err, reply) => {
      if (err) {
        captureException(err);
      } else {
        console.log('Redis key set successfully:', reply);
      }
    });
  }

  res.send('OK');
}));


app.use(errorHandler)

app.listen(config.PORT, () => {
  console.log(`Server is running on http://localhost:${config.PORT}`);
});