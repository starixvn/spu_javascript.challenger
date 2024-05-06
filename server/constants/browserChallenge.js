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
      exec: "navigator.plugins.length > 0 ? navigator.plugins.item(4294967296) === navigator.plugins[0] : navigator.plugins.length == 0",
      expect: true,
    },
    {
      id: 4,
      exec: "!navigator.webdriver",
      expect: true,
    },
    {
      id: 5,
      exec: "!navigator.cookieEnabled",
      expect: false,
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
  ],
};
