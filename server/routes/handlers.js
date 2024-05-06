const { getAsync, setAsync } = require("../components/redis.js");

const jwt = require("jsonwebtoken");
const fs = require('node:fs');
const path = require('path');

const { executeChallenges } = require("../challenges/index.js");
const config = require('../config/index.js');
const { verifyChallenge  } = require('../challenges/challengeFunc.js');
const { NODE_ENV } = require('../config/index');
const env = NODE_ENV === 'development' ? 'dev' : 'pro';

async function getScriptChallenge(req, res, isExternal) {
  const rootUrl = `${req.protocol}://${req.get("host")}`;
  const scriptContent = await fs.readFileSync(path.resolve(__dirname,`../script/${env}/challengeScript.js`), 'utf-8');

  const javascriptCode = scriptContent
    .replace(/_isExternal/g, isExternal)
    .replace(/_rootUrl/g, rootUrl);

  res.setHeader("Content-Type", "application/javascript");
  res.setHeader("Cache-Control", "max-age=31536000");
  res.send(javascriptCode);
}

async function setRedisChallenge(sessionKey, challenges) {
  const challengeExpected = executeChallenges(challenges);

  const parseJson = JSON.stringify({
    ChallengeIds: challenges.map((x) => x.id).join(","),
    Parameters: challenges.map((x) => x.randomVal).join(", "),
    Expected: challengeExpected,
    TimeChl: new Date().getTime(),
  });

  await setAsync(`Challenge:${sessionKey}`, parseJson);
} 

async function setRedisChallengeTest(sessionKey, challenges) {
  const challengeExpected = executeChallenges(challenges);

  const parseJson = JSON.stringify({
    ChallengeIds: challenges.map((x) => x.id).join(","),
    Parameters: challenges.map((x) => x.randomVal).join(", "),
    Expected: challengeExpected,
    TimeChl: new Date().getTime(),
  });

  setAsync(`Challenge:${sessionKey}`, parseJson)
} 

async function handleChallengeVerification(req, res, isExternal) {
  const challengeId = req.headers["res-ssk-x"];
  const requestData = req.headers["res-dt-x"];

  if (!(challengeId || requestData)) {
    return res.status(403).send();
  }

  const timeServer = new Date().getTime();

  const challenge = await getAsync(`Challenge:${challengeId}`);
  const parseJson = JSON.parse(challenge);

  const { ChallengeIds, Parameters, Expected, TimeChl } = parseJson || {};

  if (!parseJson || !Expected) {
    return res.status(403).send();
  }

  const actual = atob(requestData);

  const challengeResult = {
    challengeIds: ChallengeIds,
    parameters: Parameters,
    expect: Expected,
    actual: actual,
    timeExeChlServer: timeServer - TimeChl,
    timeExeChlClient: req.headers["res-aet-x"] - req.headers["res-bet-x"],
  };

  const isBot = await verifyChallenge(challengeId, challengeResult, actual, isExternal);

  if (!isExternal) {
    return res.status(200).send('OK');
  } else {
    return res.status(200).json({ isBot: isBot });
  }
}

const getToken = () => {
  const { JWT_ID, SECRET_KEY, JWT_EXPIRES } = config;
  const token = jwt.sign({ id: JWT_ID }, SECRET_KEY, {
    expiresIn: JWT_EXPIRES,
  });

  return token;
};

module.exports = {
    getScriptChallenge,
    setRedisChallenge,
    setRedisChallengeTest,
    handleChallengeVerification
}