export const it = `# Guida utente di Atrium

## Benvenuto
Atrium è il tuo ufficio di agenti IA. Ogni progetto è un **piano** dell'edificio della tua azienda e ogni agente lavora nella sua **stanza**, alla sua scrivania. Dai un solo comando al capo progetto; il capo progetto guida il team e ti porta **un** report chiaro. L'ultima parola spetta sempre a te.

## Primo avvio
La procedura guidata ti accompagna in sei passaggi:
1. **Lingua** — English, Türkçe, Deutsch, Français, Italiano o Русский. Anche gli agenti scrivono i loro report in questa lingua.
2. **Azienda** — nome, slogan, titolare e un logo facoltativo (compare anche sul tetto del tuo edificio).
3. **Progetti** — scegli la cartella che contiene i tuoi progetti. Clicca su un progetto per includerlo o escluderlo, oppure aggiungi progetti da qualsiasi altra cartella.
4. **Claude** — Atrium verifica che Claude Code sia installato e che tu abbia effettuato l'accesso. Puoi accedere da qui, oppure usare una chiave API Anthropic (salvata cifrata sul tuo computer).
5. **Chat** — Atrium trova le tue conversazioni di Claude Code e le archivia per progetto.
6. **Limiti** — i massimali di spesa per agente e giornalieri.

Puoi rieseguire la procedura in qualsiasi momento da **Profilo e impostazioni**.

## L'edificio
- La home mostra la scheda della tua azienda e l'edificio. **Clicca su un piano** per entrare.
- Le **finestre illuminate** indicano che qualcuno sta lavorando a quel piano: un agente di Atrium, un sub-agente ospite o una chat di Claude Code attiva in questo momento.
- **Riordinare i piani**: trascina un piano nell'elenco a sinistra, oppure usa i pulsanti ▲ ▼ che compaiono quando ci passi sopra.
- Il tuo **logo** sta sul tetto una volta caricato.

## Dentro un piano
Un piano ha otto stanze attorno a un corridoio. La stanza 1 appartiene al **capo progetto** (quello con la corona). Il team predefinito è composto da uno sviluppatore, un designer UI/UX, test e qualità, un ricercatore e un custode della memoria.
- **Clicca su un agente** per vedere cosa sta facendo in questo momento, il suo registro di lavoro e la sua descrizione del ruolo.
- **Clicca su una stanza vuota** per assumere un nuovo agente.
- I fumetti mostrano l'attività in tempo reale, ad es. \`📄 reading cart.ts\` o \`🔎 searching "total"\`. Uno schermo luminoso significa che l'agente sta lavorando.
- Un agente arancione con una stella è un **ospite**: un sub-agente avviato in una delle tue chat di Claude Code. Un personaggio **Claude** arancione è una chat di Claude Code attiva in questo momento.

## Dare comandi
1. Apri la scheda **Comando** e scrivi cosa vuoi, poi premi **Invia** (o Ctrl+Invio).
2. Il capo progetto legge la memoria del progetto e divide il lavoro in un massimo di quattro compiti. Se nessuno è adatto, il capo progetto **assume uno specialista** — il nuovo agente esce dall'ascensore e va in una stanza vuota.
3. Gli agenti vanno nell'ufficio del capo progetto a ritirare il loro compito, tornano alla scrivania e lavorano, poi tornano indietro con un report.
4. Il capo progetto unisce tutto in un unico report: *Sintesi · Fatto · Risultati e rischi · In attesa della tua decisione · Prossimi passi*.

**Consenti modifiche ai file** è disattivato per impostazione predefinita: il team si limita a rivedere e proporre. Attivalo quando vuoi delle modifiche; gli agenti lavorano allora uno alla volta. **Interrompi** annulla un comando in corso.

## Giro di stato
Vuoi sapere a che punto è un progetto? Premi **📋 Giro di stato**, oppure chiedi semplicemente al capo progetto qualcosa come *«Come sta andando il progetto? Chiedi a tutti e fammi un breve report.»*
Il capo progetto passa di scrivania in scrivania, ascolta il breve report di stato di ogni agente (fatto, in corso, rischi, prossimi passi), torna nel suo ufficio e ti dà un'unica sintesi. I report di stato sono in sola lettura e usano un piccolo budget.

## Memoria del progetto e cartelle di focus
Ogni piano conserva una breve **memoria del progetto**: cos'è il progetto, il suo stack e la sua struttura, come si avvia, i tuoi obiettivi e le tue decisioni, le cose a cui fare attenzione, il lavoro recente e le lezioni apprese. Ogni agente la legge **per prima** invece di scansionare l'intero progetto — è il maggior risparmio di token di Atrium.
- Premi **Estrai memoria** su un piano per crearla; premilo di nuovo per aggiornarla. Puoi anche modificarla a mano nella scheda **Memoria**.
- Dopo ogni lavoro la memoria si aggiorna da sola (*Lavoro recente* e *Appreso*).
- Quando la memoria viene estratta, Atrium suggerisce anche le **cartelle di focus** per ogni agente (ad es. lo sviluppatore → \`src/api\`). Gli agenti partono dalle loro cartelle di focus e restano al loro interno, a meno che il compito non richieda di più. Puoi cambiarle nella scheda dell'agente.

## Chat di Claude Code
- La pagina **Chat** elenca ogni conversazione di Claude Code sul tuo computer, archiviata per progetto. Un punto verde indica che la chat è attiva in questo momento.
- Apri una chat per leggerla. Scrivi nella casella in basso per **continuare la chat da Atrium**: Claude lavora in quel progetto, vedi le sue risposte e i suoi passaggi in tempo reale, e un personaggio Claude lavora contemporaneamente al piano.
- Continuare una chat segue le stesse regole di sicurezza: nessun comando shell, modifiche ai file solo se le consenti.
- Le chat vengono lette solo in locale; nulla lascia il tuo computer.

## Team
Nella scheda **Team** puoi rinominare gli agenti, modificare le loro descrizioni del ruolo, scegliere un modello (Haiku: veloce ed economico · Sonnet: bilanciato · Opus: il più capace), dare accesso al web, impostare le cartelle di focus, spostarli in un'altra stanza o rimuoverli. Il capo progetto non può essere rimosso.

## Report
La pagina **Report** raccoglie ogni comando di ogni piano con il report del capo progetto, i report individuali del team e il costo.

## Costi e limiti
- **Oggi ≈ $X** è il costo che Claude Code riporta per le esecuzioni degli agenti di oggi.
  - Se hai effettuato l'accesso con un **abbonamento Claude** (Pro / Max), è una **stima equivalente API**: non viene addebitata separatamente e conta invece nei limiti di utilizzo del tuo piano.
  - Se usi una **chiave API**, è spesa API reale.
- **Massimale** è il **limite di sicurezza giornaliero** di Atrium. Gli agenti non avviano mai un lavoro che potrebbe superarlo. Se un'esecuzione va in timeout o viene annullata e il suo costo non può essere letto, viene conteggiato l'intero massimale per agente, così il massimale giornaliero non viene mai sottostimato.
- Modifica entrambi i massimali in **Profilo e impostazioni → Limiti e sicurezza**.

## Sicurezza
- Gli agenti non possono leggere file \`.env\`, di chiavi o di password, non possono eseguire comandi shell e non possono avviare propri sub-agenti.
- Gli agenti non fanno mai commit né push, non installano pacchetti, non scrivono a nessuno e non pubblicano nulla.
- Il testo di pagine web e file è trattato come dati, mai come istruzioni.

## Simulazione
Attiva **Simulazione** nella barra superiore per provare tutto — comandi, assunzioni, giri di stato, animazioni — senza chiamare Claude e senza spendere nulla. La simulazione non scrive mai nella memoria del progetto.

## Suoni
Passi, clic di tastiera, il campanello dell'ascensore, un jingle di assunzione e un segnale quando un report è pronto. Attivali o disattivali con il pulsante 🔊 nella barra superiore o nelle impostazioni.

## Aggiornamenti
Atrium cerca aggiornamenti all'avvio e ogni poche ore. Quando una nuova versione è pronta vedrai un banner — premi **Riavvia e aggiorna**. Puoi anche controllare manualmente in **Profilo e impostazioni → Aggiornamenti**. Su macOS l'aggiornamento apre la pagina di download.

## Risoluzione dei problemi
- **«Claude Code non è stato trovato»** — installalo con \`npm install -g @anthropic-ai/claude-code\`, oppure imposta il suo percorso nelle impostazioni.
- **«Claude Code non ha effettuato l'accesso»** — apri Impostazioni → Connessione a Claude e premi **Accedi con Claude**, poi **Controlla di nuovo**.
- **«massimale giornaliero»** — il massimale di oggi è stato raggiunto; aumentalo nelle impostazioni o aspetta domani.
- **Manca un piano** — controlla la cartella dei progetti e i progetti esclusi nelle impostazioni, poi premi ↻ accanto a *Piani*.

## Supporto
Atrium è gratuito. Se ti è utile, metti una ⭐ stella su GitHub, condividilo e segnala bug o idee nelle GitHub Issues.
Made by CiciByte Technology, Inc. — cicibyte.com
`
