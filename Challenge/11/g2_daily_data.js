/* Gauntlet 2 — Daily Challenges (Ep1–Ep16)
   Notes:
   - Ep1 is a *captain challenge* (individual scoring within each team, by gender).
   - Ep2–Ep15 are team-vs-team dailies; winner = higher team *average* of required skills.
   - Ep16 is the Final; daily entry optional (engine may ignore it in favor of FINAL_DATA).
   - skillWeights: keys must match your player_data.js skill keys (e.g., endurance, strength, agility, puzzle, memory, strategy, etc.)
*/
window.DAILY_DATA = [
  {
    episode: 1,
    type: "captain",              // engine cue: choose 1M+1F captain per team
    name: "Royal Rumble",
    description: "Players, divided by gender and team, are placed on a raft. The last male and female standing for each team are named the captains. Some chose to use rock-paper-scissors to decide who should be the last one standing.",
    skillWeights: { strength: 1.0, endurance: 1.6, strategy: 0.6 },
    comments: {
      positive: [
        "{A} keeps perfect balance and barely moves the entire time.",
        "{A} uses their core strength to stabilize the raft effortlessly.",
        "{A} cleverly shifts their weight to counter every wobble.",
        "{A} looks completely calm while everyone else struggles.",
        "{A} plants their feet like anchors, refusing to budge.",
        "{A} manages to stay centered even when the raft shakes violently.",
        "{A} maintains excellent posture and control throughout the challenge.",
        "{A} shows impressive composure, outlasting most of their teammates.",
        "{A} subtly adjusts with every wave, never losing focus.",
        "{A} stands tall and confident as others fall off around them."
      ],
      neutral: [
        "{A} stays steady for a while before losing footing.",
        "{A} shifts uncomfortably but keeps their balance temporarily.",
        "{A} has a few close calls but manages to hang on for a bit.",
        "{A} doesn’t look confident, but they’re managing for now.",
        "{A} nearly slips multiple times but somehow recovers each time.",
        "{A} takes a cautious approach, trying to avoid sudden movements.",
        "{A} survives the early rounds, though without much finesse.",
        "{A} hangs on longer than expected but eventually gives out.",
        "{A} seems unsure but remains focused as long as they can.",
        "{A} struggles to stabilize but avoids being one of the first out."
      ],
      negative: [
        "{A} loses balance almost immediately and tumbles off the raft.",
        "{A} panics when the raft starts rocking and falls right away.",
        "{A} slips trying to adjust their footing and crashes into the water.",
        "{A} can’t seem to find any balance at all.",
        "{A} overcorrects their stance and ends up toppling backward.",
        "{A} flails their arms wildly before losing their balance completely.",
        "{A} laughs nervously but is the first one to go down.",
        "{A} misjudges the movement of the raft and wipes out early.",
        "{A} wobbles uncontrollably before splashing into the water.",
        "{A} never stood a chance against the rocking waves."
      ]
    }
  },

  // Episodes 2–15: regular team dailies (alternating male/female Gauntlet later)
  {
    episode: 2,
    name: "Chock Full o' Coconuts",
    description: "Players must work in pairs to transfer a total of 200 coconuts using bamboo sticks. If they lose coconuts long the way, a player has to pick-up the coconuts. The first team to transfer all of their coconuts in the designated area wins.",
    skillWeights: { balance: 1.2, speed: 1.0, teamwork: 1.4 },
    comments: {
      positive: [
        "{A} and their partner move in perfect rhythm, wasting no time at all.",
        "{A} shows excellent coordination, guiding the coconuts with steady hands.",
        "{A} keeps calm under pressure and barely drops any coconuts.",
        "{A} communicates clearly, helping their partner stay in sync.",
        "{A} moves with precision and confidence, making every transfer count.",
        "{A} shows impressive teamwork, adjusting effortlessly to their partner’s pace.",
        "{A} keeps a steady grip, ensuring each coconut reaches the basket safely.",
        "{A} encourages their partner constantly, keeping morale and focus high.",
        "{A} reacts quickly to any wobble, preventing most spills.",
        "{A} proves to be a natural leader, coordinating smooth transitions the whole time."
      ],
      neutral: [
        "{A} takes a careful but slow approach, playing it safe with each transfer.",
        "{A} and their partner drop a few coconuts but manage to recover quickly.",
        "{A} struggles to find rhythm at first but improves as the round continues.",
        "{A} looks unsure about their grip but keeps going steadily.",
        "{A} seems focused but hesitant, taking smaller steps than others.",
        "{A} has decent teamwork moments mixed with a few small mistakes.",
        "{A} and their partner occasionally argue about pace but stay mostly coordinated.",
        "{A} doesn’t drop too many coconuts, but their pace could be faster.",
        "{A} maintains composure even after a few minor errors.",
        "{A} takes a methodical approach — not fast, but consistent."
      ],
      negative: [
        "{A} keeps dropping coconuts and slows the entire team down.",
        "{A} loses balance halfway through and spills most of their load.",
        "{A} argues with their partner instead of focusing on the task.",
        "{A} fumbles the bamboo repeatedly, making the process chaotic.",
        "{A} runs ahead too fast, causing multiple coconuts to roll off.",
        "{A} struggles to coordinate and looks completely frustrated.",
        "{A} bends too far forward and sends the coconuts tumbling.",
        "{A} forgets to communicate, leaving their partner confused.",
        "{A} wastes time picking up fallen coconuts over and over.",
        "{A} drops nearly every other coconut, clearly not in sync with their partner."
      ]
    }
  },
  {
    episode: 3,
    name: "Team Builders",
    description: `Teams compete in a series of tasks to complete in order. The first team to advance all of their players through the obstacle course wins.
• Team Bridge: Players are provided with tires and wooden boards, that they must use to get to the second station without touching the ground. If a player touches the ground, the whole team has to start over.
• Up and Over: With the help of a wooden board, players must go over a suspended rope without touching it. If a player touches the rope, the whole team has to start over.
• Carry the Load: Players must carry a ball up and down a hill without using their hands.`,
    skillWeights: { speed: 1.0, strength: 1.2, endurance: 1.4 },
    comments: {
      positive: [
        "{A} moves across the bridge with flawless balance and timing.",
        "{A} shows great teamwork, placing boards perfectly for the next teammate.",
        "{A} vaults over the rope smoothly without a single slip.",
        "{A} uses quick thinking to help their team recover after a tricky section.",
        "{A} shows incredible coordination, guiding teammates through the obstacles with ease.",
        "{A} carries the load skillfully up the hill, keeping perfect control the whole way.",
        "{A} encourages their team constantly, keeping everyone calm and focused.",
        "{A} makes the Up and Over look effortless, clearing the rope cleanly.",
        "{A} shows patience and leadership, helping others get through each task efficiently.",
        "{A} maintains composure and stamina even as the team starts to tire out."
      ],
      neutral: [
        "{A} hesitates before crossing but manages to make it through safely.",
        "{A} struggles a bit with balance but avoids making the team restart.",
        "{A} takes a slow and steady approach through the bridge section.",
        "{A} clips the rope slightly but no major reset is called.",
        "{A} has a few close calls on the hill but keeps moving forward.",
        "{A} communicates with teammates, though not always effectively.",
        "{A} looks unsure during the setup but eventually finds their rhythm.",
        "{A} takes extra time on their turn, but avoids any critical mistakes.",
        "{A} contributes quietly without standing out much either way.",
        "{A} completes their section after a few wobbly moments."
      ],
      negative: [
        "{A} loses balance on the bridge, forcing the whole team to start over.",
        "{A} touches the ground almost immediately, resetting the group’s progress.",
        "{A} struggles to coordinate with the team and causes multiple slowdowns.",
        "{A} hits the rope hard, earning a groan from the entire team.",
        "{A} drops the ball repeatedly on the hill, wasting valuable time.",
        "{A} panics mid-obstacle and freezes up completely.",
        "{A} misplaces a board, leaving the team stuck for several seconds.",
        "{A} fumbles through the Up and Over and causes another restart.",
        "{A} shows visible frustration, breaking the team’s focus.",
        "{A} loses control of the load at the last second, undoing their progress."
      ]
    }
  },
  {
    episode: 4,
    name: "Moving Pyramid",
    description: "Both teams must form human pyramids with three people on the bottom, two in the middle and one on top. In pyramid formation, they must crawl through a course and retrieve a total on 16 flags on top of poles, every team member must be on top at some point during the challenge. The team with the most flags after 1 hour wins. In the event of a tie, the teams must race through the course in pyramid formation and the fastest team wins.",
    skillWeights: { climbing: 1.0, endurance: 1.0, teamwork: 1.4, balance: 1.4 },
    comments: {
      positive: [
        "{A} holds their position steady, keeping the entire pyramid balanced.",
        "{A} climbs up with perfect control and retrieves the flag effortlessly.",
        "{A} locks in as the base, showing incredible strength and stability.",
        "{A} helps guide the formation forward without losing structure.",
        "{A} takes the top spot with confidence, balancing like a pro.",
        "{A} coordinates perfectly with their teammates to move in sync.",
        "{A} adjusts the pyramid’s rhythm to keep everyone steady and efficient.",
        "{A} calls out instructions clearly, helping the team stay organized.",
        "{A} shows amazing teamwork, switching positions seamlessly.",
        "{A} endures the strain with focus and composure until the very end."
      ],
      neutral: [
        "{A} hesitates a little before climbing but manages to keep balance.",
        "{A} stays steady most of the time but wobbles during transitions.",
        "{A} looks nervous on the top level but completes their part successfully.",
        "{A} supports the base fairly well, though their positioning could be stronger.",
        "{A} nearly slips while reaching for a flag but recovers quickly.",
        "{A} doesn’t stand out much, but contributes consistently to the formation.",
        "{A} and their teammates take a while to find their rhythm.",
        "{A} has to adjust multiple times before stabilizing their stance.",
        "{A} completes their rotation on top, though with visible effort.",
        "{A} moves carefully through the course, prioritizing stability over speed."
      ],
      negative: [
        "{A} loses balance and sends the entire pyramid collapsing to the ground.",
        "{A} slips off the top mid-crawl, forcing the team to rebuild quickly.",
        "{A} struggles to hold their weight, putting pressure on the base.",
        "{A} climbs too early and throws off the team’s balance.",
        "{A} missteps on the bottom level and the whole pyramid collapses.",
        "{A} panics under pressure and causes the formation to topple.",
        "{A} can’t seem to stay steady, constantly shifting and wobbling.",
        "{A} fails to retrieve their flag after multiple failed attempts.",
        "{A} argues about positioning instead of focusing on the challenge.",
        "{A} loses grip on the rope and sends the pyramid sprawling again."
      ]
    }
  },
  {
    episode: 5,
    name: "Sponge Worthy",
    description: "Players divide themselves in three categories: Soakers, Transferers, and Collectors. Spongers collect water directly from the ocean with a sponge on their body, they then pass it on the Transferers with the help of a second sponge. Collectors must then squeeze the sponge on the Transferers without using their hands. The first team to collect a certain amount of water wins.",
    skillWeights: { speed: 1.2, swimming: 1.0 },
    comments: {
      positive: [
        "{A} soaks up a huge amount of water every round, keeping their team ahead.",
"{A} works flawlessly with their partner, transferring water quickly and cleanly.",
"{A} squeezes every last drop into the bucket with incredible control.",
"{A} stays perfectly focused, keeping the sponge steady through each transfer.",
"{A} communicates clearly with their team, keeping everything efficient and fast.",
"{A} makes smart adjustments to improve the team’s rhythm each round.",
"{A} keeps their movements tight and coordinated, wasting almost no water.",
"{A} motivates their teammates constantly, keeping energy high.",
"{A} shows surprising precision with each squeeze, getting near-perfect transfers.",
"{A} finds the best angle for passing the sponge, saving precious seconds."
      ],
      neutral: [
"{A} starts slow but gradually finds their rhythm with the team.",
"{A} gets a decent amount of water across, though not the fastest.",
"{A} works carefully, avoiding mistakes but losing some speed.",
"{A} struggles with the technique at first but manages to stay consistent.",
"{A} doesn’t waste much water, but also doesn’t collect much either.",
"{A} and their partner have some awkward exchanges but get the job done.",
"{A} focuses on precision over speed, with mixed results.",
"{A} keeps up okay, though their sponge-handling could be smoother.",
"{A} contributes steadily but doesn’t stand out among their team.",
"{A} has a few minor missteps but manages to stay on track."
      ],
      negative: [
"{A} keeps dropping the sponge and spilling half the water each time.",
"{A} can’t coordinate with their partner, wasting most of their effort.",
"{A} squeezes too early, sending the water everywhere but the bucket.",
"{A} gets tangled trying to transfer the sponge and slows the team down.",
"{A} forgets the rules mid-round and ends up using their hands — penalty!",
"{A} fumbles every transfer, leaving their team frustrated.",
"{A} can’t seem to hold enough water to make a difference.",
"{A} moves too quickly and spills most of what they collected.",
"{A} loses focus and completely misses their partner with the sponge.",
"{A} collapses laughing mid-transfer, wasting time and water."
      ]
    }
  },
  {
    episode: 6,
    name: "Body Painters",
    description: "Wearing a speedo, the players must use their body to completely cover six canvases in different colors. The fastest team wins.",
    skillWeights: { speed: 1.4, strategy: 0.8 },
    comments: {
      positive: [
"{A} dives into the paint with no hesitation and covers the canvas in record time.",
"{A} uses their entire body efficiently, spreading the color evenly and fast.",
"{A} glides across the canvas like a professional artist in motion.",
"{A} shows surprising precision, hitting every corner of the canvas perfectly.",
"{A} works fast but stays composed, making every movement count.",
"{A} shows incredible energy and enthusiasm, keeping their team’s momentum high.",
"{A} manages to coat their canvas in seconds without missing a single spot.",
"{A} rolls and slides smoothly, leaving a perfect layer of color behind.",
"{A} combines speed and strategy, finishing their section with flair.",
"{A} stays laser-focused on the goal, showing true dedication to body art."
      ],
      neutral: [
"{A} takes a steady approach, prioritizing even coverage over speed.",
"{A} starts cautiously but gradually builds up rhythm.",
"{A} makes a few awkward moves but still manages decent coverage.",
"{A} stays on pace with the rest of the team, neither leading nor lagging.",
"{A} takes their time making sure every area is painted properly.",
"{A} loses balance once but quickly gets back to finishing their canvas.",
"{A} focuses on technique rather than rushing, with mixed results.",
"{A} keeps a consistent pace, though the results look a little uneven.",
"{A} laughs through most of the challenge but still gets the job done.",
"{A} does fine overall, though some of their canvases could’ve used more coverage."
      ],
      negative: [
"{A} slips immediately and barely manages to get any paint on the canvas.",
"{A} completely misses large areas, leaving streaks everywhere.",
"{A} flails around aimlessly, wasting more paint than they use.",
"{A} spends too much time laughing and not enough time painting.",
"{A} rolls off the canvas entirely and has to start over.",
"{A} barely covers half of their section before time runs out.",
"{A} forgets to switch colors and messes up the team’s order.",
"{A} gets stuck trying to cover one corner while everyone else finishes.",
"{A}’s technique is pure chaos, leaving the canvas patchy and uneven.",
"{A} gets distracted and accidentally smears paint on the wrong canvas."
      ]
    }
  },
  {
    episode: 7,
    name: "Rickshaw Races",
    description: "Teams must complete a total of six laps and transfer all of their players in a rickshaw using only six drivers (three males and three females). The fastest team wins.",
    skillWeights: { strength: 1.4, speed: 1.0, teamwork: 1.2 },
    comments: {
      positive: [
"{A} powers through their lap with incredible speed and control.",
"{A} handles the rickshaw like a pro, making sharp turns look effortless.",
"{A} shows amazing stamina, pushing hard from start to finish.",
"{A} communicates perfectly with passengers, keeping the balance steady.",
"{A} maintains a perfect pace, ensuring no time is wasted on transitions.",
"{A} drives with focus and precision, never losing rhythm.",
"{A} encourages the team loudly, motivating everyone to push harder.",
"{A} uses smart strategy, saving energy for their final lap sprint.",
"{A} navigates the course flawlessly, dodging every obstacle.",
"{A} delivers a clean, powerful performance that keeps their team in the lead."
      ],
      neutral: [
"{A} keeps a steady pace but doesn’t stand out as particularly fast or slow.",
"{A} struggles a little with the turns but stays consistent overall.",
"{A} completes their lap smoothly, though without much urgency.",
"{A} manages their section well, even if it lacks flair.",
"{A} starts slow but picks up speed near the halfway mark.",
"{A} communicates calmly with passengers, keeping things under control.",
"{A} plays it safe, prioritizing stability over speed.",
"{A} drives carefully to avoid any costly mistakes.",
"{A} maintains decent control, though their transitions could be faster.",
"{A} finishes their turn without issue, keeping their team in the middle of the pack."
      ],
      negative: [
"{A} loses control of the rickshaw and tips it slightly off-course.",
"{A} struggles with steering and wastes time trying to correct direction.",
"{A} tires out halfway through their lap and slows dramatically.",
"{A} misjudges the balance and nearly spills their teammates out.",
"{A} fumbles during the driver switch, costing the team valuable seconds.",
"{A} crashes into a bump and loses all momentum.",
"{A} burns out too early, gasping for breath before finishing their lap.",
"{A} panics under pressure, shouting directions that confuse everyone.",
"{A} veers off the path, forcing a full stop and restart.",
"{A} can’t handle the rickshaw’s weight and collapses in exhaustion."
      ]
    }
  },
  {
    episode: 8,
    name: "Team Strength",
    description: "Teams selects two Pushers and one Driver to move a truck through a course. The back of the truck is then filled with cinder blocks and pushed back to the starting point. The fastest team wins.",
    skillWeights: { strength: 1.6, speed: 0.8, mental: 0.6, teamwork: 1.2 },
    comments: {
      positive: [
"{A} pushes with raw power, barely slowing down even as the truck gains weight.",
"{A} and their partner sync perfectly, keeping the truck moving smoothly.",
"{A} shows incredible leg strength, driving the truck forward like it’s nothing.",
"{A} shouts out commands that keep everyone in rhythm.",
"{A} as the driver navigates the course with calm precision and perfect timing.",
"{A} stays locked in, adjusting their stance to maximize every push.",
"{A} digs deep on the return trip, powering through the cinder blocks section.",
"{A} maintains perfect coordination, helping their team fly through the track.",
"{A} never loses momentum, pushing at full strength from start to finish.",
"{A} delivers an absolutely dominant performance, leading the team to a smooth run."
      ],
      neutral: [
"{A} keeps a steady rhythm, though their pace isn’t the fastest.",
"{A} manages the push well enough, even if the technique looks awkward.",
"{A} takes short breaks between pushes to catch their breath.",
"{A} communicates decently but sometimes struggles to stay in sync.",
"{A} keeps the truck steady, though their direction could be tighter.",
"{A} paces themselves cautiously, making sure not to burn out too early.",
"{A} and their teammate push evenly, though without much urgency.",
"{A} maintains good control during the first half, but slows toward the end.",
"{A} contributes reliably, if not spectacularly.",
"{A} gets through the challenge fine, though without much impact."
      ],
      negative: [
"{A} slips right at the start, forcing the team to stop and recover.",
"{A} can’t keep up the pace and slows the push drastically.",
"{A} loses footing, nearly sending the truck rolling backward.",
"{A} shouts conflicting directions, confusing the entire team.",
"{A} struggles with grip and barely manages to move the truck.",
"{A} as the driver oversteers, forcing the team to waste time correcting course.",
"{A} burns out early, leaving their partner to do most of the work.",
"{A} panics when the truck gets heavier and gives up halfway through.",
"{A} miscommunicates during the turn and causes a messy collision with a cone.",
"{A} completely runs out of energy, leaving the truck stuck in place."
      ]
    }
  },
  {
    episode: 9,
    name: "Balancing Act",
    description: "Working in pairs, teams must balance on two parallel ropes using another piece or rope held by the pairs. The team with the most players to successfully complete the course wins.",
    skillWeights: { balance: 1.6, teamwork: 1.0 },
    comments: {
      positive: [
"{A} and their partner move in perfect sync, balancing like tightrope pros.",
"{A} stays calm and steady, helping their partner keep balance through the entire course.",
"{A} uses the rope skillfully, maintaining perfect rhythm and focus.",
"{A} communicates clearly, making their pair’s movements look effortless.",
"{A} adjusts smoothly to every wobble, keeping both ropes perfectly balanced.",
"{A} stays light on their feet, guiding their partner with impressive control.",
"{A} shows incredible balance and focus, never once slipping.",
"{A} reacts instantly to shifts, saving their pair from falling multiple times.",
"{A} demonstrates patience and teamwork, keeping perfect tension on the rope.",
"{A} leads the way confidently, finishing the course with flawless precision."
      ],
      neutral: [
"{A} wobbles early but regains balance before it becomes a problem.",
"{A} and their partner move slowly but manage to stay upright.",
"{A} stays quiet, focusing on small, careful steps across the ropes.",
"{A} nearly loses balance a few times, but their partner steadies them.",
"{A} looks nervous but stays composed enough to keep going.",
"{A} takes extra time coordinating steps, resulting in a slower but safe pace.",
"{A} struggles to find rhythm at first but improves along the way.",
"{A} does fine overall — not graceful, but effective.",
"{A} communicates sporadically, but their partner keeps them in sync.",
"{A} completes the course with some awkward movements but no major mistakes."
      ],
      negative: [
"{A} loses balance immediately, sending both of them tumbling off the ropes.",
"{A} panics mid-way and lets go of the rope entirely.",
"{A} steps too far out of sync, causing their partner to fall.",
"{A} overcorrects their balance and tips both of them off.",
"{A} fails to communicate, leaving their partner struggling to stay upright.",
"{A} laughs nervously, losing focus and slipping off the ropes.",
"{A} pulls the rope too tight, knocking both of them off-balance.",
"{A} freezes halfway across and refuses to move.",
"{A} missteps on a wobble and sends the pair crashing down.",
"{A} barely takes two steps before falling off completely."
      ]
    }
  },
  {
    episode: 10,
    name: "Buck-a-neer",
    description: "Alternating in both positions, one team must balance on barrells connected to ropes without using hands while the other team tries to make them fall pulling the ropes. The team with the most players standing at the end of the challenge wins.",
    skillWeights: { balance: 1.6, endurance: 1.0, strength: 1.0 },
    comments: {
      positive: [
"{A} stays perfectly centered on the barrel, unfazed by the opposing team’s pulls.",
"{A} shows impressive focus, countering every tug with precise balance.",
"{A} braces their stance and refuses to budge no matter how hard the rope moves.",
"{A} moves fluidly with each sway, adjusting their weight like a pro.",
"{A} keeps calm under pressure, maintaining flawless control.",
"{A} anticipates the rope pulls and shifts their balance before they even happen.",
"{A} manages to stay upright through multiple strong pulls, showing pure grit.",
"{A} proves their balance is unmatched, never once losing their footing.",
"{A} smirks confidently while everyone else around them starts to fall.",
"{A} outlasts everyone, standing strong even as the rope jerks violently."
      ],
      neutral: [
"{A} wobbles several times but manages to stay up longer than expected.",
"{A} looks uneasy but manages to maintain balance through the first few rounds.",
"{A} struggles early but keeps adjusting, finding their rhythm slowly.",
"{A} gets caught off guard by a strong pull but regains control.",
"{A} focuses intensely, managing to hold out for a while before slipping.",
"{A} moves cautiously, trying to read the rope’s motion before reacting.",
"{A} stays balanced for a bit before losing stability near the end.",
"{A} lasts longer than most, but never looks fully confident.",
"{A} puts in solid effort, though their balance wavers more with each pull.",
"{A} handles the first few rope tugs fine but can’t hold their form much longer."
      ],
      negative: [
"{A} loses balance almost immediately and tumbles right off the barrel.",
"{A} panics as the rope jerks and falls flat into the ground.",
"{A} overreacts to a pull and sends themselves spinning off the barrel.",
"{A} completely misjudges the tension and wipes out in seconds.",
"{A} tries to steady themselves but slips the moment the rope moves again.",
"{A} gets thrown off balance instantly by a hard pull from the other team.",
"{A} flails wildly before toppling over in dramatic fashion.",
"{A} loses focus and slides off the barrel with no resistance.",
"{A} can’t stay upright at all, slipping on their very first attempt.",
"{A} is yanked off balance so fast they don’t even realize what happened."
      ]
    }
  },
  {
    episode: 11,
    name: "Pull Me",
    description: "Half of the team is put onto a platform 20 feet above water, while the rest of their team will pull a rope that elevates the platform. Once they can't pull their teammates anymore, and the platform drops, the team's time stops. The team with the longest time wins.",
    skillWeights: { endurance: 1.6, strength: 1.4, teamwork: 1.0 },
    comments: {
      positive: [
"{A} digs deep, pulling the rope with relentless determination.",
"{A} shows incredible strength, barely losing grip even as the rope tightens.",
"{A} keeps perfect rhythm with their teammates, maximizing every pull.",
"{A} motivates the team loudly, keeping everyone’s energy high.",
"{A} refuses to give up, even as their arms start shaking from exhaustion.",
"{A} stays calm on the platform, trusting their team completely.",
"{A} balances perfectly above the water, barely moving an inch.",
"{A} pushes through the pain, holding the rope tighter than ever.",
"{A} and their team work flawlessly together, keeping the platform high for an impressive amount of time.",
"{A} sets the tone for the whole team — focused, strong, and steady."
      ],
      neutral: [
"{A} keeps a decent grip but starts losing momentum over time.",
"{A} contributes steadily, though not with much intensity.",
"{A} struggles midway but regains rhythm after a short pause.",
"{A} breathes heavily but stays in sync with the group.",
"{A} looks nervous on the platform but manages to stay balanced.",
"{A} keeps holding on, though their pace slows as time goes on.",
"{A} pulls their share of the weight but doesn’t stand out much.",
"{A} starts strong, then tires visibly halfway through.",
"{A} focuses on endurance, keeping calm and measured throughout.",
"{A} does their part, though they rely heavily on their stronger teammates."
      ],
      negative: [
"{A} loses grip early, sending the platform dropping faster than expected.",
"{A} can’t keep up with the rest of the team and lets the rope slip.",
"{A} panics as their arms give out, shouting for help too late.",
"{A} lets go completely, forcing the rest of the team to carry the load.",
"{A} collapses mid-pull, leaving their teammates struggling to compensate.",
"{A} wobbles on the platform and nearly falls before the drop.",
"{A} fails to coordinate their pulls, throwing off the team’s rhythm.",
"{A} visibly gives up, leaving others to do all the work.",
"{A} loses focus for a second — just enough for the rope to slip away.",
"{A} is the first to drop their side, causing the whole team to plunge into the water."
      ]
    }
  },
  {
    episode: 12,
    name: "Spare Tires",
    description: "Each team is given a 10-minute time limit. On the sound of the airhorn, a player jumps into the water, swims to a ladder, and climbs up to reach the tires. Once they reach the tires, they must climb accross them, releasing one of the tires, and jumping back into the water. Once they touch the water, the next player from their team must do the same, leaving one less tire. For every tire each player gets one point but if the player falls they get 0 points for their team. The team to get the most points within the 10-minute limit wins.",
    skillWeights: { speed: 1.0, swimming: 1.0, climbing: 1.4, strategy: 0.6 },
    comments: {
      positive: [
"{A} dives in immediately, cutting through the water like a torpedo.",
"{A} climbs across the tires with flawless control and releases one cleanly.",
"{A} shows no hesitation, grabbing tire after tire with perfect timing.",
"{A} keeps steady grip even as the tires start to swing wildly.",
"{A} completes the course in record time, scoring big for their team.",
"{A} moves fast and fluidly, barely losing momentum from start to finish.",
"{A} shows impressive upper-body strength, powering across every tire.",
"{A} uses smart foot placement, keeping balance even on the loosest tires.",
"{A} times their jump perfectly, earning another clean point for the team.",
"{A} performs like a machine — efficient, confident, and unstoppable."
      ],
      neutral: [
"{A} starts off strong but slows down halfway through the course.",
"{A} hesitates before jumping in but quickly gets into rhythm.",
"{A} struggles to find footing but keeps moving carefully across.",
"{A} takes their time reaching the ladder, focusing on accuracy over speed.",
"{A} wobbles through the middle tires but manages to hold on.",
"{A} gets through safely, though their time isn’t particularly fast.",
"{A} takes a cautious approach, avoiding risk but losing seconds.",
"{A} barely completes the section, scraping through with one point.",
"{A} loses rhythm halfway but recovers just in time to score.",
"{A} finishes their turn cleanly, but without much energy or flair."
      ],
      negative: [
"{A} slips off the second tire and crashes into the water immediately.",
"{A} loses grip halfway through and earns no points for their team.",
"{A} panics mid-climb and drops before reaching the next tire.",
"{A} completely misjudges their jump and misses the first tire.",
"{A} climbs too fast, losing control and falling before securing a tire.",
"{A} gets tangled between the tires and drops awkwardly into the water.",
"{A} wastes time hesitating at the ladder, then fails to hold on.",
"{A} loses focus and slips right as they reach the final tire.",
"{A} barely makes progress before splashing down in frustration.",
"{A} falls before earning any points, leaving their team disappointed."
      ]
    }
  },
  {
    episode: 13,
    name: "Easy Does It",
    description: "Each team separates into pairs. On the sound of the airhorn, the pairs jump into the water and climb on opposite sides of the ladder which is attached to a platform above water which acts like a teeter totter. Once the players climb up and cross each other, they must climb back down using the opposite ladder. Once the pair reaches the shore, the next pairs goes. The team to have the most pairs cross the platform within the 10-minute time limit wins.",
    skillWeights: { speed: 1.0, swimming: 0.8, balance: 1.4, teamwork: 1.0 },
    comments: {
      positive: [
"{A} and their partner move in perfect sync, balancing the platform with precision.",
"{A} climbs confidently, never once losing balance as the board tips.",
"{A} communicates clearly, helping their partner cross smoothly.",
"{A} crosses the platform with flawless timing, barely causing it to tilt.",
"{A} shows incredible balance, staying calm even as the platform wobbles.",
"{A} reacts fast to each shift, adjusting perfectly to their partner’s movements.",
"{A} crosses with agility and grace, making it look effortless.",
"{A} keeps a steady rhythm, guiding their pair across without a single slip.",
"{A} times their movements perfectly, meeting their partner in the middle without issue.",
"{A} and their teammate complete the crossing in record time, barely disturbing the board."
      ],
      neutral: [
"{A} hesitates at the bottom but manages to find balance midway through.",
"{A} and their partner move cautiously, prioritizing safety over speed.",
"{A} wobbles on the climb but recovers before losing footing.",
"{A} takes extra time adjusting to their partner’s movements.",
"{A} gets briefly stuck at the midpoint before crossing safely.",
"{A} focuses on balance more than pace, finishing the run carefully.",
"{A} moves unevenly with their partner, but they still manage to finish.",
"{A} crosses successfully, though the platform shakes wildly the whole time.",
"{A} stays patient and steady, letting their partner take the lead.",
"{A} completes the crossing cleanly, though their timing could’ve been smoother."
      ],
      negative: [
"{A} loses balance instantly, sending both players splashing into the water.",
"{A} panics halfway up the ladder and slips right off.",
"{A} moves too fast and throws the teeter-totter completely off balance.",
"{A} and their partner miscommunicate, meeting in the middle and falling together.",
"{A} freezes mid-cross, causing the board to tip and both players to tumble.",
"{A} overcompensates a wobble and crashes hard into the water.",
"{A} can’t stay steady at all, causing the pair to restart the run.",
"{A} slips trying to switch sides and takes their teammate down with them.",
"{A} loses footing right as they reach the top, wasting their effort.",
"{A} completely mistimes their climb and topples before reaching the midpoint."
      ]
    }
  },
  {
    episode: 14,
    name: "The Pit",
    description: "The entire team is put at the bottom of a pit. In the pit they have some supplies, such as bouncy balls, pool noodles, tights, duct tape and etc. They must use these supplies in any way that they can to get the entire team and all of the supplies out of the pit. The team to do so in the fastest time wins.",
    skillWeights: { climbing: 0.8, strategy: 1.2, mental: 1.0, teamwork: 1.2 },
    comments: {
      positive: [
"{A} takes charge immediately, turning random supplies into a smart escape plan.",
"{A} shows quick thinking, using the duct tape and noodles to create a sturdy structure.",
"{A} comes up with a clever idea that helps lift the entire team higher.",
"{A} uses every material efficiently, wasting nothing.",
"{A} coordinates perfectly with the team, keeping everyone calm and focused.",
"{A} surprises everyone with an inventive solution that actually works.",
"{A} motivates the group to stay positive and keep problem-solving.",
"{A} uses creativity and teamwork to help build a functional ladder out of chaos.",
"{A} keeps testing ideas until one finally pays off — and it’s brilliant.",
"{A} works tirelessly, patching every weak spot in the team’s escape setup."
      ],
      neutral: [
"{A} contributes decent ideas, though not all of them pan out.",
"{A} spends most of the time testing materials, with mixed results.",
"{A} tries a few strategies before finally settling on something that kind of works.",
"{A} keeps busy, though their approach feels a little disorganized.",
"{A} participates steadily but doesn’t stand out as a leader or follower.",
"{A} builds quietly, following directions without much input.",
"{A} looks uncertain at first but starts helping once the plan forms.",
"{A} focuses on small fixes while others handle the main structure.",
"{A} makes some minor mistakes but manages to stay useful overall.",
"{A} keeps working through trial and error, staying calm even when things fail."
      ],
      negative: [
"{A} accidentally breaks part of the team’s setup, forcing them to start over.",
"{A} argues with teammates instead of contributing real ideas.",
"{A} wastes time throwing materials around instead of helping.",
"{A} completely misunderstands the plan and ruins the team’s progress.",
"{A} loses patience halfway through and stops working altogether.",
"{A} tries a ridiculous idea that collapses instantly.",
"{A} ignores instructions and ends up making the pit even messier.",
"{A} keeps second-guessing everything, slowing the whole group down.",
"{A} gets frustrated and snaps at the team, breaking their focus.",
"{A} trips and sends half the supplies rolling to the bottom again."
      ]
    }
  },
  {
    episode: 15,
    name: "Blind Trust",
    description: "The teams are put on two platforms above water which are connected by a balance beam with different levels. Above the balance beam there is a rope which has all of the remaining players' pictures hanging on them. The first player from each team will walk across the beam, grabbing their picture and a picture of a player that is not participating in the challenge. Once they cross the beam, they become a coach, as every other teammate after them will walk the balance beam blindfolded. The team to get the most pictures across in the fastest time wins.",
    skillWeights: { balance: 1.4, speed: 0.8, strategy: 1.0, teamwork: 1.2 },
    comments: {
      positive: [
"{A} crosses the beam with complete focus, grabbing both pictures flawlessly.",
"{A} shows incredible balance and confidence, barely swaying as they move across.",
"{A} guides their blindfolded teammates with calm, precise directions.",
"{A} stays patient and composed, helping everyone move safely across the beam.",
"{A} reacts instantly to every wobble, keeping their teammate from falling.",
"{A} as a coach, gives crystal-clear instructions that build total trust.",
"{A} moves gracefully, making the balance beam look easy even while blindfolded.",
"{A} cheers their team on nonstop, keeping morale and focus high.",
"{A} shows perfect timing, grabbing their picture and returning faster than anyone expected.",
"{A} and their team communicate seamlessly, completing each crossing with precision."
      ],
      neutral: [
"{A} hesitates before stepping onto the beam but finds rhythm halfway through.",
"{A} guides their teammate steadily, though their directions are a bit uncertain.",
"{A} takes things slow and careful, making it across without flair.",
"{A} moves cautiously, testing each step as they inch along the beam.",
"{A} struggles at first to give clear directions but improves over time.",
"{A} keeps a slow but safe pace across the beam.",
"{A} nearly loses balance once, but catches themselves just in time.",
"{A} completes their turn quietly, letting others handle most of the guidance.",
"{A} focuses on getting through safely, even if it takes longer.",
"{A} gets across fine, though their communication isn’t the strongest."
      ],
      negative: [
"{A} loses balance early and splashes into the water before grabbing a picture.",
"{A} panics halfway across and completely freezes on the beam.",
"{A} gives confusing directions, causing their teammate to fall instantly.",
"{A} wobbles wildly and drops both pictures into the water.",
"{A} slips off before even reaching the first picture.",
"{A} shouts mixed signals, leaving their blindfolded partner spinning in place.",
"{A} laughs nervously but loses balance seconds later.",
"{A} gets tangled in the hanging pictures and falls trying to fix it.",
"{A} misjudges a step and sends both themself and their teammate off the beam.",
"{A} completely miscommunicates, resulting in a total wipeout for their turn."
      ]
    }
  },
];