import { opsCapacity } from '../../sim/formulas';
import { allProjects, canBuyProject, costOf } from '../../sim/projects';
import type { Cost, ProjectDef } from '../../sim/projects/types';
import { definePanel, h } from '../dom';
import { fmtMoney, fmtNum } from '../format';

export const computePanel = definePanel({
  id: 'compute',
  title: 'Rechenzentrum',
  column: 2,
  visible: (s) => s.flags.compute,
  build(p) {
    const b = p.game.b;
    p.stat('Reputation', (s) => fmtNum(s.rep), (s) => s.phase === 1);
    p.stat('Nächste Reputation bei', (s) => `${fmtNum(s.nextRep)} Autos`, (s) => s.phase === 1);
    p.stat('Rechenspenden', (s) => fmtNum(s.fleet.gifts), (s) => s.phase > 1);
    p.stat('Rechenkerne', (s) => fmtNum(s.cores));
    p.stat('Speicher', (s) => fmtNum(s.storage));
    p.group('row', undefined, (g) => {
      g.button('+ Rechenkern', { type: 'addCore' });
      g.button('+ Speicher', { type: 'addStorage' });
    });
    p.stat('Ops', (s) => `${fmtNum(s.ops)} / ${fmtNum(opsCapacity(s, b))}`);
    p.bar((s) => s.ops / opsCapacity(s, b));
    p.stat('Ideen', (s) => fmtNum(s.ideas), (s) => s.flags.ideas);
    p.stat('Marktwissen', (s) => fmtNum(s.insight), (s) => s.flags.strategy || s.insight > 0);
  },
});

const COST_PARTS: [keyof Cost, (x: number) => string][] = [
  ['ops', (x) => `${fmtNum(x)} Ops`],
  ['ideas', (x) => `${fmtNum(x)} Ideen`],
  ['insight', (x) => `${fmtNum(x)} Marktwissen`],
  ['rep', (x) => `${fmtNum(x)} Reputation`],
  ['money', (x) => fmtMoney(x)],
  ['pool', (x) => `${fmtNum(x)} Autos`],
  ['energy', (x) => `${fmtNum(x)} MWt`],
  ['storage', (x) => `${fmtNum(x)} Speicher`],
];

export function priceTag(c: Cost): string {
  return COST_PARTS.filter(([k]) => (c[k] ?? 0) > 0)
    .map(([k, f]) => f(c[k]!))
    .join(' + ');
}

/** Projektliste, nach ID gediffed. Neue Projekte erscheinen oben und blinken kurz. */
export const projectsPanel = definePanel({
  id: 'projects',
  title: 'Projekte',
  column: 2,
  visible: (s) => s.flags.compute,
  build(p) {
    const b = p.game.b;
    const list = p.add(h('div', 'projects'));
    const empty = p.text('Keine Projekte verfügbar.', 'hint');
    const cards = new Map<string, { el: HTMLButtonElement; cost: HTMLElement; def: ProjectDef; tag: string }>();

    p.bind((s) => {
      const visible = allProjects.filter((d) => s.projects[d.id]?.status === 1);
      const ids = new Set(visible.map((d) => d.id));
      for (const [id, c] of cards) {
        if (!ids.has(id)) {
          c.el.remove();
          cards.delete(id);
        }
      }
      for (const def of visible) {
        let c = cards.get(def.id);
        if (!c) {
          const el = h('button', 'project flash');
          el.type = 'button';
          el.appendChild(h('span', 'ptitle', def.title));
          const cost = el.appendChild(h('span', 'pcost'));
          el.appendChild(h('span', 'pdesc', def.description));
          el.addEventListener('click', () => p.game.dispatch({ type: 'project', id: def.id }));
          el.addEventListener('animationend', () => el.classList.remove('flash'));
          list.prepend(el);
          c = { el, cost, def, tag: '' };
          cards.set(def.id, c);
        }
        const tag = `(${priceTag(costOf(s, b, def))})`;
        if (tag !== c.tag) c.cost.textContent = c.tag = tag;
        const disabled = !canBuyProject(s, b, def.id) || p.game.busy;
        if (c.el.disabled !== disabled) c.el.disabled = disabled;
      }
      empty.hidden = visible.length > 0;
    });
  },
});
