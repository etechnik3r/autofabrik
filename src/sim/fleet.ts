import type { Balance } from './balance';
import { log } from './messages';
import type { FleetStatus, GameState } from './state';

/** Flottenrechner (6.4). Läuft ab Phase 2 jeden Fast-Tick. */
export function updateFleetCompute(s: GameState, b: Balance): void {
  const f = s.fleet;
  const i = s.industry;
  const p = b.phase2;
  const d = i.trucks + i.smelters;

  if (i.ore <= 0 && d >= 1) f.boredom++;
  else if (i.ore > 0 && f.boredom > 0) f.boredom--;

  const ratio = Math.max(i.trucks + 1, i.smelters + 1) / Math.min(i.trucks + 1, i.smelters + 1);
  if (ratio > p.disorderRatio) f.disorder += Math.min(ratio / 10_000, 0.01);
  else if (f.disorder > 1) f.disorder -= 0.01;

  const prev = f.status;
  f.status = fleetStatus(s, b, d);
  if (prev !== f.status && s.flags.fleet && (f.status === 'LEERLAUF' || f.status === 'DESYNC')) {
    log(s, `Flottenrechner meldet: ${f.status}.`);
  }

  if (f.status === 'AKTIV') {
    f.giftBits += Math.log(d) * (f.slider / 100);
    if (f.giftBits >= p.giftPeriod) {
      const g = Math.max(1, Math.round(Math.log10(d) * (f.slider / 100)));
      f.gifts += g;
      f.totalGifts += g;
      f.giftBits = 0;
    }
  }
}

function fleetStatus(s: GameState, b: Balance, d: number): FleetStatus {
  if (!s.flags.fleet) return 'SCHLAFEND';
  if (s.phase === 3 && !s.flags.fleetReboot) return 'KEINE ANTWORT';
  if (s.power.powMod <= 0) return 'SCHLAFEND';
  if (d < 2) return 'ALLEIN';
  if (s.fleet.boredom >= b.phase2.boredomTicks) return 'LEERLAUF';
  if (s.fleet.disorder >= b.phase2.disorderLimit) return 'DESYNC';
  return 'AKTIV';
}

export function canEntertain(s: GameState): boolean {
  return s.fleet.status === 'LEERLAUF' && s.ideas >= s.fleet.entertainCost;
}

export function entertain(s: GameState, b: Balance): boolean {
  if (!canEntertain(s)) return false;
  s.ideas -= s.fleet.entertainCost;
  s.fleet.entertainCost += b.phase2.entertainStep;
  s.fleet.boredom = 0;
  return true;
}

export function canResync(s: GameState, b: Balance): boolean {
  return s.fleet.status === 'DESYNC' && s.insight >= b.phase2.resyncCost;
}

export function resync(s: GameState, b: Balance): boolean {
  if (!canResync(s, b)) return false;
  s.insight -= b.phase2.resyncCost;
  s.fleet.disorder = 0;
  return true;
}
