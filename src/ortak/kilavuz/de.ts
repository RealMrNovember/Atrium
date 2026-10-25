export const de = `# Atrium-Benutzerhandbuch

## Willkommen
Atrium ist dein Büro für KI-Agenten. Jedes Projekt ist eine **Etage** deines Firmengebäudes, und jeder Agent arbeitet in seinem eigenen **Raum** an seinem eigenen Schreibtisch. Du gibst dem Projektleiter einen Befehl; der Projektleiter führt das Team und liefert dir **einen** klaren Bericht. Die letzte Entscheidung liegt immer bei dir.

## Erster Start
Der Einrichtungsassistent führt dich durch sechs Schritte:
1. **Sprache** — English, Türkçe, Deutsch, Français, Italiano oder Русский. Die Agenten schreiben ihre Berichte ebenfalls in dieser Sprache.
2. **Unternehmen** — Name, Slogan, Inhaber und ein optionales Logo (es erscheint auch auf dem Dach deines Gebäudes).
3. **Projekte** — wähle den Ordner, der deine Projekte enthält. Klicke auf ein Projekt, um es ein- oder auszuschließen, oder füge Projekte aus einem beliebigen anderen Ordner hinzu.
4. **Claude** — Atrium prüft, ob Claude Code installiert und angemeldet ist. Du kannst dich hier anmelden oder einen Anthropic-API-Schlüssel verwenden (er wird verschlüsselt auf deinem Computer gespeichert).
5. **Chats** — Atrium findet deine Claude-Code-Unterhaltungen und ordnet sie nach Projekt ein.
6. **Limits** — die Ausgabenlimits pro Agent und pro Tag.

Du kannst den Assistenten jederzeit über **Profil & Einstellungen** erneut starten.

## Das Gebäude
- Die Startseite zeigt deine Firmenkarte und das Gebäude. **Klicke auf eine Etage**, um sie zu betreten.
- **Beleuchtete Fenster** bedeuten, dass auf dieser Etage jemand arbeitet: ein Atrium-Agent, ein Gast-Subagent oder ein Claude-Code-Chat, der gerade aktiv ist.
- **Etagen umsortieren**: Ziehe eine Etage in der Liste links oder nutze die Schaltflächen ▲ ▼, die erscheinen, wenn du mit der Maus darüberfährst.
- Dein **Logo** steht auf dem Dach, sobald du es hochgeladen hast.
- **Helle Fenster** bedeuten, dass gerade jemand arbeitet; **warme, gedimmte Fenster** zeigen einen Claude-Code-Chat, der in der Claude-App offen ist, aber ruht.
- Wenn du gebraucht wirst — ein Chat wartet auf deine Entscheidung oder ein Agent hat ein Problem — lehnt sich ein Agent aus dem Fenster dieser Etage, winkt und ruft dich. Klick darauf, um direkt zu diesem Chat zu springen.

## In einer Etage
Eine Etage hat acht Räume rund um einen Flur. Raum 1 gehört dem **Projektleiter** (dem mit der Krone). Das Standardteam besteht aus einem Entwickler, einem UI/UX-Designer, Test & Qualität, einem Rechercheur und einem Gedächtnis-Verwalter.
- **Klicke auf einen Agenten**, um zu sehen, was er gerade tut, sowie sein Arbeitsprotokoll und seine Stellenbeschreibung.
- **Klicke auf einen leeren Raum**, um einen neuen Agenten einzustellen.
- Sprechblasen zeigen die Live-Aktivität, z. B. \`📄 reading cart.ts\` oder \`🔎 searching "total"\`. Ein leuchtender Bildschirm bedeutet, dass der Agent arbeitet.
- Ein orangefarbener Agent mit Stern ist ein **Gast**: ein Subagent, der in einem deiner Claude-Code-Chats gestartet wurde. Eine orangefarbene **Claude**-Figur ist ein Claude-Code-Chat, der gerade aktiv ist.

## Befehle geben
1. Öffne den Tab **Befehl**, schreibe, was du möchtest, und drücke **Senden** (oder Strg+Enter).
2. Der Projektleiter liest das Projektgedächtnis und teilt die Arbeit in bis zu vier Aufgaben auf. Passt niemand, **stellt der Projektleiter einen Spezialisten ein** — der neue Agent steigt aus dem Aufzug und geht in einen leeren Raum.
3. Die Agenten gehen ins Büro des Projektleiters, um ihre Aufgabe abzuholen, kehren an ihren Schreibtisch zurück und arbeiten, und gehen dann mit einem Bericht zurück.
4. Der Projektleiter fasst alles in einem Bericht zusammen: *Zusammenfassung · Erledigt · Erkenntnisse und Risiken · Wartet auf deine Entscheidung · Nächste Schritte*.

**Dateiänderungen erlauben** ist standardmäßig aus: Das Team prüft und schlägt nur vor. Schalte es ein, wenn du Änderungen möchtest; die Agenten arbeiten dann nacheinander. **Stopp** bricht einen laufenden Befehl ab.

## Statusrunde
Du willst wissen, wo ein Projekt steht? Drücke **📋 Statusrunde** oder frage den Projektleiter einfach etwas wie *„Wie läuft das Projekt? Frag alle und gib mir einen kurzen Bericht."*
Der Projektleiter geht von Schreibtisch zu Schreibtisch, hört sich den kurzen Statusbericht jedes Agenten an (erledigt, in Arbeit, Risiken, nächste Schritte), kehrt in sein Büro zurück und gibt dir eine Zusammenfassung. Statusberichte sind schreibgeschützt und verbrauchen nur ein kleines Budget.

## Projektgedächtnis und Fokusordner
Jede Etage führt ein kurzes **Projektgedächtnis**: was das Projekt ist, sein Stack und seine Struktur, wie man es startet, deine Ziele und Entscheidungen, Dinge, auf die man achten muss, die letzte Arbeit und Erkenntnisse. Jeder Agent liest es **zuerst**, statt das ganze Projekt zu durchsuchen — das ist Atriums größte Token-Ersparnis.
- Drücke auf einer Etage **Gedächtnis extrahieren**, um es zu erstellen; drücke erneut, um es zu aktualisieren. Du kannst es auch im Tab **Gedächtnis** von Hand bearbeiten.
- Nach jedem Auftrag aktualisiert sich das Gedächtnis selbst (*Letzte Arbeit* und *Gelernt*).
- Wenn das Gedächtnis extrahiert wird, schlägt Atrium außerdem **Fokusordner** für jeden Agenten vor (z. B. der Entwickler → \`src/api\`). Die Agenten starten in ihren Fokusordnern und bleiben darin, sofern die Aufgabe nicht mehr erfordert. Du kannst sie in der Karte des Agenten ändern.

## Claude-Code-Chats
- Die Seite **Chats** listet jede Claude-Code-Unterhaltung auf deinem Computer, nach Projekt geordnet. Ein grüner Punkt bedeutet, dass der Chat gerade aktiv ist.
- Öffne einen Chat, um ihn zu lesen. Schreibe in das Feld unten, um **den Chat von Atrium aus fortzusetzen**: Claude arbeitet in diesem Projekt, du siehst seine Antworten und Schritte live, und gleichzeitig arbeitet eine Claude-Figur auf der Etage.
- Das Fortsetzen eines Chats folgt denselben Sicherheitsregeln: keine Shell-Befehle, Dateiänderungen nur, wenn du sie erlaubst.
- Chats werden nur lokal gelesen; nichts verlässt deinen Computer.

## KI-Tools
Atrium ist nicht an eine einzige KI gebunden. Jeder Agent hat sein eigenes **KI-Tool**, und verschiedene Tools können auf derselben Etage Seite an Seite arbeiten:
- **Claude Code** — der Standard; der leistungsfähigste Agent und der einzige mit Anzeige der Plan-Nutzung und Dollar-Limits.
- **OpenAI Codex CLI** — installiere es mit \`npm i -g @openai/codex\` und klicke dann unter Profil & Einstellungen → KI-Tools auf **Anmelden**.
- **Gemini CLI** — installiere es mit \`npm i -g @google/gemini-cli\`, melde dich mit Google an oder speichere einen Gemini-API-Schlüssel.
- **Ollama** — kostenlose Modelle, die auf deinem eigenen Computer laufen (siehe Lokale KI).
- **OpenAI-kompatibel** — LM Studio, llama.cpp, vLLM, OpenRouter oder die OpenAI-API: Gib die Adresse und, falls nötig, einen Schlüssel ein.

Um einen Agenten umzustellen, klicke ihn an und ändere **KI-Tool** und **Modell**. **Standard für neue Agenten** legt fest, was neu eingestellte Agenten nutzen; läuft der Projektleiter auf einem Tool außer Claude, nutzen die Agenten, die er einstellt, dasselbe Tool und Modell.

## Lokale KI
Die Seite **Lokale KI** misst deinen Computer (Prozessor, Arbeitsspeicher, Grafikkarte, freier Speicher) und zeigt, welche Modelle schnell, langsam oder gar nicht laufen.
1. Klicke auf **Ollama herunterladen & installieren** — Atrium lädt die offizielle Engine herunter und installiert sie für dich.
2. Wähle ein Modell mit **Läuft schnell** oder **Für dich empfohlen** und klicke auf **Herunterladen**.
3. Probier es im Test-Chat aus und gib es dann einem Agenten: KI-Tool **Ollama**, Modell **dein Modell**.
Modelle mit **Kann Agent sein** können Projektdateien mit Atriums sicheren Datei-Tools öffnen und lesen; andere antworten nur anhand der Anweisungen und des Projektgedächtnisses. Die Seite enthält außerdem eine kurze Anleitung zu Größen, Speicher und Tipps.

## Team
Im Tab **Team** kannst du Agenten umbenennen, ihre Stellenbeschreibungen bearbeiten, ein Modell wählen (Haiku: schnell und günstig · Sonnet: ausgewogen · Opus: am leistungsfähigsten), Webzugriff geben, Fokusordner festlegen, sie in einen anderen Raum verschieben oder entfernen. Der Projektleiter kann nicht entfernt werden.

## Berichte
Die Seite **Berichte** sammelt jeden Befehl aus jeder Etage mit dem Bericht des Projektleiters, den Einzelberichten des Teams und den Kosten.

## Kosten und Limits
- **Heute ≈ $X** sind die Kosten, die Claude Code für die heutigen Agentenläufe meldet.
  - Wenn du dich mit einem **Claude-Abonnement** (Pro / Max) angemeldet hast, ist dies eine **API-äquivalente Schätzung**: Sie wird nicht separat berechnet und zählt stattdessen auf die Nutzungslimits deines Tarifs.
  - Wenn du einen **API-Schlüssel** verwendest, sind es echte API-Ausgaben.
- **Limit** ist Atriums eigenes **tägliches Sicherheitslimit**. Agenten starten nie Arbeit, die darüber hinausgehen könnte. Wenn ein Lauf eine Zeitüberschreitung hat oder abgebrochen wird und seine Kosten nicht gelesen werden können, wird das volle Limit pro Agent angerechnet, sodass das Tageslimit nie zu niedrig gezählt wird.
- Beide Limits änderst du unter **Profil & Einstellungen → Limits und Sicherheit**.

## Mehrere Unternehmen
Führe mehr als ein Unternehmen in Atrium — zum Beispiel dein eigenes Studio und einen Kunden. Jedes Unternehmen hat **eigene Projekte, ein eigenes Team, Gedächtnis, Berichte und ein eigenes Standard-KI-Tool**.
- Öffne das Menü **▾** neben deinem Unternehmensnamen oben links, um das Unternehmen zu wechseln oder ein **Neues Unternehmen** hinzuzufügen. Ein neues Unternehmen beginnt mit dem Einrichtungsassistenten; überlegst du es dir anders, nutze im Assistenten **Zurück zu …**.
- **Profil & Einstellungen → Meine Unternehmen** listet alle auf; dort kannst du ein Unternehmen öffnen oder entfernen. Beim Entfernen werden nur Atriums Daten gelöscht (Team, Gedächtnis, Berichte) — nie deine Projektordner.
- Unter **Profil & Einstellungen → KI-Tools** stellt **Ganzes Team auf das Standard-Tool umstellen** alle Agenten des aktuellen Unternehmens auf einmal um.

## Neue Projekte und neue Chats
- Noch keine Projekte? Gib im Einrichtungsassistenten (oder mit **＋** neben *Etagen*) einen Namen ein und klicke auf **Neues Projekt** — Atrium erstellt den Ordner mit einer kurzen README. Ohne gewählten Ordner landet er in *Atrium Projects* in deinem Benutzerordner.
- In einer Etage hat der Tab **Chats** die Schaltfläche **＋ Neuer Chat**: Sie startet einen echten Claude-Code-Chat in diesem Projektordner. Er wird gespeichert, erscheint in deiner Chatliste und kann später fortgesetzt werden — in Atrium oder in Claude Code.

## Dateien an einen Befehl anhängen
Klicke unter dem Befehlsfeld auf **📎 Anhängen** oder zieh Dateien darauf — Bilder, PDFs und Textdateien, bis zu 10 Dateien mit je 10 MB. Kleine Textdateien bekommen die Agenten direkt; Bilder und PDFs öffnen die Agenten mit ihren Datei-Tools. Anhänge werden in Atriums eigenem Datenordner gespeichert, nie in deinem Projekt.

## KI-Tools mit einem Klick verbinden
- **Mit ChatGPT verbinden** (Codex), **Mit Google verbinden** (Gemini) und **Claude verbinden**: Fehlt das Tool, installiert Atrium es in seinem eigenen Ordner (ohne Administratorrechte; Node.js wird benötigt) und öffnet dann die Anmeldeseite des Tools in deinem Browser. Sobald du die Anmeldung abgeschlossen hast, springt der Status von selbst auf **Bereit**.
- Der Schritt **KI** im Einrichtungsassistenten bietet alle Tools an — verbinde eines oder mehrere.
- Die obere Leiste zeigt **eine Nutzungskarte pro verwendetem KI-Tool**: Claudes Sitzungs- und Wochenlimits (oder die heutigen Dollar mit einem API-Schlüssel), die Codex-Limits, sofern es sie meldet, die heutigen Läufe und Tokens für die anderen und *lokal · kostenlos* für Ollama.

## Support & dein Konto
Auf der Seite **🛟 Support** kannst du uns einen **Wunsch**, eine **Anfrage**, eine **Beschwerde** oder einen **Fehlerbericht** schicken und unsere Antworten direkt dort lesen (ein Badge zeigt neue Antworten).
- Zum Senden von Nachrichten brauchst du ein kostenloses, optionales Konto: E-Mail + Passwort oder **Weiter mit Google**.
- Neben einem fehlgeschlagenen Befehl findest du **🐞 Melden**; es öffnet einen Fehlerbericht mit der Fehlermeldung. Kreuze **Diagnoseinfos hinzufügen** nur an, wenn du willst — du siehst genau, was hinzugefügt wird (App-Version, System, letzte Fehler, ohne persönliche Pfade und Schlüssel).
- Du kannst dich jederzeit abmelden oder **dein Konto löschen**; dein Konto und alle deine Nachrichten werden dauerhaft gelöscht.

## Privatsphäre
- Deine Projekte, dein Code, deine Dateien, Chats, das Projektgedächtnis, Prompts, Agentenergebnisse und API-Schlüssel **verlassen nie deinen Computer**. Wir können sie weder sehen noch lesen — sie erreichen uns nie.
- KI-Anfragen gehen direkt von deinem Computer an das KI-Tool deiner Wahl (oder bleiben mit lokalen Modellen auf deinem Computer). Dazwischen gibt es keinen Atrium-Server.
- Atrium selbst geht nur ins Internet, um nach Updates und Versionshinweisen zu suchen, und — nur wenn du sie nutzt — für dein Konto und die Nachrichten, die du sendest.
- Mit einem Konto speichern wir nur deine E-Mail, deinen Namen und deine App-Version; dein Passwort wird nur als Einweg-Hash gespeichert.

## Sicherheit
- Agenten können keine \`.env\`-, Schlüssel- oder Passwortdateien lesen, keine Shell-Befehle ausführen und keine eigenen Subagenten starten.
- Agenten committen nie, pushen nie, installieren keine Pakete, schreiben niemandem und veröffentlichen nichts.
- Text von Webseiten und aus Dateien wird als Daten behandelt, nie als Anweisung.

## Simulation
Schalte **Simulation** in der oberen Leiste ein, um alles auszuprobieren — Befehle, Einstellungen, Statusrunden, Animationen — ohne Claude aufzurufen und ohne etwas auszugeben. Die Simulation schreibt nie in das Projektgedächtnis.

## Klänge
Schritte, Tastaturklicken, die Aufzugglocke, ein Einstellungs-Jingle und ein Signalton, wenn ein Bericht fertig ist. Schalte sie mit der Schaltfläche 🔊 in der oberen Leiste oder in den Einstellungen um.

## Updates
Atrium sucht beim Start und alle paar Stunden nach Updates. Wenn eine neue Version bereit ist, siehst du ein Banner — drücke **Neu starten und aktualisieren**. Du kannst auch manuell unter **Profil & Einstellungen → Updates** prüfen. Unter macOS öffnet das Update die Download-Seite.

## Fehlerbehebung
- **„Claude Code wurde nicht gefunden"** — installiere es mit \`npm install -g @anthropic-ai/claude-code\` oder lege den Pfad in den Einstellungen fest.
- **„Claude Code ist nicht angemeldet"** — öffne Einstellungen → Claude-Verbindung und drücke **Mit Claude anmelden**, dann **Erneut prüfen**.
- **„Tageslimit"** — das heutige Limit ist erreicht; erhöhe es in den Einstellungen oder warte bis morgen.
- **Eine Etage fehlt** — prüfe den Projektordner und die ausgeschlossenen Projekte in den Einstellungen und drücke dann ↻ neben *Etagen*.

## Support
Atrium ist kostenlos. Wenn es dir hilft, gib ihm bitte einen ⭐ Stern auf GitHub, teile es und melde Fehler oder Ideen in den GitHub Issues.
Made by CiciByte Technology, Inc. — cicibyte.com
`
