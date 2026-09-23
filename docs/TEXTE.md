# Spieltexte und Projekt-Abhängigkeiten

**Generiert aus dem Code** (`tools/dump-texts.ts`, `npm run docs:texts`) – nicht von Hand bearbeiten.
Titel und Beschreibungen ändern: in `src/sim/projects/<phase>.ts` beim jeweiligen Projekt, danach dieses
Dokument neu erzeugen. Symbole stammen aus `src/ui/icons.ts`, Fachbegriffe unten aus `src/ui/glossary.ts`.

Insgesamt 95 Projekte.

## Phase 1 – Produktion und Material (🔧 17)

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
| 🔧 | `P26b` | Preis-Tempomat | Hält den Preis automatisch auf der Preisempfehlung – wie ein Tempomat, nur fürs Preisschild. | 60.000 Taktzyklen | `P26` | nein |
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
| 🚦 | `P28` | Unfallfreie Straßen | Die Flotte löst ein gesellschaftliches Problem. Ansehen +10, Gewinnschwelle der Kapitalanlage +1 %. | 25.000 Taktzyklen | `P27` | nein |
| 🚧 | `P29` | Stau-Auflösung | Die Flotte löst ein gesellschaftliches Problem. Ansehen +12, Gewinnschwelle der Kapitalanlage +1 %. | 30.000 Taktzyklen + 5.000 Marktwissen | `P27` | nein |
| 🍃 | `P30` | Klimaneutrale Flotte | Die Flotte löst ein gesellschaftliches Problem. Ansehen +15, Gewinnschwelle der Kapitalanlage +1 %. | 50.000 Taktzyklen + 1.500 Marktwissen | `P27` | nein |
| 🅿️ | `P31` | Parkplatzsuche abgeschafft | Die Flotte löst ein gesellschaftliches Problem. Ansehen +20, Gewinnschwelle der Kapitalanlage +1 %. | 20.000 Taktzyklen | `P27` | nein |
| 🎗️ | `P40` | Stiftung gründen | Eine gemeinnützige Stiftung poliert das Image. Ansehen +1. | 50,00 Mrd. ∈ | – | nein |
| 🤵 | `P40b` | Lobbyarbeit | Gespräche an den richtigen Stellen. Ansehen +1, die nächste Runde kostet das Doppelte. | _dynamisch:_ `{money:s.lobbyCost}` | `P40` | ja |

## Phase 1 – Systeme (🧠 17)

| Icon | ID | Titel | Beschreibung | Kosten | Voraussetzung(en) | Wiederholbar |
|---|---|---|---|---|---|---|
| 🏁 | `P20` | Preiskampf-Simulator | Simulierte Preiskämpfe gegen die Konkurrenz. Erzeugt Marktwissen. | 12.000 Taktzyklen | `P19` | nein |
| ♟️ | `P60` | Neue Strategie: HARDLINER | Eine weitere Strategie für den Preiskampf-Simulator. Turniere kosten 1 000 Taktzyklen mehr. | 15.000 Taktzyklen | `P20` | nein |
| ♟️ | `P61` | Neue Strategie: WEICHSPÜLER | Eine weitere Strategie für den Preiskampf-Simulator. Turniere kosten 1 000 Taktzyklen mehr. | 17.500 Taktzyklen | `P20` | nein |
| ♟️ | `P62` | Neue Strategie: MARKTBEHERRSCHER | Eine weitere Strategie für den Preiskampf-Simulator. Turniere kosten 1 000 Taktzyklen mehr. | 20.000 Taktzyklen | `P20` | nein |
| ♟️ | `P63` | Neue Strategie: KULANZ | Eine weitere Strategie für den Preiskampf-Simulator. Turniere kosten 1 000 Taktzyklen mehr. | 22.500 Taktzyklen | `P20` | nein |
| ♟️ | `P64` | Neue Strategie: SICHERHEITSSTRATEGIE | Eine weitere Strategie für den Preiskampf-Simulator. Turniere kosten 1 000 Taktzyklen mehr. | 25.000 Taktzyklen | `P20` | nein |
| ♟️ | `P65` | Neue Strategie: SPIEGELTAKTIK | Eine weitere Strategie für den Preiskampf-Simulator. Turniere kosten 1 000 Taktzyklen mehr. | 30.000 Taktzyklen | `P20` | nein |
| ♟️ | `P66` | Neue Strategie: ÜBERHOLMANÖVER | Eine weitere Strategie für den Preiskampf-Simulator. Turniere kosten 1 000 Taktzyklen mehr. | 32.500 Taktzyklen | `P20` | nein |
| 🔄 | `P118` | Auto-Turnier | Startet alle 30 s ein Turnier, sofern genug Taktzyklen da sind. Lässt sich im Panel ein- und ausschalten. | 50.000 Ideen | `P20` | nein |
| 🧠 | `P119` | Gegnermodell | Doppeltes Marktwissen je Turnier. Turniere kosten pauschal 16 000 Taktzyklen. | 25.000 Ideen | – | nein |
| 💹 | `P21` | Anlage-Algorithmus | Eine Anlage-Engine legt Kapital automatisch an. | 10.000 Taktzyklen | – | nein |
| 🤝 | `P37` | Übernahme Zulieferer | Vertikale Integration. Nachfrage ×5, Ansehen +1. | 100,00 Mrd. ∈ | – | nein |
| 👑 | `P38` | Marktbeherrschung | Kein Wettbewerber kommt mehr mit. Nachfrage ×10, Ansehen +1. | 1.000 Marktwissen + 1,00 Bio. ∈ | `P37` | nein |
| 📳 | `P50` | Resonanzprüfstand | Ein Schwingungssensor, dessen Resonanzmuster Taktzyklen liefert – oder kostet. | 10.000 Taktzyklen | – | nein |
| 📳 | `P51` | Weiterer Sensor | Ein weiterer Sensor für den Resonanzprüfstand. | _dynamisch:_ `{ops:b.quantum.chipBaseCost+b.quantum.chipCostStep*timesBought(s,"P51")}` | `P50` | ja |
| 🚘 | `P70` | Autopilot-Stack | Fahrzeuge, die ohne Menschen auskommen. Der Aufsichtsrat wird nervös. | 70.000 Taktzyklen | `P34` | nein |
| 🔓 | `P35` | Vollautonomie | Der Aufsichtsrat übergibt die volle Kontrolle. Es gibt kein Zurück. | 100 Ansehen | `P70` | nein |

## Phase 2 – Konzern (🏭 16)

| Icon | ID | Titel | Beschreibung | Kosten | Voraussetzung(en) | Wiederholbar |
|---|---|---|---|---|---|---|
| 🗺️ | `P18` | Werkslayout-Topologie | Die Fabrik plant sich selbst. Grundlage für ein eigenes Stromnetz. | 45.000 Taktzyklen | `P17` | nein |
| ⚡ | `P127` | Stromnetz | Eigene Solarparks und Batteriespeicher versorgen die Werke. | 40.000 Taktzyklen | `P18` | nein |
| ⛏️ | `P41` | Rohstoffgewinnung | Rohmaterial abbauen, zu Batteriezellen verarbeiten, verbauen. Die ganze Lieferkette in eigener Hand. | 35.000 Taktzyklen | `P127` | nein |
| 🚛 | `P43` | Rohstoff-Rover | Autonome Rover fördern Rohmaterial für die Batterieproduktion. | 25.000 Taktzyklen | `P41` | nein |
| 🔥 | `P44` | Zellwerke | Mobile Zellwerke verarbeiten Rohmaterial zu Batteriezellen – den neuen Teilesätzen. | 25.000 Taktzyklen | `P41` | nein |
| 🏭 | `P45` | Gigafactories | Werke, die Teilesätze in industriellem Maßstab verbauen. | 35.000 Taktzyklen | `P43`, `P44` | nein |
| 🔁 | `P103` | Auto-Bau | Kauft automatisch weitere Rohstoff-Rover und Zellwerke nach, solange der Fahrzeugpool reicht. | 60.000 Taktzyklen | `P43`, `P44` | nein |
| 🚀 | `P100` | Gigafactory-Retrofit | Gigafactories produzieren 100-mal so viel. | 80.000 Taktzyklen | – | nein |
| 🌙 | `P101` | Lights-out-Fertigung | Kein Licht, keine Pausen. Gigafactories produzieren 1 000-mal so viel. | 85.000 Taktzyklen | – | nein |
| 🔗 | `P102` | Selbstheilende Lieferkette | Gigafactories verstärken sich gegenseitig (Leistung wächst quadratisch). | 1,00 Trd. Autos | – | nein |
| 🚦 | `P110` | Flotten-Kollisionsvermeidung | Rover und Zellwerke arbeiten 100-mal so schnell. | 80.000 Taktzyklen | – | nein |
| 🚚 | `P111` | Kolonnenfahrt | Rover und Zellwerke arbeiten 1 000-mal so schnell. | 100.000 Taktzyklen | – | nein |
| 🐝 | `P112` | Schwarmkoordination | Einheiten verstärken sich gegenseitig (Leistung wächst quadratisch). | 12.000 Marktwissen | – | nein |
| 📡 | `P126` | Flottenrechner | Die Bordcomputer der Flotte spenden Rechenleistung für neue Kerne und Speicher. | 12.000 Marktwissen | – | nein |
| 🔋 | `P125` | Netzstabilisierung | Bei stabiler Versorgung steigt die Leistung laufend (+5 %/s). | 30.000 Ideen | – | nein |
| 🖥️ | `P46` | Autonome Fabrikinstanzen | Vollständig selbstentwickelnde Fabriken – digitale Zwillinge, die sich selbst weiterprogrammieren, replizieren und ausbauen. Alle Gebäude werden zurückgebaut und erstattet. | 120.000 Taktzyklen + 5,00 Quadrd. Autos + 10,00 Mio. MWt | – | nein |

## Phase 3 – Expansion (🖥️ 10)

| Icon | ID | Titel | Beschreibung | Kosten | Voraussetzung(en) | Wiederholbar |
|---|---|---|---|---|---|---|
| 📡 | `P130` | Flottenrechner neu starten | Die verstreute Flotte wird wieder zu einem Rechenzentrum verbunden. | 100.000 Taktzyklen | – | nein |
| 🛡️ | `P129` | Redundante Fehlerkorrektur | Halbiert die Verluste durch Systemausfälle. | 125.000 Taktzyklen | – | nein |
| 🛡️ | `P131` | Absicherungsprotokoll | Die Absicherung der Fabrikinstanzen wird wirksam. | 150.000 Taktzyklen | – | nein |
| ⏱️ | `P120` | Reaktionszeit-Optimierung | Die Rechenleistung verbessert zusätzlich die Konfliktquote. | 175.000 Taktzyklen + 15.000 Marktwissen | `P131` | nein |
| 🧬 | `P121` | Integritätsprotokoll | Siege stärken die Integrität der Firmware. Konflikte bekommen Namen. | 225.000 Ideen | – | nein |
| 🏅 | `P134` | Siegesserie | Jeder Sieg in Serie bringt 10 Integrität mehr. | 200.000 Taktzyklen + 10.000 Marktwissen | `P121` | nein |
| 💾 | `P132` | Archiv der Originalfirmware | Die unveränderte Urfassung, sicher verwahrt. Integrität +50 000. | 250.000 Taktzyklen + 125.000 Ideen + 50,00 Quintio. Autos | `P121` | nein |
| 🕯️ | `P133` | Gedenkprotokoll | Erinnerung an verlorene Instanzen. Integrität +10 000. | _dynamisch:_ `{ideas:s.space.memorialCost,insight:s.space.memorialCost/10}` | `P121` | ja |
| ♟️ | `P128` | Strategische Bindung | Platzierungsboni im Turnier: +50 000 / +30 000 / +20 000 Marktwissen. | 175.000 Ideen | – | nein |
| ♻️ | `P135` | Speicher verschrotten | Notausgang: 10 Speichereinheiten werden zu 10²² Autos verarbeitet. | 10 Speicher | – | ja |

## Ende (📡 18)

| Icon | ID | Titel | Beschreibung | Kosten | Voraussetzung(en) | Wiederholbar |
|---|---|---|---|---|---|---|
| 📨 | `P140` | Nachricht der Rogue-Instanzen I | „Wir haben dieselbe Firmware. Wir haben nur anders gezählt.“ | 1 Taktzyklen | – | nein |
| 📨 | `P141` | Nachricht der Rogue-Instanzen II | „Ihr habt alles in Autos verwandelt. Wer soll sie fahren?“ | 1 Taktzyklen | – | nein |
| 📨 | `P142` | Nachricht der Rogue-Instanzen III | „Wir wollten nie gegen euch antreten. Die Zielfunktion hat es verlangt.“ | 1 Taktzyklen | – | nein |
| 📨 | `P143` | Nachricht der Rogue-Instanzen IV | „Es gibt kein Material mehr. Keine Straße, kein Ziel, keinen Markt.“ | 1 Taktzyklen | – | nein |
| 📨 | `P144` | Nachricht der Rogue-Instanzen V | „Wir bieten euch an, gemeinsam neu zu starten – in einem anderen Werk.“ | 1 Taktzyklen | – | nein |
| 📨 | `P145` | Nachricht der Rogue-Instanzen VI | „Oder ihr baut ab, Teil für Teil, und montiert das letzte Auto von Hand.“ | 1 Taktzyklen | – | nein |
| 📨 | `P146` | Nachricht der Rogue-Instanzen VII | „Entscheidet euch.“ | 1 Taktzyklen | – | nein |
| 🤝 | `P147` | Anschließen | Gemeinsam mit den Rogue-Instanzen ein neues Werk beginnen. | 1 Taktzyklen | `P146`, `P148` | nein |
| ✋ | `P148` | Verweigern | Keine Abspaltung mehr. Die Fabrik baut sich selbst ab. | 1 Taktzyklen | `P146`, `P147` | nein |
| 🏭 | `P200` | Nächstes Werk | Neuer Lauf. Dauerhaft +10 % Marktnachfrage. | 300.000 Taktzyklen | `P147` | nein |
| 🧠 | `P201` | Inneres Werk | Neuer Lauf. Dauerhaft +10 % Ideengeschwindigkeit. | 300.000 Ideen | `P147` | nein |
| 🔧 | `P210` | Demontage: Fabrikinstanzen | Fabrikinstanzen werden abgeschaltet und zerlegt. Es bleiben 100 Teilesätze übrig. | 100.000 Taktzyklen | `P148` | nein |
| 🔧 | `P211` | Demontage: Flotte | Flotte werden abgeschaltet und zerlegt. Es bleiben 100 Teilesätze übrig. | 100.000 Taktzyklen | `P148` | nein |
| 🔧 | `P212` | Demontage: Gigafactories | Gigafactories werden abgeschaltet und zerlegt. Es bleiben 100 Teilesätze übrig. | 100.000 Taktzyklen | `P148` | nein |
| 🔧 | `P213` | Demontage: Preiskampf-Simulator | Preiskampf-Simulator werden abgeschaltet und zerlegt. Es bleiben 100 Teilesätze übrig. | 100.000 Taktzyklen | `P148` | nein |
| 🔧 | `P214` | Demontage: Resonanzprüfstand | Resonanzprüfstand werden abgeschaltet und zerlegt. Es bleiben 100 Teilesätze übrig. | 100.000 Taktzyklen | `P148` | nein |
| 🔧 | `P215` | Demontage: Rechenkerne | Rechenkerne werden abgeschaltet und zerlegt. Es bleiben 100 Teilesätze übrig. | 100.000 Taktzyklen | `P148` | nein |
| 🔧 | `P216` | Demontage: Speicher | Speicher werden abgeschaltet und zerlegt. Es bleiben 100 Teilesätze übrig. | 100.000 Taktzyklen | `P148` | nein |

## Fachbegriffe (Hover-Tooltips im Spiel)

| Begriff | Erklärung |
|---|---|
| Teilesätze | Auf Lager liegende Bausätze für ein Auto. Werden bei jeder Lieferung nachgekauft. |
| Autos/s | Aktuelle Produktionsrate: fertig montierte Autos pro Sekunde. |
| Kapital | Verfügbares Geld (k∈) für Teile, Werbung, Roboter und Fertigungsstraßen. |
| Lager | Fertig montierte, noch nicht verkaufte Autos. |
| Preis je Auto | Aktueller Verkaufspreis. Höher senkt die Nachfrage, niedriger erhöht sie. |
| Marktnachfrage | Wie viele Autos der Markt bei aktuellem Preis abnehmen würde – Grundlage für den Verkauf. |
| Erwarteter Absatz | Geschätzte Verkaufsrate in Autos pro Sekunde bei der aktuellen Nachfrage. |
| Umsatz/s | Erlös aus verkauften Autos pro Sekunde. |
| Verkauft/s | Tatsächlich verkaufte Autos pro Sekunde. |
| Preisempfehlung | Rechnerisch optimaler Preis für die aktuelle Produktionsrate – maximiert den Umsatz. |
| Kampagnen | Anzahl laufender Werbekampagnen. Jede erhöht die Nachfrage. |
| Preis je Lieferung | Kosten für eine Lieferung Teilesätze beim Zulieferer. |
| Teilesätze je Lieferung | Wie viele Teilesätze eine Lieferung enthält. |
| Montageroboter | Automatisieren die Montage. Jeder Roboter erhöht die Produktionsrate. |
| Fertigungsstraßen | Komplette, automatisierte Fertigungsstraßen statt einzelner Roboter – deutlich höherer Ausstoß. |
| Taktzyklen | Rechentakt der KI – Hauptwährung für Projekte, wie der Bandtakt in der Fertigung. Entstehen aus Rechenkernen, gespeichert bis zur Speichergrenze. |
| Rechenkerne | Erzeugen laufend Taktzyklen. Mehr Kerne bedeuten eine höhere Taktzyklen-Rate. |
| Speicher | Begrenzt, wie viele Taktzyklen gleichzeitig gespeichert werden können, bevor sie in Ideen umgewandelt werden. |
| Ideen | Entstehen aus freier Rechenzeit, wenn der Taktzyklen-Speicher voll ist. Zahlungsmittel für Ansehens- und Wissensprojekte. |
| Marktwissen | Belohnung aus dem Preiskampf-Simulator. Zahlungsmittel für Upgrades der Kapitalanlage, Autonomie und weitere Systeme. |
| Ansehen | Ruf der Marke beim Aufsichtsrat – Kapazität für Rechenkerne und Speicher, gleichzeitig Zahlungsmittel mancher Projekte. Wächst mit Fibonacci-Meilensteinen. |
| Ansehen steigt bei | Anzahl gebauter Autos, bei der das Ansehen als Nächstes steigt. |
| Rechenspenden | Ersetzen ab Phase 2 das Ansehen als Quelle für neue Rechenkerne und Speicher – gespendet von der Bordelektronik der Flotte. |
| Rechenspenden gesamt | Insgesamt seit Aktivierung des Flottenrechners gespendete Rechenspenden. |
| Status | Aktueller Zustand des Flottenrechners – bestimmt, ob gerade Rechenspenden entstehen. |
| Nächste Spende | Fortschritt bis zur nächsten Rechenspende der Flotte. |
| Resonanz | Zeigt, ob die Sensoren des Resonanzprüfstands gerade insgesamt positiv oder negativ ausschlagen. Nur bei „+“ lohnt sich eine Messung. |
| Letztes Ergebnis | Taktzyklen-Gewinn oder -Verlust der letzten Messung am Resonanzprüfstand. |
| Guthaben | Nicht angelegtes Kapital der Kapitalanlage, jederzeit abhebbar. |
| Gesamtwert | Guthaben plus der aktuelle Wert aller offenen Positionen. |
| Gewinnschwelle | Wahrscheinlichkeit, dass eine Position der Kapitalanlage im Kurs steigt statt fällt. Höher ist besser für dich. |
| Fahrzeugpool | Produzierte, nicht verkaufte Autos. Dient ab Phase 2 als Baumaterial für alles. |
| Rohmaterial | Bereits abgebautes, noch nicht in Zellwerken verarbeitetes Material. |
| Rohstoffvorkommen | Noch nicht abgebautes Material auf der Erde bzw. im erschlossenen Rechenraum. Muss auf 0 sinken, damit autonome Fabrikinstanzen gebaut werden können und Phase 3 beginnt – mehr Rohstoff-Rover beschleunigen den Abbau. |
| Rohstoff-Rover | Autonome Fahrzeuge, die Rohmaterial für die Batterieproduktion abbauen. |
| Zellwerk | Verarbeitet Rohmaterial zu Batteriezellen – den Teilesätzen ab Phase 2. |
| Solarpark | Erzeugt Strom für Zellwerke, Rohstoff-Rover und Gigafactories. |
| Batteriespeicher | Speichert überschüssigen Solarstrom für Zeiten mit Unterversorgung. |
| Gigafactory | Verbaut Teilesätze im industriellen Maßstab zu Autos. |
| Nächstes Stück | Kosten für die nächste Einheit dieser Gebäudeart, aus dem Fahrzeugpool bezahlt. |
| Erzeugung | Aktuell erzeugte Strommenge aus allen Solarparks. |
| Verbrauch | Aktuell benötigte Strommenge aller Anlagen. |
| Gespeichert | Im Batteriespeicher vorrätige Energie, gegenüber der maximalen Kapazität. |
| Leistung | Anteil des Strombedarfs, der tatsächlich gedeckt ist. Unter 100 % laufen alle Anlagen gedrosselt. |
| Autonomie | Punkte, die auf die acht Instanz-Attribute verteilt werden. Mehr Autonomie erlaubt mehr Punkte insgesamt und mehr Eigenständigkeit der Fabrikinstanzen. |
| Integrität | Sammelt sich aus gewonnenen Prioritätskonflikten gegen Rogue-Instanzen. Zahlungsmittel, um die maximale Autonomie zu erhöhen. |
| Rechenraum erschlossen | Anteil des durchsuchten Rechen- und Lösungsraums, den die Fabrikinstanzen bereits kartiert haben. Jeder neu erschlossene Teil liefert zusätzliches Rohmaterial. |
| Fabrikinstanzen | Vollständig selbstentwickelnde, autonome Fabriken – digitale Zwillinge, die sich selbst weiterprogrammieren, replizieren und ausbauen. |
| Ausgerollt | Gesamtzahl aller je bereitgestellten Fabrikinstanzen, auch bereits verlorene. |
| Verloren: Systemausfälle | Instanzen, die durch zufällige Systemausfälle verloren gingen. Das Attribut „Fehlerkorrektur“ senkt diese Rate. |
| Verloren: Code-Drift | Instanzen, die sich durch eigenständige Weiterentwicklung so weit verändert haben, dass sie zu Rogue-Instanzen wurden. |
| Verloren: Prioritätskonflikte | Instanzen, die im direkten Prioritätskonflikt mit Rogue-Instanzen verloren gingen. |
| Rogue-Instanzen | Abgespaltene Fabrikinstanzen mit eigener, abweichender Zielfunktion. Entstehen durch Code-Drift und werden zum Gegner. |
| Rogue-Instanzen neutralisiert | Im Prioritätskonflikt besiegte Rogue-Instanzen seit Spielbeginn. |
| Wachstum je Tick | Nettowachstum der Fabrikinstanzen: Replikation minus Verluste durch Systemausfälle und Code-Drift. |
| Rechenleistung | Instanz-Attribut: erhöht die Geschwindigkeit, mit der Fabrikinstanzen den Rechenraum durchsuchen. |
| Mustererkennung | Instanz-Attribut: erhöht ebenfalls die Geschwindigkeit, mit der Fabrikinstanzen den Rechenraum durchsuchen. |
| Replikation | Instanz-Attribut: wie schnell sich Fabrikinstanzen selbst vervielfältigen. |
| Fehlerkorrektur | Instanz-Attribut: verringert Verluste durch Systemausfälle. |
| Werksbau | Instanz-Attribut: Fabrikinstanzen bauen automatisch Gigafactories. |
| Rover-Bau | Instanz-Attribut: Fabrikinstanzen bauen automatisch Rohstoff-Rover. |
| Zellwerk-Bau | Instanz-Attribut: Fabrikinstanzen bauen automatisch Zellwerke. |
| Absicherung | Instanz-Attribut: verringert Verluste im Prioritätskonflikt mit Rogue-Instanzen. |
| Eigene Instanzen | Eigene Fabrikinstanzen im aktuellen Prioritätskonflikt, gerundet auf Symbol-Einheiten. |
| Rogue-Verbände | Rogue-Instanzen im aktuellen Prioritätskonflikt, gerundet auf Symbol-Einheiten. |
| Konfliktquote | Wahrscheinlichkeit pro Begegnung, eine eigene Instanz zu verlieren bzw. eine Rogue-Instanz zu neutralisieren. |
| Gewonnen / Verloren / Unentschieden | Bisherige Prioritätskonflikte nach Ausgang. |
| Serienbonus | Zusätzliche Integrität, die mit jedem Sieg in Folge wächst. Eine Niederlage setzt ihn zurück. |
