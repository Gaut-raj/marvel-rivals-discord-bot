const { Client, Intents } = require('discord.js');
const fetchNews = require('../utils/fetchNews');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

const prefix = "!";

client.on("messageCreate", async message => {
    if (message.author.bot) return;
    if (!message.content.startsWith(prefix)) return;

    const commandBody = message.content.slice(prefix.length);
    const args = commandBody.split(' ');
    const command = args.shift().toLowerCase();

    if (command === "news") {
        const news = await fetchNews.fetchMarvelAnnouncements();
        message.channel.send(news.map(n => `${n.title}: ${n.link}`).join('\n'));
    } else if (command === "skins") {
        // Add logic to handle the "skins" command
        message.channel.send("Skins command executed.");
    }
});

client.login('MTM0NDkyODk4MTE4Njc3NzEyOA.GGfFC-.SLlDqNvOozrZ7zmorPQ6pToONf3unN0bhwGs2s');