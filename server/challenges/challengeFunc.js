const fs = require('node:fs');
const path = require('path');
const { getObfuscatedCode } = require('../components/jsObfuscator');
const { setAsync } = require("../components/redis.js");
const { captureException } = require("../components/sentry.js");

const getAllChallenges = async () =>{
    try{
        const data =  await fs.readFileSync(path.resolve(__dirname,'./challenges.json'), 'utf8');
        const parseData = JSON.parse(data);
        parseData.map(item =>{
            const funcStr = `(${item.func})()`;
            item.obfuscated = getObfuscatedCode(funcStr);
        })

        return parseData;
    } catch (err) {
        console.error('Error reading file:', err);
        return [];
    }
}

const getChallengeSetting = async () => {
    const data =  await fs.readFileSync(path.resolve(__dirname,'./challengeSetting.json'), 'utf8');
    const parseData = JSON.parse(data);

    return parseData;
}

const verifyChallenge = async (challengeId, challengeResult, actual, isExternal) =>{
    const {expect, timeExeChlServer, timeExeChlClient} = challengeResult;
  
    if (!isExternal) {
        const rule1 = expect === actual;
        const rule2 = timeExeChlServer < 2000; // milliseconds
        const rule3 = timeExeChlClient < 2000; // milliseconds

        const isBot = !rule1 || !rule2 || !rule3;

        setAsync(
            `Challenge:${challengeId}`,
            JSON.stringify({...challengeResult, result: !isBot}), (err, reply) => {
              if (err) {
                captureException(err);
              }
            }
        );

        return isBot;
    }else{
        return expect !== actual
    }
}

module.exports = {
    getAllChallenges,
    getChallengeSetting,
    verifyChallenge
};
