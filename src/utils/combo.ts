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

/** Union of all non-empty, non-disabled elements configured across the party. */
export function getAvailableElements(characters: Character[]): Set<ElementId> {
  const available = new Set<ElementId>();
  for (const character of characters) {
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
      .filter((character) =>
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
 * Scores a route using XC2 combat mechanics:
 * - repeating the same element (e.g. fire-fire-fire) is hard because the
 *   driver must charge up the same blade repeatedly  -> penalty
 * - more element variety is easier                     -> bonus
 * - distinct drivers per stage avoid switch cooldowns -> bonus
 * - if the party holds the counter element of the final stage, the orb can
 *   be detonated for a full burst                      -> bonus
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

  // Assigning each stage to a different driver avoids switch cooldowns.
  if (assignment?.optimal) score += 2;

  // Final-stage orb can be detonated when the party holds the counter element.
  const counter = ELEMENT_COUNTER[route.stage3];
  const canDetonate = characters.some((character) =>
    character.slots.some((slot) => !slot.disabled && slot.element === counter),
  );
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
