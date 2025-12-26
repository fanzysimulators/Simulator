window.DAILY_DATA = [
  // ----- Episode 1 -----
  {
    episode: 1,
    name: "Gas Problems",
    description: "Teams have to assemble a five-layered puzzle, and each puzzle has different diagrams that are locked in five separate boxes. In order to unlock the boxes, players have to enter a gas chamber in pairs, and memorize combinations of codes and letters that will unlock the boxes containing the diagrams. The first team to correctly assemble their puzzle together wins.",
    skillWeights: { speed: 1, mental: 1 },
    comments: {
      positive: [
"{A} enters the gas chamber without hesitation, memorizing the entire code sequence flawlessly.",
"{A} communicates clearly with their partner, reciting every letter and number in perfect sync.",
"{A} unlocks each box quickly, moving from code to puzzle piece with seamless focus.",
"{A} connects the diagrams with precision, fitting every layer perfectly.",
"{A} stays calm under pressure, leading their team to a smooth and organized finish."
      ],
      neutral: [
"{A} studies the code carefully before repeating it aloud for confirmation.",
"{A} takes steady breaths in the chamber, focusing on the letters through the fog.",
"{A} returns to the station methodically, double-checking combinations before unlocking.",
"{A} works patiently with their team to align the diagrams correctly.",
"{A} balances between memorizing and assembling, maintaining a controlled rhythm."
      ],
      negative: [
"{A} struggles to see clearly in the chamber and mixes up part of the code.",
"{A} hesitates on a letter, forcing their partner to recheck the sequence.",
"{A} fumbles with a lock and loses precious seconds before it opens.",
"{A} connects two pieces incorrectly and has to take the puzzle apart.",
"{A} rushes the final layer, causing a misalignment that costs their team time."
      ]
    }
  },

  // ----- Episode 2 -----
  {
    episode: 2,
    name: "Brain Buster",
    description: "Players from each team are suspended upside down from ropes in front of the Průmyslový palác in Prague, and have to transfer color-coded beer steins from one end of a course to another by swinging toward their team members, and having their teammates place the steins on color-coded pedestals. The team that transfers the most beer steins within a 15-minute time limit wins.",
    skillWeights: { balance: 1.6, speed: 1, teamwork: 1.6 },
    comments: { positive: [
"{A} swings with perfect control, passing the stein cleanly to their teammate every time.",
"{A} maintains flawless rhythm, syncing their momentum with the team’s timing.",
"{A} grips tightly, adjusting midair to land the pass without spilling a drop.",
"{A} communicates clearly, coordinating each swing with precision and trust.",
"{A} keeps their focus sharp, transferring steins faster with every successful round."
], 
neutral: [
"{A} steadies their swing before reaching for the next stein.",
"{A} calls out timing cues to keep the rotation consistent.",
"{A} waits for their teammate’s signal before making the next pass.",
"{A} adjusts grip and angle midair to align with the pedestal below.",
"{A} stays composed while the team settles into a steady pace."
], 
negative: [
"{A} mistimes their swing, forcing a teammate to scramble for the catch.",
"{A} loses grip on a stein mid-transfer, watching it drop to the ground.",
"{A} swings too early, throwing off the team’s rhythm.",
"{A} clips the rope awkwardly and spins off balance.",
"{A} struggles to regain momentum after a shaky pass, slowing the rotation."
] }
  },

  // ----- Episode 3 -----
  {
    episode: 3,
    name: "Bed Head",
    description: "A series of five beds is suspended from a platform 40 feet above the water, and players from each team have to jump one-by-one from bed to bed, with each bed decreasing in size from start to finish. Once an entire team has landed on the same bed, the process continues until each team member has landed on the last bed at the end of the platform. Players are disqualified if they fall into the water, or if one player is touching their bed with their hands when a teammate jumps to join that player on the bed. The team that makes it to the last bed with the fewest disqualifications and in the fastest time wins.",
    skillWeights: { balance: 1.4, climbing: 1.2 },
    comments: { positive: [
"{A} leaps flawlessly from bed to bed, landing with perfect balance each time.",
"{A} times their jump precisely, giving teammates the space to land safely.",
"{A} steadies the final bed effortlessly, helping others maintain their footing.",
"{A} keeps calm and composed, adjusting stance with every small wobble.",
"{A} completes the sequence without a single misstep, guiding the team with confidence."
], 
neutral: [
"{A} crouches carefully before jumping to minimize movement on the bed.",
"{A} focuses on timing, waiting for the right moment before making their leap.",
"{A} stabilizes the bed gently, motioning for the next teammate to go.",
"{A} shifts slightly to balance the bed as the group gathers together.",
"{A} watches their teammates closely, syncing movements to avoid imbalance."
], 
negative: [
"{A} jumps too soon, causing the bed to sway dangerously.",
"{A} lands off-center and nearly slips into the water.",
"{A} touches the bed with their hands, earning the team a penalty.",
"{A} loses balance when a teammate lands beside them and tumbles off.",
"{A} hesitates too long, breaking the team’s flow and costing valuable time."
] }
  },

  // ----- Episode 4 -----
  {
    episode: 4,
    name: "Bottleneck Stampede",
    description: "Players from each team have to push their way simultaneously through a giant obstacle course, with each obstacle creating its own bottleneck. The first team to get all their players across a finish line wins.",
    skillWeights: { },
    comments: { positive: [
"{A} explodes off the start line, clearing the hay bales with perfect agility.",
"{A} crawls under the bars smoothly, keeping flawless momentum through the course.",
"{A} climbs over the rope wall with speed and precision, helping teammates follow behind.",
"{A} pushes through tight spaces effortlessly, staying light on their feet throughout.",
"{A} crosses the final stretch in stride, leading their team across the finish line."
], 
neutral: [
"{A} keeps a steady rhythm through the course, balancing power and control.",
"{A} slows slightly to navigate the ropes carefully before climbing over.",
"{A} crouches low to crawl under the bars without losing balance.",
"{A} paces their run, waiting for teammates to clear the next obstacle.",
"{A} shakes off dust and continues forward, maintaining focus on the next section."
], 
negative: [
"{A} gets wedged between the hay bales, losing precious seconds.",
"{A} stumbles on a rope and has to reset their grip before climbing.",
"{A} hesitates before ducking under the bars, throwing off their timing.",
"{A} tires mid-course and struggles to lift themselves over the final obstacle.",
"{A} loses footing in the rush, slowing their team down near the bottleneck."
] }
  },

  // ----- Episode 5 -----
  {
    episode: 5,
    name: "Surf's Up",
    description: "Teams jump onto a platform that is hanging from a side of a cliff, 40 feet above water. Teams jump onto a flying surfboard in pairs, and players have to surf as far as possible before falling into water, then swim around two buoys, and ring a bell once they reach the other side of the lagoon. The team with the fastest average time wins.",
    skillWeights: { balance: 1.6, swimming: 1.4 },
    comments: { positive: [
"{A} leaps confidently onto the platform, landing perfectly balanced on the surfboard.",
"{A} maintains poise and control, gliding far across the water before diving in.",
"{A} transitions smoothly from the surf to the swim, cutting through the lagoon with power.",
"{A} keeps strong, efficient strokes around the buoys and accelerates toward the bell.",
"{A} finishes their leg flawlessly, ringing the bell with energy to spare."
], 
neutral: [
"{A} steadies themselves before the jump, gauging timing with their partner.",
"{A} lands slightly off-center but recovers balance before the fall.",
"{A} swims at a measured pace, maintaining consistent rhythm through the course.",
"{A} circles the buoys carefully, conserving energy for the final push.",
"{A} keeps calm as the surfboard tips, making a clean entry into the water."
], 
negative: [
"{A} slips on the jump and tumbles into the water early.",
"{A} loses balance on the board and falls before gaining any distance.",
"{A} mistimes their entry and struggles to find momentum in the swim.",
"{A} veers too wide around the buoys, adding extra distance to their route.",
"{A} tires near the finish, slowing to a crawl before ringing the bell."
] 
}
  },

  // ----- Episode 6 -----
  {
    episode: 6,
    name: "Sky Hook",
    description: "Players from each team have to climb onto a series of metal rings that are hanging from a platform suspended high above water. Players have to pass basketballs from one teammate to another until the player closest to the basket can shoot basketballs into a basket that is also hanging from a platform. Each player has to be on a ring before any balls can be transferred from player to player. A team loses one ball for each player that falls into water. Each team has 10 basketballs and a 20-minute time limit to shoot as many balls into a basket as possible. The team that makes the most baskets in the fastest time wins.",
    skillWeights: { balance: 1.6, climbing: 1.2, speed: 1, teamwork: 1.6 },
    comments: { positive: [
"{A} climbs onto the metal ring with perfect balance, securing their position instantly.",
"{A} catches the ball mid-swing and passes it with flawless accuracy to the next teammate.",
"{A} times their swing perfectly, keeping the chain of passes smooth and controlled.",
"{A} steadies the final ring and sinks the shot cleanly into the basket.",
"{A} maintains composure under pressure, coordinating every move with their team’s rhythm."
], 
neutral: [
"{A} adjusts their grip, waiting for the ring to settle before catching the ball.",
"{A} swings carefully, calling out timing cues to stay in sync with the team.",
"{A} holds position as the rings sway, focusing on the next handoff.",
"{A} steadies the ball before making a precise chest pass forward.",
"{A} watches the arc of the shot, ready to adjust for the next round."
], 
negative: [
"{A} overreaches for a pass and loses grip, falling into the water.",
"{A} mistimes the swing, sending the ball slightly off target.",
"{A} fumbles the catch, causing a delay in the rotation.",
"{A} loses focus for a second and drops a ball into the water.",
"{A} struggles to stay balanced as the ring twists beneath their weight."
] }
  },

  // ----- Episode 7 -----
  {
    episode: 7,
    name: "Gimme a Hand",
    description: "Teams have to walk on a tightrope suspended high above ground, from one nine-story building to another at Prosek Point in Prague. Players try to advance on the tightropes in pairs, with their hips and ankles attached to their partner, and have to use overhead ropes to guide them on the tightropes. The team with the most players advancing from building to building in the fastest time wins.",
    skillWeights: { balance: 1.6, speed: 1, teamwork: 1.4 },
    comments: { positive: [
"{A} keeps a steady rhythm on the tightrope, moving in perfect sync with their partner.",
"{A} maintains balance effortlessly, using the overhead rope with precise control.",
"{A} communicates clearly, matching every step to their partner’s movements.",
"{A} glides across the rope confidently, adjusting posture to stay centered.",
"{A} reaches the other building without a wobble, setting the pace for the rest of the team."
], neutral: [
"{A} takes small, measured steps to keep alignment with their partner.",
"{A} focuses on breathing evenly, keeping calm high above the ground.",
"{A} grips the overhead rope tightly, maintaining stability as the wind shifts.",
"{A} pauses briefly to realign balance before continuing forward.",
"{A} keeps eyes fixed ahead, coordinating slow and deliberate progress."
], negative: [
"{A} loses footing for a moment, forcing their partner to stop and rebalance.",
"{A} leans too far to one side and struggles to regain control.",
"{A} grips the overhead rope too tightly, throwing off their rhythm.",
"{A} hesitates mid-step, breaking the pair’s balance.",
"{A} slips near the midpoint and falls before reaching the next building."
] }
  },

  // ----- Episode 8 -----
  {
    episode: 8,
    name: "High Ball",
    description: "Teams have to transfer and balance balls uphill in pairs, on a ball carrier that resembles an oversize martini glass with a flat lid. Two players have to hold the ball carrier while one player loads a ball to the top of the ball carrier, and each pair of players has to deposit balls into a high basket at the top of the hill, using the ball carrier. The team that transfers the most balls into their basket within a 90-minute time limit wins.",
    skillWeights: { balance: 1.6, speed: 1.6, climbing: 1, teamwork: 1.4 },
    comments: { positive: [
"{A} steadies the ball carrier perfectly, keeping it level as their teammate loads the ball.",
"{A} moves uphill in sync with their partner, maintaining flawless balance the entire way.",
"{A} keeps a strong grip on the handles, guiding the carrier smoothly to the basket.",
"{A} communicates clearly, calling out each adjustment before they make it.",
"{A} deposits the ball cleanly into the basket and jogs back for the next round without missing a beat."
], neutral: [
"{A} takes careful, measured steps uphill, focusing on balance over speed.",
"{A} keeps eyes locked on the ball, coordinating every shift with their partner.",
"{A} pauses halfway to steady the load before continuing upward.",
"{A} holds the carrier steady while their teammate loads another ball.",
"{A} maintains a slow, even rhythm to prevent the ball from rolling off."
], negative: [
"{A} loses balance halfway up the hill, sending the ball rolling back down.",
"{A} overcorrects a tilt, causing the carrier to wobble dangerously.",
"{A} moves too quickly and spills the ball before reaching the basket.",
"{A} struggles to match pace with their partner, throwing off the carrier’s balance.",
"{A} fumbles the deposit, watching the ball bounce out of the basket."
] }
  },

  // ----- Episode 9 -----
  {
    episode: 9,
    name: "Riot Act",
    description: "Players have to knock players from opposing teams off a square dirt platform and into a mud pit, using glass riot shields. The challenge is played in two rounds: guys vs. guys and girls vs. girls. A team is still in the game as long as one teammate is still in the platform. If there are two different winners after each gender has been knocked out of the platform in each round, one player from each winning team will face off in a head-to-head match, in which the last player standing wins the challenge for their team and well as an automatic bid to the final challenge.",
    skillWeights: { strength: 2, strategy: 1 },
    comments: { positive: [
"{A} charges forward with precision, using the shield to drive their opponent straight into the mud.",
"{A} plants their feet firmly, holding ground even under heavy impact.",
"{A} waits for the perfect opening, then delivers a clean, powerful shove.",
"{A} pivots smoothly to deflect an attack, sending their opponent off balance.",
"{A} outmaneuvers their opponent with calm focus, finishing the round with total control."
], neutral: [
"{A} circles cautiously, testing distance before committing to contact.",
"{A} braces behind the shield, absorbing the hit without losing stance.",
"{A} takes a step back to reset footing and reassess their angle.",
"{A} keeps the shield steady, pushing forward with measured strength.",
"{A} glances at remaining teammates, coordinating for the next push."
], negative: [
"{A} lunges too early and misses, giving their opponent an opening.",
"{A} loses footing on the slick platform and slips into the mud.",
"{A} takes a heavy hit and staggers backward, struggling to recover.",
"{A} hesitates at the edge and gets knocked clean off the platform.",
"{A} overextends with the shield, leaving themselves exposed for a counter."
] }
  }
];
