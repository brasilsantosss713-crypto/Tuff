const { Filter } = require('bad-words');
const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const config = require('./config');
const warnings = require('./warnings');

const filter = new Filter();
const URL_REGEX = /https?:\/\/\S+|www\.\S+|discord\.gg\/\S+/i;

function isExempt(member) {
  if (!member) return true;
  if (member.permissions.has(PermissionsBitField.Flags.ManageMessages)) return true;
  const names = member.roles.cache.map(r => r.name);
  return names.some(n => config.moderation.bypassRoleNames.includes(n));
}

async function logAction(guild, text) {
  if (!config.moderation.logChannelName) return;
  const channel = guild.channels.cache.find(
    c => c.name === config.moderation.logChannelName && c.isTextBased()
  );
  if (!channel) return;
  const embed = new EmbedBuilder().setDescription(text).setColor(0xE74C3C).setTimestamp();
  channel.send({ embeds: [embed] }).catch(() => {});
}

function attachModeration(client) {
  client.on('messageCreate', async message => {
    if (message.author.bot || !message.guild) return;
    if (isExempt(message.member)) return;

    const content = message.content;
    let violation = null;

    if (filter.isProfane(content)) {
      violation = 'used a filtered word';
    } else if (URL_REGEX.test(content)) {
      const channelName = message.channel.name?.toLowerCase() ?? '';
      const allowed = config.moderation.linkAllowedChannels
        .map(c => c.toLowerCase())
        .includes(channelName);
      if (!allowed) violation = 'posted a link outside an allowed channel';
    }

    if (!violation) return;

    // Delete the offending message
    await message.delete().catch(() => {});

    // Track + possibly escalate
    const count = warnings.addWarning(message.author.id);
    const remaining = Math.max(config.moderation.warnThreshold - count, 0);

    if (count >= config.moderation.warnThreshold) {
      warnings.resetWarnings(message.author.id);
      const timeoutMs = config.moderation.warnTimeoutMinutes * 60 * 1000;

      try {
        if (message.member.moderatable) {
          await message.member.timeout(timeoutMs, `Reached ${config.moderation.warnThreshold} moderation warnings`);
          const warnMsg = await message.channel.send(
            `⏱️ ${message.author}, you hit **${config.moderation.warnThreshold} warnings** (${violation}) and have been timed out for **${config.moderation.warnTimeoutMinutes} minutes**.`
          );
          setTimeout(() => warnMsg.delete().catch(() => {}), 8000);
          await logAction(message.guild, `⏱️ **${message.author.tag}** timed out for ${config.moderation.warnTimeoutMinutes}m after reaching ${config.moderation.warnThreshold} warnings. Last violation: ${violation}.`);
        } else {
          await logAction(message.guild, `⚠️ **${message.author.tag}** hit the warning threshold but could not be timed out (role hierarchy).`);
        }
      } catch (err) {
        console.error('Failed to timeout user:', err);
      }
    } else {
      const warnMsg = await message.channel.send(
        `⚠️ ${message.author}, your message was removed (${violation}). Warning **${count}/${config.moderation.warnThreshold}** — ${remaining} more and you'll be timed out.`
      );
      setTimeout(() => warnMsg.delete().catch(() => {}), 8000);
      await logAction(message.guild, `⚠️ **${message.author.tag}** warned (${count}/${config.moderation.warnThreshold}) — ${violation}. Message: ${content.slice(0, 200)}`);
    }
  });
}

module.exports = { attachModeration };
