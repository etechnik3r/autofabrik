# FLIESSBAND – Autofabrik

Incremental-/Idle-Browserspiel über eine Fahrzeugfabrik-KI: von der Manufaktur über den Konzern bis zur Besiedlung des Universums. Mechanik nach Universal Paperclips, eigenes Thema.

- Spielspezifikation: [`autofabrik_spec.md`](autofabrik_spec.md)
- Architekturkonzept und Abweichungen von der Spec: [`docs/ARCHITEKTUR.md`](docs/ARCHITEKTUR.md)

## Starten

```bash
npm install
npm run dev        # Entwicklungsserver (Vite)
npm run build      # Typecheck + statischer Build nach dist/
```

`dist/` ist eine statische Seite ohne Backend und kann auf jedem Webspace liegen.

## Prüfen

```bash
npm test                 # Vitest: Formeln, Anhang-C-Referenz, Speichern, kompletter Durchlauf
npm run typecheck
npm run sim -- bot=referenz seeds=1,2,3 minutes=120   # Anhang C nachstellen
npm run sim -- bot=gierig seeds=1 minutes=600         # ganzes Spiel headless
npm run reachability     # Projektgraph statisch + dynamisch prüfen
```

## Aufbau

```
data/balance.json     alle Konstanten (Anhang B)
src/sim/              Simulation – reine Logik, kein DOM, deterministisch
  tick.ts             Game Loop (Fast-/Slow-Tick, Reihenfolge nach Spec 2.1)
  actions.ts          alle Spielereingaben (UI und Bots nutzen dieselbe Schnittstelle)
  projects/           Projektbaum als Datentabellen je Phase
src/save/             Speichern (2 Slots), Migration, Export/Import
src/ui/               Browser-Treiber (Fixed Timestep, Offline-Fortschritt) und Panels
tools/                Headless-Simulation, Bots, Erreichbarkeit
test/                 Vitest
```

Neues Projekt: Eintrag in `src/sim/projects/<phase>.ts`. Neue Zahl: `data/balance.json`. Neue Spieleraktion: `src/sim/actions.ts`, danach ein Button im passenden Panel.

## Stand

| Meilenstein (Spec 13) | Status |
|---|---|
| M1 Simulationskern Phase 1 | ✓ Anhang C wird reproduziert (100 000 Autos nach 42,6–43,1 min, Referenz 43,2–44,4) |
| M2 UI Phase 1, Speichern/Laden | ✓ |
| M3 Rechenzentrum und Projekte | ✓ |
| M4 Nebensysteme bis P35 | ✓ gieriger Bot erreicht Phase 2 nach ≈ 3,2 h |
| M5 Phase 2 | ✓ Bot erreicht P46 nach ≈ 1,5 h Phase 2 |
| M6 Phase 3, Konflikt Variante A | ✓ Bot erreicht das Ende nach ≈ 2,5–2,8 h Phase 3 |
| M7 Ende, Prestige, Texte | ✓ beide Enden spielbar; Texte sind erste Fassung, Konflikt Variante B (Canvas) offen |
