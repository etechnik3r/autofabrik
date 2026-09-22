/** Seedbarer PRNG (mulberry32). Der Zustand liegt im Spielstand, damit Läufe reproduzierbar sind. */
export interface RngHolder {
  rng: number;
}

/** Gleichverteilte Zufallszahl U in [0,1). */
export function rand(h: RngHolder): number {
  let t = (h.rng = (h.rng + 0x6d2b79f5) | 0);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

export function randomSeed(): number {
  return (Math.random() * 0x100000000) >>> 0;
}
