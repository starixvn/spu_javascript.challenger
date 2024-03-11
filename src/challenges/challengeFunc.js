const fs = require('node:fs');
const path = require('path');
const { getObfuscatedCode } = require('../components/jsObfuscator');

const getAllChallenges = async () =>{
    try{
        const data =  await fs.readFileSync(path.resolve(__dirname,'./challenges.json'), 'utf8');
        const parseData = JSON.parse(data);
        parseData.map(item =>{
            const funcStr = `(${item.func})()`;
            item.obfuscated = getObfuscatedCode(funcStr);
        })

        return parseData;
    } catch (err) {
        console.error('Error reading file:', err);
        return [];
    }
}

module.exports = {
    getAllChallenges
};
