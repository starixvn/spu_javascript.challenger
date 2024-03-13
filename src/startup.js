const fs = require('node:fs');
const path = require('path');
const { setCache } = require('./node-cache.js');
const { getAllChallenges } = require('./challenges/challengeFunc.js');
const { BROWSER_CHALLENGES } = require('./constants/browserChallenge.js');
const JSFuck = require('./components/jsfuck.js').JSFuck;
const { NODE_ENV } = require('./config/index');
const {BROWSER_CHALLENGE_KEY, JS_CHALLENGE_KEY, FUNC_CHALLENGE_KEY} = require('./constants/index.js');

const env = NODE_ENV === 'development' ? 'dev' : 'pro';

const setCacheScriptFile = async () =>{
    const scriptContent = await fs.readFileSync(path.resolve(__dirname,`./script/${env}/functionChallengeScript.js`), 'utf-8');
    setCache(FUNC_CHALLENGE_KEY, scriptContent);
}

const setCacheChallenges = async () =>{
    const allChallenges = await getAllChallenges();
    setCache(JS_CHALLENGE_KEY, allChallenges);
}


const setCacheBrowsers = async () =>{
    const scriptContent = await fs.readFileSync(path.resolve(__dirname,`./script/${env}/browserChallengeScript.js`), 'utf-8');
    const encode = JSFuck.encode(JSON.stringify(BROWSER_CHALLENGES));
    const javascriptCode = scriptContent
    .replace(/_browserChallenges/g, encode);

    setCache(BROWSER_CHALLENGE_KEY, javascriptCode)
}

const setAllCache = async () =>{
    try {
        await Promise.all([
            setCacheScriptFile(),
            setCacheChallenges(),
            setCacheBrowsers()
        ]);
        console.log('All cache settings have been set.');
    } catch (error) {
        console.error('Error setting cache:', error);
    }
}

module.exports ={
    setAllCache
}