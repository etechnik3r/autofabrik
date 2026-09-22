import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { createState, defaultBalance as b, dispatch, fastTick } from '../src/sim';
import { allProjects, projectById } from '../src/sim/projects';

describe('Projektbaum (Kap. 9)', () => {
  it('IDs sind eindeutig, Titel und Beschreibung vorhanden', () => {
    expect(new Set(allProjects.map((p) => p.id)).size).toBe(allProjects.length);
    for (const p of allProjects) {
      expect(p.title.length, p.id).toBeGreaterThan(0);
      expect(p.description.length, p.id).toBeGreaterThan(0);
    }
  });

  it('jede im Quelltext referenzierte Projekt-ID existiert', () => {
    const dir = join(__dirname, '../src/sim');
    const files = [...readdirSync(dir).map((f) => join(dir, f)), ...readdirSync(join(dir, 'projects')).map((f) => join(dir, 'projects', f))];
    const refs = new Set<string>();
    for (const f of files.filter((x) => x.endsWith('.ts'))) {
      for (const m of readFileSync(f, 'utf8').matchAll(/'(P\d+b?)'/g)) refs.add(m[1]);
    }
    for (const id of refs) expect(projectById.has(id), id).toBe(true);
  });

  it('enthält den vollständigen Baum aus Kap. 9', () => {
    const expected = [
      'P01', 'P02', 'P03', 'P16', 'P04', 'P07', 'P08', 'P09', 'P10', 'P10b', 'P22', 'P23', 'P24', 'P25', 'P26', 'P26b', 'P42',
      'P05', 'P06', 'P13', 'P14', 'P15', 'P17', 'P19', 'P11', 'P12', 'P34', 'P27', 'P28', 'P29', 'P30', 'P31', 'P40', 'P40b',
      'P20', 'P60', 'P61', 'P62', 'P63', 'P64', 'P65', 'P66', 'P118', 'P119', 'P21', 'P37', 'P38', 'P50', 'P51', 'P70', 'P35',
      'P18', 'P127', 'P41', 'P43', 'P44', 'P45', 'P100', 'P101', 'P102', 'P110', 'P111', 'P112', 'P126', 'P125', 'P46',
      'P130', 'P129', 'P131', 'P120', 'P121', 'P134', 'P132', 'P133', 'P128', 'P135',
      'P140', 'P141', 'P142', 'P143', 'P144', 'P145', 'P146', 'P147', 'P148', 'P200', 'P201',
      'P210', 'P211', 'P212', 'P213', 'P214', 'P215', 'P216',
    ];
    expect(allProjects.map((p) => p.id).sort()).toEqual([...expected].sort());
  });

  it('Pleitefall: Rechenzentrum öffnet und P04 „Notlieferung“ hilft (Anhang C, Befund 2)', () => {
    const s = createState(b, 1);
    s.parts = 0;
    s.stock = 0;
    s.money = 0;
    for (let i = 0; i < 10; i++) fastTick(s, b);
    expect(s.flags.compute).toBe(true);
    expect(s.projects.P04?.status).toBe(1);
    expect(dispatch(s, b, { type: 'project', id: 'P04' })).toBe(true);
    expect(s.parts).toBe(s.partsPerDelivery);
    expect(s.rep).toBe(b.reputation.start - 1);
  });
});
