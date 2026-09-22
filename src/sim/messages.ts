import type { Balance } from './balance';
import type { GameState } from './state';

const MAX_MESSAGES = 50;

export function log(s: GameState, text: string): void {
  s.messages.push({ tick: s.tick, text });
  if (s.messages.length > MAX_MESSAGES) s.messages.splice(0, s.messages.length - MAX_MESSAGES);
}

/** Meilenstein-Schwellen (Kap. 10): 500, 1 000, 10⁴, 10⁵, 10⁶, danach jede Zehnerpotenz ab 10¹². */
export function milestoneValue(i: number): number {
  const first = [500, 1_000, 10_000, 100_000, 1_000_000];
  return i < first.length ? first[i] : Math.pow(10, 12 + (i - first.length));
}

/** Meilensteine und Freischaltungen, die nicht an Projekten hängen. */
export function checkMilestones(s: GameState, b: Balance): void {
  while (s.cars >= milestoneValue(s.nextMilestone)) {
    log(s, `${formatCount(milestoneValue(s.nextMilestone))} Autos gebaut.`);
    s.nextMilestone++;
  }
  if (!s.flags.robots && s.money >= b.phase1.unlockRobotsAtMoney) {
    s.flags.robots = true;
    log(s, 'Montageroboter sind jetzt verfügbar.');
  }
  if (!s.flags.compute && (s.cars >= b.phase1.unlockComputeAtCars || isBroke(s))) {
    s.flags.compute = true;
    log(s, 'Rechenzentrum online. Projekte können erforscht werden.');
  }
}

export function isBroke(s: GameState): boolean {
  return s.phase === 1 && s.stock < 1 && s.money < s.partsCost && s.parts < 1;
}

/** Kurze Zahl für Meldungstexte (unabhängig von der UI-Formatierung). */
function formatCount(n: number): string {
  if (n < 1e6) return n.toLocaleString('de-DE');
  const exp = Math.round(Math.log10(n));
  return `10^${exp}`;
}
