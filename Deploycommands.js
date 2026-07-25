require('dotenv').config();
const { REST, Routes, SlashCommandBuilder } = require('discord.js');

const commands = [
  new SlashCommandBuilder()
    .setName('race')
    .setDescription('Start a chicken jockey race! React to join, fastest chicken wins.'),

  new SlashCommandBuilder()
    .setName('guessblock')
    .setDescription('Start a guess-the-Minecraft-block round. First correct answer wins.'),

  new SlashCommandBuilder()
    .setName('splitsteal')
    .setDescription('Challenge someone to a game of Split or Steal.')
    .addUserOption(opt =>
      opt.setName('opponent').setDescription('Who do you want to challenge?').setRequired(true))
    .addIntegerOption(opt =>
      opt.setName('pot').setDescription('How many points are on the line? (default 50)').setRequired(false)),

  new SlashCommandBuilder()
    .setName('points')
    .setDescription('Check your (or someone else\'s) point balance.')
    .addUserOption(opt =>
      opt.setName('user').setDescription('Whose balance to check').setRequired(false)),

  new SlashCommandBuilder()
    .setName('vote')
    .setDescription('Start a Yes/No vote. Anyone who votes No gets timed out. (Mod use recommended)')
    .addStringOption(opt =>
      opt.setName('question').setDescription('The question to vote on').setRequired(true)),
].map(cmd => cmd.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log('Registering slash commands...');
    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: commands }
    );
    console.log('Slash commands registered successfully.');
  } catch (err) {
    console.error(err);
  }
})();
