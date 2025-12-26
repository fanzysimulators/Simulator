// hov_daily_data.js
// Battle Royale challenge data for "House of Villains"

window.hov_daily_data = [
  // =======================
  // EPISODE 1 – Battle Royale
  // =======================
  {
    id: 1,
    episode: 1,
    name: "Balls Out",
    description: "Each contestant has a giant ball with their face on it in an arena. They must attempt to push their opponent's balls out of the arena while preventing their own ball from being pushed out. The last contestant to have their ball remain in the arena wins.",
    skillWeights: { strength: 1, strategy: 1.5, connivance: 2 },
    comments: {
      // Used for high-scoring villains in this challenge
      positive: [
"{A} drives their ball forward with power, quickly forcing an opponent’s ball toward the edge.",
"{A} uses perfect footwork to shield their own ball while applying pressure on others.",
"{A} redirects an incoming push smoothly, sending the opposing ball off balance.",
"{A} times a strong surge and knocks a rival’s ball clean out of the arena.",
"{A} controls the arena confidently, keeping their ball centered and untouchable."
      ],
      // Used for middle-of-the-pack villains
      neutral: [
"{A} keeps their ball steady, watching opponents closely before making a move.",
"{A} circles around the arena, looking for the safest angle to push.",
"{A} holds position for a moment, letting other contestants weaken each other.",
"{A} nudges their ball into a safer spot as the arena becomes more crowded.",
"{A} makes small, careful pushes to maintain balance and avoid risky confrontations."
      ],
      // Used for low-scoring villains
      negative: [
"{A} gets caught between two opponents and struggles to keep their ball in bounds.",
"{A} misjudges the angle and accidentally rolls their ball toward the edge.",
"{A} pushes too softly and fails to stop an opponent’s advance.",
"{A} slips while defending, leaving their ball exposed to a hard hit.",
"{A} loses control under pressure and watches their ball roll out of the arena."
      ]
    }
  },

  // =======================
  // EPISODE 2 – Battle Royale
  // =======================
  {
    id: 2,
    episode: 2,
    name: "Two Faced",
    description: "Wearing a mask and costume, and fitted with voice changers, contestants attend a masquerade party along with several masked extras. During the party, contestants attempt to identify other contestants while attempting to conceal their own identity. The contestant who correctly identifies most of their fellow contestants wins.",
    skillWeights: { strategy: 1, mental: 1, social: 2 },
    comments: {
      positive: [
"{A} blends into the crowd flawlessly, observing every movement without giving themselves away.",
"{A} picks up subtle cues instantly, identifying another contestant with sharp intuition.",
"{A} navigates the masquerade with confidence, deciphering voices and gestures with ease.",
"{A} maintains perfect disguise, interacting naturally without revealing a hint of identity.",
"{A} strings together accurate guesses rapidly, outsmarting the others with clever deduction."
],
      neutral: [
"{A} drifts through the party slowly, studying masked faces before making a move.",
"{A} listens closely to distorted voices, trying to match patterns to familiar tones.",
"{A} hesitates before approaching a masked guest, weighing whether it’s a contestant or an extra.",
"{A} makes a safe guess, neither gaining nor losing momentum in the rankings.",
"{A} stays near the edge of the room, quietly assessing the group before committing to an identity."
],
      negative: [
"{A} guesses too quickly and misidentifies an extra as a contestant.",
"{A} gets flustered when questioned and reveals subtle clues about their own identity.",
"{A} follows a hunch that leads them completely off track.",
"{A} fails to mask their mannerisms, drawing suspicious attention.",
"{A} misses obvious tells from another contestant, losing critical points."
]
    }
  },

  // =======================
  // EPISODE 3 – Battle Royale
  // =======================
  {
    id: 3,
    episode: 3,
    name: "Cold and Calculated",
    description: "Each contestant starts with a chest latched with three locks. Throughout the challenge, they must break through ice cubes to obtain either a lock or key frozen inside each cube. If they find a key, they can unlock one of their locks. If they find a lock, they can add it to an opponent's chest to slow them down. The first contestant to unlock all of their locks and open their chest wins.",
    skillWeights: { strength: 0.8, speed: 1, strategy: 1, connivance: 1 },
    comments: {
      positive: [
"{A} smashes through the ice with precision, breaking cubes open in seconds.",
"{A} pulls out a key cleanly and unlocks their chest without hesitation.",
"{A} uses a perfect strategy, adding extra locks to an opponent at just the right moment.",
"{A} keeps a blazing pace, ripping through cubes faster than anyone else.",
"{A} unlocks their final latch with a confident snap, surging ahead toward victory."
],
      neutral: [
"{A} chips away at a cube steadily, taking time to expose what’s inside.",
"{A} checks each ice block carefully, feeling for the shape of a key or lock.",
"{A} pauses briefly to decide whether to keep breaking cubes or sabotage an opponent.",
"{A} wipes ice from their hands before returning to the next block.",
"{A} swaps cubes methodically, maintaining a consistent search rhythm."
],
      negative: [
"{A} struggles to break through a dense block, losing valuable time.",
"{A} uncovers a lock when they desperately needed a key, growing frustrated.",
"{A} fumbles with a key at the chest, dropping it before finally getting it in.",
"{A} wastes time attacking multiple cubes without checking their contents.",
"{A} misplaces a lock onto the wrong opponent, failing to slow down the real threat."
]
    }
  },

  // =======================
  // EPISODE 4 – Battle Royale
  // =======================
  {
    id: 4,
    episode: 4,
    name: "Power Trip",
    description: "One contestant is randomly chosen to be handcuffed to a briefcase, and must choose another contestant to be handcuffed to the briefcase in their place, with this selection process continuing until only one contestant has not been selected. The last contestant to remain unselected wins the contents of the case, which was revealed as the power to elect another contestant to become the Supervillain of the Week.",
    skillWeights: { social: 1, connivance: 0.5 },
    comments: {
      positive: [],
      neutral: [],
      negative: []
    }
  },

  // =======================
  // EPISODE 5 – Battle Royale
  // =======================
  {
    id: 5,
    episode: 5,
    name: "Blow by Blow",
    description: "Contestants use a leaf blower to blow balls of their assigned color into holes worth varying points around the backyard. Inside the house is also a Frozen Up (FU) hole; if a contestant has one of their balls blown into this hole, they cannot participate for the remainder of the challenge. The contestant with the most points at the end of 15 minutes wins.",
    skillWeights: { speed: 1 },
    comments: {
      positive: [
"{A} angles the leaf blower perfectly, guiding their colored ball straight into a high-value hole.",
"{A} adjusts power smoothly, sending multiple balls rolling exactly where they need to go.",
"{A} controls the airflow with expert precision, scoring consistently with every attempt.",
"{A} stays laser-focused, chaining together high-point shots one after another.",
"{A} maneuvers around the yard confidently, maximizing points without wasting a second."
],
      neutral: [
"{A} tests the air flow before committing to a full push toward a scoring hole.",
"{A} tracks their ball carefully, adjusting distance to keep control over the direction.",
"{A} repositions slowly, watching for open scoring opportunities.",
"{A} nudges a ball toward a medium-value hole, maintaining steady pace.",
"{A} avoids the FU hole cautiously, steering shots away from risky angles."
],
      negative: [
"{A} misjudges the airflow and sends their ball drifting too far off target.",
"{A} accidentally pushes a ball toward the FU hole and panics to redirect it.",
"{A} loses control of the blower, scattering balls away from scoring zones.",
"{A} wastes time chasing a runaway ball instead of taking a new shot.",
"{A} overpowers a shot and watches it skip past an easy scoring hole."
]
    }
  },

  // =======================
  // EPISODE 6 – FINAL Battle Royale
  // =======================
  {
    id: 6,
    episode: 6,
    name: "The Last Supper",
    description: "Contestants are presented with five dishes worth different dollar amounts: boiled egg ($10), spicy chicken wing ($20), red snapper eyeball ($30), bull testicles ($40) and lamb brain pie ($50). They must order $200 worth of food, to be prepared and served by Below Deck chef Ben Robinson, and fully consume their order in addition to one chocolate donut. The first contestant to consume their order wins and earns their spot in the final three. They will then nominate three villains to be on the Hit List, while the player that is not chosen will join them in the final three.",
    skillWeights: { eating: 1.5, strategy: 1, speed: 1.2 },
    comments: {
      positive: [
"{A} downs the boiled egg in one smooth bite, barely slowing before moving to the next dish.",
"{A} handles the spicy wing like a champ, clearing the bone clean in seconds.",
"{A} eats the snapper eyeball confidently, keeping perfect pace through the challenge.",
"{A} powers through the bull testicles without hesitation, staying well ahead of the pack.",
"{A} finishes the lamb brain pie and donut with impressive speed, pushing toward a clean win."
],
      neutral: [
"{A} plans their $200 order carefully before starting, choosing dishes they can manage.",
"{A} takes steady bites, pacing themselves to avoid burning out early.",
"{A} pauses briefly between dishes, breathing through the intensity of the flavors.",
"{A} clears the donut slowly but stays consistent with their overall pace.",
"{A} works methodically through each plate, showing control even without rushing."
],
      negative: [
"{A} struggles with the spice on the chicken wing, coughing and slowing down.",
"{A} hesitates before eating the eyeball, losing crucial seconds.",
"{A} nearly gags during the bull testicles, fighting to keep the bite down.",
"{A} chokes on the lamb brain pie texture and has to regroup before continuing.",
"{A} stalls at the donut, visibly sick and falling far behind the others."
]
    }
  }
];
