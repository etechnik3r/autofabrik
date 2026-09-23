# Architekturkonzept „Autofabrik“

Grundlage ist `autofabrik_spec.md`. Dieses Dokument beschreibt, **wie** die Spec in Code gegossen wird: Schichten, Module, Datenfluss und die Stellen, an denen die Spec interpretiert werden musste.

## 1. Leitlinien

1. **Simulation ist reine Logik.** `src/sim/` kennt kein DOM, keine Zeit, kein `localStorage`. Eingabe: Zustand + Balance + Aktionen. Ausgabe: veränderter Zustand. So läuft sie headless in Tests, Bots und im Offline-Schnelllauf.
2. **Ein Zustandsobjekt, JSON-serialisierbar.** Alles, was das Spiel ausmacht (inkl. PRNG-Zustand, Projektstatus, Meldungen), steckt in `GameState`. Keine Klassen, keine Closures im Zustand → Speichern = `JSON.stringify`.
3. **Deterministisch.** Zufall ausschließlich über den seedbaren PRNG im Zustand (`mulberry32`). Alle Timer zählen Fast-Ticks, nicht Millisekunden. Gleicher Seed + gleiche Aktionen = gleiches Ergebnis.
4. **Mutation in place.** Der Zustand wird pro Tick verändert statt kopiert (8 h Offline-Fortschritt = 2,9 Mio. Ticks; Kopieren wäre zu teuer). „Rein“ heißt hier: keine Seiteneffekte außerhalb des Zustands.
5. **Daten statt Code, wo es geht.** Zahlen stehen in `data/balance.json`, Projekte als deklarative Tabelle (Kosten-Objekt, Trigger, Effekt).
6. **Eine Wahrheit für Regeln.** Ob ein Button aktiv ist, entscheidet dieselbe Funktion `canDo()`, die auch `dispatch()` prüft. UI und Bots benutzen dieselbe Aktions-Schnittstelle.

## 2. Schichten

```
┌────────────────────────────────────────────────────────────┐
│ ui/        Panels, Formatierung, Eingaben        (Browser) │
│   └── game.ts  Treiber: Echtzeit-Akkumulator, Autosave     │
├────────────────────────────────────────────────────────────┤
│ save/      Serialisierung, Slots, Migration, Export        │
├────────────────────────────────────────────────────────────┤
│ sim/       tick.ts ─► Subsysteme ─► state                   │
│            actions.ts (Spielereingaben)                    │
│            projects/ (Projektbaum als Daten)               │
├────────────────────────────────────────────────────────────┤
│ data/balance.json                                          │
└────────────────────────────────────────────────────────────┘
tools/  Headless-Simulation, Bots, Erreichbarkeitsprüfung (Node)
test/   Vitest: Formeln, Invarianten, Referenzsimulation, Speichern
```

Abhängigkeiten zeigen nur nach unten. `sim/` importiert nie aus `ui/` oder `save/`.

## 3. Module der Simulation (`src/sim/`)

| Datei | Inhalt | Spec |
|---|---|---|
| `balance.ts` | Typisierter Import von `balance.json` | Anh. B |
| `rng.ts` | `mulberry32`, Zustand liegt in `state.rng` | 1.4 |
| `state.ts` | `GameState`-Typ, `createState(seed, prestige)` | 3.1 u. a. |
| `tick.ts` | `fastTick`, `slowTick`, `step(s, b, n)` – verbindliche Reihenfolge | 2 |
| `production.ts` | `produce(k)` | 2.4 |
| `phase1.ts` | Teile, Preis, Nachfrage, Verkauf, Umsatz, Reputation, Anlagenkosten | 3 |
| `compute.ts` | Ops, temporäre Ops, Ideen, Kerne/Speicher | 4.1–4.3 |
| `treasury.ts` | Anlage-Engine | 5.1 |
| `strategy.ts` | Wettbewerbssimulation, Turnier | 5.2 |
| `quantum.ts` | Quantenrechner | 5.3 |
| `buildings.ts` | Phase-2-Gebäude: Kosten, Kauf, Rückbau | 6.2 |
| `phase2.ts` | Bergbau, Verhüttung, Gigafactory-Produktion | 6.1 |
| `power.ts` | Stromnetz | 6.3 |
| `fleet.ts` | Flottenrechner | 6.4 |
| `phase3.ts` | Werksschiffe, Erkundung, Replikation, Drift, Autonomie | 7.1–7.2 |
| `conflict.ts` | Konflikt Variante A, Integrität | 7.3–7.5 |
| `end.ts` | Ende-Trigger, Demontage, Prestige-Reset | 8 |
| `messages.ts` | Nachrichtenticker, Meilensteine, Freischaltungen | 10 |
| `actions.ts` | `Action`-Union, `canDo`, `dispatch` | 3.2 u. a. |
| `formulas.ts` | reine Hilfsformeln (Kosten, `price*`, Absatzprognose) für UI und Bots | 3.5 |
| `projects/` | `types.ts`, `index.ts` (Scan/Kauf) und je Phase eine Tabelle | 4.4, 9 |

### 3.1 Zustand

Flach für Phase 1 (die Formeln der Spec lesen sich 1:1), Unterobjekte für Nebensysteme:

```
GameState
 ├─ version, seed, rng, tick, phase
 ├─ flags            (freigeschaltete Systeme, Schalter)
 ├─ cars, stock, pool, parts, money, price, …        (Phase 1, flach)
 ├─ rep, cores, storage, stdOps, tempOps, ideas, insight, …
 ├─ treasury, strategy, quantum                      (Nebensysteme)
 ├─ industry, power, fleet                           (Phase 2)
 ├─ space, conflict                                  (Phase 3)
 ├─ end                                              (Ende)
 ├─ projects: { [id]: { status: 0 verborgen | 1 sichtbar | 2 gekauft, count } }
 ├─ stats            (Raten pro Sekunde, Ringpuffer)
 ├─ messages         (letzte 50 Meldungen mit Tick)
 └─ prestige         (Kopie; die Wahrheit liegt separat gespeichert)
```

### 3.2 Projekte

```ts
interface ProjectDef {
  id: string; title: string; description: string;
  cost: Cost | ((s, b) => Cost);   // Cost = { ops?, ideas?, insight?, rep?, money?, pool?, energy?, storage? }
  trigger: (s, b) => boolean;      // wann erscheint es
  effect: (s, b) => void;          // nur der Effekt – Bezahlen macht index.ts generisch
  repeatable?: (s, b) => boolean;  // nach Kauf wieder verborgen, Trigger wird neu geprüft
}
```

Weil Kosten deklarativ sind, erledigt `index.ts` Prüfen, Bezahlen und Preisschild-Anzeige zentral. Ein neues Projekt ist ein Tabelleneintrag. Ein statischer Test prüft, dass jede in einem Trigger referenzierte ID existiert.

### 3.3 Aktionen

Jede Spielereingabe ist ein Objekt (`{ type: 'buyRobot' }`, `{ type: 'build', kind: 'truck', amount: 10 }` …). `actions.ts` hält pro Typ `can` und `run`. UI-Buttons binden eine Aktion und fragen `canDo` für den Aktiv-Zustand. Bots rufen dieselben Aktionen auf.

## 4. Game Loop im Browser (`src/ui/game.ts`)

- Fixed Timestep: Echtzeit wird akkumuliert, pro Frame so viele 10-ms-Ticks gerechnet wie fällig (Obergrenze pro Frame, Rest im nächsten Frame).
- Rendering entkoppelt mit `requestAnimationFrame`, Panels aktualisieren nur geänderte Texte.
- Ein Hintergrund-Tab (gedrosselte Timer) holt über den Akkumulator auf.
- Offline-Fortschritt beim Laden: bis 8 h Schnelllauf in Blöcken mit Fortschrittsbalken.
- Autosave alle 25 s und bei `visibilitychange`/`pagehide`, zwei Slots im Wechsel.

## 5. UI (`src/ui/`)

Kein Framework. Ein kleiner Panel-Baukasten (`dom.ts`) registriert beim Aufbau „Binder“ (Text, Aktiv-Zustand, Sichtbarkeit), die im Render-Schritt gegen den Zustand ausgewertet werden. Ein Panel ist deklarativ:

```ts
definePanel({ id: 'sales', title: 'Vertrieb', visible: s => s.phase === 1,
  build(p) { p.stat('Kapital', s => fmtMoney(s.money)); p.button('Preis +1', { type: 'price', delta: 1 }); } })
```

Die Projektliste wird nach ID gediffed. Neu erschienene Karten bleiben 30 Spielsekunden lang farbig gerahmt – gesteuert über `shownAt` im Zustand (nicht über eine CSS-Animation), damit die verbleibende Zeit auch nach einem Neuladen korrekt weiterzählt statt neu zu beginnen.

**Feste Zeilenzahl gegen Layout-Sprünge:** Listen mit schwankender Länge (z. B. die Kapitalanlage-Positionen, 0 bis `maxPositions`) rendern immer die maximale Anzahl Zeilen und füllen fehlende mit einem Platzhalter (`<tr class="empty">`). Sonst springt die Panelhöhe bei jeder Änderung sichtbar – das gilt als Vorlage für jede künftige Liste mit ähnlich schwankender Länge.

**„Verfügbar“ nie als eigenes Flag speichern, das nur im Kauf-Effekt gesetzt wird.** Ein Projekt-Effekt läuft genau einmal, beim Kauf. Eine spätere Änderung, die eine neue Funktion an ein *bereits existierendes* Projekt hängt (z. B. „P118 schaltet jetzt zusätzlich einen Schalter frei“), erreicht damit niemals Spielstände, die dieses Projekt schon vorher gekauft hatten – der Effekt läuft ja nicht erneut. Sichtbarkeits- und `can`-Prüfungen für „ist X freigeschaltet“ fragen deshalb immer `bought(s, 'PID')` direkt ab (liest `s.projects`, unabhängig vom Speicherzeitpunkt), nie ein separates Flag, das nur beim Kauf gesetzt wird. Ein echter Ein/Aus-*Schalter* (z. B. `autoTourney`) darf weiterhin ein Flag sein – nur seine *Sichtbarkeit* hängt an `bought()`.

**Icons und Tooltips:** `icons.ts` ordnet jeder Projekt-ID und jedem Panel ein passendes Unicode-Emoji zu (mit Fallback über die Projektgruppe), reine Eye-Candy ohne Spiellogik. `glossary.ts` hält Kurzerklärungen für Fachbegriffe; `Builder.stat()` setzt automatisch einen `title`-Tooltip, wenn die Beschriftung im Glossar steht.

**Farbschemen:** Alle Panel-Farben sind CSS-Variablen auf `:root`. `theme.ts` setzt `data-theme` auf `<html>` (`system` | `light` | `dark` | `wolfsburg` | `getriebe`), die Auswahl steht im Zahnrad-Menü und wird in `localStorage` gemerkt. `system` folgt `prefers-color-scheme`, alle anderen Werte erzwingen ein festes Schema.

**Unabhängig scrollende Spalten:** Ab Tablet-Breite (≥ 641 px) scrollt nicht die ganze Seite, sondern jede der drei Spalten für sich (`overflow-y: auto` pro `.col`, `#app` auf `100vh` fixiert). Kopf und Zahnrad bleiben so immer sichtbar. Auf einer gestapelten Handy-Spalte bleibt normales Seiten-Scrollen, das ist dort die gewohnte Bedienung. Echtes „nie scrollen“ ist bei unbegrenzt wachsenden Listen (Projekte, Gebäude) nicht erreichbar, ohne Inhalte zu verstecken – das hier ist der pragmatische Kompromiss, den auch das Vorbild Universal Paperclips fährt.

**Geschwindigkeitsregler** (`game.ts`, `Game.speed`, `MIN_SPEED`/`MAX_SPEED`): beschleunigt testweise nur die Anzahl ausgeführter Ticks pro realer Zeitscheibe (×1 bis ×60), ohne die Echtzeit-Buchhaltung (`acc`) selbst zu verzerren – damit bleibt die Offline-Fortschritt-Erkennung beim normalen Spielen unberührt. `speed` liegt bewusst auf der `Game`-Instanz statt in `GameState`, ist also nicht Teil des Spielstands (steht nach einem Neuladen wieder auf ×1) und wird über einen Regler im Zahnrad-Menü direkt gesetzt (kein `dispatch`, da kein Simulationszustand). Klar als Testwerkzeug markiert (nur ×1 ist ein „echtes“ Spiel), damit er sich vor einem Release rückstandsfrei entfernen lässt.

## 6. Speichern (`src/save/`)

`{ version, timestamp, state }` in `localStorage`, Slots A/B im Wechsel, beim Laden gewinnt der neuere gültige Slot. Prestige separat unter eigenem Schlüssel. Migrationen `migrate[n]` heben alte Stände schrittweise an. Export/Import als Base64.

## 7. Werkzeuge und Tests

- `tools/simulate.ts` – headless Lauf mit wählbarem Bot und Seed, gibt Meilensteinzeiten aus.
- `tools/bots/` – Referenz-Bot nach Anhang C, gieriger Bot.
- `tools/reachability.ts` – statische Prüfung des Projektgraphen (Verweise, Zyklen) und dynamisch: welche Projekte der gierige Bot nie sieht.
- `tools/dump-texts.ts` (`npm run docs:texts`) – extrahiert alle Projekttitel, Beschreibungen, Kosten, Abhängigkeiten (aus dem Trigger-Quelltext per Regex, wie in `reachability.ts`) und die Glossareinträge in `docs/TEXTE.md` und `docs/texte.json`. Einzige Quelle für eine Gesamtübersicht der Spieltexte, da diese sonst nur verstreut in den Projekt-Dateien stehen; Texte selbst bitte weiterhin in `src/sim/projects/*.ts` ändern, dieses Kommando läuft danach erneut.
- `test/` – Formelbeispiele aus der Spec, PRNG-Determinismus, Invarianten (kein NaN, nichts negativ), Anhang-C-Referenz (±10 %), Speichern/Laden, Projekt-Integrität.

## 8. Interpretationen der Spec

Wo die Spec offen oder widersprüchlich ist, gilt:

1. **Projektstatus** statt `uses`-Zähler: verborgen → sichtbar → gekauft. Wiederholbare Projekte fallen nach dem Kauf auf „verborgen“ zurück, solange `repeatable()` wahr ist.
2. **Quanten-Überschuss:** `tempOps` wird nie durch den Überschuss-Term verringert (Formel in 5.3 kann negativ werden) → `max(0, …)`.
3. **Ops-Kosten** werden zuerst von `stdOps`, der Rest von `tempOps` abgezogen.
4. **Energie:** Leistungen werden in MW angezeigt (intern ×100), gespeicherte Energie (MWt) ist unskaliert. P46 braucht also 10⁷ intern ≈ 1 000 Speicherparks.
5. **Turnier** wird sofort komplett ausgewertet (keine Animation); Turnierkosten `1 000 · Anzahl Strategien`.
6. **Verteidigung (`aDef`)** wirkt erst nach P131.
7. **Qubit-Chips:** P50 bringt Chip 1, P51 kostet 10 000 + 5 000 je bisherigem P51-Kauf.
8. **P04 „portfolio“** = Treasury-Gesamtwert.
9. **Demontage:** Jede Stufe gibt +100 **Teilesätze**, die am Ende von Hand montiert werden; danach Abspann.
10. **Phase 3:** Gebäude baut nur die Schiffsflotte; Stromnetz ist abgeschaltet (`powMod = 1`). Der Flottenrechner zeigt „KEINE ANTWORT“ bis P130.
11. **Projektscan** läuft pro Fast-Tick, aber nur über noch verborgene Projekte (Performance).
12. **Mehrfachstart von Werksschiffen** (×1, ×10³, ×10⁶, ×10⁹) analog zum Mehrfachkauf in 6.2. Ohne ihn gibt es eine Sackgasse: Sind die Forks übermächtig und alle Schiffe verloren, stirbt jedes einzeln gestartete Schiff im nächsten Konflikt (Regel 12.1.4).
13. **Konflikt-Zeitlimit:** Nach `conflictMaxRounds` (300 Runden = 30 s) endet ein Konflikt unentschieden. Ohne Limit läuft ein Konflikt mit L ≫ R und ohne Verteidigung ewig (beide Todeswahrscheinlichkeiten 0) und blockiert alle weiteren.
14. **Stromnetz:** Deckt der Speicher ein Defizit, gilt wie bei Überschuss `powMod ≥ 1`.
