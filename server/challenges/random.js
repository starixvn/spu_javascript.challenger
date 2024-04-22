const { CHALLENGE_SETTINGS } =  require('../config/index.js');

const randomString = (length = CHALLENGE_SETTINGS.RANDOM_LENGTH_STRING) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
  
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      result += characters.charAt(randomIndex);
    }
  
    return result;
  }

const randomNumber = (min = CHALLENGE_SETTINGS.MIN, max = CHALLENGE_SETTINGS.MAX) => Math.random() * (max - min) + min;

const randomArray = (length, min = CHALLENGE_SETTINGS.MIN, max = CHALLENGE_SETTINGS.MAX) => {
  const randomArray = [];
  for (let i = 0; i < length; i++) {
      randomArray.push(randomNumber(min, max));
  }
  return randomArray;
};

const randomObject = (size = CHALLENGE_SETTINGS.RANDOM_LENGTH_OBJECT) => {
  const obj = {};
  const characters = 'abcdefghijklmnopqrstuvwxyz';
  const stringLength = 5;
  
  for (let i = 0; i < size; i++) {
      let key = '';
      for (let j = 0; j < stringLength; j++) {
          key += characters.charAt(Math.floor(Math.random() * characters.length));
      }
      obj[key] = generateRandomString(stringLength);
  }
  return obj;
}

const generateRandomString = length => {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

const randomArrayOfObject = () => `[{name: 'foo', value: ' 123'}]`;

module.exports = {
    randomString,
    randomNumber,
    randomArray,
    randomArrayOfObject,
    randomObject
}



