const express = require("express");
const router = express.Router();

const crypto = require('crypto');

const { setAsync } = require('../components/redis.js');
const { captureException } = require('../components/sentry.js');

const { getChallenges } = require('../challenges/index.js');
const { asyncHandler } = require('../middleware/errorHandlingMiddleware.js');
const { verifyTokenMiddleware } = require('../middleware/jwtTokenMiddleware.js');
const {
  getScriptChallenge,
  setRedisChallenge,
  handleChallengeVerification
} = require('./handlers.js');

router.get('/f/p/i/orchestrate_chl', asyncHandler(async (req, res) => {
  getScriptChallenge(req, res, false);
}));

router.get('/f/p/e/orchestrate_chl', asyncHandler(async (req, res) => {
  getScriptChallenge(req, res, true);
}));

router.get('/f/p/orchestrate_chl_func', asyncHandler(async (req, res) => {
  const sessionKey = req.headers['res-ssk-x'];
  const challenges = getChallenges();

  if(sessionKey){
    setRedisChallenge(sessionKey, challenges)
  }

  const challengesEncode = challenges.map(chl => {
    return {
      id: chl.id,
      encode: chl.encode
    }
  });

  res.status(200).send(challengesEncode);
}));

router.get('/f/p/orchestrate_chl_func_test', asyncHandler(async (req, res) => {
  const sessionKey = crypto.randomUUID();

  const challenges = getChallenges();

  if(sessionKey){
    setRedisChallenge(sessionKey, challenges)
  }

  const challengesEncode = challenges.map(chl => {
    return {
      id: chl.id,
      encode: chl.encode
    }
  });

  res.status(200).send(challengesEncode);
}));

router.post('/f/p/e/orchestrate_chl/v', verifyTokenMiddleware, asyncHandler(async (req, res) => {
  await handleChallengeVerification(req, res, true);
}));

router.post('/f/p/i/orchestrate_chl/v', verifyTokenMiddleware, asyncHandler(async (req, res) => {
  await handleChallengeVerification(req, res, false);
}));

router.post('/f/p/orchestrate_chl/e', verifyTokenMiddleware, asyncHandler(async (req, res) => {
  const challengeId = req.headers['res-ssk-x'];
  const message = req.headers['res-msg-x'];
  const isExternal = req.headers['res-ix-x'];

  if(isExternal === 'false'){
    const challengeResult = {
      Result: 1,
      ErrMsg: message
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

router.post('/f/p/c/orchestrate_chl/e', verifyTokenMiddleware, asyncHandler(async (req, res) => {
  const challengeId = req.headers['res-ssk-x'];
  const message = req.headers['res-msg-x'];
  const isExternal = req.headers['res-ix-x'];

  if(!isExternal){
    const errMsg = `Error client js challenge: ${challengeId}, message: ${message}`;
    throw new Error(errMsg);
  }else{
    res.status(500).send(message);
  }
}));

router.get('/healthz', (req, res) => {
  res.status(200).send(`env: ${JSON.stringify(process.env)} Date Time: ${new Date().getTime()}`);
});

router.get('/testSentry', asyncHandler(async (req, res, next) => {
  throw new Error('testSentry');
}));

module.exports = router;