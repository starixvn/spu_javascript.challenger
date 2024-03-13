(function (sessionKey = '_sessionKey', challenges=_challenges, token='_token', rootUrl='_rootUrl', isExternal = _isExternal){
    var beforeExeTime = new Date().getTime();
    var challengePromises = [];
    for (var i = 0; i < challenges.length; i++) {
        var challenge = challenges[i];
        challengePromises.push(executeChallenge(challenge));
    }
    waitAllWithTimeout(challengePromises)
        .then(results => {
            if (results) {
                if(isExternal){
                    sendRequestVerify(rootUrl + '/f/p/e/orchestrate_chl/v', results.join(','), true);
                }else{
                    sendRequestVerify(rootUrl + '/f/p/i/orchestrate_chl/v', results.join(','), false);
                }
            }
        })
        .catch(error => console.error("Error:", error));
    

    function executeChallenge(challenge) {
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

    function sendRequestVerify(url, data, isExternal){
        var headers = {
            "Content-Type": "application/json",
            'Authorization': 'Bearer ' + token,
            'Res-DT-X': btoa(data),
            'Res-SSK-X': sessionKey
        };

        if(!isExternal){
            headers['Res-BET-X'] = beforeExeTime;
            headers['Res-AET-X'] = new Date().getTime();
        }

        return sendXHRWithPromise(url, "POST", headers);
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
})();