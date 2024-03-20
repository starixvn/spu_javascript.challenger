const {Builder, By, Key, until} = require('selenium-webdriver');

// Initialize the WebDriver
async function login() {
    let driver = await new Builder().forBrowser('chrome').build();

    try {
        await driver.get('https://alphafps.nexdev.net/'); 

        await driver.findElement(By.id('txtUserName')).sendKeys('alele1'); 
        await driver.findElement(By.id('txtPassWord')).sendKeys('1234aa', Key.RETURN); 
    }catch(err){
        console.error(err);
    } finally {
        //await driver.quit();
    }
}

login();
