import type { ElementId } from "../types";

/**
 * Resolves a public asset URL relative to the app's base path, so icons work
 * both locally (`/`) and when deployed to a sub-path (GitHub Pages).
 */
const asset = (name: string): string => `${import.meta.env.BASE_URL}${name}`;

export interface ElementMeta {
  /** Brand color used for chips/dots. */
  color: string;
  /** Foreground color that stays readable on top of `color`. */
  textColor: string;
  /** Path to the element icon asset under /public. */
  icon: string;
}

/** Visual metadata for each of the 8 elements. */
export const ELEMENT_META: Record<ElementId, ElementMeta> = {
  fire: { color: "#ef5350", textColor: "#ffffff", icon: asset("火.png") },
  water: { color: "#42a5f5", textColor: "#ffffff", icon: asset("水.png") },
  earth: { color: "#8d6e63", textColor: "#ffffff", icon: asset("地.png") },
  electric: { color: "#fdd835", textColor: "#4e342e", icon: asset("雷.png") },
  wind: { color: "#66bb6a", textColor: "#ffffff", icon: asset("风.png") },
  ice: { color: "#4dd0e1", textColor: "#004d40", icon: asset("冰.png") },
  light: { color: "#ffe082", textColor: "#4e342e", icon: asset("光.png") },
  dark: { color: "#9575cd", textColor: "#ffffff", icon: asset("暗.png") },
};
