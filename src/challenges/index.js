const JSFuck = require('../components/jsfuck.js').JSFuck;
const { TYPE_FUNCTION } = require('../constants/index.js');
const { getCache } = require('../node-cache.js');
const { randomString, randomNumber, randomArray, randomArrayOfObject, randomObject} = require('./random.js');
const config =  require('../config/index.js');

const getChallenges = async () => {
    try{
        let challenges = getCache('js-challenge-key');
        return encodeChallenges(challenges);
    }
    catch(err){
        console.log(err);
    }
};

const getBrowserChallenges = () =>{
    return getCache('browser-challenge-key');
}

const executeChallenges = challenges =>{
    try{
        const expected = challenges.map(chl => eval(eval(chl.encode)));
        return expected?.join(',');
    }catch(err){
        console.error(err);
    }
};

function encodeChallenges(challenges){
    const randomChallenges = getRandomItemsFromArray(challenges);

    return randomChallenges.map(chl =>{
        const replaceFunc = replaceParameterValues(chl.item.obfuscated);

        const encode = JSFuck.encode(replaceFunc);

        return {
            id: chl.index,
            encode: encode
        }
    });
}

function getRandomItemsFromArray(arr) {
    const randomIndices = getRandomIndices(arr, config.RANDOM_NUM_CHALLENGES);
    const randomItems = randomIndices.map(index => {
        return {
            index: index + 1,
            item: arr[index]
        }
    });
    return randomItems;
}

function getRandomIndices(array, count) {
    let countRandom = count; 
    if(array.length < count){
        countRandom = array.length;
    }
    const indices = new Set(); 

    while (indices.size < countRandom) {
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

    return funcString;
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
          val = `[${randomArray(config.RANDOM_LENGTH_ARRAY, config.MIN, config.MAX)}]`
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
    getBrowserChallenges,
    executeChallenges,
    replaceParameterValues
};
