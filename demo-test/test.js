
const { getAllChallenges } = require('../src/challenges/challengeFunc.js');
(async function () {
const challenges = await getAllChallenges();
console.log(typeof challenges);
const expectedFuncExe = challenges.map(chl =>{
    return eval(eval(chl));
})

console.log(expectedFuncExe);
})();



