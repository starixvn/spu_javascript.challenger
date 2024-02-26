const { getChallenges } = require('../src/challenges/index.js');
const { getAsync, setAsync } = require('../src/redis.js');
require('dotenv').config();

const challenges = getChallenges();

const expectedFuncExe = challenges.map(chl =>{
    return eval(eval(chl));
})

console.log(expectedFuncExe);



