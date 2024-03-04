
const BROWSER_CHALLENGES = [
    {
      exec: `(() => {return !!window.emit})()`,
      expect: false
    },
    {
      exec: `(() => {return !!window.__nightmare})()`,
      expect: false
    },
    {
      exec: `navigator.plugins.item(4294967296) === navigator.plugins[0]`,
      expect: true
    },
    {
      exec: `navigator.webdriver`,
      expect: false
    },
    {
      exec: `"cookieEnabled" in navigator && true === navigator.cookieEnabled`,
      expect: true
    },
    {
      exec: `!(!window.callPhantom && !window._phantom)`,
      expect: false
    },
    {
      exec: `!!(window.document.__selenium_unwrapped || window.document.__webdriver_evaluate)`,
      expect: false
    },
    {
      exec: `!(!window.domAutomation && !window.domAutomationController)`,
      expect: false
    }];
    
(async function () {
    const invalidBrowser = BROWSER_CHALLENGES.filter(x => eval(x.exec) !== x.expect);

    if(invalidBrowser?.length > 0){
        console.error('invalidBrowser');
    }
})();



