require('dotenv').config();
const { Client, GatewayIntentBits, Partials } = require('discord.js');

const { runRace } = require('./commands/race');
const { runGuessBlock } = require('./commands/guessblock');
const { runSplitSteal } = require('./commands/splitsteal');
const { runVote } = require('./commands/vote');
const { runPoints } = require('./commands/points');

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

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

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
