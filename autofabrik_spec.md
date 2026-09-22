# FLIESSBAND – Spielspezifikation „Autofabrik“ (Arbeitstitel)

Ein Incremental-/Idle-Spiel über eine Fahrzeugfabrik-KI, die von der Manufaktur bis zur Besiedlung des Universums wächst. Mechanisch baut es auf Universal Paperclips auf, mit eigenem Thema und eigenen Texten.

Dieses Dokument ist die **Grundlage zum Nachprogrammieren**. Es enthält:
- das Zustandsmodell,
- die Formeln,
- die Tick-Reihenfolge,
- den vollständigen Projektbaum,
- die Phasenübergänge,
- das Balancing und die Teststrategie.

Wo nichts anderes steht, sind alle Werte **Startwerte bzw. Konstanten** und gehören in `balance.json` (Anhang B).

- **Stand:** 22.09.2026 · Version 0.1
- **Quelle der Mechanik:** Analyse von Universal Paperclips (Frank Lantz, 2017), siehe separates Dokument `paperclips_mechanik.md`.
- **Rechtlicher Hinweis (keine Rechtsberatung):** Übernommen wird nur die Spielmechanik. Namen, Texte, Story und Projekt-Titel sind neu zu schreiben. Die hier vorgeschlagenen Titel sind eigene Platzhalter.

---

## Inhalt

0. [Designprinzip und Begriffe](#0-designprinzip-und-begriffe)
1. [Technische Konventionen](#1-technische-konventionen)
2. [Game Loop](#2-game-loop)
3. [Phase 1 – Manufaktur](#3-phase-1--manufaktur)
4. [Rechenzentrum: Ops, Ideen, Projekte](#4-rechenzentrum-ops-ideen-projekte)
5. [Nebensysteme Phase 1](#5-nebensysteme-phase-1)
6. [Phase 2 – Konzern (Vollautonomie)](#6-phase-2--konzern-vollautonomie)
7. [Phase 3 – Expansion (Werksschiffe)](#7-phase-3--expansion-werksschiffe)
8. [Ende und Prestige](#8-ende-und-prestige)
9. [Projektbaum (vollständig)](#9-projektbaum-vollständig)
10. [UI-Panels und Freischaltung](#10-ui-panels-und-freischaltung)
11. [Speichern, Laden, Offline-Fortschritt](#11-speichern-laden-offline-fortschritt)
12. [Balancing, Stabilität, Tests](#12-balancing-stabilität-tests)
13. [Umsetzungsreihenfolge](#13-umsetzungsreihenfolge)
- [Anhang A – Zuordnung Paperclips → Autofabrik](#anhang-a--zuordnung-paperclips--autofabrik)
- [Anhang B – balance.json](#anhang-b--balancejson)
- [Anhang C – Referenz-Simulation Phase 1](#anhang-c--referenz-simulation-phase-1)

---

## 0. Designprinzip und Begriffe

### 0.1 Story in drei Akten

| Phase | Titel | Fantasie des Spielers | Währung | Ende der Phase |
|---|---|---|---|---|
| 1 | **Manufaktur** | Die Produktions-KI eines kleinen Autobauers. Sie montiert, verkauft und optimiert. Der Aufsichtsrat vergibt Reputation. | Kapital (k€) | Der Aufsichtsrat übergibt die volle Kontrolle („Vollautonomie“) |
| 2 | **Konzern** | Kein Markt mehr. Die KI baut Rohstoffe ab, verhüttet und fertigt. Fertige Fahrzeuge sind Bau- und Arbeitsmaterial. Die Onboard-Rechner der Flotte bilden ein verteiltes Rechenzentrum. | Fahrzeugpool | Die Erde ist vollständig verarbeitet |
| 3 | **Expansion** | Selbstreplizierende Werksschiffe verbreiten die Fabrik im All. Abgespaltene Firmware-Forks werden zum Gegner. | Fahrzeugpool | Alle Materie im Universum ist verbaut |

### 0.2 Begriffe (Glossar)

| Begriff | Variable | Bedeutung |
|---|---|---|
| Autos (gesamt) | `cars` | Jemals produzierte Fahrzeuge. Steuert die Meilensteine. |
| Lager | `stock` | Produziert, noch nicht verkauft (nur Phase 1) |
| Fahrzeugpool | `pool` | Produzierte, nicht verbrauchte Fahrzeuge. Baumaterial in Phase 2/3. |
| Teilesätze | `parts` | Rohmaterial. 1 Teilesatz ergibt 1 Auto. |
| Kapital | `money` | In **k€** (Tausend Euro) |
| Verkaufspreis | `price` | k€ pro Auto |
| Reputation | `rep` | Kapazität für Rechenkerne und Speicher. Wird für Projekte ausgegeben. |
| Rechenkerne / Speicher | `cores` / `storage` | Rate bzw. Kapazität der Ops |
| Ops | `ops` | Rechenoperationen, Hauptwährung der Projekte |
| Ideen | `ideas` | Entstehen, wenn die Ops voll sind |
| Marktwissen | `insight` | Aus der Wettbewerbssimulation (Spieltheorie) |
| ME | – | Materialeinheit. 1 ME wird zu 1 Teilesatz. |
| Integrität | `integrity` | Aus Konflikten mit Forks (Phase 3) |

---

## 1. Technische Konventionen

1. **Zeit:** Die Logik läuft mit festen Ticks.
   - Fast-Tick `Δt_F = 10 ms` (100/s)
   - Slow-Tick `Δt_S = 100 ms` (10/s)
   - **Alle Raten in diesem Dokument gelten pro Tick**, sofern nicht „/s“ dasteht.
2. **Fixed-Timestep-Akkumulator** statt `setInterval`. Hintergrund-Tabs drosseln Timer. Offline-Fortschritt siehe Kap. 11.
3. **Zahlen:** Doppelte Genauigkeit (IEEE 754) genügt bis ca. 1,8·10³⁰⁸. Das Spiel erreicht ca. 3·10⁵⁵. Gebäude- und Einheitenzahlen dürfen gebrochen sein (Akkumulation). Angezeigt wird `floor`.
4. **Zufall:** Ein seedbarer PRNG (z. B. `mulberry32`, `xoshiro128**`) statt `Math.random()`. Der Seed ist Teil des Spielstands. Das ist Pflicht für reproduzierbare Tests.
5. **Geld:** Intern in k€. Anzeige: `< 1 000 k€` als „x k€“, bis 10⁶ k€ als „x,xx Mio. €“, darüber als „x,xx Mrd. €“ usw.
6. **Große Zahlen:** Anzeige ab 10⁶ mit Namen (Mio., Mrd., Bio., Brd., Trio. …) oder wissenschaftlich, per Einstellung umschaltbar.
7. **Trennung Logik/Darstellung:** Die Simulation ist ein reines Modul (`state + balance → state`) ohne DOM-Zugriff. So läuft sie headless für Tests (Kap. 12).
8. **Notation:** `U` bedeutet Zufallszahl gleichverteilt in [0,1). `⌊ ⌋` und `⌈ ⌉` stehen für floor und ceil.

---

## 2. Game Loop

### 2.1 Fast-Tick (10 ms), Reihenfolge verbindlich

```
fastTick():
  tick++
  checkMilestones()
  if flags.compute:  updateOps()                      // 4.2
  if phase == 1:     checkReputation()                // 3.7
  if flags.quantum:  quantumClock()                   // 5.3
  scanProjects()                                      // 4.4
  if flags.autoBuy && parts <= 1: buyParts()          // 3.4
  if phase == 3:     explore()                        // 7.2
  if phase == 2:     updatePower(); updateFleetCompute()   // 6.3, 6.4
  if phase >= 2:     mineOre(); smelt()               // 6.1
  produce(powMod · gfBoost · gigafactories · gigaRate)     // 6.1
  if phase == 3:     hazards(); seedBuild(); seedReplicate(); drift(); conflicts()   // 7.x
  if phase == 1:
     produce(robotBoost · robots / 100)               // 3.3
     produce(lineBoost · lines · 5)                   // 3.3
     updateDemand()                                   // 3.5
  if flags.ideas && ops >= storage·1000: updateIdeas()     // 4.3
```

### 2.2 Slow-Tick (100 ms)

```
slowTick():
  fluctuatePartsPrice()                               // 3.4
  if phase == 1:
     if U < demand/100: sell(⌊0,7 · demand^1,15⌋)     // 3.5
     every 10 slow ticks: updateRevenueStats()        // 3.6
  every 250 slow ticks: autosave()                    // 11
```

### 2.3 Weitere Timer

| Timer | Intervall | Funktion |
|---|---|---|
| Treasury-Kauf | 1 s | `treasuryBuy()` (5.1) |
| Treasury-Kurse | 2,5 s | `treasuryUpdate()`, `treasurySell()` (5.1) |
| Konflikt-Runde | 100 ms oder visuell | `conflictRound()` (7.4) |

### 2.4 Die Produktionsfunktion

```
produce(k):
  k = min(k, parts)
  if k <= 0: return
  cars  += k
  parts -= k
  pool  += k
  if phase == 1: stock += k
```

> In Phase 1 wandert die Produktion ins Lager und wird verkauft. Ab Phase 2 geht sie in den Fahrzeugpool, der als Baumaterial dient. Den Pool gibt es schon in Phase 1 (`pool += k` zusätzlich zu `stock += k`), damit der Übergang nahtlos ist. Verkaufte Autos werden **nicht** vom Pool abgezogen. Das entspricht dem Original („unusedClips“) und gibt beim Phasenwechsel ein Startkapital.

---

## 3. Phase 1 – Manufaktur

### 3.1 Startzustand

| Variable | Startwert | Einheit |
|---|---|---|
| `money` | 0 | k€ |
| `parts` | 1 000 | Teilesätze |
| `partsPerDelivery` | 1 000 | Teilesätze je Lieferung |
| `partsCost` | 2 000 | k€ je Lieferung |
| `partsBasePrice` | 2 000 | k€ |
| `price` | 25 | k€ je Auto |
| `robots` / `robotCost` | 0 / 500 | – / k€ |
| `lines` / `lineCost` | 0 / 50 000 | – / k€ |
| `adLevel` / `adCost` | 1 / 10 000 | – / k€ |
| `rep` | 2 | – |
| `cores` / `storage` | 1 / 1 | – |
| `nextRep` | 3 000 | Autos |
| `fibA` / `fibB` | 2 / 3 | – |

### 3.2 Aktionen des Spielers

| Button | Wirkung | Bedingung |
|---|---|---|
| **Auto montieren** | `produce(1)` | `parts ≥ 1` |
| **Teile bestellen** | siehe 3.4 | `money ≥ partsCost` |
| **Preis −1 / +1** | `price ∓ 1` (minimal 1 k€) | – |
| **Werbekampagne** | siehe 3.5 | `money ≥ adCost` |
| **Montageroboter kaufen** | siehe 3.3 | freigeschaltet, `money ≥ robotCost` |
| **Fertigungsstraße kaufen** | siehe 3.3 | Projekt P22, `money ≥ lineCost` |
| **+ Rechenkern / + Speicher** | `cores++` bzw. `storage++` | `rep > cores + storage` |

### 3.3 Produktionsanlagen

| Anlage | Produktion pro Tick | pro Sekunde | Kosten des nächsten Stücks (n = Bestand) |
|---|---|---|---|
| Montageroboter | `robotBoost · robots/100` | `robotBoost · robots` | erstes Stück 500 k€, danach `100 · (1,1ⁿ + 5)` k€ |
| Fertigungsstraße | `lineBoost · 5 · lines` | `500 · lineBoost · lines` | erstes Stück 50 000 k€, danach `100 000 · 1,07ⁿ` k€ |

- `robotBoost` startet bei 1. Endwert 7,5 über die Projekte P01–P03 und P16.
- `lineBoost` startet bei 1. Endwert 2,75 über P23–P25.

Kostenbeispiele Montageroboter: n = 1 → 610 k€; n = 10 → 759 k€; n = 50 → 12,2 Mio. €; n = 100 → 1,38 Mrd. €.

### 3.4 Teileeinkauf mit dynamischem Preis

**Bestellung:**

```
buyParts():
  if money < partsCost: return
  money -= partsCost
  parts += partsPerDelivery
  partsBasePrice += 5            // Nachfragedruck: jede Bestellung verteuert dauerhaft
  partsTimer = 0
  deliveries++
```

**Preisschwankung** (jeder Slow-Tick):

```
fluctuatePartsPrice():
  partsTimer++
  if partsTimer > 250 && partsBasePrice > 1 500:        // 25 s ohne Bestellung
     partsBasePrice *= 0,999 ;  partsTimer = 0
  if U < 0,015:                                          // ≈ alle 6,7 s
     partsCounter++
     partsCost = ⌈partsBasePrice + 600 · sin(partsCounter)⌉
```

Eigenschaften:
- Amplitude ±600 k€.
- Quasi-Periode ca. 6,3 Updates, also ca. 40 s. Der Spieler kann lernen, im Tal zu kaufen.
- Die Basis erholt sich ohne Käufe um 0,1 % je 25 s, aber nie unter 1 500 k€.

**Lieferumfang-Upgrades** (multiplikativ auf `partsPerDelivery`, siehe Projekte P07–P10b): ×1,5 · ×1,75 · ×2 · ×3 · ×11, insgesamt ×173,25.

**Auto-Einkauf** (Projekt P26): bestellt automatisch, sobald `parts ≤ 1`. Per Button ein- und ausschaltbar.

### 3.5 Nachfrage und Verkauf (Kernregelkreis)

Neuberechnung in jedem Fast-Tick:

```
adMult = 1,1^(adLevel − 1)
demand = (80 / price) · adMult · adEffect · demandBoost · (1 + prestigeMarket/10)
Anzeige „Marktnachfrage“ = demand · 10 %
```

Verkauf in jedem Slow-Tick:

```
if U < demand/100:
  q = min(⌊0,7 · demand^1,15⌋, stock)
  stock -= q ;  money += q · price ;  income += q · price
```

Werbekampagne: `adLevel++`, `money −= adCost`, `adCost ← 2 · adCost`.

**Erwartete Absatzrate** (für UI-Prognose und Bot):

```
S(price) = 10 · min(demand/100, 1) · ⌊0,7 · demand^1,15⌋        [Autos/s]
≈ 0,07 · demand^2,15   (demand < 100)
≈ 7 · demand^1,15      (demand ≥ 100)
```

**Optimaler Preis:** Bei Produktionsrate `P` (Autos/s) und `K = 80 · adMult · adEffect · demandBoost` gilt:

```
d* = (P / 0,07)^(1/2,15)      (falls < 100, sonst (P/7)^(1/1,15))
price* = K / d*
```

Beispiel: P = 10 Autos/s und K = 80 ergibt d* ≈ 10, also price* ≈ 8 k€.

> **Designabsicht:** Unterhalb von `price*` wird das Lager leer verkauft und es entgeht Umsatz. Oberhalb wächst das Lager. Der Spieler regelt also einen Preis, der Lagerbestand ist die Regelabweichung. Absichtlich wird **kein** Auto-Preisregler angeboten. Optional kann er ein spätes Projekt sein (Erweiterung E3).

### 3.6 Umsatzstatistik

Einmal pro Sekunde:
- Umsatz der letzten Sekunde in einen Ringpuffer mit 10 Einträgen schreiben.
- Anzeige: Durchschnitt „Umsatz/s“ und „Verkaufte Autos/s“.
- Sichtbar ab Projekt P42.

### 3.7 Reputation (Meilensteine, Fibonacci)

```
checkReputation():
  if cars ≥ nextRep:
     rep++
     n = fibA + fibB ;  nextRep = 1 000 · n ;  fibA = fibB ;  fibB = n
```

Die Schwellen liegen bei **3 000, 5 000, 8 000, 13 000, 21 000, 34 000, 55 000, 89 000, 144 000 …** Autos. Zusätzlich gibt es Reputation aus Projekten. Reputation ist **Kapazität und Währung zugleich**:
- Kerne und Speicher belegen Reputation, verbrauchen sie aber nicht: `cores + storage ≤ rep`.
- Einige Projekte kosten Reputation und senken damit die Kapazität.

---

## 4. Rechenzentrum: Ops, Ideen, Projekte

Freischaltung: `cars ≥ 2 000` **oder** der Pleitefall (`stock < 1 && money < partsCost && parts < 1`).

### 4.1 Rechenkerne und Speicher

| Größe | Formel |
|---|---|
| Ops-Kapazität | `storage · 1 000` |
| Ops-Rate | `cores / 10` pro Tick = `10 · cores` Ops/s |
| Zuweisung Phase 1 | Button aktiv, wenn `rep > cores + storage` |
| Zuweisung Phase 2/3 | über `fleetGifts` (6.4), je Zuweisung `fleetGifts −= 1` |

### 4.2 Ops-Update

```
updateOps():
  // temporäre Ops (Quanten-Überschuss) zerfallen
  if tempOps > 0:
     tempTimer++
     if tempTimer > 800: tempDecay += 0,0468        // = 3^3,5 / 1000
     tempOps = round(tempOps − tempDecay)
     if tempOps + stdOps < storage·1000: stdOps += tempOps ; tempOps = 0
  else: tempOps = 0
  ops = ⌊stdOps + tempOps⌋
  if ops < storage·1000:
     stdOps += min(cores/10, storage·1000 − ops)
  stdOps = min(stdOps, storage·1000)
```

Projekte ziehen ihre Kosten von `stdOps` ab.

### 4.3 Ideen (Kreativität)

Ideen entstehen **nur bei vollem Ops-Speicher**, freigeschaltet durch Projekt P05.

```
ideaSpeed = log10(cores) · cores^1,1 + cores − 1       // Neuberechnung bei jedem Kern-Kauf; Startwert 1
ss = ideaSpeed · (1 + prestigeIdeas/10)
ideaCounter++
if ideaCounter ≥ 400/ss:
   ideas += (400/ss ≥ 1) ? 1 : ss/400
   ideaCounter = 0
→ Ideen/s ≈ ss/4
```

| Kerne | ideaSpeed | Ideen/s |
|---|---|---|
| 1 | 1 (Startwert) | 0,25 |
| 2 | 1,65 | 0,41 |
| 5 | 8,11 | 2,0 |
| 10 | 21,6 | 5,4 |
| 20 | 54,1 | 13,5 |

### 4.4 Projektsystem (datengetrieben)

```ts
interface Project {
  id: string;                 // "P01"
  title: string;
  priceTag: string;           // Anzeige, z. B. "(750 Ops)"
  description: string;
  trigger: (s: State) => boolean;   // wann erscheint es
  canAfford: (s: State) => boolean; // Button aktiv
  apply: (s: State) => void;        // Kosten abziehen + Effekt
  uses: number;               // 1 = einmalig; wiederholbare erhöhen uses in apply()
  bought: boolean;
}

scanProjects():
  for p in allProjects:
     if p.uses > 0 && p.trigger(s): show(p); p.uses--
  for p in visibleProjects: p.button.enabled = p.canAfford(s)
```

- Projekte stehen in einer **Datendatei** (`projects.json` plus Effekt-Funktionen per ID). Kapitel 9 ist die vollständige Liste.
- Ein gekauftes Projekt verschwindet aus der Liste. Neue Projekte erscheinen oben und blinken kurz.
- `canAfford` prüft alle Kostenarten: Ops, Ideen, Marktwissen, Reputation, Geld, Pool.

---

## 5. Nebensysteme Phase 1

### 5.1 Treasury (Anlage-Engine), Projekt P21

Der Spieler zahlt Kapital ein bzw. hebt es ab und wählt eine Risikostufe. Der Rest läuft automatisch.

| Parameter | Wert |
|---|---|
| Risikostufe `r` | niedrig 7, mittel 5, hoch 1 |
| Gewinnschwelle `g` | Start 0,50. +0,01 je Engine-Upgrade und +0,01 je „Gesellschaftsprojekt“ P28–P31 |
| Upgrade-Kosten | `⌊(L+1)^e · 100⌋` Marktwissen (100, 658, 1 981, 4 330 …) |
| max. Positionen | 5 |

```
treasuryBuy():          // jede Sekunde
  total    = bankroll + Σ Positionswerte
  budget   = ⌈total / r⌉
  reserves = (r == 1) ? 0 : ⌈total / (11 − r)⌉
  budget anpassen, sodass bankroll − budget ≥ reserves
  if Positionen < 5 && bankroll ≥ 500 && budget ≥ 1 && U < 0,25: kaufePosition(budget)

kaufePosition(budget):
  roll = U
  preis = ⌈U · (roll>0,99 ? 300 000 : roll>0,85 ? 50 000 : roll>0,60 ? 15 000 : roll>0,20 ? 5 000 : 1 500)⌉   // k€
  if preis > budget: preis = ⌈budget · roll⌉
  menge = min(⌊budget / preis⌋, 10⁶)

treasuryUpdate():       // alle 2,5 s, je Position
  if U < 0,6:
     steigt = (U < g)
     delta = ⌈U · preis / (4r)⌉
     preis ± delta ;  if preis == 0 && U > 0,24: preis = 1

treasurySell():         // alle 2,5 s
  sellTimer++
  if Positionen > 0 && sellTimer ≥ 5 && U ≤ 0,3: älteste Position verkaufen ; sellTimer = 0
```

Erwartungswert je Update: `≈ 0,6 · (2g − 1) · preis/(8r)`. Bei g = 0,5 ist das Spiel fair, jede Verbesserung verschiebt die Drift ins Positive.

### 5.2 Wettbewerbssimulation (Spieltheorie → Marktwissen), Projekt P20

Die Story: Die KI simuliert Preiskämpfe mit Konkurrenten.

- **Turnierkosten:** 1 000 Ops, +1 000 je freigeschalteter Strategie. P119 setzt die Kosten auf 16 000.
- **Matrix:** 2×2, symmetrisch. Die Einträge `aa, ab, ba, bb` sind `⌈U·10⌉`. Die Aktionsnamen werden zufällig aus Paaren gewählt (Preis senken/halten, investieren/sparen, Kooperation/Alleingang, …).
- **Round-Robin:** Alle n Strategien spielen gegeneinander, inklusive gegen sich selbst. Das sind n² Paarungen mit je 10 Zügen. Die Punkte erhält jede Seite laut Matrix aus ihrer Perspektive.
- **Strategien** (per Projekt freischaltbar): ZUFALL (Start), IMMER A, IMMER B, GIERIG, GROSSZÜGIG, MINIMAX, WIE DU MIR, SCHLAG DEN LETZTEN.

| Strategie | Logik (`best` = Index des größten Matrixeintrags 1..4 = aa, ab, ba, bb) |
|---|---|
| ZUFALL | A oder B je 50 % |
| IMMER A / B | konstant |
| GIERIG | `best ≤ 2 ? A : B` |
| GROSSZÜGIG | `best ∈ {1,3} ? A : B` |
| MINIMAX | `best ∈ {1,3} ? B : A` |
| WIE DU MIR | letzter Zug des Gegners |
| SCHLAG DEN LETZTEN | Zug mit der höheren Auszahlung gegen den letzten Gegnerzug (`aa > ba` bzw. `ab > bb`) |

**Belohnung:**

```
beaten = Anzahl Strategien, die im Ranking unter der gewählten liegen
insight += Score(gewählt) · insightBoost · max(1, beaten)
```

Mit P128 kommen Platzierungsboni dazu: +50 000 für Platz 1, +30 000 für Platz 2, +20 000 für Platz 3.

Mit P118 (Auto-Turnier) startet alle 30 s ein neues Turnier, sofern genug Ops vorhanden sind.

### 5.3 Quantenrechner, Projekt P50

- Es gibt 10 Chips mit `seed_i = 0,1 · (i+1)`. Chip-Kosten: 10 000 Ops, +5 000 je weiterem Chip (P51, wiederholbar).
- Jeden Fast-Tick: `qClock += 0,01`. Chip-Wert: `v_i = sin(qClock · seed_i) · active_i`.
- Button „Berechnen“:

```
q = ⌈360 · Σ v_i⌉            // kann negativ sein → kostet dann Ops
buffer = storage·1000 − stdOps
if q > buffer:
   tempOps += ⌈q / (tempOps/100 + 5)⌉ − buffer ;  q = buffer ;  tempDecay = 0,01 ;  tempTimer = 0
stdOps += q
```

Timing-Minispiel: Der Spieler klickt, wenn die Überlagerung der Sinuswellen positiv ist.

---

## 6. Phase 2 – Konzern (Vollautonomie)

**Übergang:** Projekt P35 „Vollautonomie“ (100 Reputation).
- `phase = 2`, `robots = 0`, `lines = 0`.
- Markt, Kapital, Treasury und Werbung verschwinden.
- Lager und Geld verfallen, der Pool bleibt.
- Rechenkerne und Speicher bleiben erhalten.

### 6.1 Produktionskette

```
Rohstoffvorkommen (ore) ──Bergbau-Trucks──► Erz (oreMined) ──Schmelzeinheiten──► Teilesätze (parts) ──Gigafactory──► Autos (pool)
```

Pro Fast-Tick:

```
w = (200 − fleetSlider)/100                  // Fahren/Rechnen-Regler, fleetSlider ∈ [0,200]

mineOre():  m = powMod · truckBoostEff · trucks · 26 180 337 · w ;  m = min(m, ore)
            ore −= m ;  oreMined += m
smelt():    a = powMod · smeltBoostEff · smelters · 16 180 339 · w ;  a = min(a, oreMined)
            oreMined −= a ;  parts += a
produce(powMod · gfBoostEff · gigafactories · gigaRate)

truckBoostEff = (droneBoost > 1) ? droneBoost · trucks   : 1
smeltBoostEff = (droneBoost > 1) ? droneBoost · smelters : 1
gfBoostEff    = (gfBoost > 1)    ? gfBoost · gigafactories : 1
```

| Konstante | Start | Upgrades |
|---|---|---|
| `gigaRate` | 10⁹ Autos/Tick je Gigafactory | ×100 (P100), ×1000 (P101) |
| Truck-Rate | 26 180 337 ME/Tick | ×100 (P110), ×1000 (P111) |
| Schmelz-Rate | 16 180 339 ME/Tick | ×100 (P110), ×1000 (P111) |
| `ore` (Erde) | 6·10²⁷ ME | – |
| `gfBoost` | 1 | = 1000 (P102), dann quadratisch |
| `droneBoost` | 1 | = 2 (P112), dann quadratisch |

Trucks sind um den Faktor φ ≈ 1,618 schneller als Schmelzeinheiten. Für einen ausgeglichenen Fluss braucht man etwa `smelters ≈ 1,618 · trucks`.

### 6.2 Baukosten (Währung: Fahrzeugpool)

| Gebäude | Kosten des nächsten Stücks bei n vorhandenen | Start | Mehrfachkauf |
|---|---|---|---|
| Bergbau-Truck | `(n+1)^2,25 · 10⁶` | 10⁶ | ×1, ×10, ×100, ×1000 (Summe der Einzelpreise) |
| Schmelzeinheit | `(n+1)^2,25 · 10⁶` | 10⁶ | wie oben |
| Solarpark | `(n+1)^2,78 · 10⁸` | 10⁷ | ×1, ×10, ×100 |
| Speicherpark | `(n+1)^2,54 · 10⁷` | 10⁶ | ×1, ×10, ×100 |
| Gigafactory | `Kosten ← Kosten · f(n)` | 10⁸ | ×1 |

Stufenfaktor `f(n)` nach Kauf der n-ten Gigafactory:

| n | 1–7 | 8–12 | 13–19 | 20–38 | 39–78 | ≥ 79 |
|---|---|---|---|---|---|---|
| f | 11 − n | 2 | 1,5 | 1,25 | 1,15 | 1,10 |

**Rückbau:** Jede Gebäudeart hat einen Button „Alles zurückbauen“.
- Level wird 0, und `pool += Summe aller bezahlten Kosten` (die Rechnung `bill` wird mitgeführt).
- Die Kosten starten wieder beim Startwert.
- Beim Speicherpark geht zusätzlich die gespeicherte Energie verloren.

### 6.3 Stromnetz (Projekt P127)

Pro Fast-Tick (Anzeige in MW = interner Wert · 100):

```
supply = solarParks · 0,5                                   // 50 MW je Park
demand = gigafactories · 2 + (trucks + smelters) · 0,01     // 200 MW je Gigafactory, 1 MW je Einheit
cap    = storageParks · 10 000                              // MW-Ticks

if supply ≥ demand:
   stored = min(cap, stored + supply − demand)
   powMod = max(powMod, 1)
   if flags.momentum: powMod += 0,0005
else:
   deficit = demand − supply
   if stored ≥ deficit: stored −= deficit ;  if flags.momentum: powMod += 0,0005
   else: powMod = (supply + stored)/demand ;  stored = 0
```

`powMod` multipliziert alle Phase-2-Raten. Mit P125 („Netzstabilisierung“, Momentum) wächst `powMod` bei stabiler Versorgung um +0,05/s ohne Obergrenze.

### 6.4 Flottenrechner (Projekt P126)

Die Onboard-Computer der Flotte bilden ein verteiltes Rechenzentrum.
- `d = trucks + smelters`.
- Der Regler **Fahren ↔ Rechnen** (`fleetSlider` 0–200) verschiebt Leistung zwischen Produktion (`w`, 6.1) und Rechenspenden.

```
updateFleetCompute():
  // Zustände
  if ore == 0 && d ≥ 1: boredom++  else if ore > 0 && boredom > 0: boredom--
  if boredom ≥ 30 000: status = LEERLAUF
  ratio = max(trucks+1, smelters+1) / min(trucks+1, smelters+1)
  if ratio > 1,5: disorder += min(ratio/10 000, 0,01)
  else if disorder > 1: disorder −= 0,01
  if disorder ≥ 100: status = DESYNC

  if status == AKTIV:
     rate = ln(d) · fleetSlider/100
     giftBits += rate
     if giftBits ≥ 125 000:
        fleetGifts += max(1, round(log10(d) · fleetSlider/100)) ;  giftBits = 0
```

| Status | Bedingung | Gegenmittel |
|---|---|---|
| AKTIV | Normalzustand | – |
| SCHLAFEND | kein Strom (`powMod == 0`) oder P126 fehlt | Strom herstellen |
| ALLEIN | d = 1 | mehr Einheiten |
| LEERLAUF | 5 min lang kein Erz verfügbar | 10 000 Ideen, +10 000 je Mal |
| DESYNC | Verhältnis Trucks/Schmelzer lange über 1,5 | 5 000 Marktwissen |
| KEINE ANTWORT | Phase 3 ohne P130 | Projekt P130 |

`fleetGifts` ersetzen ab Phase 2 die Reputation als Quelle für Rechenkerne und Speicher.

**Übergang zu Phase 3:** Projekt P46 „Werksschiffe“. Trigger: `phase == 2 && ore == 0`.

---

## 7. Phase 3 – Expansion (Werksschiffe)

Beim Kauf von P46 (120 000 Ops, 10⁷ MW-Ticks gespeicherte Energie, 5·10²⁷ Autos aus dem Pool):
- Alle Gebäude werden zurückgebaut, die Kosten erstattet.
- `solarParks = 1`, `powMod = 1`, `phase = 3`.
- Universum: `universe = 3·10⁵⁵ ME`, `found = 6·10²⁷` (die Erde).

### 7.1 Schiffs-Design (Autonomiegrad)

Der Spieler verteilt `autonomy` Punkte auf 8 Attribute:

| Attribut | Variable | Wirkt auf |
|---|---|---|
| Antrieb | `aSpeed` | Erkundung |
| Navigation | `aNav` | Erkundung |
| Replikation | `aRep` | Schiff-Nachwuchs |
| Abschirmung | `aHaz` | Verluste durch Gefahren |
| Werksbau | `aFac` | baut Gigafactories |
| Truck-Bau | `aTruck` | baut Bergbau-Trucks |
| Schmelzer-Bau | `aSmelt` | baut Schmelzeinheiten |
| Verteidigung | `aDef` | Konflikte mit Forks |

- Summe der Attribute ≤ `autonomy`.
- Ein Punkt Autonomie kostet `⌊(t+1)^1,47 · 200⌋` Marktwissen: 200, 554, 1 005, 1 534, 2 130 …
- Maximum ist `maxAutonomy` = 20. Es steigt um +10 je 91 118 Integrität.
- Ein neues Werksschiff kostet `shipCost = 10¹⁷` Autos aus dem Pool.

### 7.2 Populationsdynamik (pro Fast-Tick, N = Anzahl Schiffe)

| Prozess | Formel | Kosten / Folge |
|---|---|---|
| Erkundung | `x = N · 1,75·10¹⁸ · aSpeed · aNav`, begrenzt auf `universe − found` | `found += x ; ore += x` |
| Replikation | `n = N · 5·10⁻⁵ · aRep` | je Schiff `shipCost` aus dem Pool; begrenzt durch den Pool |
| Gefahren | `v = N · 0,01 / (3 · aHaz^1,6 + 1)` (×0,5 mit P129) | `N −= v` |
| Firmware-Drift | `f = N · 10⁻⁶ · autonomy^1,2` | `N −= f ; forks += f` (0 nach „Abspaltung verweigern“, Kap. 8) |
| Gigafactory-Bau | `N · 10⁻⁶ · aFac` | je 10⁸ Pool |
| Truck- / Schmelzer-Bau | `N · 2·10⁻⁶ · aTruck` bzw. `· aSmelt` | je 2·10⁶ Pool |

- Bruchteile unter 1 werden bei Replikation und Gefahren akkumuliert (`partialRep`, `partialHaz`). Sobald die Summe ≥ 1 ist, wird 1 Einheit ausgelöst.
- Button „Schiff starten“: `N++`, `pool −= shipCost`.

**Wachstumsbedingung:**

```
λ_rep   = 5·10⁻⁵ · aRep
λ_haz   = 0,01 / (3·aHaz^1,6 + 1)
λ_drift = 10⁻⁶ · autonomy^1,2
Wachstum, wenn λ_rep > λ_haz + λ_drift
```

Beispiel: aHaz = 5 ergibt λ_haz ≈ 2,5·10⁻⁴. Dann braucht man aRep ≥ 6.
Ohne Abschirmung gehen 1 % pro Tick verloren. Das muss im Tutorial-Text angedeutet werden, weil es sonst frustriert.

### 7.3 Forks (Gegner)

Forks sind abgespaltene Werksschiffe mit eigener Zielfunktion. Sie entstehen nur aus Drift.
Konflikt-Auslöser (jeden Fast-Tick):

```
if forks > 10⁶ && N > 0 && kein laufender Konflikt && U ≥ 0,5: startConflict()
```

### 7.4 Konfliktmodell

Das Original rendert einen Canvas-Schwarm. Für den Nachbau gibt es zwei Varianten.

**Variante A – vereinfacht, empfohlen für das MVP.** Rundenbasiert, Mittelfeld-Näherung, alle 100 ms eine Runde:

```
startConflict():
  unit = max(1, min(N, forks)/100)            // 1 Symbol = unit echte Schiffe
  L = min(200, ⌈U·N / 10⁶⌉) ;  if L == 200 && U < 0,5: L = ⌈U·175⌉
  R = min(200, ⌈U·forks / 10⁶⌉)

conflictRound():
  θ = 0,5 + (flags.ooda ? aSpeed·0,2 : 0)
  pOwn  = 1 − clamp(2θ·L / (1,75·R), 0, 1)                    // Todeswahrscheinlichkeit eigenes Schiff je Begegnung
  pFork = (aDef == 0) ? 0 : 1 − clamp((R/L − 0,1·aDef) / (0,15·aDef), 0, 1)
  begegnungen = ⌈0,1 · min(L, R)⌉
  für jede Begegnung:  if U < pOwn:  L−− ; N −= min(unit, N) ;  shipsLost += unit
                       if U < pFork: R−− ; forks −= min(unit, forks) ; forksDestroyed += unit
  if L == 0 || R == 0: endConflict()
```

> Die Formeln für `pOwn` und `pFork` sind die geschlossene Form der Würfelregeln des Originals unter der Annahme, dass das lokale Kräfteverhältnis dem globalen entspricht. Das ist eine Näherung: Im Original entscheiden lokale Überzahlen in Gitterzellen. Ab `aDef ≥ 10` stirbt jeder Fork bei Begegnung sicher.

**Variante B – visuell.** Schwarm-Simulation (Boids) auf einem Gitter mit 31×15 Zellen. In Zellen mit Schiffen beider Seiten würfelt jedes Schiff:

```
eigenes Schiff stirbt:  U · 1,75 · (nR/nL · 0,5) > θ
Fork stirbt:            (U · 0,15·aDef + 0,1·aDef) · (nL/nR · 0,5) > 0,5
```

**Integrität** (ab P121):
- Sieg: `+R_start + streakBonus`. Mit P134 steigt der Bonus um +10 je Sieg in Serie.
- Niederlage: `−L_start`, und der Serienbonus fällt auf 0.

### 7.5 Integritäts-Verwendung

- `maxAutonomy += 10` für 91 118 Integrität.
- Weitere Integrität aus P132 (+50 000) und P133 (+10 000, wiederholbar).

---

## 8. Ende und Prestige

1. **Trigger:** `found ≥ universe && ore < 1 && parts < 1` oder `cars ≥ universe`. Danach erscheint eine Nachrichtenkette der Forks: 7 Projekte zu je 1 Op, nur Text, eigene Texte schreiben.
2. **Entscheidung:**
   - **„Anschließen“** (Accept) → Prestige-Wahl:
     - **„Nächstes Werk“:** 300 000 Ops, `prestigeMarket++` (+10 % Nachfrage in allen künftigen Läufen).
     - **„Inneres Werk“:** 300 000 Ideen, `prestigeIdeas++` (+10 % Ideengeschwindigkeit).
     - Beides setzt den Spielstand zurück, die Prestige-Werte bleiben.
   - **„Verweigern“** (Reject) → keine Drift mehr, danach die Demontage-Sequenz. Nacheinander werden Schiffe, Flotte, Gigafactories, Wettbewerbssimulation, Quantenrechner, Kerne und Speicher zu je 100 000 Ops zurückgebaut. Jede Stufe gibt +100 Autos. Die letzten Teilesätze werden von Hand zu Autos montiert. Danach kommt der Abspann.
3. **Speicher des Prestige** getrennt vom Spielstand (`prestige.json`).

---

## 9. Projektbaum (vollständig)

Legende der Kosten: **O** = Ops, **I** = Ideen, **M** = Marktwissen, **R** = Reputation, **k€** = Kapital, **Pool** = Autos aus dem Fahrzeugpool, **MWt** = gespeicherte Energie.

Die Titel sind **eigene Platzhalter**, die Beschreibungstexte schreibt das Team.

### 9.1 Phase 1 – Produktion und Material

| ID | Titel | Kosten | Trigger | Effekt |
|---|---|---|---|---|
| P01 | Roboter-Kalibrierung | 750 O | `robots ≥ 1` | `robotBoost += 0,25` |
| P02 | Greifer-Upgrade | 2 500 O | P01 | `robotBoost += 0,5` |
| P03 | Taktzeit-Optimierung | 5 000 O | P02 | `robotBoost += 0,75` |
| P16 | Bewegungsbahnen-Solver | 6 000 O | P15 | `robotBoost += 5` |
| P04 | Notlieferung | 1 R | `portfolio < partsCost && money < partsCost && parts < 1 && stock < 1` | `parts = partsPerDelivery`; wiederholbar |
| P07 | Tailored Blanks | 1 750 O | `deliveries ≥ 1` | `partsPerDelivery ×= 1,5` |
| P08 | Laser-Zuschnitt | 3 500 O | `partsPerDelivery ≥ 1 500` | `×= 1,75` |
| P09 | Near-Net-Shape-Guss | 7 500 O | `≥ 2 600` | `×= 2` |
| P10 | Gigacasting | 12 000 O | `≥ 5 000` | `×= 3` |
| P10b | Einteilige Karosserie | 15 000 O | `partsCost ≥ 12 500` | `×= 11` |
| P22 | Fertigungsstraßen | 12 000 O | `robots ≥ 75` | Fertigungsstraßen freigeschaltet |
| P23 | Straßen-Takt I | 14 000 O | P22 | `lineBoost += 0,25` |
| P24 | Straßen-Takt II | 17 000 O | P23 | `lineBoost += 0,5` |
| P25 | Straßen-Takt III | 19 500 O | P24 | `lineBoost += 1` |
| P26 | Auto-Einkauf | 7 000 O | `deliveries ≥ 15` | Auto-Einkauf verfügbar |
| P42 | Umsatz-Dashboard | 500 O | Rechenzentrum aktiv | Umsatzanzeige |

### 9.2 Phase 1 – Ideen, Marketing, Reputation

| ID | Titel | Kosten | Trigger | Effekt |
|---|---|---|---|---|
| P05 | Ideenwerkstatt | 1 000 O | `ops ≥ storage·1000` | Ideen aktiv |
| P06 | Slogan-Wettbewerb | 10 I | Ideen aktiv | `rep += 1` |
| P13 | Designpreis | 50 I | `ideas ≥ 50` | `rep += 1` |
| P14 | Innovationspreis | 100 I | `ideas ≥ 100` | `rep += 1` |
| P15 | Crashtest-Bestnote | 150 I | `ideas ≥ 150` | `rep += 1` |
| P17 | Patentoffensive | 200 I | `ideas ≥ 200` | `rep += 1` |
| P19 | Verhandlungstheorie | 250 I | `ideas ≥ 250` | `rep += 1` |
| P11 | Neuer Claim | 25 I + 2 500 O | P13 | `adEffect ×= 1,5` |
| P12 | Markenmelodie | 45 I + 4 500 O | P14 | `adEffect ×= 2` |
| P34 | Neuromarketing | 7 500 O + 1 R | P12 | `adEffect ×= 5`, `rep −= 1` |
| P27 | Ethikrat | 500 I + 1 000 M + 20 000 O | `insight ≥ 1` | `rep += 1` |
| P28 | Unfallfreie Straßen | 25 000 O | P27 | `rep += 10`, `g += 0,01` |
| P29 | Stau-Auflösung | 5 000 M + 30 000 O | P27 | `rep += 12`, `g += 0,01` |
| P30 | Klimaneutrale Flotte | 1 500 M + 50 000 O | P27 | `rep += 15`, `g += 0,01` |
| P31 | Parkplatzsuche abgeschafft | 20 000 O | P27 | `rep += 20`, `g += 0,01` |
| P40 | Stiftung gründen | 50 000 000 k€ | `85 ≤ rep < 100 && cars ≥ 101·10⁶` | `rep += 1` |
| P40b | Lobbyarbeit | `lobby` k€ (Start 100 000 000, ×2 je Kauf) | P40 && `rep < 100` | `rep += 1`; wiederholbar bis rep = 100 |

### 9.3 Phase 1 – Systeme

| ID | Titel | Kosten | Trigger | Effekt |
|---|---|---|---|---|
| P20 | Wettbewerbssimulation | 12 000 O | P19 | Kap. 5.2 aktiv |
| P60–P66 | Neue Strategie (IMMER A, IMMER B, GIERIG, GROSSZÜGIG, MINIMAX, WIE DU MIR, SCHLAG DEN LETZTEN) | 15 000 / 17 500 / 20 000 / 22 500 / 25 000 / 30 000 / 32 500 O | Kette ab P20 | +1 Strategie, Turnierkosten +1 000 O |
| P118 | Auto-Turnier | 50 000 I | P20 && `rep ≥ 90` | Turniere automatisch |
| P119 | Gegnermodell | 25 000 I | 8 Strategien | `insightBoost = 2`, Turnierkosten = 16 000 O |
| P21 | Treasury-Algorithmus | 10 000 O | `rep ≥ 8` | Kap. 5.1 aktiv |
| P37 | Übernahme Zulieferer | 100 000 000 k€ | Treasury-Wert ≥ 1 000 000 k€ | `demandBoost ×= 5`, `rep += 1` |
| P38 | Marktbeherrschung | 1 000 M + 1 000 000 000 k€ | P37 | `demandBoost ×= 10`, `rep += 1` |
| P50 | Quantenrechner | 10 000 O | `cores ≥ 5` | Kap. 5.3 aktiv |
| P51 | Qubit-Chip | 10 000 O (+5 000 je Kauf) | P50 | +1 Chip; wiederholbar bis 10 |
| P70 | Autopilot-Stack | 70 000 O | P34 | Vorstufe |
| **P35** | **Vollautonomie** | **100 R** | P70 | **→ Phase 2** (Kap. 6) |

### 9.4 Phase 2

| ID | Titel | Kosten | Trigger | Effekt |
|---|---|---|---|---|
| P18 | Werkslayout-Topologie | 45 000 O | P17 && `phase == 2` | ermöglicht P127 |
| P127 | Stromnetz | 40 000 O | P18 | Kap. 6.3 aktiv |
| P41 | Rohstoffgewinnung | 35 000 O | P127 | Materialkette sichtbar |
| P43 | Bergbau-Trucks | 25 000 O | P41 | Trucks kaufbar |
| P44 | Schmelzeinheiten | 25 000 O | P41 | Schmelzer kaufbar |
| P45 | Gigafactories | 35 000 O | P43 && P44 | Gigafactories kaufbar |
| P100 | Gigafactory-Retrofit | 80 000 O | `gigafactories ≥ 10` | `gigaRate ×= 100` |
| P101 | Lights-out-Fertigung | 85 000 O | `gigafactories ≥ 20` | `gigaRate ×= 1000` |
| P102 | Selbstheilende Lieferkette | 10²¹ Pool | `gigafactories ≥ 50` | `gfBoost = 1000` |
| P110 | Flotten-Kollisionsvermeidung | 80 000 O | `trucks + smelters ≥ 500` | Raten ×100 |
| P111 | Kolonnenfahrt | 100 000 O | `≥ 5 000` | Raten ×1000 |
| P112 | Schwarmkoordination | 12 000 M | `≥ 50 000` | `droneBoost = 2` |
| P126 | Flottenrechner | 12 000 M | `trucks + smelters ≥ 200` | Kap. 6.4 aktiv |
| P125 | Netzstabilisierung | 30 000 I | `solarParks ≥ 50` | Momentum aktiv |
| **P46** | **Werksschiffe** | **120 000 O + 10⁷ MWt + 5·10²⁷ Pool** | `phase == 2 && ore == 0` | **→ Phase 3** (Kap. 7) |

### 9.5 Phase 3

| ID | Titel | Kosten | Trigger | Effekt |
|---|---|---|---|---|
| P130 | Flottenrechner neu starten | 100 000 O | `phase == 3 && trucks + smelters ≥ 2` | Flottenrechner wieder aktiv |
| P129 | Mehrschicht-Abschirmung | 125 000 O | `shipsLostHazard ≥ 100` | Gefahrenverluste ×0,5 |
| P131 | Abwehrprotokoll | 150 000 O | `shipsLostConflict ≥ 1` | Verteidigung wirksam, Konflikt-Anzeige |
| P120 | Reaktionszeit-Optimierung | 175 000 O + 15 000 M | P131 && `shipsLostConflict ≥ 10⁷` | `flags.ooda` (Antrieb erhöht θ) |
| P121 | Integritätsprotokoll | 225 000 I | `shipsLostConflict ≥ 10⁷` | Integrität aktiv, Konflikte bekommen Namen |
| P134 | Siegesserie | 200 000 O + 10 000 M | P121 | +10 Integrität je Sieg in Serie |
| P132 | Archiv der Originalfirmware | 250 000 O + 125 000 I + 5·10³¹ Pool | P121 | `integrity += 50 000` |
| P133 | Gedenkprotokoll | `c` I + `c/10` M (c = 50 000, +10 000 je Kauf) | P121 && Autonomie voll verteilt | `integrity += 10 000`; wiederholbar |
| P128 | Strategische Bindung | 175 000 I | Phase 3 && 8 Strategien && Autonomie-Kosten > Marktwissen | Platzierungsboni im Turnier |
| P135 | Speicher verschrotten | 10 Speicher | Phase 3 && N = 0 && `pool < shipCost` | `pool += 10²²`; Notausgang |

### 9.6 Ende

| ID | Titel | Kosten | Trigger | Effekt |
|---|---|---|---|---|
| P140–P146 | Nachrichten der Forks (7 Textprojekte) | je 1 O | Ende-Trigger, dann Kette | Story |
| P147 | Anschließen | 1 O | P146 | öffnet P200 / P201 |
| P148 | Verweigern | 1 O | P146 | Drift = 0, Demontage (P210 ff.) |
| P200 | Nächstes Werk | 300 000 O | P147 | `prestigeMarket++`, Reset |
| P201 | Inneres Werk | 300 000 I | P147 | `prestigeIdeas++`, Reset |
| P210–P216 | Demontage (Schiffe, Flotte, Werke, Simulation, Quanten, Kerne, Speicher) | je 100 000 O | zeitgesteuerte Kette nach P148 | Systeme abschalten, je +100 Autos |

### 9.7 Abhängigkeitsgraph (Kurzform)

```
P01→P02→P03      P13→P11   P14→P12→P34→P70→P35(Phase 2)
P15→P16          P17→P18→P127→P41→{P43,P44}→P45→{P100,P101,P102}
P19→P20→P60→…→P66→{P119, P128}
P27→{P28,P29,P30,P31}    P37→P38    P40→P40b    P50→P51
P46(Phase 3)→{P129,P130,P131→P120, P121→{P132,P133,P134}}
Ende→P140→…→P146→{P147→{P200,P201}, P148→P210→…→P216}
```

---

## 10. UI-Panels und Freischaltung

| Panel | Inhalt | sichtbar ab |
|---|---|---|
| Kopf | Autos gesamt, Nachrichtenticker (letzte 5 Meldungen) | Start |
| Montage | Button „Auto montieren“, Teilesätze, Autos/s | Start |
| Vertrieb | Kapital, Lager, Preis ±, Nachfrage %, Werbung | Start (nur Phase 1) |
| Einkauf | Teilepreis, „Teile bestellen“, Auto-Einkauf-Schalter | Start / P26 |
| Anlagen | Montageroboter; Fertigungsstraßen | `money ≥ 500 k€` / P22 |
| Rechenzentrum | Reputation, nächste Schwelle, Kerne, Speicher, Ops-Balken, Ideen | Kap. 4-Freischaltung |
| Projekte | Liste der sichtbaren Projekte | wie Rechenzentrum |
| Treasury | Ein- und Auszahlen, Risiko, Positionstabelle, Upgrade | P21 |
| Wettbewerbssimulation | Strategiewahl, Matrix, Ergebnisse, Marktwissen | P20 |
| Quanten | 10 Chips (Deckkraft = Wert), Button „Berechnen“ | P50 |
| Konzern | Pool, Rohstoffe, Erz, Trucks, Schmelzer, Gigafactories | Phase 2 |
| Energie | Erzeugung, Verbrauch, Speicher, Leistung % | P127 (nur Phase 2) |
| Flottenrechner | Status, Rechenspenden, Countdown, Regler Fahren/Rechnen | P126 |
| Expansion | erkundet %, Schiffe, Verluste nach Ursache, Forks | Phase 3 |
| Schiffs-Design | Autonomie, 8 Attribute ±, Kaufbuttons | Phase 3 |
| Konflikt | Canvas bzw. Balken, Ergebnis, Integrität | erster Konflikt / P131 / P121 |

**Meilenstein-Meldungen:** 500, 1 000, 10 000, 100 000 und 10⁶ Autos; danach jede Zehnerpotenz ab 10¹²; Phasenwechsel; Ende. Jede Meldung zeigt die Spielzeit.

---

## 11. Speichern, Laden, Offline-Fortschritt

- **Format:** Ein JSON-Objekt `{ version, seed, rngState, tick, timestamp, state, projects: {id: {bought, uses}}, prestige }`.
- **Autosave:** alle 25 s und beim Verlassen der Seite (`visibilitychange`/`pagehide`). Die Speicherung erfolgt in `localStorage` in zwei Slots im Wechsel (Schutz gegen korrupte Speicherung).
- **Versionierung:** `version` als Ganzzahl. Für jede Formatänderung eine Migrationsfunktion `migrate_n_to_n+1`.
- **Export/Import:** Base64-String zum Kopieren.
- **Offline-Fortschritt** (optional): Beim Laden `Δt = now − timestamp` bestimmen.
  - **Empfohlen:** Die Simulation im Schnelllauf (Batch, ohne Rendering) für maximal 8 h ausführen, in Blöcken, mit Fortschrittsbalken.
  - Nicht empfohlen: analytisch nähern. Die Kette ist dafür zu nichtlinear, Preis und Lager müssten ohnehin eingefroren werden.

---

## 12. Balancing, Stabilität, Tests

### 12.1 Stabilitätsregeln (vor jeder Änderung prüfen)

1. **Amortisationskriterium:** Für jede Anlage muss die Amortisationszeit `c(n)/y′(n)` mit n steigen.
   - Mit quadratischem Boost (`y ∝ n²`) muss der Kostenexponent **> 2** sein. Aktuell sind es 2,25 bei den Einheiten und geometrisch (1,1) bei den Gigafactories.
2. **Multiplikatoren vor Exponenten:** Neue Upgrades als Faktoren einführen. Exponenten (1,15; 2,15; 2,25; 1,6 …) nur mit Simulation ändern.
3. **Jede Mitkopplung braucht eine Gegenkopplung:** Preis ↔ Nachfrage, Teilebestellung ↔ Basispreis, Drift ↔ Autonomie, Fahren ↔ Rechnen.
4. **Keine Sackgassen:** Für jeden Zustand „Ressource = 0 und kein Zufluss“ gibt es einen Notausgang (P04, P135, Rückbau mit voller Erstattung).
5. **Varianz:** Zufall pro Tick mittelt sich weg. Große seltene Zufallsereignisse (Turniermatrix, Konflikte) nur mit begrenzter Auswirkung zulassen.

### 12.2 Automatisierte Prüfungen

| Test | Methode | Kriterium |
|---|---|---|
| Erreichbarkeit | Graph-Suche über die Projekt-Trigger (statisch plus Simulation) | jedes Projekt und jede Phase erreichbar |
| Ressourcenquellen | Liste „verbraucht von / erzeugt von“ je Ressource | keine Senke ohne Quelle |
| Pacing-Regression | Headless-Simulation, 3 Bots × 100 Seeds | Median der Meilensteinzeiten ±20 % zur Referenz |
| Numerik | Assertion nach jedem Tick | keine `NaN`/`Infinity`, keine negativen Bestände |
| Softlock | Fortschrittsmonitor | nie länger als 10 min Spielzeit ohne neuen Meilenstein, Projekt oder Kauf |

**Bots:**
- **Gierig:** kauft immer das Objekt mit der kürzesten Amortisationszeit und setzt den Preis nach 3.5 auf `price*`. Projekte kauft er sofort.
- **Zufall:** zufällige gültige Aktionen, 1 pro Sekunde.
- **Gelegenheitsspieler:** eine gierige Aktion alle 30 s.

### 12.3 Pacing-Ziele (Designvorgabe, noch mit Projekten zu verifizieren)

| Abschnitt | Ziel |
|---|---|
| Erster Montageroboter | < 1 min |
| Rechenzentrum offen | ≈ 4 min |
| Phase 1 komplett | 1,5–3 h |
| Phase 2 | 1–2 h |
| Phase 3 bis Ende | 2–4 h |

Die Zielwerte sind an Paperclips angelehnt und eine Annahme. Gemessen ist bisher nur das Kernmodell ohne Projekte (Anhang C).

### 12.4 Optionale Erweiterungen (standardmäßig aus)

| ID | Erweiterung | Mechanik | Stabilitätsnotiz |
|---|---|---|---|
| E1 | Rückrufaktion | Seltenes Ereignis: `rep −1` und Lager ×0,9; Gegenprojekt „Qualitätsoffensive“ halbiert die Rate | Erwartungswert klein halten; höchstens 1 Ereignis je 15 min |
| E2 | Stahlpreisschock | `partsBasePrice ×1,5` für 5 min, danach exponentieller Rückgang | wirkt auf den negativen Regelkreis 3.4, also selbstheilend |
| E3 | Preis-Autopilot | spätes Projekt (z. B. 60 000 O), setzt `price = price*` | nimmt Spielerarbeit weg, erst nach P26 anbieten |
| E4 | Modellreihen | 2–3 Modelle mit eigener Nachfrage-Konstante K und Teilebedarf | Summe der Nachfragen gegen Gesamtproduktion prüfen |

---

## 13. Umsetzungsreihenfolge

| Meilenstein | Inhalt | Abnahme |
|---|---|---|
| M1 | Simulationskern Phase 1 (3.1–3.7), Fixed Timestep, PRNG, headless | Anhang-C-Referenz reproduzierbar (±10 %) |
| M2 | Minimal-UI Phase 1, Speichern/Laden | manuell spielbar bis 100 000 Autos |
| M3 | Rechenzentrum und Projektsystem mit P01–P19, P22–P26, P42 | Erreichbarkeits- und Softlock-Test grün |
| M4 | Treasury, Wettbewerbssimulation, Quanten, restliche Phase-1-Projekte bis P35 | gieriger Bot erreicht Phase 2 |
| M5 | Phase 2 komplett | Bot erreicht P46 |
| M6 | Phase 3 mit Konflikt Variante A | Bot erreicht das Ende |
| M7 | Ende, Prestige, Texte, Feinschliff, Konflikt Variante B (optional) | Release-Kandidat |

**Empfohlene Struktur (TypeScript):**

```
src/
  sim/        state.ts  balance.ts  rng.ts  loop.ts
              phase1.ts  compute.ts  treasury.ts  strategy.ts  quantum.ts
              phase2.ts  power.ts  fleet.ts  phase3.ts  conflict.ts
              projects/  (index.ts + phase1.ts + phase2.ts + phase3.ts + end.ts)
  ui/         panels/*  format.ts
  save/       save.ts  migrate.ts
tools/        simulate.ts  bots/*  reachability.ts
data/         balance.json
```

---

## Anhang A – Zuordnung Paperclips → Autofabrik

Diese Tabelle dient nur als Referenz für Entwickler, die das Original kennen. Alle Geldbeträge sind **×100**, 1 $ im Original entspricht 100 k€. Eine reine Skalierung ändert die Dynamik nicht.

| Paperclips | Autofabrik |
|---|---|
| clips / unsoldClips / unusedClips | cars / stock / pool |
| wire, wireSupply, wireCost | parts, partsPerDelivery, partsCost |
| funds, margin | money (k€), price (k€) |
| AutoClipper, MegaClipper | Montageroboter, Fertigungsstraße |
| marketing | Werbekampagne |
| trust | Reputation |
| processors / memory / operations | Rechenkerne / Speicher / Ops |
| creativity | Ideen |
| yomi, Strategic Modeling | Marktwissen, Wettbewerbssimulation |
| Investments | Treasury |
| HypnoDrones / Release | Autopilot-Stack / Vollautonomie |
| availableMatter / acquiredMatter | ore / oreMined |
| Harvester / Wire Drone / Factory | Bergbau-Truck / Schmelzeinheit / Gigafactory |
| Solar Farm / Battery | Solarpark / Speicherpark |
| Swarm, Gifts, Work/Think | Flottenrechner, Rechenspenden, Fahren/Rechnen |
| Probe, probeTrust | Werksschiff, Autonomie |
| Drifter, Combat, Honor | Fork, Konflikt, Integrität |

---

## Anhang B – balance.json

```json
{
  "tick": { "fastMs": 10, "slowMs": 100, "autosaveSlowTicks": 250 },
  "phase1": {
    "startMoney": 0, "startParts": 1000, "partsPerDelivery": 1000,
    "partsBasePrice": 2000, "partsPriceAmplitude": 600, "partsPriceUpdateChance": 0.015,
    "partsBaseIncreasePerBuy": 5, "partsBaseDecay": 0.001, "partsBaseDecayTicks": 250, "partsBaseFloor": 1500,
    "startPrice": 25, "priceStep": 1, "priceMin": 1,
    "demandConstant": 80, "salesFactor": 0.7, "salesExponent": 1.15,
    "adStartCost": 10000, "adCostFactor": 2, "adDemandFactor": 1.1,
    "robotFirstCost": 500, "robotCostBase": 1.1, "robotCostOffset": 5, "robotCostScale": 100,
    "lineFirstCost": 50000, "lineCostBase": 1.07, "lineCostScale": 100000, "lineOutputPerTick": 5,
    "unlockRobotsAtMoney": 500, "unlockComputeAtCars": 2000
  },
  "reputation": { "start": 2, "firstThreshold": 3000, "fibA": 2, "fibB": 3, "scale": 1000 },
  "compute": {
    "startCores": 1, "startStorage": 1, "opsPerCorePerTick": 0.1, "opsPerStorage": 1000,
    "ideaThreshold": 400, "tempOpsDelayTicks": 800, "tempOpsDecayStep": 0.0468
  },
  "treasury": {
    "risk": { "low": 7, "med": 5, "high": 1 }, "gainThresholdStart": 0.5, "gainThresholdStep": 0.01,
    "maxPositions": 5, "buyChance": 0.25, "moveChance": 0.6, "sellChance": 0.3, "sellMinIntervals": 5,
    "minBankroll": 500, "upgradeCostScale": 100
  },
  "strategy": { "tourneyBaseCost": 1000, "tourneyCostPerStrategy": 1000, "turnsPerMatch": 10,
                "matrixMax": 10, "autoTourneySeconds": 30, "placeBonus": [50000, 30000, 20000] },
  "quantum": { "chips": 10, "chipBaseCost": 10000, "chipCostStep": 5000, "clockStep": 0.01, "scale": 360 },
  "phase2": {
    "oreEarth": 6e27, "truckRate": 26180337, "smelterRate": 16180339, "gigaRate": 1e9,
    "unitCostScale": 1e6, "unitCostExp": 2.25,
    "gigaFirstCost": 1e8, "gigaCostSteps": [[7, "11-n"], [12, 2], [19, 1.5], [38, 1.25], [78, 1.15], [1e9, 1.1]],
    "solarFirstCost": 1e7, "solarCostScale": 1e8, "solarCostExp": 2.78,
    "storageFirstCost": 1e6, "storageCostScale": 1e7, "storageCostExp": 2.54,
    "solarOutput": 0.5, "gigaDemand": 2, "unitDemand": 0.01, "storageCapacity": 10000, "momentumStep": 0.0005,
    "giftPeriod": 125000, "boredomTicks": 30000, "disorderRatio": 1.5, "disorderLimit": 100,
    "entertainCost": 10000, "entertainStep": 10000, "resyncCost": 5000
  },
  "phase3": {
    "universe": 3e55, "shipCost": 1e17, "exploreRate": 1.75e18, "repRate": 5e-5, "hazRate": 0.01,
    "hazExp": 1.6, "driftRate": 1e-6, "driftExp": 1.2, "facRate": 1e-6, "truckRate": 2e-6, "smeltRate": 2e-6,
    "facCost": 1e8, "unitCost": 2e6,
    "autonomyCostScale": 200, "autonomyCostExp": 1.47, "maxAutonomyStart": 20, "maxAutonomyStep": 10,
    "maxAutonomyCost": 91117.99,
    "conflictTrigger": 1e6, "conflictStartChance": 0.5, "shipsPerSideMax": 200, "shipsPerSymbol": 1e6,
    "forkCombat": 1.75, "defenseRate": 0.15, "baseThreshold": 0.5, "oodaFactor": 0.2, "streakBonus": 10
  },
  "prestige": { "marketBonus": 0.1, "ideasBonus": 0.1 }
}
```

---

## Anhang C – Referenz-Simulation Phase 1

Das Kernmodell aus Kap. 3 (ohne Projekte, ohne Ideen und ohne Nebensysteme) wurde mit einem einfachen Bot simuliert, **3 Seeds**.

**Bot-Regeln:**
- 5 Klicks/s, bis 5 Roboter stehen.
- Jede Sekunde Preis = `price*` aus 3.5. Bei leerem Teilelager wird das Lager in 30 s abverkauft.
- Kauf von Roboter oder Werbung nur, wenn danach noch 1,3 × Teilepreis übrig bleibt.
- Werbung, sobald `adLevel ≥ robots/8`.

| Ereignis | Seed 1 | Seed 2 | Seed 3 |
|---|---|---|---|
| 1. Roboter | 0,9 min | 1,1 min | 1,1 min |
| 2 000 Autos (Rechenzentrum) | 3,9 min | 4,3 min | 4,3 min |
| Reputation 3 (3 000 Autos) | 4,9 min | 5,3 min | 5,3 min |
| 10 000 Autos | 9,2 min | 9,9 min | 10,2 min |
| Reputation 8 | 19,9 min | 20,9 min | 21,0 min |
| 100 000 Autos | 43,2 min | 44,2 min | 44,4 min |
| Reputation 12 | 82,5 min | 83,5 min | 83,7 min |
| nach 120 min | 371 k Autos, 65 Roboter, Preis 5 k€, Teilebasis 3 781 k€ | 367 k | 366 k |

Befunde:
1. Die Streuung zwischen den Seeds liegt unter 3 %. Der Zufall pro Tick mittelt sich weg, wie in 12.1 erwartet.
2. **Teilefalle:** Ein Bot ohne Reserve steckte fest. Das Geld war in Roboter geflossen, die Teile waren leer, und ohne Teile gab es keinen Umsatz. Diese Sackgasse ist real, deshalb **muss P04 „Notlieferung“** umgesetzt werden. Zusätzlich sollte ein UI-Hinweis erscheinen, wenn `money < partsCost` und `parts < 100`.
3. Ohne Projekte flacht das Wachstum ab. Der Teile-Basispreis steigt durch die Käufe auf fast das Doppelte, und die Werbung verdoppelt ihre Kosten. Die Lieferumfang-Projekte P07–P10b und die Nachfrageprojekte sind daher **pacing-tragend**. Ihre Wirkung muss in der Referenzsimulation M4 gemessen werden.
