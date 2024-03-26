(function (isExternal = _isExternal, browserChallenges = '_browserChallenges', rootUrl = '_rootUrl') {
  var ssk = "";
  var tokenElement = document.getElementById("__JvsVerificationToken");
  var token = tokenElement !== null ? tokenElement.value : null;

  try{
    if (!isExternal) {
      var sessionKey = document.getElementById("__fdi").value;
      if (sessionKey !== undefined && sessionKey.length > 0) {
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
        var challenge = eval(browserChallenges);
        var invalidBrowser = [];
        for (var i = 0; i < JSON.parse(challenge).length; i++) {
          var chlJson = JSON.parse(challenge)[i];
          var result = eval(chlJson.exec);
          if (result !== chlJson.expect) {
            invalidBrowser.push(chlJson);
          }
        }
        if (invalidBrowser.length > 0) {
          sendErrorChallenge(rootUrl + '/f/p/orchestrate_chl/e', invalidBrowser.map(function (x) { return x.id; }).join(','), token, isExternal, ssk);
          isValid = false;
        }
      } catch (err) {
        sendErrorChallenge(rootUrl + '/f/p/orchestrate_chl/e', err.message, token, isExternal, ssk);
        isValid = false;
      }
      return isValid;
    }
  
    function challengeFuncVerify(challenges) {
      var beforeExeTime = new Date().getTime();
      var challengePromises = [];
  
      var parseJsonChallenge = JSON.parse(challenges);
  
      for (var i = 0; i < parseJsonChallenge.length; i++) {
        var challenge = parseJsonChallenge[i];
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
            'Res-IX-X': isExternal,
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
          var result = eval(eval(challenge.encode));
          resolve(result);
        } catch (error) {
          resolve(null);
          console.error("Error encode:", challenge.encode);
          console.error("Error id:", challenge.id);
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
        if (xhr.readyState === 4) {
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
