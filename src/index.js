const express = require('express');
const cors = require('cors');
const config =  require('./config/index.js');
const { getAsync, setAsync, existAsync } = require('./redis.js');
const jwt = require('jsonwebtoken');
const {getScript} = require ('./script.js');
const { captureException } = require('./sentry.js');

const { getChallenges, executeChallenges } = require('./challenges/index.js');
const { errorHandler, asyncHandler } = require('./middleware/errorHandlingMiddleware.js');
const { verifyTokenMiddleware } = require('./middleware/jwtTokenMiddleware.js');

const { getAllChallenges } = require('./challenges/challengeFunc.js');
const apiRouter = require("./routes/api");

const path = require('path');
const fs = require('fs');
const ejs = require('ejs');

const app = express();

app.enable('trust proxy');

app.use(cors());

app.use(express.json());

app.get('/healthz', (req, res) => {
  res.status(200).send(`env: ${JSON.stringify(process.env)} Date Time: ${new Date().getTime()}`);
});

app.get('/testSentry', asyncHandler(async (req, res, next) => {
  throw new Error('testSentry');
}));


app.get('/f/p/orchestrate_chl', asyncHandler(async (req, res) => {
  const sessionKey = req.query?.ssk;
  const key = await existAsync(`Challenge:${sessionKey}`);

  let javascriptCode = 'console.log("ok")';

  if(key === 0){
    const challenges = await getChallenges();
    const challengeEncode = challenges.map(challenge => challenge.encode);
    const challengeExpected = executeChallenges(challenges);
  
    const token = getToken();
  
    const parseJson = JSON.stringify({chlId: challenges.map(x => x.id).join(','), expected: challengeExpected, timeChl: new Date().getTime()});
  
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

app.post('/f/p/orchestrate_chl/v', asyncHandler(async (req, res) => {
  const challengeId = req.headers['res-ck-x'];
  const requestData = req.headers['res-dt-x'];
  if(challengeId || requestData){
    const challenge = await getAsync(`Challenge:${challengeId}`);

    const parseJson = JSON.parse(challenge);
  
    if(parseJson?.expected){
      const challengeResult = {
        chlId: parseJson.chlId,
        expect: parseJson.expected,
        actual: requestData,
        timeExeChlServer: new Date().getTime() - parseJson.timeChl,
        timeExeChlClient: req.headers['res-aet-x'] - req.headers['res-bet-x']
      }
    
      await setAsync(`Challenge:${challengeId}`, JSON.stringify(challengeResult) , (err, reply) => {
        if (err) {
          captureException(err);
        } else {
          console.log('Redis key set successfully:', reply);
        }
      });
    }
  }

  res.send('OK');
}));

app.post('/f/p/orchestrate_chl/e', verifyTokenMiddleware, asyncHandler(async (req, res) => {
  const challengeId = req.headers['res-ck-x'];
  const message = req.headers['res-msg-x'];

  if(challengeId && message){
    const challengeResult = {
      errMsg: message
    }
  
    await setAsync(`Challenge:${challengeId}`, JSON.stringify(challengeResult) , (err, reply) => {
      if (err) {
        captureException(err);
      } else {
        console.log('Redis key set successfully:', reply);
      }
    });
  }

  res.send('OK');
}));

app.use("/api", apiRouter);

app.use(express.static(path.join(__dirname, "../client/build")));

app.get("*", (req, res) => {
  console.log("req.path", req.path);
  res.sendFile(path.join(__dirname + "../client/build/index.html"));
});

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