(function (sessionKey = '_sessionKey', challenges=_challenges, token='_token', rootUrl='_rootUrl'){
    var beforeExeTime = new Date().getTime();
    var challengePromises = [];
    for (var i = 0; i < challenges.length; i++) {
        var challenge = challenges[i];
        challengePromises.push(executeChallenge(eval(challenge)));
    }
    waitAllWithTimeout(challengePromises)
        .then(results => {
            if (results) {
                sendXHRWithPromise(`${rootUrl}/f/p/orchestrate_chl/v`, results.join(','), token, beforeExeTime);
            }
        })
        .catch(error => console.error("Error:", error));
    

    function executeChallenge(challenge) {
        return new Promise((resolve, reject) => {
            try {
                var result = eval(challenge);
                resolve(result);
            } catch (error) {
                resolve(null);
                console.error("Error ch:", challenge);
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
})();
    


