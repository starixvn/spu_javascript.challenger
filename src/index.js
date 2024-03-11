const express = require('express');
const cors = require('cors');
const compression = require('compression');

const config =  require('./config/index.js');
const { getAsync, setAsync, existAsync } = require('./redis.js');
const jwt = require('jsonwebtoken');
const { captureException } = require('./sentry.js');

const apiRouter = require("./routes/api");
const path = require('path');

const { getChallenges, executeChallenges } = require('./challenges/index.js');
const { errorHandler, asyncHandler } = require('./middleware/errorHandlingMiddleware.js');
const { verifyTokenMiddleware } = require('./middleware/jwtTokenMiddleware.js');
const { setAllCache } = require('./startup.js');
const { getCache } = require('./node-cache.js');

const app = express();

setAllCache();

app.enable('trust proxy');
app.use(cors());
app.use(compression());

app.get('/healthz', (req, res) => {
  res.status(200).send(`env: ${JSON.stringify(process.env)} Date Time: ${new Date().getTime()}`);
});

app.get('/testSentry', asyncHandler(async (req, res, next) => {
  throw new Error('testSentry');
}));

app.get('/f/p/orchestrate_chl_br', asyncHandler(async (req, res) => {
  const sessionKey = req.query?.ssk;
  const key = await existAsync(`Challenge:${sessionKey}`);
  let javascriptCode = 'console.log("ok")';

  if(key === 0 || true){
    const token = getToken();
    const rootUrl = `${req.protocol}://${req.get('host')}`;
    const scriptContent = getCache('browser-challenge-key');
  
    javascriptCode = scriptContent
    .replace(/_sessionKey/g, sessionKey)
    .replace(/_token/g, token)
    .replace(/_rootUrl/g, rootUrl);
  }
  
  res.setHeader('Content-Type', 'application/javascript');
  res.send(javascriptCode);
}));

app.get('/f/p/orchestrate_chl_func', asyncHandler(async (req, res) => {
  const sessionKey = req.headers['res-ssk-x'];
  const token = req.headers['res-tk-x'];

  const challenges = await getChallenges();

  const setAsyncTask = sessionKey ? setChallengeTask(sessionKey, challenges) : Promise.resolve(null);

  const rootUrl = `${req.protocol}://${req.get('host')}`;
  const getScriptContentTask = generateJavascriptCodeTask(sessionKey, challenges, token, rootUrl);

  const [javascriptCode, _] = await Promise.all([getScriptContentTask, setAsyncTask]);

  res.setHeader('Content-Type', 'application/javascript');
  res.send(javascriptCode);
}));

async function setChallengeTask(sessionKey, challenges){
  return new Promise((resolve, reject) => {
      const challengeExpected = executeChallenges(challenges);
      const parseJson = JSON.stringify({
          chlId: challenges.map(x => x.id).join(','),
          expected: challengeExpected,
          timeChl: new Date().getTime()
      });

      resolve(
        setAsync(`Challenge:${sessionKey}`, parseJson, (err, reply) => {
          if (err) {
              captureException(err);
              reject(err);
          }
      }));
  }) 
}

async function generateJavascriptCodeTask(sessionKey, challenges, token, rootUrl) {
  return new Promise((resolve, reject) => {
      const scriptContent = getCache('func_challenge-key');
      if (scriptContent) {
          const javascriptCode = scriptContent
              .replace(/_sessionKey/g, sessionKey)
              .replace('_challenges', JSON.stringify(challenges))
              .replace(/_token/g, token)
              .replace(/_rootUrl/g, rootUrl);
          resolve(javascriptCode);
      } else {
          reject(new Error('Script content not found in cache'));
      }
  });
}

app.post('/f/p/orchestrate_chl/v', asyncHandler(async (req, res) => {
  const challengeId = req.headers['res-ck-x'];
  const requestData = req.headers['res-dt-x'];

  if(challengeId || requestData){
    const challenge = await getAsync(`Challenge:${challengeId}`);

    const parseJson = JSON.parse(challenge);

    const expect = parseJson.expected;
  
    if(parseJson?.expected){
      const challengeResult = {
        chlId: parseJson.chlId,
        expect: expect,
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

    res.status(200).json({ isBot: expect !== requestData });
  }else{
    res.send('OK');
  }
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

app.use(express.static(path.join(__dirname, config.NODE_ENV === 'development' ? "../client/build" : "/client/build")));

app.get("*", (req, res) => {
  const pathClient = config.NODE_ENV === 'development' ? "../client/build/index.html" : "/client/build/index.html"
  res.sendFile(path.join(__dirname + pathClient));
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