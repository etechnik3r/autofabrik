import type { Balance } from '../sim/balance';
import type { GameState, Prestige } from '../sim/state';
import { migrate } from './migrate';

/** Minimale Schnittstelle von localStorage, damit Tests einen Ersatz übergeben können. */
export interface KeyValueStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export const SLOT_KEYS = ['autofabrik.slotA', 'autofabrik.slotB'] as const;
export const PRESTIGE_KEY = 'autofabrik.prestige';

export interface SaveFile {
  version: number;
  timestamp: number;
  state: GameState;
}

export interface Loaded {
  state: GameState;
  timestamp: number;
}

export function serialize(state: GameState, timestamp: number): string {
  const file: SaveFile = { version: state.version, timestamp, state };
  return JSON.stringify(file);
}

export function deserialize(text: string, b: Balance): Loaded | null {
  try {
    const file = JSON.parse(text) as Partial<SaveFile>;
    if (!file || typeof file !== 'object' || !file.state || typeof file.timestamp !== 'number') return null;
    return { state: migrate(file.state as unknown as Record<string, unknown>, b), timestamp: file.timestamp };
  } catch {
    return null;
  }
}

function readSlot(store: KeyValueStore, key: string, b: Balance): Loaded | null {
  const text = store.getItem(key);
  return text ? deserialize(text, b) : null;
}

/** Schreibt in den älteren Slot. Ein abgebrochener Schreibvorgang lässt den anderen intakt. */
export function saveGame(store: KeyValueStore, state: GameState, now: number, b: Balance): void {
  const [a, c] = SLOT_KEYS.map((k) => readSlot(store, k, b)?.timestamp ?? -1);
  const target = a <= c ? SLOT_KEYS[0] : SLOT_KEYS[1];
  store.setItem(target, serialize(state, now));
  savePrestige(store, state.prestige);
}

/** Lädt den neuesten gültigen Slot. */
export function loadGame(store: KeyValueStore, b: Balance): Loaded | null {
  const slots = SLOT_KEYS.map((k) => readSlot(store, k, b)).filter((x): x is Loaded => x !== null);
  slots.sort((x, y) => y.timestamp - x.timestamp);
  const best = slots[0] ?? null;
  if (best) best.state.prestige = loadPrestige(store) ?? best.state.prestige;
  return best;
}

export function savePrestige(store: KeyValueStore, p: Prestige): void {
  store.setItem(PRESTIGE_KEY, JSON.stringify(p));
}

export function loadPrestige(store: KeyValueStore): Prestige | null {
  try {
    const p = JSON.parse(store.getItem(PRESTIGE_KEY) ?? 'null');
    if (p && typeof p.market === 'number' && typeof p.ideas === 'number') return { market: p.market, ideas: p.ideas };
  } catch {
    /* ungültig → ignorieren */
  }
  return null;
}

/** Export als Base64 (UTF-8-sicher). */
export function exportString(state: GameState, now: number): string {
  const bytes = new TextEncoder().encode(serialize(state, now));
  let bin = '';
  for (const x of bytes) bin += String.fromCharCode(x);
  return btoa(bin);
}

export function importString(text: string, b: Balance): Loaded | null {
  try {
    const bin = atob(text.trim());
    const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
    return deserialize(new TextDecoder().decode(bytes), b);
  } catch {
    return null;
  }
}
