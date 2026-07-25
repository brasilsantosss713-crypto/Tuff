const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

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

  new SlashCommandBuilder()
    .setName('warnings')
    .setDescription('Check a user\'s current moderation warning count.')
    .addUserOption(opt =>
      opt.setName('user').setDescription('Whose warnings to check').setRequired(false)),

  new SlashCommandBuilder()
    .setName('clearwarnings')
    .setDescription('Clear a user\'s moderation warnings. (Mod only)')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addUserOption(opt =>
      opt.setName('user').setDescription('Whose warnings to clear').setRequired(true)),
].map(cmd => cmd.toJSON());

module.exports = { commands };
