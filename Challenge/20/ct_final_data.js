/* Cutthroat — Finals (Episode 10)
   Flow: Status → Stage 1 → … → Stage 7 → Final Results.
   Teams are ranked per stage by team-average skill (lower = better), then season winner by lowest average placement across stages.
   Keep the same wrapper/keys as Gauntlet FINAL_DATA. */

window.FINAL_DATA = {
  rules: "Seven-stage team final. Score each stage by team-average of required skills (lower = better). Final standings = lowest average placement across stages.",
  constraints: {
    // Keep these if you want the same guardrails Gauntlet used; adjust or remove as needed.
    minPerTeamPerStage: 1,
    playerOnceOnly: false
  },

  stages: [
    {
      stage: 1,
      name: "Seeing Spots",
      description: "The final challenge begins with each team sprinting to the first checkpoint, in which each team has to designate one player to stand in front of a wall containing five white targets, and one teammate has to hit each target with a paint ball gun before advancing.",
      skillWeights: { balance: 1, speed: 1.6, teamwork: 1.2 },
      comments: {
        positive: [
"{A} sprints to the checkpoint with perfect speed and focus, wasting no time setting up.",
"{A} aims steadily, hitting each target in quick succession without missing a shot.",
"{A} keeps calm under pressure, communicating clearly with their teammate to adjust aim.",
"{A} reloads smoothly and fires with precision, dropping all five targets in record time.",
"{A} celebrates with a confident nod as their team advances to the next stage."
        ],
        neutral: [
"{A} steadies their breathing before taking the next shot.",
"{A} calls out directions to their teammate, ensuring alignment with the targets.",
"{A} takes time to line up the sights before pulling the trigger.",
"{A} adjusts stance between shots, maintaining control of the paintball gun.",
"{A} stays composed after a few near misses, focusing on accuracy over speed."
        ],
        negative: [
"{A} fires too quickly and misses several targets in a row.",
"{A} struggles to maintain balance while adjusting their aim.",
"{A} misfires and has to reload, costing the team precious seconds.",
"{A} hesitates before shooting, giving their opponent time to pull ahead.",
"{A} grows frustrated after repeated misses, breaking the team’s rhythm."
        ]
      }
    },

    { stage: 2, 
name: "So Tired", 
description: "In this checkpoint teams have to roll oversize tires on the tarmac.", 
skillWeights: { speed: 1, strength: 1.6, endurance: 1 }, 
comments: { positive: [
"{A} grips the tire firmly and drives it forward with explosive strength.",
"{A} keeps perfect control, rolling the tire straight down the tarmac without wobbling.",
"{A} communicates smoothly with their teammate, keeping the rhythm steady and fast.",
"{A} pushes through fatigue, maintaining speed all the way to the checkpoint line.",
"{A} finishes the roll strong, guiding the tire into place with flawless precision."
], 
neutral: [
"{A} steadies the tire before pushing, checking the alignment on the tarmac.",
"{A} keeps a consistent pace, focusing on control over speed.",
"{A} adjusts grip mid-roll, making sure the tire stays upright.",
"{A} calls out to their teammate to sync their push and direction.",
"{A} pauses briefly to reset balance before continuing the roll."
], negative: [
"{A} loses grip and watches the tire veer off course.",
"{A} pushes unevenly, causing the tire to wobble and slow down.",
"{A} stumbles mid-roll and has to chase the tire to regain control.",
"{A} tires quickly, struggling to keep the tire moving straight.",
"{A} misjudges the angle and the tire topples over before reaching the checkpoint."
] } },

    { stage: 3, 
name: "Down & Dirty", 
description: "In this checkpoint players have to slide through an obstacle course containing a dirt pit.", 
skillWeights: { }, 
comments: { 
positive: [
"{A} dives into the dirt pit with full commitment, sliding cleanly through the obstacle.",
"{A} keeps momentum strong, maneuvering through the course with agility and control.",
"{A} uses quick reflexes to duck, slide, and twist past every barrier.",
"{A} stays low and efficient, gliding through the pit without losing speed.",
"{A} clears the final section flawlessly, maintaining rhythm all the way through."
], 
neutral: [
"{A} slides cautiously into the pit, testing how the dirt shifts beneath them.",
"{A} adjusts position midway through the course to stay balanced.",
"{A} slows slightly to avoid colliding with a barrier ahead.",
"{A} wipes dirt from their eyes before continuing the slide.",
"{A} steadies themselves before crawling out of the final section."
], 
negative: [
"{A} loses balance and tumbles awkwardly into the dirt pit.",
"{A} slides too fast and crashes into a barrier mid-course.",
"{A} gets stuck in a soft patch of dirt, losing precious time.",
"{A} misjudges the angle and flips sideways during the slide.",
"{A} hesitates at the start, breaking their team’s momentum through the obstacle."
] } },

    { stage: 4, 
name: "Free Ride", 
description: "At this checkpoint all players from each team have to ride horses to the next check point.", 
skillWeights: { speed: 1 }, 
comments: { positive: [
"{A} mounts the horse smoothly and takes off at a steady, confident pace.",
"{A} controls the reins perfectly, guiding the horse with calm precision.",
"{A} keeps posture firm and balanced, maintaining speed across uneven terrain.",
"{A} encourages the horse with steady commands, keeping rhythm with the team.",
"{A} leads the pack confidently, riding with focus and effortless control."
], neutral: [
"{A} adjusts their footing in the stirrups, settling into a comfortable rhythm.",
"{A} keeps the horse at a controlled trot, matching pace with teammates.",
"{A} focuses on steering through the terrain without rushing.",
"{A} glances back to make sure the rest of the team is keeping up.",
"{A} maintains a calm pace, conserving both their energy and the horse’s."
], negative: [
"{A} struggles to control the horse, veering slightly off course.",
"{A} loses balance momentarily while adjusting the reins.",
"{A} pulls too hard on the reins, slowing the horse abruptly.",
"{A} falls behind the group after the horse hesitates on uneven ground.",
"{A} looks uneasy in the saddle, gripping tightly just to stay steady."
] } },

    { stage: 5, 
name: "Hard Wood", 
description: "At this checkpoint, each team must transfer a pile of wood to the top of a hangar in a designated area before advancing to the next checkpoint.", 
skillWeights: { strength: 1.8, endurance: 1.2, teamwork: 1 }, 
comments: { positive: [
"{A} lifts each piece of wood with strength and precision, wasting no movement.",
"{A} keeps a steady rhythm, carrying heavy loads efficiently up to the hangar.",
"{A} coordinates perfectly with teammates, passing wood hand-to-hand in seamless motion.",
"{A} powers through fatigue, maintaining flawless pace until the pile is cleared.",
"{A} finishes the transfer strong, stacking the final pieces neatly in the designated area."
], neutral: [
"{A} carries manageable loads, focusing on consistency over speed.",
"{A} pauses briefly to adjust grip before resuming the climb.",
"{A} works steadily with the group, ensuring every piece is accounted for.",
"{A} calls out to teammates to align the stacking process.",
"{A} wipes sweat from their hands before lifting the next set of boards."
], negative: [
"{A} loses grip and drops a piece of wood midway up the hangar.",
"{A} missteps on the climb, forcing a momentary reset.",
"{A} slows down visibly, struggling under the weight of the load.",
"{A} stacks the pieces unevenly, causing a small pile to topple.",
"{A} hesitates between lifts, falling out of sync with the team’s pace."
] } },
    { stage: 6, 
name: "Sign Language", 
description: "In this checkpoint, in which each team has to memorize the placement of a sign post containing Czech road signs, then crawl through an obstacle course through mud and under barb wire, then swim through a lake. After swimming through a lake, each team has to slide a series of Czech road signs through a pole to duplicate the sign post from the earlier checkpoint. If a team slides in each sign correctly, they can advance, otherwise, they have to return to the original checkpoint.", 
skillWeights: { speed: 1.6, balance: 1, endurance: 1.2, teamwork: 1, mental: 1.8 }, 
comments: { positive: [
"{A} memorizes the entire sign post layout quickly, recalling every detail with confidence.",
"{A} crawls through the mud with precision, keeping low and efficient under the barbed wire.",
"{A} dives into the lake and swims powerfully toward the reconstruction point.",
"{A} arranges the signs perfectly, sliding each into place without hesitation.",
"{A} keeps composure from start to finish, leading the team to a flawless duplication."
], neutral: [
"{A} studies the sign post carefully, repeating the order under their breath.",
"{A} moves steadily through the mud, keeping a consistent crawl pace.",
"{A} surfaces mid-lake for a breath before continuing strong to shore.",
"{A} checks the sign placement twice before locking it in.",
"{A} works with their teammate to verify each sign’s position before finalizing."
], negative: [
"{A} forgets part of the sign order and hesitates during reconstruction.",
"{A} gets tangled briefly in the barb wire and loses time.",
"{A} slows down in the mud pit, struggling to maintain form.",
"{A} misplaces a few signs and has to redo the sequence from scratch.",
"{A} tires during the swim, barely reaching the checkpoint before falling behind."
] } },
    { stage: 7, name: "Run to the Finish Line", 
description: "The final stretch involves a sprint to the top of Bezděz Castle.", 
skillWeights: { speed: 1, teamwork: 1 }, 
comments: { positive: [
"{A} explodes into the final sprint, charging up the castle path with unstoppable determination.",
"{A} maintains perfect form, powering up each step with relentless energy.",
"{A} breathes steadily, pushing through exhaustion with laser focus on the finish line.",
"{A} overtakes opponents with a final burst of speed near the top of the castle.",
"{A} reaches the summit strong, raising their arms in triumph as their team celebrates."
], neutral: [
"{A} keeps a steady pace, saving energy for the final climb.",
"{A} glances upward, gauging the remaining distance to the summit.",
"{A} adjusts footing on uneven stone steps to maintain rhythm.",
"{A} encourages teammates as they climb together toward the top.",
"{A} stays focused on breathing, pacing each stride through the steep incline."
], negative: [
"{A} starts too fast and fades halfway up the castle path.",
"{A} struggles with the incline, slowing to catch their breath.",
"{A} slips on loose stones and loses momentum near the top.",
"{A} grimaces from exhaustion, falling a few steps behind their opponent.",
"{A} reaches the summit visibly drained, gasping for air as others finish ahead."
] } }
  ]
};
