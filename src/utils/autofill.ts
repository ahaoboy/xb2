import { COMBO_ROUTES } from "../data/comboRoutes";
import { ELEMENT_IDS, type Character, type ElementId } from "../types";
import { computeAssignment, getAvailableElements, isRouteFeasible, scoreRoute } from "./combo";

/** A computed element to write into a specific slot. */
export interface SlotFill {
  characterId: string;
  slotIndex: number;
  element: ElementId;
}

/**
 * Evaluates a party configuration: rewards every feasible route, weighted by
 * its XC2 difficulty score (variety, distinct drivers, orb detonation).
 */
function evaluateParty(characters: Character[]): number {
  const available = getAvailableElements(characters);
  let total = 0;
  for (const route of COMBO_ROUTES) {
    if (!isRouteFeasible(route, available)) continue;
    const assignment = computeAssignment(route, characters);
    total += 10 + Math.max(0, scoreRoute(route, characters, assignment));
  }
  return total;
}

/**
 * Greedily fills every empty (non-disabled) slot with the element that
 * maximizes the party's overall feasibility score at each step.
 * Disabled slots are never touched.
 */
export function computeAutoFill(characters: Character[]): SlotFill[] {
  const mutable = characters.map((character) => ({
    ...character,
    slots: character.slots.map((slot) => ({ ...slot })),
  }));

  const targets: { characterId: string; slotIndex: number }[] = [];
  for (const character of mutable) {
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
