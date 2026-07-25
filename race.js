const { EmbedBuilder } = require('discord.js');
const config = require('../config');

const JOIN_EMOJI = '🐔';
const TRACK_LENGTH = 20;

async function runRace(interaction) {
  const embed = new EmbedBuilder()
    .setTitle('🐔 Chicken Jockey Race!')
    .setDescription(
      `React with ${JOIN_EMOJI} to hop on a chicken and join the race!\n` +
      `Race starts in **${config.raceJoinWindowSeconds} seconds**.`
    )
    .setColor(0xFFD700);

  await interaction.reply({ embeds: [embed] });
  const msg = await interaction.fetchReply();
  await msg.react(JOIN_EMOJI);

  const collector = msg.createReactionCollector({
    filter: (reaction, user) => reaction.emoji.name === JOIN_EMOJI && !user.bot,
    time: config.raceJoinWindowSeconds * 1000,
  });

  const racers = new Map();
  collector.on('collect', (reaction, user) => {
    if (!racers.has(user.id)) racers.set(user.id, { name: user.username, progress: 0 });
  });

  collector.on('end', async () => {
    if (racers.size === 0) {
      await interaction.followUp('No one hopped on a chicken in time. Race cancelled!');
      return;
    }

    const racerList = Array.from(racers.values());
    const finishOrder = [];

    // Simulate the race in a few animated ticks
    for (let tick = 0; tick < 8; tick++) {
      racerList.forEach(r => {
        if (r.progress < TRACK_LENGTH) {
          r.progress += Math.floor(Math.random() * 4) + 1;
          if (r.progress >= TRACK_LENGTH && !finishOrder.includes(r)) {
            r.progress = TRACK_LENGTH;
            finishOrder.push(r);
          }
        }
      });

      const board = racerList
        .map(r => {
          const filled = Math.min(r.progress, TRACK_LENGTH);
          const bar = '🟫'.repeat(filled) + '⬜'.repeat(TRACK_LENGTH - filled) + JOIN_EMOJI;
          return `**${r.name}**\n${bar}`;
        })
        .join('\n\n');

      const liveEmbed = new EmbedBuilder()
        .setTitle('🐔 Chicken Jockey Race — GO!')
        .setDescription(board)
        .setColor(0xFFD700);

      await interaction.editReply({ embeds: [liveEmbed] });

      if (finishOrder.length === racerList.length) break;
      await new Promise(res => setTimeout(res, 1200));
    }

    // Anyone who didn't cross the line, add in current order
    racerList.forEach(r => { if (!finishOrder.includes(r)) finishOrder.push(r); });

    const podium = finishOrder
      .slice(0, 3)
      .map((r, i) => `${['🥇', '🥈', '🥉'][i]} **${r.name}**`)
      .join('\n');

    const resultEmbed = new EmbedBuilder()
      .setTitle('🏁 Race Results!')
      .setDescription(podium || 'No finishers.')
      .setColor(0x00CC66);

    await interaction.followUp({ embeds: [resultEmbed] });
  });
}

module.exports = { runRace };
