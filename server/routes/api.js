const express = require('express');
const router = express.Router();
const { asyncHandler } = require('../middleware/errorHandlingMiddleware.js');
const { getCacheChallenges } = require('../challenges/index.js');
const { getCache, setCache } = require('../components/node-cache.js');

const { SETTING_CHALLENGE_KEY } = require('../constants/index.js');

router.get('/setChallenge/:chlId?', asyncHandler(async (req, res, next) => {
  const chlId = req.params.chlId;
  const settingChallenges = getCache(SETTING_CHALLENGE_KEY);
  const settingChallengesUpdated = {
    ...settingChallenges, NUM_CHALLENGE_IDS: chlId.replace(/\s/g, '')
  }

  await setCache(SETTING_CHALLENGE_KEY, settingChallengesUpdated);
  res.status(200).send();
}));

router.get('/setNumberRandomChallenge/:numChl?', asyncHandler(async (req, res, next) => {
  const numChl = req.params.numChl;
  const settingChallenges = getCache(SETTING_CHALLENGE_KEY);
  const settingChallengesUpdated = {
    ...settingChallenges, RANDOM_NUM_CHALLENGES: numChl, NUM_CHALLENGE_IDS: ''
  }
  await setCache(SETTING_CHALLENGE_KEY, settingChallengesUpdated);
  res.status(200).send();
}));

router.get('/getChallenges', asyncHandler(async (req, res, next) => {
  const data = getCacheChallenges();
  const sortData = data.sort((a, b) => b.id - a.id);
  res.json(sortData);
}));

router.get('/getSettingChallenges', asyncHandler(async (req, res, next) => {
    const settingChallenges = getCache(SETTING_CHALLENGE_KEY);
    res.json(settingChallenges);
}));

module.exports = router;