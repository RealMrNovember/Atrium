import type { YerelMetinler } from './en'

export const it: YerelMetinler = {
  modeller: {
    'llama3.2:1b': 'Minuscolo e velocissimo; va bene per domande brevi, riassunti e portatili datati.',
    'llama3.2:3b': 'Piccolo tuttofare di Meta; buona qualità per le sue dimensioni e gira quasi ovunque.',
    'qwen3:4b': 'Modello piccolo sorprendentemente capace, con modalità di ragionamento; un ottimo primo agente su hardware modesto.',
    'gemma3:4b': 'Il modello piccolo di Google; capisce anche le immagini, bravo a scrivere e riassumere.',
    'phi4-mini': 'Il modello compatto di Microsoft; forte in ragionamento e matematica per le sue dimensioni.',
    'llama3.1:8b': 'Il classico 8B di Meta; modello generale affidabile con un buon uso degli strumenti.',
    'qwen3:8b': 'Uno dei migliori modelli 8B; forte in codice, ragionamento e in molte lingue.',
    'gemma3:12b': 'Modello Google di taglia media con visione; scrive in modo molto naturale.',
    'qwen3:14b': 'Decisamente più intelligente dei modelli 8B; il punto ideale per una scheda grafica da 12–16 GB.',
    'gpt-oss:20b': 'Il modello a pesi aperti di OpenAI; buon ragionamento e uso degli strumenti, richiede circa 16 GB.',
    'mistral-small:24b': 'Veloce, multilingue e affidabile nel seguire le istruzioni.',
    'gemma3:27b': 'Il Gemma più grande di Google; ottimo nella scrittura e nella comprensione delle immagini.',
    'qwen3:30b': 'Mixture-of-experts: qualità da modello grande ma solo 3B attivi alla volta, quindi è rapido.',
    'qwen3:32b': 'Modello aperto di prima fascia per una scheda da 24 GB; forte nel codice e nei compiti lunghi.',
    'llama3.3:70b': 'Vicino ai grandi modelli cloud per qualità; richiede una workstation o un Mac da 64 GB.',
    'gpt-oss:120b': 'Il grande modello aperto di OpenAI; per macchine di fascia alta con 80 GB+ di memoria.',
    'qwen2.5-coder:1.5b': 'Minuscolo modello per il codice; per domande veloci sul codice su hardware debole.',
    'qwen2.5-coder:7b': 'Ottimo modello per il codice per le sue dimensioni; legge e spiega bene il codice.',
    'qwen2.5-coder:14b': 'Programmatore solido che regge progetti veri; perfetto per un agente sviluppatore.',
    'devstral:24b': 'Creato da Mistral per la programmazione agentica — esplorare una codebase e modificare file.',
    'qwen2.5-coder:32b': 'Uno dei migliori modelli aperti per il codice; vicino alla qualità cloud nei compiti di codice.',
    'deepseek-r1:1.5b': 'Minuscolo modello di ragionamento che pensa passo dopo passo; soprattutto per esperimenti.',
    'deepseek-r1:7b': 'Pensa prima di rispondere; bravo in matematica, logica e pianificazione.',
    'deepseek-r1:14b': 'Ragionamento passo passo più solido; più lento ma con risposte più accurate.',
    'phi4:14b': 'Il modello di Microsoft orientato al ragionamento; eccellente in matematica e logica.',
    'deepseek-r1:32b': 'Ragionamento profondo per problemi difficili; richiede una scheda da 24 GB.',
    'qwen2.5vl:7b': 'Legge screenshot, documenti e grafici; buon riconoscimento del testo (OCR).',
    'llava:7b': 'Classico modello per immagini; descrive le foto e risponde a domande su di esse.',
    'nomic-embed-text': 'Trasforma il testo in vettori per la ricerca (RAG); non è un modello di chat.',
    'mxbai-embed-large': 'Modello di embedding di alta qualità per la ricerca semantica; non è un modello di chat.'
  },
  rehber: [
    {
      baslik: '🧠 Cos’è l’IA locale?',
      maddeler: [
        'Un modello locale è un’IA che gira interamente sul tuo computer. Niente account, niente abbonamento, niente internet una volta scaricato.',
        'Il tuo codice e i tuoi documenti non lasciano mai la macchina — utile per progetti privati o dei clienti.',
        'I modelli locali sono più piccoli di Claude o GPT, quindi dagli compiti mirati: leggere e spiegare codice, revisioni, riassunti, bozze.'
      ]
    },
    {
      baslik: '📏 Parametri, dimensioni e memoria',
      maddeler: [
        '“8B” significa 8 miliardi di parametri. Più parametri = più intelligente, ma più memoria e più lento.',
        'Atrium mostra le versioni a 4 bit che Ollama usa di default: circa 0,6 GB per miliardo di parametri.',
        'Il modello deve stare in memoria. La memoria della scheda grafica (VRAM) è la più veloce; se non ci sta, il resto gira sul processore e sulla RAM di sistema, che è parecchie volte più lento.',
        'Sui Mac con Apple Silicon la memoria è condivisa, quindi circa il 70% della RAM può essere usato per il modello.'
      ]
    },
    {
      baslik: '⬇️ Installazione — un clic',
      maddeler: [
        'Clicca su “Scarica e installa Ollama”. Atrium scarica la versione ufficiale da GitHub e la installa (Windows: nel tuo account utente, senza permessi di amministratore · macOS: in Applicazioni · Linux: nella cartella dati di Atrium).',
        'Quando il motore risulta “in esecuzione”, scegli un modello contrassegnato “Gira veloce” (o “Consigliato per te”) e clicca su Scarica.',
        'I modelli sono file grandi (1–40 GB). I download continuano in background; puoi continuare a lavorare.'
      ]
    },
    {
      baslik: '🔗 Collegare un modello a un agente',
      maddeler: [
        'Apri un piano, clicca su un agente, imposta “Strumento IA” su Ollama e poi scegli il tuo modello.',
        'Scegli un modello contrassegnato “Può fare l’agente”: può aprire e leggere i file del progetto con gli strumenti per file sicuri di Atrium. Gli altri modelli rispondono solo in base alle istruzioni e alla memoria del progetto.',
        'Puoi mescolare gli strumenti sullo stesso piano — per esempio Claude come capo progetto e un modello di codice locale come sviluppatore.',
        'Imposta “Predefinito per i nuovi agenti” in Profilo e impostazioni → Strumenti IA perché i nuovi assunti lo usino.'
      ]
    },
    {
      baslik: '🔌 LM Studio e altri server',
      maddeler: [
        'Usi già LM Studio, llama.cpp, vLLM o un’API cloud? Scegli “Compatibile OpenAI” in Strumenti IA e inserisci il suo indirizzo.',
        'LM Studio: avvia il suo server locale, poi usa http://localhost:1234/v1.',
        'L’elenco dei modelli viene letto automaticamente dal server.'
      ]
    },
    {
      baslik: '💡 Consigli',
      maddeler: [
        'La prima risposta è lenta mentre il modello viene caricato in memoria; le successive sono molto più rapide.',
        'Chiudi le app pesanti (browser con tante schede, giochi) per liberare memoria per i modelli più grandi.',
        'Sui portatili collega il caricabatterie — in modalità batteria la scheda grafica rallenta.',
        'Parti in piccolo: se un modello 4B è abbastanza veloce, prova la taglia successiva.'
      ]
    }
  ]
}
