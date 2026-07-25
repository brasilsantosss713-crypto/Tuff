const { EmbedBuilder } = require('discord.js');
const blocks = require('../data/blocks.json');
const config = require('../config');

async function runGuessBlock(interaction) {
  const block = blocks[Math.floor(Math.random() * blocks.length)];

  const embed = new EmbedBuilder()
    .setTitle('⛏️ Guess the Block!')
    .setDescription(`${block.clue}\n\nFirst person to type the correct block name wins!`)
    .setFooter({ text: `You have ${config.guessBlockTimeLimitSeconds} seconds.` })
    .setColor(0x55AA55);

  await interaction.reply({ embeds: [embed] });
  const channel = interaction.channel;

  const normalize = s => s.toLowerCase().replace(/[^a-z0-9]/g, '');
  const correct = normalize(block.answer);

  const collector = channel.createMessageCollector({
    filter: m => !m.author.bot && normalize(m.content) === correct,
    time: config.guessBlockTimeLimitSeconds * 1000,
    max: 1,
  });

  collector.on('collect', async m => {
    await m.reply(`🎉 Correct! It was **${block.answer}**. Nice eye, ${m.author}!`);
  });

  collector.on('end', async collected => {
    if (collected.size === 0) {
      await interaction.followUp(`⏰ Time's up! The answer was **${block.answer}**.`);
    }
  });
}

module.exports = { runGuessBlock };
