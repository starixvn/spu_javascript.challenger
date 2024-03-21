const JSFuck = require('../components/jsfuck.js').JSFuck;
const { TYPE_FUNCTION } = require('../constants/index.js');
const { getCache } = require('../components/node-cache.js');
const { randomString, randomNumber, randomArray, randomArrayOfObject, randomObject} = require('./random.js');
const { CHALLENGE_SETTINGS } =  require('../config/index.js');
const { BROWSER_CHALLENGE_KEY, JS_CHALLENGE_KEY, SETTING_CHALLENGE_KEY } = require('../constants/index.js');

const getChallenges = () => {
    let challenges = getCacheChallenges();
    return encodeChallenges(challenges);
};

const getCacheChallenges = () => getCache(JS_CHALLENGE_KEY);

const getBrowserChallenges = () =>{
    return getCache(BROWSER_CHALLENGE_KEY);
}

const executeChallenges = challenges =>{
    const expected = challenges.map(chl => eval(eval(chl.encode)));
    return expected?.join(',');
};

function encodeChallenges(challenges){
    const settingChallenges = getCache(SETTING_CHALLENGE_KEY);
    
    const challengesRandom = settingChallenges.NUM_CHALLENGE_IDS?.length > 0 ? 
            getChallengesFromSetting(settingChallenges.NUM_CHALLENGE_IDS.split(','), challenges) :
            getRandomItemsFromArray(challenges, settingChallenges.RANDOM_NUM_CHALLENGES);

    return challengesRandom.map(chl =>{
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

function getChallengesFromSetting(settingChlIds, arr) {
    const challengesFilter = arr.filter(x => settingChlIds.includes(x.id.toString()));
    const challenges = challengesFilter.map(item => {
        return {
            index: item.id,
            item: item
        }
    });

    return challenges;
}

function getRandomItemsFromArray(arr, numChl) {
    const randomIndices = getRandomIndices(arr, numChl);
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
          val = `'${randomString(CHALLENGE_SETTINGS.RANDOM_LENGTH_STRING)}'`
          break;
        case TYPE_NUMBER:
          val = randomNumber(CHALLENGE_SETTINGS.MIN, CHALLENGE_SETTINGS.MAX)
          break;
        case TYPE_ARRAY:
          val = `[${randomArray(CHALLENGE_SETTINGS.RANDOM_LENGTH_ARRAY, CHALLENGE_SETTINGS.MIN, CHALLENGE_SETTINGS.MAX)}]`
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
    getCacheChallenges,
    getBrowserChallenges,
    executeChallenges,
    replaceParameterValues
};
