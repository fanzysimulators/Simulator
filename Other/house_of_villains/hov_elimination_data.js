// hov_elimination_data.js
// Redemption Challenge data for "House of Villains"

window.hov_elimination_data = [
  // EPISODE 1 – 3-player Redemption Challenge
  {
    id: 1,
    episode: 1,
    type: "redemption", // for clarity; your logic can filter on this if you want
    name: "Blind Trust",
    description: "The three players that are nominated to be on the Hit List now have the power to save themselves from Banishment. Contestants must drive a golf cart through a course while blindfolded, being directed by another contestant of their choice. The contestant with the fastest time wins.",
    skillWeights: { speed: 1, teamwork: 1 },
    comments: {
      positive: [
"{A} responds instantly to every direction, steering the cart smoothly through the course.",
"{A} keeps perfect control of the wheel, navigating each turn with surprising precision.",
"{A} accelerates confidently when told, shaving off seconds with clean, fast driving.",
"{A} follows instructions flawlessly, gliding through obstacles without a single correction.",
"{A} crosses the finish line with a sharp final turn, completing the run in record time."
      ],
      neutral: [
"{A} keeps a steady pace, following verbal directions carefully.",
"{A} slows the cart slightly when the path narrows, staying cautious but controlled.",
"{A} double-checks instructions before making tighter turns.",
"{A} maintains a straight line when directed, adjusting gently along the way.",
"{A} takes each cue calmly, neither rushing nor hesitating too long."
      ],
      negative: [
"{A} oversteers on a turn, bumping into the edge of the course.",
"{A} hesitates at a direction change, losing momentum.",
"{A} gets confused by the instructions and veers off the intended path.",
"{A} misjudges distance and nearly clips a marker on the course.",
"{A} panics mid-run, braking too hard and wasting valuable time."
      ]
    }
  },

  // EPISODE 2 – Redemption Challenge
  {
    id: 2,
    episode: 2,
    type: "redemption",
    name: "Hidden Agenda",
    description: "The three players that are nominated to be on the Hit List now have the power to save themselves from Banishment. During their confessionals, the three nominated contestants are given the details of the challenge in secret. They must complete as many listed tasks as possible without being noticed by the rest of the house. There is a four-hour time limit which expires when guest Abby Lee Miller arrives at the house to announce the results. The contestant with the most tasks completed wins.",
    skillWeights: { speed: 0.5, strategy: 2, mental: 1 },
    comments: {
      positive: [
"{A} slips tasks into the day flawlessly, completing each one without raising suspicion.",
"{A} blends their actions naturally into conversations, ticking off tasks with ease.",
"{A} maintains perfect composure, making even the strangest task look normal.",
"{A} completes multiple tasks back-to-back with smooth, clever improvisation.",
"{A} disguises their intentions brilliantly, fooling everyone in the house while racking up points."
],
      neutral: [
"{A} attempts a task casually, keeping an eye out for anyone watching.",
"{A} plays it safe, waiting for the right moment before making their next move.",
"{A} tries to blend in with the house activity while sneaking in small tasks.",
"{A} hesitates briefly before committing to a task, ensuring no one is nearby.",
"{A} spends time studying the list, planning which tasks to complete next."
],
      negative: [
"{A} performs a task too awkwardly, drawing suspicious looks from the others.",
"{A} nearly gets caught mid-task and panics, abandoning it halfway.",
"{A} misjudges the moment and completes a task right as someone walks in.",
"{A} fumbles an attempt and quickly pretends it was accidental, losing valuable time.",
"{A} gets visibly nervous, making it obvious something unusual is going on."
]
    }
  },

  // EPISODE 3 – Redemption Challenge
  {
    id: 3,
    episode: 3,
    type: "redemption",
    name: "Darkest Hour",
    description: "The three players that are nominated to be on the Hit List now have the power to save themselves from Banishment. Contestants enter a dark room and must stick their hands in enclosures of live animals including snakes, rats and scorpions to search for tokens. After finding each token, they can assign it to an opponent; contestants are eliminated from the challenge once they are assigned five tokens. The last contestant standing wins.",
    skillWeights: { speed: 1.5, mental: 0.5 },
    comments: {
      positive: [
"{A} reaches into the enclosures confidently, retrieving tokens with steady hands.",
"{A} navigates the dark room calmly, showing no fear of the animals inside.",
"{A} collects tokens quickly and assigns them strategically to the strongest opponents.",
"{A} handles each creature gently, pulling out tokens without hesitating.",
"{A} moves with focus and precision, staying ahead as others struggle."
],
      neutral: [
"{A} feels around cautiously inside the enclosure before grabbing anything.",
"{A} takes slow breaths to stay calm while searching among the animals.",
"{A} pauses briefly to listen to movement in the room before continuing.",
"{A} steps carefully across the dark floor, making sure not to bump into obstacles.",
"{A} assigns tokens one at a time, watching how players react."
],
      negative: [
"{A} recoils when touching a moving animal, dropping the token inside.",
"{A} freezes in fear after brushing against something unexpected.",
"{A} struggles to find tokens in the dark, wasting precious time.",
"{A} accidentally assigns a token to a weak opponent, missing a strategic opportunity.",
"{A} gets too rattled by the animals and falls behind quickly."
]
    }
  },

  // EPISODE 4 – Redemption Challenge
  {
    id: 4,
    episode: 4,
    type: "redemption",
    name: "Cap It Off",
    description: "The three players that are nominated to be on the Hit List now have the power to save themselves from Banishment. Played across seven rounds. Each round, contestants are shown a photo of a moment during the season and attempt to come up with a humorous caption for the photo. The captions are then presented anonymously to the four non-competing contestants, who vote on the most humorous caption, with most-voted caption winning the round. The contestant who wins the most rounds wins.",
    skillWeights: { social: 2, mental: 0.5 },
    comments: {
      positive: [
"{A} delivers a brilliantly clever caption that gets unanimous laughter from the voters.",
"{A} crafts a sharp, witty line that stands out instantly among the entries.",
"{A} keeps momentum with multiple strong jokes, winning round after round.",
"{A} adapts quickly to each photo, coming up with creative punchlines.",
"{A} dominates the voting with consistently hilarious captions."
],
      neutral: [
"{A} submits a steady, mildly funny caption that earns a few smiles.",
"{A} tries a safe joke, neither risky nor particularly bold.",
"{A} tailors their caption to the obvious humor in the photo.",
"{A} plays it conservative, delivering a light, simple punchline.",
"{A} lands in the middle of the pack with a caption that’s decent but not memorable."
],
      negative: [
"{A} submits a caption that falls flat and gets zero votes.",
"{A} tries too hard to be funny and ends up confusing the voters.",
"{A} delivers a joke that completely misses the tone of the photo.",
"{A} overthinks the humor and produces a caption that doesn’t land.",
"{A} repeats a weak joke format, causing voters to skip their entry entirely."
]
    }
  },

  // EPISODE 6 – FINAL Redemption Challenge (3 nominees -> 1 finalist)
  {
    id: 5,
    episode: 6,
    type: "redemption",
    name: "Who Said It?",
    description: "The three players that are nominated to be on the Hit List now have the power to save themselves from Banishment. Contestants are presented with seven quotes said by other contestants during the season and attempt to guess which contestants said them to earn points. The contestant with the most points wins and claims the final spot in the finale while the two losing villains are eliminated from the game.",
    skillWeights: { mental: 1, teamwork: 1.5 },
    comments: {
      positive: [
"{A} recognizes the quote instantly, naming the correct contestant without hesitation.",
"{A} connects the voice and moment perfectly, scoring the point with total confidence.",
"{A} recalls the scene in detail and locks in the right answer immediately.",
"{A} stays sharp under pressure, identifying multiple quotes in a row.",
"{A} shows impressive memory, matching each quote to the correct person flawlessly."
],
      neutral: [
"{A} thinks carefully before answering, replaying the moment in their mind.",
"{A} takes a few extra seconds to picture who might have said the line.",
"{A} narrows the quote down to two contestants before committing to an answer.",
"{A} delivers a cautious guess, neither gaining nor losing momentum.",
"{A} reviews past conversations quietly, trying to place the voice behind the quote."
],
      negative: [
"{A} confuses the moment completely and names the wrong contestant.",
"{A} hesitates too long, losing confidence before giving an answer.",
"{A} mixes up the quote with a different scene and guesses incorrectly.",
"{A} blurts out a rushed answer that turns out to be wrong.",
"{A} struggles to remember who said the line, falling behind on points."
]
    }
  }
];

window.hov_elims = window.hov_elimination_data;
