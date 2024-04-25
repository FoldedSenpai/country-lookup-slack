const { app, fetchCountryInfo } = require('./app');

let redirected = false;

app.command('/country-info', async ({ ack, body, client, command }) => {
  await ack();

  try {
    const countryName = command.text;
    const countryInfo = await fetchCountryInfo(countryName);
    
    if (!countryInfo) {
      await client.chat.postEphemeral({
        user: body.user_id,
        channel: body.channel_id,
        text: `:x: Country '${countryName}' not found. Please try again. :x:`
      });
      return;
    }

    const {
      flags,
      maps,
      name,
      officialName,
      population,
      currencies,
      capital,
      continents,
      languages,
      timezones,
      independent,
      landlocked
    } = countryInfo;

    const currencyInfo = Object.keys(currencies).map(currencyCode => `${currencyCode} - ${currencies[currencyCode].name}`);

    const flagImageBlock = {
      type: 'image',
      image_url: flags.png.toLowerCase(),
      alt_text: `${name.common} Flag`
    };
    
    const messageBlocks = [
      {
        "type": "divider"
      },
      flagImageBlock,
       {
        "type": "header",
        "text": {
          "type": `plain_text`,
          "text": `Here's some quick information about ${name.common}:`
          }
		  },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `
:round_pushpin: Official Name: ${name.official}
:bust_in_silhouette: Population: ${population.toLocaleString()}
:coin: Currency/ies: ${currencyInfo.join(', ')}
:classical_building: Capital/s: ${capital.join(', ')}
:earth_africa: Continent: ${continents.join(', ')}
:speaking_head_in_silhouette: Language/s: ${Object.values(languages).join(', ')}
:clock8: Timezone/s: ${timezones.join(', ')}
        
*Other information:*
:diamond_shape_with_a_dot_inside: Independent: ${independent ? 'Yes' : 'No'}
:mountain: Landlocked: ${landlocked ? 'Yes' : 'No'}
      `
          }
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'Google Maps'
            },
            url: maps.googleMaps,
            action_id: 'google_maps_button'
          }
        ]
      },
      {
        type: 'divider'
      }
    ];

    await client.chat.postMessage({
      channel: body.channel_id,
      text: 'Here is the country information:',
      blocks: messageBlocks,
      unfurl_links: false
    });
  } catch (error) {
    console.error('Error processing command:', error);
    await client.chat.postEphemeral({
      channel: body.channel_id,
      text: 'An error occurred while processing the command. Please try again later.'
    });
  }
});

app.action('google_maps_button', async ({ body, ack }) => {
  redirected = true;
  await ack();
  await app.stop();
});

(async () => {
  await app.start(process.env.PORT || 3000);
  console.log('⚡️ Country Lookup app is running!');
})();
