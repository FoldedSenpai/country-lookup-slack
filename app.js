// Require the Bolt package (github.com/slackapi/bolt)
const { App } = require("@slack/bolt");

const app = new App({
    token: process.env.SLACK_BOT_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET
});

app.command("/country-info", async ({ ack, say, command }) => {
    // Acknowledge the command
    await ack();

    // Extract country name from the command
    const countryName = command.text;

    // Fetch country information from restcountries.com API
    const countryInfo = await fetchCountryInfo(countryName);

    // Format and send the information back to Slack
    if (countryInfo) {
        const message = formatCountryInfo(countryInfo);
        await say({ text: message, channel: 'test-agy1960' });
        await say(`Sorry, could not find information for ${countryName}. Please check the country name and try again.`);
    }
});

// Function to fetch country information from restcountries.com API
async function fetchCountryInfo(countryName) {
    try {
        const response = await axios.get(`https://restcountries.com/v3.1/name/${countryName}`);

        // Check if the request was successful
        if (response.status === 200) {
            return response.data[0]; // Assuming the API returns information about the first matching country
        } else {
            return null;
        }
    } catch (error) {
        console.error(`Error fetching country information: ${error}`);
        return null;
    }
}

// Function to format country information for display in Slack
function formatCountryInfo(countryInfo) {
    const formattedInfo = `*${countryInfo.name.common}*\n`
        + `Capital: ${countryInfo.capital}\n`
        + `Language(s): ${Object.keys(countryInfo.languages).join(', ')}\n`
        + `Currency: ${Object.values(countryInfo.currencies)}\n`
        + `Country Code: ${countryInfo.cca2}`;
    // Add more information as needed
    return formattedInfo;
}

// Start the app
(async () => {
    await app.start(process.env.PORT || 3000);
    console.log('⚡️ Bolt app is running!');
})();
