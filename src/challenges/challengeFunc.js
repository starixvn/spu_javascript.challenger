const getAllChallenges = () =>{
    const challenges = [
        add,
        minus,
        multiple,
        divide,
        convert,
        triArea,
        calcAge,
        remainder,
        getFirstValue,
        lessThanOrEqualToZero,
        giveMeSomething,
        swap,
        bitwiseAND,
        bitwiseOR,
        bitwiseXOR,
        addUp,
        matchHouses,
        shiftToLeft,
        minMax,
        binary
    ]

    return challenges;
}

function add(num1 = type_n, num2 = type_n) {
    return num1 + num2;
}

function minus(num1 = type_n, num2 = type_n) {
    return num1 - num2;
}

function multiple(num1 = type_n, num2 = type_n) {
    return num1 * num2;
}

function divide(num1 = type_n, num2 = type_n) {
    return num1 / num2;
}

function convert(minutes = type_n) {
    return minutes * 60;
}

function triArea(base = type_n, height = type_n) {
    return (base * height) / 2;
}

function calcAge(ageInYears = type_n) {
    return ageInYears * 365;
}

function remainder(x = type_n, y = type_n) {
    return x % y;
}

function getFirstValue(arr = type_a) {
    if (arr?.length > 0) {
        return arr[0];
    } else {
        return undefined;
    }
}

function giveMeSomething(a = type_s) {
    return "something " + a;
}

function lessThanOrEqualToZero(num = type_n) {
    return num <= 0;
}

function swap(a= type_n, b= type_n) {
    var temp = a;
    a = b;
    b = temp;
    return [a, b];
}

function bitwiseAND(a= type_n, b= type_n) {
    return a & b;
}

function bitwiseOR(a= type_n, b= type_n) {
    return a | b;
}

function bitwiseXOR(a= type_n, b= type_n) {
    return a ^ b;
}

function addUp(num= type_n) {
    let sum = 0;
    for (let i = 1; i <= num; i++) {
        sum += i;
    }
    return sum;
}

function matchHouses(step= type_n) {
    if (step === 0) {
        return 0;
    } else {
        return 5 * step + 1;
    }
}

function shiftToLeft(x= type_n, y= type_n) {
    return x * Math.pow(2, y);
}

function minMax(arr = type_a) {
    arr.sort((a, b) => a - b);
    return [arr[0], arr[arr.length - 1]];
}

function binary(decimal= type_n) {
    if (decimal === 0) {
        return "0";
    }

    let binaryString = "";
    while (decimal > 0) {
        binaryString = (decimal % 2) + binaryString;
        decimal = Math.floor(decimal / 2);
    }
    return binaryString;
}


module.exports = {
    getAllChallenges
};
