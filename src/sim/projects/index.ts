import type { Balance } from '../balance';
import { spendOps } from '../compute';
import { log } from '../messages';
import type { GameState, ProjectState } from '../state';
import { endProjects } from './end';
import { phase1Projects } from './phase1';
import { phase2Projects } from './phase2';
import { phase3Projects } from './phase3';
import type { Cost, ProjectDef } from './types';

export const allProjects: ProjectDef[] = [...phase1Projects, ...phase2Projects, ...phase3Projects, ...endProjects];

export const projectById: ReadonlyMap<string, ProjectDef> = new Map(allProjects.map((p) => [p.id, p]));

function ps(s: GameState, id: string): ProjectState {
  return (s.projects[id] ??= { status: 0, count: 0, shownAt: 0 });
}

export function costOf(s: GameState, b: Balance, p: ProjectDef): Cost {
  return typeof p.cost === 'function' ? p.cost(s, b) : p.cost;
}

export function canAffordCost(s: GameState, c: Cost): boolean {
  return (
    (c.ops ?? 0) <= s.ops &&
    (c.ideas ?? 0) <= s.ideas &&
    (c.insight ?? 0) <= s.insight &&
    (c.rep ?? 0) <= s.rep &&
    (c.money ?? 0) <= s.money &&
    (c.pool ?? 0) <= s.pool &&
    (c.energy ?? 0) <= s.power.stored &&
    (c.storage ?? 0) <= s.storage
  );
}

function pay(s: GameState, c: Cost): void {
  if (c.ops) spendOps(s, c.ops);
  if (c.ideas) s.ideas -= c.ideas;
  if (c.insight) s.insight -= c.insight;
  if (c.rep) s.rep -= c.rep;
  if (c.money) s.money -= c.money;
  if (c.pool) s.pool -= c.pool;
  if (c.energy) s.power.stored -= c.energy;
  if (c.storage) s.storage -= c.storage;
}

/** Projekte, deren Trigger noch aussteht. Wird bei jedem Scan neu gefiltert, damit Laden/Reset nichts verpasst. */
export function scanProjects(s: GameState, b: Balance): void {
  if (!s.flags.compute) return;
  for (const p of allProjects) {
    const st = s.projects[p.id];
    if (st && st.status !== 0) continue;
    if (p.trigger(s, b)) {
      const x = ps(s, p.id);
      x.status = 1;
      x.shownAt = s.tick;
    }
  }
}

export function visibleProjects(s: GameState): ProjectDef[] {
  return allProjects.filter((p) => s.projects[p.id]?.status === 1);
}

export function canBuyProject(s: GameState, b: Balance, id: string): boolean {
  const p = projectById.get(id);
  if (!p || s.projects[id]?.status !== 1) return false;
  return canAffordCost(s, costOf(s, b, p));
}

export function buyProject(s: GameState, b: Balance, id: string): boolean {
  if (!canBuyProject(s, b, id)) return false;
  const p = projectById.get(id)!;
  pay(s, costOf(s, b, p));
  const st = ps(s, id);
  st.count++;
  st.status = 2;
  if (p.message) log(s, p.message);
  p.effect(s, b);
  // Der Effekt kann den Zustand zurückgesetzt haben (Prestige) – dann existiert st nicht mehr darin.
  if (s.projects[id] === st && p.repeatable?.(s, b)) st.status = 0;
  return true;
}
