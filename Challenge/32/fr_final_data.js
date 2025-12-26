/* Final Stages — TEMPLATE */
window.FR_FINAL = {
stages: [
{ id: 'F_STAGE_1', 
name: 'Vengeance Run', 
description: 'Players complete a four-kilometre run down a flat road.', 
timeWeights: { speed: 1 }, 
timeRange: [2400, 3600], 
grenadePenalty: 0 },

{ id: 'F_STAGE_2', 
name: 'Final Stand', 
description: 'Pairs stand on together on top of a tower with a narrow foothold. The first, second and third teams to fall off receive a ten, five and two-and-a-half-minute time penalty respectively added to their pairs total time. The last team to fall off receives no time penalty.', 
timeWeights: { endurance: 1, teamwork: 1 }, 
timeRange: [120, 600], 
grenadePenalty: 300 },

{ id: 'F_STAGE_3', 
name: 'Breakfast of Champions', 
description: 'Pairs must eat 32 plates of food containing delicacies from countries visited during the Challenge trilogy. The first team to eat all 32 plates wins the checkpoint and have their time stopped. Each remaining plate not consumed from the other three teams counts as a one-minute penalty towards that team.', 
timeWeights: { eating: 1 }, 
timeRange: [1200, 2100], 
grenadePenalty: 600 },

{ id: 'F_STAGE_4', 
name: 'Savana Sprint', 
description: 'Players complete a three-kilometre run through the jungle to the Sudwala Caves.', 
timeWeights: { speed: 1 }, 
timeRange: [2000, 2500], 
grenadePenalty: 300 },

{ id: 'F_STAGE_5', 
name: 'Final Reckoning', 
description: 'Players must walk over burning coals to reach the finish line.', 
timeWeights: { endurance: 1 }, 
timeRange: [240, 540], 
grenadePenalty: 0 }
]
};