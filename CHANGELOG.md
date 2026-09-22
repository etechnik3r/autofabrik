# Changelog

Alle nennenswerten Änderungen an diesem Projekt werden hier dokumentiert.

Das Format orientiert sich an [Keep a Changelog](https://keepachangelog.com/de/1.0.0/),
Versionsnummern werden noch nicht vergeben (Projekt vor dem ersten Release).

## [Unveröffentlicht]

### Geändert
- Einstellungen aus dem eigenen „System“-Panel in ein Zahnrad-Menü im Kopfbereich verschoben:
  Zahlenformat, Export/Import und ein „Spielstand zurücksetzen“-Knopf mit Bestätigung
  (Prestige bleibt dabei erhalten). Der Spielstand wird weiterhin automatisch lokal im
  Browser gespeichert (localStorage, zwei Slots) und beim Öffnen fortgesetzt.

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
