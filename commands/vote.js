const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');
const config = require('../config');

async function runVote(interaction) {
  const question = interaction.options.getString('question');
  const timeoutMs = config.voteNoTimeoutMinutes * 60 * 1000;

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('vote_yes').setLabel('✅ Yes').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId('vote_no').setLabel('❌ No').setStyle(ButtonStyle.Danger),
  );

  const embed = new EmbedBuilder()
    .setTitle('📊 Vote')
    .setDescription(
      `${question}\n\n` +
      `⚠️ **Heads up:** voting **No** gets you timed out for **${config.voteNoTimeoutMinutes} minutes**. Vote wisely.`
    )
    .setColor(0x9B59B6);

  await interaction.reply({ embeds: [embed], components: [row] });
  const msg = await interaction.fetchReply();

  const collector = msg.createMessageComponentCollector({ time: 5 * 60_000 });
  let yesCount = 0;
  let noCount = 0;
  const voted = new Set();

  collector.on('collect', async i => {
    if (voted.has(i.user.id)) {
      return i.reply({ content: 'You already voted!', ephemeral: true });
    }
    voted.add(i.user.id);

    if (i.customId === 'vote_yes') {
      yesCount++;
      await i.reply({ content: '✅ Your vote has been recorded.', ephemeral: true });
      return;
    }

    noCount++;
    const member = i.member;
    try {
      if (member.moderatable) {
        await member.timeout(timeoutMs, `Voted No on: ${question}`);
        await i.reply({
          content: `❌ You voted No — timed out for ${config.voteNoTimeoutMinutes} minutes. Should've voted Yes 😅`,
          ephemeral: true,
        });
      } else {
        await i.reply({
          content: "❌ Vote recorded as No. (You're immune to the timeout — mod/role hierarchy protects you.)",
          ephemeral: true,
        });
      }
    } catch (err) {
      console.error('Failed to timeout user:', err);
      await i.reply({ content: '❌ Vote recorded as No, but I could not apply the timeout (check my permissions).', ephemeral: true });
    }
  });

  collector.on('end', async () => {
    const finalEmbed = new EmbedBuilder()
      .setTitle('📊 Vote Closed')
      .setDescription(`${question}\n\n✅ Yes: **${yesCount}**\n❌ No: **${noCount}**`)
      .setColor(0x9B59B6);
    await msg.edit({ embeds: [finalEmbed], components: [] }).catch(() => {});
  });
}

module.exports = { runVote };
