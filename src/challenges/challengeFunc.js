const fs = require('node:fs');
const path = require('path');
const { getObfuscatedCode } = require('../components/jsObfuscator');
const { setAsync } = require("../redis.js");
const { captureException } = require("../sentry.js");

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

const verifyChallenge = async (challengeResult, actual, isExternal) =>{
    const {expect, timeExeChlServer, timeExeChlClient} = challengeResult;
  
    if (!isExternal) {
        const rule1 = expect === actual;
        const rule2 = timeExeChlServer < 2000; // milliseconds
        const rule3 = timeExeChlClient < 2000; // milliseconds

        const isBot = !rule1 || !rule2 || !rule3;

        await setAsync(
            `Challenge:${challengeId}`,
            JSON.stringify({...challengeResult, result: isBot}), (err, reply) => {
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
    verifyChallenge
};
