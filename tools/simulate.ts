import { defaultBalance } from '../src/sim';
import { greedyBot } from './bots/greedy';
import { referenceBot } from './bots/reference';
import { run } from './run';

/**
 * Headless-Simulation.
 *   npm run sim -- [bot=referenz|gierig] [seeds=1,2,3] [minutes=120]
 */
const args = Object.fromEntries(process.argv.slice(2).map((a) => a.split('=')));
const botName = args.bot ?? 'referenz';
const seeds = (args.seeds ?? '1,2,3').split(',').map(Number);
const minutes = Number(args.minutes ?? 120);

const events = {
  '1. Roboter': (s: any) => s.robots >= 1,
  'Rechenzentrum': (s: any) => s.flags.compute,
  '2 000 Autos': (s: any) => s.cars >= 2_000,
  'Reputation 3': (s: any) => s.rep >= 3,
  '10 000 Autos': (s: any) => s.cars >= 10_000,
  'Reputation 8': (s: any) => s.rep >= 8,
  '100 000 Autos': (s: any) => s.cars >= 100_000,
  'Reputation 12': (s: any) => s.rep >= 12,
  '1 Mio. Autos': (s: any) => s.cars >= 1e6,
  '100 Mio. Autos': (s: any) => s.cars >= 1e8,
  'Phase 2': (s: any) => s.phase >= 2,
  'Erde verarbeitet': (s: any) => s.phase >= 2 && s.industry.ore <= 0,
  'Phase 3': (s: any) => s.phase >= 3,
  'Ende': (s: any) => s.flags.endgame,
};

for (const seed of seeds) {
  const bot = botName === 'gierig' ? greedyBot() : referenceBot();
  const t0 = performance.now();
  const r = run({ seed, maxSeconds: minutes * 60, bot, balance: defaultBalance, events, checkInvariants: true, stop: (s) => s.flags.endgame });
  const s = r.state;
  console.log(`\n=== Seed ${seed}, Bot ${bot.name}, ${(r.seconds / 60).toFixed(1)} min Spielzeit (${((performance.now() - t0) / 1000).toFixed(1)} s Rechenzeit)`);
  for (const e of r.events) console.log(`  ${e.name.padEnd(18)} ${(e.seconds / 60).toFixed(1).padStart(7)} min`);
  console.log(
    `  Ende: Phase ${s.phase}, ${s.cars.toExponential(3)} Autos, ${s.robots} Roboter, ${s.lines} Straßen, Preis ${s.price} k∈, ` +
      `Teilebasis ${s.partsBasePrice.toFixed(0)} k∈, Rep ${s.rep}, Kerne ${s.cores}, Speicher ${s.storage}`,
  );
  const bought = Object.entries(s.projects).filter(([, p]) => p.count > 0).map(([id]) => id);
  console.log(`  Projekte (${bought.length}): ${bought.join(' ')}`);
}
