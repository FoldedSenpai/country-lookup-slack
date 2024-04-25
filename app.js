const { App } = require('@slack/bolt');
const axios = require('axios');

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET
});

async function fetchCountryInfo(countryName) {
  try {
    const response = await axios.get(`https://restcountries.com/v3.1/name/${countryName}`);
    const countryInfo = response.data.find(country => {
      return country.name.common.toLowerCase() === countryName.toLowerCase() || 
             country.name.official.toLowerCase() === countryName.toLowerCase();
    });
    return countryInfo;
  } catch (error) {
    console.error('Error fetching country information:', error);
    return null;
  }
}

module.exports = { app, fetchCountryInfo };
