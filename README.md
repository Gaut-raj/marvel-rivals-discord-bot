# Marvel Rivals Discord Bot

Welcome to the Marvel Rivals Discord Bot! This bot brings the latest Marvel Rivals news directly to your Discord server, making it easy for your community to stay up-to-date with game updates, announcements, and more.

## Features
- Fetches the latest Marvel Rivals news with a simple command
- Displays news title, description, link, and image
- Easy setup and lightweight

---

## Getting Started
Follow these steps to get the bot running in your server:

### 1. Prerequisites
- [Node.js](https://nodejs.org/) installed
- A Discord account and a server where you have permission to add bots
- Your Discord bot token (from the [Discord Developer Portal](https://discord.com/developers/applications))

### 2. Installation
Clone this repository and install dependencies:
```bash
# Clone the repo
$ git clone https://github.com/Gaut-raj/marvel-rivals-discord-bot.git
# Navigate to the folder
$ cd marvel-rivals-discord-bot
# Install dependencies
$ npm install
```

### 3. Configuration
Create a `.env` file in the root directory and add your Discord bot token:
```env
DISCORD_TOKEN=your-bot-token-here
```

### 4. Running the Bot
Start the bot with:
```bash
$ node marvelrivals.js
```
You should see a message like `Logged in as <your-bot-name>!` in your terminal.

---

## Usage
Once the bot is online and invited to your server, use the following command in any text channel:

```
!news
```
The bot will reply with the latest Marvel Rivals news, including the title, description, link, and image.

---

## Troubleshooting
- **Bot not responding?** Make sure your bot token is correct and the bot has permission to read/send messages in the channel.
- **Dependencies missing?** Run `npm install` to ensure all packages are installed.
- **Still stuck?** Check your terminal for error messages and consult the [Discord.js documentation](https://discord.js.org/#/).

---

## Contributing
Feel free to open issues or submit pull requests to improve the bot!

## License
This project is licensed under the MIT License.