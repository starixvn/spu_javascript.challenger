const express = require('express');
const cors = require('cors');
const compression = require('compression');

const config =  require('./config/index.js');
const { getAsync, setAsync } = require('./redis.js');
const jwt = require('jsonwebtoken');
const { captureException } = require('./sentry.js');

const apiRouter = require("./routes/api");
const path = require('path');

const { getChallenges, executeChallenges } = require('./challenges/index.js');
const { errorHandler, asyncHandler } = require('./middleware/errorHandlingMiddleware.js');
const { verifyTokenMiddleware } = require('./middleware/jwtTokenMiddleware.js');
const { setAllCache } = require('./startup.js');
const { getCache } = require('./node-cache.js');
const { FUNC_CHALLENGE_KEY } = require('./constants/index.js');

const app = express();

setAllCache();

app.enable('trust proxy');
app.use(cors());
app.use(compression());
app.use(express.json());

app.get('/healthz', (req, res) => {
  res.status(200).send(`env: ${JSON.stringify(process.env)} Date Time: ${new Date().getTime()}`);
});

app.get('/testSentry', asyncHandler(async (req, res, next) => {
  throw new Error('testSentry');
}));

function sendScript(req, res, isExternal) {
  const token = getToken();
  const rootUrl = `${req.protocol}://${req.get('host')}`;
  const scriptContent = getCache('browser-challenge-key');

  const javascriptCode = scriptContent
    .replace(/_isExternal/g, isExternal)
    .replace(/_token/g, token)
    .replace(/_rootUrl/g, rootUrl);
  
  res.setHeader('Content-Type', 'application/javascript');
  res.setHeader('Cache-Control', 'max-age=31536000');
  res.send(javascriptCode);
}

app.get('/f/p/i/orchestrate_chl', asyncHandler(async (req, res) => {
  sendScript(req, res, false);
}));

app.get('/f/p/e/orchestrate_chl', asyncHandler(async (req, res) => {
  sendScript(req, res, true);
}));


app.get('/f/p/orchestrate_chl_func', asyncHandler(async (req, res) => {
  const sessionKey = req.headers['res-ssk-x'];
  const token = req.headers['res-tk-x'];
  const isExternal = req.headers['res-ix-x'];

  const challenges = await getChallenges();

  const setAsyncTask = sessionKey ? setChallengeTask(sessionKey, challenges) : Promise.resolve(null);

  const rootUrl = `${req.protocol}://${req.get('host')}`;
  const getScriptContentTask = generateJavascriptCodeTask(sessionKey, challenges, token, rootUrl, isExternal);

  const [javascriptCode, _] = await Promise.all([getScriptContentTask, setAsyncTask]);

  res.setHeader('Content-Type', 'application/javascript');
  res.send(javascriptCode);
}));

async function setChallengeTask(sessionKey, challenges){
  return new Promise((resolve, reject) => {
      const challengeExpected = executeChallenges(challenges);
      const parseJson = JSON.stringify({
          chlId: challenges.map(x => x.id).join(','),
          params: challenges.map(x => x.randomVal).join(', '),
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

async function generateJavascriptCodeTask(sessionKey, challenges, token, rootUrl, isExternal) {
  return new Promise((resolve, reject) => {
      const scriptContent = getCache(FUNC_CHALLENGE_KEY);

      if (scriptContent) {
          const javascriptCode = scriptContent
              .replace(/_sessionKey/g, sessionKey)
              .replace('_challenges', JSON.stringify(challenges))
              .replace(/_token/g, token)
              .replace(/_rootUrl/g, rootUrl)
              .replace(/_isExternal/g, isExternal)
              ;

          resolve(javascriptCode);
      } else {
          reject(new Error('Script content not found in cache'));
      }
  });
}

app.post('/f/p/e/orchestrate_chl/v', asyncHandler(async (req, res) => {
  await handleChallengeVerification(req, res, true);
}));

app.post('/f/p/i/orchestrate_chl/v', asyncHandler(async (req, res) => {
  await handleChallengeVerification(req, res, false);
}));

async function handleChallengeVerification(req, res, isExternal) {
  const challengeId = req.headers['res-ssk-x'];
  const requestData = req.headers['res-dt-x'];

  if (!(challengeId || requestData)) {
    return res.send('OK');
  }

  const challenge = await getAsync(`Challenge:${challengeId}`);
  const parseJson = JSON.parse(challenge);

  if (!parseJson || !parseJson.expected) {
    return res.send('OK');
  }

  const expect = parseJson.expected;
  const actual = atob(requestData);

  if (!isExternal) {

    const challengeResult = {
      chlId: parseJson.chlId,
      params: parseJson.params,
      expect: expect,
      actual: actual,
      timeExeChlServer: new Date().getTime() - parseJson.timeChl,
      timeExeChlClient: req.headers['res-aet-x'] - req.headers['res-bet-x']
    };

    await setAsync(`Challenge:${challengeId}`, JSON.stringify(challengeResult), (err, reply) => {
      if (err) {
        captureException(err);
      }
    });

    return res.send('OK');
  } else {
    return res.status(200).json({ isBot: expect !== actual });
  }
}

app.post('/f/p/orchestrate_chl/e', verifyTokenMiddleware, asyncHandler(async (req, res) => {
  const challengeId = req.headers['res-ssk-x'];
  const message = req.headers['res-msg-x'];
  const isExternal = req.headers['res-ix-x'];

  if(isExternal === 'false'){
    const challengeResult = {
      errMsg: message
    }

  
    await setAsync(`Challenge:${challengeId}`, JSON.stringify(challengeResult) , (err, reply) => {
      if (err) {
        captureException(err);
      }
    });

    res.send('OK');
  }else{
    res.status(200).json({isBot: true, message });
  }
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