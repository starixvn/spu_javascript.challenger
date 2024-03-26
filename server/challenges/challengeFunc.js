const fs = require('node:fs');
const path = require('path');
const { getObfuscatedCode } = require('../components/jsObfuscator');
const { setAsync } = require("../components/redis.js");
const { captureException } = require("../components/sentry.js");
const JSFuck = require('../components/jsfuck.js').JSFuck;

const getAllChallenges = async () =>{
    try{
        const data =  await fs.readFileSync(path.resolve(__dirname,'./challenges.json'), 'utf8');
        const parseData = JSON.parse(data);
        parseData.map(item =>{
            const obfuscatedCode = getObfuscatedCode(item.func)
            item.obfuscated = obfuscatedCode;
            item.encode = JSFuck.encode(obfuscatedCode)
        })

        return parseData;
    } catch (err) {
        console.error('Error reading file:', err);
        return [];
    }
}

const verifyChallenge = async (challengeId, challengeResult, actual, isExternal) =>{
    const {expect, timeExeChlServer, timeExeChlClient, challengeIds, parameters} = challengeResult;
  
    if (!isExternal) {
        const rule1 = expect === actual;
        const rule2 = timeExeChlServer < 2000; // milliseconds
        const rule3 = timeExeChlClient < 2000; // milliseconds

        const isBot = !(rule1 && rule2 && rule3);

        const challengeResultFinal = {
            ChallengeIds: challengeIds,
            Parameters: parameters,
            Expect: expect,
            Actual: actual,
            ExeServerTimeInSecond: timeExeChlServer,
            ExeClientTimeInSecond: timeExeChlClient,
            Result: Number(isBot)
        };

        setAsync(
            `Challenge:${challengeId}`,
            JSON.stringify(challengeResultFinal), (err, reply) => {
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
