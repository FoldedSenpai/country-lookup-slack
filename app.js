const { App } = require('@slack/bolt');
const axios = require('axios');

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET
});

// Function to fetch country information from restcountries.com API
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

// Slash command in Slack
app.command('/country-info', async ({ ack, body, client, command }) => {
  await ack();

  try {
    const countryName = command.text;
    const countryInfo = await fetchCountryInfo(countryName);
    
    // Error when a country is not found
    if (!countryInfo) {
      await client.chat.postEphemeral({
        user: body.user_id,
        channel: body.channel_id,
        text: `:x: Country '${countryName}' not found. Please try again. :x:`
      });
      return;
    }

    // Extract relevant information from countryInfo
    const {
      flags,
      maps,
      name,
      nativeName,
      population,
      currencies,
      capital,
      subregion,
      languages,
      timezones,
      independent,
      landlocked
    } = countryInfo;

    // Format currency ex. United States Dollar to USD
    const currencyInfo = Object.keys(currencies).map(currencyCode => `${currencyCode} - ${currencies[currencyCode].name}`);

    // Output results
    const message = `
    Here's some quick information about *${name.common}*:

:round_pushpin: Native Name: ${name.official}
:bust_in_silhouette: Population: ${population.toLocaleString()}
:coin: Currency/ies: ${currencyInfo.join(', ')}
:classical_building: Capital/s: ${capital.join(', ')}
:earth_africa: Subregion: ${subregion}
:speaking_head_in_silhouette: Language/s: ${Object.values(languages).join(', ')}
:clock8: Timezone/s: ${timezones.join(', ')}
    
*Other information:*
:diamond_shape_with_a_dot_inside: Independent: ${independent ? 'Yes' : 'No'}
:mountain: Landlocked: ${landlocked ? 'Yes' : 'No'}
  
:world_map: *Google Maps:* ${maps.googleMaps}
:flag-un: *Flag:* ${flags.png.toLowerCase()}
    `;

    // Send message with country information
    await client.chat.postMessage({
      channel: body.channel_id,
      text: message,
      unfurl_links: false
    });
  } catch (error) {
    console.error('Error processing command:', error);
    await client.chat.postMessage({
      channel: body.channel_id,
      text: 'An error occurred while processing the command. Please try again later.'
    });
  }
});

(async () => {
  await app.start(process.env.PORT || 3000);
  console.log('⚡️ Country lookup app is running!');
})();
