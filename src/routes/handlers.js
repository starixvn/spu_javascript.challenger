const { getAsync, setAsync } = require("../redis.js");
const { getCache } = require("../node-cache.js");

const jwt = require("jsonwebtoken");

const { FUNC_CHALLENGE_KEY } = require("../constants/index.js");
const { executeChallenges } = require("../challenges/index.js");
const { captureException } = require("../sentry.js");
const config = require('../config/index.js');
const { verifyChallenge  } = require('../challenges/challengeFunc.js');

function getScriptBrowserChallenge(req, res, isExternal) {
  const token = getToken();
  const rootUrl = `${req.protocol}://${req.get("host")}`;
  const scriptContent = getCache("browser-challenge-key");

  const javascriptCode = scriptContent
    .replace(/_isExternal/g, isExternal)
    .replace(/_token/g, token)
    .replace(/_rootUrl/g, rootUrl);

  res.setHeader("Content-Type", "application/javascript");
  res.setHeader("Cache-Control", "max-age=31536000");
  res.send(javascriptCode);
}

async function setChallengeTask(sessionKey, challenges) {
  return new Promise((resolve, reject) => {
    const challengeExpected = executeChallenges(challenges);
    const parseJson = JSON.stringify({
      chlId: challenges.map((x) => x.id).join(","),
      params: challenges.map((x) => x.randomVal).join(", "),
      expected: challengeExpected,
      timeChl: new Date().getTime(),
    });

    resolve(
        setAsync(`Challenge:${sessionKey}`, parseJson, (err, reply) => {
        if (err) {
          captureException(err);
          reject(err);
        }
      })
    );
  });
}

async function getScriptFuncChallengeTask(
  sessionKey,
  challenges,
  token,
  rootUrl,
  isExternal
) {
  return new Promise((resolve, reject) => {
    const scriptContent = getCache(FUNC_CHALLENGE_KEY);

    if (scriptContent) {
      const javascriptCode = scriptContent
        .replace(/_sessionKey/g, sessionKey)
        .replace("_challenges", JSON.stringify(challenges))
        .replace(/_token/g, token)
        .replace(/_rootUrl/g, rootUrl)
        .replace(/_isExternal/g, isExternal);

      resolve(javascriptCode);
    } else {
      reject(new Error("Script content not found in cache"));
    }
  });
}

async function handleChallengeVerification(req, res, isExternal) {
  const challengeId = req.headers["res-ssk-x"];
  const requestData = req.headers["res-dt-x"];

  if (!(challengeId || requestData)) {
    return res.status(403).send();
  }

  const challenge = await getAsync(`Challenge:${challengeId}`);
  const parseJson = JSON.parse(challenge);

  const { chlId, params, expected, timeChl } = parseJson;

  if (!parseJson || !expected) {
    return res.status(403).send();
  }

  const actual = atob(requestData);

  const challengeResult = {
    chlId: chlId,
    params: params,
    expect: expected,
    actual: actual,
    timeExeChlServer: new Date().getTime() - timeChl,
    timeExeChlClient: req.headers["res-aet-x"] - req.headers["res-bet-x"],
  };

  const isBot = await verifyChallenge(challengeResult, actual, isExternal);

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
    getScriptBrowserChallenge,
    setChallengeTask,
    getScriptFuncChallengeTask,
    handleChallengeVerification
}