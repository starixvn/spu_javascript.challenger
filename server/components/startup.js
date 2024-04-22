
const { setCache } = require('./node-cache.js');
const { getAllChallenges } = require('../challenges/challengeFunc.js');
const { JS_CHALLENGE_KEY, SETTING_CHALLENGE_KEY } = require('../constants/index.js');
const { CHALLENGE_SETTINGS } = require('../config/index.js')

const setCacheChallenges = async () =>{
    const allChallenges = await getAllChallenges();
    await setCache(JS_CHALLENGE_KEY, allChallenges);
}

const setCacheSettingChallenges = async () =>{
    await setCache(SETTING_CHALLENGE_KEY, CHALLENGE_SETTINGS);
}

const setAllCaches = async () =>{
    await setCacheChallenges();
    await setCacheSettingChallenges();
}

module.exports ={
    setAllCaches
}