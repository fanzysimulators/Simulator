// The Duel II — Eliminations for Episodes 1–10
// Both genders use the SAME elimination spec each episode.
// Only include skills actually used per Duel.

window.D2_ELIMINATION_DATA = [
  // 1) The Elevator
  {
    id: "d2-elim-e01",
    episode: 1,
    name: "The Elevator",
    description:
      "The competitors are placed in two separate cages with a pulling chain inside. Each competitor must pull the chain that is inside of his/her cage, and with each pull, the opponent's cage is raised. The competitor whose cage reaches the top first loses.",
    skillWeights: {
      strength: 1.3,
      endurance: 1.2
    },
    comments: {
      positive: [
        "{A} keeps a relentless cadence and never slows.",
        "{A} out-pulls their opponent with raw power from the start.",
        "{A} breathes perfectly and holds a brutal tempo.",
        "{A} digs deep and turns fatigue into focus.",
        "{A} controls the chain with crisp, efficient pulls.",
        "{A} breaks their opponent's will with steady pressure.",
        "{A} paces early, then surges past their opponent.",
        "{A} shows elite grip and refuses to fade.",
        "{A} dominates the closing stretch with authority.",
        "{A} finishes strong while their opponent has nothing left."
      ],
      neutral: [
        "{A} starts even with their opponent and trades pulls.",
        "{A} keeps a steady rhythm without big bursts.",
        "{A} manages energy respectably throughout.",
        "{A} matches their opponent for most of the round.",
        "{A} settles into a safe, conservative cadence.",
        "{A} keeps form tidy but lacks a late kick.",
        "{A} hangs in the fight until the final seconds.",
        "{A} avoids mistakes but can’t create separation.",
        "{A} stays composed while the cages rise slowly.",
        "{A} finishes with a solid, workmanlike effort."
      ],
      negative: [
        "{A} gasses out early and loses momentum.",
        "{A} slips on grip and wastes crucial pulls.",
        "{A} never settles into a sustainable cadence.",
        "{A} panics when their opponent pulls ahead.",
        "{A} takes long rests and falls behind.",
        "{A} over-pulls early and crashes late.",
        "{A} can’t match their opponent's pace at any point.",
        "{A} lets frustration break their rhythm.",
        "{A} abandons form and the cage stalls.",
        "{A} fades completely as their opponent closes it out."
      ]
    }
  },

  // 2) Back Off
  {
    id: "d2-elim-e02",
    episode: 2,
    name: "Back Off",
    description:
      "Each competitor has a hook attached to his/her back. The challenger must take the hook off of the opponent's back and place it on a ring at the side of the arena. The first challenger to successfully hook his/her opponent's hook to the ring twice wins the challenge.",
    skillWeights: {
      strength: 1.2,
      strategy: 1.3
    },
    comments: {
      positive: [
        "{A} sets a smart trap and snatches their opponent's hook instantly.",
        "{A} out-muscles the clinch and peels the hook clean.",
        "{A} feints left, slips behind, and secures the point.",
        "{A} reads their opponent's movement and counters perfectly.",
        "{A} combines leverage and timing to control exchanges.",
        "{A} bullies their opponent to the edge and finishes with ease.",
        "{A} baits their opponent into overcommitting and capitalizes.",
        "{A} keeps wrists strong and denies every grip.",
        "{A} stays patient, then strikes for a clean score.",
        "{A} closes the duel 2–0 with ruthless precision."
      ],
      neutral: [
        "{A} and their opponent lock up with long stalemates.",
        "{A} plays cautiously, trading position with their opponent.",
        "{A} wins one exchange but gives one back.",
        "{A} circles, testing grips without overreaching.",
        "{A} adjusts tactics mid-round and stabilizes.",
        "{A} keeps a low base and avoids big risks.",
        "{A} nearly scores but loses control at the ring.",
        "{A} fights to a tie until the final exchange.",
        "{A} uses safe frames to survive their opponent's burst.",
        "{A} edges forward but can’t finish consistently."
      ],
      negative: [
        "{A} gets turned easily and loses the back.",
        "{A} reaches recklessly and gives up the hook.",
        "{A} can’t break their opponent's grips at any point.",
        "{A} gets dragged off balance and outworked.",
        "{A} wastes energy on fruitless clinches.",
        "{A} telegraphs every move and gets countered.",
        "{A} loses ring awareness and drops a free point.",
        "{A} lets frustration lead to sloppy grips.",
        "{A} stalls out and gives their opponent complete control.",
        "{A} falls 0–2 with no answer for their opponent's plan."
      ]
    }
  },

  // 3) Duel Pole Dancing
  {
    id: "d2-elim-e03",
    episode: 3,
    name: "Duel Pole Dancing",
    description:
      "A totem pole-like structure is located in the center of the arena. Around the outside of the pole are climbing holds for the competitors to use to make their ascent. The first competitor to reach the top of the pole and ring a bell wins the challenge.",
    skillWeights: {
      climbing: 1.4,
      strategy: 1.1,
      speed: 1.0
    },
    comments: {
      positive: [
        "{A} finds the best line and floats up the pole.",
        "{A} uses tiny footholds with flawless precision.",
        "{A} accelerates halfway and drops their opponent instantly.",
        "{A} plans clips ahead and never hesitates.",
        "{A} keeps hips close and wastes zero motion.",
        "{A} chalks up quickly and bursts to the bell.",
        "{A} switches sides mid-route for a perfect angle.",
        "{A} commits to dynamic moves and sticks every one.",
        "{A} rings the bell with a clinical top-out.",
        "{A} makes the climb look effortless."
      ],
      neutral: [
        "{A} climbs steadily while checking each hold.",
        "{A} pauses to reset feet and continues cleanly.",
        "{A} keeps three points of contact throughout.",
        "{A} takes a longer route but stays composed.",
        "{A} recovers after a slip and maintains pace.",
        "{A} avoids risk and opts for secure placements.",
        "{A} keeps breathing under control on the ascent.",
        "{A} watches their opponent briefly, then resumes calmly.",
        "{A} edges upward with measured, safe progress.",
        "{A} finishes with a respectable, methodical climb."
      ],
      negative: [
        "{A} overreaches and peels off early.",
        "{A} chooses a poor sequence and stalls out.",
        "{A} loses core tension and swings away.",
        "{A} misses a key crimp and slides down.",
        "{A} wastes time searching and panics.",
        "{A} cuts feet and never recovers balance.",
        "{A} pumps out and can’t continue.",
        "{A} slips near the top and gives it away.",
        "{A} hesitates, allowing their opponent to pass cleanly.",
        "{A} never finds a rhythm on the pole."
      ]
    }
  },

  // 4) Push Over
  {
    id: "d2-elim-e04",
    episode: 4,
    name: "Push Over",
    description:
      "There is a large wooden plank placed on the ground. This Duel is won by knocking a challenger off the plank twice.",
    skillWeights: {
      strength: 1.3,
      balance: 1.1
    },
    comments: {
      positive: [
        "{A} roots their stance and bulldozes their opponent off the plank.",
        "{A} absorbs contact and counters with power.",
        "{A} keeps center of gravity low and dominant.",
        "{A} times the shove perfectly for a clean point.",
        "{A} shrugs off their opponent's push and returns a harder one.",
        "{A} foot-fights to position and controls the space.",
        "{A} baits their opponent forward then redirects effortlessly.",
        "{A} clamps shoulders and marches their opponent backward.",
        "{A} wins hand position and finishes the round fast.",
        "{A} closes it 2–0 with commanding balance."
      ],
      neutral: [
        "{A} and their opponent trade shoves without movement.",
        "{A} resets stance after each clash.",
        "{A} keeps feet under hips and stays safe.",
        "{A} matches their opponent's strength in the center.",
        "{A} circles cautiously to avoid the edge.",
        "{A} chooses counters over risky drives.",
        "{A} loses ground briefly, then regains center.",
        "{A} locks up and forces a long stalemate.",
        "{A} edges the border but recovers in time.",
        "{A} splits the early points with their opponent."
      ],
      negative: [
        "{A} overextends and stumbles off the plank.",
        "{A} gets walked down with no resistance.",
        "{A} stands tall and loses leverage.",
        "{A} lets their opponent control the hand-fight easily.",
        "{A} panics at the edge and steps out.",
        "{A} slips on the reset and gives away a point.",
        "{A} can’t anchor feet and gets rag-dolled.",
        "{A} leans forward and gets redirected.",
        "{A} never adjusts to their opponent's power.",
        "{A} falls twice with minimal pushback."
      ]
    }
  },

  // 5) Spot On
  {
    id: "d2-elim-e05",
    episode: 5,
    name: "Spot On",
    description:
      "There are two rock-climbing walls, one for each challenger. There is a pattern that is designed on each wall. The pattern is not complete, though, and each challenger must use the pieces given to them in order to complete the pattern. The first challenger to complete the pattern wins.",
    skillWeights: {
      speed: 1.0,
      mental: 1.3,
      climbing: 1.1
    },
    comments: {
      positive: [
        "{A} reads the pattern instantly and commits.",
        "{A} locks holds with precision and free hands pieces fast.",
        "{A} keeps cool breath and moves with purpose.",
        "{A} sees the symmetry and never second-guesses.",
        "{A} sequences perfectly and flies up the wall.",
        "{A} adjusts a misfit piece in one motion.",
        "{A} tracks the layout while placing flawlessly.",
        "{A} outruns their opponent with sharp decisions.",
        "{A} taps the final piece and calls it clean.",
        "{A} solves with a textbook, efficient climb."
      ],
      neutral: [
        "{A} double-checks each piece before committing.",
        "{A} pauses to compare sides, then continues.",
        "{A} maintains steady movement with few risks.",
        "{A} chooses safe placements over speed.",
        "{A} backtracks once, then recovers composure.",
        "{A} mirrors the pattern cautiously.",
        "{A} resets a piece carefully and moves on.",
        "{A} keeps three points of contact while thinking.",
        "{A} avoids errors but lacks urgency.",
        "{A} finishes with a measured, tidy solve."
      ],
      negative: [
        "{A} misreads the pattern and stalls.",
        "{A} forces a wrong piece and has to redo.",
        "{A} overthinks and loses precious time.",
        "{A} slips on a hold and drops confidence.",
        "{A} confuses orientation and panics.",
        "{A} wastes time arguing with themselves.",
        "{A} ignores a mismatch and pays for it later.",
        "{A} rushes placements and causes a cascade of errors.",
        "{A} watches their opponent finish while still reworking the middle.",
        "{A} times out with the wall half-correct."
      ]
    }
  },

  // 6) The Elevator (repeat)
  {
    id: "d2-elim-e06",
    episode: 6,
    name: "The Elevator",
    description:
      "The competitors are placed in two separate cages with a pulling chain inside. Each competitor must pull the chain that is inside of his/her cage, and with each pull, the opponent's cage is raised. The competitor whose cage reaches the top first loses.",
    skillWeights: {
      strength: 1.3,
      endurance: 1.2
    },
    comments: {
      positive: [
        "{A} keeps a relentless cadence and never slows.",
        "{A} out-pulls their opponent with raw power from the start.",
        "{A} breathes perfectly and holds a brutal tempo.",
        "{A} digs deep and turns fatigue into focus.",
        "{A} controls the chain with crisp, efficient pulls.",
        "{A} breaks their opponent's will with steady pressure.",
        "{A} paces early, then surges past their opponent.",
        "{A} shows elite grip and refuses to fade.",
        "{A} dominates the closing stretch with authority.",
        "{A} finishes strong while their opponent has nothing left."
      ],
      neutral: [
        "{A} starts even with their opponent and trades pulls.",
        "{A} keeps a steady rhythm without big bursts.",
        "{A} manages energy respectably throughout.",
        "{A} matches their opponent for most of the round.",
        "{A} settles into a safe, conservative cadence.",
        "{A} keeps form tidy but lacks a late kick.",
        "{A} hangs in the fight until the final seconds.",
        "{A} avoids mistakes but can’t create separation.",
        "{A} stays composed while the cages rise slowly.",
        "{A} finishes with a solid, workmanlike effort."
      ],
      negative: [
        "{A} gasses out early and loses momentum.",
        "{A} slips on grip and wastes crucial pulls.",
        "{A} never settles into a sustainable cadence.",
        "{A} panics when their opponent pulls ahead.",
        "{A} takes long rests and falls behind.",
        "{A} over-pulls early and crashes late.",
        "{A} can’t match their opponent's pace at any point.",
        "{A} lets frustration break their rhythm.",
        "{A} abandons form and the cage stalls.",
        "{A} fades completely as their opponent closes it out."
      ]
    }
  },

  // 7) Back Off (repeat)
  {
    id: "d2-elim-e07",
    episode: 7,
    name: "Back Off",
    description:
      "Each competitor has a hook attached to his/her back. The challenger must take the hook off of the opponent's back and place it on a ring at the side of the arena. The first challenger to successfully hook his/her opponent's hook to the ring twice wins the challenge.",
    skillWeights: {
      strength: 1.2,
      strategy: 1.3
    },
    comments: {
      positive: [
        "{A} sets a smart trap and snatches their opponent's hook instantly.",
        "{A} out-muscles the clinch and peels the hook clean.",
        "{A} feints left, slips behind, and secures the point.",
        "{A} reads their opponent's movement and counters perfectly.",
        "{A} combines leverage and timing to control exchanges.",
        "{A} bullies their opponent to the edge and finishes with ease.",
        "{A} baits their opponent into overcommitting and capitalizes.",
        "{A} keeps wrists strong and denies every grip.",
        "{A} stays patient, then strikes for a clean score.",
        "{A} closes the duel 2–0 with ruthless precision."
      ],
      neutral: [
        "{A} and their opponent lock up with long stalemates.",
        "{A} plays cautiously, trading position with their opponent.",
        "{A} wins one exchange but gives one back.",
        "{A} circles, testing grips without overreaching.",
        "{A} adjusts tactics mid-round and stabilizes.",
        "{A} keeps a low base and avoids big risks.",
        "{A} nearly scores but loses control at the ring.",
        "{A} fights to a tie until the final exchange.",
        "{A} uses safe frames to survive their opponent's burst.",
        "{A} edges forward but can’t finish consistently."
      ],
      negative: [
        "{A} gets turned easily and loses the back.",
        "{A} reaches recklessly and gives up the hook.",
        "{A} can’t break their opponent's grips at any point.",
        "{A} gets dragged off balance and outworked.",
        "{A} wastes energy on fruitless clinches.",
        "{A} telegraphs every move and gets countered.",
        "{A} loses ring awareness and drops a free point.",
        "{A} lets frustration lead to sloppy grips.",
        "{A} stalls out and gives their opponent complete control.",
        "{A} falls 0–2 with no answer for their opponent's plan."
      ]
    }
  },

  // 8) Duel Pole Dancing (repeat)
  {
    id: "d2-elim-e08",
    episode: 8,
    name: "Duel Pole Dancing",
    description:
      "A totem pole-like structure is located in the center of the arena. Around the outside of the pole are climbing holds for the competitors to use to make their ascent. The first competitor to reach the top of the pole and ring a bell wins the challenge.",
    skillWeights: {
      climbing: 1.4,
      strategy: 1.1,
      speed: 1.0
    },
    comments: {
      positive: [
        "{A} finds the best line and floats up the pole.",
        "{A} uses tiny footholds with flawless precision.",
        "{A} accelerates halfway and drops their opponent instantly.",
        "{A} plans clips ahead and never hesitates.",
        "{A} keeps hips close and wastes zero motion.",
        "{A} chalks up quickly and bursts to the bell.",
        "{A} switches sides mid-route for a perfect angle.",
        "{A} commits to dynamic moves and sticks every one.",
        "{A} rings the bell with a clinical top-out.",
        "{A} makes the climb look effortless."
      ],
      neutral: [
        "{A} climbs steadily while checking each hold.",
        "{A} pauses to reset feet and continues cleanly.",
        "{A} keeps three points of contact throughout.",
        "{A} takes a longer route but stays composed.",
        "{A} recovers after a slip and maintains pace.",
        "{A} avoids risk and opts for secure placements.",
        "{A} keeps breathing under control on the ascent.",
        "{A} watches their opponent briefly, then resumes calmly.",
        "{A} edges upward with measured, safe progress.",
        "{A} finishes with a respectable, methodical climb."
      ],
      negative: [
        "{A} overreaches and peels off early.",
        "{A} chooses a poor sequence and stalls out.",
        "{A} loses core tension and swings away.",
        "{A} misses a key crimp and slides down.",
        "{A} wastes time searching and panics.",
        "{A} cuts feet and never recovers balance.",
        "{A} pumps out and can’t continue.",
        "{A} slips near the top and gives it away.",
        "{A} hesitates, allowing their opponent to pass cleanly.",
        "{A} never finds a rhythm on the pole."
      ]
    }
  },

  // 9) Push Over (repeat)
  {
    id: "d2-elim-e09",
    episode: 9,
    name: "Push Over",
    description:
      "There is a large wooden plank placed on the ground. This Duel is won by knocking a challenger off the plank twice.",
    skillWeights: {
      strength: 1.3,
      balance: 1.1
    },
    comments: {
      positive: [
        "{A} roots their stance and bulldozes their opponent off the plank.",
        "{A} absorbs contact and counters with power.",
        "{A} keeps center of gravity low and dominant.",
        "{A} times the shove perfectly for a clean point.",
        "{A} shrugs off their opponent's push and returns a harder one.",
        "{A} foot-fights to position and controls the space.",
        "{A} baits their opponent forward then redirects effortlessly.",
        "{A} clamps shoulders and marches their opponent backward.",
        "{A} wins hand position and finishes the round fast.",
        "{A} closes it 2–0 with commanding balance."
      ],
      neutral: [
        "{A} and their opponent trade shoves without movement.",
        "{A} resets stance after each clash.",
        "{A} keeps feet under hips and stays safe.",
        "{A} matches their opponent's strength in the center.",
        "{A} circles cautiously to avoid the edge.",
        "{A} chooses counters over risky drives.",
        "{A} loses ground briefly, then regains center.",
        "{A} locks up and forces a long stalemate.",
        "{A} edges the border but recovers in time.",
        "{A} splits the early points with their opponent."
      ],
      negative: [
        "{A} overextends and stumbles off the plank.",
        "{A} gets walked down with no resistance.",
        "{A} stands tall and loses leverage.",
        "{A} lets their opponent control the hand-fight easily.",
        "{A} panics at the edge and steps out.",
        "{A} slips on the reset and gives away a point.",
        "{A} can’t anchor feet and gets rag-dolled.",
        "{A} leans forward and gets redirected.",
        "{A} never adjusts to their opponent's power.",
        "{A} falls twice with minimal pushback."
      ]
    }
  },

  // 10) Spot On (repeat)
  {
    id: "d2-elim-e10",
    episode: 10,
    name: "Spot On",
    description:
      "There are two rock-climbing walls, one for each challenger. There is a pattern that is designed on each wall. The pattern is not complete, though, and each challenger must use the pieces given to them in order to complete the pattern. The first challenger to complete the pattern wins.",
    skillWeights: {
      speed: 1.0,
      mental: 1.3,
      climbing: 1.1
    },
    comments: {
      positive: [
        "{A} reads the pattern instantly and commits.",
        "{A} locks holds with precision and free hands pieces fast.",
        "{A} keeps cool breath and moves with purpose.",
        "{A} sees the symmetry and never second-guesses.",
        "{A} sequences perfectly and flies up the wall.",
        "{A} adjusts a misfit piece in one motion.",
        "{A} tracks the layout while placing flawlessly.",
        "{A} outruns their opponent with sharp decisions.",
        "{A} taps the final piece and calls it clean.",
        "{A} solves with a textbook, efficient climb."
      ],
      neutral: [
        "{A} double-checks each piece before committing.",
        "{A} pauses to compare sides, then continues.",
        "{A} maintains steady movement with few risks.",
        "{A} chooses safe placements over speed.",
        "{A} backtracks once, then recovers composure.",
        "{A} mirrors the pattern cautiously.",
        "{A} resets a piece carefully and moves on.",
        "{A} keeps three points of contact while thinking.",
        "{A} avoids errors but lacks urgency.",
        "{A} finishes with a measured, tidy solve."
      ],
      negative: [
        "{A} misreads the pattern and stalls.",
        "{A} forces a wrong piece and has to redo.",
        "{A} overthinks and loses precious time.",
        "{A} slips on a hold and drops confidence.",
        "{A} confuses orientation and panics.",
        "{A} wastes time arguing with themselves.",
        "{A} ignores a mismatch and pays for it later.",
        "{A} rushes placements and causes a cascade of errors.",
        "{A} watches their opponent finish while still reworking the middle.",
        "{A} times out with the wall half-correct."
      ]
    }
  }
];
