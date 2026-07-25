const { EmbedBuilder } = require('discord.js');
const warnings = require('../warnings');
const config = require('../config');

async function runWarnings(interaction) {
  const target = interaction.options.getUser('user') ?? interaction.user;
  const count = warnings.getWarnings(target.id);

  const embed = new EmbedBuilder()
    .setTitle('⚠️ Warnings')
    .setDescription(`${target} has **${count}/${config.moderation.warnThreshold}** active warnings.`)
    .setColor(0xE67E22);

  await interaction.reply({ embeds: [embed], ephemeral: true });
}

async function runClearWarnings(interaction) {
  const target = interaction.options.getUser('user');
  warnings.resetWarnings(target.id);
  await interaction.reply({ content: `✅ Cleared warnings for ${target}.`, ephemeral: true });
}

module.exports = { runWarnings, runClearWarnings };
