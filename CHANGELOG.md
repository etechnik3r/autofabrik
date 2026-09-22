# Changelog

Alle nennenswerten Änderungen an diesem Projekt werden hier dokumentiert.

Das Format orientiert sich an [Keep a Changelog](https://keepachangelog.com/de/1.0.0/),
Versionsnummern werden noch nicht vergeben (Projekt vor dem ersten Release).

## [Unveröffentlicht]

### Geändert
- Anzeigenamen zweier Spielbegriffe an die Automobilbranche angepasst (nur sichtbarer Text,
  interne Feldnamen unverändert): **„Ops“ → „Taktzyklen“** (Rechentakt der KI – passt sowohl
  zu Taktfrequenz als auch zum Bandtakt der Fertigung) und **„Reputation“ → „Ansehen“**
  (Ruf der Marke beim Aufsichtsrat). Betrifft Panels, Projektkosten, Projektbeschreibungen,
  Ticker-Meldungen und das Glossar.
- Spielname von „FLIESSBAND“ auf **Autofabrik** vereinheitlicht (Titel, Kopfbereich, Abspann,
  README, `package.json`). Die ursprüngliche Spielspezifikation bleibt als historisches
  Dokument unverändert.
- Das Euro-Zeichen (€) wurde im gesamten Code, den Tests und in den generierten Texten durch
  U+2208 (∈) ersetzt, um spätere Probleme mit dem echten Währungszeichen zu vermeiden. `k€`
  wird jetzt als `k∈` angezeigt.

### Hinzugefügt
- Generierte Gesamtübersicht aller Spieltexte und Projekt-Abhängigkeiten:
  [`docs/TEXTE.md`](docs/TEXTE.md) (Markdown, versioniert) und `docs/texte.json`
  (maschinenlesbar), erzeugt aus dem Code über `npm run docs:texts`
  (`tools/dump-texts.ts`). Bisher standen Titel, Beschreibungen, Kosten und Abhängigkeiten
  nur verstreut in den TS-Dateien; jetzt gibt es dafür eine einzige, reproduzierbare Quelle
  zum Nachschlagen und Abgleichen von Formulierungen.
- Zusätzlich eine durchsuchbare Browser-Übersicht derselben Daten (Filter je Phase,
  Volltextsuche, klickbare Abhängigkeiten) als Artifact veröffentlicht.
- Passende Icons je Projekt und Panel (Unicode-Emoji, z. B. 💡 für die Ideenwerkstatt oder
  🦾 für die Roboterprojekte) für mehr Wiedererkennbarkeit auf den ersten Blick.
- Neu erschienene Projekte bleiben 30 Spielsekunden lang farbig gerahmt und tragen eine
  „NEU“-Marke, statt nur kurz aufzublinken; überlebt auch einen Neuladen der Seite korrekt.
- Hover-Tooltips für Fachbegriffe (Ops, Ideen, Marktwissen, Integrität, Autonomie, Erz, …) über
  ein zentrales Glossar (`src/ui/glossary.ts`).
- Vier zusätzliche Farbschemen im Einstellungsmenü: System (folgt dem Betriebssystem), Hell,
  Dunkel, „Wolfsburg“ (Blau/Weiß) und „Getriebe“ (dunkler Industrie-Look mit türkisem Akzent).
- Entwicklermodus im Einstellungsmenü: beschleunigt die Simulation testweise um das 60-Fache,
  um die Mechanik schnell durchzuklicken. Absichtlich nicht gespeichert (steht nach jedem
  Neuladen wieder auf „aus“); als Testwerkzeug markiert und leicht wieder entfernbar.

### Behoben
- GitHub Pages zeigte nur eine weiße Seite: Pages lieferte den Repo-Inhalt roh aus, aber
  `index.html` bindet TypeScript ein, das der Browser nicht ausführen kann. Ein GitHub-Actions-
  Workflow ([`.github/workflows/pages.yml`](.github/workflows/pages.yml)) baut das Projekt jetzt
  bei jedem Push nach `main` mit Vite und veröffentlicht den fertigen `dist/`-Ordner.
- Panels konnten am unteren Bildschirmrand abgeschnitten sein (z. B. der Kaufen-Knopf im
  Anlagen-Panel), sodass man scrollen musste. Ab Tablet-Breite scrollt jetzt nicht mehr die
  ganze Seite, sondern jede Spalte für sich – Kopf und die anderen Spalten bleiben immer
  sichtbar. Auf schmalen Bildschirmen (eine Spalte) bleibt normales Scrollen der ganzen Seite.

### Geändert
- Einstellungen aus dem eigenen „System“-Panel in ein Zahnrad-Menü im Kopfbereich verschoben:
  Zahlenformat, Farbschema, Export/Import und ein „Spielstand zurücksetzen“-Knopf mit
  Bestätigung (Prestige bleibt dabei erhalten). Der Spielstand wird weiterhin automatisch lokal
  im Browser gespeichert (localStorage, zwei Slots) und beim Öffnen fortgesetzt.

## [0.2.0] – 2026-09-22

### Hinzugefügt
- Browser-UI ohne Framework: Panel-Baukasten mit Bindern, alle Panels aus Kap. 10 der Spec
  (Montage, Vertrieb, Einkauf, Anlagen, Rechenzentrum, Projekte, Treasury, Wettbewerbssimulation,
  Quantenrechner, Konzern, Energie, Flottenrechner, Expansion, Schiffs-Design, Konflikt).
- Fixed-Timestep-Treiber mit Offline-Fortschritt (max. 8 h, in Blöcken mit Fortschrittsanzeige)
  und Autosave.
- Speichern in zwei localStorage-Slots im Wechsel, Migration mit Standardwerten, Base64-Export/-Import.
- Vitest-Suite: Formelbeispiele aus der Spec, Anhang-C-Referenzsimulation (±10 %), Determinismus,
  Speichern/Laden, Vollständigkeit des Projektbaums, kompletter Durchlauf inkl. beider Enden.
- Erreichbarkeitsprüfung des Projektgraphen (`tools/reachability.ts`).
- README mit Bedienungs- und Prüfanleitung.

## [0.1.0] – 2026-09-22

### Hinzugefügt
- Architekturkonzept (`docs/ARCHITEKTUR.md`): Schichten, Module, Datenfluss und dokumentierte
  Abweichungen von der Spec.
- Headless-Simulationskern aller drei Spielphasen nach `autofabrik_spec.md`: Fast-/Slow-Tick,
  Teile- und Preisregelkreis, Rechenzentrum (Ops, Ideen, Kerne/Speicher), Nebensysteme
  (Treasury, Wettbewerbssimulation, Quantenrechner), Konzernphase (Bergbau, Verhüttung,
  Gigafactories, Stromnetz, Flottenrechner), Expansionsphase (Werksschiffe, Autonomie,
  Konflikte, Integrität) sowie Ende und Prestige.
- Datengetriebener Projektbaum (alle Projekte aus Kap. 9) mit zentraler Kosten-/Kaufprüfung.
- Einheitliche Aktions-Schnittstelle (`actions.ts`), die UI und Bots gemeinsam nutzen.
- Referenz-Bot (reproduziert Anhang C) und gieriger Bot, der das Spiel bis zum Ende durchspielt.

## [0.0.1] – 2026-09-22

### Hinzugefügt
- Spielspezifikation `autofabrik_spec.md`.
