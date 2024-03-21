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

const randomArrayOfObject = () => `[{name: 'foo', value: ' 123'}]`;

const randomObject = () => `{name: 'foo', value: ' 123'}`;

module.exports = {
    randomString,
    randomNumber,
    randomArray,
    randomArrayOfObject,
    randomObject
}



