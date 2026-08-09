/**
 * Core domain types for the XC2 Blade Combo Planner.
 */

/** The 8 elements (blade attributes) available in the game. */
export const ELEMENT_IDS = [
  "fire",
  "water",
  "earth",
  "electric",
  "wind",
  "ice",
  "light",
  "dark",
] as const;

export type ElementId = (typeof ELEMENT_IDS)[number];

/** The 8 seal effects granted by completing a blade combo (stage 3). */
export const SEAL_IDS = [
  "selfDestruct",
  "noxious",
  "shackleDriver",
  "backAttack",
  "blowdown",
  "shackleBlade",
  "affinityDown",
  "reinforcements",
] as const;

export type SealId = (typeof SEAL_IDS)[number];

/** A blade combo route: a sequence of 3 stage elements producing a seal effect. */
export interface ComboRoute {
  /** Unique id, e.g. `fire-fire-fire`. */
  id: string;
  stage1: ElementId;
  stage2: ElementId;
  stage3: ElementId;
  seal: SealId;
}

/** A single element slot of a character. Disabled slots cannot be used. */
export interface CharacterSlot {
  element: ElementId | null;
  disabled: boolean;
}

/** A party member with up to 3 blade element slots. Disabled characters are excluded from planning. */
export interface Character {
  id: string;
  disabled: boolean;
  slots: CharacterSlot[];
}

/**
 * Result of assigning each combo stage to a character who owns the required
 * element. `optimal` is true when all 3 stages can be handled by distinct
 * characters (no blade-switch cooldown conflicts).
 */
export interface RouteAssignment {
  /** Character id per stage (index 0..2). */
  assignments: string[];
  optimal: boolean;
}
