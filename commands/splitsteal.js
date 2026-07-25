const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');
const economy = require('../economy');
const config = require('../config');

async function runSplitSteal(interaction) {
  const challenger = interaction.user;
  const opponent = interaction.options.getUser('opponent');
  const pot = interaction.options.getInteger('pot') ?? config.defaultPotAmount;

  if (opponent.bot) {
    return interaction.reply({ content: "You can't challenge a bot!", ephemeral: true });
  }
  if (opponent.id === challenger.id) {
    return interaction.reply({ content: "You can't challenge yourself!", ephemeral: true });
  }
  if (pot <= 0) {
    return interaction.reply({ content: 'Pot must be a positive number of points.', ephemeral: true });
  }

  const acceptRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('ss_accept').setLabel('Accept Challenge').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId('ss_decline').setLabel('Decline').setStyle(ButtonStyle.Secondary),
  );

  const introEmbed = new EmbedBuilder()
    .setTitle('🤝🔪 Split or Steal')
    .setDescription(
      `${challenger} has challenged ${opponent} to Split or Steal for a pot of **${pot} points**!\n\n` +
      `If both split: each gets **${Math.floor(pot / 2)}** points.\n` +
      `If one steals & one splits: the stealer takes the whole **${pot}**.\n` +
      `If both steal: nobody gets anything.\n\n` +
      `${opponent}, do you accept?`
    )
    .setColor(0xE67E22);

  await interaction.reply({ embeds: [introEmbed], components: [acceptRow] });
  const msg = await interaction.fetchReply();

  const acceptCollector = msg.createMessageComponentCollector({ time: 60_000, max: 1 });

  acceptCollector.on('collect', async i => {
    if (i.user.id !== opponent.id) {
      return i.reply({ content: 'This challenge is not for you.', ephemeral: true });
    }

    if (i.customId === 'ss_decline') {
      await i.update({
        embeds: [EmbedBuilder.from(introEmbed).setDescription(`${opponent} declined the challenge.`)],
        components: [],
      });
      return;
    }

    // Accepted — move to choice phase
    const choiceRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('ss_choose').setLabel('🎮 Make Your Choice').setStyle(ButtonStyle.Primary),
    );

    const liveEmbed = new EmbedBuilder()
      .setTitle('🤝🔪 Split or Steal — Accepted!')
      .setDescription(
        `${challenger} and ${opponent}, click below privately to choose **Split** or **Steal**.\n` +
        `Pot: **${pot} points**`
      )
      .setColor(0x3498DB);

    await i.update({ embeds: [liveEmbed], components: [choiceRow] });

    const choices = {};
    const choiceCollector = msg.createMessageComponentCollector({ time: 90_000 });

    choiceCollector.on('collect', async ci => {
      if (![challenger.id, opponent.id].includes(ci.user.id)) {
        return ci.reply({ content: 'This game is not for you.', ephemeral: true });
      }
      if (ci.customId !== 'ss_choose') return;
      if (choices[ci.user.id]) {
        return ci.reply({ content: 'You already made your choice.', ephemeral: true });
      }

      const pickRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(`ss_split_${ci.id}`).setLabel('Split 🤝').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId(`ss_steal_${ci.id}`).setLabel('Steal 🔪').setStyle(ButtonStyle.Danger),
      );

      await ci.reply({ content: 'Choose wisely...', components: [pickRow], ephemeral: true });
      const pickMsg = await ci.fetchReply();

      const pickCollector = pickMsg.createMessageComponentCollector({ time: 60_000, max: 1 });
      pickCollector.on('collect', async pi => {
        const finalChoice = pi.customId.startsWith('ss_split') ? 'split' : 'steal';
        choices[ci.user.id] = finalChoice;
        await pi.update({ content: `You chose **${finalChoice.toUpperCase()}**. Waiting for the other player...`, components: [] });

        if (Object.keys(choices).length === 2) {
          choiceCollector.stop('done');
        }
      });
    });

    choiceCollector.on('end', async (_collected, reason) => {
      const cChoice = choices[challenger.id];
      const oChoice = choices[opponent.id];

      let resultText;
      if (!cChoice || !oChoice) {
        resultText = 'Time ran out before both players chose. No points awarded.';
      } else if (cChoice === 'split' && oChoice === 'split') {
        const share = Math.floor(pot / 2);
        economy.addPoints(challenger.id, share);
        economy.addPoints(opponent.id, share);
        resultText = `Both chose **Split**! Each player gets **${share} points**. 🤝`;
      } else if (cChoice === 'steal' && oChoice === 'steal') {
        resultText = `Both chose **Steal**! Nobody gets anything. 😬`;
      } else {
        const stealer = cChoice === 'steal' ? challenger : opponent;
        economy.addPoints(stealer.id, pot);
        resultText = `${stealer} chose **Steal** and takes the whole pot of **${pot} points**! 🔪`;
      }

      const finalEmbed = new EmbedBuilder()
        .setTitle('🤝🔪 Split or Steal — Result')
        .setDescription(resultText)
        .setColor(0x2ECC71);

      await msg.edit({ embeds: [finalEmbed], components: [] }).catch(() => {});
    });
  });

  acceptCollector.on('end', async (collected) => {
    if (collected.size === 0) {
      await msg.edit({
        embeds: [EmbedBuilder.from(introEmbed).setDescription('Challenge expired — no response in time.')],
        components: [],
      }).catch(() => {});
    }
  });
}

module.exports = { runSplitSteal };
