require('dotenv').config();
const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const { fetchNews } = require('./src/news');
const { Store } = require('./src/store');

const token = process.env.DISCORD_TOKEN;
if (!token) {
  console.error('DISCORD_TOKEN is required');
  process.exit(1);
}

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const store = new Store(process.env.DATA_FILE || './data/subscriptions.json');
const intervalMs = Number(process.env.POLL_INTERVAL_MINUTES || 15) * 60_000;
if (!Number.isFinite(intervalMs) || intervalMs < 60_000) {
  throw new Error('POLL_INTERVAL_MINUTES must be at least 1');
}

const commands = [
  new SlashCommandBuilder().setName('news').setDescription('Show the latest official Marvel Rivals news'),
  new SlashCommandBuilder().setName('subscribe').setDescription('Post new Marvel Rivals news to this channel')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  new SlashCommandBuilder().setName('unsubscribe').setDescription('Disable news updates for this server')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  new SlashCommandBuilder().setName('news-status').setDescription('Show this server\'s news notification settings')
].map(command => command.toJSON());

function embedFor(article) {
  return new EmbedBuilder()
    .setColor(0xD52B31)
    .setTitle(article.title.slice(0, 256))
    .setURL(article.url)
    .setDescription(article.description?.slice(0, 4000) || 'Read the full announcement on the official website.')
    .setFooter({ text: 'Marvel Rivals • Official news' });
}

let pollRunning = false;
async function poll() {
  if (pollRunning) return;
  pollRunning = true;
  try {
    const articles = await fetchNews();
    const latest = articles[0];
    if (!latest) return;
    for (const [guildId, subscription] of Object.entries(store.all())) {
      if (subscription.lastUrl === latest.url) continue;
      try {
        const channel = await client.channels.fetch(subscription.channelId);
        if (!channel || !channel.isTextBased() || !('send' in channel) || channel.guildId !== guildId) {
          console.warn('Subscription channel unavailable:', guildId);
          continue;
        }
        await channel.send({ embeds: [embedFor(latest)], allowedMentions: { parse: [] } });
        store.set(guildId, { ...subscription, lastUrl: latest.url });
      } catch (error) {
        console.error('Failed to deliver news for guild', guildId, error);
      }
    }
  } catch (error) {
    console.error('News polling failed:', error);
  } finally {
    pollRunning = false;
  }
}

client.once('ready', async () => {
  console.info('Ready as', client.user.tag);
  try {
    const rest = new REST({ version: '10' }).setToken(token);
    await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
    console.info('Registered slash commands');
  } catch (error) {
    console.error('Unable to register commands:', error);
  }
  await poll();
  const timer = setInterval(poll, intervalMs);
  timer.unref();
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;
  try {
    if (interaction.commandName === 'news') {
      await interaction.deferReply();
      const articles = await fetchNews();
      if (!articles.length) return interaction.editReply('No news is available right now.');
      return interaction.editReply({ embeds: [embedFor(articles[0])] });
    }
    if (!interaction.inGuild()) {
      return interaction.reply({ content: 'This command only works in a server.', flags: MessageFlags.Ephemeral });
    }
    if (interaction.commandName === 'news-status') {
      const subscription = store.get(interaction.guildId);
      return interaction.reply({ content: subscription
        ? `News updates are enabled in <#${subscription.channelId}>.`
        : 'News updates are disabled for this server.', flags: MessageFlags.Ephemeral });
    }
    if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)) {
      return interaction.reply({ content: 'You need Manage Server permission.', flags: MessageFlags.Ephemeral });
    }
    if (interaction.commandName === 'unsubscribe') {
      store.delete(interaction.guildId);
      return interaction.reply({ content: 'News notifications disabled.', flags: MessageFlags.Ephemeral });
    }
    if (interaction.commandName === 'subscribe') {
      if (!interaction.channel?.isTextBased() || !('send' in interaction.channel)) {
        return interaction.reply({ content: 'Use this command in a text channel.', flags: MessageFlags.Ephemeral });
      }
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });
      const permissions = interaction.channel.permissionsFor(client.user);
      if (!permissions?.has([PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks])) {
        return interaction.editReply('I need View Channel, Send Messages, and Embed Links permissions here.');
      }
      const articles = await fetchNews();
      if (!articles.length) return interaction.editReply('Could not load official news. Try again later.');
      store.set(interaction.guildId, { channelId: interaction.channelId, lastUrl: articles[0].url });
      return interaction.editReply('Subscribed! Future news will appear in this channel (existing articles will not be reposted).');
    }
  } catch (error) {
    console.error('Command failed:', interaction.commandName, error);
    const response = { content: 'Something went wrong. Please try again later.' };
    if (interaction.deferred) await interaction.editReply(response).catch(console.error);
    else if (!interaction.replied) await interaction.reply({ ...response, flags: MessageFlags.Ephemeral }).catch(console.error);
  }
});

client.on('error', error => console.error('Discord client error:', error));
process.on('SIGINT', () => client.destroy());
process.on('SIGTERM', () => client.destroy());
client.login(token).catch(error => { console.error('Discord login failed:', error); process.exitCode = 1; });
