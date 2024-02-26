const { getChallenges } = require('../challenges/index.js');
const { getAsync, setAsync } = require('../redis.js');
require('dotenv').config();

const challenges = getChallenges();

const expectedFuncExe = challenges.map(chl =>{
    return eval(eval(chl));
})

console.log(expectedFuncExe);



