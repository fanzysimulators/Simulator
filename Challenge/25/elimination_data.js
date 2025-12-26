// =========================================
// The Challenge: Free Agents — Eliminations (formatted from elimination_data.js)
// =========================================

/*
Shape notes (per entry):
- episode:       number (1..11)
- id:            stable string id
- name:          string             // kept EXACTLY as provided
- description:   string             // kept EXACTLY as provided
- skillWeights:  { [skill: string]: number } // derived from "skills" (each => 1)
*/

window.FA_ELIMINATION_DATA = [
  {
    episode: 1,
    id: "fa_elim_ep1",
    name: "Balls In",
    description: `Each player is given five chances to get as many balls inside a barrel located in the middle of a large circle. If a player is either knocked out of or steps out of the ring, or if the ball is knocked out of the ring, their ball is considered "dead". Players alternate between offense and defense in each round. The player who has more baskets than their opponent after five rounds wins the elimination round.`,
    skillWeights: { strength: 1, speed: 1, balance: 1 }
  },
  {
    episode: 2,
    id: "fa_elim_ep2",
    name: "Wrecking Wall",
    description: `Each player must punch through a 30-foot drywall to make holes they can climb until they reach a bell. The first player to ring the bell wins the elimination round.`,
    skillWeights: { strength: 1, climbing: 1 }
  },
  {
    episode: 3,
    id: "fa_elim_ep3",
    name: "Looper",
    description: `Each player has a rope hooked to their back and has to run around two posts to reach a bell. The first player to ring the bell wins the elimination round. In later versions, a rope was added to each post, allowing competitors to use it to make pulling their opponent easier.`,
    skillWeights: { strength: 1, endurance: 1 }
  },
  {
    episode: 4,
    id: "fa_elim_ep4",
    name: "Oppenheimer",
    description: `Each player must run across a caged circular hallway and get past the other player to ring a bell. The first player to ring the bell twice wins the elimination round.`,
    skillWeights: { speed: 1, endurance: 1 }
  },
  {
    episode: 5,
    id: "fa_elim_ep5",
    name: "Balls In",
    description: `Each player is given five chances to get as many balls inside a barrel located in the middle of a large circle. If a player is either knocked out of or steps out of the ring, or if the ball is knocked out of the ring, their ball is considered "dead". Players alternate between offense and defense in each round. The player who has more baskets than their opponent after five rounds wins the elimination round.`,
    skillWeights: { strength: 1, speed: 1, balance: 1 }
  },
  {
    episode: 6,
    id: "fa_elim_ep6",
    name: "Wrecking Wall",
    description: `Each player must punch through a 30-foot drywall to make holes they can climb until they reach a bell. The first player to ring the bell wins the elimination round.`,
    skillWeights: { strength: 1, climbing: 1 }
  },
  {
    episode: 7,
    id: "fa_elim_ep7",
    name: "Looper",
    description: `Each player has a rope hooked to their back and has to run around two posts to reach a bell. The first player to ring the bell wins the elimination round. In later versions, a rope was added to each post, allowing competitors to use it to make pulling their opponent easier.`,
    skillWeights: { strength: 1, endurance: 1 }
  },
  {
    episode: 8,
    id: "fa_elim_ep8",
    name: "Oppenheimer",
    description: `Each player must run across a caged circular hallway and get past the other player to ring a bell. The first player to ring the bell twice wins the elimination round.`,
    skillWeights: { speed: 1, endurance: 1 }
  },
  {
    episode: 9,
    id: "fa_elim_ep9",
    name: "Balls In",
    description: `Each player is given five chances to get as many balls inside a barrel located in the middle of a large circle. If a player is either knocked out of or steps out of the ring, or if the ball is knocked out of the ring, their ball is considered "dead". Players alternate between offense and defense in each round. The player who has more baskets than their opponent after five rounds wins the elimination round.`,
    skillWeights: { strength: 1, speed: 1, balance: 1 }
  },
  {
    episode: 10,
    id: "fa_elim_ep10",
    name: "Wrecking Wall",
    description: `Each player must punch through a 30-foot drywall to make holes they can climb until they reach a bell. The first player to ring the bell wins the elimination round.`,
    skillWeights: { strength: 1, climbing: 1 }
  },
  {
    episode: 11,
    id: "fa_elim_ep11",
    name: "Puzzle Pyramid",
    description: `Each player has three puzzles to solve. After solving one puzzle, they step up onto a podium until they reach the final puzzle. The first person to complete all three puzzles and ring the bell wins.
• Puzzle #1 (In Shape): Fit all the provided pieces of a tangram puzzle in the provided shape.
• Puzzle #2 (All Lined Up): Arrange puzzle pieces so that a complete and unbroken line is formed.
• Puzzle #3 (It All Adds Up): Arrange numbered blocks so the sum of each row, column, and diagonal equals 15.`,
    skillWeights: { mental: 1 }
  }
];
