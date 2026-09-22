import { defaultBalance } from '../src/sim';
import { allProjects, projectById } from '../src/sim/projects';
import { greedyBot } from './bots/greedy';
import { run } from './run';

/**
 * Erreichbarkeit (12.2):
 * 1. statisch – Projekt-IDs in Triggern existieren, keine Zyklen;
 * 2. dynamisch – welche Projekte der gierige Bot bis zum Ende nie zu sehen bekommt.
 *   npm run reachability
 */
const deps = new Map<string, string[]>();
let problems = 0;
for (const p of allProjects) {
  const refs = [...p.trigger.toString().matchAll(/['`](P\d+b?)['`]/g)].map((m) => m[1]);
  deps.set(p.id, refs);
  for (const r of refs) {
    if (!projectById.has(r)) {
      console.log(`✗ ${p.id} verweist auf unbekanntes ${r}`);
      problems++;
    }
  }
}

const state = new Map<string, 'visiting' | 'done'>();
function visit(id: string, path: string[]): void {
  if (state.get(id) === 'done') return;
  if (state.get(id) === 'visiting') {
    console.log(`✗ Zyklus: ${[...path, id].join(' → ')}`);
    problems++;
    return;
  }
  state.set(id, 'visiting');
  for (const d of deps.get(id) ?? []) visit(d, [...path, id]);
  state.set(id, 'done');
}
for (const id of deps.keys()) visit(id, []);
console.log(problems === 0 ? '✓ statisch: alle Verweise gültig, keine Zyklen' : `${problems} Problem(e)`);

const seen = new Set<string>();
const r = run({
  seed: 1,
  maxSeconds: 12 * 3600,
  bot: {
    name: 'gierig+beobachter',
    act: (() => {
      const bot = greedyBot();
      return (s, b) => {
        bot.act(s, b);
        if (s.tick % 100 === 0) for (const [id, p] of Object.entries(s.projects)) if (p.status > 0) seen.add(id);
      };
    })(),
  },
  balance: defaultBalance,
  stop: (s) => s.flags.endgame && (s.projects.P140?.status ?? 0) > 0,
});
const unseen = allProjects.map((p) => p.id).filter((id) => !seen.has(id));
console.log(`✓ dynamisch: ${seen.size}/${allProjects.length} Projekte erschienen in ${(r.seconds / 3600).toFixed(1)} h Spielzeit`);
console.log(`  nie erschienen (Notausgänge und Ende-Kette erwartet): ${unseen.join(' ')}`);
process.exitCode = problems > 0 ? 1 : 0;
