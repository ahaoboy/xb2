import type { TFunction } from "i18next";
import { COMBO_ATTACKS, pickLocalized } from "../../data/comboAttacks";
import type { ComboAttack } from "../../data/comboAttacks";

/** Returns the localized attack name for the current UI language. */
export function getAttackName(attack: ComboAttack | undefined, lang: string): string {
  return attack ? pickLocalized(attack.name, lang) : "";
}

/** Formats an attack's damage stats into tooltip lines. */
export function getAttackStatLines(
  attack: ComboAttack | undefined,
  t: TFunction,
  lang: string,
): string[] {
  if (!attack) return [];
  const lines = [pickLocalized(attack.name, lang)];
  lines.push(`${t("routes.direct")}: ${attack.direct}%`);
  if (attack.dot) lines.push(`${t("routes.dot")}: ${attack.dot}%`);
  if (attack.range) lines.push(`${t("routes.range")}: ${attack.range}`);
  if (attack.reaction) lines.push(pickLocalized(attack.reaction, lang));
  return lines;
}

/** Looks up the attack data for a tree node by its element path. */
export function getAttackForPath(path: string[]): ComboAttack | undefined {
  return COMBO_ATTACKS[path.join("-")];
}
