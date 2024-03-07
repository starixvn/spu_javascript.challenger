
const fs = require('fs');
(async function () {
    const scriptContent = await fs.readFileSync('./src/script.js', 'utf-8');
    const replaceParamScript = scriptContent
    .replace(/_sessionKey/g,'1234')
    .replace(/_browserChallenges/g,'[test]')
    .replace(/_challenges/g, '[1,2,3,4]')
    .replace(/_token/g, 'token')
    .replace(/_rootUrl/g, 'root');
    console.log(replaceParamScript);

    
})();
