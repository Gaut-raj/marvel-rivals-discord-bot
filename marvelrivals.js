require('dotenv').config();
const { Client, Intents } = require('discord.js');
const { get } = require('axios');
const cheerios = require('cheerio');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
const url = "https://www.marvelrivals.com/news/";
const prefix = "!";

let lastNewsTitle = ""; // To track the last fetched news

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);

    // Periodic check for new news every hour (3600000 ms)
    setInterval(async () => {
        try {
            const response = await get(url);
            const $ = cheerios.load(response.data);
            const news = $('.news');
            const newsTitle = news.find('.news-title').text();
            const newsDescription = news.find('.news-description').text();
            const newsImage = news.find('.news-image').attr('src');
            const newsLink = news.find('.news-link').attr('href');

            if (newsTitle && newsTitle !== lastNewsTitle) {
                lastNewsTitle = newsTitle; // Update the last fetched news title

                // Send the news to a specific channel (replace CHANNEL_ID with your channel ID)
                const channel = client.channels.cache.get('CHANNEL_ID');
                if (channel) {
                    channel.send(`${newsTitle}\n${newsDescription}\n${newsLink}\n${newsImage}`);
                } else {
                    console.error('Channel not found. Please check the CHANNEL_ID.');
                }
            }
        } catch (error) {
            console.error('Error fetching news:', error);
        }
    }, 3600000);
});

client.on('messageCreate', async message => {
    if (message.author.bot) return;
    if (!message.content.startsWith(prefix)) return;
    const commandBody = message.content.slice(prefix.length);
    const args = commandBody.split(' ');
    const command = args.shift().toLowerCase();

    if (command === 'news') {
        try {
            const response = await get(url);
            const $ = cheerios.load(response.data);
            const news = $('.news');
            const newsTitle = news.find('.news-title').text();
            const newsDescription = news.find('.news-description').text();
            const newsImage = news.find('.news-image').attr('src');
            const newsLink = news.find('.news-link').attr('href');
            message.channel.send(`${newsTitle}\n${newsDescription}\n${newsLink}\n${newsImage}`);
        } catch (error) {
            console.error(error);
        }
    }
});

client.login(process.env.DISCORD_TOKEN);
