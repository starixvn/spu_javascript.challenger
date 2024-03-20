const { Builder, By, Key } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

async function login() {
    // Set up Chrome options for headless mode
    let chromeOptions = new chrome.Options();
    //chromeOptions.addArguments("--headless"); // Set headless mode

    let driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(chromeOptions) // Apply Chrome options
        .build();

    try {
        await driver.get('https://alphafps.nexdev.net/');

        await driver.executeScript('Object.defineProperty(navigator, "webdriver", { get: () => false });');

        await driver.findElement(By.id('txtUserName')).sendKeys('Test10y');
        await driver.findElement(By.id('txtPassWord')).sendKeys('1234aa', Key.RETURN);
    } catch (err) {
        console.error(err);
    } finally {
        //await driver.quit();
    }
}

login();
