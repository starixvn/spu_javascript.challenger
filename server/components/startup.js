
const { setCache } = require('./node-cache.js');
const { getAllChallenges, getChallengeSetting } = require('../challenges/challengeFunc.js');
const { JS_CHALLENGE_KEY, SETTING_CHALLENGE_KEY } = require('../constants/index.js');

const setCacheChallenges = async () =>{
    const allChallenges = await getAllChallenges();
    await setCache(JS_CHALLENGE_KEY, allChallenges);
}

const setCacheSettingChallenges = async () =>{
    const settings = await getChallengeSetting();
    await setCache(SETTING_CHALLENGE_KEY, settings);
}

const setAllCaches = async () =>{
    await setCacheChallenges();
    await setCacheSettingChallenges();
}

module.exports ={
    setAllCaches
}