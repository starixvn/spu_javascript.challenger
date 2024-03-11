const { getObfuscatedCode } = require('../src/components/jsObfuscator.js');
const {replaceParameterValues} = require('../src/challenges/index.js');
const JSFuck = require('../src/components/jsfuck.js').JSFuck;

(async function () {
    const startTime = Date.now();
    const test1 = JSFuck.encode("(function addUp(c=2.38752334007041261){var d=0x0;for(var e=0x1;e<=c;e++){d+=e;}return d;}());");
    const test2 = eval(eval(test1));
    console.log(test2);
    const endTime = Date.now();
    const executionTime = endTime - startTime;
    console.log(`Execution time: ${executionTime} milliseconds`);
})();

