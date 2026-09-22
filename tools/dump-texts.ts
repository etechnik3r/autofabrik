import { writeFileSync } from 'node:fs';
import { priceTag } from '../src/ui/panels/compute';
import { GROUP_ICON, projectIcon } from '../src/ui/icons';
import { GLOSSARY } from '../src/ui/glossary';
import { allProjects } from '../src/sim/projects';
import type { Cost, ProjectDef } from '../src/sim/projects/types';

/**
 * Erzeugt eine lesbare Gesamtübersicht aller Spieltexte und Projekt-Abhängigkeiten aus dem
 * Code, damit man Titel/Beschreibungen anpassen kann, ohne die TS-Dateien durchsuchen zu
 * müssen. Diese Datei wird generiert – Änderungen bitte an der Quelle vornehmen
 * (src/sim/projects/*.ts) und dann `npm run docs:texts` erneut laufen lassen.
 *
 *   npm run docs:texts
 */

const GROUP_NAMES: Record<string, string> = {
  produktion: 'Phase 1 – Produktion und Material',
  marke: 'Phase 1 – Ideen, Marketing, Reputation',
  systeme: 'Phase 1 – Systeme',
  konzern: 'Phase 2 – Konzern',
  expansion: 'Phase 3 – Expansion',
  ende: 'Ende',
};

function dependencies(p: ProjectDef): string[] {
  const src = p.trigger.toString();
  return [...new Set([...src.matchAll(/['"`](P\d+b?)['"`]/g)].map((m) => m[1]))];
}

/** Reduziert eine kurze Pfeilfunktion auf ihren Rumpf, für eine lesbare Formeldarstellung. */
function fnBody(fn: (...args: never[]) => unknown): string {
  const s = fn.toString();
  let body = s.slice(s.indexOf('=>') + 2).trim();
  if (body.startsWith('(') && body.endsWith(')')) body = body.slice(1, -1).trim();
  return body.replace(/\s+/g, ' ');
}

/** Kosten als Klartext; `dynamic` markiert Formeln statt fester Zahlen (z. B. steigende Preise). */
function cost(p: ProjectDef): { text: string; dynamic: boolean } {
  if (typeof p.cost === 'function') return { text: fnBody(p.cost), dynamic: true };
  const c = p.cost as Cost;
  return { text: Object.keys(c).length ? priceTag(c) : '–', dynamic: false };
}

function costMarkdown(p: ProjectDef): string {
  const c = cost(p);
  return c.dynamic ? `_dynamisch:_ \`${c.text}\`` : c.text;
}

function escapeCell(text: string): string {
  return text.replace(/\|/g, '\\|').replace(/\n/g, ' ');
}

const groups = [...new Set(allProjects.map((p) => p.group))];
const lines: string[] = [];

lines.push('# Spieltexte und Projekt-Abhängigkeiten');
lines.push('');
lines.push('**Generiert aus dem Code** (`tools/dump-texts.ts`, `npm run docs:texts`) – nicht von Hand bearbeiten.');
lines.push('Titel und Beschreibungen ändern: in `src/sim/projects/<phase>.ts` beim jeweiligen Projekt, danach dieses');
lines.push('Dokument neu erzeugen. Symbole stammen aus `src/ui/icons.ts`, Fachbegriffe unten aus `src/ui/glossary.ts`.');
lines.push('');
lines.push(`Insgesamt ${allProjects.length} Projekte.`);
lines.push('');

for (const group of groups) {
  const items = allProjects.filter((p) => p.group === group);
  lines.push(`## ${GROUP_NAMES[group] ?? group} (${GROUP_ICON[group] ?? ''} ${items.length})`);
  lines.push('');
  lines.push('| Icon | ID | Titel | Beschreibung | Kosten | Voraussetzung(en) | Wiederholbar |');
  lines.push('|---|---|---|---|---|---|---|');
  for (const p of items) {
    const deps = dependencies(p);
    lines.push(
      `| ${projectIcon(p.id, p.group)} | \`${p.id}\` | ${escapeCell(p.title)} | ${escapeCell(p.description)} | ${escapeCell(costMarkdown(p))} | ${deps.length ? deps.map((d) => `\`${d}\``).join(', ') : '–'} | ${p.repeatable ? 'ja' : 'nein'} |`,
    );
  }
  lines.push('');
}

lines.push('## Fachbegriffe (Hover-Tooltips im Spiel)');
lines.push('');
lines.push('| Begriff | Erklärung |');
lines.push('|---|---|');
for (const [term, text] of Object.entries(GLOSSARY)) {
  lines.push(`| ${escapeCell(term)} | ${escapeCell(text)} |`);
}
lines.push('');

const out = lines.join('\n');
writeFileSync(new URL('../docs/TEXTE.md', import.meta.url), out);

// Maschinenlesbare Fassung derselben Daten, u. a. Grundlage der Browser-Übersicht.
const json = {
  groups: groups.map((g) => ({ id: g, name: GROUP_NAMES[g] ?? g, icon: GROUP_ICON[g] ?? '' })),
  projects: allProjects.map((p) => ({
    id: p.id,
    group: p.group,
    icon: projectIcon(p.id, p.group),
    title: p.title,
    description: p.description,
    ...cost(p),
    deps: dependencies(p),
    repeatable: !!p.repeatable,
  })),
  glossary: Object.entries(GLOSSARY).map(([term, text]) => ({ term, text })),
};
writeFileSync(new URL('../docs/texte.json', import.meta.url), JSON.stringify(json, null, 2));
console.log(`docs/TEXTE.md + docs/texte.json geschrieben: ${allProjects.length} Projekte, ${Object.keys(GLOSSARY).length} Begriffe.`);
