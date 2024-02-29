const express = require('express');
const cors = require('cors');
const config =  require('./config/index.js');
const { getAsync, setAsync, existAsync } = require('./redis.js');
const jwt = require('jsonwebtoken');
const {getScript} = require ('./script.js');

const { getChallenges, executeChallenges } = require('./challenges/index.js');
const { errorHandler, asyncHandler } = require('./middleware/errorHandlingMiddleware.js');
const { verifyTokenMiddleware } = require('./middleware/jwtTokenMiddleware.js');

const app = express();

app.use(cors());

app.use(express.json());

app.get('/healthz', (req, res) => {
  res.status(200).send(`env: ${JSON.stringify(process.env)} Date Time: ${new Date().getTime()}`);
});

app.get('/testSentry', asyncHandler(async (req, res, next) => {
  throw new Error('testSentry');
}));


app.get('/f/p/orchestrate_chl', asyncHandler(async (req, res) => {
  const sessionKey = req.headers['res-ck-x'];
  const key = await existAsync(`Challenge:${sessionKey}`);

  let javascriptCode = 'console.log("ok")';

  if(key === 0){
    const challenges = await getChallenges();
    const challengeEncode = challenges.map(challenge => challenge.encode);
    const challengeExpected = executeChallenges(challenges);
  
    const token = getToken();
  
    const parseJson = JSON.stringify({id: challenges.map(x => x.id).join(','), expected: challengeExpected, timeChl: new Date().getTime()});
  
    if(sessionKey)
      await setAsync(`Challenge:${sessionKey}`, parseJson , (err, reply) => {
        if (err) {
          captureException(err);
        }
    });
  
    const rootUrl = `${req.protocol}://${req.get('host')}`;
    javascriptCode = getScript(sessionKey, challengeEncode, token, rootUrl);
  }
  
  res.setHeader('Content-Type', 'application/javascript');
  res.send(javascriptCode);
}));

app.post('/f/p/orchestrate_chl/v', verifyTokenMiddleware, asyncHandler(async (req, res) => {
  const challengeId = req.headers['res-ck-x'];
  const requestData = req.headers['res-fetch-x'];

  const challenge = await getAsync(`Challenge:${challengeId}`);

  const parseJson = JSON.parse(challenge);

  console.log(parseJson.timeChl);

  if(parseJson?.expected){
    const challengeResult = {
      chlId: parseJson.id,
      expect: parseJson.expected,
      actual: requestData,
      timeExeChlServer: new Date().getTime() - parseJson.timeChl,
      timeExeChlClient: req.headers['res-aet-x'] - req.headers['res-bet-x']
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

const getToken = () =>{
  const {JWT_ID, SECRET_KEY, JWT_EXPIRES} = config;
  const token = jwt.sign(
    { id: JWT_ID },
      SECRET_KEY,
    { expiresIn: JWT_EXPIRES });

  return token;
}


app.use(errorHandler)

app.listen(config.PORT, () => {
  console.log(`Server is running on http://localhost:${config.PORT}`);
});