const { sendXHRWithPromise } = require('../httpRequest');

(function (isExternal = _isExternal, browserChallenges = '_browserChallenges',token='_token', rootUrl='_rootUrl'){
    var ssk = "";
    if(!isExternal){
        var sessionKey = document.getElementById("__fdi").value;
        if(sessionKey !== undefined && sessionKey.length > 0){
            ssk = sessionKey.split(':')[0];
        }
    }else{
        ssk = uuid();
    }

    var isValidBrowser = executeChallengeBrowser();

    try{
        if (isValidBrowser) {
           getScriptFunction(rootUrl+'/f/p/orchestrate_chl_func').then(scriptContent => {
                eval(scriptContent);
            });
        }
    }catch(e){
        console.error(e);
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
                sendErrorChallenge(rootUrl + '/f/p/orchestrate_chl/e', invalidBrowser.map(function(x) { return x.id;}).join(','), token);
                isValid = false;
            }
        } catch (err) {
            sendErrorChallenge(rootUrl + '/f/p/orchestrate_chl/e', err.message, token);
            isValid = false;
        }
        return isValid;
    }

    function sendErrorChallenge(url, message, token){
        var headers = {
            "Content-Type": "application/json",
            'Authorization': 'Bearer ' + token,
            'Res-IX-X': isExternal,
            'Res-Msg-X': message,
            'Res-SSK-X': ssk
        };

        sendXHRWithPromise(url, "POST", headers);
    }

    function getScriptFunction(url){
        var headers = {
            'Res-IX-X': isExternal,
            'Res-TK-X': token,
            'Res-SSK-X': ssk
        };

        return sendXHRWithPromise(url, "GET", headers);
    }

    function sendXHRWithPromise(url, method, headers = {}){
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

    function uuid() {
        if (typeof window !== 'undefined' && window !== null && window.crypto) {
            return ('10000000-1000-4000-8000-100000000000').replace(/[018]/g, c => (
                c ^ (window.crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16)
            );
        }else{
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        }
        
    };
})();
    


