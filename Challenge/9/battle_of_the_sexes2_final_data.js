window.FINAL_DATA = {
  rules: "Four-stage team final. Each stage is scored using the weighted skills listed below. Teams are ranked per stage based on their combined/average score (higher or lower depending on your main sim logic). Final standings are determined by overall performance across all stages.",

  constraints: {
    minPerTeamPerStage: 3,
    playerOnceOnly: false
  },

  stages: [
    {
      stage: 1,
      name: "Challenge 1",
      description: "Players spend the night in solidary confinement. Then, they are transported to an airfield, where they board the airplane and must perform a jump with a parachute. After the entire team does so, they must find a GPS-locator, and start their three-mile run to the first checkpoint. In the first checkpoint, the players must crawl under barbed wire and find a key in the ground. Once they do, they must unlock their cell, and continue their race.",
      skillWeights: { endurance: 1.8, speed: 1.2, climbing: 0.6 },
      comments: {
        positive: [
"{A} crawls under the barbed wire with perfect form, staying low and fast.",
"{A} spots the key immediately and digs it out in one clean motion.",
"{A} unlocks their cell without fumbling, gaining an early lead.",
"{A} moves with total confidence, clearing the checkpoint in seconds.",
"{A} keeps a steady rhythm and bursts forward the moment the lock clicks open."
        ],
        neutral: [
"{A} crawls carefully beneath the barbed wire, keeping an eye on the path ahead.",
"{A} brushes dirt aside methodically while searching for the key.",
"{A} takes a moment to line up the key with the lock before turning it.",
"{A} stays low to the ground as they move toward the cell door.",
"{A} works at a measured pace, staying calm while unlocking their cell."
        ],
        negative: [
"{A} gets snagged on the barbed wire and has to readjust to continue.",
"{A} digs in the wrong spot and wastes valuable time looking for the key.",
"{A} struggles to line up the key with the lock, hands shaking with frustration.",
"{A} rises too high under the wire and nearly gets caught on it.",
"{A} fumbles the key twice before finally opening the cell, falling behind."
        ]
      }
    },

    {
      stage: 2,
      name: "Challenge 2",
      description: "Players must work together to untie a thick rope, slide the key from the end of the rope to retrieve it and then use it to open their second cell which will give them a clue about the next stage.",
      skillWeights: { speed: 2, climbing: 0.8, teamwork: 1.2 },
      comments: {
        positive: [
"{A} pulls the rope with perfect coordination, loosening knots faster than expected.",
"{A} works the key smoothly along the rope, keeping it steady through every twist.",
"{A} anticipates each snag and guides the rope expertly to free the key.",
"{A} unlocks the second cell immediately, wasting no time between steps.",
"{A} stays focused and efficient, helping the team clear the checkpoint with ease."
],
        neutral: [
"{A} tugs carefully on the rope, loosening each knot one section at a time.",
"{A} slides the key slowly along the rope, adjusting grip to keep it from slipping.",
"{A} pauses briefly to study the knot before deciding where to pull next.",
"{A} holds the rope steady while teammates work the key around the bends.",
"{A} turns the key in the lock with measured focus, revealing the next clue."
],
        negative: [
"{A} pulls the wrong section of rope, tightening the knot instead of loosening it.",
"{A} drops the key while sliding it and has to reposition it awkwardly.",
"{A} gets the rope tangled and loses valuable time trying to fix it.",
"{A} struggles to guide the key around a knot, slowing the team’s progress.",
"{A} fumbles at the lock, unable to open the second cell on the first try."
]
      }
    },

    {
      stage: 3,
      name: "Challenge 3",
      description: "The players have a pile of hay bales which they have to dig through to find a key.",
      skillWeights: { speed: 2, strength: 1.4, strategy: 0.8 },
      comments: {
        positive: [
"{A} tears through the hay bales with speed, clearing huge sections in seconds.",
"{A} digs with sharp, focused movements, uncovering layers quickly.",
"{A} keeps perfect rhythm, tossing aside hay efficiently until the key appears.",
"{A} spots a clue in the pile and zeroes in, finding the key almost instantly.",
"{A} pulls the key out triumphantly, barely breaking stride before moving on."
],
        neutral: [
"{A} parts the hay slowly, checking each layer methodically.",
"{A} shifts bales aside one at a time, keeping the search organized.",
"{A} pauses to look around the pile before choosing a new spot to dig.",
"{A} spreads the hay with steady movements, maintaining a consistent pace.",
"{A} digs through a section carefully, making sure not to miss anything."
],
        negative: [
"{A} digs in the wrong area repeatedly, wasting valuable time.",
"{A} tosses hay wildly, losing track of what’s already been checked.",
"{A} gets tangled in loose hay and slows down noticeably.",
"{A} grows frustrated after turning up nothing and hesitates before continuing.",
"{A} nearly finds the key but overlooks it, buried deeper in the pile."
]
      }
    },

    {
      stage: 4,
      name: "Challenge 4",
      description: "The teams use the keys that they found to unlock a puzzle board. On the puzzle board they will see a card matching game with pictures of their fellow competitors. They must first match the same pictures together, opening two pictures at a time. Then, they must pin the original seasons of the displayed players on their pictures. The first team to do so will win the season.",
      skillWeights: { mental: 1 },
      comments: {
        positive: [
"{A} flips the matching cards with total confidence, finding pairs almost instantly.",
"{A} recognizes every face on the board immediately, pinning seasons with flawless accuracy.",
"{A} works quickly and methodically, completing matches in rapid succession.",
"{A} communicates clearly, guiding the team through the sequence of matches.",
"{A} locks in the final season pin without hesitation, securing the win for the team."
],
        neutral: [
"{A} studies the board carefully before flipping the next pair of cards.",
"{A} pauses briefly to recall which competitor appeared where.",
"{A} places a season pin slowly, double-checking before committing.",
"{A} coordinates with teammates to divide the board into sections.",
"{A} flips two cards cautiously, keeping mental track of earlier reveals."
],
        negative: [
"{A} mismatches cards repeatedly, losing valuable time.",
"{A} hesitates on a season pin, unsure of which original season the player came from.",
"{A} forgets where a recently revealed card was placed, slowing the team's progress.",
"{A} places a pin incorrectly and has to remove it, disrupting momentum.",
"{A} becomes overwhelmed by the board and falls out of sync with the team."
]
      }
    }
  ]
};
