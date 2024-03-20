
const { setCache } = require('./node-cache.js');
const { getAllChallenges } = require('../challenges/challengeFunc.js');
const { JS_CHALLENGE_KEY, SETTING_CHALLENGE_KEY } = require('../constants/index.js');
const { NUM_CHALLENGE_IDS } = require('../config/index.js')

const setCacheChallenges = async () =>{
    const allChallenges = await getAllChallenges();
    await setCache(JS_CHALLENGE_KEY, allChallenges);
}

const setCacheSettingChallenges = async () =>{
    await setCache(SETTING_CHALLENGE_KEY, NUM_CHALLENGE_IDS);
}

const setAllCaches = async () =>{
    await setCacheChallenges();
    await setCacheSettingChallenges();
}

module.exports ={
    setAllCaches
}