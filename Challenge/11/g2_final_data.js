window.FINAL_DATA = {
  rules: "Three-stage team final. Each stage uses a unique skill mix. Each player may appear in exactly one stage. At least one player from each team must compete in each stage.",
  
  constraints: {
    minPerTeamPerStage: 1,
    playerOnceOnly: true
  },

  stages: [
    {
      stage: 1,
      name: "Roti Eating",
      description: "Players must eat 12 pounds of roti as fast as they can.",
      skillWeights: { eating: 1 },
    comments: {
      positive: [
"{A} devours the roti like a machine, barely stopping to breathe.",
"{A} stays laser-focused, chewing and swallowing at a ridiculous pace.",
"{A} looks completely unfazed by the mountain of food in front of them.",
"{A} finds a rhythm early and plows through the pile with determination.",
"{A} finishes plate after plate like it’s nothing — pure eating power."
      ],
      neutral: [
"{A} keeps a steady pace, showing solid endurance even as the roti stacks up.",
"{A} slows down halfway through but refuses to quit.",
"{A} takes careful bites, pacing themself to avoid burning out.",
"{A} looks mildly uncomfortable but keeps chewing through the pain.",
"{A} alternates between fast bursts and long pauses, trying to survive the meal."
      ],
      negative: [
"{A} gags halfway through and looks seconds away from giving up.",
"{A} can barely swallow another bite, visibly regretting every decision.",
"{A} takes forever to finish even one plate before throwing in the towel.",
"{A} coughs, chokes, and collapses under the sheer weight of all that bread.",
"{A} taps out early, completely defeated by the endless roti."
      ]
    }
    },
    {
      stage: 2,
      name: "Pirate Memory",
      description: "The players must remember a puzzle consisting of many parts, then run across the beach and replicate it on a new board.",
      skillWeights: { mental: 1, speed: 1 },
    comments: {
      positive: [
"{A} studies the puzzle once and recreates it perfectly without hesitation.",
"{A} sprints across the beach and places every piece with total confidence.",
"{A} shows incredible memory and focus, finishing in record time.",
"{A} double-checks their work quickly and still finishes ahead of everyone else.",
"{A} barely pauses to think — their recall is flawless."
      ],
      neutral: [
"{A} takes multiple trips back and forth, making steady but slow progress.",
"{A} remembers most of the puzzle, only mixing up a few small parts.",
"{A} spends extra time studying, sacrificing speed for accuracy.",
"{A} forgets a few pieces at first but eventually figures it out.",
"{A} works carefully, stopping often to recall the details."
      ],
      negative: [
"{A} blanks completely and can’t remember where anything goes.",
"{A} runs back and forth repeatedly, still unable to get the puzzle right.",
"{A} panics and starts placing pieces randomly in frustration.",
"{A} confuses colors and shapes, ending up with a total mess.",
"{A} wastes all their time staring at the board with no idea what to do."
      ]
    }
    },
    {
      stage: 3,
      name: "Sand Sprint",
      description: "The players swim out into the ocean, swim across the buoy, grab a key from a buoy, and get back to the beach. There, they must unlock a bike with the key, and ride the bike for 5 miles. After that, they abandon the bike, and must run another 3 miles back to the beach.",
      skillWeights: { speed: 1, swimming: 1, teamwork: 1 },
    comments: {
      positive: [
"{A} moves through the water like a pro and never slows down once they hit land.",
"{A} transitions seamlessly from the swim to the bike, wasting zero time.",
"{A} powers through the course with incredible endurance and focus.",
"{A} keeps a steady rhythm on the bike and finishes the run with a strong sprint.",
"{A} dominates every leg of the race — pure athletic precision from start to finish."
      ],
      neutral: [
"{A} starts strong in the water but loses a bit of speed on the bike.",
"{A} keeps a decent pace throughout, never falling behind or surging ahead.",
"{A} struggles to find the key quickly but regains momentum on the ride.",
"{A} maintains steady breathing, focusing more on finishing than winning.",
"{A} handles the transitions well but clearly tires during the final run."
      ],
      negative: [
"{A} burns out early in the swim and never fully recovers.",
"{A} fumbles with the key, losing crucial time before unlocking the bike.",
"{A} slows down drastically midway through the bike leg, completely spent.",
"{A} looks exhausted during the run, barely making it back to the beach.",
"{A} collapses from fatigue just before finishing the course."
      ]
    }
    }
  ]
};