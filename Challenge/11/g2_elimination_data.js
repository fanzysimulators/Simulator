/* Gauntlet 2 — The Gauntlet (Eliminations)
   Notes:
   - Episodes 2–15 only; Ep1 has no elimination, Ep16 is the Final.
   - gender: "male" or "female" (alternates each episode in your engine schedule).
   - skillWeights: used to 1v1 score Captain vs Nominee. Higher total wins.
*/
window.ELIMINATION_DATA = [
  {
    episode: 2,
    gender: "male",
    name: "Name That Coconut",
    description: "Players compete for the coconut with the name of the person that is the answer to a Real World/Road Rules trivia question. If the answer is wrong, the other player can answer freely. Best out of 9 win.",
    skillWeights: { mental: 1.8, speed: 1.2, endurance: 0.4 },
  comments: {
    positive: [
"{A} answers instantly, grabbing the right coconut without hesitation.",
"{A} stays completely calm and nails the question in seconds.",
"{A} reacts lightning-fast, beating their opponent to the answer.",
"{A} clearly knows their Challenge history and it shows.",
"{A} listens closely, smirks, and confidently picks the right name.",
"{A} buzzes in first every time, dominating the trivia showdown.",
"{A} doesn’t second-guess once — total focus, total accuracy.",
"{A} keeps a poker face but clearly knows every single question.",
"{A} outsmarts their opponent with perfect timing and memory.",
"{A} plays it cool and crushes the round with flawless answers."
    ],
    neutral: [
"{A} hesitates for a moment before answering, but still gets it right.",
"{A} takes their time thinking before finally grabbing the correct coconut.",
"{A} answers slowly, but confidently enough to stay in the game.",
"{A} misses one or two questions but keeps their composure.",
"{A} guesses on a few answers but manages to even the score.",
"{A} shows solid general knowledge, though not perfect recall.",
"{A} stays quiet for a few questions, waiting for the right moment to strike.",
"{A} reacts decently but is a little slow compared to their opponent.",
"{A} starts off shaky but finds their rhythm mid-match.",
"{A} gets a couple right, a couple wrong — an even performance."
    ],
    negative: [
"{A} grabs the wrong coconut immediately and realizes too late.",
"{A} freezes completely, unable to remember even the basics.",
"{A} shouts out an answer confidently — and it’s dead wrong.",
"{A} clearly blanks on the question and lets the opponent steal it.",
"{A} hesitates too long and loses every race to the coconut.",
"{A} mishears the question and goes for the wrong name entirely.",
"{A} panics and grabs a random coconut out of desperation.",
"{A} looks frustrated after a streak of wrong answers.",
"{A} laughs awkwardly after realizing they just gave away another point.",
"{A} completely collapses under pressure, losing focus and confidence."
    ]
   }
  },
  {
    episode: 3,
    gender: "female",
    name: "Beach Brawl",
    description: "Players have to wrestle their opponent out of a ring. Best out of 5 win.",
    skillWeights: { strength: 1.6, balance: 1.2, endurance: 1.0 },
  comments: {
    positive: [
"{A} charges in with explosive strength and sends their opponent flying out of the ring.",
"{A} locks in a perfect grapple and overpowers their opponent with ease.",
"{A} stays grounded, using raw power to control the center of the ring.",
"{A} uses perfect timing and leverage to flip their opponent cleanly out.",
"{A} shows total dominance, barely letting their opponent move an inch.",
"{A} wins the round decisively, outmuscling their rival completely.",
"{A} keeps low, balanced, and in control — pure wrestling instincts.",
"{A} outsmarts their opponent with a sudden counter shove.",
"{A} doesn’t even flinch during the struggle, pure focus and power.",
"{A} celebrates confidently after another clean takedown victory."
    ],
    neutral: [
"{A} holds their ground well, but both players are locked in a stalemate.",
"{A} struggles for control, neither gaining nor losing ground.",
"{A} fights with good form, though their strength seems evenly matched.",
"{A} nearly pushes their opponent out but loses leverage at the edge.",
"{A} and their opponent trade shoves for what feels like forever.",
"{A} stays patient, looking for the right opening.",
"{A} shows good effort but can’t find a decisive move.",
"{A} uses some solid defense to stay inside the ring longer than expected.",
"{A} gets pushed back but manages to recover before falling out.",
"{A} stays competitive through the round, though without clear control."
    ],
    negative: [
"{A} gets overpowered instantly and shoved right out of the ring.",
"{A} loses balance and topples out without much resistance.",
"{A} charges recklessly and gets flipped over the side.",
"{A} gets caught off guard and thrown out in seconds.",
"{A} slips trying to counter and rolls out of the ring awkwardly.",
"{A} can’t hold their footing and is forced out after a short struggle.",
"{A} gets completely manhandled, unable to fight back.",
"{A} loses grip mid-grapple and tumbles straight into the water.",
"{A} gets baited into a bad move and pays for it instantly.",
"{A} puts up little resistance before being tossed clean out of the ring."
    ]
  }
  },
  {
    episode: 4,
    gender: "male",
    name: "Capture the Flag",
    description: "Players have to climb up a 20-foot (approx. 6 meters) rope net to get a flag.",
    skillWeights: { climbing: 1.8, strength: 1.2, speed: 1.0, endurance: 0.8 },
  comments: {
    positive: [
"{A} explodes off the start and scales the net like it’s nothing.",
"{A} climbs with perfect rhythm, never missing a single grip.",
"{A} shows incredible upper-body strength, reaching the flag in seconds.",
"{A} moves fast and smooth, staying in total control the entire way up.",
"{A} never hesitates — every pull is powerful and precise.",
"{A} dominates from the start, grabbing the flag before their opponent is halfway up.",
"{A} keeps amazing focus, powering through the climb without slowing down once.",
"{A} uses flawless technique, moving efficiently and confidently to the top.",
"{A} reaches the flag in one clean burst, showing true athletic control.",
"{A} makes it look effortless, climbing with total power and composure."
    ],
    neutral: [
"{A} starts slow but builds steady momentum as they climb higher.",
"{A} struggles to find a rhythm at first but recovers halfway up.",
"{A} keeps pace with their opponent, trading the lead several times.",
"{A} climbs cautiously, taking time to secure each step.",
"{A} nearly slips once but quickly regains their footing.",
"{A} shows solid effort, even if their speed isn’t spectacular.",
"{A} keeps climbing steadily, refusing to look down or rush.",
"{A} paces themselves well, reaching the top safely though not the fastest.",
"{A} fights fatigue toward the end but pushes through to grab the flag.",
"{A} performs consistently, though without much flash or flair."
    ],
    negative: [
"{A} slips early and struggles to recover their momentum.",
"{A} loses grip and hangs awkwardly before sliding halfway down.",
"{A} looks exhausted before even reaching the midpoint.",
"{A} climbs too aggressively and misses a crucial foothold.",
"{A} completely misjudges their reach and has to restart their rhythm.",
"{A} gets tangled in the net, wasting precious seconds trying to untangle.",
"{A} slips right before the top and loses their chance at the flag.",
"{A} hesitates too long on the lower rungs, letting their opponent run away with it.",
"{A} shows poor coordination, constantly pausing between steps.",
"{A} loses confidence mid-climb and slows to a crawl."
    ]
  }
  },
  {
    episode: 5,
    gender: "female",
    name: "Reverse Tug of War",
    description: "Players are tied to each other, facing opposite directions. The first to get to their flag wins.",
    skillWeights: { strength: 1.6, endurance: 1.2, balance: 1.0, speed: 0.8 },
  comments: {
    positive: [
"{A} digs in and powers forward, dragging their opponent backward with pure strength.",
"{A} explodes off the start, catching their opponent completely off guard.",
"{A} stays low and drives forward until the flag is theirs.",
"{A} uses perfect leverage and footwork to break free of the pull.",
"{A} shows incredible determination, never slowing down for a second.",
"{A} completely overpowers their opponent, reaching the flag with ease.",
"{A} combines strength and strategy, pulling their rival off balance before surging ahead.",
"{A} keeps perfect posture and steady breathing, controlling every inch of movement.",
"{A} powers through resistance, inching closer until the flag is within reach.",
"{A} wins with total dominance — pure willpower and strength."
    ],
    neutral: [
"{A} holds steady, both players locked in a tense stalemate.",
"{A} takes small steps forward, testing their opponent’s strength.",
"{A} gains a little ground but struggles to maintain momentum.",
"{A} fights hard, neither gaining nor losing much distance.",
"{A} adjusts their footing carefully, trying not to lose balance.",
"{A} pulls with effort, but their opponent matches every move.",
"{A} gets dragged back slightly but refuses to give up.",
"{A} conserves energy, waiting for the right moment to push forward.",
"{A} stays focused, breathing heavily as the rope tightens.",
"{A} makes a small comeback but runs out of time to close the gap."
    ],
    negative: [
"{A} gets completely overpowered, pulled backward almost immediately.",
"{A} loses footing and is dragged across the ground helplessly.",
"{A} stumbles early and never recovers their balance.",
"{A} underestimates their opponent’s strength and pays the price fast.",
"{A} gets yanked off balance and pulled far from their flag.",
"{A} digs in too late and can’t stop the inevitable pullback.",
"{A} gets dominated from start to finish, barely putting up resistance.",
"{A} trips during the pull and collapses, losing all momentum.",
"{A} gives everything but tires out halfway through.",
"{A} can’t fight back and gets dragged like dead weight."
    ]
  }
  },
  {
    episode: 6,
    gender: "male",
    name: "Sticky Situation",
    description: "Players had to stick balls to a board as their opponent tries to stop them. Best out of 5 win.",
    skillWeights: { speed: 1.4, strength: 1.2, balance: 1.0, endurance: 0.8 },
  comments: {
    positive: [
"{A} moves fast and smart, dodging their opponent to stick another ball on the board.",
"{A} uses quick footwork and perfect timing to get each ball up without interference.",
"{A} stays aggressive, pushing through every block attempt with confidence.",
"{A} fakes one direction and sticks a ball cleanly before their opponent reacts.",
"{A} shows incredible speed and awareness, scoring multiple points with ease.",
"{A} stays calm under pressure, slipping past their rival again and again.",
"{A} plays with perfect rhythm — defend, attack, stick, repeat.",
"{A} muscles through a block and plants their final ball to take the round.",
"{A} anticipates every move, outsmarting their opponent from start to finish.",
"{A} dominates the round, sticking balls faster than their rival can respond."
    ],
    neutral: [
"{A} fights evenly with their opponent, trading control back and forth.",
"{A} gets a few balls up but struggles to keep momentum.",
"{A} starts slow but finds their rhythm halfway through the round.",
"{A} keeps up a steady pace but can’t quite pull ahead.",
"{A} lands a few points but spends most of the time on defense.",
"{A} looks tired but stays focused enough to stay in the match.",
"{A} misses a few chances but manages to even the score later.",
"{A} hesitates under pressure but still pulls off a decent showing.",
"{A} relies on counterattacks more than direct plays, with mixed results.",
"{A} gets into a solid rhythm but can’t quite finish the round strong."
    ],
    negative: [
"{A} gets completely shut down, barely managing to stick a single ball.",
"{A} can’t handle the pressure and spends the round chasing instead of scoring.",
"{A} gets blocked at every turn, running out of options quickly.",
"{A} tries to rush but drops the ball before reaching the board.",
"{A} looks completely lost as their opponent dominates the round.",
"{A} fumbles their movements and loses control multiple times.",
"{A} gets pushed back easily, unable to fight through the defense.",
"{A} goes for a risky move and slips, wasting precious seconds.",
"{A} hesitates too long and never even gets close to the board.",
"{A} collapses under pressure, ending the round empty-handed."
    ]
  }
  },
  {
    episode: 7,
    gender: "female",
    name: "Name That Coconut",
    description: "Players compete for the coconut with the name of the person that is the answer to a Real World/Road Rules trivia question. If the answer is wrong, the other player can answer freely. Best out of 9 win.",
    skillWeights: { mental: 1.8, speed: 1.2, endurance: 0.4 },
  comments: {
    positive: [
"{A} answers instantly, grabbing the right coconut without hesitation.",
"{A} stays completely calm and nails the question in seconds.",
"{A} reacts lightning-fast, beating their opponent to the answer.",
"{A} clearly knows their Challenge history and it shows.",
"{A} listens closely, smirks, and confidently picks the right name.",
"{A} buzzes in first every time, dominating the trivia showdown.",
"{A} doesn’t second-guess once — total focus, total accuracy.",
"{A} keeps a poker face but clearly knows every single question.",
"{A} outsmarts their opponent with perfect timing and memory.",
"{A} plays it cool and crushes the round with flawless answers."
    ],
    neutral: [
"{A} hesitates for a moment before answering, but still gets it right.",
"{A} takes their time thinking before finally grabbing the correct coconut.",
"{A} answers slowly, but confidently enough to stay in the game.",
"{A} misses one or two questions but keeps their composure.",
"{A} guesses on a few answers but manages to even the score.",
"{A} shows solid general knowledge, though not perfect recall.",
"{A} stays quiet for a few questions, waiting for the right moment to strike.",
"{A} reacts decently but is a little slow compared to their opponent.",
"{A} starts off shaky but finds their rhythm mid-match.",
"{A} gets a couple right, a couple wrong — an even performance."
    ],
    negative: [
"{A} grabs the wrong coconut immediately and realizes too late.",
"{A} freezes completely, unable to remember even the basics.",
"{A} shouts out an answer confidently — and it’s dead wrong.",
"{A} clearly blanks on the question and lets the opponent steal it.",
"{A} hesitates too long and loses every race to the coconut.",
"{A} mishears the question and goes for the wrong name entirely.",
"{A} panics and grabs a random coconut out of desperation.",
"{A} looks frustrated after a streak of wrong answers.",
"{A} laughs awkwardly after realizing they just gave away another point.",
"{A} completely collapses under pressure, losing focus and confidence."
    ]
   }
  },
  {
    episode: 8,
    gender: "male",
    name: "Beach Brawl",
    description: "Players have to wrestle their opponent out of a ring. Best out of 5 win.",
    skillWeights: { strength: 1.6, balance: 1.2, endurance: 1.0 },
  comments: {
    positive: [
"{A} charges in with explosive strength and sends their opponent flying out of the ring.",
"{A} locks in a perfect grapple and overpowers their opponent with ease.",
"{A} stays grounded, using raw power to control the center of the ring.",
"{A} uses perfect timing and leverage to flip their opponent cleanly out.",
"{A} shows total dominance, barely letting their opponent move an inch.",
"{A} wins the round decisively, outmuscling their rival completely.",
"{A} keeps low, balanced, and in control — pure wrestling instincts.",
"{A} outsmarts their opponent with a sudden counter shove.",
"{A} doesn’t even flinch during the struggle, pure focus and power.",
"{A} celebrates confidently after another clean takedown victory."
    ],
    neutral: [
"{A} holds their ground well, but both players are locked in a stalemate.",
"{A} struggles for control, neither gaining nor losing ground.",
"{A} fights with good form, though their strength seems evenly matched.",
"{A} nearly pushes their opponent out but loses leverage at the edge.",
"{A} and their opponent trade shoves for what feels like forever.",
"{A} stays patient, looking for the right opening.",
"{A} shows good effort but can’t find a decisive move.",
"{A} uses some solid defense to stay inside the ring longer than expected.",
"{A} gets pushed back but manages to recover before falling out.",
"{A} stays competitive through the round, though without clear control."
    ],
    negative: [
"{A} gets overpowered instantly and shoved right out of the ring.",
"{A} loses balance and topples out without much resistance.",
"{A} charges recklessly and gets flipped over the side.",
"{A} gets caught off guard and thrown out in seconds.",
"{A} slips trying to counter and rolls out of the ring awkwardly.",
"{A} can’t hold their footing and is forced out after a short struggle.",
"{A} gets completely manhandled, unable to fight back.",
"{A} loses grip mid-grapple and tumbles straight into the water.",
"{A} gets baited into a bad move and pays for it instantly.",
"{A} puts up little resistance before being tossed clean out of the ring."
    ]
  }
  },
  {
    episode: 9,
    gender: "female",
    name: "Capture the Flag",
    description: "Players have to climb up a 20-foot (approx. 6 meters) rope net to get a flag.",
    skillWeights: { climbing: 1.8, strength: 1.2, speed: 1.0, endurance: 0.8 },
  comments: {
    positive: [
"{A} explodes off the start and scales the net like it’s nothing.",
"{A} climbs with perfect rhythm, never missing a single grip.",
"{A} shows incredible upper-body strength, reaching the flag in seconds.",
"{A} moves fast and smooth, staying in total control the entire way up.",
"{A} never hesitates — every pull is powerful and precise.",
"{A} dominates from the start, grabbing the flag before their opponent is halfway up.",
"{A} keeps amazing focus, powering through the climb without slowing down once.",
"{A} uses flawless technique, moving efficiently and confidently to the top.",
"{A} reaches the flag in one clean burst, showing true athletic control.",
"{A} makes it look effortless, climbing with total power and composure."
    ],
    neutral: [
"{A} starts slow but builds steady momentum as they climb higher.",
"{A} struggles to find a rhythm at first but recovers halfway up.",
"{A} keeps pace with their opponent, trading the lead several times.",
"{A} climbs cautiously, taking time to secure each step.",
"{A} nearly slips once but quickly regains their footing.",
"{A} shows solid effort, even if their speed isn’t spectacular.",
"{A} keeps climbing steadily, refusing to look down or rush.",
"{A} paces themselves well, reaching the top safely though not the fastest.",
"{A} fights fatigue toward the end but pushes through to grab the flag.",
"{A} performs consistently, though without much flash or flair."
    ],
    negative: [
"{A} slips early and struggles to recover their momentum.",
"{A} loses grip and hangs awkwardly before sliding halfway down.",
"{A} looks exhausted before even reaching the midpoint.",
"{A} climbs too aggressively and misses a crucial foothold.",
"{A} completely misjudges their reach and has to restart their rhythm.",
"{A} gets tangled in the net, wasting precious seconds trying to untangle.",
"{A} slips right before the top and loses their chance at the flag.",
"{A} hesitates too long on the lower rungs, letting their opponent run away with it.",
"{A} shows poor coordination, constantly pausing between steps.",
"{A} loses confidence mid-climb and slows to a crawl."
    ]
  }
  },
  {
    episode: 10,
    gender: "male",
    name: "Reverse Tug of War",
    description: "Players are tied to each other, facing opposite directions. The first to get to their flag wins.",
    skillWeights: { strength: 1.6, endurance: 1.2, balance: 1.0, speed: 0.8 },
  comments: {
    positive: [
"{A} digs in and powers forward, dragging their opponent backward with pure strength.",
"{A} explodes off the start, catching their opponent completely off guard.",
"{A} stays low and drives forward until the flag is theirs.",
"{A} uses perfect leverage and footwork to break free of the pull.",
"{A} shows incredible determination, never slowing down for a second.",
"{A} completely overpowers their opponent, reaching the flag with ease.",
"{A} combines strength and strategy, pulling their rival off balance before surging ahead.",
"{A} keeps perfect posture and steady breathing, controlling every inch of movement.",
"{A} powers through resistance, inching closer until the flag is within reach.",
"{A} wins with total dominance — pure willpower and strength."
    ],
    neutral: [
"{A} holds steady, both players locked in a tense stalemate.",
"{A} takes small steps forward, testing their opponent’s strength.",
"{A} gains a little ground but struggles to maintain momentum.",
"{A} fights hard, neither gaining nor losing much distance.",
"{A} adjusts their footing carefully, trying not to lose balance.",
"{A} pulls with effort, but their opponent matches every move.",
"{A} gets dragged back slightly but refuses to give up.",
"{A} conserves energy, waiting for the right moment to push forward.",
"{A} stays focused, breathing heavily as the rope tightens.",
"{A} makes a small comeback but runs out of time to close the gap."
    ],
    negative: [
"{A} gets completely overpowered, pulled backward almost immediately.",
"{A} loses footing and is dragged across the ground helplessly.",
"{A} stumbles early and never recovers their balance.",
"{A} underestimates their opponent’s strength and pays the price fast.",
"{A} gets yanked off balance and pulled far from their flag.",
"{A} digs in too late and can’t stop the inevitable pullback.",
"{A} gets dominated from start to finish, barely putting up resistance.",
"{A} trips during the pull and collapses, losing all momentum.",
"{A} gives everything but tires out halfway through.",
"{A} can’t fight back and gets dragged like dead weight."
    ]
  }
  },
  {
    episode: 11,
    gender: "female",
    name: "Sticky Situation",
    description: "Players had to stick balls to a board as their opponent tries to stop them. Best out of 5 win.",
    skillWeights: { speed: 1.4, strength: 1.2, balance: 1.0, endurance: 0.8 },
  comments: {
    positive: [
"{A} moves fast and smart, dodging their opponent to stick another ball on the board.",
"{A} uses quick footwork and perfect timing to get each ball up without interference.",
"{A} stays aggressive, pushing through every block attempt with confidence.",
"{A} fakes one direction and sticks a ball cleanly before their opponent reacts.",
"{A} shows incredible speed and awareness, scoring multiple points with ease.",
"{A} stays calm under pressure, slipping past their rival again and again.",
"{A} plays with perfect rhythm — defend, attack, stick, repeat.",
"{A} muscles through a block and plants their final ball to take the round.",
"{A} anticipates every move, outsmarting their opponent from start to finish.",
"{A} dominates the round, sticking balls faster than their rival can respond."
    ],
    neutral: [
"{A} fights evenly with their opponent, trading control back and forth.",
"{A} gets a few balls up but struggles to keep momentum.",
"{A} starts slow but finds their rhythm halfway through the round.",
"{A} keeps up a steady pace but can’t quite pull ahead.",
"{A} lands a few points but spends most of the time on defense.",
"{A} looks tired but stays focused enough to stay in the match.",
"{A} misses a few chances but manages to even the score later.",
"{A} hesitates under pressure but still pulls off a decent showing.",
"{A} relies on counterattacks more than direct plays, with mixed results.",
"{A} gets into a solid rhythm but can’t quite finish the round strong."
    ],
    negative: [
"{A} gets completely shut down, barely managing to stick a single ball.",
"{A} can’t handle the pressure and spends the round chasing instead of scoring.",
"{A} gets blocked at every turn, running out of options quickly.",
"{A} tries to rush but drops the ball before reaching the board.",
"{A} looks completely lost as their opponent dominates the round.",
"{A} fumbles their movements and loses control multiple times.",
"{A} gets pushed back easily, unable to fight through the defense.",
"{A} goes for a risky move and slips, wasting precious seconds.",
"{A} hesitates too long and never even gets close to the board.",
"{A} collapses under pressure, ending the round empty-handed."
    ]
  }
  },
  {
    episode: 12,
    gender: "male",
    name: "Name That Coconut",
    description: "Players compete for the coconut with the name of the person that is the answer to a Real World/Road Rules trivia question. If the answer is wrong, the other player can answer freely. Best out of 9 win.",
    skillWeights: { mental: 1.8, speed: 1.2, endurance: 0.4 },
  comments: {
    positive: [
"{A} answers instantly, grabbing the right coconut without hesitation.",
"{A} stays completely calm and nails the question in seconds.",
"{A} reacts lightning-fast, beating their opponent to the answer.",
"{A} clearly knows their Challenge history and it shows.",
"{A} listens closely, smirks, and confidently picks the right name.",
"{A} buzzes in first every time, dominating the trivia showdown.",
"{A} doesn’t second-guess once — total focus, total accuracy.",
"{A} keeps a poker face but clearly knows every single question.",
"{A} outsmarts their opponent with perfect timing and memory.",
"{A} plays it cool and crushes the round with flawless answers."
    ],
    neutral: [
"{A} hesitates for a moment before answering, but still gets it right.",
"{A} takes their time thinking before finally grabbing the correct coconut.",
"{A} answers slowly, but confidently enough to stay in the game.",
"{A} misses one or two questions but keeps their composure.",
"{A} guesses on a few answers but manages to even the score.",
"{A} shows solid general knowledge, though not perfect recall.",
"{A} stays quiet for a few questions, waiting for the right moment to strike.",
"{A} reacts decently but is a little slow compared to their opponent.",
"{A} starts off shaky but finds their rhythm mid-match.",
"{A} gets a couple right, a couple wrong — an even performance."
    ],
    negative: [
"{A} grabs the wrong coconut immediately and realizes too late.",
"{A} freezes completely, unable to remember even the basics.",
"{A} shouts out an answer confidently — and it’s dead wrong.",
"{A} clearly blanks on the question and lets the opponent steal it.",
"{A} hesitates too long and loses every race to the coconut.",
"{A} mishears the question and goes for the wrong name entirely.",
"{A} panics and grabs a random coconut out of desperation.",
"{A} looks frustrated after a streak of wrong answers.",
"{A} laughs awkwardly after realizing they just gave away another point.",
"{A} completely collapses under pressure, losing focus and confidence."
    ]
   }
  },
  {
    episode: 13,
    gender: "female",
    name: "Beach Brawl",
    description: "Players have to wrestle their opponent out of a ring. Best out of 5 win.",
    skillWeights: { strength: 1.6, balance: 1.2, endurance: 1.0 },
  comments: {
    positive: [
"{A} charges in with explosive strength and sends their opponent flying out of the ring.",
"{A} locks in a perfect grapple and overpowers their opponent with ease.",
"{A} stays grounded, using raw power to control the center of the ring.",
"{A} uses perfect timing and leverage to flip their opponent cleanly out.",
"{A} shows total dominance, barely letting their opponent move an inch.",
"{A} wins the round decisively, outmuscling their rival completely.",
"{A} keeps low, balanced, and in control — pure wrestling instincts.",
"{A} outsmarts their opponent with a sudden counter shove.",
"{A} doesn’t even flinch during the struggle, pure focus and power.",
"{A} celebrates confidently after another clean takedown victory."
    ],
    neutral: [
"{A} holds their ground well, but both players are locked in a stalemate.",
"{A} struggles for control, neither gaining nor losing ground.",
"{A} fights with good form, though their strength seems evenly matched.",
"{A} nearly pushes their opponent out but loses leverage at the edge.",
"{A} and their opponent trade shoves for what feels like forever.",
"{A} stays patient, looking for the right opening.",
"{A} shows good effort but can’t find a decisive move.",
"{A} uses some solid defense to stay inside the ring longer than expected.",
"{A} gets pushed back but manages to recover before falling out.",
"{A} stays competitive through the round, though without clear control."
    ],
    negative: [
"{A} gets overpowered instantly and shoved right out of the ring.",
"{A} loses balance and topples out without much resistance.",
"{A} charges recklessly and gets flipped over the side.",
"{A} gets caught off guard and thrown out in seconds.",
"{A} slips trying to counter and rolls out of the ring awkwardly.",
"{A} can’t hold their footing and is forced out after a short struggle.",
"{A} gets completely manhandled, unable to fight back.",
"{A} loses grip mid-grapple and tumbles straight into the water.",
"{A} gets baited into a bad move and pays for it instantly.",
"{A} puts up little resistance before being tossed clean out of the ring."
    ]
  }
  },
  {
    episode: 14,
    gender: "male",
    name: "Capture the Flag",
    description: "Players have to climb up a 20-foot (approx. 6 meters) rope net to get a flag.",
    skillWeights: { climbing: 1.8, strength: 1.2, speed: 1.0, endurance: 0.8 },
  comments: {
    positive: [
"{A} explodes off the start and scales the net like it’s nothing.",
"{A} climbs with perfect rhythm, never missing a single grip.",
"{A} shows incredible upper-body strength, reaching the flag in seconds.",
"{A} moves fast and smooth, staying in total control the entire way up.",
"{A} never hesitates — every pull is powerful and precise.",
"{A} dominates from the start, grabbing the flag before their opponent is halfway up.",
"{A} keeps amazing focus, powering through the climb without slowing down once.",
"{A} uses flawless technique, moving efficiently and confidently to the top.",
"{A} reaches the flag in one clean burst, showing true athletic control.",
"{A} makes it look effortless, climbing with total power and composure."
    ],
    neutral: [
"{A} starts slow but builds steady momentum as they climb higher.",
"{A} struggles to find a rhythm at first but recovers halfway up.",
"{A} keeps pace with their opponent, trading the lead several times.",
"{A} climbs cautiously, taking time to secure each step.",
"{A} nearly slips once but quickly regains their footing.",
"{A} shows solid effort, even if their speed isn’t spectacular.",
"{A} keeps climbing steadily, refusing to look down or rush.",
"{A} paces themselves well, reaching the top safely though not the fastest.",
"{A} fights fatigue toward the end but pushes through to grab the flag.",
"{A} performs consistently, though without much flash or flair."
    ],
    negative: [
"{A} slips early and struggles to recover their momentum.",
"{A} loses grip and hangs awkwardly before sliding halfway down.",
"{A} looks exhausted before even reaching the midpoint.",
"{A} climbs too aggressively and misses a crucial foothold.",
"{A} completely misjudges their reach and has to restart their rhythm.",
"{A} gets tangled in the net, wasting precious seconds trying to untangle.",
"{A} slips right before the top and loses their chance at the flag.",
"{A} hesitates too long on the lower rungs, letting their opponent run away with it.",
"{A} shows poor coordination, constantly pausing between steps.",
"{A} loses confidence mid-climb and slows to a crawl."
    ]
  }
  },
  {
    episode: 15,
    gender: "female",
    name: "Sticky Situation",
    description: "Players had to stick balls to a board as their opponent tries to stop them. Best out of 5 win.",
    skillWeights: { speed: 1.4, strength: 1.2, balance: 1.0, endurance: 0.8 },
  comments: {
    positive: [
"{A} moves fast and smart, dodging their opponent to stick another ball on the board.",
"{A} uses quick footwork and perfect timing to get each ball up without interference.",
"{A} stays aggressive, pushing through every block attempt with confidence.",
"{A} fakes one direction and sticks a ball cleanly before their opponent reacts.",
"{A} shows incredible speed and awareness, scoring multiple points with ease.",
"{A} stays calm under pressure, slipping past their rival again and again.",
"{A} plays with perfect rhythm — defend, attack, stick, repeat.",
"{A} muscles through a block and plants their final ball to take the round.",
"{A} anticipates every move, outsmarting their opponent from start to finish.",
"{A} dominates the round, sticking balls faster than their rival can respond."
    ],
    neutral: [
"{A} fights evenly with their opponent, trading control back and forth.",
"{A} gets a few balls up but struggles to keep momentum.",
"{A} starts slow but finds their rhythm halfway through the round.",
"{A} keeps up a steady pace but can’t quite pull ahead.",
"{A} lands a few points but spends most of the time on defense.",
"{A} looks tired but stays focused enough to stay in the match.",
"{A} misses a few chances but manages to even the score later.",
"{A} hesitates under pressure but still pulls off a decent showing.",
"{A} relies on counterattacks more than direct plays, with mixed results.",
"{A} gets into a solid rhythm but can’t quite finish the round strong."
    ],
    negative: [
"{A} gets completely shut down, barely managing to stick a single ball.",
"{A} can’t handle the pressure and spends the round chasing instead of scoring.",
"{A} gets blocked at every turn, running out of options quickly.",
"{A} tries to rush but drops the ball before reaching the board.",
"{A} looks completely lost as their opponent dominates the round.",
"{A} fumbles their movements and loses control multiple times.",
"{A} gets pushed back easily, unable to fight through the defense.",
"{A} goes for a risky move and slips, wasting precious seconds.",
"{A} hesitates too long and never even gets close to the board.",
"{A} collapses under pressure, ending the round empty-handed."
    ]
  }
  }
];