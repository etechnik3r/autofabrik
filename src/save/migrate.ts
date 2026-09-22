import type { Balance } from '../sim/balance';
import { createState, STATE_VERSION, type GameState } from '../sim/state';

type Raw = Record<string, unknown>;

/**
 * migrations[n] hebt einen Stand von Version n auf n+1.
 * Neue Felder ohne Sonderlogik brauchen keine Migration: fillDefaults ergänzt sie aus createState().
 */
export const migrations: Record<number, (raw: Raw) => Raw> = {};

export function migrate(raw: Raw, b: Balance): GameState {
  let v = typeof raw.version === 'number' ? raw.version : 0;
  if (v > STATE_VERSION) throw new Error(`Spielstand-Version ${v} ist neuer als das Spiel (${STATE_VERSION}).`);
  while (v < STATE_VERSION) {
    const m = migrations[v];
    if (m) raw = m(raw);
    v++;
  }
  raw.version = STATE_VERSION;
  const defaults = createState(b, typeof raw.seed === 'number' ? raw.seed : 1) as unknown as Raw;
  return fillDefaults(defaults, raw) as unknown as GameState;
}

/** Ergänzt fehlende Felder rekursiv aus den Standardwerten. Vorhandene Werte gewinnen. */
function fillDefaults(def: unknown, val: unknown): unknown {
  if (val === undefined || (val === null && def !== null)) return def;
  if (isPlainObject(def) && isPlainObject(val)) {
    const out: Raw = { ...val };
    for (const [k, d] of Object.entries(def)) out[k] = fillDefaults(d, val[k]);
    return out;
  }
  return val;
}

function isPlainObject(x: unknown): x is Raw {
  return !!x && typeof x === 'object' && !Array.isArray(x);
}
