import { describe, expect, it } from 'vitest';
import { createState, defaultBalance as b, fastTick } from '../src/sim';
import { migrate } from '../src/save/migrate';
import {
  exportString,
  importString,
  loadGame,
  PRESTIGE_KEY,
  saveGame,
  SLOT_KEYS,
  type KeyValueStore,
} from '../src/save/save';

function memoryStore(): KeyValueStore & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return { data, getItem: (k) => data.get(k) ?? null, setItem: (k, v) => void data.set(k, v) };
}

describe('Speichern und Laden (Kap. 11)', () => {
  it('Roundtrip über localStorage-Ersatz', () => {
    const store = memoryStore();
    const s = createState(b, 5);
    for (let i = 0; i < 500; i++) fastTick(s, b);
    saveGame(store, s, 1000, b);
    const loaded = loadGame(store, b)!;
    expect(loaded.timestamp).toBe(1000);
    expect(loaded.state).toEqual(s);
  });

  it('schreibt abwechselnd in zwei Slots und lädt den neuesten', () => {
    const store = memoryStore();
    const s = createState(b, 5);
    saveGame(store, s, 1, b);
    s.cars = 42;
    saveGame(store, s, 2, b);
    expect(store.data.has(SLOT_KEYS[0])).toBe(true);
    expect(store.data.has(SLOT_KEYS[1])).toBe(true);
    expect(loadGame(store, b)!.state.cars).toBe(42);
  });

  it('ein korrupter Slot fällt auf den anderen zurück', () => {
    const store = memoryStore();
    const s = createState(b, 5);
    s.cars = 7;
    saveGame(store, s, 1, b);
    s.cars = 8;
    saveGame(store, s, 2, b);
    const newest = [...store.data.entries()].find(([k, v]) => SLOT_KEYS.includes(k as never) && v.includes('"timestamp":2'))![0];
    store.setItem(newest, '{kaputt');
    expect(loadGame(store, b)!.state.cars).toBe(7);
  });

  it('Prestige wird separat gespeichert und gewinnt beim Laden', () => {
    const store = memoryStore();
    const s = createState(b, 5, { market: 2, ideas: 1 });
    saveGame(store, s, 1, b);
    expect(JSON.parse(store.data.get(PRESTIGE_KEY)!)).toEqual({ market: 2, ideas: 1 });
    store.setItem(PRESTIGE_KEY, JSON.stringify({ market: 3, ideas: 1 }));
    expect(loadGame(store, b)!.state.prestige.market).toBe(3);
  });

  it('Export/Import als Base64, auch mit Umlauten', () => {
    const s = createState(b, 9);
    s.messages.push({ tick: 1, text: 'Größte Übernahme' });
    const loaded = importString(exportString(s, 123), b)!;
    expect(loaded.state).toEqual(s);
    expect(importString('kein base64!', b)).toBeNull();
  });

  it('Migration ergänzt fehlende Felder und ersetzt null', () => {
    const s = createState(b, 3) as unknown as Record<string, unknown>;
    delete s.conflict;
    (s.space as Record<string, unknown>).integrity = null;
    delete s.version;
    const m = migrate(s, b);
    expect(m.conflict.draws).toBe(0);
    expect(m.space.integrity).toBe(0);
    expect(m.version).toBe(1);
  });
});
