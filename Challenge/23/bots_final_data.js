/* Battle of the Seasons — Finals (Episode 12)
   Flow: Status → Stage 1 → … → Stage 6 → Final Results.
   Teams scored by team-average of required skills per stage.
*/

window.BOTS_FINAL_DATA = {
  rules: "Six-stage team final. Each stage is scored by team-average of required skills (higher = better for this season). Final standings are based on best average placement across all six stages.",
  constraints: {
    // You can tweak or ignore these in the logic if needed
    minPerTeamPerStage: 1,
    playerOnceOnly: false
  },

  stages: [
    {
      stage: 1,
      name: "Mind Field",
      description: "The first phase of the final challenge begins with players from each team parachuting from a plane to ground level on the Namibian desert. Each team then sprints through the desert to their first checkpoint, in which each team has a 20-minute time limit to align nine numbers on a 3x3 grid to where each number equals 15 in each direction.",
      skillWeights: { speed: 2, mental: 1.4 },
      comments: {
        positive: [
"{A} lands smoothly from the parachute and immediately sprints into the desert with precision",
"{A} hits the grid and starts aligning numbers with sharp focus and fast calculations",
"{A} communicates clearly with teammates, solving rows and columns in seconds",
"{A} stays calm in the heat, cracking the number pattern with total confidence",
"{A} guides the team through the logic perfectly, locking the grid before time runs out",
"{A} pushes through the desert terrain and reaches the checkpoint with unstoppable energy"
        ],
        neutral: [
"{A} lands awkwardly but quickly regains footing and heads toward the checkpoint",
"{A} studies the 3x3 grid slowly, double-checking each number before moving it",
"{A} conserves energy during the desert sprint, keeping a steady pace with the team",
"{A} pauses at the grid to think through the pattern before committing to placements",
"{A} quietly works the puzzle methodically without rushing or falling behind",
"{A} adjusts their parachute landing gear before starting the sprint to the checkpoint"
        ],
        negative: [
"{A} struggles with the parachute landing and loses time getting oriented",
"{A} gets confused by the number pattern and rearranges the grid incorrectly",
"{A} slows down in the desert heat, forcing the team to adjust their pace",
"{A} misplaces several numbers, causing the team to start sections over",
"{A} panics at the ticking timer and rushes the puzzle with mistakes",
"{A} falls behind during the sprint, arriving last to the checkpoint"
        ]
      }
    },

    {
      stage: 2,
      name: "Rung Out",
description: "After a team has correctly aligned the numbers, they can push a red button, which will detonate the designated 'mine field' and enable a team to hop aboard a helicopter, which will take them over the mountains to the next checkpoint. Players from each team must swing a ring roped to a hook toward a pole until one player successfully lands the ring. If a player misses, he/she has to take a drink of warm camel milk. ",
      skillWeights: { balance: 1.5, strength: 0.6, eating: 1 },
      comments: {
        positive: [
"{A} swings the ring with perfect control, hooking it cleanly on the first try",
"{A} lines up the shot calmly and lands a flawless hook without hesitation",
"{A} keeps steady rhythm, adjusting their aim and sinking the hook beautifully",
"{A} launches the ring with confidence, hitting the pole dead-center",
"{A} shows zero fear of the camel milk and focuses straight on nailing the hook",
"{A} delivers the winning hook with style, sending their team to the next stage immediately"
        ],
        neutral: [
"{A} takes a moment to steady their stance before attempting the hook",
"{A} swings wide on the first try but resets calmly for another attempt",
"{A} focuses on the pole, taking careful aim without rushing",
"{A} keeps a cautious pace, checking the wind before swinging",
"{A} misses the pole narrowly and prepares for another attempt",
"{A} takes a small sip of camel milk and returns to the task unfazed"
        ],
        negative: [
"{A} throws wildly off-target and immediately has to drink the camel milk",
"{A} can't get the rhythm right and misses the pole by several feet",
"{A} hesitates too long, wasting precious time before making a poor attempt",
"{A} hooks the rope on their own arm instead of the pole and sputters on the camel milk",
"{A} grows frustrated after repeated misses and slows the team down",
"{A} launches the ring straight into the ground, earning another painful camel-milk penalty"
        ]
      }
    },

    {
      stage: 3,
      name: "Get Tired",
      description: "In the next checkpoints each team must use multiple poles and ropes in order to carry a series of tires through the desert — for the four-player teams, it is eight tires; for the only two-player team, it is four tires.",
      skillWeights: { strength: 2, endurance: 1.5, speed: 1.2 },
      comments: {
        positive: [
"{A} keeps perfect tension on the ropes, helping the team lift the tires with smooth coordination",
"{A} adjusts grip quickly, allowing the group to move faster across the sand",
"{A} calls out steady pacing, keeping the poles balanced through uneven terrain",
"{A} helps stabilize the load every time the tires wobble, preventing slowdowns",
"{A} pushes ahead confidently, motivating the team to maintain strong momentum",
"{A} lifts with flawless timing, keeping the tire formation secure across the desert"
        ],
        neutral: [
"{A} walks at a measured pace while keeping an eye on the shifting poles",
"{A} adjusts position quietly to help redistribute the weight evenly",
"{A} wipes sand from their hands before continuing the carry",
"{A} focuses on footing as the team moves through a deeper patch of sand",
"{A} takes a brief pause to reset grip before lifting again",
"{A} follows the group’s rhythm, staying in line through the long stretch"
        ],
        negative: [
"{A} loses balance for a moment, causing one of the poles to tilt sharply",
"{A} stumbles in the sand and forces the team to stop and regroup",
"{A} grips the pole awkwardly, making it harder to support the tires",
"{A} slows down and struggles to keep up with the group's pace",
"{A} missteps near a dune and nearly drops their side of the load",
"{A} gets disoriented in the heat and forgets their assigned position"
        ]
      }
    },

    {
      stage: 4,
      name: "Camel Nap",
      description: "A helicopter takes each team to the last checkpoint of the first phase, in which all but one player from each team must stand within a small designated rectangle in the sand, and supervise a camel overnight in a tent, while one team member gets to sleep by a nearby campfire. A team is assessed a one-minute penalty to begin the second phase of the final challenge if one team member steps out of the rectangle for any reason while supervising the camel. ",
      skillWeights: { balance: 1.5, mental: 1, strategy: 0.8 },
      comments: {
        positive: [
"{A} keeps perfect control of the camel, never breaking focus all night",
"{A} stays grounded in the rectangle, managing the cramped space with total discipline",
"{A} calmly handles the camel’s movements while reassuring teammates at the campfire",
"{A} keeps the group organized, making the overnight watch look effortless",
"{A} stays alert the entire night, balancing the camel duty without a single misstep",
"{A} maintains steady teamwork, proving reliable even in the toughest night conditions"
        ],
        neutral: [
"{A} shifts around in the rectangle, trying to find a comfortable position",
"{A} keeps an eye on the camel but mostly stays quiet through the night",
"{A} passes the time by humming and watching the stars while supervising",
"{A} swaps focus between the camel and teammates, keeping things steady",
"{A} adjusts their footing in the sand but stays within the designated area",
"{A} waits patiently for morning, keeping their routine calm and consistent"
        ],
        negative: [
"{A} nearly steps out of the rectangle after losing balance in the sand",
"{A} struggles to control the camel, causing tension among teammates",
"{A} gets restless and nearly forgets the penalty rules",
"{A} complains loudly through the night, distracting the rest of the team",
"{A} nods off while supervising the camel, risking a costly penalty",
"{A} panics when the camel shifts, almost stepping over the line"
        ]
      }
    },

    {
      stage: 5,
      name: "Hallucination Station",
      description: "After racing through numerous sand dunes, the first checkpoint of the second phase in which each team must locate words from a large chart from a distance of 15 feet in order to match an answer key needed to unlock wooden crates that each team will use at the next stage.",
      skillWeights: { mental: 1 },
      comments: {
        positive: [
"{A} spots the words instantly and calls them out with perfect accuracy",
"{A} keeps a steady focus on the chart and nails every answer on the first try",
"{A} guides the team with sharp direction, matching each word to the key effortlessly",
"{A} stays completely calm and leads the group through the checkpoint with confidence",
"{A} stands firm in the sand and reads the chart flawlessly despite the distance",
"{A} locks onto the correct words immediately, speeding the team through the stage"
        ],
        neutral: [
"{A} scans the chart carefully, taking time to make sure each word matches",
"{A} checks the chart twice before calling out the next match",
"{A} squints through the sand and sun, slowly piecing the words together",
"{A} double checks the answer key to confirm the next match",
"{A} reads the words methodically while the team prepares the crates",
"{A} takes a steady pace matching each word without rushing"
        ],
        negative: [
"{A} struggles to see the chart from the distance and calls out the wrong words",
"{A} mixes up two of the words and forces the team to recheck the key",
"{A} hesitates too long on each match, slowing down the entire team",
"{A} misreads the chart and sends the team searching for the wrong crates",
"{A} loses focus in the dunes and forgets part of the answer key",
"{A} keeps second-guessing every word, causing confusion and delays"
        ]
      }
    },

    {
      stage: 6,
      name: "Sand Shift",
      description: "In the next checkpoint, teams must use the crates to transfer sand into their designated containers several feet away. Once the containers have been filled with sand, the final section is a race to the top of a sand dune, with a flag at the end.",
      skillWeights: { strength: 1.5, endurance: 1, speed: 1.8 },
      comments: {
        positive: [
"{A} races forward with explosive energy, shoveling sand with perfect efficiency",
"{A} carries each crate like it's weightless, barely slowing down before dumping the sand",
"{A} moves with flawless coordination, helping the team fill the container in record time",
"{A} keeps the rhythm fast and steady, pushing everyone to work quicker",
"{A} surges ahead on the final dune climb, leading the charge toward the flag",
"{A} finishes with a strong final burst, crossing the summit like a machine"
        ],
        neutral: [
"{A} fills the crate carefully, trying not to spill sand on the way over",
"{A} jogs back and forth at a steady pace, keeping their breathing controlled",
"{A} adjusts their grip midway, making sure the crate doesn’t tip",
"{A} dumps sand methodically, checking how much remains before the container fills",
"{A} keeps a modest pace up the dune, consistent but not rushing",
"{A} takes a moment to re-center their footing before continuing up the sand hill"
        ],
        negative: [
"{A} trips on loose sand and spills half the crate before reaching the container",
"{A} struggles to lift the crate and moves at a crawl toward the drop point",
"{A} dumps the sand too early, realizing they’re still feet away from the container",
"{A} slows down dramatically, clearly fatigued before the final stretch",
"{A} sinks into the soft dune and loses momentum during the last climb",
"{A} reaches the top exhausted, barely able to stay upright as the others pass them"
        ]
      }
    }

    // Add stages 3–6 using the same structure
  ]
};
