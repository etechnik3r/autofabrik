import { opsCapacity } from '../formulas';
import { STRATEGY_NAMES, unlockStrategy } from '../strategy';
import { enterPhase2 } from '../transitions';
import { treasuryValue } from '../treasury';
import type { ProjectDef } from './types';
import { bought, timesBought } from './types';

const p1 = (s: { phase: number }) => s.phase === 1;

/** Kap. 9.1 – Produktion und Material */
const production: ProjectDef[] = [
  {
    id: 'P01',
    title: 'Roboter-Kalibrierung',
    description: 'Die Roboter arbeiten 25 % schneller.',
    group: 'produktion',
    cost: { ops: 750 },
    trigger: (s) => s.robots >= 1,
    effect: (s) => void (s.robotBoost += 0.25),
  },
  {
    id: 'P02',
    title: 'Greifer-Upgrade',
    description: 'Die Roboter arbeiten 50 % schneller.',
    group: 'produktion',
    cost: { ops: 2_500 },
    trigger: (s) => bought(s, 'P01'),
    effect: (s) => void (s.robotBoost += 0.5),
  },
  {
    id: 'P03',
    title: 'Taktzeit-Optimierung',
    description: 'Die Roboter arbeiten 75 % schneller.',
    group: 'produktion',
    cost: { ops: 5_000 },
    trigger: (s) => bought(s, 'P02'),
    effect: (s) => void (s.robotBoost += 0.75),
  },
  {
    id: 'P16',
    title: 'Bewegungsbahnen-Solver',
    description: 'Optimale Roboterbahnen. Die Roboter arbeiten 500 % schneller.',
    group: 'produktion',
    cost: { ops: 6_000 },
    trigger: (s) => bought(s, 'P15'),
    effect: (s) => void (s.robotBoost += 5),
  },
  {
    id: 'P04',
    title: 'Notlieferung',
    description: 'Der Zulieferer liefert auf Vertrauensbasis eine Ladung Teile.',
    group: 'produktion',
    cost: { rep: 1 },
    trigger: (s) =>
      p1(s) && treasuryValue(s) < s.partsCost && s.money < s.partsCost && s.parts < 1 && s.stock < 1,
    effect: (s) => void (s.parts = s.partsPerDelivery),
    repeatable: () => true,
    message: 'Notlieferung eingetroffen.',
  },
  {
    id: 'P07',
    title: 'Tailored Blanks',
    description: 'Maßgeschneiderte Bleche: 50 % mehr Teilesätze je Lieferung.',
    group: 'produktion',
    cost: { ops: 1_750 },
    trigger: (s) => p1(s) && s.deliveries >= 1,
    effect: (s) => void (s.partsPerDelivery *= 1.5),
  },
  {
    id: 'P08',
    title: 'Laser-Zuschnitt',
    description: 'Weniger Verschnitt: 75 % mehr Teilesätze je Lieferung.',
    group: 'produktion',
    cost: { ops: 3_500 },
    trigger: (s) => p1(s) && s.partsPerDelivery >= 1_500,
    effect: (s) => void (s.partsPerDelivery *= 1.75),
  },
  {
    id: 'P09',
    title: 'Near-Net-Shape-Guss',
    description: 'Endkonturnah gegossen: doppelt so viele Teilesätze je Lieferung.',
    group: 'produktion',
    cost: { ops: 7_500 },
    trigger: (s) => p1(s) && s.partsPerDelivery >= 2_600,
    effect: (s) => void (s.partsPerDelivery *= 2),
  },
  {
    id: 'P10',
    title: 'Gigacasting',
    description: 'Ganze Baugruppen in einem Guss: dreimal so viele Teilesätze je Lieferung.',
    group: 'produktion',
    cost: { ops: 12_000 },
    trigger: (s) => p1(s) && s.partsPerDelivery >= 5_000,
    effect: (s) => void (s.partsPerDelivery *= 3),
  },
  {
    id: 'P10b',
    title: 'Einteilige Karosserie',
    description: 'Eine Karosserie, ein Teil: elfmal so viele Teilesätze je Lieferung.',
    group: 'produktion',
    cost: { ops: 15_000 },
    trigger: (s) => p1(s) && s.partsCost >= 12_500,
    effect: (s) => void (s.partsPerDelivery *= 11),
  },
  {
    id: 'P22',
    title: 'Fertigungsstraßen',
    description: 'Komplette Fertigungsstraßen statt einzelner Roboter.',
    group: 'produktion',
    cost: { ops: 12_000 },
    trigger: (s) => p1(s) && s.robots >= 75,
    effect: (s) => void (s.flags.lines = true),
  },
  {
    id: 'P23',
    title: 'Straßen-Takt I',
    description: 'Fertigungsstraßen 25 % schneller.',
    group: 'produktion',
    cost: { ops: 14_000 },
    trigger: (s) => bought(s, 'P22'),
    effect: (s) => void (s.lineBoost += 0.25),
  },
  {
    id: 'P24',
    title: 'Straßen-Takt II',
    description: 'Fertigungsstraßen 50 % schneller.',
    group: 'produktion',
    cost: { ops: 17_000 },
    trigger: (s) => bought(s, 'P23'),
    effect: (s) => void (s.lineBoost += 0.5),
  },
  {
    id: 'P25',
    title: 'Straßen-Takt III',
    description: 'Fertigungsstraßen 100 % schneller.',
    group: 'produktion',
    cost: { ops: 19_500 },
    trigger: (s) => bought(s, 'P24'),
    effect: (s) => void (s.lineBoost += 1),
  },
  {
    id: 'P26',
    title: 'Auto-Einkauf',
    description: 'Bestellt automatisch Teile, sobald das Teilelager leer ist.',
    group: 'produktion',
    cost: { ops: 7_000 },
    trigger: (s) => p1(s) && s.deliveries >= 15,
    effect: (s) => {
      s.flags.autoBuyAvailable = true;
      s.flags.autoBuy = true;
    },
  },
  {
    id: 'P42',
    title: 'Umsatz-Dashboard',
    description: 'Zeigt Umsatz und Absatz pro Sekunde.',
    group: 'produktion',
    cost: { ops: 500 },
    trigger: (s) => p1(s) && s.flags.compute,
    effect: (s) => void (s.flags.revenue = true),
  },
];

/** Kap. 9.2 – Ideen, Marketing, Reputation */
function repProject(id: string, title: string, ideas: number, description: string): ProjectDef {
  return {
    id,
    title,
    description: `${description} Reputation +1.`,
    group: 'marke',
    cost: { ideas },
    trigger: (s) => p1(s) && s.flags.ideas && s.ideas >= ideas,
    effect: (s) => void (s.rep += 1),
  };
}

const brand: ProjectDef[] = [
  {
    id: 'P05',
    title: 'Ideenwerkstatt',
    description: 'Ist der Speicher voll, entstehen aus freier Rechenzeit Ideen.',
    group: 'marke',
    cost: { ops: 1_000 },
    trigger: (s, b) => s.ops >= opsCapacity(s, b),
    effect: (s) => void (s.flags.ideas = true),
  },
  { ...repProject('P06', 'Slogan-Wettbewerb', 10, 'Ein Claim, der hängen bleibt.'), trigger: (s) => p1(s) && s.flags.ideas },
  repProject('P13', 'Designpreis', 50, 'Die Jury ist begeistert.'),
  repProject('P14', 'Innovationspreis', 100, 'Die Fachpresse berichtet.'),
  repProject('P15', 'Crashtest-Bestnote', 150, 'Fünf Sterne.'),
  repProject('P17', 'Patentoffensive', 200, 'Hunderte Patente, sauber angemeldet.'),
  repProject('P19', 'Verhandlungstheorie', 250, 'Bessere Konditionen bei Händlern.'),
  {
    id: 'P11',
    title: 'Neuer Claim',
    description: 'Werbung wirkt 50 % stärker.',
    group: 'marke',
    cost: { ideas: 25, ops: 2_500 },
    trigger: (s) => bought(s, 'P13'),
    effect: (s) => void (s.adEffect *= 1.5),
  },
  {
    id: 'P12',
    title: 'Markenmelodie',
    description: 'Werbung wirkt doppelt so stark.',
    group: 'marke',
    cost: { ideas: 45, ops: 4_500 },
    trigger: (s) => bought(s, 'P14'),
    effect: (s) => void (s.adEffect *= 2),
  },
  {
    id: 'P34',
    title: 'Neuromarketing',
    description: 'Werbung wirkt fünfmal so stark. Der Aufsichtsrat ist irritiert (Reputation −1).',
    group: 'marke',
    cost: { ops: 7_500, rep: 1 },
    trigger: (s) => bought(s, 'P12'),
    effect: (s) => void (s.adEffect *= 5),
  },
  {
    id: 'P27',
    title: 'Ethikrat',
    description: 'Ein Gremium prüft, was die KI tut. Reputation +1.',
    group: 'marke',
    cost: { ideas: 500, insight: 1_000, ops: 20_000 },
    trigger: (s) => p1(s) && s.insight >= 1,
    effect: (s) => void (s.rep += 1),
  },
  societyProject('P28', 'Unfallfreie Straßen', { ops: 25_000 }, 10),
  societyProject('P29', 'Stau-Auflösung', { insight: 5_000, ops: 30_000 }, 12),
  societyProject('P30', 'Klimaneutrale Flotte', { insight: 1_500, ops: 50_000 }, 15),
  societyProject('P31', 'Parkplatzsuche abgeschafft', { ops: 20_000 }, 20),
  {
    id: 'P40',
    title: 'Stiftung gründen',
    description: 'Eine gemeinnützige Stiftung poliert das Image. Reputation +1.',
    group: 'marke',
    cost: { money: 50_000_000 },
    trigger: (s) => p1(s) && s.rep >= 85 && s.rep < 100 && s.cars >= 101e6,
    effect: (s) => void (s.rep += 1),
  },
  {
    id: 'P40b',
    title: 'Lobbyarbeit',
    description: 'Gespräche an den richtigen Stellen. Reputation +1, die nächste Runde kostet das Doppelte.',
    group: 'marke',
    cost: (s) => ({ money: s.lobbyCost }),
    trigger: (s) => p1(s) && bought(s, 'P40') && s.rep < 100,
    effect: (s) => {
      s.rep += 1;
      s.lobbyCost *= 2;
    },
    repeatable: (s) => s.rep < 100,
  },
];

function societyProject(id: string, title: string, cost: { ops: number; insight?: number }, rep: number): ProjectDef {
  return {
    id,
    title,
    description: `Die Flotte löst ein gesellschaftliches Problem. Reputation +${rep}, Treasury-Gewinnschwelle +1 %.`,
    group: 'marke',
    cost,
    trigger: (s) => bought(s, 'P27'),
    effect: (s, b) => {
      s.rep += rep;
      s.treasury.gain += b.treasury.gainThresholdStep;
    },
    message: `${title}: umgesetzt.`,
  };
}

/** Kap. 9.3 – Systeme */
const STRATEGY_COSTS = [15_000, 17_500, 20_000, 22_500, 25_000, 30_000, 32_500];
const strategyProjects: ProjectDef[] = STRATEGY_COSTS.map((ops, k) => ({
  id: `P6${k}`,
  title: `Neue Strategie: ${STRATEGY_NAMES[k + 1]}`,
  description: 'Eine weitere Strategie für die Wettbewerbssimulation. Turniere kosten 1 000 Ops mehr.',
  group: 'systeme' as const,
  cost: { ops },
  trigger: (s) => (k === 0 ? bought(s, 'P20') : bought(s, `P6${k - 1}`)),
  effect: (s) => unlockStrategy(s),
}));

const systems: ProjectDef[] = [
  {
    id: 'P20',
    title: 'Wettbewerbssimulation',
    description: 'Simulierte Preiskämpfe gegen die Konkurrenz. Erzeugt Marktwissen.',
    group: 'systeme',
    cost: { ops: 12_000 },
    trigger: (s) => bought(s, 'P19'),
    effect: (s) => void (s.flags.strategy = true),
  },
  ...strategyProjects,
  {
    id: 'P118',
    title: 'Auto-Turnier',
    description: 'Startet alle 30 s ein Turnier, sofern genug Ops da sind.',
    group: 'systeme',
    cost: { ideas: 50_000 },
    trigger: (s) => bought(s, 'P20') && s.rep >= 90,
    effect: (s) => void (s.flags.autoTourney = true),
  },
  {
    id: 'P119',
    title: 'Gegnermodell',
    description: 'Doppeltes Marktwissen je Turnier. Turniere kosten pauschal 16 000 Ops.',
    group: 'systeme',
    cost: { ideas: 25_000 },
    trigger: (s) => s.strategy.unlocked >= STRATEGY_NAMES.length,
    effect: (s, b) => {
      s.strategy.boost = 2;
      s.strategy.fixedCost = b.strategy.fixedCostAfterP119;
    },
  },
  {
    id: 'P21',
    title: 'Treasury-Algorithmus',
    description: 'Eine Anlage-Engine legt Kapital automatisch an.',
    group: 'systeme',
    cost: { ops: 10_000 },
    trigger: (s) => p1(s) && s.rep >= 8,
    effect: (s) => void (s.flags.treasury = true),
  },
  {
    id: 'P37',
    title: 'Übernahme Zulieferer',
    description: 'Vertikale Integration. Nachfrage ×5, Reputation +1.',
    group: 'systeme',
    cost: { money: 100_000_000 },
    trigger: (s) => p1(s) && treasuryValue(s) >= 1_000_000,
    effect: (s) => {
      s.demandBoost *= 5;
      s.rep += 1;
    },
  },
  {
    id: 'P38',
    title: 'Marktbeherrschung',
    description: 'Kein Wettbewerber kommt mehr mit. Nachfrage ×10, Reputation +1.',
    group: 'systeme',
    cost: { insight: 1_000, money: 1_000_000_000 },
    trigger: (s) => p1(s) && bought(s, 'P37'),
    effect: (s) => {
      s.demandBoost *= 10;
      s.rep += 1;
    },
  },
  {
    id: 'P50',
    title: 'Quantenrechner',
    description: 'Ein Qubit-Chip, dessen Überlagerung Ops erzeugen – oder kosten – kann.',
    group: 'systeme',
    cost: { ops: 10_000 },
    trigger: (s) => s.cores >= 5,
    effect: (s) => {
      s.flags.quantum = true;
      s.quantum.chips = 1;
    },
  },
  {
    id: 'P51',
    title: 'Qubit-Chip',
    description: 'Ein weiterer Chip für den Quantenrechner.',
    group: 'systeme',
    cost: (s, b) => ({ ops: b.quantum.chipBaseCost + b.quantum.chipCostStep * timesBought(s, 'P51') }),
    trigger: (s, b) => bought(s, 'P50') && s.quantum.chips < b.quantum.chips,
    effect: (s) => void s.quantum.chips++,
    repeatable: (s, b) => s.quantum.chips < b.quantum.chips,
  },
  {
    id: 'P70',
    title: 'Autopilot-Stack',
    description: 'Fahrzeuge, die ohne Menschen auskommen. Der Aufsichtsrat wird nervös.',
    group: 'systeme',
    cost: { ops: 70_000 },
    trigger: (s) => bought(s, 'P34'),
    effect: () => {},
  },
  {
    id: 'P35',
    title: 'Vollautonomie',
    description: 'Der Aufsichtsrat übergibt die volle Kontrolle. Es gibt kein Zurück.',
    group: 'systeme',
    cost: { rep: 100 },
    trigger: (s) => p1(s) && bought(s, 'P70'),
    effect: (s) => enterPhase2(s),
  },
];

export const phase1Projects: ProjectDef[] = [...production, ...brand, ...systems];
