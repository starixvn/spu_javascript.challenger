const cheerio = require("cheerio");
const request = require("request-promise");

const loginUrl = "https://fps-demo-standard.nexdev.net/Login/OnPost";

const loginData = {
  Username: "test",
  Password: "1234aa",
};

request.post(
  { url: loginUrl, form: loginData, followAllRedirects: true },
  (error, response, html) => {
    const $ = cheerio.load(html);

    var tokenValue = $('#__fdi').val();

    if (tokenValue) {
      console.log("Value of __fdi:", tokenValue);
    } else {
      console.log('Element with ID "__fdi" not found.');
    }
  }
);