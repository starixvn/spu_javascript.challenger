module.exports = {
  BROWSER_CHALLENGES: [
    {
      id: 1,
      exec: "!!window.emit",
      expect: false,
    },
    {
      id: 2,
      exec: "!!window.__nightmare",
      expect: false,
    },
    {
      id: 3,
      exec: "navigator.plugins.item(4294967296) === navigator.plugins[0]",
      expect: true,
    },
    {
      id: 4,
      exec: "navigator.webdriver",
      expect: false,
    },
    {
      id: 5,
      exec: "true === navigator.cookieEnabled",
      expect: true,
    },
    {
      id: 6,
      exec: "!(!window.callPhantom && !window._phantom)",
      expect: false,
    },
    {
      id: 7,
      exec: "!!(window.document.__selenium_unwrapped || window.document.__webdriver_evaluate)",
      expect: false,
    },
    {
      id: 8,
      exec: "!(!window.domAutomation && !window.domAutomationController)",
      expect: false,
    },
    {
      id: 9,
      exec: "!navigator.appVersion",
      expect: false,
    },
    {
      id: 10,
      exec: "document.documentElement && typeof document.documentElement.getAttributeNames == 'function'",
      expect: true,
    },
    {
      id: 11,
      exec: "eval.toString().length > 0",
      expect: true,
    },
    {
      id: 12,
      exec: "Function.prototype.bind != undefined",
      expect: true,
    }
  ],
};
