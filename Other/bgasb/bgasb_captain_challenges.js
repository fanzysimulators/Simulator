window.CAPTAIN_CHALLENGE_DATA = [
  {
    id: "cap_start_mud",
    startingCaptain: true,
    name: "The Mud Challenge",
    description:
      "A limited amount of green balls are lined up in a large mud pit. Ray J instructs each contestant to cross the finish line with a ball (reduced every round) to advance. Anyone without a ball is eliminated. The first winner becomes captain of the Gold Team, and the second winner becomes captain of the Red Team.",
    skillWeights: {
      strength: 0.8,
      balance: 0.3,
      speed: 1
    },
    comments: {
      positive: [
        "{A} powers through the mud like it’s nothing and snatches a ball early.",
        "{A} keeps their footing when everyone else is slipping and sliding.",
        "{A} shows serious hustle and always gets to the ball pile first.",
        "{A} muscles past the chaos and charges across the finish.",
        "{A} stays calm under pressure and makes the smart move every round."
      ],
      neutral: [
        "{A} keeps pace and survives the messy scramble.",
        "{A} plays it safe, avoids the worst traffic, and advances.",
        "{A} slips once but recovers quickly enough to stay in it.",
        "{A} doesn’t dominate, but consistently grabs a ball in time.",
        "{A} makes it through without drawing too much attention."
      ],
      negative: [
        "{A} gets stuck in the mud and can’t recover the lost time.",
        "{A} hesitates at the ball pile and gets boxed out fast.",
        "{A} loses their grip and watches someone else steal the spot.",
        "{A} looks overwhelmed by the chaos and falls behind early.",
        "{A} runs out of gas and ends up empty-handed when it counts."
      ]
    }
  },
  {
    id: "cap_start_lipstick",
    startingCaptain: true,
    name: "Lipstick Ladder",
    description:
      "A towering wall of staggered platforms leads up to a rack of lipstick tubes at the top. Contestants race to climb and snatch a tube, but there are fewer tubes each round—anyone who reaches the top empty-handed is eliminated. The first two to secure a tube in the final rounds and cross the finish line earn captain spots (Gold for first, Red for second).",
    skillWeights: {
      climbing: 1.5,
      balance: 0.6,
      strength: 0.4,
      speed: 1
    },
    comments: {
      positive: [
        "{A} climbs like a pro and snatches a lipstick without breaking rhythm.",
        "{A} stays steady on the platforms and never loses momentum.",
        "{A} times the scramble perfectly and beats the crowd to the rack.",
        "{A} keeps their balance under pressure and closes it out strong.",
        "{A} shows fearless control and reaches the top fast."
      ],
      neutral: [
        "{A} climbs carefully and does just enough to stay alive.",
        "{A} takes a cautious route and avoids risky jumps.",
        "{A} gets there mid-pack but still manages to advance.",
        "{A} doesn’t look flashy, but keeps moving and survives.",
        "{A} slips once, regroups, and continues climbing."
      ],
      negative: [
        "{A} rushes a step, loses balance, and falls behind instantly.",
        "{A} freezes up when the crowd surges and can’t reach the rack in time.",
        "{A} burns energy early and runs out of strength near the top.",
        "{A} misjudges a platform and wastes precious seconds recovering.",
        "{A} reaches the top too late and ends up empty-handed."
      ]
    }
  },
  {
    id: "cap_start_purse",
    startingCaptain: true,
    name: "Purse Raid",
    description:
      "A messy room is filled with a massive pile of purses and bags. Hidden inside are a limited number of coins contestants must find and bring back to the finish. Each round reduces the number of coins, making the search more desperate as players tear through bags and race the line. The first two to return with the final coins become captains (Gold first, Red second).",
    skillWeights: {
      mental: 1.5,
      speed: 0.8
    },
    comments: {
      positive: [
        "{A} searches smart, finds coins fast, and never wastes motion.",
        "{A} reads the room perfectly and targets the right spots first.",
        "{A} keeps composure in the chaos and out-hustles everyone.",
        "{A} moves with purpose and beats the rush back to the finish.",
        "{A} locks in and consistently finds coins round after round."
      ],
      neutral: [
        "{A} takes a steady approach and manages to stay in the hunt.",
        "{A} gets jostled a bit but still finds what they need in time.",
        "{A} isn’t the fastest, but stays focused and advances.",
        "{A} plays it safe, avoids conflict, and still makes it back.",
        "{A} has a slow start but improves as the rounds go on."
      ],
      negative: [
        "{A} panics, digs in the wrong places, and loses too much time.",
        "{A} gets caught up in the brawl and forgets the objective.",
        "{A} can’t keep up with the scramble and falls behind early.",
        "{A} fumbles their coin on the run back and it costs them everything.",
        "{A} looks frustrated and never finds a rhythm in the search."
      ]
    }
  },
  {
    id: "cap_start_button",
    startingCaptain: true,
    name: "Red Button Roulette",
    description:
      "A giant wall of identical buttons faces the contestants, but only a few are “live” each round. Players sprint and commit to a button. On the countdown, wrong buttons trigger a trap that eliminates whoever chose them. Safe buttons shrink each round until only two players hit safe buttons back-to-back and earn captain spots.",
    skillWeights: {
      speed: 1.4,
      mental: 0.9,
      balance: 0.4
    },
    comments: {
      positive: [
        "{A} reacts instantly and picks the right button under pressure.",
        "{A} stays sharp, reads patterns, and keeps surviving round after round.",
        "{A} commits without hesitation and nails the timing perfectly.",
        "{A} keeps their cool when everyone else panics and it pays off.",
        "{A} makes a bold choice and proves it wasn’t luck."
      ],
      neutral: [
        "{A} hesitates a bit but still makes a choice in time.",
        "{A} survives the round without standing out too much.",
        "{A} gets lucky once, but follows it up with a solid pick.",
        "{A} stays in the mix and avoids the worst decisions.",
        "{A} keeps it simple and advances."
      ],
      negative: [
        "{A} overthinks it and commits too late.",
        "{A} chooses poorly and gets caught by the trap immediately.",
        "{A} looks rattled and makes a panic pick that backfires.",
        "{A} gets pushed off their spot and loses their chance.",
        "{A} can’t find a strategy and keeps guessing wrong."
      ]
    }
  },
  {
    id: "cap_start_auction",
    startingCaptain: true,
    name: "Bad Girl Auction",
    description:
      "Each contestant gets a small stack of chips to bid on advantages shown one at a time—extra time, a shortcut, a protective shield, or a sabotage token. Some items are worthless and some are secretly curses. After the auction, everyone runs a short final course using what they won. The two best finishers become captains.",
    skillWeights: {
      mental: 1.5,
      speed: 0.7,
      teamwork: 0.3
    },
    comments: {
      positive: [
        "{A} bids smart, grabs the right advantage, and dominates the course.",
        "{A} reads the room and never overpays for the good stuff.",
        "{A} plays strategically and turns a small edge into a big win.",
        "{A} keeps a cool head and makes every bid count.",
        "{A} uses their item perfectly and flies past the competition."
      ],
      neutral: [
        "{A} plays it safe in the auction and does fine on the course.",
        "{A} makes a decent pick and stays competitive.",
        "{A} doesn’t get the best item, but still performs solidly.",
        "{A} avoids the obvious traps and survives the chaos.",
        "{A} is steady—no huge risks, no huge mistakes."
      ],
      negative: [
        "{A} blows all their chips early and ends up empty-handed later.",
        "{A} buys into a curse and looks shocked when it backfires.",
        "{A} gets baited into a bidding war and loses focus.",
        "{A} can’t adapt on the course and wastes their advantage.",
        "{A} makes the wrong call at the auction and pays for it immediately."
      ]
    }
  },

  {
    id: "cap_money_honey",
    startingCaptain: false,
    name: "Give Me the Money Honey",
    description:
      "Each girl lathers up in honey to collect coins and deposit them into a piggy bank. The girl who collects the most coins wins team captain.",
    skillWeights: {
      endurance: 0.2,
      balance: 1,
      speed: 0.8
    },
    comments: {
      positive: [
        "{A} powers through the sticky mess and racks up coins fast.",
        "{A} keeps moving nonstop and fills the bank like a machine.",
        "{A} stays balanced even while slipping and sliding everywhere.",
        "{A} finds a rhythm and outworks everyone from start to finish.",
        "{A} is relentless and turns the chaos into a clean win."
      ],
      neutral: [
        "{A} collects a decent amount and stays competitive.",
        "{A} struggles with the honey at first but settles in.",
        "{A} keeps a steady pace without any big mistakes.",
        "{A} isn’t the fastest, but stays consistent the whole time.",
        "{A} does fine—nothing spectacular, nothing disastrous."
      ],
      negative: [
        "{A} gets slowed down by the honey and can’t catch up.",
        "{A} keeps dropping coins and wastes too much time.",
        "{A} looks exhausted early and fades hard down the stretch.",
        "{A} slips repeatedly and loses momentum every time.",
        "{A} gets frustrated and never finds a rhythm."
      ]
    }
  },
  {
    id: "cap_brain_game",
    startingCaptain: false,
    name: "Bad Girls Brain Game",
    description:
      "Each girl stands in an open stall to answer questions on geography, pop culture, trivia, and spelling. Wrong answers lead to elimination with a disgusting shower, while the best performer earns team captain.",
    skillWeights: {
      mental: 1
    },
    comments: {
      positive: [
        "{A} is locked in and fires off correct answers like it’s easy.",
        "{A} stays calm under pressure and outsmarts the whole room.",
        "{A} dominates the trivia and never even looks unsure.",
        "{A} pulls off clutch answers exactly when it matters.",
        "{A} proves they’re the brains of the house and takes captaincy."
      ],
      neutral: [
        "{A} starts slow but finds a groove halfway through.",
        "{A} trades correct answers with others and stays in the mix.",
        "{A} hesitates but still gets enough right to survive.",
        "{A} does okay—some strong moments, some shaky ones.",
        "{A} keeps steady and avoids a total collapse."
      ],
      negative: [
        "{A} blanks out and gets exposed fast.",
        "{A} panics on simple questions and spirals.",
        "{A} guesses wildly and it shows.",
        "{A} can’t handle the pressure and falls apart.",
        "{A} looks completely lost in this game."
      ]
    }
  },
  {
    id: "cap_swing_on_me",
    startingCaptain: false,
    name: "Swing On Me",
    description:
      "The girls are assigned a male partner harnessed to a crane over a harbor. Each girl must hang on as long as possible, testing strength and endurance. The best performer earns captain.",
    skillWeights: {
      strength: 1,
      endurance: 1.5,
      balance: 0.4
    },
    comments: {
      positive: [
        "{A} grips like iron and refuses to let go.",
        "{A} endures the swing and stays composed the entire time.",
        "{A} outlasts everyone with pure grit and strength.",
        "{A} locks in their hold and makes it look effortless.",
        "{A} proves they’re built different and takes the win."
      ],
      neutral: [
        "{A} hangs on for a respectable time before dropping.",
        "{A} adjusts well but can’t quite match the top endurance.",
        "{A} keeps steady and avoids a quick elimination.",
        "{A} fights through the discomfort and lasts mid-pack.",
        "{A} does fine, but doesn’t separate from the field."
      ],
      negative: [
        "{A} loses their grip early and drops fast.",
        "{A} panics when the swinging starts and can’t recover.",
        "{A} looks uncomfortable and taps out quickly.",
        "{A} can’t stabilize their hold and slips off.",
        "{A} fades immediately and it’s not even close."
      ]
    }
  },
  {
    id: "cap_square_off",
    startingCaptain: false,
    name: "Square Off",
    description:
      "Bad Girls compete against their own team in one-on-one pairs, tournament style. They must push their opponent off a platform into the water using pillows. The last one standing earns captain.",
    skillWeights: {
      strength: 1.4,
      balance: 0.8,
      endurance: 0.2
    },
    comments: {
      positive: [
        "{A} controls the platform and shoves their opponent with ease.",
        "{A} stays balanced while delivering heavy hits.",
        "{A} plays smart defense and wins with perfect timing.",
        "{A} outmuscles everyone and runs the bracket.",
        "{A} never wobbles and finishes the job clean."
      ],
      neutral: [
        "{A} puts up a fight but gets edged out in the end.",
        "{A} holds their ground for a while before slipping.",
        "{A} lands some good shots but can’t close it out.",
        "{A} survives a round or two without dominating.",
        "{A} battles evenly, but loses on a small mistake."
      ],
      negative: [
        "{A} gets knocked off fast and never finds footing.",
        "{A} overcommits on offense and gets countered immediately.",
        "{A} wobbles early and becomes an easy target.",
        "{A} looks hesitant and gets overwhelmed.",
        "{A} loses balance and tumbles off before it’s competitive."
      ]
    }
  },
  {
    id: "cap_bed_pool",
    startingCaptain: false,
    name: "Bed In The Pool",
    description:
      "Girls swim into the pond to retrieve a bed mattress with their name on it, then drag the soaked mattress across the field and place it onto their team’s bed frame. Fastest finish earns captain.",
    skillWeights: {
      swimming: 1.5,
      strength: 1,
      endurance: 0.4,
      speed: 0.6
    },
    comments: {
      positive: [
        "{A} crushes the swim and drags the mattress like it weighs nothing.",
        "{A} stays relentless and wins it with pure effort.",
        "{A} powers across the field and finishes with a huge lead.",
        "{A} keeps their pace steady and never slows down.",
        "{A} handles the water and the haul like a complete beast."
      ],
      neutral: [
        "{A} does fine in the water but slows a bit on the drag.",
        "{A} struggles at first, then finds momentum midway through.",
        "{A} stays consistent and finishes solidly.",
        "{A} keeps moving without major mistakes.",
        "{A} finishes mid-pack after an average run."
      ],
      negative: [
        "{A} tires in the water and loses ground fast.",
        "{A} can’t get the mattress moving and stalls out.",
        "{A} burns out early and never recovers.",
        "{A} looks defeated once the drag starts.",
        "{A} gets stuck fighting the weight and falls far behind."
      ]
    }
  },
  {
    id: "cap_going_ham",
    startingCaptain: false,
    name: "Going H.A.M.",
    description:
      "Inside a pig pen are 25 pigs wearing collars. Only two collars match the team colors. The first girl to find a correct collar, remove it, and place it on a mannequin wins captain.",
    skillWeights: {
      mental: 0.5,
      speed: 1,
      balance: 0.4
    },
    comments: {
      positive: [
        "{A} spots the right collar fast and moves with purpose.",
        "{A} stays fearless in the pen and finishes first cleanly.",
        "{A} keeps focus and out-hustles everyone in the chaos.",
        "{A} reads the colors instantly and makes a perfect grab.",
        "{A} turns the pig pen into a speedrun and wins it."
      ],
      neutral: [
        "{A} searches steadily and stays competitive.",
        "{A} gets close a few times but just misses the win.",
        "{A} keeps pace without panicking.",
        "{A} moves carefully and avoids getting thrown off.",
        "{A} does alright but can’t find the right one fast enough."
      ],
      negative: [
        "{A} chases the wrong pigs and wastes too much time.",
        "{A} gets flustered and can’t focus on the colors.",
        "{A} looks overwhelmed by the chaos and slows down.",
        "{A} struggles to control the pigs and loses momentum.",
        "{A} never finds the right collar and falls out of contention."
      ]
    }
  },
  {
    id: "cap_muddy_mayhem",
    startingCaptain: false,
    name: "Muddy Mayhem",
    description:
      "A giant mud pit is filled with scattered platforms that slowly sink. Music plays and the girls must get onto a platform whenever the music stops. Platforms are removed each round. Anyone without a platform is eliminated until only two remain—top finisher earns captain.",
    skillWeights: {
      speed: 1,
      balance: 0.6,
      strength: 0.2,
      mental: 0.4
    },
    comments: {
      positive: [
        "{A} times every dash perfectly and never misses a platform.",
        "{A} keeps balance on sinking platforms like it’s nothing.",
        "{A} outreacts everyone and always claims the best spot.",
        "{A} stays calm in the scramble and survives every cut.",
        "{A} turns chaos into control and takes the win."
      ],
      neutral: [
        "{A} survives with decent timing and steady movement.",
        "{A} slips once but recovers and stays alive.",
        "{A} plays it safe and keeps finding a platform in time.",
        "{A} doesn’t dominate, but avoids the worst mistakes.",
        "{A} stays in the mix round after round."
      ],
      negative: [
        "{A} reacts too late and gets stranded in the mud.",
        "{A} loses balance on a platform and can’t recover.",
        "{A} gets boxed out by the crowd and panics.",
        "{A} looks exhausted and slows down at the wrong time.",
        "{A} misreads the stop and gets eliminated immediately."
      ]
    }
  },
  {
    id: "cap_hot_mess_express",
    startingCaptain: false,
    name: "Hot Mess Express",
    description:
      "A makeshift party bus sits on a tilting platform. Inside, girls dig through piles of chaos to find color-coded tokens matching their team colors. The bus tilts and jerks at random. The first to collect all tokens and exit without dropping them earns captain.",
    skillWeights: {
      mental: 0.4,
      balance: 1,
      endurance: 0.3
    },
    comments: {
      positive: [
        "{A} stays balanced through every tilt and finds tokens fast.",
        "{A} keeps a clear head in the mess and finishes first.",
        "{A} moves efficiently and never drops a single token.",
        "{A} adapts to the chaos and outplays everyone inside the bus.",
        "{A} is locked in and makes the madness look easy."
      ],
      neutral: [
        "{A} finds tokens steadily but can’t quite catch the leaders.",
        "{A} drops one token but recovers quickly.",
        "{A} stays upright and survives the chaos fine.",
        "{A} moves carefully and avoids big errors.",
        "{A} does okay, but loses time searching."
      ],
      negative: [
        "{A} loses balance and gets thrown off rhythm immediately.",
        "{A} keeps dropping tokens and can’t stabilize.",
        "{A} panics in the clutter and searches the wrong places.",
        "{A} looks dizzy from the tilts and slows down hard.",
        "{A} gets overwhelmed and never finds all the tokens."
      ]
    }
  },
  {
    id: "cap_drama_ladder",
    startingCaptain: false,
    name: "Drama Ladder",
    description:
      "A tall, wobbly ladder sits over a shallow mud pit. Each rung has a trivia card about past fights, scandals, and house drama. Girls climb, read the card, and answer out loud. Wrong answers force a restart. The first to reach the top and hit the buzzer earns captain.",
    skillWeights: {
      climbing: 1,
      mental: 1,
      balance: 0.6
    },
    comments: {
      positive: [
        "{A} climbs steady and nails every drama question perfectly.",
        "{A} keeps balance on the ladder and answers without hesitation.",
        "{A} knows the tea and uses it to sprint to the top.",
        "{A} stays composed and never has to restart once.",
        "{A} dominates both brains and balance and hits the buzzer first."
      ],
      neutral: [
        "{A} answers most questions right but takes a cautious climb.",
        "{A} slips a little but recovers and continues.",
        "{A} restarts once, then improves quickly.",
        "{A} climbs steadily and stays competitive.",
        "{A} does fine, but can’t match the fastest climbers."
      ],
      negative: [
        "{A} blanks on the drama and keeps getting forced to restart.",
        "{A} loses balance and wastes time regrouping.",
        "{A} rushes answers and pays for it immediately.",
        "{A} looks rattled on the ladder and can’t focus.",
        "{A} falls behind early and never closes the gap."
      ]
    }
  },
  {
    id: "cap_mirror_match",
    startingCaptain: false,
    name: "Mirror Match",
    description:
      "Contestants face a wall of mirrors and glowing symbols. A sequence flashes briefly, then disappears. Players must recreate it by stepping on floor tiles in the correct order. One mistake eliminates you instantly. Sequences get longer and faster until the best performer earns captain.",
    skillWeights: {
      mental: 1.4,
      speed: 0.7,
      balance: 0.3
    },
    comments: {
      positive: [
        "{A} memorizes the sequence instantly and executes flawlessly.",
        "{A} stays sharp as the patterns get harder and faster.",
        "{A} doesn’t miss a step and outlasts everyone cleanly.",
        "{A} keeps cool under pressure and nails the final sequence.",
        "{A} turns this into a clinic and earns captain without doubt."
      ],
      neutral: [
        "{A} starts strong but struggles once the sequences ramp up.",
        "{A} keeps up for a while with steady execution.",
        "{A} hesitates but still survives multiple rounds.",
        "{A} makes it deep before a small slip ends it.",
        "{A} performs okay—solid focus, not elite."
      ],
      negative: [
        "{A} forgets the sequence immediately and gets eliminated fast.",
        "{A} panics mid-pattern and steps wrong.",
        "{A} can’t handle the speed increase and falls apart.",
        "{A} overthinks every move and runs out of time.",
        "{A} looks completely rattled the moment pressure hits."
      ]
    }
  },
  {
    id: "cap_bottle_service",
    startingCaptain: false,
    name: "Bottle Service",
    description:
      "Contestants race through a nightclub-themed maze carrying a tall tray stacked with cups. If your stack drops below the required number, you’re out. Each round the maze changes and the tray gets shakier. The best finisher in the final round earns captain.",
    skillWeights: {
      balance: 1.5,
      speed: 0.8,
      endurance: 0.5
    },
    comments: {
      positive: [
        "{A} flies through the maze with a perfectly stable stack.",
        "{A} keeps balance under pressure and never loses a cup.",
        "{A} takes the cleanest lines and finishes like a pro.",
        "{A} stays steady even when the maze shifts and shakes.",
        "{A} makes it look effortless and seals captaincy."
      ],
      neutral: [
        "{A} moves carefully and keeps most of the stack intact.",
        "{A} wobbles a bit but recovers in time.",
        "{A} finishes solidly without any huge mistakes.",
        "{A} stays controlled, even if not the fastest.",
        "{A} holds it together, but can’t catch the leaders."
      ],
      negative: [
        "{A} rushes and spills cups almost immediately.",
        "{A} loses balance on a turn and the stack collapses.",
        "{A} panics when it starts shaking and drops below the limit.",
        "{A} can’t stabilize the tray and gets eliminated fast.",
        "{A} looks frustrated and never regains control."
      ]
    }
  },
  {
    id: "cap_gauntlet_gallery",
    startingCaptain: false,
    name: "Gauntlet Gallery",
    description:
      "A hallway is lined with hanging punching bags, swinging panels, and obstacles. At the end is a board of numbered tiles. Players fight through, rip a tile, and race it back. If you grab a number that’s already taken, you’re eliminated. The best survivor earns captain.",
    skillWeights: {
      strength: 1,
      speed: 1,
      balance: 0.4
    },
    comments: {
      positive: [
        "{A} bulldozes through the obstacles and grabs a tile first.",
        "{A} stays fast and sharp—never picks a taken number.",
        "{A} powers through hits and still sprints back with speed.",
        "{A} dominates the hallway and controls the pace.",
        "{A} makes perfect choices under pressure and wins it clean."
      ],
      neutral: [
        "{A} takes some hits but keeps moving forward.",
        "{A} hesitates at the board but still grabs a valid tile.",
        "{A} stays competitive without standing out.",
        "{A} survives a few rounds with solid effort.",
        "{A} does okay, but can’t match the top speed."
      ],
      negative: [
        "{A} gets stalled by the obstacles and loses too much time.",
        "{A} grabs a taken number and gets eliminated instantly.",
        "{A} looks overwhelmed by the contact and slows down hard.",
        "{A} makes a rushed decision and it costs them.",
        "{A} can’t keep up with the intensity and fades early."
      ]
    }
  },
  {
    id: "cap_crown_or_clown",
    startingCaptain: false,
    name: "Crown or Clown",
    description:
      "Contestants stand on raised platforms while a rotating launcher fires foam crowns and clown hats. Catch a crown and keep it on until the buzzer; catch a clown hat and you’re eliminated. Crowns get fewer and the launcher speeds up. The top performer earns captain.",
    skillWeights: {
      balance: 1.5,
      speed: 0.7,
      mental: 0.7
    },
    comments: {
      positive: [
        "{A} tracks the launcher perfectly and snags a crown clean.",
        "{A} keeps balance under pressure and never drops it.",
        "{A} reads the flight path like a pro and stays crowned.",
        "{A} stays calm as speed increases and still wins.",
        "{A} outreacts everyone and takes captain in style."
      ],
      neutral: [
        "{A} catches a crown once but can’t hold it to the end.",
        "{A} stays competitive and avoids the worst mistakes.",
        "{A} reacts decently, but gets edged out late.",
        "{A} keeps balance but misses a key catch.",
        "{A} survives a while before slipping up."
      ],
      negative: [
        "{A} mistimes the catch and gets clown-hatted immediately.",
        "{A} panics as the launcher speeds up and makes a bad grab.",
        "{A} loses balance and drops out fast.",
        "{A} keeps reaching wrong and it costs them.",
        "{A} looks rattled and can’t adjust to the pace."
      ]
    }
  },
  {
    id: "cap_security_check",
    startingCaptain: false,
    name: "Security Check",
    description:
      "A club entrance checkpoint has velvet ropes, metal detectors, and bouncers guarding lanes. Each lane requires the correct hidden item (wristband color, stamp, token) among decoys. Get to the bouncer without the right item and you’re eliminated. The best finisher earns captain.",
    skillWeights: {
      mental: 1,
      speed: 0.8
    },
    comments: {
      positive: [
        "{A} spots the correct item instantly and breezes through security.",
        "{A} stays sharp, ignores decoys, and makes perfect choices.",
        "{A} moves fast without rushing mistakes—clean run.",
        "{A} reads every lane correctly and never gets turned away.",
        "{A} keeps composure and wins with smart decisions."
      ],
      neutral: [
        "{A} double-checks items and advances steadily.",
        "{A} makes one small mistake but recovers quickly.",
        "{A} stays competitive without dominating.",
        "{A} moves carefully and avoids elimination.",
        "{A} does fine, but loses time sorting decoys."
      ],
      negative: [
        "{A} grabs the wrong item and gets bounced immediately.",
        "{A} rushes, panics, and chooses poorly.",
        "{A} overthinks every lane and runs out of time.",
        "{A} gets overwhelmed by decoys and falls behind fast.",
        "{A} can’t find a strategy and keeps guessing wrong."
      ]
    }
  },
  {
    id: "cap_stack_attack",
    startingCaptain: false,
    name: "Stack Attack",
    description:
      "Contestants build the tallest tower from unstable blocks while standing on wobbling platforms that shake harder each round. When the horn sounds, towers are judged and bottom placements are eliminated. The top builder earns captain.",
    skillWeights: {
      balance: 2,
      mental: 0.9,
      endurance: 0.3
    },
    comments: {
      positive: [
        "{A} stays perfectly steady and stacks a tower that’s untouchable.",
        "{A} keeps focus through the shaking and places blocks flawlessly.",
        "{A} builds smart, stable, and tall—easy captain material.",
        "{A} never panics and outclasses everyone in precision.",
        "{A} adjusts to every wobble and still finishes on top."
      ],
      neutral: [
        "{A} builds a decent tower, but it’s not the tallest.",
        "{A} wobbles a bit and plays it safe with stability.",
        "{A} stays focused and survives a few rounds comfortably.",
        "{A} has a solid structure, just not enough height.",
        "{A} performs fine—steady, but not standout."
      ],
      negative: [
        "{A} loses balance and the whole tower collapses.",
        "{A} rushes placements and the stack becomes unstable fast.",
        "{A} panics when the shaking increases and makes sloppy moves.",
        "{A} can’t keep steady on the platform and falls behind.",
        "{A} builds too risky and pays for it when it topples."
      ]
    }
  },
  {
    id: "cap_freeze_frame",
    startingCaptain: false,
    name: "Freeze Frame",
    description:
      "A runway has flashing lights and random freeze sirens. Contestants sprint to grab a photo strip and run it back, but when the siren blares they must freeze instantly—any movement eliminates you. The best finisher earns captain.",
    skillWeights: {
      speed: 1,
      mental: 1.5,
      balance: 0.4
    },
    comments: {
      positive: [
        "{A} sprints hard and freezes on a dime every single time.",
        "{A} has perfect control—fast when it’s go, stone-still when it’s stop.",
        "{A} reads the rhythm and never gets caught moving.",
        "{A} stays composed under pressure and finishes first clean.",
        "{A} dominates the timing and makes it look easy."
      ],
      neutral: [
        "{A} moves well but plays a little cautious on the freezes.",
        "{A} survives multiple sirens with solid control.",
        "{A} hesitates once, but keeps it together.",
        "{A} stays consistent, though not the fastest runner.",
        "{A} does fine, but loses time on conservative stops."
      ],
      negative: [
        "{A} flinches on the siren and gets eliminated immediately.",
        "{A} can’t stop their momentum and it costs them.",
        "{A} panics and moves at the worst possible time.",
        "{A} looks rattled and never finds the timing.",
        "{A} goes too hard, loses control, and gets caught moving."
      ]
    }
  },
  {
    id: "cap_spotlight_switch",
    startingCaptain: false,
    name: "Spotlight Switch",
    description:
      "The arena goes dark except for moving spotlights. Only those standing in the light when the horn sounds are safe. Safe spotlights decrease each round and move faster. The last best survivor earns captain.",
    skillWeights: {
      speed: 1,
      mental: 0.8,
      balance: 0.4,
      endurance: 1
    },
    comments: {
      positive: [
        "{A} times every move perfectly and is always in the light.",
        "{A} stays calm and outreacts everyone when the spots shift.",
        "{A} reads the pattern like a puzzle and never misses safety.",
        "{A} moves with purpose and claims the best spotlight every round.",
        "{A} is flawless under pressure and locks up captaincy."
      ],
      neutral: [
        "{A} makes smart moves and survives a good while.",
        "{A} reacts a little late but still finds light in time.",
        "{A} stays competitive without dominating the floor.",
        "{A} plays it safe and keeps sneaking into the spotlight.",
        "{A} survives multiple rounds, then gets edged out late."
      ],
      negative: [
        "{A} misjudges the timing and gets caught in the dark.",
        "{A} panics when the lights speed up and makes a bad dash.",
        "{A} hesitates and loses the only safe spot.",
        "{A} looks overwhelmed and can’t keep up with the movement.",
        "{A} makes one wrong read and it ends everything instantly."
      ]
    }
  }
];
