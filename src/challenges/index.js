const JSFuck = require('../components/jsfuck.js').JSFuck;
const { TYPE_FUNCTION } = require('../constants/index.js');
const { getCache } = require('../node-cache.js');
const { randomString, randomNumber, randomArray, randomArrayOfObject, randomObject} = require('./random.js');
const config =  require('../config/index.js');

const getChallenges = async () => {
    let challenges = getCache('js-challenge-key');
    return encodeChallenges(challenges);
    
};

const getBrowserChallenges = () =>{
    return getCache('browser-challenge-key');
}

const executeChallenges = challenges =>{
    const expected = challenges.map(chl => eval(eval(chl.encode)));
    return expected?.join(',');
};

function encodeChallenges(challenges){
    const randomChallenges = getRandomItemsFromArray(challenges);

    return randomChallenges.map(chl =>{
        const { funcString, randomVal } = replaceParameterValues(chl.item.obfuscated);

        const randomValJoin = randomVal.map(random => random).join(':');
        const encode = JSFuck.encode(funcString);

        return {
            id: chl.index,
            encode: encode,
            randomVal: randomValJoin
        }
    });
}

function getRandomItemsFromArray(arr) {
    const randomIndices = getRandomIndices(arr, config.RANDOM_NUM_CHALLENGES);
    const randomItems = randomIndices.map(index => {
        return {
            index: arr[index].id,
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

    let randomVal = [];

    typeMap.forEach(type =>{
        const {replacedString, randomArr} = replaceOccurrencesWithIndex(funcString, type);
        randomVal.push(...randomArr)
        funcString = replacedString;
    });

    return { funcString, randomVal };
}


function replaceOccurrencesWithIndex(inputString, searchString) {
    let replacedString = '';
    let currentIndex = 1;
    let lastIndex = 0;

    const randomArr = [];

    while (true) {
        const index = inputString.indexOf(searchString, lastIndex);
        if (index === -1) break;

        replacedString += inputString.substring(lastIndex, index);

        const randomVal = replaceTypeWithRandomVal(searchString);

        randomArr.push(randomVal);

        replacedString += randomVal;

        currentIndex++;
        lastIndex = index + searchString.length;
    }

    replacedString += inputString.substring(lastIndex);

    return { replacedString, randomArr };
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
