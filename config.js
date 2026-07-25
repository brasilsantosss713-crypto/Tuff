module.exports = {
  // How long (in minutes) someone is timed out for after voting "No" on a /vote
  voteNoTimeoutMinutes: 40,

  // How long players have to join a race after /race is started (seconds)
  raceJoinWindowSeconds: 20,

  // How long players have to answer a /guessblock round (seconds)
  guessBlockTimeLimitSeconds: 30,

  // Starting point balance for anyone who has never played split-or-steal before
  startingPoints: 100,

  // Default pot size for /splitsteal if no amount is given
  defaultPotAmount: 50,

  moderation: {
    // Channel names (lowercase, no #) where links are allowed.
    // Everywhere else, links get deleted.
    linkAllowedChannels: ['self-promo', 'booster-promo', 'media'],

    // Role names that bypass all moderation (in addition to anyone with
    // the "Manage Messages" permission, who is always exempt).
    bypassRoleNames: ['Mod', 'Admin', 'Moderator'],

    // How many warnings (swearing OR links, combined) before a timeout kicks in.
    warnThreshold: 3,

    // How long the escalation timeout lasts once someone hits the threshold.
    warnTimeoutMinutes: 10,

    // Warnings older than this many hours are forgiven (counter resets).
    warnResetHours: 24,

    // Optional: channel name to log deletions/warnings/timeouts to. Set to null to disable.
    logChannelName: 'mod-log',
  },
};
