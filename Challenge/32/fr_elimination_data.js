/*
Elimination Games — TEMPLATE
Loaded by: ./index.html
For E5 and E9, opponents involve Mercenary Teams; your router controls who faces whom.


Fields:
- id, episode, name, description
- skillWeights: { skill: weight, ... }
*/


window.FR_ELIMS = [
{ id: 'E2_ELIM', 
episode: 2, 
name: 'Think Outside the Box', 
description: 'One teammate is tethered to the center of the arena and attached to a resistance band while the other is inside a cage with a hole in the ceiling. The tethered teammate must run and retrieve large puzzle pieces that fit together to form a cube and give them to their teammate in the cage. The teammate in the cage must assemble the puzzle in order to climb out of the cage. The first team to successfully have their teammate escape the cage wins.', 
skillWeights: { strength: 1.0, mental: 1.4, climbing: 1.0 }},

{ id: 'E4_ELIM', 
episode: 4, 
name: 'Ramp It Up', 
description: 'Each team starts on separate ramps. Each player must race up their opponents ramp to collect a single ball. Once collecting a ball they must race back to the top of their ramp and deposit the ball into a cylinder tube. The first team to collect 7 balls wins.', 
 skillWeights: { climbing: 1.2, speed: 1.0 }},


// Episode 5: Top‑voted team faces Mercenary Team #1 (no opponent choice by players)
{ id: 'E5_ELIM_MERC1', 
episode: 5, 
name: 'No Slack', 
description: 'Teams are tethered together in a box, separated by three walls each. Each player must smash through a plaster hole in each wall until both players are able to escape through the six walls. The first team to break through the six walls and escape the box wins.', 
skillWeights: { strength: 1.6, endurance: 1.0 }},


{ id: 'E6_ELIM', episode: 6, 
name: 'Think Tank', 
description: 'One player hangs from a rope system by their ankles over a water tank where a puzzle key is located at the bottom. The other player climbs a ladder to give their partner enough slack to dive underwater and read the puzzle key which they relay to the climber to solve a puzzle. The first team to complete the puzzle wins. If neither team is able to complete the puzzle in the allotted time, whichever team has the most correct answers would win.', 
skillWeights: { swimming: 1.0, mental: 1.4, teamwork: 1.2 }},

{ id: 'E8_ELIM', 
episode: 8, 
name: 'Tread Lightly', 
description: 'Players have to balance a ball between two sticks, then run across a stage with two treadmills going in opposite directions, and deposit their ball into a bin. The first team to deposit ten balls into their bin wins.', 
skillWeights: { balance: 1.4, speed: 1.0 }},


// Episode 9: Two elimination teams each face Mercenary Team #2 separately
{ id: 'E9_ELIM_MERC2', 
episode: 9, 
name: 'Shake It Off', 
description: 'Both teams must shake off medallions hanging from a rope by jumping off a platform, grabbing the rope, and letting it go so that it shakes until all the medallions are off. The first team to shake off all nine medallions from their rope wins.', 
skillWeights: { balance: 1.0, strength: 1.2, speed: 1.0 }},


{ id: 'E10_ELIM', 
episode: 10, 
name: 'Meet Me Halfway', 
description: 'Both players on each team will start at opposite ends of a maze. Carrying a key to a lock, each player must crash through dry walls in the maze until the reach the center where they then must unlock a box, retrieve the contents and ring their nearest team bell. The first team to ring their bell with the contents of their box wins.', 
skillWeights: { strength: 1.4, speed: 1.0, teamwork: 0.8 }},

{ id: 'E11_ELIM', episode: 11, 
name: 'Dont Trip Me Up', 
description: 'One member of the team must dive under a water tank to untie tiles so that both team members can build a house of cards on a floating platform to a designated marker. The first team to build their tower wins.', 
skillWeights: { swimming: 1.0, balance: 1.2, strategy: 1.4 }},

{ id: 'E13_ELIM', 
episode: 13, 
name: 'Thats The Ticket', 
description: 'One player is stationed in a giant sphere filled with numbered, multi-colored balls. Their goal is to collect their teams five numbers while the partner from the opposing team rotates a crank that spins the wheel. Whoever deposits the correct five balls first wins.', 
skillWeights: { strength: 1.2, balance: 0.8 }},

{ id: 'E14_ELIM', 
episode: 14, 
name: 'Milk & Cookies', 
description: 'One team member would stand on a perch, both arms above their head with their wrists tethered to a bucket of mursik milk. The other team member would be eating cookies and Mursik milk. If the player on the perch falls off, their partner must stop eating cookies. If both team members eating finish their cookies and milk, then the elimination comes down to the perched players in a battle of endurance. The first team to either eat the most cookies or stand on the perch the longest, wins.', 
skillWeights: { eating: 1.0, endurance: 1.4 }}
];