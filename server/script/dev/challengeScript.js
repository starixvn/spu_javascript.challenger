(function (isExternal = _isExternal, browserChallenges ="function b(c,d){var e=a();return b=function(f,g){f=f-0x1d3;var h=e[f];return h;},b(c,d);}function a(){var j=['!(!window.callPhantom\x20&&\x20!window._phantom)','359701aYWVTy','155380uLZXig','918738KhvEnc','218289sBMkCG','!(!window.domAutomation\x20&&\x20!window.domAutomationController)','navigator.plugins1.length\x20>\x200\x20?\x20navigator.plugins.item(4294967296)\x20===\x20navigator.plugins[0]\x20:\x20navigator.plugins.length\x20==\x200','1914283QAwQWH','18792gGOZNo','1204600DAVUpt','4KjFvda','!navigator.webdriver','!!(window.document.__selenium_unwrapped\x20||\x20window.document.__webdriver_evaluate)','171EFqrdE','!!window.emit'];a=function(){return j;};return a();}var i=b;(function(c,d){var h=b,e=c();while(!![]){try{var f=-parseInt(h(0x1d7))/0x1+parseInt(h(0x1e0))/0x2*(parseInt(h(0x1da))/0x3)+parseInt(h(0x1df))/0x4+-parseInt(h(0x1d8))/0x5+-parseInt(h(0x1d9))/0x6+parseInt(h(0x1dd))/0x7+-parseInt(h(0x1de))/0x8*(-parseInt(h(0x1d4))/0x9);if(f===d)break;else e['push'](e['shift']());}catch(g){e['push'](e['shift']());}}}(a,0x35ecc),[{'id':0x1,'exec':i(0x1d5),'expect':![]},{'id':0x2,'exec':'!!window.__nightmare','expect':![]},{'id':0x3,'exec':i(0x1dc),'expect':!![]},{'id':0x4,'exec':i(0x1e1),'expect':!![]},{'id':0x5,'exec':'!navigator.cookieEnabled','expect':![]},{'id':0x6,'exec':i(0x1d6),'expect':![]},{'id':0x7,'exec':i(0x1d3),'expect':![]},{'id':0x8,'exec':i(0x1db),'expect':![]},{'id':0x9,'exec':'!navigator.appVersion','expect':![]}]);", rootUrl = '_rootUrl') {
  var ssk = "";
  var tokenElement = document.getElementById("__JvsVerificationToken");
  var token = tokenElement != null ? tokenElement.value : null;

  try{
    if (!isExternal) {
      var sessionKey = document.getElementById("__fdi").value;
      if (sessionKey != undefined && sessionKey.length > 0) {
        ssk = sessionKey.split(':')[0];
      }
    } else {
      ssk = uuid();
    }
  
    var isValidBrowser = executeChallengeBrowser();
  
    if (isValidBrowser) {
      getChallengeFuncs(rootUrl + '/f/p/orchestrate_chl_func').then(challenges => {
        challengeFuncVerify(challenges);
      });
    }
  
    function executeChallengeBrowser() {
      var isValid = true;
      try {
        var invalidBrowser = [];
        var challengesParse = eval(browserChallenges);

        for (var i = 0; i < challengesParse.length; i++) {
          var chlJson = challengesParse[i];
          var result = eval(chlJson.exec);
          if (result != chlJson.expect) {
            invalidBrowser.push(chlJson);
          }
        }
        
        if (invalidBrowser.length > 0) {
          sendErrorChallenge(rootUrl + '/f/p/orchestrate_chl/e', invalidBrowser.map(function (x) { return x.id; }).join(','), token, isExternal, ssk);
          isValid = false;
        }
      } catch (err) {
        console.log(err.stack);
      }

      return isValid;
    }
  
    function challengeFuncVerify(challenges) {
      var beforeExeTime = new Date().getTime();
      var challengePromises = [];
  
      var splitChallenges = challenges.split('__');
  
      for (var i = 0; i < splitChallenges.length; i++) {
        var challenge = splitChallenges[i];
        challengePromises.push(executeChallengeFunc(challenge));
      }
  
      waitAllWithTimeout(challengePromises)
        .then(results => {
          if (results) {
              var endpoint = "";
              if (isExternal) {
                endpoint = '/f/p/e/orchestrate_chl/v';
              } else {
                endpoint = '/f/p/i/orchestrate_chl/v';
              }
  
            sendRequestVerify(rootUrl + endpoint, results.join(','), token, ssk, isExternal, beforeExeTime);
          }
        });
    }
  
    function sendErrorChallenge(url, message, token, isExternal, ssk) {
      var headers = {
        "Content-Type": "application/json",
        'Authorization': 'Bearer ' + token,
        'Res-IX-X': isExternal,
        'Res-Msg-X': message,
        'Res-SSK-X': ssk
      };
    
      return sendXHRWithPromise(url, "POST", headers);
    }
    
    function getChallengeFuncs(url) {
        var headers = {
            'Res-SSK-X': ssk
          };
      return sendXHRWithPromise(url, "GET", headers);
    }
    
    function sendRequestVerify(url, data, token, ssk, isExternal, beforeExeTime) {
      var headers = {
        "Content-Type": "application/json",
        'Authorization': 'Bearer ' + token,
        'Res-DT-X': btoa(data),
        'Res-SSK-X': ssk
      };
    
      if (!isExternal) {
        headers['Res-BET-X'] = beforeExeTime;
        headers['Res-AET-X'] = new Date().getTime();
      }
    
      return sendXHRWithPromise(url, "POST", headers);
    }
    
    function executeChallengeFunc(challenge) {
      return new Promise((resolve, reject) => {
        try {
          var result = eval(challenge);
          resolve(result);
        } catch (error) {
          resolve(null);
          console.error("Error:", error);
        }
      });
    }
    
    function waitAllWithTimeout(promises) {
      var timeoutPromise = new Promise((resolve, reject) => {
        setTimeout(() => resolve(null), 200);
      });
      return Promise.all(promises.map(p => Promise.race([p, timeoutPromise])));
    }

    function uuid() {
      return ('10000000100040008000100000000000').replace(/[018]/g, c => (
          c ^ (window.crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16)
      );
    };

  }
  catch(err){
    var headers = {
      "Content-Type": "application/json",
      'Authorization': 'Bearer ' + token,
      'Res-IX-X': isExternal,
      'Res-Msg-X': err.message,
      'Res-SSK-X': ssk
    };

    sendXHRWithPromise(rootUrl + '/f/p/c/orchestrate_chl/e', "POST", headers)
  }

  function sendXHRWithPromise(url, method, headers = {}) {
    return new Promise((resolve, reject) => {
      var xhr = new XMLHttpRequest();
      xhr.open(method, url, true);
      xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(xhr.responseText);
          } else {
            reject(new Error(xhr.statusText));
          }
        }
      };

      for (var header in headers) {
        xhr.setRequestHeader(header, headers[header]);
      }

      xhr.send();
    });
  }

})();
