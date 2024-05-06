
const { setCache } = require('./node-cache.js');
const { getAllChallenges } = require('../challenges/challengeFunc.js');

const { JS_CHALLENGE_KEY, SETTING_CHALLENGE_KEY } = require('../constants/index.js');
const { CHALLENGE_SETTINGS, NODE_ENV } = require('../config/index.js');
const { BROWSER_CHALLENGES } = require('../constants/browserChallenge.js');

const { getObfuscatedCode } = require('./jsObfuscator.js');

const fs = require('node:fs');
const path = require('path');
const env = NODE_ENV === 'development' ? 'dev' : 'pro';

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

const setBuildScriptChallenge = async () =>{
    const encode = getObfuscatedCode(JSON.stringify(BROWSER_CHALLENGES));
    const scriptContent = await fs.readFileSync(path.resolve(__dirname,`../script/challengeScript.js`), 'utf-8');

    const javascriptCode = scriptContent.replace(/_browserChallenges/g, encode);
    const finalContent = env === 'pro' ? getObfuscatedCode(javascriptCode) : javascriptCode;

    await fs.writeFileSync(path.resolve(__dirname,`../script/${env}/challengeScript.js`), finalContent, 'utf8');
}

module.exports ={
    setAllCaches,
    setBuildScriptChallenge
}