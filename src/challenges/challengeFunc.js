const fs = require('node:fs');
const path = require('path');

const getAllChallenges = async () =>{
    try{
        const data =  await fs.readFileSync(path.resolve(__dirname,'./challenges.json'), 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error('Error reading file:', err);
        return [];
    }
}

module.exports = {
    getAllChallenges
};
