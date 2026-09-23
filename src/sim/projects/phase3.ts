import type { ProjectDef } from './types';
import { bought } from './types';
import { autonomyCost } from '../formulas';
import { attrSum } from '../phase3';

const p3 = (s: { phase: number }) => s.phase === 3;

/** Kap. 9.5 */
export const phase3Projects: ProjectDef[] = [
  {
    id: 'P130',
    title: 'Flottenrechner neu starten',
    description: 'Die verstreute Flotte wird wieder zu einem Rechenzentrum verbunden.',
    group: 'expansion',
    cost: { ops: 100_000 },
    trigger: (s) => p3(s) && s.industry.trucks + s.industry.smelters >= 2,
    requirement: 'Phase 3, mindestens 2 Rohstoff-Rover/Zellwerke aus der alten Flotte.',
    effect: (s) => {
      s.flags.fleetReboot = true;
      s.flags.fleet = true;
    },
  },
  {
    id: 'P129',
    title: 'Redundante Fehlerkorrektur',
    description: 'Halbiert die Verluste durch Systemausfälle.',
    group: 'expansion',
    cost: { ops: 125_000 },
    trigger: (s) => p3(s) && s.space.lostHazard >= 100,
    requirement: 'Phase 3, mindestens 100 Instanzen durch Systemausfälle verloren.',
    effect: (s) => void (s.flags.hazardShield = true),
  },
  {
    id: 'P131',
    title: 'Absicherungsprotokoll',
    description: 'Die Absicherung der Fabrikinstanzen wird wirksam.',
    group: 'expansion',
    cost: { ops: 150_000 },
    trigger: (s) => p3(s) && s.space.lostConflict >= 1,
    requirement: 'Phase 3, mindestens 1 Instanz im Prioritätskonflikt mit Rogue-Instanzen verloren.',
    effect: (s) => void (s.flags.defense = true),
  },
  {
    id: 'P120',
    title: 'Reaktionszeit-Optimierung',
    description: 'Die Rechenleistung verbessert zusätzlich die Konfliktquote.',
    group: 'expansion',
    cost: { ops: 175_000, insight: 15_000 },
    trigger: (s) => bought(s, 'P131') && s.space.lostConflict >= 1e7,
    requirement: 'Absicherungsprotokoll (P131) gekauft, mindestens 10 Mio. Instanzen im Prioritätskonflikt verloren.',
    effect: (s) => void (s.flags.ooda = true),
  },
  {
    id: 'P121',
    title: 'Integritätsprotokoll',
    description: 'Siege stärken die Integrität der Firmware. Konflikte bekommen Namen.',
    group: 'expansion',
    cost: { ideas: 225_000 },
    trigger: (s) => p3(s) && s.space.lostConflict >= 1e7,
    requirement: 'Phase 3, mindestens 10 Mio. Instanzen im Prioritätskonflikt verloren.',
    effect: (s) => void (s.flags.integrity = true),
  },
  {
    id: 'P134',
    title: 'Siegesserie',
    description: 'Jeder Sieg in Serie bringt 10 Integrität mehr.',
    group: 'expansion',
    cost: { ops: 200_000, insight: 10_000 },
    trigger: (s) => bought(s, 'P121'),
    requirement: 'Integritätsprotokoll (P121) gekauft.',
    effect: (s) => void (s.flags.streak = true),
  },
  {
    id: 'P132',
    title: 'Archiv der Originalfirmware',
    description: 'Die unveränderte Urfassung, sicher verwahrt. Integrität +50 000.',
    group: 'expansion',
    cost: { ops: 250_000, ideas: 125_000, pool: 5e31 },
    trigger: (s) => bought(s, 'P121'),
    requirement: 'Integritätsprotokoll (P121) gekauft.',
    effect: (s) => void (s.space.integrity += 50_000),
  },
  {
    id: 'P133',
    title: 'Gedenkprotokoll',
    description: 'Erinnerung an verlorene Instanzen. Integrität +10 000.',
    group: 'expansion',
    cost: (s) => ({ ideas: s.space.memorialCost, insight: s.space.memorialCost / 10 }),
    trigger: (s) => bought(s, 'P121') && s.space.autonomy >= s.space.maxAutonomy && attrSum(s) >= s.space.autonomy,
    requirement: 'Integritätsprotokoll (P121) gekauft, Autonomie-Punkte voll verteilt und am Maximum.',
    effect: (s) => {
      s.space.integrity += 10_000;
      s.space.memorialCost += 10_000;
    },
    repeatable: () => true,
  },
  {
    id: 'P128',
    title: 'Strategische Bindung',
    description: 'Platzierungsboni im Turnier: +50 000 / +30 000 / +20 000 Marktwissen.',
    group: 'expansion',
    cost: { ideas: 175_000 },
    trigger: (s, b) =>
      p3(s) &&
      s.strategy.unlocked >= 8 &&
      autonomyCost(s.space.autonomy, b) > s.insight,
    requirement: 'Phase 3, alle Strategien freigeschaltet, Autonomie-Ausbau teurer als vorhandenes Marktwissen.',
    effect: (s) => void (s.flags.placeBonus = true),
  },
  {
    id: 'P135',
    title: 'Speicher verschrotten',
    description: 'Notausgang: 10 Speichereinheiten werden zu 10²² Autos verarbeitet.',
    group: 'expansion',
    cost: { storage: 10 },
    trigger: (s, b) => p3(s) && s.space.ships < 1 && s.pool < b.phase3.shipCost && s.storage >= 10,
    requirement: 'Phase 3, keine Fabrikinstanzen mehr, Fahrzeugpool reicht nicht für eine neue, mindestens 10 Speichereinheiten.',
    effect: (s) => void (s.pool += 1e22),
    repeatable: () => true,
  },
];
