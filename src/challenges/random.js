const config =  require('../../config/index.js');

const randomString = (length = config.RANDOM_LENGTH_STRING) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
  
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      result += characters.charAt(randomIndex);
    }
  
    return result;
  }

const randomNumber = (min = config.MIN, max = config.MAX) => Math.random() * (max - min) + min;

const randomArray = () => `[1, 2, 3, 4]`;

const randomArrayOfObject = () => `[{name: 'foo', value: ' 123'}]`;

const randomObject = () => `{name: 'foo', value: ' 123'}`;

module.exports = {
    randomString,
    randomNumber,
    randomArray,
    randomArrayOfObject,
    randomObject
}



