import type { ComboRoute } from "../types";

/**
 * All blade combo routes (stage 1 -> stage 2 -> stage 3 -> seal effect).
 * Data transcribed from the official XC2 blade combo chart.
 */
export const COMBO_ROUTES: ComboRoute[] = [
  // Fire start
  { id: "fire-fire-fire", stage1: "fire", stage2: "fire", stage3: "fire", seal: "selfDestruct" },
  { id: "fire-fire-light", stage1: "fire", stage2: "fire", stage3: "light", seal: "affinityDown" },
  { id: "fire-water-fire", stage1: "fire", stage2: "water", stage3: "fire", seal: "selfDestruct" },
  { id: "fire-water-ice", stage1: "fire", stage2: "water", stage3: "ice", seal: "shackleBlade" },

  // Water start
  { id: "water-water-water", stage1: "water", stage2: "water", stage3: "water", seal: "noxious" },
  {
    id: "water-water-dark",
    stage1: "water",
    stage2: "water",
    stage3: "dark",
    seal: "reinforcements",
  },
  { id: "water-earth-wind", stage1: "water", stage2: "earth", stage3: "wind", seal: "blowdown" },

  // Earth start
  { id: "earth-fire-wind", stage1: "earth", stage2: "fire", stage3: "wind", seal: "blowdown" },
  {
    id: "earth-fire-earth",
    stage1: "earth",
    stage2: "fire",
    stage3: "earth",
    seal: "shackleDriver",
  },
  {
    id: "earth-earth-electric",
    stage1: "earth",
    stage2: "earth",
    stage3: "electric",
    seal: "backAttack",
  },

  // Electric start
  {
    id: "electric-fire-wind",
    stage1: "electric",
    stage2: "fire",
    stage3: "wind",
    seal: "blowdown",
  },
  {
    id: "electric-fire-ice",
    stage1: "electric",
    stage2: "fire",
    stage3: "ice",
    seal: "shackleBlade",
  },
  {
    id: "electric-electric-water",
    stage1: "electric",
    stage2: "electric",
    stage3: "water",
    seal: "noxious",
  },

  // Wind start
  { id: "wind-wind-earth", stage1: "wind", stage2: "wind", stage3: "earth", seal: "shackleDriver" },
  {
    id: "wind-wind-electric",
    stage1: "wind",
    stage2: "wind",
    stage3: "electric",
    seal: "backAttack",
  },
  {
    id: "wind-electric-water",
    stage1: "wind",
    stage2: "electric",
    stage3: "water",
    seal: "noxious",
  },

  // Ice start
  { id: "ice-water-wind", stage1: "ice", stage2: "water", stage3: "wind", seal: "blowdown" },
  { id: "ice-ice-earth", stage1: "ice", stage2: "ice", stage3: "earth", seal: "shackleDriver" },
  { id: "ice-ice-dark", stage1: "ice", stage2: "ice", stage3: "dark", seal: "reinforcements" },

  // Light start
  {
    id: "light-electric-fire",
    stage1: "light",
    stage2: "electric",
    stage3: "fire",
    seal: "selfDestruct",
  },
  { id: "light-light-water", stage1: "light", stage2: "light", stage3: "water", seal: "noxious" },
  {
    id: "light-light-light",
    stage1: "light",
    stage2: "light",
    stage3: "light",
    seal: "affinityDown",
  },

  // Dark start
  {
    id: "dark-light-electric",
    stage1: "dark",
    stage2: "light",
    stage3: "electric",
    seal: "backAttack",
  },
  { id: "dark-dark-earth", stage1: "dark", stage2: "dark", stage3: "earth", seal: "shackleDriver" },
  { id: "dark-dark-dark", stage1: "dark", stage2: "dark", stage3: "dark", seal: "reinforcements" },
];
