// =========================================
// The Challenge: Free Agents — Final Stages (formatted from final_stages_data.js)
// =========================================
//
// Shape aligned to template.js:
// - stage: number (1..5)
// - id: string (unique, sequential)
// - name: string (unchanged)
// - description: string (unchanged)
// - stageType: "pair" | "solo"
// - timeWeights: { [skill: string]: number } (1 per listed skill)
// - timeRangeSec: [min, max]
// - pairRules (only on stage 1): defines rotation constraint for first three pair stages

window.FA_FINAL_DATA = [
  {
    stage: 1,
    id: "fa_final_s1",
    name: "Final — Stage 1",
    stageType: "pair",
    description: "Each pair races in a kayak.",
    timeWeights: { swimming: 1, endurance: 1, speed: 1 },
    timeRangeSec: [2400, 3600], // 40–60 min
    pairRules: { noRepeatAcrossFirstThree: true },
  },
  {
    stage: 2,
    id: "fa_final_s2",
    name: "Final — Stage 2",
    stageType: "pair",
    description:
      "Each pair races in a 10K run which gains 2,000 feet (610 m) through a mountain trail. At the end of the trail, each pair has to solve a puzzle entitled Latitude Problems, in which they have to stack a series of wooden discs in a pole that contain city names in geographical order from north to south. If a pair does not correctly solve the puzzle within a 30-minute time limit, they are permitted to reach the finish line to complete Stage 2.",
    timeWeights: { speed: 1, mental: 1 },
    timeRangeSec: [3600, 5400], // 1:00–1:30
  },
  {
    stage: 3,
    id: "fa_final_s3",
    name: "Final — Stage 3",
    stageType: "pair",
    description: "Each pair has to climb up a steep and rocky mountainside.",
    timeWeights: { speed: 1, climbing: 1, strength: 1 },
    timeRangeSec: [7200, 10800], // 2:00–3:00
  },
  {
    stage: 4,
    id: "fa_final_s4",
    name: "Final — Stage 4",
    stageType: "solo",
    description:
      "Each contestant has to pedal 25 miles on a stationary bike before seeking a meal and overnight rest in a nearby tent.",
    timeWeights: { speed: 1, endurance: 1 },
    timeRangeSec: [3600, 7200], // 1:00–2:00
  },
  {
    stage: 5,
    id: "fa_final_s5",
    name: "Final — Stage 5",
    stageType: "solo",
    description:
      "Each competitor has to climb up the snow-covered slopes of Villarica.",
    timeWeights: { climbing: 1, speed: 1, endurance: 1 },
    timeRangeSec: [7200, 10800], // 2:00–3:00
  },
];
