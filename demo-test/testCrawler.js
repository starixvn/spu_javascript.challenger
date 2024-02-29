const cheerio = require("cheerio");
const request = require("request-promise");

const loginUrl = "http://localhost:60207/Login/OnPost";

// Define login data
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

// request('https://fps-demo-standard.nexdev.net/Login', (error, response, html) => {
//   if (error) {
//     console.error('Error occurred:', error);
//     return;
//   }

//   if (response.statusCode !== 200) {
//     console.error('Unexpected status code:', response.statusCode);
//     return;
//   }

//   console.log('html', html);

//   // Load HTML content using cheerio
//   const $ = cheerio.load(html);

//   // Extract value of the element with ID '__fdi'
//   var tokenValue = $('[name="__RequestVerificationToken"]').val();

//   // Check if the value was found
//   if (tokenValue) {
//     console.log('Value of tokenValue:', tokenValue);
//   } else {
//     console.log('Element with ID "__fdi" not found.');
//   }
// });
