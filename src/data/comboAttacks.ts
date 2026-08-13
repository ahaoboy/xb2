/**
 * Named fusion-combo attacks with their damage stats.
 *
 * Each entry is keyed by its element path:
 *   - stage 1: `fire`
 *   - stage 2: `fire-water`
 *   - stage 3: `fire-fire-fire` (matches `ComboRoute.id`)
 *
 * References:
 * - https://www.neoseeker.com/xenoblade-chronicles-2/faqs/3006960-chain-combo.html
 * - https://xenoblade2.cn
 */

/** Game data text that ships in both supported UI languages. */
export interface LocalizedText {
  zh: string;
  en: string;
}

/** A named combo attack with its damage stats. */
export interface ComboAttack {
  name: LocalizedText;
  /** Direct damage multiplier (%). */
  direct: number;
  /** Damage over time multiplier (%) — stage 1 & 2 attacks only. */
  dot?: number;
  /** Area-of-effect range. */
  range?: number;
  /** Reaction action applied (e.g. Blowdown Lv.5). */
  reaction?: LocalizedText;
}

/** Picks the localized text for the current UI language. */
export function pickLocalized(text: LocalizedText, lang: string): string {
  return lang.startsWith("zh") ? text.zh : text.en;
}

export const COMBO_ATTACKS: Record<string, ComboAttack> = {
  // ---- Stage 1 ----
  fire: { name: { zh: "灼热气息", en: "Scorching Breath" }, direct: 38, dot: 6 },
  water: { name: { zh: "有毒液体", en: "Toxic Liquid" }, direct: 38, dot: 6 },
  earth: { name: { zh: "落石撞击", en: "Rockfall" }, direct: 150 },
  electric: { name: { zh: "电击火花", en: "Electric Spark" }, direct: 38, dot: 6 },
  wind: { name: { zh: "破坏旋风", en: "Destructive Cyclone" }, direct: 150 },
  ice: { name: { zh: "万丈寒冰", en: "Blizzard" }, direct: 38, dot: 6 },
  light: { name: { zh: "光子辐射", en: "Photon Radiation" }, direct: 38, dot: 6 },
  dark: { name: { zh: "重力压迫", en: "Gravity Crush" }, direct: 38, dot: 6 },

  // ---- Stage 2 ----
  "fire-fire": { name: { zh: "焚烧殆尽", en: "Burn to Ashes" }, direct: 50, dot: 8 },
  "fire-water": { name: { zh: "蒸汽炸弹", en: "Steam Bomb" }, direct: 51, dot: 8, range: 3 },
  "earth-fire": { name: { zh: "炽热岩浆", en: "Blazing Magma" }, direct: 63, dot: 10 },
  "electric-fire": { name: { zh: "火焰雷击", en: "Flame Lightning" }, direct: 225 },
  "water-water": { name: { zh: "剧毒水花", en: "Toxic Splash" }, direct: 50, dot: 8 },
  "water-earth": { name: { zh: "流行疾病", en: "Epidemic" }, direct: 51, dot: 8, range: 3 },
  "earth-earth": { name: { zh: "地壳崩裂", en: "Crustal Rupture" }, direct: 180, range: 3 },
  "electric-electric": { name: { zh: "百万伏特", en: "Mega Volt" }, direct: 200 },
  "wind-wind": {
    name: { zh: "大地龙卷", en: "Land Tornado" },
    direct: 170,
    range: 3,
    reaction: { zh: "击退LV5", en: "Knockback Lv.5" },
  },
  "wind-ice": { name: { zh: "冰刃风暴", en: "Ice Blade Storm" }, direct: 225 },
  "ice-water": { name: { zh: "冰雹暴击", en: "Hail Strike" }, direct: 203, range: 3 },
  "ice-ice": { name: { zh: "冰霜冻结", en: "Frost Freeze" }, direct: 50, dot: 8 },
  "light-electric": { name: { zh: "雷霆爆裂", en: "Thunderbolt Burst" }, direct: 225 },
  "light-light": { name: { zh: "伽马射线", en: "Gamma Ray" }, direct: 180, range: 3 },
  "dark-dark": { name: { zh: "黝黑深渊", en: "Dark Abyss" }, direct: 180, range: 3 },
  "dark-light": { name: { zh: "镭射光线", en: "Laser Beam" }, direct: 225 },

  // ---- Stage 3 ----
  "fire-fire-fire": { name: { zh: "超级爆破", en: "Super Detonation" }, direct: 250 },
  "fire-fire-light": {
    name: { zh: "原子核爆", en: "Atomic Explosion" },
    direct: 261,
    range: 5,
    reaction: { zh: "吹飞LV2", en: "Blowdown Lv.2" },
  },
  "fire-water-fire": {
    name: { zh: "蒸汽爆发", en: "Steam Burst" },
    direct: 234,
    range: 5,
    reaction: { zh: "吹飞LV5", en: "Blowdown Lv.5" },
  },
  "fire-water-ice": { name: { zh: "钻石冰尘", en: "Diamond Dust" }, direct: 275 },
  "water-water-water": { name: { zh: "毒沼迷雾", en: "Toxic Mist" }, direct: 225, range: 5 },
  "water-water-dark": { name: { zh: "暗黑洪流", en: "Dark Torrent" }, direct: 275 },
  "water-earth-wind": { name: { zh: "终极灾厄", en: "Ultimate Calamity" }, direct: 270, range: 5 },
  "earth-fire-wind": {
    name: { zh: "熔岩暴风", en: "Lava Storm" },
    direct: 255,
    range: 5,
    reaction: { zh: "吹飞LV2", en: "Blowdown Lv.2" },
  },
  "earth-fire-earth": { name: { zh: "火山爆发", en: "Volcanic Eruption" }, direct: 270, range: 5 },
  "earth-earth-electric": { name: { zh: "岩浆电流", en: "Magma Current" }, direct: 248, range: 5 },
  "electric-fire-wind": {
    name: { zh: "雷炎大旋风", en: "Lightning Flame Cyclone" },
    direct: 255,
    range: 5,
    reaction: { zh: "吹飞LV5", en: "Blowdown Lv.5" },
  },
  "electric-fire-ice": { name: { zh: "极寒极光", en: "Aurora" }, direct: 300 },
  "electric-electric-water": {
    name: { zh: "超电气分解", en: "Super Electrolysis" },
    direct: 248,
    range: 5,
  },
  "wind-wind-earth": {
    name: { zh: "沙尘风暴", en: "Sandstorm" },
    direct: 234,
    range: 5,
    reaction: { zh: "击退LV4", en: "Knockback Lv.4" },
  },
  "wind-wind-electric": {
    name: { zh: "雷暴飓风", en: "Thunderstorm Hurricane" },
    direct: 234,
    range: 5,
    reaction: { zh: "吹飞LV3", en: "Blowdown Lv.3" },
  },
  "wind-ice-ice": { name: { zh: "寒霜台风", en: "Frost Typhoon" }, direct: 270, range: 5 },
  "ice-water-wind": {
    name: { zh: "冬日毁灭", en: "Winter Ruin" },
    direct: 255,
    range: 5,
    reaction: { zh: "击退LV1", en: "Knockback Lv.1" },
  },
  "ice-ice-earth": {
    name: { zh: "永久冻土冲击", en: "Permafrost Impact" },
    direct: 261,
    reaction: { zh: "吹飞LV2", en: "Blowdown Lv.2" },
  },
  "ice-ice-dark": { name: { zh: "重力暴风雪", en: "Gravity Blizzard" }, direct: 275 },
  "light-electric-fire": {
    name: { zh: "人造太阳", en: "Artificial Sun" },
    direct: 255,
    range: 5,
    reaction: { zh: "吹飞LV2", en: "Blowdown Lv.2" },
  },
  "light-light-water": { name: { zh: "最终豪雨", en: "Final Downpour" }, direct: 248, range: 5 },
  "light-light-light": { name: { zh: "超新星", en: "Supernova" }, direct: 250 },
  "dark-light-electric": {
    name: { zh: "晴空霹雳", en: "Clear Sky Thunderbolt" },
    direct: 270,
    range: 5,
  },
  "dark-dark-earth": {
    name: { zh: "陨石冲撞", en: "Meteor Impact" },
    direct: 234,
    range: 5,
    reaction: { zh: "吹飞LV4", en: "Blowdown Lv.4" },
  },
  "dark-dark-dark": { name: { zh: "黑色监狱", en: "Black Prison" }, direct: 250 },
};
