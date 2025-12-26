// =========================================
// The Challenge: Free Agents — Daily Challenges (formatted from daily_data.js)
// =========================================
//
// Aligned to template.js, plus explicit total counts for each episode.
//
// Fields:
// - episode
// - id
// - name
// - description (unchanged from source)
// - teamFormat
// - skillWeights
// - resultCounts: as per template
// - winnerCount, safeCount, bottomCount: explicit numeric totals
// - teamDetails: structural data for team-based challenges

window.FA_DAILY_DATA = [
  {
    episode: 1,
    id: "dc1",
    name: "Out on a Ledge",
    description: `
Played in two teams of 14 players, each team participates in a multi-stage race to the top of Montevideo's World Trade Center. The teams are then split up into three teams — two of four players and one of six players. The three teams are positioned at three different locations — one four-player team is chained together at the rooftop next to a locked box at a puzzle station, another four-player team is chained together at a plank hanging from the edge of the rooftop, while the six-player team is chained together at the base of the building.<br><br>
• <strong>Phase 1:</strong> The two six-player teams race against each other through all 42 stories of the World Trade Center, and each team possesses a key that is required to unchain their respective 4-player team that is chained together at the locked box, where Phase 2 begins.<br><br>
• <strong>Phase 2:</strong> One four-player team uses a key to unlock a box which contains puzzle pieces. When that team solves their puzzle, another key is retrieved to unchain the other four-player team standing by near the plank.<br><br>
• <strong>Phase 3:</strong> Players from the remaining four-player teams have to race along a plank suspended 450 feet above ground level, one player at a time, then retrieve a pink flag sitting in the middle of a rolling log, and ring a bell in the fastest time possible. The entire challenge is a timed event, and the team that completes the challenge in the fastest time wins, while all members of the losing team are automatically sent to "The Draw."
`.trim(),
    teamFormat: "teams",
    skillWeights: { speed: 1, endurance: 1, balance: 1 },
    resultCounts: { winners: 1, safe: 0, bottom: 1 },
    winnerCount: 14,
    safeCount: 0,
    bottomCount: 14,
    teamDetails: { recipe: { teamSize: 14, malesPerTeam: 7, femalesPerTeam: 7 } }
  },
  {
    episode: 2,
    id: "dc2",
    name: "Auto Body Rally",
    description: "Played in male/female pairs, each pair has to race in a sports car on a drag strip, then run around a series of hay bales, and ride together on an oversize bicycle within an obstacle course consisting of bales of hay, toward a finish line. When each pair rides the bicycle, one player has to backwards-steer the front of the bicycle while the other pedals in order to navigate through the obstacle course. The team with the fastest time wins the challenge, while the teams with the four slowest times are automatically sent to \"The Draw.\"",
    teamFormat: "teams",
    skillWeights: { speed: 1, balance: 1, teamwork: 1 },
    resultCounts: { winners: 1, safe: 8, bottom: 4 },
    winnerCount: 2,
    safeCount: 16,
    bottomCount: 8,
    teamDetails: { recipe: { teamSize: 2, malesPerTeam: 1, femalesPerTeam: 1 } }
  },
  {
    episode: 3,
    id: "dc3",
    name: "Bar Crawl",
    description: "A giant wall, with platforms on both sides, numerous holes horizontally-aligned at the base of the wall and two oversize bars in two holes, is suspended from a crane over water. Played in teams of four (two players on both sides of the wall), each team has to advance from one platform to the other by using the bars as a walkway. Players on each side have to shove the bars through the holes in order for their partners to advance forward on the bars. It is a timed event, and the team that advances all of their players from one platform to the other in the fastest time wins, while the teams with the two slowest times are automatically sent to \"The Draw.\" A team is disqualified if they do not complete the challenge within a time limit, or if any team member drops a bar into the water.",
    teamFormat: "teams",
    skillWeights: { balance: 1, teamwork: 1 },
    resultCounts: { winners: 1, safe: 3, bottom: 2 },
    winnerCount: 4,
    safeCount: 12,
    bottomCount: 8,
    teamDetails: { recipe: { teamSize: 4, malesPerTeam: 2, femalesPerTeam: 2 } }
  },
  {
    episode: 4,
    id: "dc4",
    name: "Bounce Out",
    description: "Players are separated into two teams of 11 players. Then, the two teams are split into two groups — of six and five players. Each player wears oversize plastic bumper suits with pictures of their faces on them, and the groups have to designate one player to serve as the ball, in which that player tries to advance from one side of a beach to another, toward a soccer goal. The remaining players either try to defend their own goal or help escort the designated ball toward their opponent's goal. The first team to score three goals wins the challenge, while all members of the losing team are automatically sent to \"The Draw.\"",
    teamFormat: "teams",
    skillWeights: { balance: 1, strength: 1, speed: 1, teamwork: 1 },
    resultCounts: { winners: 1, safe: 0, bottom: 1 },
    winnerCount: 11,
    safeCount: 0,
    bottomCount: 11,
    teamDetails: { teamCompositions: [{ males: 6, females: 5 }, { males: 5, females: 6 }] }
  },
  {
    episode: 5,
    id: "dc5",
    name: "Piggy Back",
    description: "Players are separated into two teams of ten — five of each gender. Each team has to advance on ten hanging ropes from one platform to another suspended above water. After one player advances onto one rope, the next teammate has to use the first player as a human bridge in order to advance to the next rope. The first team that advances the most players from one platform to the other in the fastest time wins, while all members of the losing team are automatically sent to \"The Draw.\"",
    teamFormat: "teams",
    skillWeights: { balance: 1, strength: 1, climbing: 1, teamwork: 1 },
    resultCounts: { winners: 1, safe: 0, bottom: 1 },
    winnerCount: 10,
    safeCount: 0,
    bottomCount: 10,
    teamDetails: { recipe: { teamSize: 10, malesPerTeam: 5, femalesPerTeam: 5 } }
  },
  {
    episode: 6,
    id: "dc6",
    name: "Smarty Pants",
    description: "Played as an individual challenge. Each player is hanging by a rope from a platform suspended above water, and if they correctly answer a question, they stay in the game, but will get a red X for each wrong answer. If a player gets two red X's, they are dropped into the water. The first four players of each gender to be dropped are automatically sent to \"The Draw,\" while the last player of each gender standing wins.",
    teamFormat: "solo",
    skillWeights: { mental: 1 },
    resultCounts: { winners: { male: 1, female: 1 }, safe: { male: 4, female: 4 }, bottom: { male: 4, female: 4 } },
    winnerCount: 2,
    safeCount: 8,
    bottomCount: 8
  },
  {
    episode: 7,
    id: "dc7",
    name: "Sausage Party",
    description: "Played as an individual challenge. Players roll themselves along a barbecue-style obstacle course on the beach while covered in shrink wrap. The challenge is played in two separate heats — one for each gender. The first player that makes their way through the course and onto the oversize bread buns wins, while the three players in each heat that do not make it to the buns are automatically sent to \"The Draw.\"",
    teamFormat: "solo",
    skillWeights: { speed: 1 },
    resultCounts: { winners: { male: 1, female: 1 }, safe: { male: 3, female: 3 }, bottom: { male: 4, female: 4 } },
    winnerCount: 2,
    safeCount: 6,
    bottomCount: 8
  },
  {
    episode: 8,
    id: "dc8",
    name: "Hold That Pose",
    description: "Played in two teams of seven, all members of each team have to grab hold of a certain color of rope with their feet and hands. There are two ropes with 28 straps — four straps for each player, and once the hands and feet of each player are strapped in, all team members have to hold a pose above the sand for one minute. The first team to hold a pose for one minute without any players touching the ground wins, while all members of the losing team are automatically sent to \"The Draw.\"",
    teamFormat: "teams",
    skillWeights: { endurance: 1, teamwork: 1, climbing: 1 },
    resultCounts: { winners: 1, safe: 0, bottom: 1 },
    winnerCount: 7,
    safeCount: 0,
    bottomCount: 7,
    teamDetails: { teamCompositions: [{ males: 4, females: 3 }, { males: 3, females: 4 }] }
  },
  {
    episode: 9,
    id: "dc9",
    name: "Dug Out",
    description: "Players run up and down through intersecting half-pipes that are dug several feet deep and have to transfer five colored balls to their partner's ball rack. The challenge is played in same-gender pairs — one round for each gender. The pair that transfers all of their colored balls — 10 total — wins, while the remaining players are sent to \"The Draw.\"",
    teamFormat: "teams",
    skillWeights: { speed: 1, strength: 1 },
    resultCounts: { winners: 2, safe: 0, bottom: 4 },
    winnerCount: 4,
    safeCount: 0,
    bottomCount: 8,
    teamDetails: { recipe: { teamSize: 2, malesPerTeam: 1, femalesPerTeam: 1 } }
  },
  {
    episode: 10,
    id: "dc10",
    name: "Crossover",
    description: "Played in male/female pairs. Each pair has to advance through a lagoon toward a sandbar, dig for puzzle pieces in two treasure chests, and assemble a puzzle. The first pair to solve the puzzle wins, while the two last-place pairs are automatically sent to \"The Draw.\"",
    teamFormat: "teams",
    skillWeights: { strength: 1, endurance: 1, teamwork: 1 },
    resultCounts: { winners: 1, safe: 1, bottom: 3 },
    winnerCount: 2,
    safeCount: 2,
    bottomCount: 6,
    teamDetails: { recipe: { teamSize: 2, malesPerTeam: 1, femalesPerTeam: 1 } }
  }
];
