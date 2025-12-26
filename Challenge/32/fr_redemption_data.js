/* Redemption Challenges — TEMPLATE
Loaded by: ./index.html
Used for Episodes 3, 7, and 12 when Redemption House teams fight to re‑enter the game.
*/


window.FR_REDEMPTION = [
{ id: 'E3_REDEMPTION', 
episode: 3, 
name: 'Balls to the Wall', 
description: 'Players are placed in separate cages with a sludge hammer for each partner sticking out of the walls. Each teammate must break the sledgehammer through the wall before proceeding to break a block of ice that blocks their escape. The first team to successfully escape the cage by breaking the ice wins.', 
skillWeights: { strength: 1.4 } },

{ id: 'E7_REDEMPTION', 
episode: 7, 
name: 'Pyramid Schemers', 
description: 'One team tries to solve two same-colored puzzles on a rotating pyramid in under three minutes. After three minutes, the next team tries to solve their respective puzzle. The first team to finish both of their puzzles first wins. If the first team completes their puzzle, the second team has a limited amount of time to complete their puzzle or they lose.', 
skillWeights: { speed: 0.8, mental: 1.4, strategy: 1.2 } },

{ id: 'E12_REDEMPTION', 
episode: 12, 
name: 'I Got You Pegged', 
description: 'Both teams must place 16 numbered pegs on their respective climbing wall, with one person climbing and the other distributing the pegs. The numbers on the blue pegs are additioned to the total and the numbers on the red pegs are subtracted from the total, the goal is reaching the number 32. The first team to have the right answer and ring the bell wins.', 
skillWeights: { climbing: 1.2, mental: 1.2, teamwork: 1.0 } }
];