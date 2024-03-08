const fs = require('node:fs');
const path = require('path');
const { setCache } = require('./node-cache.js');
const { getAllChallenges } = require('./challenges/challengeFunc.js');
const { BROWSER_CHALLENGES } = require('./constants/browserChallenge.js');
const JSFuck = require('./components/jsfuck.js').JSFuck;

const setCacheScriptFile = async () =>{
    const SCRIPT_KEY = 'func_challenge-key';
    const scriptContent = await fs.readFileSync(path.resolve(__dirname,'./script/functionChallengeScript.js'), 'utf-8');
    setCache(SCRIPT_KEY, scriptContent);
}

const setCacheChallenges = async () =>{
    const CHALLENGE_KEY = 'js-challenge-key';
    const allChallenges = await getAllChallenges();
    setCache(CHALLENGE_KEY, allChallenges);
}


const setCacheBrowsers = async () =>{
    const BROWSER_KEY = 'browser-challenge-key';
    const scriptContent = await fs.readFileSync(path.resolve(__dirname,'./script/browserChallengeScript.js'), 'utf-8');
    const encode = JSFuck.encode(JSON.stringify(BROWSER_CHALLENGES));
    const javascriptCode = scriptContent
    .replace(/_browserChallenges/g, encode);

    setCache(BROWSER_KEY, javascriptCode)
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