(function (sessionKey = '_sessionKey', browserChallenges = '_browserChallenges',token='_token', rootUrl='_rootUrl'){
    const isValidBrowser = executeChallengeBrowser();
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
        let isValid = true;
        try {
            const challenge = eval(browserChallenges);
            var invalidBrowser = [];
            for (var i = 0; i < JSON.parse(challenge).length; i++) {
                var x = JSON.parse(challenge)[i];
                var result = typeof x.exec === 'function' ? x.exec() : eval(x.exec);
                if (result !== x.expect) {
                    invalidBrowser.push(x);
                }
            }
            if (invalidBrowser.length > 0) {
                sendErrXHRWithPromise(`${rootUrl}/f/p/orchestrate_chl/e`, invalidBrowser.map(x => x.exec).join(','), token);
                isValid = false;
            }
        } catch (err) {
            sendErrXHRWithPromise(`${rootUrl}/f/p/orchestrate_chl/e`, err.message, token);
            isValid = false;
        }
        return isValid;
    }

    function sendErrXHRWithPromise(url, message, token){
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
            xhr.setRequestHeader('Res-Msg-X', message);
            xhr.setRequestHeader('Res-Ck-X', sessionKey);
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
            
            xhr.setRequestHeader('Res-TK-X', token);
            xhr.setRequestHeader('Res-SSK-X', sessionKey);

            xhr.send();
        });
    }
})();
    


