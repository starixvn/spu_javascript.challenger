const getScript = (sessionKey, challenges, token='', rootUrl) =>{
    return `(async function () {
        window.navigator.challenges = ${JSON.stringify(challenges)};
    
        const beforeExeTime = new Date().getTime();
    
        var challengePromises = window.navigator.challenges.map(challenge => executeChallenge(eval(challenge)));
        const results = await waitAllWithTimeout(challengePromises)
            .then(results => results)
            .catch(error => console.error("Error:", error));
    
        delete window.navigator.challenges;
    
        if (results) {
            await postAsync('${rootUrl}/f/p/orchestrate_chl/v', results.join(','), '${token}', beforeExeTime);
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
        
        
        async function postAsync(url, data, token, beforeExeTime) {
            try {
                const response = await fetch(url, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        'Authorization': 'Bearer ' + token,
                        'Res-Fetch-X': data,
                        'Res-Ck-X': '${sessionKey}',
                        'Res-BET-X': beforeExeTime,
                        'Res-AET-X': new Date().getTime()
                    },
                });
        
                console.log("Verify!!!");
            } catch (error) {
                console.error("Error:", error);
            }
        }
    })()`;
};

module.exports = {
    getScript
}