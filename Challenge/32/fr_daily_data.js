
/*
  Daily & Purge Challenges — TEMPLATE for the FR season
  Loaded by: ./index.html
  Shape matches your existing engine so scoring is plug‑and‑play.

  Fields:
  - id: unique string
  - episode: 1..14 (note special flows for 1,3,5,7,9,12)
  - type: 'daily' | 'purge'
  - name, description: strings
  - skillWeights: { skill: weight, ... }  // team score = sum of both players’ weighted skills
*/

window.FR_DAILIES = [
  // --- Episode 1: Opening Purge (two bottom teams purged, winner also purges one more by worst relationship)
  {
    id: 'E1_OPENING_PURGE',
    episode: 1,
    type: 'purge',
    name: 'Opening Purge',
    description: 'Half the cast is buried underground in caskets in a graveyard, and their partners have to dig them out. The partners who are above ground have to use walkie-talkies and the voices of their below-ground partners are disguised, so the digging partner is not sure who their partner is until they are unburied. The buried teammate must instruct their teammate where they are located in the graveyard. The last two teams to dig their partner out are automatically eliminated, while the winning team has to eliminate one additional team.',
    skillWeights: { speed: 1.0, strength: 1.2, strategy: 0.8 },
  },

  // --- Episodes 2,4,6,8,10,11,13,14: Regular dailies (Power Team = top team)
  {
    id: 'E2_DAILY',
    episode: 2,
    type: 'daily',
    name: 'Wreck Yourself',
    description: 'The competitors teams are split into two roles: one being a Pusher, and one being the Swinger. The contestants are harnessed on top of a circular platform suspended in midair. The Pusher must push the Swinger off the platform for them to collect rings hanging in the middle of the platform, which they then must hand back to the Pusher. The team that collects the most rings in the shortest amount of time wins.',
    skillWeights: { strength: 1.2, balance: 1.0, teamwork: 1.0 },
  },
  {
    id: 'E4_DAILY',
    episode: 4,
    type: 'daily',
    name: 'Off The Rails',
    description: 'Teams must go in rounds finishing an obstacle course on top of a moving train. First, they must cross the balance beam, by using each other to balance and walk across the single beam. Next, they must walk across a tightrope each while balancing on each other, using lifelines to grab onto as well. If one teammate falls, they both lose. The team to successfully complete the obstacle course the fastest wins.',
    skillWeights: { balance: 1.4, speed: 1.0, climbing: 0.8 },
  },
  {
    id: 'E5_DAILY',
    episode: 5,
    type: 'daily',
    name: 'Dig Deep',
    description: 'The paired teams are separated into two large groups randomly. The two groups are then put into mine shafts, and must solve 3 puzzles before being able to dig themselves out and race to the finish line. The first paired team to finish within the large team that finishes first, wins.',
    skillWeights: { mental: 1.4, teamwork: 1.0 },
  },
  {
    id: 'E6_DAILY',
    episode: 6,
    type: 'daily',
    name: 'Dont Push Me Around',
    description: 'The paired teams are separated into two large teams and must play a game of rugby. The girls may only take girls and guys may only tackle guys on the opposing team. Players must retrieve the ball from their opponents end zone, and fight through an obstacle course in order to return it to their own end zone and score a point. The first team to score two points wins, and they then select the pair within the team that was the MVP.',
    skillWeights: { strength: 1.6, speed: 1.0, teamwork: 0.8 },
  },
  {
    id: 'E8_DAILY',
    episode: 8,
    type: 'daily',
    name: 'Sky Bridge',
    description: 'Teams are lifted into the sky via a giant crane. There is a partially completed bridge that they must complete and crawl over by passing rope from side to side and tying knots. The team to complete their bridge and make it to the other side fastest wins.',
    skillWeights: { balance: 1.0, climbing: 1.2, teamwork: 0.8 },
  },
  {
    id: 'E9_DAILY',
    episode: 9,
    type: 'daily',
    name: 'Caged In',
    description: 'One player will be inside of a cage and the other on the outside. When TJ says go, the players who are outside of the cage must run to a tree line, pick up a tool, and cut down branches. Players will bring the branches back and throw the branches inside the cage. The person inside the cage must use twine and the branches to make a makeshift pole tall enough to reach the keys to the cage. Once unlocked, the teams must run across a field and solve a puzzle. The first team that solves the puzzle wins.',
    skillWeights: { mental: 1.0, speed: 1.0, teamwork: 1.2, strategy: 0.8 },
  },
  {
    id: 'E10_DAILY',
    episode: 10,
    type: 'daily',
    name: 'What Goes Up, Must Come Down',
    description: 'Teams must race up flights of stairs to the roof of a 200-foot tower. At the top, one member will be suspended on the side of the tower and look down at the answer key to a puzzle. They must communicate to their partner how to assemble the puzzle. Once the puzzle has been correctly assembled, both players must repel down the tower to the ground. The team with the fastest time wins.',
    skillWeights: { mental: 1.0, speed: 1.2, teamwork: 1.4 },
  },
  {
    id: 'E11_DAILY',
    episode: 11,
    type: 'daily',
    name: 'Hit List',
    description: 'Teams begin on the edge of a plank suspended above water. One at a time, teams are asked a trivia question regarding The Challenge trilogy. If they answer correctly, they can assign a strike to another team while answering incorrectly earns their own team a strike. Once a team earns three strikes, a battering ram knock them into the water. The last team remaining wins.',
    skillWeights: { mental: 1.6 },
  },
  {
    id: 'E13_DAILY',
    episode: 13,
    type: 'daily',
    name: 'Rolling Thunder',
    description: 'Each team has a giant boulder which they must roll to the finish line. Halfway through the course, there is a ditch where teams have two routes they can choose from. The first team to reach the finish line wins.',
    skillWeights: { strength: 1.4, speed: 1.0, teamwork: 0.8 },
  },
  {
    id: 'E14_DAILY',
    episode: 14,
    type: 'daily',
    name: 'Painfully Wrong',
    description: 'All teams begin at the start of five zones, in between each zone is a 7000-volt copper curtain. One at a time, teams are asked a trivia question. If they answer correctly, they can force another team to advance through the copper curtain to the next zone. Once a team reaches the fifth and final zone, they are out of the challenge. The last team remaining wins.',
    skillWeights: { endurance: 0.8, mental: 1.4 },
  },

  // --- Episodes 3 & 7: Redemption + Purge episode (this is the mid‑episode purge)
  {
    id: 'E3_PURGE',
    episode: 3,
    type: 'purge',
    name: 'Shark Bait',
    description: 'This is a purge challenge where large replicas of steaks with climbing holds, and ropes, are hung over water about 40 feet. Teams must jump from the platform onto the steaks, and from the steaks to ropes, alternating until they get to the other side of the platform. If one of the teammates falls, they are both disqualified and their score only counts how far they made it. The team that gets both members to the other side the fastest wins, and the team that falls soonest is sent to Redemption.',
    skillWeights: { speed: 1.0, climbing: 1.4, balance: 1.0 },
  },
  {
    id: 'E7_PURGE',
    episode: 7,
    type: 'purge',
    name: 'Dunking for Dinner',
    description: 'This challenge is played in two phases. The first phase, one member of the team must be dunked into water by a crane with their arms tied, while the other player controls the crane. Players must move disks from one circle to the other in an allotted amount of time. The number of disks transferred corresponds to the number of dishes the team is allowed to eat. In the second phase, the player that controlled the crane now must eat as many dishes as possible. The team that eats the most dishes in 15 minutes wins, while the team that eats the least is purged straight to Redemption.',
    skillWeights: { swimming: 1.2, eating: 1.0, teamwork: 0.8 },
  },

  // --- Episode 12: Double Redemption + Purge (no RH after this episode)
  {
    id: 'E12_PURGE',
    episode: 12,
    type: 'purge',
    name: 'Heads Will Roll',
    description: 'Teams begin on opposite platforms above ground. In between the two platforms is a rotating log which players must run over while carrying a flag to transfer the flag to their teammate. The team with the most flags transferred wins, while the team that transfers the least flags is purged straight to Redemption. In the event that multiple teams are unable to collect flags, the losing team is determined based on distance travelled across the log.',
    skillWeights: { balance: 1.4, speed: 1.0, teamwork: 0.8 }
  }
];