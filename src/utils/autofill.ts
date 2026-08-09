import { COMBO_ROUTES } from "../data/comboRoutes";
import { ELEMENT_IDS, type Character, type ElementId } from "../types";
import {
  canDetonateOrb,
  computeAssignment,
  getAvailableElements,
  isRouteFeasible,
  scoreRoute,
} from "./combo";

/** A computed element to write into a specific slot. */
export interface SlotFill {
  characterId: string;
  slotIndex: number;
  element: ElementId;
}

/**
 * Evaluates a party configuration by:
 * 1. the BEST feasible route — lowest energy demand, final orb detonable
 * 2. how many DIFFERENT routes it completes (same-element routes like
 *    fire-fire-fire collapse into one, so raw route count can't be gamed)
 * 3. raw route count only as a final tie-breaker
 * When nothing is feasible yet, prefers elements that complete the most
 * near-miss routes (2 of 3 stages covered).
 */
function evaluateParty(characters: Character[]): number {
  const available = getAvailableElements(characters);

  let best = -Infinity;
  let distinctCount = 0;
  let routeCount = 0;
  let hasSameElementRoute = false;

  for (const route of COMBO_ROUTES) {
    if (!isRouteFeasible(route, available)) continue;
    const assignment = computeAssignment(route, characters);
    let score = scoreRoute(route, characters, assignment);
    // A route whose final orb cannot be detonated is heavily penalized.
    if (!canDetonateOrb(route, characters)) score -= 10;
    best = Math.max(best, score);
    routeCount += 1;
    if (route.stage1 === route.stage2 && route.stage2 === route.stage3) {
      hasSameElementRoute = true;
    } else {
      distinctCount += 1;
    }
  }

  if (routeCount === 0) {
    // No feasible route yet: pick the element that completes the most
    // near-miss routes (2 of 3 stages already covered).
    let potential = 0;
    for (const route of COMBO_ROUTES) {
      let covered = 0;
      if (available.has(route.stage1)) covered += 1;
      if (available.has(route.stage2)) covered += 1;
      if (available.has(route.stage3)) covered += 1;
      if (covered === 2) potential += 1;
    }
    return potential;
  }

  // All same-element routes count as a single distinct combo.
  if (hasSameElementRoute) distinctCount += 1;

  return best * 1000 + distinctCount * 10 + routeCount;
}

/**
 * Greedily fills every empty (non-disabled) slot with the element that
 * maximizes the party's overall feasibility score at each step.
 * Disabled characters and disabled slots are never touched.
 */
export function computeAutoFill(characters: Character[]): SlotFill[] {
  const mutable = characters.map((character) => ({
    ...character,
    slots: character.slots.map((slot) => ({ ...slot })),
  }));

  const targets: { characterId: string; slotIndex: number }[] = [];
  for (const character of mutable) {
    if (character.disabled) continue;
    character.slots.forEach((slot, slotIndex) => {
      if (!slot.disabled && slot.element === null) {
        targets.push({ characterId: character.id, slotIndex });
      }
    });
  }

  const fills: SlotFill[] = [];
  for (const target of targets) {
    const character = mutable.find((candidate) => candidate.id === target.characterId);
    if (!character) continue;

    let best: ElementId | null = null;
    let bestScore = -Infinity;
    const previous = character.slots[target.slotIndex];

    for (const element of ELEMENT_IDS) {
      character.slots[target.slotIndex] = { element, disabled: false };
      const score = evaluateParty(mutable);
      if (score > bestScore) {
        bestScore = score;
        best = element;
      }
    }

    if (best !== null) {
      character.slots[target.slotIndex] = { element: best, disabled: false };
      fills.push({
        characterId: target.characterId,
        slotIndex: target.slotIndex,
        element: best,
      });
    } else {
      character.slots[target.slotIndex] = previous;
    }
  }

  return fills;
}
