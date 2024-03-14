
const { setCache } = require('./node-cache.js');
const { getAllChallenges } = require('../challenges/challengeFunc.js');
const { JS_CHALLENGE_KEY } = require('../constants/index.js');

const setCacheChallenges = async () =>{
    const allChallenges = await getAllChallenges();
    await setCache(JS_CHALLENGE_KEY, allChallenges);
}

module.exports ={
    setCacheChallenges
}