const { BROWSER_CHALLENGES } = require('./constants/browserChallenge');

const getScript = (sessionKey, challenges, token='', rootUrl) =>{
    return `(async function () {
        const isValidBrowser = await executeChallengeBrowser();
        if(isValidBrowser){
            const challenges = ${JSON.stringify(challenges)};

            const beforeExeTime = new Date().getTime();
        
            var challengePromises = challenges.map(challenge => executeChallenge(eval(challenge)));
            const results = await waitAllWithTimeout(challengePromises)
                .then(results => results)
                .catch(error => console.error("Error:", error));
        
            if (results) {
                await postAsync('${rootUrl}/f/p/orchestrate_chl/v', results.join(','), '${token}', beforeExeTime);
            }
        }
        

        async function executeChallengeBrowser() {
            let isValid = true;
            try{
                const invalidBrowser = ${JSON.stringify(BROWSER_CHALLENGES)}.filter(x => eval(x.exec) !== x.expect);

                if(invalidBrowser?.length > 0){
                    await postErrAsync('${rootUrl}/f/p/orchestrate_chl/e', invalidBrowser.map(x => x.exec).join(','), '${token}');
                    isValid = false;
                }
            }catch(err){
                await postErrAsync('${rootUrl}/f/p/orchestrate_chl/e', err.message, '${token}');
                isValid = false;
            };

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
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': 'Bearer ' + token,
                    'Res-DT-X': btoa(data),
                    'Res-Ck-X': '${sessionKey}',
                    'Res-BET-X': beforeExeTime,
                    'Res-AET-X': new Date().getTime()
                },
            });
        }

        async function postErrAsync(url, message, token) {
            try {
                const response = await fetch(url, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        'Authorization': 'Bearer ' + token,
                        'Res-Msg-X': message,
                        'Res-Ck-X': '${sessionKey}'
                    },
                });
            } catch (error) {
                console.error("Error:", error);
            }
        }
    })()`;
};

module.exports = {
    getScript
}