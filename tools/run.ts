import { createState, fastTick, type Balance, type GameState } from '../src/sim';
import type { Bot } from './bots/types';

export interface Event {
  name: string;
  seconds: number;
}

export interface RunOptions {
  seed: number;
  maxSeconds: number;
  bot: Bot;
  balance: Balance;
  /** Wird jede Spielsekunde geprüft; true beendet den Lauf. */
  stop?: (s: GameState) => boolean;
  /** Ereignisse, die einmalig protokolliert werden (Name → Bedingung). */
  events?: Record<string, (s: GameState) => boolean>;
  /** Invarianten nach jeder Sekunde prüfen. */
  checkInvariants?: boolean;
}

export interface RunResult {
  state: GameState;
  events: Event[];
  seconds: number;
}

/** Headless-Lauf: Simulation + Bot, ohne DOM. */
export function run(o: RunOptions): RunResult {
  const s = createState(o.balance, o.seed);
  const tps = 1000 / o.balance.tick.fastMs;
  const pending = new Map(Object.entries(o.events ?? {}));
  const events: Event[] = [];
  const maxTicks = o.maxSeconds * tps;
  while (s.tick < maxTicks) {
    o.bot.act(s, o.balance);
    fastTick(s, o.balance);
    if (s.tick % tps === 0) {
      for (const [name, cond] of pending) {
        if (cond(s)) {
          events.push({ name, seconds: s.tick / tps });
          pending.delete(name);
        }
      }
      if (o.checkInvariants) assertSane(s);
      if (o.stop?.(s)) break;
    }
  }
  return { state: s, events, seconds: s.tick / tps };
}

/** Numerik-Invarianten (12.2): keine NaN/Infinity, keine negativen Bestände. */
export function assertSane(s: GameState, path = 'state'): void {
  walk(s, path);
}

const MAY_BE_NEGATIVE = new Set(['last', 'profit', 'delta']);

function walk(v: unknown, path: string): void {
  if (typeof v === 'number') {
    if (!Number.isFinite(v)) throw new Error(`${path} ist nicht endlich: ${v}`);
    const key = path.slice(path.lastIndexOf('.') + 1);
    if (v < -1e-6 && !MAY_BE_NEGATIVE.has(key) && !path.includes('.last.') && key !== 'rng' && key !== 'seed')
      throw new Error(`${path} ist negativ: ${v}`);
  } else if (Array.isArray(v)) {
    v.forEach((x, i) => walk(x, `${path}[${i}]`));
  } else if (v && typeof v === 'object') {
    for (const [k, x] of Object.entries(v)) walk(x, `${path}.${k}`);
  }
}
