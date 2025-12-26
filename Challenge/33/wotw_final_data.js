window.WOTW_FINAL_DATA = {
  finaleFormat: {
    title: "Finale Format",
    description:
      "Eight challengers enter a brutal, checkpoint-based desert final. Day One is a 24-mile run-and-cycle gauntlet where players must complete five different checkpoints in any order while racing the clock at each station. After Day One, the slowest two challengers are eliminated. Day Two begins with three consecutive legs: a sudden-death Geography Trivia checkpoint that rewards the winner with a dune buggy advantage, a mental head-to-head Battle Ball checkpoint where the final loser earns a time penalty, and a harsh Eating checkpoint where the first finisher controls what everyone else has to consume. After those three legs, the last two challengers are eliminated. The remaining challengers run the Final Leg: a five-mile beach run, a math unlock to secure one of four kayaks, and a final sprint to the lighthouse finish."
  },

  dayOne: {
    challenge: {
      id: "final_day1",
      name: "First Leg",
      description:
        "Players begin the final by running and cycling through a six-mile loop four times (24 miles overall). In the middle of the figure-eight loop there are five checkpoints each player must complete, and they can complete checkpoints at any stage during the 24 miles. If the checkpoint they wish to complete is currently occupied, they may wait or continue with their mileage. Each checkpoint has a 20-minute time limit before players time out: On Point (ring toss onto hooks), Pyramid Scheme (5x5 grid puzzle with one of each color per row/column), Rampage (push a ball up a ramp into a basket using a pole), Skulled Out (vertical puzzle forming a skull picture), and So Rolled (roll a tire through a hole from behind a line).",
      skillWeights: {
        speed: 1.7,
        balance: 1.2,
        strength: 1.1,
        endurance: 2.0,
        mental: 1.4
      },
      comments: {
        positive: [
          "{A} sets a terrifying pace and still stays sharp at every checkpoint.",
          "{A} never wastes a minute—clean completions and constant movement.",
          "{A} looks built for distance and keeps their balance under pressure.",
          "{A} powers through the miles and nails the checkpoints fast.",
          "{A} stays locked in mentally and gains ground with every station."
        ],
        neutral: [
          "{A} keeps grinding—steady pace, steady checkpoint work.",
          "{A} has a couple slow moments, but avoids any major timeouts.",
          "{A} picks smart spots to push and smart spots to survive.",
          "{A} stays consistent and finishes Day One without collapsing.",
          "{A} battles through a tough leg and stays in the mix."
        ],
        negative: [
          "{A} loses too much time at the checkpoints and the gap grows.",
          "{A} looks gassed on the loop and can’t find another gear.",
          "{A} struggles to stay balanced and it costs precious minutes.",
          "{A} gets stuck in slow completions and falls behind badly.",
          "{A} hits a wall late and bleeds time when it matters most."
        ]
      }
    },
    highlightsCount: 8
  },

  eliminated1: {
    description:
      "The last two placing challengers that are eliminated from the final are..."
  },

  dayTwoLegOne: {
    challenges: [
      {
        id: "final_leg1_a",
        name: "LEG ONE – Geography Trivia",
        description:
          "Players face a series of multiple-choice geography trivia questions. If they answer a question incorrectly, they are eliminated from the checkpoint. The last player standing wins a huge advantage: they are driven for the first mile of the Second Leg in a dune buggy while the remaining four players must traverse the sand dunes on foot.",
        skillWeights: {
          mental: 2.0,
          speed: 1.1,
          strategy: 1.6
        },
        comments: {
          positive: [
            "{A} stays calm and picks answers like they’ve studied for this.",
            "{A} outthinks everyone and snatches the dune buggy advantage.",
            "{A} plays it smart, trusts their instincts, and wins the showdown.",
            "{A} never panics under pressure and stays perfect on the questions.",
            "{A} controls the checkpoint with pure mental focus."
          ],
          neutral: [
            "{A} hangs in for a while, but it’s tense the whole time.",
            "{A} answers carefully and survives, but doesn’t dominate.",
            "{A} keeps it close—one question at a time.",
            "{A} looks unsure, but manages to stay alive.",
            "{A} does fine here, but it could swing either way."
          ],
          negative: [
            "{A} second-guesses the wrong moment and gets clipped.",
            "{A} makes a bad pick and is out instantly.",
            "{A} looks rattled and can’t recover from a mistake.",
            "{A} overthinks an easy one and it costs them.",
            "{A} loses control of the checkpoint and falls behind."
          ]
        },
        highlightsCount: 6
      },
      {
        id: "final_leg1_b",
        name: "LEG ONE – Battle Ball",
        description:
          "Players must wait for the next player to arrive. Two players then place colored balls one at a time into a slot, attempting to line four balls in a row (similar to Connect Four). The winner may continue immediately; the loser must wait for the next player to arrive and play again. The player who loses the final battle receives a five-minute time penalty that must be served before continuing.",
        skillWeights: {
          mental: 2.0
        },
        comments: {
          positive: [
            "{A} sees the board three moves ahead and steals the win.",
            "{A} stays patient and plays perfectly when it counts.",
            "{A} reads traps instantly and shuts every lane down.",
            "{A} keeps their head and wins the battle clean.",
            "{A} outsmarts the matchup and avoids the time penalty."
          ],
          neutral: [
            "{A} trades wins and losses—this checkpoint is a grind.",
            "{A} keeps it close, but it’s stressful every round.",
            "{A} plays safe and survives, but it’s not pretty.",
            "{A} hangs tough and avoids a full collapse.",
            "{A} stays in it, but nobody is running away with it."
          ],
          negative: [
            "{A} misses the obvious block and pays for it immediately.",
            "{A} gets baited into a trap and loses the round fast.",
            "{A} looks flustered and makes unforced mistakes.",
            "{A} can’t read the board and takes the penalty.",
            "{A} unravels late and drops the final battle."
          ]
        },
        highlightsCount: 6
      },
      {
        id: "final_leg1_c",
        name: "LEG ONE – Eating",
        description:
          "The first player to arrive at the checkpoint may eat as much or as little of the provided food items as they like. Once finished, they must divide up the remaining plates of food among the remaining four players. When the others arrive, they must eat everything they have been assigned before continuing.",
        skillWeights: {
          eating: 2.0,
          speed: 1.2
        },
        comments: {
          positive: [
            "{A} powers through the food fast and gains a huge edge.",
            "{A} stays ruthless and finishes quickly without slowing down.",
            "{A} barely flinches—plate after plate disappears.",
            "{A} keeps their pace strong and clears the checkpoint clean.",
            "{A} crushes the eating and gets moving immediately."
          ],
          neutral: [
            "{A} gets it down steadily, but it takes time.",
            "{A} struggles a bit, but keeps eating and stays alive.",
            "{A} finishes without drama—just slower than the leaders.",
            "{A} does enough to move on, but it’s not a strength.",
            "{A} grinds it out and finally clears the checkpoint."
          ],
          negative: [
            "{A} slows to a crawl and loses serious time here.",
            "{A} can’t keep pace and the checkpoint becomes a nightmare.",
            "{A} looks miserable and falls behind badly.",
            "{A} struggles to finish and it costs them the leg.",
            "{A} gets stuck here while everyone else pulls away."
          ]
        },
        highlightsCount: 6
      }
    ]
  },

  eliminated2: {
    description:
      "The last two placing challengers that are eliminated from the final are..."
  },

  dayTwoLegTwo: {
    challenge: {
      id: "final_leg2",
      name: "Final Leg",
      description:
        "Players run five miles down a beach to reach four kayaks. Along the way, there is a math problem they must solve to unlock a kayak and paddle towards a boat wreck. From the boat wreck, the remaining players run down the beach to a lighthouse where the finish line is set up. Once the final four reach the finish line, their total times are added to determine the winner.",
      skillWeights: {
        speed: 1.7,
        mental: 1.5,
        swimming: 1.6,
        endurance: 2.0
      },
      comments: {
        positive: [
          "{A} stays composed on the math and sprints to a kayak instantly.",
          "{A} keeps a brutal pace and finishes like a champion.",
          "{A} never fades—strong run, clean unlock, powerful paddle.",
          "{A} digs deep to the lighthouse and closes it out.",
          "{A} looks relentless from start to finish and takes control."
        ],
        neutral: [
          "{A} keeps it steady and avoids any major mistakes.",
          "{A} solves the math eventually and stays in the hunt.",
          "{A} holds pace and makes it to the lighthouse without collapsing.",
          "{A} hangs tough through the paddle and keeps it together.",
          "{A} survives the leg, but the margins are tight."
        ],
        negative: [
          "{A} gets stuck on the math and loses critical time.",
          "{A} fades hard on the run and can’t recover.",
          "{A} struggles in the water and watches others pull away.",
          "{A} unravels late and drops out of contention.",
          "{A} hits a wall at the worst possible moment."
        ]
      }
    },
    highlightsCount: 4
  },

  finalResults: {
    prefaceText:
      "This final was an absolute war—miles on miles in brutal conditions, checkpoints that punished every mistake, and pressure that only got worse with every leg. By the time they hit the lighthouse, nobody had anything left… except the challengers who earned it.",
    revealButtonText: "Reveal Placements"
  }
};
