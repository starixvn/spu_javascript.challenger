const JavaScriptObfuscator = require('javascript-obfuscator');

const getObfuscatedCode = value =>{
    return JavaScriptObfuscator.obfuscate(
        `${value}`,
        {
            compact: false,
            controlFlowFlattening: true,
            controlFlowFlatteningThreshold: 1,
            numbersToExpressions: true,
            simplify: true,
            stringArrayShuffle: true,
            splitStrings: true,
            stringArrayThreshold: 1
    })?.getObfuscatedCode()
}

module.exports = {
    getObfuscatedCode
};
