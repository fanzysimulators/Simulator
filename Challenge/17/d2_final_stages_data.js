// The Duel II — Final (Episode 11)
// Six stages. Players compete individually by gender, except Stage 4–5 where temporary mixed pairs form.
// Store hidden per-stage placements; show only highlights during stages.
// Final Results = average placement across all 6 stages (lower average wins).

window.D2_FINAL_STAGES_DATA = [
  {
    stageNum: 1,
    name: "Stage 1 — Jet Boat & River Cross",
    description:
      "The final challenge begins with each player riding on a jet boat, then jumping when it stops mid-river. Each player must cross from one side of the river to the other using a rope line. The remainder of the course involves checkpoints reminiscent of Duel eliminations.",
    skillWeights: {
      swimming: 1.2,
      speed: 1.1
    },
    comments: {
      positive: [
        "{A} hits the water clean and surges to the rope.",
        "{A} times the current perfectly on the approach.",
        "{A} pulls along the rope with crisp, fast strokes.",
        "{A} breathes calmly and opens a clear gap.",
        "{A} reads the flow and corrects without losing speed.",
        "{A} stays streamlined and never breaks rhythm.",
        "{A} accelerates after the jump and looks effortless.",
        "{A} swings the final meters with perfect timing.",
        "{A} exits the water fresh and already pushing ahead.",
        "{A} turns the river into a highlight reel start."
      ],
      neutral: [
        "{A} takes a safe jump and settles into a steady pace.",
        "{A} pauses once on the rope to regrip, then continues.",
        "{A} keeps strokes consistent against the current.",
        "{A} plays it conservative on the entry and recovery.",
        "{A} holds mid-pack with measured breathing.",
        "{A} corrects line choice and stays composed.",
        "{A} keeps a respectable cadence to the far bank.",
        "{A} climbs out smoothly and resets for the run.",
        "{A} avoids mistakes and maintains a clean tempo.",
        "{A} completes the crossing without drama."
      ],
      negative: [
        "{A} hesitates on the jump and loses early ground.",
        "{A} fights the current and drifts off the rope line.",
        "{A} burns out halfway and has to rest on the rope.",
        "{A} misses the first grab and gets spun around.",
        "{A} swallows water and loses composure.",
        "{A} zigzags across and wastes precious seconds.",
        "{A} panics after a slip and stalls completely.",
        "{A} never finds rhythm against the flow.",
        "{A} reaches the bank exhausted and rattled.",
        "{A} leaves the river in clear trouble."
      ]
    }
  },

  {
    stageNum: 2,
    name: "Stage 2 — Spot On",
    description:
      "After the river crossing, competitors run up a steep hill to the first checkpoint, 'Spot On,' where each player must complete a wall-pattern puzzle.",
    skillWeights: {
      speed: 1.0,
      mental: 1.3
    },
    comments: {
      positive: [
        "{A} flies up the hill and snaps into puzzle mode.",
        "{A} sees the symmetry instantly and commits.",
        "{A} keeps a cool cadence and places pieces flawlessly.",
        "{A} double-checks alignment in one smooth motion.",
        "{A} plots the corners first and fills perfectly.",
        "{A} anticipates the final fit and locks it clean.",
        "{A} blends quick thinking with crisp execution.",
        "{A} never second-guesses and finishes first.",
        "{A} stays icy under pressure and solves fast.",
        "{A} turns the hill sprint into a statement."
      ],
      neutral: [
        "{A} jogs the hill and arrives collected.",
        "{A} studies the layout before placing anything.",
        "{A} swaps two pieces, then settles into rhythm.",
        "{A} keeps a steady pace with minimal errors.",
        "{A} pauses to compare sides, then continues.",
        "{A} prioritizes correctness over raw speed.",
        "{A} talks through the pattern quietly and works it out.",
        "{A} completes the board without major hiccups.",
        "{A} finishes mid-pack after careful work.",
        "{A} solves cleanly if not spectacularly."
      ],
      negative: [
        "{A} reaches the board winded and unfocused.",
        "{A} misreads the pattern and stalls early.",
        "{A} forces a wrong piece and creates a chain of errors.",
        "{A} overthinks simple placements and burns time.",
        "{A} swaps the same tiles repeatedly in frustration.",
        "{A} abandons a workable plan and restarts.",
        "{A} panics when others finish and rushes mistakes.",
        "{A} ignores alignment marks and pays for it.",
        "{A} times out with sections still incomplete.",
        "{A} leaves the checkpoint visibly rattled."
      ]
    }
  },

  {
    stageNum: 3,
    name: "Stage 3 — Pole to Pedal",
    description:
      "Checkpoint based on 'Duel Pole Dancing': shimmy up a pole to unlock a mountain bike, then ride up the mountainside to the next checkpoint.",
    skillWeights: {
      climbing: 1.2,
      endurance: 1.1,
      strength: 1.0
    },
    comments: {
      positive: [
        "{A} locks in close to the pole and floats upward.",
        "{A} uses tiny footholds with immaculate efficiency.",
        "{A} rings the latch and transitions to the bike instantly.",
        "{A} spins a high cadence and crushes the climb.",
        "{A} keeps core tight and wastes zero movement.",
        "{A} surges past markers with controlled breathing.",
        "{A} crests the steepest pitch without standing.",
        "{A} manages power perfectly into the switchbacks.",
        "{A} holds form and opens a decisive gap.",
        "{A} looks relentless from pole to pedal."
      ],
      neutral: [
        "{A} climbs methodically and avoids risky moves.",
        "{A} resets feet twice, then tops out cleanly.",
        "{A} takes the bike steady to protect the legs.",
        "{A} keeps a manageable cadence on the grades.",
        "{A} sits for traction and taps through the climb.",
        "{A} maintains position without chasing surges.",
        "{A} fuels on the move and keeps it controlled.",
        "{A} loses a little time but stays composed.",
        "{A} crests the hill with energy to spare.",
        "{A} completes the section with tidy execution."
      ],
      negative: [
        "{A} overreaches on the pole and slips down.",
        "{A} pumps out and stalls before the latch.",
        "{A} fumbles the lock and loses momentum.",
        "{A} starts the ride too hard and blows up.",
        "{A} wobbles on the grade and has to dismount.",
        "{A} can’t hold cadence and gets gapped.",
        "{A} fights the switchbacks and wastes watts.",
        "{A} cramps near the top and slows to a crawl.",
        "{A} rides ragged and never recovers rhythm.",
        "{A} reaches the checkpoint drained and frustrated."
      ]
    }
  },

  {
    stageNum: 4,
    name: "Stage 4 — Chain Link",
    description:
      "Players chain themselves to an iron ring and must team up with a member of the opposite gender of their choice to proceed.",
    skillWeights: {
      teamwork: 1.3,
      speed: 1.0
    },
    comments: {
      positive: [
        "{A} & {B} sync immediately and move as one.",
        "{A} sets a clear plan and {B} executes flawlessly.",
        "{A} & {B} match stride length and conserve energy.",
        "{A} calls cadence; {B} nails every beat.",
        "{A} & {B} communicate calmly under pressure.",
        "{A} adapts pace perfectly to {B}'s rhythm.",
        "{A} & {B} solve the link maneuvers on the first try.",
        "{A} keeps tension even while {B} steers the route.",
        "{A} & {B} glide through transitions without stopping.",
        "{A} anchors the chain while {B} sprints the segments."
      ],
      neutral: [
        "{A} & {B} take a moment to agree on roles.",
        "{A} adjusts the chain slack while {B} tests speed.",
        "{A} & {B} keep communication simple and steady.",
        "{A} moderates pace to keep {B} comfortable.",
        "{A} & {B} pause once to re-align the links.",
        "{A} checks on {B} and they reset smoothly.",
        "{A} & {B} move consistently after a slow start.",
        "{A} focuses on footing while {B} calls turns.",
        "{A} & {B} avoid mistakes and finish solidly.",
        "{A} and {B} stay patient and chip away."
      ],
      negative: [
        "{A} & {B} talk over each other and lose time.",
        "{A} rushes and yanks the chain off line for {B}.",
        "{A} & {B} can’t agree on pace or direction.",
        "{A} forgets the plan and stalls the team.",
        "{A} & {B} tangle the chain and have to backtrack.",
        "{A} pushes while {B} brakes—total mismatch.",
        "{A} & {B} bicker and the rhythm collapses.",
        "{A} ignores {B}'s cues and they stumble repeatedly.",
        "{A} & {B} never find sync and fall behind badly.",
        "{A} finishes upset while {B} looks defeated."
      ]
    }
  },

  {
    stageNum: 5,
    name: "Stage 5 — Push Over Sled",
    description:
      "Pairs advance to a 'Push Over' style checkpoint: push a sled of dirt across a line, remove dirt to lighten, then each retrieves a key from under the sled’s start to unlock from the prior chain.",
    skillWeights: {
      strength: 1.2,
      endurance: 1.1
    },
    comments: {
      positive: [
        "{A} & {B} drive low and move the sled immediately.",
        "{A} coordinates the heave while {B} times the resets.",
        "{A} & {B} strip weight efficiently between pushes.",
        "{A} powers the front while {B} keeps traction.",
        "{A} & {B} alternate bursts and breathe in sync.",
        "{A} cues the count; {B} hits each surge perfectly.",
        "{A} & {B} clear the line and grab keys fast.",
        "{A} controls the sled while {B} shovels like a machine.",
        "{A} & {B} never waste a second on transitions.",
        "{A} finishes strong while {B} is still driving."
      ],
      neutral: [
        "{A} & {B} test the sled before committing power.",
        "{A} shovels while {B} recovers for the next push.",
        "{A} & {B} keep steady progress without big bursts.",
        "{A} checks footing while {B} adjusts the handles.",
        "{A} & {B} rest briefly between efforts.",
        "{A} paces the drive to avoid burnout for {B}.",
        "{A} & {B} take longer to clear dirt but stay composed.",
        "{A} watches the line while {B} finishes the scoop.",
        "{A} & {B} finish with a serviceable time.",
        "{A} unlocks while {B} catches breath, then they go."
      ],
      negative: [
        "{A} & {B} push high and the sled doesn’t budge.",
        "{A} slips repeatedly and throws off {B}'s timing.",
        "{A} & {B} argue about when to remove dirt.",
        "{A} wastes energy on short, frantic shoves.",
        "{A} & {B} forget to clear enough weight before pushing.",
        "{A} drops the shovel and scrambles to recover.",
        "{A} & {B} stall at the line and panic.",
        "{A} miscounts loads and they redo work.",
        "{A} & {B} unlock late after a messy sequence.",
        "{A} finishes spent while {B} is visibly frustrated."
      ]
    }
  },

  {
    stageNum: 6,
    name: "Stage 6 — The Elevator Finish",
    description:
      "Final checkpoint based on 'The Elevator': elevate yourself to the top of The Duel structure to retrieve a Māori carving, then sprint to the finish. Payouts: 1st $100,000; 2nd $35,000; 3rd $15,000.",
    skillWeights: {
      strength: 1.1,
      endurance: 1.2,
      speed: 1.1,
      climbing: 1.0
    },
    comments: {
      positive: [
        "{A} keeps ruthless tempo on the haul and never fades.",
        "{A} tops out smoothly and launches into a sharp sprint.",
        "{A} measures effort perfectly for a scorching finish.",
        "{A} breathes under control and crushes the last meters.",
        "{A} hits the platform and accelerates like a rocket.",
        "{A} refuses to slow—wire-to-wire composure.",
        "{A} digs deep and drops everyone in the kick.",
        "{A} races through the chute with flawless form.",
        "{A} crosses the line with a dominant closing burst.",
        "{A} caps the final with an emphatic win."
      ],
      neutral: [
        "{A} climbs with tidy form and steady pulls.",
        "{A} crests the structure and settles into pace.",
        "{A} keeps a controlled stride to the tape.",
        "{A} stays within themselves for a clean finish.",
        "{A} manages fatigue with measured breathing.",
        "{A} avoids mistakes and holds position.",
        "{A} takes a conservative kick to secure placement.",
        "{A} keeps shoulders relaxed and runs it in.",
        "{A} closes respectably after a consistent haul.",
        "{A} finishes composed, if not explosive."
      ],
      negative: [
        "{A} spikes too hard on the haul and blows up.",
        "{A} slips on the structure and loses rhythm.",
        "{A} can’t reset breathing for the run-in.",
        "{A} cramps in the final meters and fades.",
        "{A} misjudges effort and has no kick left.",
        "{A} wobbles off the platform and loses seconds.",
        "{A} looks defeated before the final sprint.",
        "{A} labors through the chute without acceleration.",
        "{A} gets passed late and can’t respond.",
        "{A} crosses the line spent and disappointed."
      ]
    }
  }
];
