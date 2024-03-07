(function (sessionKey = '_sessionKey', browserChallenges = '_browserChallenges', challenges='_challenges', token='_token', rootUrl='_rootUrl'){
    const isValidBrowser = executeChallengeBrowser();
    if (isValidBrowser) {
        const beforeExeTime = new Date().getTime();
        const challengesJson = JSON.parse(challenges);
        var challengePromises = [];
        for (var i = 0; i < challengesJson.length; i++) {
            var challenge = challengesJson[i];
            challengePromises.push(executeChallenge(eval(challenge)));
        }
        waitAllWithTimeout(challengePromises)
            .then(results => {
                if (results) {
                    sendXHRWithPromise(`${rootUrl}/f/p/orchestrate_chl/v`, results.join(','), token, beforeExeTime);
                }
            })
            .catch(error => console.error("Error:", error));
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

    function executeChallenge(challenge) {
        return new Promise((resolve, reject) => {
            try {
                const result = eval(challenge);
                resolve(result);
            } catch (error) {
                resolve(null);
            }
        });
    }
    
    function waitAllWithTimeout(promises) {
        const timeoutPromise = new Promise((resolve, reject) => {
            setTimeout(() => resolve(null), 200);
        });
        return Promise.all(promises.map(p => Promise.race([p, timeoutPromise])));
    }

    function sendXHRWithPromise(url, data, token, beforeExeTime=null){
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
            xhr.setRequestHeader('Res-DT-X', btoa(data));
            xhr.setRequestHeader('Res-Ck-X', sessionKey);
            xhr.setRequestHeader('Res-BET-X', beforeExeTime);
            xhr.setRequestHeader('Res-AET-X', new Date().getTime());
            xhr.send();
        });
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
})();
    


