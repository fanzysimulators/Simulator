/* Battle of the Seasons — Eliminations
   One elimination per episode (1–11). */

window.BOTS_ELIMINATION_DATA = [
  {
    episode: 1,
    name: "Hall Brawl (Physical)",
    description: "Played in same-gender heat time trial tests, players must run through a narrow hallway past another contestant to ring a bell. The players who ring the bell first in the best two out of three heat time trial tests, wins the elimination.",
    skillWeights: { strength: 1, speed: 1.2, endurance: 0.4 },
    comments: {
      positive: [
"{A} explodes off the line and charges through the hallway with unstoppable momentum",
"{A} slips past their opponent with perfect timing and smacks the bell cleanly",
"{A} stays laser-focused and outruns their opponent with flawless footwork",
"{A} accelerates on the final burst and hits the bell before anyone even reacts",
"{A} keeps their balance through contact and powers ahead to win the heat",
"{A} reads the spacing perfectly and makes a clean dash straight to the bell"
      ],
      neutral: [
"{A} jogs into the hallway with measured steps, trying to find the right rhythm",
"{A} bumps shoulders slightly but keeps moving without picking up speed",
"{A} takes a cautious approach, waiting for the perfect moment to push forward",
"{A} maintains a steady pace without fully committing to the sprint",
"{A} resets footing midway through the hallway before continuing",
"{A} reaches the bell at a moderate pace, neither dominating nor falling behind"
      ],
      negative: [
"{A} hesitates at the start and gives their opponent a clear opening",
"{A} gets caught in the hallway and can’t break free in time to reach the bell",
"{A} slips during the run and completely loses momentum",
"{A} mistimes the sprint and never recovers before the bell is hit",
"{A} crashes into the wall and stumbles while their opponent races past",
"{A} takes too long reacting to the signal and falls behind instantly"
      ]
    }
  },

  {
    episode: 2,
    name: "Balls Out (Endurance)",
    description: "Players have to slide 25 silver balls over a wall towards their opponents side of the field. The players with the fewest balls on their field wins the elimination.",
    skillWeights: { endurance: 1.5, speed: 0.8, strategy: 0.8 },
    comments: {
      positive: [
"{A} fires ball after ball over the wall with perfect aim",
"{A} keeps a fast rhythm, clearing their side with impressive speed",
"{A} launches each ball smoothly, barely breaking a sweat",
"{A} adjusts stance and sends the balls soaring far past the wall",
"{A} maintains laser focus, piling all 25 balls onto the opponent’s side",
"{A} finishes strong, sliding the final ball with flawless accuracy"
      ],
      neutral: [
"{A} takes a steady pace, pushing each ball over the wall one by one",
"{A} pauses occasionally to reset before sliding the next ball",
"{A} keeps their form consistent, sending balls over without much flair",
"{A} stays calm even as the balls bounce unpredictably",
"{A} rolls balls cautiously, making sure each one clears the wall",
"{A} watches the ball trajectory carefully before sending the next one"
      ],
      negative: [
"{A} struggles to get the balls fully over the wall, leaving several short",
"{A} misfires repeatedly, sending balls bouncing back onto their own side",
"{A} loses grip and fumbles multiple balls before even sliding them",
"{A} tires quickly and sends the balls rolling weakly toward the wall",
"{A} panics as the balls pile up on their side instead of the opponent’s",
"{A} wastes time readjusting after every slide, falling far behind"
      ]
    }
  },
  {
    episode: 3,
    name: "Knot So Fast (Strategy)",
    description: "Another style of elimination goes here.",
    skillWeights: { endurance: 1, speed: 1.5, strategy: 2 },
    comments: {
      positive: [
"{A} ties knots with fast, precise movements that look almost automatic",
"{A} unties the toughest knots with calm focus and steady hands",
"{A} keeps a perfect rhythm from tying to untying, never losing momentum",
"{A} spots the weakest points in the knots instantly and pulls them apart with ease",
"{A} powers through the knot cluster with impressive accuracy",
"{A} moves strategically, saving the trickiest knots for last and clearing them flawlessly"
      ],
      neutral: [
"{A} ties knots at a steady pace, keeping things organized but not rushed",
"{A} examines each knot carefully before deciding where to pull",
"{A} shifts between knots methodically, staying composed through the challenge",
"{A} maintains moderate speed while trying to keep track of each rope section",
"{A} works through knots one at a time with patient, measured effort",
"{A} pauses occasionally to reassess their progress before continuing"
      ],
      negative: [
"{A} struggles to form tight knots and wastes precious time",
"{A} gets stuck on a single difficult knot and loses their momentum",
"{A} misjudges the rope layout and unties the wrong sections first",
"{A} fumbles repeatedly while trying to loosen simple knots",
"{A} grows visibly frustrated as the knots refuse to budge",
"{A} loses track of their opponent’s progress and panics while untying"
      ]
    }
  },
  {
    episode: 4,
    name: "Water Torture (Mental)",
    description: "The guys are hanging from a rope system connected to their female partner by their ankles. The object is for the guys to submerge themselves into a water tank and hold their breath for as long as possible, which pulls the girls up the rope allowing them to solve a memory game. The first team to complete their puzzle wins the elimination.",
    skillWeights: { swimming: 1, mental: 2, teamwork: 1.2 },
    comments: {
      positive: [
"{A} submerges smoothly, pulling the rope with perfect control and lifting their partner fast",
"{A} holds their breath impressively long, giving their teammate plenty of time to work the puzzle",
"{A} sinks into the tank with confidence, powering their partner upward immediately",
"{A} maintains a steady hold underwater, keeping the rope tight and stable",
"{A} times their breaths perfectly, maximizing every second their partner spends on the puzzle",
"{A} stays composed under the water, giving their teammate the exact boost they need"
      ],
      neutral: [
"{A} eases into the tank, adjusting to the water before committing fully",
"{A} pulls the rope at a consistent pace, neither rushing nor slowing",
"{A} resurfaces for air and quickly resets before going under again",
"{A} steadies the rope while their partner studies the puzzle pieces",
"{A} takes a moment to get comfortable before going for a deeper dive",
"{A} gives a moderate pull on the rope, keeping their partner lifted just enough"
      ],
      negative: [
"{A} struggles to stay underwater, popping up too early for air",
"{A} barely pulls the rope, leaving their partner hanging just short of the puzzle",
"{A} kicks awkwardly in the tank, throwing off the team’s rhythm",
"{A} loses grip on the rope tension, causing their partner to drop suddenly",
"{A} panics underwater and surfaces sooner than expected",
"{A} fails to get a deep enough submersion, giving their partner little time to solve anything"
      ]
    }
  },
  {
    episode: 5,
    name: "Balls Out (Endurance)",
    description: "Players have to slide 25 silver balls over a wall towards their opponents side of the field. The players with the fewest balls on their field wins the elimination.",
    skillWeights: { endurance: 1.5, speed: 0.8, strategy: 0.8 },
    comments: {
      positive: [
"{A} fires ball after ball over the wall with perfect aim",
"{A} keeps a fast rhythm, clearing their side with impressive speed",
"{A} launches each ball smoothly, barely breaking a sweat",
"{A} adjusts stance and sends the balls soaring far past the wall",
"{A} maintains laser focus, piling all 25 balls onto the opponent’s side",
"{A} finishes strong, sliding the final ball with flawless accuracy"
      ],
      neutral: [
"{A} takes a steady pace, pushing each ball over the wall one by one",
"{A} pauses occasionally to reset before sliding the next ball",
"{A} keeps their form consistent, sending balls over without much flair",
"{A} stays calm even as the balls bounce unpredictably",
"{A} rolls balls cautiously, making sure each one clears the wall",
"{A} watches the ball trajectory carefully before sending the next one"
      ],
      negative: [
"{A} struggles to get the balls fully over the wall, leaving several short",
"{A} misfires repeatedly, sending balls bouncing back onto their own side",
"{A} loses grip and fumbles multiple balls before even sliding them",
"{A} tires quickly and sends the balls rolling weakly toward the wall",
"{A} panics as the balls pile up on their side instead of the opponent’s",
"{A} wastes time readjusting after every slide, falling far behind"
      ]
    }
  },
  {
    episode: 6,
    name: "Knot So Fast (Strategy)",
    description: "Another style of elimination goes here.",
    skillWeights: { endurance: 1, speed: 1.5, strategy: 2 },
    comments: {
      positive: [
"{A} ties knots with fast, precise movements that look almost automatic",
"{A} unties the toughest knots with calm focus and steady hands",
"{A} keeps a perfect rhythm from tying to untying, never losing momentum",
"{A} spots the weakest points in the knots instantly and pulls them apart with ease",
"{A} powers through the knot cluster with impressive accuracy",
"{A} moves strategically, saving the trickiest knots for last and clearing them flawlessly"
      ],
      neutral: [
"{A} ties knots at a steady pace, keeping things organized but not rushed",
"{A} examines each knot carefully before deciding where to pull",
"{A} shifts between knots methodically, staying composed through the challenge",
"{A} maintains moderate speed while trying to keep track of each rope section",
"{A} works through knots one at a time with patient, measured effort",
"{A} pauses occasionally to reassess their progress before continuing"
      ],
      negative: [
"{A} struggles to form tight knots and wastes precious time",
"{A} gets stuck on a single difficult knot and loses their momentum",
"{A} misjudges the rope layout and unties the wrong sections first",
"{A} fumbles repeatedly while trying to loosen simple knots",
"{A} grows visibly frustrated as the knots refuse to budge",
"{A} loses track of their opponent’s progress and panics while untying"
      ]
    }
  },
  {
    episode: 7,
    name: "Water Torture (Mental)",
    description: "The guys are hanging from a rope system connected to their female partner by their ankles. The object is for the guys to submerge themselves into a water tank and hold their breath for as long as possible, which pulls the girls up the rope allowing them to solve a memory game. The first team to complete their puzzle wins the elimination.",
    skillWeights: { swimming: 1, mental: 2, teamwork: 1.2 },
    comments: {
      positive: [
"{A} submerges smoothly, pulling the rope with perfect control and lifting their partner fast",
"{A} holds their breath impressively long, giving their teammate plenty of time to work the puzzle",
"{A} sinks into the tank with confidence, powering their partner upward immediately",
"{A} maintains a steady hold underwater, keeping the rope tight and stable",
"{A} times their breaths perfectly, maximizing every second their partner spends on the puzzle",
"{A} stays composed under the water, giving their teammate the exact boost they need"
      ],
      neutral: [
"{A} eases into the tank, adjusting to the water before committing fully",
"{A} pulls the rope at a consistent pace, neither rushing nor slowing",
"{A} resurfaces for air and quickly resets before going under again",
"{A} steadies the rope while their partner studies the puzzle pieces",
"{A} takes a moment to get comfortable before going for a deeper dive",
"{A} gives a moderate pull on the rope, keeping their partner lifted just enough"
      ],
      negative: [
"{A} struggles to stay underwater, popping up too early for air",
"{A} barely pulls the rope, leaving their partner hanging just short of the puzzle",
"{A} kicks awkwardly in the tank, throwing off the team’s rhythm",
"{A} loses grip on the rope tension, causing their partner to drop suddenly",
"{A} panics underwater and surfaces sooner than expected",
"{A} fails to get a deep enough submersion, giving their partner little time to solve anything"
      ]
    }
  },
  {
    episode: 8,
    name: "Hall Brawl (Physical)",
    description: "Played in same-gender heat time trial tests, players must run through a narrow hallway past another contestant to ring a bell. The players who ring the bell first in the best two out of three heat time trial tests, wins the elimination.",
    skillWeights: { strength: 1, speed: 1.2, endurance: 0.4 },
    comments: {
      positive: [
"{A} explodes off the line and charges through the hallway with unstoppable momentum",
"{A} slips past their opponent with perfect timing and smacks the bell cleanly",
"{A} stays laser-focused and outruns their opponent with flawless footwork",
"{A} accelerates on the final burst and hits the bell before anyone even reacts",
"{A} keeps their balance through contact and powers ahead to win the heat",
"{A} reads the spacing perfectly and makes a clean dash straight to the bell"
      ],
      neutral: [
"{A} jogs into the hallway with measured steps, trying to find the right rhythm",
"{A} bumps shoulders slightly but keeps moving without picking up speed",
"{A} takes a cautious approach, waiting for the perfect moment to push forward",
"{A} maintains a steady pace without fully committing to the sprint",
"{A} resets footing midway through the hallway before continuing",
"{A} reaches the bell at a moderate pace, neither dominating nor falling behind"
      ],
      negative: [
"{A} hesitates at the start and gives their opponent a clear opening",
"{A} gets caught in the hallway and can’t break free in time to reach the bell",
"{A} slips during the run and completely loses momentum",
"{A} mistimes the sprint and never recovers before the bell is hit",
"{A} crashes into the wall and stumbles while their opponent races past",
"{A} takes too long reacting to the signal and falls behind instantly"
      ]
    }
  },
  {
    episode: 9,
    name: "Balls Out (Endurance)",
    description: "Players have to slide 25 silver balls over a wall towards their opponents side of the field. The players with the fewest balls on their field wins the elimination.",
    skillWeights: { endurance: 1.5, speed: 0.8, strategy: 0.8 },
    comments: {
      positive: [
"{A} fires ball after ball over the wall with perfect aim",
"{A} keeps a fast rhythm, clearing their side with impressive speed",
"{A} launches each ball smoothly, barely breaking a sweat",
"{A} adjusts stance and sends the balls soaring far past the wall",
"{A} maintains laser focus, piling all 25 balls onto the opponent’s side",
"{A} finishes strong, sliding the final ball with flawless accuracy"
      ],
      neutral: [
"{A} takes a steady pace, pushing each ball over the wall one by one",
"{A} pauses occasionally to reset before sliding the next ball",
"{A} keeps their form consistent, sending balls over without much flair",
"{A} stays calm even as the balls bounce unpredictably",
"{A} rolls balls cautiously, making sure each one clears the wall",
"{A} watches the ball trajectory carefully before sending the next one"
      ],
      negative: [
"{A} struggles to get the balls fully over the wall, leaving several short",
"{A} misfires repeatedly, sending balls bouncing back onto their own side",
"{A} loses grip and fumbles multiple balls before even sliding them",
"{A} tires quickly and sends the balls rolling weakly toward the wall",
"{A} panics as the balls pile up on their side instead of the opponent’s",
"{A} wastes time readjusting after every slide, falling far behind"
      ]
    }
  },
  {
    episode: 10,
    name: "Water Torture (Mental)",
    description: "The guys are hanging from a rope system connected to their female partner by their ankles. The object is for the guys to submerge themselves into a water tank and hold their breath for as long as possible, which pulls the girls up the rope allowing them to solve a memory game. The first team to complete their puzzle wins the elimination.",
    skillWeights: { swimming: 1, mental: 2, teamwork: 1.2 },
    comments: {
      positive: [
"{A} submerges smoothly, pulling the rope with perfect control and lifting their partner fast",
"{A} holds their breath impressively long, giving their teammate plenty of time to work the puzzle",
"{A} sinks into the tank with confidence, powering their partner upward immediately",
"{A} maintains a steady hold underwater, keeping the rope tight and stable",
"{A} times their breaths perfectly, maximizing every second their partner spends on the puzzle",
"{A} stays composed under the water, giving their teammate the exact boost they need"
      ],
      neutral: [
"{A} eases into the tank, adjusting to the water before committing fully",
"{A} pulls the rope at a consistent pace, neither rushing nor slowing",
"{A} resurfaces for air and quickly resets before going under again",
"{A} steadies the rope while their partner studies the puzzle pieces",
"{A} takes a moment to get comfortable before going for a deeper dive",
"{A} gives a moderate pull on the rope, keeping their partner lifted just enough"
      ],
      negative: [
"{A} struggles to stay underwater, popping up too early for air",
"{A} barely pulls the rope, leaving their partner hanging just short of the puzzle",
"{A} kicks awkwardly in the tank, throwing off the team’s rhythm",
"{A} loses grip on the rope tension, causing their partner to drop suddenly",
"{A} panics underwater and surfaces sooner than expected",
"{A} fails to get a deep enough submersion, giving their partner little time to solve anything"
      ]
    }
  },
  {
    episode: 11,
    name: "Knot So Fast (Strategy)",
    description: "Another style of elimination goes here.",
    skillWeights: { endurance: 1, speed: 1.5, strategy: 2 },
    comments: {
      positive: [
"{A} ties knots with fast, precise movements that look almost automatic",
"{A} unties the toughest knots with calm focus and steady hands",
"{A} keeps a perfect rhythm from tying to untying, never losing momentum",
"{A} spots the weakest points in the knots instantly and pulls them apart with ease",
"{A} powers through the knot cluster with impressive accuracy",
"{A} moves strategically, saving the trickiest knots for last and clearing them flawlessly"
      ],
      neutral: [
"{A} ties knots at a steady pace, keeping things organized but not rushed",
"{A} examines each knot carefully before deciding where to pull",
"{A} shifts between knots methodically, staying composed through the challenge",
"{A} maintains moderate speed while trying to keep track of each rope section",
"{A} works through knots one at a time with patient, measured effort",
"{A} pauses occasionally to reassess their progress before continuing"
      ],
      negative: [
"{A} struggles to form tight knots and wastes precious time",
"{A} gets stuck on a single difficult knot and loses their momentum",
"{A} misjudges the rope layout and unties the wrong sections first",
"{A} fumbles repeatedly while trying to loosen simple knots",
"{A} grows visibly frustrated as the knots refuse to budge",
"{A} loses track of their opponent’s progress and panics while untying"
      ]
    }
  }

  // Add episodes 3–11 in the same format
];
