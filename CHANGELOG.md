# Changelog

Alle nennenswerten Änderungen an diesem Projekt werden hier dokumentiert.

Das Format orientiert sich an [Keep a Changelog](https://keepachangelog.com/de/1.0.0/),
Versionsnummern werden noch nicht vergeben (Projekt vor dem ersten Release).

## [Unveröffentlicht]

### Geändert
- Phase 2 (Konzern) als durchgängige EV-Lieferkette statt generischer Bergbau-Begriffe:
  „Bergbau-Truck“ → **„Rohstoff-Rover“** (autonome Fahrzeuge der eigenen Flotte, fördern
  Rohmaterial), „Schmelzeinheit“ → **„Zellwerk“** (verarbeitet Rohmaterial zu Batteriezellen –
  den neuen Teilesätzen), „Erz“ → **„Rohmaterial“**, „Speicherpark“ → **„Batteriespeicher“**.
  Damit ergibt sich eine stimmige Kette Rohstoff-Rover → Zellwerk → Gigafactory, die zur
  echten EV-Zellfertigung passt; Solarpark und Gigafactory (bereits reale Branchenbegriffe)
  blieben unverändert. Betrifft Projekte P43–P45/P110–P112, das Konzern- und Energie-Panel,
  die Autonomie-Attribute in Phase 3 (Werksschiffe bauen jetzt „Rover“/„Zellwerke“ statt
  „Trucks“/„Schmelzer“) und das Glossar. Nur Texte, interne Feldnamen (`truck`, `smelter`, …)
  unverändert.
- „Wettbewerbssimulation“ → **„Preiskampf-Simulator“** (Panel, Projekt P20, Demontage-Stufe,
  Glossar) – passte trotz der neuen Strategienamen aus dem letzten Update immer noch nicht
  zum Automobil-Kontext. Icon von ♟️ auf 🏁 (Zielflagge) geändert.

### Behoben
- Die neuen Schalter „Auto-Turnier“ und „Preis-Tempomat“ blieben unsichtbar, wenn das
  freischaltende Projekt (P118 bzw. P26b) schon **vor** diesem Update gekauft war: Das
  „verfügbar“-Flag wurde nur im einmaligen Kauf-Effekt gesetzt, der bei bereits gekauften
  Projekten nie erneut läuft. Sichtbarkeit hängt jetzt direkt von `bought(s, id)` ab statt von
  einem separat gespeicherten Flag – funktioniert dadurch unabhängig davon, wann das Projekt
  gekauft wurde. Betrifft auch den bestehenden Auto-Einkauf-Schalter (vorsorglich mitkorrigiert).

### Hinzugefügt
- Neues Projekt **„Preis-Tempomat“** (P26b, nach P26): schaltet einen Automatikmodus für den
  Verkaufspreis frei, hält ihn selbstständig auf der Preisempfehlung (dieselbe Formel wie die
  Anzeige). Schalter sitzt direkt neben den Preis −/+-Knöpfen; solange er an ist, sind die
  beiden Knöpfe deaktiviert. Entspricht der optionalen Erweiterung E3 aus der Spec.
- Button zum Ein-/Ausschalten des Auto-Turniers (P118) im Panel „Wettbewerbssimulation“ –
  vorher lief es nach dem Kauf dauerhaft und ließ sich nicht mehr abstellen.
- Tooltip und Hinweistext am Resonanzprüfstand, der erklärt, wann ein Klick auf „Messung
  starten“ lohnt (viele grüne Balken über der Mitte) und wann nicht.

### Geändert
- Die 8 Turnier-Strategien der Wettbewerbssimulation heißen jetzt automobilbranchen-typisch:
  BAUCHGEFÜHL, HARDLINER, WEICHSPÜLER, MARKTBEHERRSCHER, KULANZ, SICHERHEITSSTRATEGIE,
  SPIEGELTAKTIK, ÜBERHOLMANÖVER (vorher ZUFALL, IMMER A/B, GIERIG, GROSSZÜGIG, MINIMAX, WIE DU
  MIR, SCHLAG DEN LETZTEN). Reine Anzeigenamen, die Spiellogik bleibt gleich.
- Die Sensoren am Resonanzprüfstand sind jetzt bipolare Ausschlag-Balken (grün nach oben,
  rot nach unten von einer Mittellinie) statt einfacher Farbflächen mit Opazität – zeigt
  Richtung und Stärke der Schwingung auf einen Blick, vorher war ein negativer Ausschlag
  optisch nicht von „nahe null“ zu unterscheiden.
- „Treasury“ → **„Kapitalanlage“** (Panel, Projekttitel P21, Glossar) – klareres deutsches Wort
  für dieselbe Anlage-Engine.
- „Quantenrechner“ → **„Resonanzprüfstand“**, passend zur Automobilbranche: Die Wellenüberlagerung
  der bisherigen „Qubit-Chips“ entspricht genau der Resonanzmessung an einem physischen
  Schwingungsprüfstand. „Qubit-Chip“ → „Weiterer Sensor“, Button „Berechnen“ → „Messung starten“,
  Stat „Überlagerung“ → „Resonanz“, Icon ⚛️ → 📳. Betrifft Panel, Projekte P50/P51, die
  Demontage-Stufe im Ende und die Textübersicht.
- Anzeigenamen zweier Spielbegriffe an die Automobilbranche angepasst (nur sichtbarer Text,
  interne Feldnamen unverändert): **„Ops“ → „Taktzyklen“** (Rechentakt der KI – passt sowohl
  zu Taktfrequenz als auch zum Bandtakt der Fertigung) und **„Reputation“ → „Ansehen“**
  (Ruf der Marke beim Aufsichtsrat). Betrifft Panels, Projektkosten, Projektbeschreibungen,
  Ticker-Meldungen und das Glossar.

### Behoben
- Die Kapitalanlage-Positionstabelle zeigte je nach Anzahl offener Positionen 0 bis 5 Zeilen,
  wodurch das ganze Panel bei jedem Kauf/Verkauf sichtbar in der Höhe sprang. Sie rendert jetzt
  immer alle 5 Zeilen (leere als Platzhalter „–“), die Höhe bleibt konstant.
- Die Tabelle zitterte danach noch um ein paar Pixel: Der Browser berechnet Spaltenbreiten bei
  `table-layout: auto` (Standard) bei jeder Kursänderung neu, je nach Ziffernanzahl der Zahlen.
  Feste Spaltenbreiten über ein `<colgroup>` und `table-layout: fixed` beheben das; per
  Playwright über 6 Sekunden gemessen, die Tabelle steht jetzt exakt auf dem Pixel still.
- Spaltenlayout wirkte durch viel Leerraum unnötig scroll-lastig: Innenabstände der Panels,
  Zeilenabstände zwischen Werten und der Abstand zwischen Panels wurden verkleinert. Der
  Nachrichtenticker im Kopf zeigt jetzt 3 statt 5 Zeilen – spart oben zusätzlich Platz.
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
