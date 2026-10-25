import type { YerelMetinler } from './en'

export const de: YerelMetinler = {
  modeller: {
    'llama3.2:1b': 'Winzig und sehr schnell; reicht für kurze Fragen, Zusammenfassungen und alte Laptops.',
    'llama3.2:3b': 'Kleiner Allrounder von Meta; gute Qualität für seine Größe und läuft fast überall.',
    'qwen3:4b': 'Überraschend fähiges kleines Modell mit Denkmodus; ein toller erster Agent auf bescheidener Hardware.',
    'gemma3:4b': 'Googles kleines Modell; versteht auch Bilder, gut im Schreiben und Zusammenfassen.',
    'phi4-mini': 'Microsofts kompaktes Modell; für seine Größe stark in Logik und Mathematik.',
    'llama3.1:8b': 'Der 8B-Klassiker von Meta; zuverlässiges Allzweckmodell mit solider Tool-Nutzung.',
    'qwen3:8b': 'Eines der besten 8B-Modelle; stark bei Code, Logik und vielen Sprachen.',
    'gemma3:12b': 'Mittelgroßes Google-Modell mit Bildverständnis; schreibt sehr natürlich.',
    'qwen3:14b': 'Deutlich klüger als 8B-Modelle; der Sweet Spot für eine Grafikkarte mit 12–16 GB.',
    'gpt-oss:20b': 'Das Open-Weight-Modell von OpenAI; gute Logik und Tool-Nutzung, braucht etwa 16 GB.',
    'mistral-small:24b': 'Schnell, mehrsprachig und zuverlässig beim Befolgen von Anweisungen.',
    'gemma3:27b': 'Das größte Gemma von Google; hervorragend beim Schreiben und Bildverständnis.',
    'qwen3:30b': 'Mixture-of-Experts: Qualität eines großen Modells, aber nur 3B gleichzeitig aktiv, daher flott.',
    'qwen3:32b': 'Offenes Spitzenmodell für eine 24-GB-Karte; stark bei Code und langen Aufgaben.',
    'llama3.3:70b': 'In der Qualität nah an großen Cloud-Modellen; braucht eine Workstation oder einen Mac mit 64 GB.',
    'gpt-oss:120b': 'Das große offene Modell von OpenAI; für High-End-Rechner mit 80 GB+ Speicher.',
    'qwen2.5-coder:1.5b': 'Winziges Code-Modell; für schnelle Code-Fragen auf schwacher Hardware.',
    'qwen2.5-coder:7b': 'Sehr gutes Code-Modell für seine Größe; liest und erklärt Code gut.',
    'qwen2.5-coder:14b': 'Starker Coder, der echte Projekte bewältigt; super für einen Entwickler-Agenten.',
    'devstral:24b': 'Von Mistral für agentisches Programmieren gebaut — erkundet eine Codebasis und bearbeitet Dateien.',
    'qwen2.5-coder:32b': 'Eines der besten offenen Code-Modelle; bei Code-Aufgaben nah an Cloud-Qualität.',
    'deepseek-r1:1.5b': 'Winziges Reasoning-Modell, das Schritt für Schritt denkt; vor allem für Experimente.',
    'deepseek-r1:7b': 'Denkt vor dem Antworten nach; gut für Mathematik, Logik und Planung.',
    'deepseek-r1:14b': 'Stärkeres Schritt-für-Schritt-Denken; langsamer, aber sorgfältigere Antworten.',
    'phi4:14b': 'Microsofts auf Logik ausgerichtetes Modell; hervorragend in Mathematik und Logik.',
    'deepseek-r1:32b': 'Tiefes Nachdenken für schwierige Probleme; braucht eine 24-GB-Karte.',
    'qwen2.5vl:7b': 'Liest Screenshots, Dokumente und Diagramme; gute Texterkennung (OCR).',
    'llava:7b': 'Klassisches Bildmodell; beschreibt Bilder und beantwortet Fragen dazu.',
    'dolphin-phi:2.7b': "Kleines unzensiertes Modell auf Basis von Microsoft Phi-2; läuft auf fast jedem Computer.",
    'llama2-uncensored:7b': "Klassische unzensierte Llama-2-Feinabstimmung; antwortet direkt, ohne zu moralisieren.",
    'dolphin-mistral:7b': "Beliebtes unzensiertes Mistral 7B von Eric Hartford; gut für Chat und kreatives Schreiben.",
    'dolphin-llama3:8b': "Unzensiertes Llama 3 8B; klüger als die Llama-2-Versionen, gut bei Anweisungen und Code.",
    'dolphin3:8b': "Dolphin 3.0 auf Llama 3.1: das neueste unzensierte Allzweckmodell in dieser Liste.",
    'wizard-vicuna-uncensored:13b': "Größeres unzensiertes Chatmodell; längere, ausführlichere Antworten, braucht etwa 9 GB.",
    'dolphin-mixtral:8x7b': "Unzensiertes Mixture-of-Experts auf Mixtral; das stärkste hier, für Rechner mit 32 GB+.",
    'nomic-embed-text': 'Wandelt Text für die Suche in Vektoren um (RAG); kein Chat-Modell.',
    'mxbai-embed-large': 'Hochwertiges Embedding-Modell für semantische Suche; kein Chat-Modell.'
  },
  rehber: [
    {
      baslik: '🧠 Was ist lokale KI?',
      maddeler: [
        'Ein lokales Modell ist eine KI, die komplett auf deinem Computer läuft. Kein Konto, kein Abo und nach dem Download kein Internet nötig.',
        'Dein Code und deine Dokumente verlassen nie das Gerät — praktisch für private oder Kundenprojekte.',
        'Lokale Modelle sind kleiner als Claude oder GPT, also gib ihnen fokussierte Aufgaben: Code lesen und erklären, Reviews, Zusammenfassungen, Entwürfe.'
      ]
    },
    {
      baslik: '📏 Parameter, Größe und Speicher',
      maddeler: [
        '„8B“ bedeutet 8 Milliarden Parameter. Mehr Parameter = klüger, aber mehr Speicherbedarf und langsamer.',
        'Atrium zeigt die 4-Bit-Versionen, die Ollama standardmäßig nutzt: etwa 0,6 GB pro Milliarde Parameter.',
        'Das Modell muss in den Speicher passen. Grafikkartenspeicher (VRAM) ist am schnellsten; passt es nicht hinein, läuft der Rest auf dem Prozessor und im Arbeitsspeicher, was um ein Vielfaches langsamer ist.',
        'Auf Macs mit Apple Silicon wird der Speicher geteilt, daher können etwa 70 % des RAM für das Modell genutzt werden.'
      ]
    },
    {
      baslik: '⬇️ Installation — ein Klick',
      maddeler: [
        'Klicke auf „Ollama herunterladen & installieren“. Atrium lädt das offizielle Release von GitHub herunter und installiert es (Windows: in dein Benutzerkonto, keine Adminrechte nötig · macOS: in Programme · Linux: in Atriums Datenordner).',
        'Sobald die Engine „läuft“ anzeigt, wähle ein Modell mit „Läuft schnell“ (oder „Für dich empfohlen“) und klicke auf Herunterladen.',
        'Modelle sind große Dateien (1–40 GB). Downloads laufen im Hintergrund weiter; du kannst weiterarbeiten.'
      ]
    },
    {
      baslik: '🔗 Ein Modell mit einem Agenten verbinden',
      maddeler: [
        'Öffne eine Etage, klicke auf einen Agenten, stelle „KI-Tool“ auf Ollama und wähle dann dein Modell.',
        'Wähle ein Modell mit „Kann Agent sein“: Es kann Projektdateien mit Atriums sicheren Datei-Tools öffnen und lesen. Andere Modelle antworten nur anhand der Anweisungen und des Projektgedächtnisses.',
        'Du kannst Tools auf derselben Etage mischen — zum Beispiel Claude als Projektleiter und ein lokales Code-Modell als Entwickler.',
        'Lege unter Profil & Einstellungen → KI-Tools den „Standard für neue Agenten“ fest, damit neu eingestellte Agenten ihn nutzen.'
      ]
    },
    {
      baslik: '🔌 LM Studio und andere Server',
      maddeler: [
        'Du nutzt schon LM Studio, llama.cpp, vLLM oder eine Cloud-API? Wähle in den KI-Tools „OpenAI-kompatibel“ und gib die Adresse ein.',
        'LM Studio: Starte den lokalen Server und nutze dann http://localhost:1234/v1.',
        'Die Modellliste wird automatisch vom Server gelesen.'
      ]
    },
    {
      baslik: '💡 Tipps',
      maddeler: [
        'Die erste Antwort ist langsam, während das Modell in den Speicher geladen wird; die nächsten kommen viel schneller.',
        'Schließe speicherhungrige Apps (Browser mit vielen Tabs, Spiele), um Speicher für größere Modelle frei zu machen.',
        'Schließe am Laptop das Ladegerät an — im Akkubetrieb wird die Grafikkarte gebremst.',
        'Fang klein an: Wenn ein 4B-Modell schnell genug ist, probier die nächste Größe.'
      ]
    }
  ]
}
