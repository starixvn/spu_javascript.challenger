const JSFuck = require('../components/jsfuck.js').JSFuck;
const { getObfuscatedCode } = require('../components/jsObfuscator.js');
const { TYPE_FUNCTION } = require('../constants/index.js');
const { getAllChallenges} = require('./challengeFunc');
const { getCache, setCache } = require('../node-cache.js');
const { randomString, randomNumber, randomArray, randomArrayOfObject, randomObject} = require('./random.js');
const config =  require('../config/index.js');

const getChallenges = () => {
    try{
        let challenges = getCache();

        if (challenges && challenges !== null) {
            console.log('cache challenge');
            return encodeChallenges(challenges);
        } else {
            console.log('no cache challenge');
            const allChallenges = getAllChallenges();
            setCache(allChallenges);
    
            return encodeChallenges(allChallenges);
        }
    }
    catch(err){
        console.log(err);
    }
};

const executeChallenges = challenges =>{
    try{
        const expected = challenges.map(chl => eval(eval(chl)));
        return expected?.join(',');
    }catch(err){
        console.error(err);
    }
};

function encodeChallenges(challenges){
    const randomChallenges = getRandomItemsFromArray(challenges);

    return randomChallenges.map(chl =>{

        const replaceFunc = replaceParameterValues(chl.toString());
        console.log('replaceFunc', replaceFunc);
        const obfuscatedCode = getObfuscatedCode(replaceFunc);
        
        return JSFuck.encode(obfuscatedCode);
    });
}

function getRandomItemsFromArray(arr) {
    const randomIndices = getRandomIndices(arr, config.RANDOM_NUM_CHALLENGES);
    const randomItems = randomIndices.map(index => arr[index]);
    return randomItems;
}

function getRandomIndices(array, count) {
    const indices = new Set(); 

    while (indices.size < count) {
        const randomIndex = Math.floor(randomNumber(0, array.length));
        indices.add(randomIndex);
    }

    return Array.from(indices);
}

function replaceParameterValues(funcString) {
    const typeMap = ['type_s', 'type_n', 'type_a', 'type_Aoj', 'type_oj'];

    typeMap.forEach(type =>{
        funcString = replaceOccurrencesWithIndex(funcString, type);
    })

    return `(${funcString})()`;
}


function replaceOccurrencesWithIndex(inputString, searchString) {
    let replacedString = '';
    let currentIndex = 1;
    let lastIndex = 0;

    while (true) {
        const index = inputString.indexOf(searchString, lastIndex);
        if (index === -1) break;

        replacedString += inputString.substring(lastIndex, index);

        replacedString += replaceTypeWithRandomVal(searchString);

        currentIndex++;
        lastIndex = index + searchString.length;
    }

    replacedString += inputString.substring(lastIndex);

    return replacedString;
}

function replaceTypeWithRandomVal(type = 'type_s'){
    let val = null;
    const {TYPE_STRING, TYPE_NUMBER, TYPE_ARRAY, TYPE_ARRAY_OF_OBJECT, TYPE_OBJECT } = TYPE_FUNCTION;
    switch (type) {
        case TYPE_STRING:
          val = `'${randomString(config.RANDOM_LENGTH_STRING)}'`
          break;
        case TYPE_NUMBER:
          val = randomNumber(config.MIN, config.MAX)
          break;
        case TYPE_ARRAY:
          val = randomArray()
          break;
        case TYPE_ARRAY_OF_OBJECT:
          val = `${randomArrayOfObject()}`
          break;
        case TYPE_OBJECT:
          val = `${randomObject()}`
          break;
        default:
          val = `'${randomString(RANDOM_LENGTH_STRING)}'`
    }

    return val;
}

module.exports = {
    getChallenges,
    executeChallenges
};
