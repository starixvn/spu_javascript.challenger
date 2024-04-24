const fs = require('node:fs');
const path = require('path');
const { getObfuscatedCode } = require('../components/jsObfuscator');
const { setAsync } = require("../components/redis.js");

const getAllChallenges = async () =>{
    try{
        const data =  await fs.readFileSync(path.resolve(__dirname,'./challenges.json'), 'utf8');
        const parseData = JSON.parse(data);
        parseData.map(item =>{
            item.obfuscated = getObfuscatedCode(item.func);
        })

        return parseData;
    } catch (err) {
        console.error('Error reading file:', err);
        return [];
    }
}

const verifyChallenge = async (challengeId, challengeResult, actual, isExternal) =>{
    const {expect, timeExeChlServer, timeExeChlClient, challengeIds, parameters} = challengeResult;
    
    const expectRoundNumber = isNumber(expect) ? expect.toFixed(2) : expect;
    const actualRoundNumber = isNumber(actual) ? actual.toFixed(2) : actual;

    const isBot = expectRoundNumber !== actualRoundNumber;

    if (!isExternal) {

        const challengeResultFinal = {
            ChallengeIds: challengeIds,
            Parameters: parameters,
            Expect: expectRoundNumber,
            Actual: actualRoundNumber,
            ExeServerTimeInSecond: timeExeChlServer,
            ExeClientTimeInSecond: timeExeChlClient,
            Result: Number(isBot)
        };

        setAsync(`Challenge:${challengeId}`, JSON.stringify(challengeResultFinal));
    }

    return isBot;
}

const isNumber = value => typeof value === 'number';


module.exports = {
    getAllChallenges,
    verifyChallenge
};
