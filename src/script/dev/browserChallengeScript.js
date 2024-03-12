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
           getScriptWithPromise(rootUrl+'/f/p/orchestrate_chl_func').then(scriptContent => {
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
                var x = JSON.parse(challenge)[i];
                var result = typeof x.exec === 'function' ? x.exec() : eval(x.exec);
                if (result !== x.expect) {
                    invalidBrowser.push(x);
                }
            }
            if (invalidBrowser.length > 0) {
                sendErrXHRWithPromise(`${rootUrl}/f/p/orchestrate_chl/e`, invalidBrowser.map(x => x.id).join(','), token);
                isValid = false;
            }
        } catch (err) {
            sendErrXHRWithPromise(`${rootUrl}/f/p/orchestrate_chl/e`, err.message, token);
            isValid = false;
        }
        return isValid;
    }

    function sendErrXHRWithPromise(url, message, token){
        console.log(ssk);
        return new Promise((resolve, reject) => {
            var xhr = new XMLHttpRequest();
            xhr.open("POST", url, true);
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        resolve(xhr.responseText);
                    } else {
                        reject(new Error(xhr.statusText));
                    }
                }
            };
    
            xhr.setRequestHeader("Content-Type", "application/json");
            xhr.setRequestHeader('Authorization', 'Bearer ' + token);
            
            xhr.setRequestHeader('Res-IX-X', isExternal);
            xhr.setRequestHeader('Res-Msg-X', message);
            xhr.setRequestHeader('Res-SSK-X', ssk);
            xhr.send();
        });
    }

    function getScriptWithPromise(url){
        return new Promise((resolve, reject) => {
            var xhr = new XMLHttpRequest();
            xhr.open("GET", url, true);
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        resolve(xhr.responseText);
                    } else {
                        reject(new Error(xhr.statusText));
                    }
                }
            };
            
            xhr.setRequestHeader('Res-IX-X', isExternal);
            xhr.setRequestHeader('Res-TK-X', token);
            xhr.setRequestHeader('Res-SSK-X', ssk);

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
    


