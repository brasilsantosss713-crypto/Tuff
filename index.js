require('dotenv').config();
const { Client, GatewayIntentBits, Partials, REST, Routes } = require('discord.js');
const { commands } = require('./command-definitions');

const { runRace } = require('./commands/race');
const { runGuessBlock } = require('./commands/guessblock');
const { runSplitSteal } = require('./commands/splitsteal');
const { runVote } = require('./commands/vote');
const { runPoints } = require('./commands/points');
const { runWarnings, runClearWarnings } = require('./commands/warncheck');
const { attachModeration } = require('./moderation');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMembers,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

client.once('ready', async () => {
  console.log(`Logged in as ${client.user.tag}`);

  try {
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
    console.log('Auto-registering slash commands...');
    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: commands }
    );
    console.log('Slash commands registered successfully.');
  } catch (err) {
    console.error('Failed to auto-register slash commands:', err);
  }
});

attachModeration(client);

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  try {
    switch (interaction.commandName) {
      case 'race':
        await runRace(interaction);
        break;
      case 'guessblock':
        await runGuessBlock(interaction);
        break;
      case 'splitsteal':
        await runSplitSteal(interaction);
        break;
      case 'vote':
        await runVote(interaction);
        break;
      case 'points':
        await runPoints(interaction);
        break;
      case 'warnings':
        await runWarnings(interaction);
        break;
      case 'clearwarnings':
        await runClearWarnings(interaction);
        break;
    }
  } catch (err) {
    console.error(`Error handling /${interaction.commandName}:`, err);
    const reply = { content: 'Something went wrong running that command.', ephemeral: true };
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(reply).catch(() => {});
    } else {
      await interaction.reply(reply).catch(() => {});
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
