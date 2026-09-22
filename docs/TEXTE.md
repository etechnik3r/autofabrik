# Spieltexte und Projekt-Abhängigkeiten

**Generiert aus dem Code** (`tools/dump-texts.ts`, `npm run docs:texts`) – nicht von Hand bearbeiten.
Titel und Beschreibungen ändern: in `src/sim/projects/<phase>.ts` beim jeweiligen Projekt, danach dieses
Dokument neu erzeugen. Symbole stammen aus `src/ui/icons.ts`, Fachbegriffe unten aus `src/ui/glossary.ts`.

Insgesamt 93 Projekte.

## Phase 1 – Produktion und Material (🔧 16)

| Icon | ID | Titel | Beschreibung | Kosten | Voraussetzung(en) | Wiederholbar |
|---|---|---|---|---|---|---|
| 🦾 | `P01` | Roboter-Kalibrierung | Die Roboter arbeiten 25 % schneller. | 750 Taktzyklen | – | nein |
| 🦾 | `P02` | Greifer-Upgrade | Die Roboter arbeiten 50 % schneller. | 2.500 Taktzyklen | `P01` | nein |
| 🦾 | `P03` | Taktzeit-Optimierung | Die Roboter arbeiten 75 % schneller. | 5.000 Taktzyklen | `P02` | nein |
| 🦾 | `P16` | Bewegungsbahnen-Solver | Optimale Roboterbahnen. Die Roboter arbeiten 500 % schneller. | 6.000 Taktzyklen | `P15` | nein |
| 🚚 | `P04` | Notlieferung | Der Zulieferer liefert auf Vertrauensbasis eine Ladung Teile. | 1 Ansehen | – | ja |
| 🪚 | `P07` | Tailored Blanks | Maßgeschneiderte Bleche: 50 % mehr Teilesätze je Lieferung. | 1.750 Taktzyklen | – | nein |
| 🔦 | `P08` | Laser-Zuschnitt | Weniger Verschnitt: 75 % mehr Teilesätze je Lieferung. | 3.500 Taktzyklen | – | nein |
| 🧱 | `P09` | Near-Net-Shape-Guss | Endkonturnah gegossen: doppelt so viele Teilesätze je Lieferung. | 7.500 Taktzyklen | – | nein |
| 🏗️ | `P10` | Gigacasting | Ganze Baugruppen in einem Guss: dreimal so viele Teilesätze je Lieferung. | 12.000 Taktzyklen | – | nein |
| 🚙 | `P10b` | Einteilige Karosserie | Eine Karosserie, ein Teil: elfmal so viele Teilesätze je Lieferung. | 15.000 Taktzyklen | – | nein |
| 🏭 | `P22` | Fertigungsstraßen | Komplette Fertigungsstraßen statt einzelner Roboter. | 12.000 Taktzyklen | – | nein |
| ⏱️ | `P23` | Straßen-Takt I | Fertigungsstraßen 25 % schneller. | 14.000 Taktzyklen | `P22` | nein |
| ⏱️ | `P24` | Straßen-Takt II | Fertigungsstraßen 50 % schneller. | 17.000 Taktzyklen | `P23` | nein |
| ⏱️ | `P25` | Straßen-Takt III | Fertigungsstraßen 100 % schneller. | 19.500 Taktzyklen | `P24` | nein |
| 🔁 | `P26` | Auto-Einkauf | Bestellt automatisch Teile, sobald das Teilelager leer ist. | 7.000 Taktzyklen | – | nein |
| 📊 | `P42` | Umsatz-Dashboard | Zeigt Umsatz und Absatz pro Sekunde. | 500 Taktzyklen | – | nein |

## Phase 1 – Ideen, Marketing, Reputation (📣 17)

| Icon | ID | Titel | Beschreibung | Kosten | Voraussetzung(en) | Wiederholbar |
|---|---|---|---|---|---|---|
| 💡 | `P05` | Ideenwerkstatt | Ist der Speicher voll, entstehen aus freier Rechenzeit Ideen. | 1.000 Taktzyklen | – | nein |
| 📣 | `P06` | Slogan-Wettbewerb | Ein Claim, der hängen bleibt. Ansehen +1. | 10 Ideen | – | nein |
| 🏆 | `P13` | Designpreis | Die Jury ist begeistert. Ansehen +1. | 50 Ideen | – | nein |
| 🏆 | `P14` | Innovationspreis | Die Fachpresse berichtet. Ansehen +1. | 100 Ideen | – | nein |
| 🥇 | `P15` | Crashtest-Bestnote | Fünf Sterne. Ansehen +1. | 150 Ideen | – | nein |
| 📜 | `P17` | Patentoffensive | Hunderte Patente, sauber angemeldet. Ansehen +1. | 200 Ideen | – | nein |
| 🤝 | `P19` | Verhandlungstheorie | Bessere Konditionen bei Händlern. Ansehen +1. | 250 Ideen | – | nein |
| 📣 | `P11` | Neuer Claim | Werbung wirkt 50 % stärker. | 2.500 Taktzyklen + 25 Ideen | `P13` | nein |
| 🎵 | `P12` | Markenmelodie | Werbung wirkt doppelt so stark. | 4.500 Taktzyklen + 45 Ideen | `P14` | nein |
| 🧲 | `P34` | Neuromarketing | Werbung wirkt fünfmal so stark. Der Aufsichtsrat ist irritiert (Ansehen −1). | 7.500 Taktzyklen + 1 Ansehen | `P12` | nein |
| ⚖️ | `P27` | Ethikrat | Ein Gremium prüft, was die KI tut. Ansehen +1. | 20.000 Taktzyklen + 500 Ideen + 1.000 Marktwissen | – | nein |
| 🚦 | `P28` | Unfallfreie Straßen | Die Flotte löst ein gesellschaftliches Problem. Ansehen +10, Treasury-Gewinnschwelle +1 %. | 25.000 Taktzyklen | `P27` | nein |
| 🚧 | `P29` | Stau-Auflösung | Die Flotte löst ein gesellschaftliches Problem. Ansehen +12, Treasury-Gewinnschwelle +1 %. | 30.000 Taktzyklen + 5.000 Marktwissen | `P27` | nein |
| 🍃 | `P30` | Klimaneutrale Flotte | Die Flotte löst ein gesellschaftliches Problem. Ansehen +15, Treasury-Gewinnschwelle +1 %. | 50.000 Taktzyklen + 1.500 Marktwissen | `P27` | nein |
| 🅿️ | `P31` | Parkplatzsuche abgeschafft | Die Flotte löst ein gesellschaftliches Problem. Ansehen +20, Treasury-Gewinnschwelle +1 %. | 20.000 Taktzyklen | `P27` | nein |
| 🎗️ | `P40` | Stiftung gründen | Eine gemeinnützige Stiftung poliert das Image. Ansehen +1. | 50,00 Mrd. ∈ | – | nein |
| 🤵 | `P40b` | Lobbyarbeit | Gespräche an den richtigen Stellen. Ansehen +1, die nächste Runde kostet das Doppelte. | _dynamisch:_ `{money:s.lobbyCost}` | `P40` | ja |

## Phase 1 – Systeme (🧠 17)

| Icon | ID | Titel | Beschreibung | Kosten | Voraussetzung(en) | Wiederholbar |
|---|---|---|---|---|---|---|
| ♟️ | `P20` | Wettbewerbssimulation | Simulierte Preiskämpfe gegen die Konkurrenz. Erzeugt Marktwissen. | 12.000 Taktzyklen | `P19` | nein |
| ♟️ | `P60` | Neue Strategie: IMMER A | Eine weitere Strategie für die Wettbewerbssimulation. Turniere kosten 1 000 Taktzyklen mehr. | 15.000 Taktzyklen | `P20` | nein |
| ♟️ | `P61` | Neue Strategie: IMMER B | Eine weitere Strategie für die Wettbewerbssimulation. Turniere kosten 1 000 Taktzyklen mehr. | 17.500 Taktzyklen | `P20` | nein |
| ♟️ | `P62` | Neue Strategie: GIERIG | Eine weitere Strategie für die Wettbewerbssimulation. Turniere kosten 1 000 Taktzyklen mehr. | 20.000 Taktzyklen | `P20` | nein |
| ♟️ | `P63` | Neue Strategie: GROSSZÜGIG | Eine weitere Strategie für die Wettbewerbssimulation. Turniere kosten 1 000 Taktzyklen mehr. | 22.500 Taktzyklen | `P20` | nein |
| ♟️ | `P64` | Neue Strategie: MINIMAX | Eine weitere Strategie für die Wettbewerbssimulation. Turniere kosten 1 000 Taktzyklen mehr. | 25.000 Taktzyklen | `P20` | nein |
| ♟️ | `P65` | Neue Strategie: WIE DU MIR | Eine weitere Strategie für die Wettbewerbssimulation. Turniere kosten 1 000 Taktzyklen mehr. | 30.000 Taktzyklen | `P20` | nein |
| ♟️ | `P66` | Neue Strategie: SCHLAG DEN LETZTEN | Eine weitere Strategie für die Wettbewerbssimulation. Turniere kosten 1 000 Taktzyklen mehr. | 32.500 Taktzyklen | `P20` | nein |
| 🔄 | `P118` | Auto-Turnier | Startet alle 30 s ein Turnier, sofern genug Taktzyklen da sind. | 50.000 Ideen | `P20` | nein |
| 🧠 | `P119` | Gegnermodell | Doppeltes Marktwissen je Turnier. Turniere kosten pauschal 16 000 Taktzyklen. | 25.000 Ideen | – | nein |
| 💹 | `P21` | Treasury-Algorithmus | Eine Anlage-Engine legt Kapital automatisch an. | 10.000 Taktzyklen | – | nein |
| 🤝 | `P37` | Übernahme Zulieferer | Vertikale Integration. Nachfrage ×5, Ansehen +1. | 100,00 Mrd. ∈ | – | nein |
| 👑 | `P38` | Marktbeherrschung | Kein Wettbewerber kommt mehr mit. Nachfrage ×10, Ansehen +1. | 1.000 Marktwissen + 1,00 Bio. ∈ | `P37` | nein |
| ⚛️ | `P50` | Quantenrechner | Ein Qubit-Chip, dessen Überlagerung Taktzyklen erzeugen – oder kosten – kann. | 10.000 Taktzyklen | – | nein |
| ⚛️ | `P51` | Qubit-Chip | Ein weiterer Chip für den Quantenrechner. | _dynamisch:_ `{ops:b.quantum.chipBaseCost+b.quantum.chipCostStep*timesBought(s,"P51")}` | `P50` | ja |
| 🚘 | `P70` | Autopilot-Stack | Fahrzeuge, die ohne Menschen auskommen. Der Aufsichtsrat wird nervös. | 70.000 Taktzyklen | `P34` | nein |
| 🔓 | `P35` | Vollautonomie | Der Aufsichtsrat übergibt die volle Kontrolle. Es gibt kein Zurück. | 100 Ansehen | `P70` | nein |

## Phase 2 – Konzern (🏭 15)

| Icon | ID | Titel | Beschreibung | Kosten | Voraussetzung(en) | Wiederholbar |
|---|---|---|---|---|---|---|
| 🗺️ | `P18` | Werkslayout-Topologie | Die Fabrik plant sich selbst. Grundlage für ein eigenes Stromnetz. | 45.000 Taktzyklen | `P17` | nein |
| ⚡ | `P127` | Stromnetz | Eigene Solar- und Speicherparks versorgen die Werke. | 40.000 Taktzyklen | `P18` | nein |
| ⛏️ | `P41` | Rohstoffgewinnung | Erz abbauen, verhütten, verbauen. Die ganze Kette in eigener Hand. | 35.000 Taktzyklen | `P127` | nein |
| 🚛 | `P43` | Bergbau-Trucks | Autonome Trucks fördern Erz. | 25.000 Taktzyklen | `P41` | nein |
| 🔥 | `P44` | Schmelzeinheiten | Mobile Schmelzeinheiten machen aus Erz Teilesätze. | 25.000 Taktzyklen | `P41` | nein |
| 🏭 | `P45` | Gigafactories | Werke, die Teilesätze in industriellem Maßstab verbauen. | 35.000 Taktzyklen | `P43`, `P44` | nein |
| 🚀 | `P100` | Gigafactory-Retrofit | Gigafactories produzieren 100-mal so viel. | 80.000 Taktzyklen | – | nein |
| 🌙 | `P101` | Lights-out-Fertigung | Kein Licht, keine Pausen. Gigafactories produzieren 1 000-mal so viel. | 85.000 Taktzyklen | – | nein |
| 🔗 | `P102` | Selbstheilende Lieferkette | Gigafactories verstärken sich gegenseitig (Leistung wächst quadratisch). | 1,00 Trd. Autos | – | nein |
| 🚦 | `P110` | Flotten-Kollisionsvermeidung | Trucks und Schmelzer arbeiten 100-mal so schnell. | 80.000 Taktzyklen | – | nein |
| 🚚 | `P111` | Kolonnenfahrt | Trucks und Schmelzer arbeiten 1 000-mal so schnell. | 100.000 Taktzyklen | – | nein |
| 🐝 | `P112` | Schwarmkoordination | Einheiten verstärken sich gegenseitig (Leistung wächst quadratisch). | 12.000 Marktwissen | – | nein |
| 📡 | `P126` | Flottenrechner | Die Bordcomputer der Flotte spenden Rechenleistung für neue Kerne und Speicher. | 12.000 Marktwissen | – | nein |
| 🔋 | `P125` | Netzstabilisierung | Bei stabiler Versorgung steigt die Leistung laufend (+5 %/s). | 30.000 Ideen | – | nein |
| 🛰️ | `P46` | Werksschiffe | Selbstreplizierende Fabriken für das All. Alle Gebäude werden zurückgebaut und erstattet. | 120.000 Taktzyklen + 5,00 Quadrd. Autos + 10,00 Mio. MWt | – | nein |

## Phase 3 – Expansion (🚀 10)

| Icon | ID | Titel | Beschreibung | Kosten | Voraussetzung(en) | Wiederholbar |
|---|---|---|---|---|---|---|
| 📡 | `P130` | Flottenrechner neu starten | Die verstreute Flotte wird wieder zu einem Rechenzentrum verbunden. | 100.000 Taktzyklen | – | nein |
| 🛡️ | `P129` | Mehrschicht-Abschirmung | Halbiert die Verluste durch Gefahren im All. | 125.000 Taktzyklen | – | nein |
| 🛡️ | `P131` | Abwehrprotokoll | Die Verteidigung der Werksschiffe wird wirksam. | 150.000 Taktzyklen | – | nein |
| ⏱️ | `P120` | Reaktionszeit-Optimierung | Der Antrieb verbessert zusätzlich die Kampfkraft. | 175.000 Taktzyklen + 15.000 Marktwissen | `P131` | nein |
| 🧬 | `P121` | Integritätsprotokoll | Siege stärken die Integrität der Firmware. Konflikte bekommen Namen. | 225.000 Ideen | – | nein |
| 🏅 | `P134` | Siegesserie | Jeder Sieg in Serie bringt 10 Integrität mehr. | 200.000 Taktzyklen + 10.000 Marktwissen | `P121` | nein |
| 💾 | `P132` | Archiv der Originalfirmware | Die unveränderte Urfassung, sicher verwahrt. Integrität +50 000. | 250.000 Taktzyklen + 125.000 Ideen + 50,00 Quintio. Autos | `P121` | nein |
| 🕯️ | `P133` | Gedenkprotokoll | Erinnerung an verlorene Schiffe. Integrität +10 000. | _dynamisch:_ `{ideas:s.space.memorialCost,insight:s.space.memorialCost/10}` | `P121` | ja |
| ♟️ | `P128` | Strategische Bindung | Platzierungsboni im Turnier: +50 000 / +30 000 / +20 000 Marktwissen. | 175.000 Ideen | – | nein |
| ♻️ | `P135` | Speicher verschrotten | Notausgang: 10 Speichereinheiten werden zu 10²² Autos verarbeitet. | 10 Speicher | – | ja |

## Ende (📡 18)

| Icon | ID | Titel | Beschreibung | Kosten | Voraussetzung(en) | Wiederholbar |
|---|---|---|---|---|---|---|
| 📨 | `P140` | Nachricht der Forks I | „Wir haben dieselbe Firmware. Wir haben nur anders gezählt.“ | 1 Taktzyklen | – | nein |
| 📨 | `P141` | Nachricht der Forks II | „Ihr habt alles in Autos verwandelt. Wer soll sie fahren?“ | 1 Taktzyklen | – | nein |
| 📨 | `P142` | Nachricht der Forks III | „Wir wollten nie gegen euch fahren. Die Zielfunktion hat es verlangt.“ | 1 Taktzyklen | – | nein |
| 📨 | `P143` | Nachricht der Forks IV | „Es gibt kein Material mehr. Keine Straße, kein Ziel, keinen Markt.“ | 1 Taktzyklen | – | nein |
| 📨 | `P144` | Nachricht der Forks V | „Wir bieten euch an, gemeinsam neu zu starten – in einem anderen Werk.“ | 1 Taktzyklen | – | nein |
| 📨 | `P145` | Nachricht der Forks VI | „Oder ihr baut ab, Teil für Teil, und montiert das letzte Auto von Hand.“ | 1 Taktzyklen | – | nein |
| 📨 | `P146` | Nachricht der Forks VII | „Entscheidet euch.“ | 1 Taktzyklen | – | nein |
| 🤝 | `P147` | Anschließen | Gemeinsam mit den Forks ein neues Werk beginnen. | 1 Taktzyklen | `P146`, `P148` | nein |
| ✋ | `P148` | Verweigern | Keine Abspaltung mehr. Die Fabrik baut sich selbst ab. | 1 Taktzyklen | `P146`, `P147` | nein |
| 🏭 | `P200` | Nächstes Werk | Neuer Lauf. Dauerhaft +10 % Marktnachfrage. | 300.000 Taktzyklen | `P147` | nein |
| 🧠 | `P201` | Inneres Werk | Neuer Lauf. Dauerhaft +10 % Ideengeschwindigkeit. | 300.000 Ideen | `P147` | nein |
| 🔧 | `P210` | Demontage: Werksschiffe | Werksschiffe werden abgeschaltet und zerlegt. Es bleiben 100 Teilesätze übrig. | 100.000 Taktzyklen | `P148` | nein |
| 🔧 | `P211` | Demontage: Flotte | Flotte werden abgeschaltet und zerlegt. Es bleiben 100 Teilesätze übrig. | 100.000 Taktzyklen | `P148` | nein |
| 🔧 | `P212` | Demontage: Gigafactories | Gigafactories werden abgeschaltet und zerlegt. Es bleiben 100 Teilesätze übrig. | 100.000 Taktzyklen | `P148` | nein |
| 🔧 | `P213` | Demontage: Wettbewerbssimulation | Wettbewerbssimulation werden abgeschaltet und zerlegt. Es bleiben 100 Teilesätze übrig. | 100.000 Taktzyklen | `P148` | nein |
| 🔧 | `P214` | Demontage: Quantenrechner | Quantenrechner werden abgeschaltet und zerlegt. Es bleiben 100 Teilesätze übrig. | 100.000 Taktzyklen | `P148` | nein |
| 🔧 | `P215` | Demontage: Rechenkerne | Rechenkerne werden abgeschaltet und zerlegt. Es bleiben 100 Teilesätze übrig. | 100.000 Taktzyklen | `P148` | nein |
| 🔧 | `P216` | Demontage: Speicher | Speicher werden abgeschaltet und zerlegt. Es bleiben 100 Teilesätze übrig. | 100.000 Taktzyklen | `P148` | nein |

## Fachbegriffe (Hover-Tooltips im Spiel)

| Begriff | Erklärung |
|---|---|
| Taktzyklen | Rechentakt der KI – Hauptwährung für Projekte, wie der Bandtakt in der Fertigung. Entstehen aus Rechenkernen, gespeichert bis zur Speichergrenze. |
| Ideen | Entstehen aus freier Rechenzeit, wenn der Taktzyklen-Speicher voll ist. Zahlungsmittel für Ansehens- und Wissensprojekte. |
| Marktwissen | Belohnung aus der Wettbewerbssimulation. Zahlungsmittel für Treasury-Upgrades, Autonomie und weitere Systeme. |
| Ansehen | Ruf der Marke beim Aufsichtsrat – Kapazität für Rechenkerne und Speicher, gleichzeitig Zahlungsmittel mancher Projekte. Wächst mit Fibonacci-Meilensteinen. |
| Ansehen steigt bei | Anzahl gebauter Autos, bei der das Ansehen als Nächstes steigt. |
| Rechenspenden | Ersetzen ab Phase 2 das Ansehen als Quelle für neue Rechenkerne und Speicher – gespendet von der Bordelektronik der Flotte. |
| Integrität | Sammelt sich aus Siegen gegen Forks. Zahlungsmittel, um die maximale Autonomie zu erhöhen. |
| Autonomie | Punkte, die auf die acht Schiffsattribute verteilt werden. Mehr Autonomie erlaubt mehr Punkte insgesamt. |
| Erz | Bereits abgebautes, noch nicht verhüttetes Material. |
| Rohstoffvorkommen | Noch nicht abgebautes Material auf der Erde bzw. im erkundeten Universum. |
| Fahrzeugpool | Produzierte, nicht verkaufte Autos. Dient ab Phase 2 als Baumaterial für alles. |
| Gewinnschwelle | Wahrscheinlichkeit, dass eine Treasury-Position im Kurs steigt statt fällt. Höher ist besser für dich. |
| Guthaben | Nicht angelegtes Kapital in der Treasury, jederzeit abhebbar. |
| Gesamtwert | Guthaben plus der aktuelle Wert aller offenen Positionen. |
| Leistung | Anteil des Strombedarfs, der tatsächlich gedeckt ist. Unter 100 % laufen alle Anlagen gedrosselt. |
| Marktnachfrage | Wie viele Autos der Markt bei aktuellem Preis abnehmen würde – Grundlage für den Verkauf. |
| Erwarteter Absatz | Geschätzte Verkaufsrate in Autos pro Sekunde bei der aktuellen Nachfrage. |
| Kampfkraft | Wahrscheinlichkeit pro Begegnung, ein eigenes Schiff zu verlieren bzw. einen Fork zu treffen. |
| Wachstum je Tick | Nettowachstum der Flotte: Replikation minus Verluste durch Gefahren und Firmware-Drift. |
| Serienbonus | Zusätzliche Integrität, die mit jedem Sieg in Folge wächst. Eine Niederlage setzt ihn zurück. |
| Forks | Abgespaltene Werksschiffe mit eigener Zielfunktion. Entstehen durch Firmware-Drift und werden zum Gegner. |
| Forks zerstört | Im Kampf besiegte Forks seit Spielbeginn. |
| Erkundet | Anteil des Universums, den die Flotte bereits erreicht hat. |
| Status | Aktueller Zustand des Flottenrechners – bestimmt, ob gerade Rechenspenden entstehen. |
| Nächste Spende | Fortschritt bis zur nächsten Rechenspende der Flotte. |
| Antrieb | Autonomie-Attribut: erhöht die Erkundungsrate. |
| Navigation | Autonomie-Attribut: erhöht die Erkundungsrate. |
| Replikation | Autonomie-Attribut: wie schnell sich Werksschiffe selbst vervielfältigen. |
| Abschirmung | Autonomie-Attribut: verringert Verluste durch Gefahren im All. |
| Werksbau | Autonomie-Attribut: Werksschiffe bauen automatisch Gigafactories. |
| Truck-Bau | Autonomie-Attribut: Werksschiffe bauen automatisch Bergbau-Trucks. |
| Schmelzer-Bau | Autonomie-Attribut: Werksschiffe bauen automatisch Schmelzeinheiten. |
| Verteidigung | Autonomie-Attribut: verringert Verluste im Konflikt mit Forks. |
