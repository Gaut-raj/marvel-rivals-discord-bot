const { Client, GatewayIntentBits } = require("discord.js");
const TOKEN = "YOUR_BOT_TOKEN";  // Replace with your actual bot token
const CHANNEL_ID = "YOUR_CHANNEL_ID";  // Replace with your Discord channel ID

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

async function sendNewsToDiscord() {
    const news = await scrapeNews(); // Call the scraping function

    if (news.length > 0) {
        const channel = await client.channels.fetch(CHANNEL_ID);
        for (const article of news) {
            await channel.send(`📰 **${article.title}**\n🔗 ${article.link}`);
        }
    }
}

client.once("ready", () => {
    console.log(`Logged in as ${client.user.tag}!`);
    sendNewsToDiscord();
});

client.login(TOKEN);
