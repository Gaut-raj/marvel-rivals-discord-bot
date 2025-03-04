module.exports = {
    name: "help",
    description: "Provides information about available commands",
    execute(client, message, args) {
        if (message.content === '!news') {
            return message.channel.send("Fetches the latest news announcement");
        } else if (message.content === '!heroinfo') {
            return message.channel.send("Returns information of heroes");
        } else if (message.content === '!skins') {
            return message.channel.send("Returns All hero Skins");
        } else if (message.content === '!hero') {
            return message.channel.send("Returns Hero by ID");
        } else {
            return message.channel.send("Unknown command");
        }
    }
};