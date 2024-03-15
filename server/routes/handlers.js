const { getAsync, setAsync } = require("../components/redis.js");

const jwt = require("jsonwebtoken");
const fs = require('node:fs');
const path = require('path');

const { executeChallenges } = require("../challenges/index.js");
const { captureException } = require("../components/sentry.js");
const config = require('../config/index.js');
const { verifyChallenge  } = require('../challenges/challengeFunc.js');
const JSFuck = require('../components/jsfuck.js').JSFuck;
const { BROWSER_CHALLENGES } = require('../constants/browserChallenge.js');
const { NODE_ENV } = require('../config/index');
const env = NODE_ENV === 'development' ? 'dev' : 'pro';

async function getScriptChallenge(req, res, isExternal) {
  const token = getToken();
  const rootUrl = `${req.protocol}://${req.get("host")}`;

  const encode = JSFuck.encode(JSON.stringify(BROWSER_CHALLENGES));
  const scriptContent = await fs.readFileSync(path.resolve(__dirname,`../script/${env}/challengeScript.js`), 'utf-8');

  const javascriptCode = scriptContent
    .replace(/_isExternal/g, isExternal)
    .replace(/_browserChallenges/g, encode)
    .replace(/_token/g, token)
    .replace(/_rootUrl/g, rootUrl);

  res.setHeader("Content-Type", "application/javascript");
  res.setHeader("Cache-Control", "max-age=31536000");
  res.send(javascriptCode);
}

async function setCacheChallenge(sessionKey, challenges) {
  const challengeExpected = executeChallenges(challenges);

  const parseJson = JSON.stringify({
    ChallengeIds: challenges.map((x) => x.id).join(","),
    Parameters: challenges.map((x) => x.randomVal).join(", "),
    Expected: challengeExpected,
    TimeChl: new Date().getTime(),
  });

  await setAsync(`Challenge:${sessionKey}`, parseJson, (err, reply) => {
    if (err) {
      captureException(err);
    }
  })
} 

async function handleChallengeVerification(req, res, isExternal) {
  const challengeId = req.headers["res-ssk-x"];
  const requestData = req.headers["res-dt-x"];

  if (!(challengeId || requestData)) {
    return res.status(403).send();
  }

  const challenge = await getAsync(`Challenge:${challengeId}`);
  const parseJson = JSON.parse(challenge);

  const { ChallengeIds, Parameters, Expected, TimeChl } = parseJson;

  if (!parseJson || !Expected) {
    return res.status(403).send();
  }

  const actual = atob(requestData);

  const challengeResult = {
    ChallengeIds: ChallengeIds,
    Parameters: Parameters,
    Expect: Expected,
    Actual: actual,
    ExeServerTimeInSecond: new Date().getTime() - TimeChl,
    ExeClientTimeInSecond: req.headers["res-aet-x"] - req.headers["res-bet-x"],
  };

  const isBot = await verifyChallenge(challengeId, challengeResult, actual, isExternal);

  if (!isExternal) {
    return res.status(200).send();
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
    setCacheChallenge,
    handleChallengeVerification
}