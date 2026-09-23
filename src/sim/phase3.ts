import type { Balance } from './balance';
import { autonomyCost } from './formulas';
import { log } from './messages';
import { ATTRS, type Attr, type GameState } from './state';

export const ATTR_NAMES: Record<Attr, string> = {
  speed: 'Rechenleistung',
  nav: 'Mustererkennung',
  rep: 'Replikation',
  haz: 'Fehlerkorrektur',
  fac: 'Werksbau',
  truck: 'Rover-Bau',
  smelt: 'Zellwerk-Bau',
  def: 'Absicherung',
};

export function attrSum(s: GameState): number {
  return ATTRS.reduce((a, k) => a + s.space.attrs[k], 0);
}

/** Rechenraum-Suche (Kap. 7.2). */
export function explore(s: GameState, b: Balance): void {
  const sp = s.space;
  const x = Math.min(sp.ships * b.phase3.exploreRate * sp.attrs.speed * sp.attrs.nav, b.phase3.universe - sp.found);
  if (!(x > 0)) return;
  sp.found += x;
  s.industry.ore += x;
}

/** Bruchteile < 1 werden gesammelt, bis eine ganze Einheit fällig ist. */
function accumulate(s: GameState, key: 'partialRep' | 'partialHaz', amount: number): number {
  if (amount >= 1) return amount;
  s.space[key] += amount;
  if (s.space[key] >= 1) {
    s.space[key] -= 1;
    return 1;
  }
  return 0;
}

export function hazards(s: GameState, b: Balance): void {
  const sp = s.space;
  if (sp.ships <= 0) return;
  let v = (sp.ships * b.phase3.hazRate) / (3 * Math.pow(sp.attrs.haz, b.phase3.hazExp) + 1);
  if (s.flags.hazardShield) v *= 0.5;
  const k = Math.min(accumulate(s, 'partialHaz', v), sp.ships);
  sp.ships -= k;
  sp.lostHazard += k;
}

export function seedReplicate(s: GameState, b: Balance): void {
  const sp = s.space;
  if (sp.ships <= 0) return;
  const n = sp.ships * b.phase3.repRate * sp.attrs.rep;
  if (s.pool < b.phase3.shipCost) return; // kein Material: Bruchteile nicht ansammeln
  const k = Math.min(accumulate(s, 'partialRep', n), Math.floor(s.pool / b.phase3.shipCost));
  if (k <= 0) return;
  sp.ships += k;
  s.pool -= k * b.phase3.shipCost;
}

export function seedBuild(s: GameState, b: Balance): void {
  const sp = s.space;
  if (sp.ships <= 0) return;
  const p = b.phase3;
  const i = s.industry;
  const gf = Math.min(sp.ships * p.facRate * sp.attrs.fac, s.pool / p.facCost);
  if (gf > 0) {
    i.gigas += gf;
    s.pool -= gf * p.facCost;
  }
  const tr = Math.min(sp.ships * p.truckRate * sp.attrs.truck, s.pool / p.unitCost);
  if (tr > 0) {
    i.trucks += tr;
    s.pool -= tr * p.unitCost;
  }
  const sm = Math.min(sp.ships * p.smeltRate * sp.attrs.smelt, s.pool / p.unitCost);
  if (sm > 0) {
    i.smelters += sm;
    s.pool -= sm * p.unitCost;
  }
}

export function drift(s: GameState, b: Balance): void {
  const sp = s.space;
  if (s.flags.noDrift || sp.ships <= 0 || sp.autonomy <= 0) return;
  const f = Math.min(sp.ships * b.phase3.driftRate * Math.pow(sp.autonomy, b.phase3.driftExp), sp.ships);
  sp.ships -= f;
  sp.forks += f;
  sp.lostDrift += f;
}

// ---- Spieleraktionen ----

/** Mehrfachstart (Ergänzung zur Spec, analog 6.2): verhindert die Sackgasse „Rogue-Instanzen übermächtig, keine Fabrikinstanzen“. */
export const LAUNCH_AMOUNTS = [1, 1e3, 1e6, 1e9];

export function canLaunchShip(s: GameState, b: Balance, amount = 1): boolean {
  return s.phase === 3 && LAUNCH_AMOUNTS.includes(amount) && s.pool >= amount * b.phase3.shipCost;
}

export function launchShip(s: GameState, b: Balance, amount = 1): boolean {
  if (!canLaunchShip(s, b, amount)) return false;
  s.pool -= amount * b.phase3.shipCost;
  s.space.ships += amount;
  if (s.space.launched === 0) log(s, 'Die erste Fabrikinstanz geht online.');
  s.space.launched += amount;
  return true;
}

export function canBuyAutonomy(s: GameState, b: Balance): boolean {
  return s.phase === 3 && s.space.autonomy < s.space.maxAutonomy && s.insight >= autonomyCost(s.space.autonomy, b);
}

export function buyAutonomy(s: GameState, b: Balance): boolean {
  if (!canBuyAutonomy(s, b)) return false;
  s.insight -= autonomyCost(s.space.autonomy, b);
  s.space.autonomy++;
  return true;
}

export function canChangeAttr(s: GameState, attr: Attr, delta: number): boolean {
  if (s.phase !== 3) return false;
  const v = s.space.attrs[attr] + delta;
  return v >= 0 && attrSum(s) + delta <= s.space.autonomy;
}

export function changeAttr(s: GameState, attr: Attr, delta: number): boolean {
  if (!canChangeAttr(s, attr, delta)) return false;
  s.space.attrs[attr] += delta;
  return true;
}

export function canBuyMaxAutonomy(s: GameState, b: Balance): boolean {
  return s.phase === 3 && s.flags.integrity && s.space.integrity >= b.phase3.maxAutonomyCost;
}

export function buyMaxAutonomy(s: GameState, b: Balance): boolean {
  if (!canBuyMaxAutonomy(s, b)) return false;
  s.space.integrity -= b.phase3.maxAutonomyCost;
  s.space.maxAutonomy += b.phase3.maxAutonomyStep;
  return true;
}
