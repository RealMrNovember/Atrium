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
- Le **finestre luminose** indicano che qualcuno sta lavorando adesso; le **finestre calde e soffuse** indicano una chat di Claude Code aperta nell’app Claude ma inattiva.
- Quando serve il tuo intervento — una chat attende la tua decisione o un agente ha un problema — un agente si sporge dalla finestra di quel piano, saluta e ti chiama. Cliccalo per andare subito a quella chat.

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

## Strumenti IA
Atrium non è legato a una sola IA. Ogni agente ha il suo **Strumento IA**, e strumenti diversi possono lavorare fianco a fianco sullo stesso piano:
- **Claude Code** — il predefinito; l'agente più capace e l'unico con la visualizzazione dell'uso del piano e i limiti in dollari.
- **OpenAI Codex CLI** — installalo con \`npm i -g @openai/codex\`, poi clicca su **Accedi** in Profilo e impostazioni → Strumenti IA.
- **Gemini CLI** — installalo con \`npm i -g @google/gemini-cli\`, accedi con Google o salva una chiave API di Gemini.
- **Ollama** — modelli gratuiti che girano sul tuo computer (vedi IA locale).
- **Compatibile OpenAI** — LM Studio, llama.cpp, vLLM, OpenRouter o l'API di OpenAI: inserisci l'indirizzo e, se serve, una chiave.

Per cambiare lo strumento di un agente, cliccaci sopra e modifica **Strumento IA** e **Modello**. **Predefinito per i nuovi agenti** decide cosa usano i nuovi assunti; quando il capo progetto usa uno strumento diverso da Claude, gli agenti che assume usano lo stesso strumento e modello.

## IA locale
La pagina **IA locale** misura il tuo computer (processore, memoria, scheda grafica, disco libero) e mostra quali modelli gireranno veloci, lenti o per niente.
1. Clicca su **Scarica e installa Ollama** — Atrium scarica il motore ufficiale e lo installa per te.
2. Scegli un modello contrassegnato **Gira veloce** o **Consigliato per te** e clicca su **Scarica**.
3. Provalo nella chat di prova, poi dallo a un agente: Strumento IA **Ollama**, Modello **il tuo modello**.
I modelli contrassegnati **Può fare l’agente** possono aprire e leggere i file del progetto con gli strumenti per file sicuri di Atrium; gli altri rispondono solo in base alle istruzioni e alla memoria del progetto. La pagina ha anche una breve guida su dimensioni, memoria e consigli.

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

## Controllare le modifiche prima di applicarle
Quando consenti le modifiche ai file, il team lavora su una **copia** del tuo progetto. Nei tuoi file non viene scritto nulla finché non lo decidi tu.
- Quando il comando finisce, **Modifiche proposte** elenca ogni file nuovo, modificato ed eliminato con le sue righe +/−. Clicca su un file per vedere le righe esatte.
- **Applica** scrive tutte le modifiche; togli la spunta ad alcuni file e usa **Applica … selezionati** per applicarne solo una parte; **Scarta** le butta via.
- Dopo averle applicate, **Annulla** riporta ogni file com'era prima.
- Se hai modificato tu un file mentre il team lavorava, Atrium non lo sovrascrive e lo segna come **modificato da te**.
- Puoi disattivare questa funzione in **Profilo e impostazioni** (sconsigliato).

## Passaggi di consegne tra agenti
Nelle impostazioni di un agente, **Al termine, passa a** sceglie un collega che controlla il lavoro automaticamente — per esempio lo sviluppatore passa al tester QA. L'attività di controllo compare con ↪ nell'elenco delle attività. Il team predefinito e i modelli di team includono già passaggi sensati.

## Lavoro pianificato
La scheda ⏰ di un piano esegue il lavoro da sola: un **giro di stato** ogni mattina, **aggiorna memoria** ogni venerdì, oppure qualsiasi **comando** in sola lettura a un'ora stabilita. Scegli i giorni e l'ora. Le pianificazioni funzionano mentre Atrium è aperto; se era occupato o chiuso, recuperano entro 30 minuti.

## Confrontare due IA
**⚖️ Confronta**, accanto alla casella dei comandi, esegue la stessa attività in sola lettura con due strumenti o modelli IA contemporaneamente — per esempio Claude e un modello locale — e mostra le risposte fianco a fianco con costo, tempo e token. Perfetto per scoprire dove un modello locale gratuito è sufficiente.

## Modelli di team
Nella scheda **Team**, **Modelli di team** crea con un clic un team già pronto: Agenzia web, App mobile, Studio di contenuti, Dati e analisi o Studio di videogiochi. Gli agenti usano lo strumento IA predefinito della tua azienda.

## Condividere un report
Sotto il report del responsabile, **Condividi** lo salva come pagina web pulita (con il nome e il logo della tua azienda) da inviare a un cliente o al tuo team; 📋 lo copia come Markdown.

## Più aziende
Gestisci più di un’azienda in Atrium — per esempio il tuo studio e un cliente. Ogni azienda ha **i suoi progetti, il suo team, la sua memoria, i suoi report e il suo strumento IA predefinito**.
- Apri il menu **▾** accanto al nome della tua azienda in alto a sinistra per cambiare azienda o aggiungere una **Nuova azienda**. Una nuova azienda parte con la procedura guidata; se cambi idea, usa **Torna a …** nella procedura.
- **Profilo e impostazioni → Le mie aziende** le elenca tutte; da lì puoi aprire o rimuovere un’azienda. La rimozione elimina solo i dati di Atrium (team, memoria, report) — mai le cartelle dei tuoi progetti.
- In **Profilo e impostazioni → Strumenti IA**, **Passa tutto il team allo strumento predefinito** cambia in un colpo solo tutti gli agenti dell’azienda attuale.

## Nuovi progetti e nuove chat
- Non hai ancora progetti? Nella procedura guidata (o con **＋** accanto a *Piani*) scrivi un nome e clicca su **Nuovo progetto** — Atrium crea la cartella con un breve README. Se non hai scelto una cartella, finisce in *Atrium Projects* nella tua cartella utente.
- Dentro un piano, la scheda **Chat** ha **＋ Nuova chat**: avvia una vera chat di Claude Code in quella cartella di progetto. Viene salvata, compare nel tuo elenco di chat e si può continuare più tardi — in Atrium o in Claude Code.

## Allegare file a un comando
Clicca su **📎 Allega** sotto il campo del comando, oppure trascinaci sopra i file — immagini, PDF e file di testo, fino a 10 file da 10 MB ciascuno. I piccoli file di testo vengono passati direttamente agli agenti; immagini e PDF vengono aperti dagli agenti con i loro strumenti per i file. Gli allegati sono salvati nella cartella dati di Atrium, mai nel tuo progetto.

## Collegare gli strumenti IA con un clic
- **Collegati con ChatGPT** (Codex), **Collegati con Google** (Gemini) e **Collega Claude**: se lo strumento manca, Atrium lo installa nella sua cartella (senza diritti di amministratore; serve Node.js), poi apre la pagina di accesso dello strumento nel browser. Quando hai finito di accedere, lo stato passa da solo a **Pronto**.
- Il passaggio **IA** della procedura guidata propone tutti gli strumenti — collegane uno o più.
- La barra in alto mostra **una scheda di utilizzo per ogni strumento IA in uso**: i limiti di sessione e settimanali di Claude (o i dollari di oggi con una chiave API), i limiti di Codex quando li comunica, le esecuzioni e i token di oggi per gli altri, e *locale · gratis* per Ollama.

## Supporto e il tuo account
La pagina **🛟 Supporto** ti permette di mandarci un **desiderio**, una **richiesta**, un **reclamo** o una **segnalazione di bug**, e di leggere lì le nostre risposte (un badge segnala le nuove risposte).
- Per inviare messaggi ti serve un account gratuito e facoltativo: email + password, oppure **Continua con Google**.
- Accanto a un comando non riuscito trovi **🐞 Segnala**; apre una segnalazione di bug con il messaggio di errore. Spunta **Aggiungi informazioni diagnostiche** solo se vuoi — vedi esattamente cosa viene aggiunto (versione dell’app, sistema, errori recenti, senza percorsi personali e chiavi).
- Puoi uscire o **eliminare il tuo account** in qualsiasi momento; l’account e tutti i tuoi messaggi vengono eliminati definitivamente.

## Privacy
- I tuoi progetti, il codice, i file, le chat, la memoria del progetto, i prompt, i risultati degli agenti e le chiavi API **non lasciano mai il tuo computer**. Non possiamo vederli né leggerli — non ci arrivano mai.
- Le richieste all’IA vanno direttamente dal tuo computer allo strumento IA che hai scelto (oppure restano sul tuo computer con i modelli locali). Non c’è nessun server Atrium nel mezzo.
- Atrium si collega a Internet solo per controllare aggiornamenti e note di rilascio e — solo se li usi — per il tuo account e i messaggi che invii.
- Con un account salviamo solo la tua email, il tuo nome e la versione dell’app; la password è conservata solo come hash irreversibile.

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
