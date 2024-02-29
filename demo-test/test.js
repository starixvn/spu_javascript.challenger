
const { getChallenges } = require('../src/challenges/index.js');
(async function () {
const challenges = await getChallenges();

console.log(challenges);
})();



