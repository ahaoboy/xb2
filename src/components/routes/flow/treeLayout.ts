import type { TFunction } from "i18next";
import type { Edge, Node } from "@xyflow/react";
import { COMBO_ATTACKS, pickLocalized } from "../../../data/comboAttacks";
import type { ComboTreeNode } from "../../../utils/combo";
import { getAttackStatLines } from "../attackTooltip";
import { PILL_NODE_TYPE, type PillData } from "./TreePillNode";

export interface LayoutOptions {
  t: TFunction;
  lang: string;
  /** CJK labels are wider, so use a wider per-character estimate. */
  zh: boolean;
  /** Viewport scale for large screens (all layout units scale with it). */
  scale: number;
  /** Mirrored tree: start element on the right, branches grow leftwards. */
  mirrored?: boolean;
  /** Prefix for node/edge ids so multiple trees can share one canvas. */
  idPrefix?: string;
  /** Character id → display name, used in assignment tooltip lines. */
  names?: Map<string, string>;
  /** Show optimal (✓) / recommended (⭐) markers on leaf nodes. Planner only. */
  showMarkers?: boolean;
  /**
   * Font-loading version. Widths are measured with a canvas before web fonts
   * finish loading; passing a changing version (e.g. from useFontsReady)
   * forces the measurement context to be rebuilt with the final fonts.
   */
  fontVersion?: number;
}

export interface TreeLayout {
  nodes: Node[];
  edges: Edge[];
  width: number;
  height: number;
}

/** Horizontal distance between stage columns (pill gaps = H_GAP − pill width). */
const H_GAP = 175;
/** Vertical distance between leaf rows. */
const LEAF_GAP = 46;
/** Pill height. */
const NODE_H = 36;
/** Canvas padding. */
const PAD = 24;

/** Font stack used by the pill labels (matches ElementNode's Typography). */
const LABEL_FONT =
  '700 14px Roboto, "Segoe UI", "Helvetica Neue", Arial, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif';

let measureCanvas: HTMLCanvasElement | null = null;
let measureCtx: CanvasRenderingContext2D | null = null;
/** Last font version the measurement context was built for. */
let measuredFontVersion = -1;

/**
 * Rebuilds the measurement context when the font version changes, so widths
 * are measured with the final (loaded) fonts rather than fallbacks.
 */
function syncMeasureFont(version: number): void {
  if (version === measuredFontVersion) return;
  measuredFontVersion = version;
  measureCanvas = null;
  measureCtx = null;
}

/**
 * Measures a label's rendered width with the same font as the pill nodes,
 * falling back to a rough estimate when canvas measurement is unavailable.
 * `px` is the font size in screen pixels; the result is returned in layout
 * units (which scale linearly with the font, so dividing by `scale` gives
 * the pre-zoom layout width).
 */
function measureLabelWidth(label: string, px: number, fallback: number): number {
  if (typeof document === "undefined") return fallback;
  if (!measureCanvas) {
    measureCanvas = document.createElement("canvas");
    measureCtx = measureCanvas.getContext("2d");
  }
  if (!measureCtx) return fallback;
  measureCtx.font = LABEL_FONT.replace("14px", `${px}px`);
  return measureCtx.measureText(label).width;
}

/**
 * Estimates an element pill's width: icon (18) + gap (4) + padding (20) +
 * the measured element name. Pills only ever show the element name; attack
 * info lives in the separate plain skill node.
 */
function estimateWidth(node: ComboTreeNode, opts: LayoutOptions): number {
  const s = (value: number): number => value * opts.scale;
  const label = opts.t(`elements.${node.element}`);
  const textW = measureLabelWidth(label, 14 * opts.scale, label.length * 7) / opts.scale;
  return Math.min(s(340), Math.max(s(80), Math.ceil(textW * 1.08) + 48));
}

/**
 * Estimates the plain skill node width: "Skill Name · 123%" text + padding,
 * plus room for the ✔ marker on optimal routes.
 */
function estimateSkillWidth(node: ComboTreeNode, opts: LayoutOptions): number {
  const s = (value: number): number => value * opts.scale;
  const label = skillLabel(node, opts);
  const textW = measureLabelWidth(label, 13 * opts.scale, label.length * 7) / opts.scale;
  const check = opts.showMarkers !== false && node.assignment?.optimal ? 20 : 0;
  return Math.max(s(60), Math.ceil(textW * 1.08) + 24 + check);
}

/** "Skill Name · 123%" for the plain 4th-stage node (reversed when mirrored). */
function skillLabel(node: ComboTreeNode, opts: LayoutOptions): string {
  const attack = node.route ? COMBO_ATTACKS[node.route.id] : undefined;
  if (!attack) return "";
  const name = pickLocalized(attack.name, opts.lang);
  return opts.mirrored ? `${attack.direct}% · ${name}` : `${name} · ${attack.direct}%`;
}

/**
 * Lays out one route tree: the start element at x = 0 growing rightwards.
 * With `mirrored`, every x is flipped so the start sits at the far right and
 * the tree grows leftwards; the returned width/height cover either case.
 */
export function layoutTree(root: ComboTreeNode, opts: LayoutOptions): TreeLayout {
  const s = (value: number): number => value * opts.scale;
  syncMeasureFont(opts.fontVersion ?? 0);
  const prefix = opts.idPrefix ?? "";
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  let cursorY = s(PAD);

  const widths = new Map<ComboTreeNode, number>();
  const collectWidths = (node: ComboTreeNode): void => {
    widths.set(node, estimateWidth(node, opts));
    node.children.forEach(collectWidths);
  };
  collectWidths(root);

  const visit = (node: ComboTreeNode, depth: number): { y: number; id: string } => {
    const id = `${prefix}${node.path.join("-")}`;
    const w = widths.get(node)!;
    if (node.children.length === 0) {
      const y = cursorY;
      cursorY += s(LEAF_GAP);
      // Stage-3 element pill (element name only)…
      nodes.push(makePillNode(node, depth, y, w, opts));
      // …followed by a plain 4th-stage node with the attack name + damage.
      const skillId = `${id}__skill`;
      nodes.push(makeSkillNode(node, depth + 1, y, opts));
      edges.push({ id: `${id}->${skillId}`, source: id, target: skillId });
      return { y, id };
    }
    const children = node.children.map((child) => visit(child, depth + 1));
    const y = (children[0].y + children[children.length - 1].y) / 2;
    nodes.push(makePillNode(node, depth, y, w, opts));
    for (const child of children) {
      edges.push({ id: `${id}->${child.id}`, source: id, target: child.id });
    }
    return { y, id };
  };
  visit(root, 0);

  const width =
    nodes.reduce(
      (max, n) => Math.max(max, n.position.x + (n.data as unknown as PillData).width),
      0,
    ) + s(PAD);
  const height = nodes.reduce((max, n) => Math.max(max, n.position.y + s(NODE_H)), 0) + s(PAD);

  if (opts.mirrored) {
    for (const n of nodes) {
      n.position = {
        x: width - n.position.x - (n.data as unknown as PillData).width,
        y: n.position.y,
      };
    }
  }
  return { nodes, edges, width, height };
}

/** Builds an element pill node: colored capsule with just the element name. */
function makePillNode(
  node: ComboTreeNode,
  depth: number,
  y: number,
  width: number,
  opts: LayoutOptions,
): Node {
  const { t } = opts;
  const s = (value: number): number => value * opts.scale;
  const isLeaf = node.children.length === 0;

  return {
    id: `${opts.idPrefix ?? ""}${node.path.join("-")}`,
    type: PILL_NODE_TYPE,
    position: { x: depth * s(H_GAP), y: y - s(NODE_H) / 2 },
    style: { width, height: s(NODE_H) },
    data: {
      element: node.element,
      width,
      height: s(NODE_H),
      mirrored: opts.mirrored ?? false,
      label: t(`elements.${node.element}`),
      tooltip: isLeaf ? [] : [t("routes.count", { count: node.routeCount })],
      recommended: isLeaf && opts.showMarkers !== false ? node.recommended : undefined,
    } satisfies PillData,
  };
}

/** Builds the plain 4th-stage node: attack name + damage, no background. */
function makeSkillNode(node: ComboTreeNode, depth: number, y: number, opts: LayoutOptions): Node {
  const { t, lang } = opts;
  const s = (value: number): number => value * opts.scale;
  const attack = node.route ? COMBO_ATTACKS[node.route.id] : undefined;
  const label = skillLabel(node, opts);
  const height = s(30);

  const tooltip = [
    ...getAttackStatLines(attack, t, lang),
    ...(node.assignment?.assignments.map(
      (characterId, index) =>
        `${t(`routes.stage${index + 1}`)} · ${opts.names?.get(characterId) ?? characterId}`,
    ) ?? []),
    node.route ? t(`sealEffects.${node.route.seal}`) : "",
    opts.showMarkers !== false && node.assignment?.optimal ? t("routes.recommendedHint") : "",
  ].filter(Boolean);

  return {
    id: `${opts.idPrefix ?? ""}${node.path.join("-")}__skill`,
    type: PILL_NODE_TYPE,
    position: { x: depth * s(H_GAP), y: y - height / 2 },
    style: { width: estimateSkillWidth(node, opts), height },
    data: {
      element: node.element,
      width: estimateSkillWidth(node, opts),
      height,
      mirrored: opts.mirrored ?? false,
      label,
      tooltip,
      variant: "plain",
      optimal: opts.showMarkers !== false ? node.assignment?.optimal : undefined,
    } satisfies PillData,
  };
}
