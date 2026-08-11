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

/** Auto-fill optimization preference. */
export type AutofillStrategy = "perfect" | "quality" | "coverage";

interface PartyMetrics {
  /** Feasible route count. */
  routeCount: number;
  /** Routes scoring at the party's top score with an optimal assignment. */
  perfectCount: number;
  /** Highest route difficulty score (before orb penalty). */
  bestScore: number;
  /** Distinct final-stage (stage 3) elements across routes executable by 3 different drivers. */
  elementCount: number;
  /** Feasible routes whose final orb can be detonated by the party. */
  detonableCount: number;
  /** Near-miss routes (2 of 3 stages covered) when nothing is feasible. */
  potential: number;
}

/** Computes the quality metrics of a party configuration. */
function evaluateParty(characters: Character[]): PartyMetrics {
  const available = getAvailableElements(characters);

  const metrics: PartyMetrics = {
    routeCount: 0,
    perfectCount: 0,
    bestScore: -Infinity,
    elementCount: 0,
    detonableCount: 0,
    potential: 0,
  };

  let topScore = -Infinity;
  const scored: {
    route: (typeof COMBO_ROUTES)[number];
    assignment: ReturnType<typeof computeAssignment>;
    score: number;
  }[] = [];
  // Distinct stage-3 elements covered by routes that 3 distinct drivers can execute.
  const optimalElements = new Set<ElementId>();
  let detonable = 0;

  for (const route of COMBO_ROUTES) {
    if (!isRouteFeasible(route, available)) continue;
    const assignment = computeAssignment(route, characters);
    const score = scoreRoute(route, characters, assignment);
    topScore = Math.max(topScore, score);
    metrics.routeCount += 1;
    if (assignment?.optimal) {
      optimalElements.add(route.stage3);
    }
    if (canDetonateOrb(route, characters)) detonable += 1;
    scored.push({ route, assignment, score });
  }

  if (metrics.routeCount === 0) {
    // Nothing feasible: count near-miss routes (2 of 3 stages covered).
    for (const route of COMBO_ROUTES) {
      let covered = 0;
      if (available.has(route.stage1)) covered += 1;
      if (available.has(route.stage2)) covered += 1;
      if (available.has(route.stage3)) covered += 1;
      if (covered === 2) metrics.potential += 1;
    }
    return metrics;
  }

  metrics.bestScore = topScore;
  metrics.elementCount = optimalElements.size;
  metrics.detonableCount = detonable;
  for (const { assignment, score } of scored) {
    if (assignment?.optimal && score === topScore) metrics.perfectCount += 1;
  }

  return metrics;
}

/** Ranks two configurations under the given strategy; positive means `a` is better. */
function compareByStrategy(a: PartyMetrics, b: PartyMetrics, strategy: AutofillStrategy): number {
  switch (strategy) {
    case "perfect":
      return (
        a.perfectCount - b.perfectCount ||
        a.detonableCount - b.detonableCount ||
        a.elementCount - b.elementCount ||
        a.routeCount - b.routeCount ||
        a.bestScore - b.bestScore
      );
    case "quality":
      return (
        a.bestScore - b.bestScore ||
        a.detonableCount - b.detonableCount ||
        a.elementCount - b.elementCount ||
        a.perfectCount - b.perfectCount ||
        a.routeCount - b.routeCount
      );
    case "coverage":
      return (
        a.routeCount - b.routeCount ||
        a.elementCount - b.elementCount ||
        a.detonableCount - b.detonableCount ||
        a.perfectCount - b.perfectCount
      );
  }
}

/**
 * Greedily fills every empty (non-disabled) slot with the element that best
 * matches the chosen strategy at each step:
 * - perfect: maximize PERFECT routes (top score + optimal assignment)
 * - quality: maximize the best route's difficulty score
 * - coverage: maximize the total number of feasible routes
 * Disabled characters and disabled slots are never touched.
 */
export function computeAutoFill(
  characters: Character[],
  strategy: AutofillStrategy = "perfect",
): SlotFill[] {
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
    let bestMetrics: PartyMetrics | null = null;
    const previous = character.slots[target.slotIndex];

    for (const element of ELEMENT_IDS) {
      character.slots[target.slotIndex] = { element, disabled: false };
      const metrics = evaluateParty(mutable);
      if (
        bestMetrics === null ||
        compareByStrategy(metrics, bestMetrics, strategy) > 0
      ) {
        bestMetrics = metrics;
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
