import type { Character, ComboRoute, ElementId, RouteAssignment, SealId } from "../types";

/**
 * XC2 element counter chart: the element that can break/explode an orb of
 * the given element (used to detonate the orb created by the final stage).
 */
export const ELEMENT_COUNTER: Record<ElementId, ElementId> = {
  fire: "water",
  water: "earth",
  earth: "electric",
  electric: "wind",
  wind: "ice",
  ice: "fire",
  light: "dark",
  dark: "light",
};

/** Union of all non-empty, non-disabled elements across enabled characters. */
export function getAvailableElements(characters: Character[]): Set<ElementId> {
  const available = new Set<ElementId>();
  for (const character of characters) {
    if (character.disabled) continue;
    for (const slot of character.slots) {
      if (!slot.disabled && slot.element !== null) {
        available.add(slot.element);
      }
    }
  }
  return available;
}

/** A route is feasible when every stage element is held by at least one character. */
export function isRouteFeasible(route: ComboRoute, available: Set<ElementId>): boolean {
  return available.has(route.stage1) && available.has(route.stage2) && available.has(route.stage3);
}

/** Filters the full route list down to feasible routes, optionally by seal effect. */
export function filterFeasibleRoutes(
  routes: ComboRoute[],
  characters: Character[],
  sealFilter: SealId | null = null,
): ComboRoute[] {
  const available = getAvailableElements(characters);
  return routes.filter(
    (route) =>
      isRouteFeasible(route, available) && (sealFilter === null || route.seal === sealFilter),
  );
}

/**
 * Finds the best character assignment for a route. Prefers assignments that
 * spread the 3 stages across distinct characters (avoids blade-switch
 * cooldown conflicts). Returns null when the route is not feasible.
 */
export function computeAssignment(
  route: ComboRoute,
  characters: Character[],
): RouteAssignment | null {
  const stageElements = [route.stage1, route.stage2, route.stage3];

  const candidates = stageElements.map((element) =>
    characters
      .filter(
        (character) =>
          !character.disabled &&
          character.slots.some((slot) => !slot.disabled && slot.element === element),
      )
      .map((character) => character.id),
  );

  if (candidates.some((list) => list.length === 0)) {
    return null;
  }

  let best: string[] | null = null;
  let bestDistinctCount = -1;

  const search = (depth: number, picked: string[]): void => {
    if (depth === stageElements.length) {
      const distinctCount = new Set(picked).size;
      if (distinctCount > bestDistinctCount) {
        bestDistinctCount = distinctCount;
        best = [...picked];
      }
      return;
    }
    for (const id of candidates[depth]) {
      search(depth + 1, [...picked, id]);
    }
  };

  search(0, []);

  return {
    assignments: best ?? [],
    optimal: bestDistinctCount >= stageElements.length,
  };
}

/** A node of the blade-combo route tree (one per stage element combination). */
export interface ComboTreeNode {
  element: ElementId;
  /** 1-based combo stage this node represents (leaves are always stage 3). */
  stage: 1 | 2 | 3;
  /** Element path from the route start to this node (inclusive). */
  path: ElementId[];
  children: ComboTreeNode[];
  /** Leaf only: the route that ends at this node. */
  route?: ComboRoute;
  /** Leaf only: best character assignment for the route. */
  assignment?: RouteAssignment | null;
  /** Leaf only: the best-scoring route within this tree (shown with a *). */
  recommended?: boolean;
  /** Number of routes in this subtree (used for tooltips). */
  routeCount: number;
}

/** A route paired with its computed character assignment. */
export interface RouteEntry {
  route: ComboRoute;
  assignment: RouteAssignment | null;
}

/**
 * XC2 energy model: executing the k-th combo stage costs the driver k arts
 * energy (stage 1 = 1, stage 2 = 2, stage 3 = 3). A driver covering several
 * stages must charge the SUM of those stage costs:
 *   - stages 1+2      -> 1+2 = 3 arts
 *   - stages 2+3      -> 2+3 = 5 arts
 *   - stages 1+3      -> 1+3 = 4 arts
 *   - all 3 stages    -> 1+2+3 = 6 arts
 * Because party energy grows over time, the real difficulty is the HIGHEST
 * single driver's demand: three drivers one stage each only need 1/2/3 arts
 * (max 3), while one driver doing all 3 needs 6.
 */
function maxEnergyDemand(assignment: RouteAssignment | null): number {
  const perDriver = new Map<string, number>();
  for (const [index, id] of (assignment?.assignments ?? []).entries()) {
    perDriver.set(id, (perDriver.get(id) ?? 0) + (index + 1));
  }
  return Math.max(0, ...perDriver.values());
}

/** Whether the party holds an element that counters (detonates) the route's final orb. */
export function canDetonateOrb(route: ComboRoute, characters: Character[]): boolean {
  const counter = ELEMENT_COUNTER[route.stage3];
  return characters.some(
    (character) =>
      !character.disabled &&
      character.slots.some((slot) => !slot.disabled && slot.element === counter),
  );
}

/**
 * Scores a route by how easily it can be executed (not how many routes
 * exist):
 * - repeating the same element (e.g. fire-fire-fire) is tedious   -> penalty
 * - more element variety is easier                                 -> bonus
 * - energy: the ideal split (max demand 3 arts) is free; every extra
 *   art demanded from the busiest driver makes it harder           -> penalty
 * - if the party holds the counter element of the final stage, the
 *   orb can be detonated for a full burst                          -> bonus
 */
export function scoreRoute(
  route: ComboRoute,
  characters: Character[],
  assignment: RouteAssignment | null,
): number {
  const elements = [route.stage1, route.stage2, route.stage3];
  let score = 0;

  // Consecutive same-element stages require recharging the same blade.
  for (let i = 1; i < elements.length; i += 1) {
    if (elements[i] === elements[i - 1]) score -= 2;
  }

  // Variety makes the route easier to execute.
  score += new Set(elements).size - 1;

  // Energy cost: ideal split has max demand 3 arts (one stage per driver);
  // every extra art demanded from the busiest driver makes it harder.
  score -= Math.max(0, maxEnergyDemand(assignment) - 3) * 1.5;

  // Final-stage orb can be detonated when the party holds the counter element.
  const canDetonate = canDetonateOrb(route, characters);
  if (canDetonate) score += 2;

  return score;
}

/**
 * Marks the best-scoring leaf of each root subtree as recommended.
 * Leaves are the only nodes that carry a full route + assignment.
 */
function markRecommended(root: ComboTreeNode, characters: Character[]): void {
  /** Returns the best-scoring leaf under `node`, or null when none exists. */
  const findBestLeaf = (node: ComboTreeNode): ComboTreeNode | null => {
    if (node.children.length === 0) {
      return node.route && node.assignment ? node : null;
    }
    let best: ComboTreeNode | null = null;
    let bestScore = -Infinity;
    for (const child of node.children) {
      const candidate = findBestLeaf(child);
      if (candidate && candidate.route && candidate.assignment) {
        const score = scoreRoute(candidate.route, characters, candidate.assignment);
        if (score > bestScore) {
          bestScore = score;
          best = candidate;
        }
      }
    }
    return best;
  };

  const best = findBestLeaf(root);
  if (best) best.recommended = true;
}

/** Groups routes into a 3-level tree keyed by the stage elements. */
export function buildComboTree(entries: RouteEntry[], characters: Character[]): ComboTreeNode[] {
  const roots: ComboTreeNode[] = [];

  const findOrCreate = (
    list: ComboTreeNode[],
    element: ElementId,
    stage: 1 | 2 | 3,
    path: ElementId[],
  ): ComboTreeNode => {
    let node = list.find((candidate) => candidate.element === element);
    if (!node) {
      node = { element, stage, path, children: [], routeCount: 0 };
      list.push(node);
    }
    return node;
  };

  for (const { route, assignment } of entries) {
    const stage1 = findOrCreate(roots, route.stage1, 1, [route.stage1]);
    const stage2 = findOrCreate(stage1.children, route.stage2, 2, [...stage1.path, route.stage2]);
    const stage3 = findOrCreate(stage2.children, route.stage3, 3, [...stage2.path, route.stage3]);
    stage3.route = route;
    stage3.assignment = assignment;
    stage1.routeCount += 1;
    stage2.routeCount += 1;
    stage3.routeCount += 1;
  }

  // Mark the best route of each starting-element tree as recommended.
  for (const root of roots) markRecommended(root, characters);

  return roots;
}
