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
    
    const expectConvert = isNumber(expect) ? parseFloat(expect).toFixed(2).toString() : expect;
    const actualConvert = isNumber(actual) ? parseFloat(actual).toFixed(2).toString() : actual;


    const isBot = expectConvert !== actualConvert;

    if (!isExternal) {

        const challengeResultFinal = {
            ChallengeIds: challengeIds,
            Parameters: parameters,
            Expect: expectConvert,
            Actual: actualConvert,
            ExeServerTimeInSecond: timeExeChlServer,
            ExeClientTimeInSecond: timeExeChlClient,
            Result: Number(isBot)
        };

        setAsync(`Challenge:${challengeId}`, JSON.stringify(challengeResultFinal));
    }

    return isBot;
}

const isNumber = value => !isNaN(value);


module.exports = {
    getAllChallenges,
    verifyChallenge
};
