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
};
