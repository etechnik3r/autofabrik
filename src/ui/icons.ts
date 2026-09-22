import type { Group } from '../sim/projects/types';

/**
 * Thematisch passende Symbole je Projekt (reine Eye-Candy, keine Spiellogik).
 * Unicode-Emoji statt Bilddateien, damit nichts nachgeladen werden muss.
 * Nicht gelistete Projekte fallen auf GROUP_ICON, danach auf ⚙️ zurück.
 */
export const PROJECT_ICONS: Record<string, string> = {
  // Produktion
  P01: '🦾', P02: '🦾', P03: '🦾', P16: '🦾',
  P04: '🚚',
  P07: '🪚', P08: '🔦', P09: '🧱', P10: '🏗️', P10b: '🚙',
  P22: '🏭', P23: '⏱️', P24: '⏱️', P25: '⏱️',
  P26: '🔁', P42: '📊',
  // Marke, Ideen, Reputation
  P05: '💡', P06: '📣', P13: '🏆', P14: '🏆', P15: '🥇', P17: '📜', P19: '🤝',
  P11: '📣', P12: '🎵', P34: '🧲',
  P27: '⚖️', P28: '🚦', P29: '🚧', P30: '🍃', P31: '🅿️',
  P40: '🎗️', P40b: '🤵',
  // Systeme
  P20: '♟️', P60: '♟️', P61: '♟️', P62: '♟️', P63: '♟️', P64: '♟️', P65: '♟️', P66: '♟️',
  P118: '🔄', P119: '🧠',
  P21: '💹', P37: '🤝', P38: '👑',
  P50: '⚛️', P51: '⚛️', P70: '🚘', P35: '🔓',
  // Konzern
  P18: '🗺️', P127: '⚡', P41: '⛏️', P43: '🚛', P44: '🔥', P45: '🏭',
  P100: '🚀', P101: '🌙', P102: '🔗', P110: '🚦', P111: '🚚', P112: '🐝',
  P126: '📡', P125: '🔋', P46: '🛰️',
  // Expansion
  P130: '📡', P129: '🛡️', P131: '🛡️', P120: '⏱️', P121: '🧬', P134: '🏅',
  P132: '💾', P133: '🕯️', P128: '♟️', P135: '♻️',
  // Ende
  P140: '📨', P141: '📨', P142: '📨', P143: '📨', P144: '📨', P145: '📨', P146: '📨',
  P147: '🤝', P148: '✋', P200: '🏭', P201: '🧠',
  P210: '🔧', P211: '🔧', P212: '🔧', P213: '🔧', P214: '🔧', P215: '🔧', P216: '🔧',
};

export const GROUP_ICON: Record<Group, string> = {
  produktion: '🔧',
  marke: '📣',
  systeme: '🧠',
  konzern: '🏭',
  expansion: '🚀',
  ende: '📡',
};

export function projectIcon(id: string, group: Group): string {
  return PROJECT_ICONS[id] ?? GROUP_ICON[group] ?? '⚙️';
}

/** Symbol vor dem Panel-Titel im Kopf jeder Karte. */
export const PANEL_ICONS: Record<string, string> = {
  assembly: '🔧',
  sales: '💶',
  purchasing: '📦',
  plants: '🏗️',
  corporation: '🏭',
  power: '⚡',
  compute: '💻',
  fleet: '📡',
  quantum: '⚛️',
  projects: '🧭',
  treasury: '💹',
  strategy: '♟️',
  expansion: '🚀',
  shipDesign: '🛰️',
  conflict: '⚔️',
};
