const { EmbedBuilder } = require('discord.js');
const economy = require('../economy');

async function runPoints(interaction) {
  const target = interaction.options.getUser('user') ?? interaction.user;
  const balance = economy.getPoints(target.id);

  const embed = new EmbedBuilder()
    .setTitle('💰 Points Balance')
    .setDescription(`${target} has **${balance}** points.`)
    .setColor(0xF1C40F);

  await interaction.reply({ embeds: [embed] });
}

module.exports = { runPoints };
