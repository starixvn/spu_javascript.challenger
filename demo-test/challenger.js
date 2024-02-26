(async function () {
    const sessionId = 'b7ca59e25d424c7fbc603035edb2a0dc';
    const challenges = await getAsync(`http://localhost:3001/api/getChallenges?sessionId=${sessionId}`);
    const dataJson = JSON.parse(challenges);

    window.navigator.challenges = dataJson.challenges;

    var challengePromises = window.navigator.challenges.map(challenge => executeChallenge(eval(challenge)));

    const results = await waitAllWithTimeout(challengePromises)
        .then(results => results)
        .catch(error => console.error("Error:", error));

    delete window.navigator.challenges;

    const data = {
        id: dataJson.id,
        result: results.join(',')
    }

    if(data){
      const token = await getAsync(`http://localhost:3001/api/getToken`);

      await postAsync('http://localhost:3001/api/verify', data, token);
    }
})();

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


async function postAsync(url, data, token) {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    console.log("Success:", result.message);
  } catch (error) {
    console.error("Error:", error);
  }
}

async function getAsync(url) {
  try {
    const response = await fetch(url, {
        method: 'GET'
    });

    const result = await response.json();

    return result;
  } catch (error) {
    console.error("Error:", error);
  }
}