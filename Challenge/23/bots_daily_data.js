/* Battle of the Seasons — Dailies
   One entry per episode (1–11). */

window.BOTS_DAILY_DATA = [
  // ----- Episode 1 -----
  {
    episode: 1,
    name: "Don't Cross Me",
    description: "There are four giant beams shaped like two crosses suspended 25 feet above the water, with ladders coming down from the edges. The object is to cross the beams, meet at the center, then climb back down the ladders until all team members reach the markers. If one player falls off the ladder or the beams, that player, along with their teammate on the other side, has to start over at the bottom of the ladder. The team that crosses the beams and climbs down the ladders in the fastest time becomes the power team, while the team with the slowest time is automatically sent to the Arena.",
    skillWeights: { climbing: 1.5, speed: 1.2, teamwork: 1 },
    comments: {
      positive: [
"{A} moves across the beams with flawless balance and total confidence",
"{A} meets their teammate at the center perfectly synchronized like it was rehearsed",
"{A} climbs down the ladder with steady precision never losing a single step",
"{A} recovers from a wobble with impressive control keeping the team alive",
"{A} leads the pace flawlessly guiding their partner through every transition"
      ],
      neutral: [
"{A} takes cautious steps across the beams maintaining a careful rhythm",
"{A} pauses at the center checking the footing before moving again",
"{A} climbs the ladder slowly making sure each rung is secure",
"{A} waits patiently for their partner to catch up before continuing",
"{A} tests the balance of the beam with small steps before committing"
      ],
      negative: [
"{A} slips on the beam and barely avoids falling off",
"{A} hesitates too long at the center slowing the team's momentum",
"{A} loses grip on the ladder and has to reset from the bottom",
"{A} throws off the balance with uneven steps forcing their teammate to stop",
"{A} panics on the beam wobbling uncontrollably until they fall"
      ]
    }
  },

  // ----- Episode 2 -----
  {
    episode: 2,
    name: "Oil Change",
    description: "Players from two opposing teams have to wrestle each other out of a square pit filled with olive oil, alternating between male and female. A team wins if one player from the opposing team makes contact with a boundary surrounding the pit. The player that wins the wrestling match collects one of four puzzle pieces needed to complete their team icon, and gets to choose the match for the next round. If nobody wins a match within a 10-minute time limit, the match ends in a draw with no puzzle pieces earned. The first team to collect four puzzle pieces becomes the power team; however, the challenge continues until the last team that fails to collect all of their puzzle pieces is automatically sent to the Arena.",
    skillWeights: { strength: 2, endurance: 1.2 },
    comments: {
      positive: [
"{A} slips past their opponent with perfect control and drives them straight toward the boundary",
"{A} uses the oil to their advantage, gliding into a clean takedown that shocks the entire pit",
"{A} locks in a strong grip and powers their opponent out with pure strength and confidence",
"{A} recovers from a slip with flawless agility and turns it into a winning push",
"{A} stays centered and balanced, forcing their opponent to lose footing first",
"{A} dominates the match from start to finish, barely breaking a sweat",
"{A} finds the perfect angle and bulldozes their opponent out of the pit",
"{A} keeps calm under pressure and makes the winning move at the last possible second",
"{A} executes a clever maneuver, flipping the momentum and claiming the puzzle piece",
"{A} uses a burst of power to seal the victory and energize their entire team"
      ],
      neutral: [
"{A} circles carefully in the pit, waiting for the right moment to make a move",
"{A} maintains a steady defensive stance while searching for an opening",
"{A} slips once but quickly regains balance without losing position",
"{A} engages in a cautious grapple as both players test each other's strength",
"{A} tries a slow push forward, neither gaining nor losing ground",
"{A} adjusts footing on the slick surface before committing to a move",
"{A} holds the center of the pit, keeping the match controlled and even",
"{A} makes a small attempt to shove but resets after minimal movement",
"{A} keeps a careful eye on the boundary while planning the next action",
"{A} maintains a neutral lock-up, waiting for their opponent to make the first mistake"
      ],
      negative: [
"{A} loses footing immediately and slips straight onto their back",
"{A} charges too fast and slides past their opponent completely",
"{A} gets tossed off balance and dragged dangerously close to the boundary",
"{A} attempts a takedown but falls flat in the oil with no control",
"{A} panics after slipping and gives up crucial ground",
"{A} tries to push back but gets overpowered in seconds",
"{A} fumbles a grip, giving their opponent full advantage",
"{A} attempts a risky move that backfires instantly",
"{A} gets pushed out of the pit with barely any resistance",
"{A} loses stamina quickly and becomes an easy target for a counterpush"
      ]
    }
  },
  // ----- Episode 3 -----
  {
    episode: 3,
    name: "Hook, Line & Sinker",
    description: "A platform is suspended from a structure 30 feet above water, and teams have to advance from one side of the platform to the other using metal hooks and foot holds. A team is disqualified if one player falls into the water or does not make it to the end within a 10-minute time limit. The team that makes it to the end of the platform in the fastest time becomes the new power team, while the team with the slowest time is automatically sent to the Arena.",
    skillWeights: { balance: 2, strength: 1, teamwork: 1.5 },
    comments: {
      positive: [
"{A} hooks onto the platform with perfect control and moves across like it’s nothing",
"{A} finds the rhythm instantly and glides from foothold to foothold with zero hesitation",
"{A} keeps flawless balance while coordinating every movement with the team",
"{A} climbs with total precision, calling out clear directions to keep everyone synced",
"{A} adjusts grip smoothly and pushes their team forward with clean, confident motions",
"{A} moves fluidly across the metal rungs, never losing momentum for a second",
"{A} helps stabilize the team during a tough stretch, guiding them through every step",
"{A} keeps a calm voice and steady pace, leading the team with impressive focus",
"{A} uses a perfect mix of strength and technique to stay secure on every hold",
"{A} reaches the final section flawlessly and pulls the team to the finish with ease"
      ],
      neutral: [
"{A} tests each foothold cautiously before shifting their weight forward",
"{A} moves steadily across the platform, keeping a careful pace with the team",
"{A} takes a moment to adjust their grip before continuing along the hooks",
"{A} checks in with teammates to make sure everyone is ready before the next move",
"{A} breathes deeply and keeps a consistent rhythm down the line",
"{A} pauses briefly at a tricky section but stays focused on the team’s timing",
"{A} keeps their eyes on the next hold, planning the safest way across",
"{A} matches the team’s pace and stays balanced through the center of the platform",
"{A} carefully navigates the tighter parts of the course without rushing",
"{A} stays close to the team, helping maintain an even formation across the structure"
      ],
      negative: [
"{A} slips on a foothold and barely manages to hang on",
"{A} hesitates too long and throws off the team’s momentum",
"{A} grabs the wrong hook and causes a moment of chaos on the line",
"{A} panics at the midpoint and freezes before teammates help them move",
"{A} missteps on the foothold and swings dangerously off balance",
"{A} struggles to keep up with the pace and slows the entire team down",
"{A} loses grip during a transition and nearly drops into the water",
"{A} shakes the platform with an awkward step, making the team scramble to stabilize",
"{A} can’t reach the next hold and forces the others to stop entirely",
"{A} fumbles repeatedly on the hooks and makes the final stretch take twice as long"
      ]
    }
  },
  // ----- Episode 4 -----
  {
    episode: 4,
    name: "Don't Weigh Me Down",
    description: "Teams have to hold up a large basket attached to a rope from a platform. Each team is split in half — one half of the team is standing atop their designated platform holding up their basket, while the other half runs to a rockpile, and deposits heavy rocks in their opponents baskets. The players atop the platform have to keep their baskets from touching the ground for as long as possible, while opposing players try to weigh down their opponents baskets with the heavy rocks. The team whose basket touches the ground first is automatically sent to the Arena, while the last team to keep their basket full of rocks from touching ground level wins Power Team.",
    skillWeights: { strength: 2, speed: 0.6, endurance: 1.5 },
    comments: {
      positive: [
"{A} lifts the basket rope with perfect control, barely flinching as the weight piles on",
"{A} keeps their stance solid, anchoring the basket like an absolute machine",
"{A} holds steady while their team piles rocks on the opponents with surgical precision",
"{A} braces the rope effortlessly, showing no signs of strain even as the basket sags",
"{A} keeps their grip locked and shoulders squared, refusing to let the basket dip an inch",
"{A} times their rock runs flawlessly, delivering heavy hits to the opposing basket",
"{A} keeps their posture tight, absorbing every tremor from the shifting weight above",
"{A} encourages their team while holding steady, fueling everyone’s momentum",
"{A} plants their feet and takes full control of the rope, keeping the basket perfectly balanced",
"{A} unleashes a rapid-fire rock drop that throws the opposing team into panic"
      ],
      neutral: [
"{A} adjusts their footing slowly, trying to settle into a comfortable stance",
"{A} delivers rocks at a consistent pace, keeping focus on the routine rather than speed",
"{A} takes a moment to wipe sweat before grabbing another rock from the pile",
"{A} shifts their hands on the rope, settling into a steadier grip",
"{A} watches the opposing basket rise and fall, measuring their next move",
"{A} moves rocks methodically, taking time to choose each one",
"{A} breathes steadily and waits for the next batch of rocks to be delivered",
"{A} keeps the rope taut, neither gaining nor losing control",
"{A} hesitates briefly before deciding which team to target with their next load",
"{A} jogs through the rockpile at a moderate speed, pacing themselves for the long haul"
      ],
      negative: [
"{A} loses grip for a moment and the basket dips dangerously toward the ground",
"{A} grabs the rope too low and nearly sends the whole basket crashing down",
"{A} struggles to lift even as the first few rocks are added",
"{A} runs with a rock but slips, barely recovering before dropping it",
"{A} misjudges a throw and accidentally drops a rock short of the opponent’s basket",
"{A} panics when the rope suddenly shifts and almost loses balance",
"{A} buckles under the strain and has to readjust repeatedly",
"{A} slows down drastically, unable to keep pace with the rest of the rock runners",
"{A} stares helplessly as the basket sinks lower and lower with each added rock",
"{A} releases the rope too quickly and causes a heavy jolt that rattles the entire team"
      ]
    }
  },
  // ----- Episode 5 -----
  {
    episode: 5,
    name: "Chairman of the Board",
    description: "One member of each team sits on a chair on a platform suspended 30 feet above water. Contestants are asked trivia questions on categories like sports, U.S. currency, previous Challenges, The Real World seasons, and spelling. At the end of each round, if a player has fallen and still has teammates left, another team member may take their place on the platform. The first team to lose all members is automatically sent to the Arena, while the last team with a player on the platform wins power team.",
    skillWeights: { mental: 1 },
    comments: {
      positive: [
"{A} answers instantly, leaving everyone stunned at how random trivia seems to be their superpower",
"{A} fires off correct answers like they’ve been studying flashcards in their sleep",
"{A} stays perfectly calm on the platform, flexing brainpower with every question",
"{A} spells every word flawlessly, barely blinking before responding",
"{A} takes the chair like a throne and crushes each question with villainous confidence",
"{A} shocks the house with a clutch answer that keeps the team alive another round",
"{A} laughs in the face of the question and nails it with style",
"{A} gives the host a smirk before guessing correctly without hesitation",
"{A} defeats every category thrown at them, from sports to spelling to currency",
"{A} refuses to fall, answering so well the other teams start whispering about witchcraft"
      ],
      neutral: [
"{A} hesitates for a moment before giving a steady, acceptable answer",
"{A} gets a medium-difficulty question and handles it just fine",
"{A} takes the chair quietly, giving a serviceable but unexciting performance",
"{A} double-checks their spelling out loud before answering calmly",
"{A} shrugs at the question and provides a safe guess",
"{A} stays balanced on the seat, neither panicking nor shining",
"{A} gives an answer that isn’t impressive but keeps the team afloat",
"{A} listens carefully to the question before responding with a reasonable attempt",
"{A} trades average answers with the host without causing any big moment",
"{A} survives the round by doing just enough to move on"
      ],
      negative: [
"{A} panics the moment they sit down and blurts out the wrong answer immediately",
"{A} spells the word so badly the house collectively gasps",
"{A} guesses wildly and sends their team screaming as the chair drops",
"{A} freezes completely, unable to come up with anything before time runs out",
"{A} answers a question about The Real World with the confidence of a winner and the accuracy of a disaster",
"{A} insists they know it, then gets it embarrassingly wrong",
"{A} confuses two obvious facts and becomes the reason their team plummets",
"{A} mispronounces the answer, gets it wrong, and falls instantly",
"{A} laughs nervously, gives the worst guess possible, and drops like a stone",
"{A} gets eliminated so fast the house jokes the chair should’ve asked an easier question"
      ]
    }
  },
  // ----- Episode 6 -----
  {
    episode: 6,
    name: "Insane Games",
    description: "This challenge consists of a series of games: \"Chariot Race,\" \"Egg Drop,\" \"Ear Pull,\" a Winner's Playoff and \"Fish Head.\" The team that finishes last in the first two games will compete in a loser's bracket at the end in order to avoid the Arena.<br><br>" +
"\"Chariot Race\": One guy from each team has to act as a \"horse,\" and pull a sled with his teammates inside the sled. The player pulling the sled has to wear a horse mask, which will make it hard to see, and will require communication from the entire team.<br><br>" +
"\"Egg Drop\": One guy and one girl from each team is chosen to toss eggs over a 10-foot wall. One player on the other side of the wall wears a collar around his/her head (shaped like an oversize funnel), and has to catch the egg in their collar. The first team to catch six eggs in their collar wins.<br><br>" +
"\"Ear Pull\": One player per team sits on a pair of logs, and has to pull a two-foot string from their opponent's ear by only using their own ears and faces. The game is played in same-gender rounds, in a best 2 out of 3. The top two teams advance to a playoff round for a chance to win Power Team.<br><br>" +
"Winner's playoff: Teams Las Vegas and New Orleans compete in a jousting race. Teams approach each other in opposite directions on a track, with a wooden rail in the middle. The riders in the chariot have to knock their opponent off their chariot. The first team to do so wins Power Team.<br><br>" +
"Loser's round — \"Fish Head\": One player from each team has to knock their opponent off a platform, using a 15-pound fish. The game is played in same-gender rounds. If teams are tied after the first two rounds, a sudden-death round is played, in which T. J. Lavin flips a coin to determine which gender will compete. The losing team is automatically sent to the Arena.",
    skillWeights: { balance: 0.5, strength: 0.6, endurance: 0.8, speed: 1.5, teamwork: 2, strategy: 1.5 },
    comments: {
      positive: [
"{A} guides the chariot perfectly despite the horse mask blocking half their vision",
"{A} calls out flawless directions, keeping their team on track during the Chariot Race",
"{A} launches the egg with perfect arc, dropping it straight into their teammate’s collar",
"{A} catches the egg cleanly, barely moving as it lands in the funnel collar",
"{A} locks into the Ear Pull and drags the string with wild determination",
"{A} keeps steady control in the jousting race, knocking their opponent off in one clean hit",
"{A} swings the fish like a pro, sending their opponent flying off the platform",
"{A} communicates clearly through every stage, keeping the team focused",
"{A} stays calm and confident, excelling in every weird game thrown at them",
"{A} digs deep in the final playoff, helping secure Power Team with a powerhouse performance"
      ],
      neutral: [
"{A} adjusts the horse mask and trots forward cautiously during the Chariot Race",
"{A} tosses the egg with a safe, steady rhythm over the wall",
"{A} stands ready under the collar funnel, waiting patiently for the next egg",
"{A} grips the Ear Pull string carefully, trying not to flinch",
"{A} keeps a balanced pace during the chariot joust, staying focused on timing",
"{A} swings the fish with measured effort, aiming carefully",
"{A} checks in with teammates before each game, making sure everyone understands the plan",
"{A} keeps a neutral expression as the challenge switches from one bizarre event to the next",
"{A} takes a moment to watch other teams perform before their turn",
"{A} follows instructions step by step, staying steady throughout the multi-stage challenge"
      ],
      negative: [
"{A} runs the chariot straight into a barrier because they can barely see through the mask",
"{A} launches the egg wildly off course, splattering it far from the collar",
"{A} fumbles every egg that comes their way, missing the collar completely",
"{A} loses grip in the Ear Pull, giving up the round instantly",
"{A} misjudges the jousting angle and falls off their own chariot without being hit",
"{A} swings the fish too early and spins themselves off the platform",
"{A} shouts confusing directions that send the team in the wrong direction",
"{A} panics during the Egg Drop and throws the egg straight into the ground",
"{A} freezes in the Ear Pull, unable to move forward or backward",
"{A} unintentionally sabotages their team’s chance at Power Team with sloppy execution"
      ]
    }
  },
  // ----- Episode 7 -----
  {
    episode: 7,
    name: "Logged Out",
    description: "Each team has to solve a simple memory game while hiking up a tall mountain. Each team starts at the foot of the mountain, where the first station shows the 9 pieces that solve the puzzle. They then must hike up to the second station, where there are 13 logs with pictures of the pieces; each team must carry the logs to the top of the mountain and reassemble them in the right position. Everyone must stay together at all times. The first team to get the puzzle right wins Power Team, while the team that fails to complete their puzzle is automatically sent to the Arena.",
    skillWeights: { speed: 1, endurance: 2, mental: 1 },
    comments: {
      positive: [
"{A} memorizes the pattern instantly and charges up the mountain with total confidence",
"{A} carries their log like it weighs nothing, keeping the team’s pace strong",
"{A} calls out the correct piece order the moment they reach the top",
"{A} encourages everyone to stay tight, keeping the formation flawless",
"{A} places their log perfectly on the first try, wasting zero time",
"{A} keeps the team motivated as the incline gets brutal",
"{A} remembers every symbol and guides the reassembly with precision",
"{A} powers through the steep climb without slowing a step",
"{A} locks the final piece in place with a proud grin",
"{A} leads the team to the puzzle with unwavering focus"
      ],
      neutral: [
"{A} studies the nine pieces carefully before starting the climb",
"{A} adjusts grip on their log and settles into a steady pace",
"{A} double-checks the piece order at the top just to be sure",
"{A} takes a quiet moment to catch their breath before assembling",
"{A} follows the team’s lead while carrying their piece uphill",
"{A} stays in formation, keeping the hike organized",
"{A} places their log down gently as the team discusses strategy",
"{A} moves up the trail with even steps, conserving energy",
"{A} reviews the memory board in their head as they climb",
"{A} helps hold pieces while teammates fit them together"
      ],
      negative: [
"{A} forgets half the pattern before they even start hiking",
"{A} struggles to lift their log and slows the entire formation",
"{A} places their piece wrong and forces the team to rearrange everything",
"{A} falls behind on the trail, making everyone stop and wait",
"{A} mixes up two symbols and insists they’re right",
"{A} drops their log halfway up the mountain, causing chaos",
"{A} guesses the puzzle order randomly at the top",
"{A} keeps wandering out of formation and getting yelled at",
"{A} stands confused at the puzzle while teammates redo their placement",
"{A} insists they remembered the whole pattern, then clearly didn’t"
      ]
    }
  },
  // ----- Episode 8 -----
  {
    episode: 8,
    name: "Hunger Games",
    description: "Food items are presented to the contestants. Each team writes an estimation of how much of that food item they can eat; the team with the highest estimation is then required to eat said item. If the team fails to reach the quantity they declared, they move onto the losers round. If the team wins, they choose another team to enter the losers round, and their team advances to the winners round. A team is disqualified if even one team member vomits. The two losing teams compete head-to-head to each as much food as possible within two minutes to decide the losing team. The two winning teams compete head-to-head to each as much food as possible within two minutes to decide the new Power Team, while the team who loses the losers round is automatically sent to the Arena.",
    skillWeights: { eating: 2, strategy: 1.2 },
    comments: {
      positive: [
"{A} declares a huge number with total confidence and the team smashes it",
"{A} eats with ruthless efficiency, shocking everybody watching",
"{A} leads the team through the disgusting plate like it’s a casual lunch",
"{A} keeps everyone focused, chanting to stay in rhythm as they devour the food",
"{A} motivates the team by making the challenge look weirdly easy",
"{A} powers through the meal without flinching once",
"{A} sets the pace and the rest of the team follows flawlessly",
"{A} refuses to slow down, clearing their portion with villainous determination",
"{A} handles the grossest bites like an absolute pro",
"{A} pushes the team over the finish line with unstoppable momentum"
      ],
      neutral: [
"{A} studies the food cautiously before agreeing to the team’s estimation",
"{A} eats at a steady pace, not rushing but not falling behind",
"{A} quietly checks in with teammates to keep the pace consistent",
"{A} takes small bites, staying calm and methodical",
"{A} follows the group’s plan without complaining or cheering",
"{A} keeps an eye on the clock while chewing slowly",
"{A} stays neutral, offering no reaction to the food’s taste",
"{A} focuses on the numbers more than the food itself",
"{A} plays it safe by suggesting a middle-ground estimation",
"{A} stays quiet but committed while the team works through the plate"
      ],
      negative: [
"{A} overestimates the team’s ability and instantly regrets it",
"{A} gags loudly and sends the whole table into panic",
"{A} takes one bite and nearly calls for a medic",
"{A} blames the team for the estimation moments after agreeing to it",
"{A} taps out early and leaves teammates scrambling to make up the difference",
"{A} dramatically announces they cannot eat another bite",
"{A} stares at the food in pure betrayal before refusing to continue",
"{A} starts dry heaving before the timer even begins",
"{A} begs their teammates to lower the estimation and gets ignored"
      ]
    }
  },
  // ----- Episode 9 -----
  {
    episode: 9,
    name: "Abandon Ship",
    description: "Teams have to race a life raft from a ship to the shore. First, at least one player has to pull off three buoys from a line resting 25, 20 and 15 feet below the surface of the life raft buoy, which is five feet below the water. After the last buoy is pulled, the life raft immediately inflates above the water, and each team races in their life raft to the shore. A team is given a five-minute penalty is a player does not pull off a buoy before a teammate jumps off the ship into the water. The team that advances their life raft to the shore in the fastest time wins Power Team, while the team with the slowest time is automatically sent to the Arena.",
    skillWeights: { swimming: 2, speed: 1.5 },
    comments: {
      positive: [
"{A} dives deep immediately, ripping the buoy free like it was nothing",
"{A} powers through the water with perfect control, reaching each buoy smoothly",
"{A} resurfaces with the buoy in hand and zero hesitation",
"{A} pulls the last buoy effortlessly, triggering the raft like a pro",
"{A} climbs into the raft fast and starts paddling with laser focus",
"{A} takes charge of the raft rhythm, keeping everyone in sync",
"{A} keeps the raft straight while the rest paddle hard toward shore",
"{A} communicates perfectly, guiding the team through the waves",
"{A} shows incredible endurance, staying fast from dive to finish",
"{A} leads the raft into shore with flawless timing and teamwork"
      ],
      neutral: [
"{A} swims steadily to the buoy line, keeping a controlled pace",
"{A} pauses briefly underwater before pulling at the buoy",
"{A} resurfaces calmly and signals for teammates to get ready",
"{A} gets into the raft and finds their spot without rushing",
"{A} paddles at a consistent pace while the team organizes",
"{A} keeps the raft balanced as waves start to push the sides",
"{A} listens for directions and adjusts their strokes accordingly",
"{A} maneuvers around another team without speeding up or slowing down",
"{A} stays focused on the shoreline while following team rhythm",
"{A} finishes the race steady, neither leading nor lagging"
      ],
      negative: [
"{A} struggles on the dive and hesitates before grabbing the buoy",
"{A} pulls at the buoy but loses grip and must try again",
"{A} accidentally surfaces too early, wasting time",
"{A} hesitates before the last buoy, slowing the team down",
"{A} jumps off the ship too soon, triggering the five-minute penalty",
"{A} fumbles getting into the raft and throws off the balance",
"{A} paddles off-beat, disrupting the raft’s rhythm",
"{A} accidentally steers the raft sideways into a wave",
"{A} exhausts themselves early and stops paddling halfway through",
"{A} misjudges the final approach and slows the raft in shallow water"
      ]
    }
  },
  // ----- Episode 10 -----
  {
    episode: 10,
    name: "Force Field",
    description: "Teams have to push each other off a platform that is placed in the center of a mud pit, by using large, inflatable inner tubes. The challenge is played in two different rounds — one for each gender, as well as with a point system, ranging from zero to 80 points. A team is disqualified if they fall down within the platform three times. The first team to be knocked off the platform (during a gender-designated round) will get zero points, while the second, third and fourth teams knocked off receive 20, 40 and 60 points, respectively. The last team standing gets 80 points and wins the round for their team. The same process continues in the second gender-designated round until the team that accumulates the most points in both rounds becomes the new Power Team, while the team that accumulates the fewest combined points is automatically sent to the Arena.",
    skillWeights: { strength: 2, endurance: 0.5 },
    comments: {
      positive: [
"{A} powers across the platform with perfect control and pulls off clean eliminations",
"{A} uses the inner tube like a weapon, knocking opponents back with precision",
"{A} keeps unshakeable balance, refusing to be pushed even an inch toward the edge",
"{A} dominates the pit, sending team after team flying off the platform",
"{A} coordinates flawlessly with teammates, overwhelming opponents instantly",
"{A} holds the inner tube steady and uses smart timing to send rivals crashing down",
"{A} pulls off a huge comeback push, flipping the entire round in their team’s favor",
"{A} stands firm through every shove, outlasting the entire pit with pure stamina",
"{A} maneuvers the tube perfectly, directing hits right where they need to land",
"{A} finishes the round with a powerful final shove that secures the win"
      ],
      neutral: [
"{A} holds their spot cautiously, waiting for the right moment to push",
"{A} circles the outer edge, focusing on balance over aggression",
"{A} absorbs incoming hits steadily, keeping a defensive position",
"{A} trades slow, controlled shoves with an opponent near the center",
"{A} adjusts grip on the tube, preparing for the next rush",
"{A} watches the platform carefully, trying to stay away from chaotic clashes",
"{A} tests their footing before committing to a push",
"{A} maintains a steady stance, neither gaining nor losing ground",
"{A} takes a few probing nudges at rivals to test their balance",
"{A} repositions toward the middle, avoiding the more aggressive players"
      ],
      negative: [
"{A} slips on the muddy platform and gets instantly shoved off",
"{A} overcommits on a push and topples straight into the pit",
"{A} loses grip on the tube and is knocked backward within seconds",
"{A} walks too close to the edge and is pushed out with barely any resistance",
"{A} gets blindsided by a hit and tumbles off before they can react",
"{A} stumbles into a teammate and causes a messy double fall",
"{A} tries to lunge at an opponent and completely wipes out",
"{A} is knocked down three times and disqualified early in the round",
"{A} panics during a shove and backs off the platform on their own",
"{A} gets caught between two inner tubes and is launched directly into the mud pit"
      ]
    }
  },
  // ----- Episode 11 -----
  {
    episode: 11,
    name: "Sling Shot",
    description: "One player from each team is towed on a launch ramp from a four-wheeler that is driven by their teammate. Once that player is launched into the water, he/she has to swim to a dock in the middle of a lake, ring a bell, then swim back to the shore. Teams with four players will have two timings merged into one. The team with the fastest average time not only becomes the new Power Team, but is also guaranteed a spot in the finals, while the team with the slowest time is automatically sent to the Arena.",
    skillWeights: { swimming: 2, speed: 0.4, strategy: 0.5 },
    comments: {
      positive: [
"{A} launches off the ramp perfectly and hits the water like a pro",
"{A} sprints through the swim with clean strokes and incredible speed",
"{A} reaches the dock first and rings the bell with total confidence",
"{A} maintains flawless form on the way back, barely slowing down",
"{A} keeps perfect balance during the launch and gains an early lead",
"{A} powers through the lake like a torpedo, never losing momentum",
"{A} nails the landing and transitions smoothly into the swim",
"{A} outswims everyone with pure determination and skill",
"{A} surges toward the dock and rings the bell in one swift motion",
"{A} finishes strong, pushing their team into Power Team contention"
      ],
      neutral: [
"{A} launches cleanly and begins the swim at a steady pace",
"{A} keeps a controlled rhythm as they make their way toward the dock",
"{A} reaches the bell calmly and taps it before turning around",
"{A} maintains a moderate stroke rate across the lake",
"{A} takes a moment to breathe before starting the return swim",
"{A} focuses on consistency rather than speed during the swim",
"{A} completes the launch smoothly and settles into the water",
"{A} swims with an even tempo, conserving energy for the return",
"{A} rings the bell without rush and heads back to shore",
"{A} keeps their head down and swims at a reasonable pace"
      ],
      negative: [
"{A} hits the water awkwardly after the launch and loses early momentum",
"{A} struggles with their strokes and slows down halfway through the swim",
"{A} misses the dock ladder at first and wastes precious time",
"{A} hesitates before ringing the bell, letting others catch up",
"{A} veers off course during the swim and loses valuable seconds",
"{A} looks exhausted when turning back toward shore",
"{A} slips during the launch and enters the water off-balance",
"{A} takes too long reaching the bell, falling behind the pack",
"{A} swims unevenly and gets overtaken easily",
"{A} drags far behind the rest of the field on the return swim"
      ]
    }
  }

  // Add episodes 3–11 in the same format
];
