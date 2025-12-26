// The Duel II — Daily Challenges (Episodes 1–9)
// Only include skills that are actually used per challenge.
// format: "individual" | "pairs"

window.D2_DAILY_DATA = [
  {
    id: "d2-e01",
    episode: 1,
    name: "Last Man Standing",
    format: "individual",
    description:
      "This challenge involves playing rugby within a large field. First, players are separated into two teams of six — guys vs. guys and girls vs. girls. In the first phase, each same-gender team starts out facing each other on opposite sides, and the team that transfers a rugby ball to the end zone wins the first phase, while the losing team is eliminated. If a player on offense gets tackled to the ground, that player switches to defense, and has to tackle one player on the offensive side, and the process continues until the last player not tackled crosses the finish line, winning the challenge.",
    skillWeights: {
      strength: 1.4,
      speed: 1.2,
      teamwork: 1.1
    },
    comments: {
      positive: [
        "{A} powers through tackles like a machine.",
        "{A} explodes off the line and leaves everyone behind.",
        "{A} times every cut perfectly to slip defenders.",
        "{A} lowers their shoulder and refuses to be stopped.",
        "{A} anticipates lanes and makes all the right reads.",
        "{A} shrugs off contact and keeps churning forward.",
        "{A} communicates assignments and organizes the rush.",
        "{A} keeps calm in the scrum and controls the tempo.",
        "{A} shows ruthless composure at the finish.",
        "{A} seals the win with a final burst of speed."
      ],
      neutral: [
        "{A} holds ground without overcommitting.",
        "{A} plays it safe and avoids big collisions.",
        "{A} keeps a steady pace, nothing flashy.",
        "{A} contributes quietly on both ends.",
        "{A} reads plays well but hesitates at contact.",
        "{A} mixes in smart moves with conservative runs.",
        "{A} keeps their lane and does the basics right.",
        "{A} has a clean game with few risks.",
        "{A} helps the formation but rarely initiates.",
        "{A} finishes middle of the pack after a solid outing."
      ],
      negative: [
        "{A} gets flattened early and never recovers rhythm.",
        "{A} hesitates at contact and loses the lane.",
        "{A} fumbles the ball under pressure.",
        "{A} misreads blocking and runs into traffic.",
        "{A} looks gassed after the opening exchange.",
        "{A} shies from tackles and gets boxed out.",
        "{A} loses focus and gives up a breakaway.",
        "{A} misses a key tackle that swings momentum.",
        "{A} gets turned around and surrenders position.",
        "{A} stalls near the end zone and is caught."
      ]
    }
  },

  {
    id: "d2-e02",
    episode: 2,
    name: "Freezing as Puck",
    format: "pairs",
    description:
      "Players are teamed up into male/female pairs, in two teams of six pairs, with the challenge played in three rounds. The female player sits 'Indian style' on an oversize block of ice, or 'puck,' inside an ice rink, while their male partner has to push them from one end of the rink toward one of two numbered targets on the ice, and accumulate five or ten points for their team, depending on how far the 'puck' travels. The catch: Each player is wearing speedos and bikinis.",
    skillWeights: {
      endurance: 1.1,
      speed: 1.0,
      balance: 0.9,
      teamwork: 1.2
    },
    comments: {
      positive: [
        "{A} & {B} glide with perfect control and timing.",
        "{A} delivers a smooth, powerful push for {B}.",
        "{A} & {B} keep a calm cadence on every attempt.",
        "{A} aims precisely and {B} holds balance flawlessly.",
        "{A} & {B} communicate distances like veterans.",
        "{A}'s acceleration sets {B} up for a clean score.",
        "{A} & {B} adjust mid-run and still nail the target.",
        "{A} keeps the momentum steady while {B} stays centered.",
        "{A} & {B} read the ice and make smart corrections.",
        "{A} & {B} finish their set with a clutch ten-point slide."
      ],
      neutral: [
        "{A} & {B} keep things tidy with minimal slips.",
        "{A} pushes conservatively while {B} stays upright.",
        "{A} & {B} talk through each run methodically.",
        "{A} focuses on accuracy over pace.",
        "{B} stabilizes well after a shaky start.",
        "{A} & {B} settle into an average rhythm.",
        "{A} checks speed often to avoid over-shooting.",
        "{B} re-centers after each bump and carries on.",
        "{A} & {B} hit the five-point zone consistently.",
        "{A} & {B} complete all rounds without drama."
      ],
      negative: [
        "{A} & {B} spin out and lose the line completely.",
        "{A} overpowers the push and {B} topples off balance.",
        "{A} & {B} argue about angle and miss the target.",
        "{A} slips at the start and ruins the momentum.",
        "{B} can't stabilize and the run collapses.",
        "{A} & {B} misjudge the ice and drift wide.",
        "{A} rushes and sends {B} into a slow wobble.",
        "{A} & {B} clip the marker and score nothing.",
        "{A} under-aims and leaves points on the rink.",
        "{A} & {B} finish last after repeated wipeouts."
      ]
    }
  },

  {
    id: "d2-e03",
    episode: 3,
    name: "All Shook Up",
    format: "pairs",
    description:
      "Players have to hang on to a pair of parallel ropes that are stretched out over a muddy pit, and have to shake their opponents off the ropes. The challenge is played in multiple rounds — guys vs. guys and girls vs. girls — with the winners of the first three rounds advancing to the final round. The last player standing on the ropes wins the challenge.",
    skillWeights: {
      balance: 1.2,
      speed: 1.1,
      mental: 1.0,
      teamwork: 1.1
    },
    comments: {
      positive: [
        "{A} & {B} fly through the course with fearless precision.",
        "{A} keeps a steady line while {B} matches the rhythm.",
        "{A} & {B} solve the puzzle almost instantly.",
        "{A} communicates steps clearly and {B} executes.",
        "{A} & {B} read the track and keep perfect posture.",
        "{A} handles transitions while {B} locks in focus.",
        "{A} & {B} adapt to the wobble and never slow down.",
        "{A} spots a key pattern that cracks the puzzle.",
        "{A} & {B} combine speed and smarts seamlessly.",
        "{A} celebrates with {B} after a textbook finish."
      ],
      neutral: [
        "{A} & {B} maintain decent balance on each run.",
        "{A} slows slightly so {B} can re-center.",
        "{A} & {B} stay composed through minor slips.",
        "{A} checks in with {B} before each step.",
        "{A} & {B} make small errors but recover well.",
        "{A} conserves speed for cleaner turns.",
        "{A} & {B} finish mid-pack with tidy form.",
        "{A} troubleshoots one puzzle piece patiently.",
        "{A} & {B} keep talking and avoid panic.",
        "{A} rounds out a steady if unspectacular showing."
      ],
      negative: [
        "{A} & {B} wobble badly and lose momentum.",
        "{A} over-steers and forces {B} off line.",
        "{A} & {B} freeze on the puzzle under pressure.",
        "{A} second-guesses {B} and the pace collapses.",
        "{A} & {B} bicker about piece placement.",
        "{A} crashes on the turn and rattles {B}.",
        "{A} & {B} never find the solution in time.",
        "{A} misreads a clue and sends them backward.",
        "{A} & {B} lose balance at the bottom ramp.",
        "{A} finishes shaken while {B} looks frustrated."
      ]
    }
  },

  {
    id: "d2-e04",
    episode: 4,
    name: "Luging My Mind",
    format: "pairs",
    description:
      "Played in male/female pairs, each pair has to race up and down a luge course to solve a puzzle, while wearing oversize replica bobbleheads of themselves that resemble lamp shades. To start, the guys race up the course to the top, and have to ride back down in a luge car to the bottom of the course, where their female partners will repeat the process. Once the girls meet their male partners at the bottom, each pair will team up, and race to solve a puzzle. The first team to solve their puzzle wins.",
    skillWeights: {
      speed: 1.2,
      balance: 1.1
    },
    comments: {
      positive: [
        "{A} & {B} blaze through every section with control.",
        "{A} keeps the sled dialed in while {B} mirrors posture.",
        "{A} & {B} carry speed perfectly into the finish.",
        "{A} holds a tight line and {B} never wavers.",
        "{A} & {B} react instantly to each curve.",
        "{A} maintains velocity with silky steering.",
        "{A} & {B} make the bobbleheads look effortless.",
        "{A} accelerates cleanly and {B} anchors balance.",
        "{A} & {B} post a time others can’t touch.",
        "{A} closes strong while {B} keeps the sled stable."
      ],
      neutral: [
        "{A} & {B} favor control over raw speed.",
        "{A} backs off slightly in tighter sections.",
        "{A} & {B} ride steady with light corrections.",
        "{A} tests the edge then resets posture.",
        "{A} & {B} take no risks and avoid mistakes.",
        "{A} taps the brake to keep {B} centered.",
        "{A} & {B} string together consistent runs.",
        "{A} trusts {B}'s cues and eases into turns.",
        "{A} & {B} finish with a respectable time.",
        "{A} shakes out tension and resets calmly."
      ],
      negative: [
        "{A} & {B} skid out and lose the line early.",
        "{A} overcooks a turn and {B} can’t recover.",
        "{A} & {B} slow to a crawl after a wobble.",
        "{A} misjudges the apex and drifts wide.",
        "{A} & {B} collide with the berm and stall.",
        "{A} leans too hard and throws {B} off.",
        "{A} & {B} panic and scrub too much speed.",
        "{A} clips the edge and rattles {B}'s balance.",
        "{A} & {B} finish near the bottom after errors.",
        "{A} ends frustrated while {B} looks shaken."
      ]
    }
  },

  {
    id: "d2-e05",
    episode: 5,
    name: "Don't Let Go",
    format: "pairs",
    description:
      "A swing is suspended 360 feet in a canyon over the Shotover River. Players are teamed up into male/female pairs, with the girls harnessed from a swing and their male partners harnessed from a platform hanging from the edge of a cliff. Once the swing mechanisms are released, the guys have to hang on to their female partners with their hands for as long as possible, before the girls are eventually swung 200 feet downward in the form of a bungee jumping contest. The team that hangs on for the longest time wins.",
    skillWeights: {
      endurance: 1.3,
      teamwork: 1.1
    },
    comments: {
      positive: [
        "{A} & {B} breathe together and lock in for ages.",
        "{A} talks {B} through the fear with steady cues.",
        "{A} & {B} find a calm rhythm and never panic.",
        "{A} holds strong while {B} stays composed.",
        "{A} & {B} manage nerves and focus on timing.",
        "{A} encourages {B} with quiet, consistent support.",
        "{A} & {B} communicate every adjustment perfectly.",
        "{A} refuses to slip and {B} trusts the grip.",
        "{A} & {B} outlast the field with pure resolve.",
        "{A} smiles at {B} as they ride out the final seconds."
      ],
      neutral: [
        "{A} & {B} hang on respectably before losing grip.",
        "{A} counts down breaths while {B} steadies nerves.",
        "{A} & {B} keep it together through early swings.",
        "{A} focuses on form while {B} manages fear.",
        "{A} & {B} last longer than expected.",
        "{A} maintains hold until a tough sway breaks rhythm.",
        "{A} & {B} check in often and stay patient.",
        "{A} adjusts hands while {B} resettles posture.",
        "{A} & {B} finish mid-pack with a clean effort.",
        "{A} nods to {B} after a solid if brief run."
      ],
      negative: [
        "{A} & {B} let go seconds after the drop.",
        "{A} panics and loses grip immediately.",
        "{A} & {B} can’t sync breathing and fade fast.",
        "{A} shouts in fear and throws off {B}'s focus.",
        "{A} & {B} argue about hand position mid-swing.",
        "{A} slips early and {B} screams in frustration.",
        "{A} & {B} never settle into a rhythm.",
        "{A} freezes up and releases under pressure.",
        "{A} & {B} post the shortest hang time of the day.",
        "{A} looks shaken while {B} is visibly upset."
      ]
    }
  },

  {
    id: "d2-e06",
    episode: 6,
    name: "Dangle Duo",
    format: "pairs",
    description:
      "Played in male/female pairs, each pair has to climb up a 100-foot ladder suspended from a platform hanging above the Kowhai River, and raise a flag to the top with a rope. A team is disqualified is one or both players fall off the ladder or do not raise a flag within a 20-minute time limit. The team that raises a flag in the fastest time wins.",
    skillWeights: {
      climbing: 1.4,
      speed: 1.1
    },
    comments: {
      positive: [
        "{A} & {B} climb in perfect rhythm rung by rung.",
        "{A} moves like a metronome while {B} keeps pace.",
        "{A} & {B} transition to the flag rope flawlessly.",
        "{A} sprints upward and {B} matches tempo.",
        "{A} & {B} never hesitate and keep momentum.",
        "{A} calls quick cues that {B} executes instantly.",
        "{A} & {B} post a blistering time to the top.",
        "{A} floats up the ladder while {B} locks in.",
        "{A} & {B} stay light on their feet despite the sway.",
        "{A} taps the flag as {B} secures the rope cleanly."
      ],
      neutral: [
        "{A} & {B} take steady steps with brief pauses.",
        "{A} slows so {B} can reset grip safely.",
        "{A} & {B} trade short leads up the ladder.",
        "{A} keeps a careful rhythm to avoid slips.",
        "{A} & {B} climb conservatively but consistently.",
        "{A} checks holds as {B} breathes evenly.",
        "{A} & {B} regroup halfway and continue.",
        "{A} clears small wobbles while {B} adjusts footing.",
        "{A} & {B} finish with a respectable time.",
        "{A} shakes out forearms as {B} steadies the rope."
      ],
      negative: [
        "{A} & {B} lose footing and stall out.",
        "{A} slips and forces {B} to stop completely.",
        "{A} & {B} can’t regain rhythm after a swing.",
        "{A} freezes midway and {B} gets rattled.",
        "{A} & {B} waste time regripping every rung.",
        "{A} kicks a rung and throws off {B}'s balance.",
        "{A} & {B} time out before raising the flag.",
        "{A} falls and disqualifies the pair.",
        "{A} & {B} argue over pace and fall behind.",
        "{A} ends exhausted while {B} looks defeated."
      ]
    }
  },

  {
    id: "d2-e07",
    episode: 7,
    name: "Burnt",
    format: "individual",
    description:
      "The challenge is played in separate rounds — male and female. A structure is suspended from a platform hanging 30 feet above a lake, with a pulley system and seven flags attached to barrels on the lake's shore. Each player is hanging from the top of the structure, and has to pull on their designated rope as fast as possible, which will send their flag toward their own barrel. Once six out of seven flags have reached the barrel, the one remaining barrel will explode, dropping the player attached to the barrel into the water. The process continues until the last player hanging wins.",
    skillWeights: {
      climbing: 1.2,
      strength: 1.3
    },
    comments: {
      positive: [
        "{A} hauls the rope with relentless power.",
        "{A} never slows down and controls each pull.",
        "{A} holds perfect form even as arms burn.",
        "{A} digs deep and keeps the line flying.",
        "{A} stays composed while others panic.",
        "{A} shows elite upper-body endurance.",
        "{A} breathes efficiently and maintains tempo.",
        "{A} keeps a laser focus on every flag movement.",
        "{A} outlasts everyone with sheer grit.",
        "{A} seals the round with an emphatic final pull."
      ],
      neutral: [
        "{A} keeps a steady cadence for most of the round.",
        "{A} paces themselves and avoids early burnout.",
        "{A} stays quiet and focused on the rope.",
        "{A} mixes short bursts with controlled rests.",
        "{A} fights through a fade and holds position.",
        "{A} maintains rhythm without big swings.",
        "{A} chooses efficiency over flashy speed.",
        "{A} lasts longer than expected.",
        "{A} looks composed but conservative.",
        "{A} ends mid-pack after a solid grind."
      ],
      negative: [
        "{A} gasses out after the opening minute.",
        "{A} loses grip and slips off the rope.",
        "{A} rushes early and can’t sustain tempo.",
        "{A} panics and wastes pulls with poor form.",
        "{A} stalls repeatedly and gets overtaken.",
        "{A} mismanages energy and fades quickly.",
        "{A} loses focus and stops tracking the flag.",
        "{A} can’t reset grip and drops the line.",
        "{A} gets rattled by the explosion and lets go.",
        "{A} falls into the water with a frustrated splash."
      ]
    }
  },

  {
    id: "d2-e08",
    episode: 8,
    name: "Upside Downer",
    format: "individual",
    description:
      "A rope platform is suspended from a structure high above the Kowhai River, and players have to swing upside down from ropes from one side of the platform to the other, and collect as many Māori carvings as possible within a 10-minute limit. A player is disqualified if he/she does not make it to the end of the platform within 10 minutes. The player that collects each carving in the fastest time wins.",
    skillWeights: {
      balance: 1.1,
      endurance: 1.0,
      strategy: 1.2
    },
    comments: {
      positive: [
        "{A} plans the path perfectly and wastes no motion.",
        "{A} cores up and stays rock-steady upside down.",
        "{A} times each swing to snag carvings effortlessly.",
        "{A} breathes calmly and sticks to a smart route.",
        "{A} makes crisp grabs and never overreaches.",
        "{A} keeps legs locked and transitions cleanly.",
        "{A} anticipates rope sway and counters it.",
        "{A} paces beautifully and beats the clock.",
        "{A} shows elite control on every reach.",
        "{A} finishes with a grin after a flawless run."
      ],
      neutral: [
        "{A} takes a safe line and avoids big risks.",
        "{A} pauses often to reset grip and breathe.",
        "{A} switches ropes carefully and keeps moving.",
        "{A} chooses a simple route over a faster one.",
        "{A} regains control after a few wobbles.",
        "{A} keeps composure when the platform sways.",
        "{A} collects steadily without rushing.",
        "{A} adjusts the plan mid-run and carries on.",
        "{A} finishes within time with moderate pickups.",
        "{A} ends with a tidy, controlled effort."
      ],
      negative: [
        "{A} misjudges the swing and whiffs a grab.",
        "{A} wastes time re-centering after every reach.",
        "{A} picks a poor route and runs the clock down.",
        "{A} overextends and loses core tension.",
        "{A} slips off a rope and has to reset.",
        "{A} panics as the timer winds down.",
        "{A} never finds balance and drifts sideways.",
        "{A} fails to reach the end within ten minutes.",
        "{A} forgets a carving and has to backtrack.",
        "{A} finishes flustered with very few pickups."
      ]
    }
  },

  {
    id: "d2-e09",
    episode: 9,
    name: "Spelling Air",
    format: "individual",
    description:
      "A platform is suspended from a structure above Lake Johnson, and players are hanging 100 feet above the water from the top of the platform. Each player is asked to spell a word. A player is dropped into the water and disqualified if he/she misspells a word. The process continues until the last player hanging wins.",
    skillWeights: {
      mental: 1.4
    },
    comments: {
      positive: [
        "{A} rattles off tough words without blinking.",
        "{A} asks for the definition and nails it.",
        "{A} spells calmly while others tense up.",
        "{A} visualizes the letters and delivers cleanly.",
        "{A} corrects mid-thought and stays composed.",
        "{A} handles obscure terms like a pro.",
        "{A} breathes, focuses, and answers perfectly.",
        "{A} whispers the pattern and locks it in.",
        "{A} never wavers even on the trick rounds.",
        "{A} wins with ice-cold concentration."
      ],
      neutral: [
        "{A} double-checks letters carefully before answering.",
        "{A} asks for a repeat and stays measured.",
        "{A} spells the common words cleanly.",
        "{A} takes a long pause but gets it right.",
        "{A} looks unsure yet finds the correct sequence.",
        "{A} survives a few rounds with cautious pacing.",
        "{A} uses the origin to guide their guess.",
        "{A} spells steadily without big swings.",
        "{A} keeps nerves in check most of the time.",
        "{A} lasts several rounds with deliberate focus."
      ],
      negative: [
        "{A} blanks on an easy word and drops immediately.",
        "{A} rushes the letters and misspells.",
        "{A} mixes up vowels and panics.",
        "{A} spells confidently — and completely wrong.",
        "{A} second-guesses and changes to the wrong letter.",
        "{A} mishears the word and guesses wildly.",
        "{A} fumbles the ending and gets cut.",
        "{A} collapses under pressure and stumbles.",
        "{A} forgets a double letter and pays the price.",
        "{A} splashes down after a very rough round."
      ]
    }
  }
];
