const app = require('./app');

const config =  require('./config/index.js');
const { setAsync } = require('./redis.js');
const { captureException } = require('./sentry.js');

const path = require('path');

const { getChallenges } = require('./challenges/index.js');
const { asyncHandler } = require('./middleware/errorHandlingMiddleware.js');
const { verifyTokenMiddleware } = require('./middleware/jwtTokenMiddleware.js');
const {
  getScriptBrowserChallenge,
  setChallengeTask,
  getScriptFuncChallengeTask,
  handleChallengeVerification
} = require('./routes/handlers.js');

app.get('/healthz', (req, res) => {
  res.status(200).send(`env: ${JSON.stringify(process.env)} Date Time: ${new Date().getTime()}`);
});

app.get('/testSentry', asyncHandler(async (req, res, next) => {
  throw new Error('testSentry');
}));

app.get('/f/p/i/orchestrate_chl', asyncHandler(async (req, res) => {
  getScriptBrowserChallenge(req, res, false);
}));

app.get('/f/p/e/orchestrate_chl', asyncHandler(async (req, res) => {
  getScriptBrowserChallenge(req, res, true);
}));

app.get('/f/p/orchestrate_chl_func', asyncHandler(async (req, res) => {
  const sessionKey = req.headers['res-ssk-x'];
  const token = req.headers['res-tk-x'];
  const isExternal = req.headers['res-ix-x'];

  const challenges = await getChallenges();

  const setAsyncTask = sessionKey ? setChallengeTask(sessionKey, challenges) : Promise.resolve(null);

  const rootUrl = `${req.protocol}://${req.get('host')}`;
  const getScriptContentTask = getScriptFuncChallengeTask(sessionKey, challenges, token, rootUrl, isExternal);

  const [javascriptCode, _] = await Promise.all([getScriptContentTask, setAsyncTask]);

  res.setHeader('Content-Type', 'application/javascript');
  res.send(javascriptCode);
}));

app.post('/f/p/e/orchestrate_chl/v', asyncHandler(async (req, res) => {
  await handleChallengeVerification(req, res, true);
}));

app.post('/f/p/i/orchestrate_chl/v', asyncHandler(async (req, res) => {
  await handleChallengeVerification(req, res, false);
}));

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

    res.status(200).send();
  }else{
    res.status(200).json({isBot: true });
  }
}));

app.get("*", (req, res) => {
  const pathClient = config.NODE_ENV === 'development' ? "../client/build/index.html" : "/client/build/index.html"
  res.sendFile(path.join(__dirname + pathClient));
});

app.listen(config.PORT, () => {
  console.log(`Server is running on http://localhost:${config.PORT}`);
});