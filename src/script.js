(async function (sessionKey = '_sessionKey', browserChallenges = '_browserChallenges', challenges='_challenges', token='_token', rootUrl='_rootUrl'){
    const isValidBrowser = await executeChallengeBrowser();
    if (isValidBrowser) {
        const beforeExeTime = new Date().getTime();
        const challengesJson = JSON.parse(challenges);
        var challengePromises = challengesJson.map(challenge => executeChallenge(eval(challenge)));
        const results = await waitAllWithTimeout(challengePromises)
            .then(results => results)
            .catch(error => console.error("Error:", error));
    
        if (results) {
            await postAsync(`${rootUrl}/f/p/orchestrate_chl/v`, results.join(','), token, beforeExeTime);
        }
    }

    async function executeChallengeBrowser() {
        let isValid = true;
        try {
            const challenge = eval(browserChallenges);
            const invalidBrowser = JSON.parse(challenge).filter(x => eval(x.exec) !== x.expect);
            if (invalidBrowser.length > 0) {
                await postErrAsync(`${rootUrl}/f/p/orchestrate_chl/e`, invalidBrowser.map(x => x.exec).join(','), token);
                isValid = false;
            }
        } catch (err) {
            await postErrAsync(`${rootUrl}/f/p/orchestrate_chl/e`, err.message, token);
            console.error(err);
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
    
    async function postAsync(url, data, token, beforeExeTime=null) {
        await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                'Authorization': 'Bearer ' + token,
                'Res-DT-X': btoa(data),
                'Res-Ck-X': sessionKey,
                'Res-BET-X': beforeExeTime,
                'Res-AET-X': new Date().getTime()
            },
        });
    }

    async function postErrAsync(url, message, token) {
        try {
            await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': 'Bearer ' + token,
                    'Res-Msg-X': message,
                    'Res-Ck-X': sessionKey
                },
            });
        } catch (error) {
            console.error("Error:", error);
        }
    }
})();
    


