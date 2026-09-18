---
title: "Le basi Di GIT: Impara il versioning!"
date: 2024-02-12
description: "Nel vasto panorama dello sviluppo software, la gestione efficace del codice svolge un ruolo cruciale nel determinare il successo di un progetto. In questo contesto, Git si erge come uno strumento…"
tags: ["Guide", "Web Dev"]
---

Nel vasto panorama dello sviluppo software, la gestione efficace del codice svolge un ruolo cruciale nel determinare il successo di un progetto. In questo contesto, Git si erge come uno strumento indispensabile, fornendo un sistema di controllo versione potente ed efficiente. La sua adozione non solo semplifica la collaborazione tra sviluppatori, ma offre anche un metodo robusto per tracciare le modifiche nel tempo, gestire branch distinti e risolvere conflitti in modo ordinato.

Questa guida pratica vuole di condurti attraverso i fondamenti della gestione del codice con Git, offrendo una panoramica chiara e dettagliata delle procedure fondamentali. Dall’installazione iniziale fino alla collaborazione avanzata su piattaforme come GitHub, esploreremo passo dopo passo come sfruttare appieno le potenzialità di Git per migliorare il tuo flusso di lavoro dello sviluppo. Che tu sia un principiante che inizia il suo viaggio nello sviluppo software o un professionista esperto che desidera perfezionare le proprie competenze, questa guida ti accompagnerà nella tua esperienza con Git, aprendoti le porte a un mondo di gestione del codice più organizzato e collaborativo.

## 1. INSTALLAZIONE DI GIT:

Il primo passo fondamentale per intraprendere il tuo viaggio nella gestione del codice con Git è l’installazione dello strumento sul tuo sistema. Git è una risorsa versatile e può essere installato su diverse piattaforme, tra cui Windows, macOS e Linux. Segui attentamente i passaggi corrispondenti al tuo sistema operativo per garantire una corretta installazione.

### Windows:

- Visita il sito ufficiale di Git (<https://git-scm.com/downloads>) e scarica l’installer.
- Esegui l’installer scaricato, seguendo le istruzioni di installazione.
- Durante l’installazione, assicurati di selezionare l’opzione per “Usare Git e strumenti da riga di comando” per abilitare l’utilizzo di Git da linea di comando.

### macOS:

- Se stai utilizzando macOS, è consigliabile utilizzare Homebrew per l’installazione. Apri il terminale e esegui il comando:`brew install git`
- Attendere il completamento dell’installazione.

### Linux (Ubuntu):

- Su sistemi basati su Ubuntu, esegui i seguenti comandi nel terminale:`sudo apt update sudo apt install git`
- Conferma l’installazione quando richiesto.

Verifica l’installazione eseguendo il comando `git --version` nel terminale. Se Git è stato installato correttamente, verrà visualizzata la versione attuale.

Con Git installato sul tuo sistema, hai aperto la porta per sfruttare appieno le sue funzionalità di gestione del codice. Nelle sezioni successive, esploreremo come inizializzare un repository e cominciare a tracciare le modifiche al tuo codice con precisione.

## 2. CREAZIONE DI UN REPOSITORY:

Ora che hai Git installato sul tuo sistema, il passo successivo è inizializzare un repository Git all’interno della directory del tuo progetto. Un repository è essenzialmente un contenitore che terrà traccia delle modifiche al tuo codice nel tempo. Segui attentamente questi passaggi per creare il tuo repository:

1.  **Apertura del Terminale o della Console:** Apri il terminale se sei su macOS o Linux, o la console se sei su Windows.
2.  **Spostamento nella Directory del Progetto:** Utilizza il comando `cd` per spostarti nella directory del tuo progetto. Ad esempio: cd percorso/verso/il/tuo/progetto
3.  **Inizializzazione del Repository:** Esegui il comando `git init` per inizializzare un nuovo repository Git nella directory del progetto.

``` wp-block-code
git init
```

4.  **Verifica dello Stato del Repository:** Puoi utilizzare il comando `git status` per verificare lo stato del tuo repository, visualizzando i file che sono stati modificati o aggiunti e quelli pronti per il commit.

Adesso hai creato con successo il tuo primo repository Git. Da questo momento in poi, Git inizierà a tenere traccia delle modifiche ai tuoi file. Nel prossimo passo, esploreremo come aggiungere i file al repository e registrare le modifiche tramite i commit.

## 3. AGGIUNTA DI FILE AL REPOSITORY:

Ora che il tuo repository Git è stato inizializzato, è il momento di iniziare a monitorare e registrare le modifiche ai tuoi file. Utilizzeremo il comando `git add` per preparare i file e il comando `git commit` per confermare le modifiche. Ecco come procedere:

### Aggiunta di File al Repository:

Utilizza il comando `git add <nome file>` per aggiungere un singolo file al cosiddetto “staging area”, il luogo dove Git prepara i file per il successivo commit.

``` wp-block-code
 git add nomefile.txt
```

Se desideri aggiungere tutti i file modificati o nuovi, puoi utilizzare il comando:

``` wp-block-code
 git add .
```

Assicurati di sostituire `<nome file>` con il nome effettivo del tuo file.

### Verifica dello Stato del Repository:

Puoi sempre verificare lo stato attuale del repository con il comando `git status`. Questo ti mostrerà i file che sono stati aggiunti al “staging area” e quelli che sono ancora in attesa di essere aggiunti.

``` wp-block-code
git status
```

### Conferma delle Modifiche con un Commit:

Una volta che hai aggiunto i file desiderati, è ora di effettuare un commit per registrare le modifiche nel repository. Utilizza il comando `git commit` seguito da un messaggio descrittivo:

``` wp-block-code
  git commit -m "Descrizione delle modifiche"
```

Il messaggio del commit dovrebbe essere chiaro e descrittivo, in modo che tu possa capire facilmente le modifiche apportate in futuro.

Ora hai ufficialmente registrato le tue prime modifiche nel repository Git. Nel prossimo passo, esploreremo ulteriormente i concetti di branch, permettendoti di lavorare su diverse linee di sviluppo in modo organizzato.

## 4. COMMIT DELLE MODIFICHE:

Dopo aver aggiunto i file desiderati al tuo repository tramite la “staging area”, è giunto il momento di effettuare un commit. I commit in Git sono come istantanee del tuo progetto in un determinato momento, e ogni commit ha un messaggio descrittivo associato che indica le modifiche apportate. Ecco come eseguire un commit:

### Esecuzione del Commit:

Utilizza il comando `git commit -m "Messaggio del commit"` per registrare ufficialmente le modifiche nel repository.

``` wp-block-code
 git commit -m "Implementato il sistema di autenticazione"
```

Il messaggio del commit dovrebbe essere chiaro e informativo, spiegando brevemente le modifiche apportate in questo specifico commit.

### Visualizzazione della Cronologia dei Commit:

Puoi visualizzare la cronologia dei commit con il comando `git log`. Questo mostrerà una lista di tutti i commit nel repository, con informazioni dettagliate su chi ha effettuato il commit, quando è stato eseguito e il messaggio associato.

### Ritorno a Versioni Precedenti (opzionale):

Se desideri tornare a una versione precedente del tuo progetto, puoi farlo utilizzando il comando `git checkout <ID commit>` o `git checkout <nome branch>`. Questo ti permette di esplorare il tuo progetto in uno stato specifico.

### Visualizzazione delle Differenze (opzionale):

Puoi visualizzare le differenze tra le versioni con il comando `git diff`. Questo comando ti mostrerà le modifiche apportate tra la tua copia di lavoro attuale e l’ultima versione registrata nel repository.

Effettuare commit regolari e descrittivi è una pratica cruciale per tenere traccia delle modifiche nel tempo e facilitare la collaborazione con altri sviluppatori. Nella prossima sezione, esploreremo l’utilizzo di branch, che consente di lavorare su diverse linee di sviluppo in modo separato.

## 5. CREAZIONE DI BRANCH:

L’utilizzo di branch in Git consente di sviluppare diverse linee di codice in modo separato, permettendo un lavoro parallelo su diverse funzionalità o correzioni senza influenzare il branch principale. Vediamo come creare e gestire i branch in Git:

### Creazione di un Nuovo Branch:

Utilizza il comando `git branch <nome branch>` per creare un nuovo branch. Ad esempio:

``` wp-block-code
 git branch feature-autenticazione
```

Questo crea un nuovo branch chiamato “feature-autenticazione”, ma attualmente rimani nel tuo branch corrente.

### Cambio tra i Branch:

Per spostarti da un branch all’altro, utilizza il comando `git checkout <nome branch>`: `bash git checkout feature-autenticazione `Oltre a `git checkout`, puoi anche utilizzare il comando più recente `git switch`: `bash git switch feature-autenticazione`

### Creazione e Cambio Branch in un Unico Passaggio:

Puoi creare e cambiare immediatamente al nuovo branch con il comando: `bash git checkout -b feature-autenticazione `oppure con: `bash git switch -c feature-autenticazione`

### Visualizzazione di Tutti i Branch:

Puoi visualizzare tutti i branch presenti nel tuo repository utilizzando il comando: `bash git branch `Il branch corrente sarà evidenziato con un asterisco.

### Merge di Branch:

Una volta completato il lavoro su un branch, è possibile unire le modifiche al branch principale (solitamente “master”) utilizzando il comando `git merge`. Ad esempio: `bash git checkout master git merge feature-autenticazione `o, in un unico passaggio: `bash git switch master git merge feature-autenticazione`

Utilizzare i branch in modo efficace consente di organizzare e gestire le modifiche al codice in modo pulito e strutturato. Nella prossima sezione, approfondiremo il processo di unione di branch e la gestione dei conflitti che possono sorgere durante questa operazione.

## 6. UNIONE DI BRANCH:

L’unione di branch in Git è un passo cruciale per combinare le modifiche effettuate su branch separati, consentendo di consolidare il lavoro svolto in diverse direzioni. Ecco come gestire l’unione di branch:

### Spostamento al Branch di Destinazione:

Prima di unire i branch, assicurati di trovarti nel branch di destinazione. Per esempio, se desideri unire il branch “feature-autenticazione” al branch “master”, esegui:

``` wp-block-code
git checkout master
```

Copy

Se stai usando il comando `git switch`, puoi usare:

``` wp-block-code
git switch master
```

Copy

### Unione di Branch:

Utilizza il comando `git merge` per unire il branch di destinazione con il branch di partenza. Ad esempio: `bash git merge feature-autenticazione `Git cercherà di unire automaticamente le modifiche, ma potrebbero sorgere conflitti che richiederanno una risoluzione manuale.

### Risoluzione dei Conflitti:

Se si verificano conflitti durante l’unione di branch, Git lo segnalerà. Utilizza il comando `git status` per identificare i file in conflitto. Modifica manualmente i file in conflitto risolvendo le differenze, quindi esegui: `bash git add <file in conflitto> git merge --continue `Continua il processo fino a quando tutti i conflitti sono risolti.

### Annullamento dell’Unione (opzionale):

Se desideri annullare l’unione e riprovare, puoi utilizzare il comando: `bash git merge --abort `oppure, se stai utilizzando Git versione 2.27 o successiva: `bash git restore --source=HEAD --staged --worktree -- <file in conflitto>`

### Verifica del Risultato:

Dopo unire i branch, esegui il comando `git log` per verificare che le modifiche siano state consolidate correttamente.

Unire i branch è un aspetto fondamentale dello sviluppo collaborativo, consentendo a diversi membri del team di lavorare su funzionalità separate senza influenzare direttamente il branch principale. La gestione efficace degli eventuali conflitti durante l’unione è essenziale per mantenere l’integrità del codice. Nella prossima sezione, esploreremo ulteriormente la gestione del versionamento, consentendoti di esplorare diverse versioni del tuo progetto nel tempo.

## 7. GESTIONE DEL VERSIONAMENTO:

La gestione del versionamento in Git consente di esplorare diverse versioni del tuo progetto nel tempo, offrendo un modo potente per tornare indietro e ispezionare lo stato del codice in qualsiasi momento. Vediamo come sfruttare questa funzionalità:

### Visualizzazione della Cronologia dei Commit:

Utilizza il comando `git log` per visualizzare la cronologia dei commit nel tuo repository. `bash git log `Questo elencherà tutti i commit con i relativi dettagli, inclusi ID, autore, data e messaggio del commit.

### Tornare a Versioni Precedenti:

Puoi tornare a una versione precedente del tuo progetto utilizzando il comando `git checkout` seguito dall’ID del commit o del branch desiderato. `bash git checkout <ID commit> `Ad esempio, per tornare al branch principale (solitamente “master”): `bash git checkout master`

### Creazione di un Nuovo Branch da un Commit Specifico (opzionale):

Se desideri creare un nuovo branch basato su una versione specifica, puoi utilizzare il comando: `bash git checkout -b nuovo-branch <ID commit>`

### Annullamento delle Modifiche Locali:

Se hai apportato modifiche nel tuo codice ma desideri scartarle e tornare all’ultimo commit, puoi utilizzare il comando: `bash git checkout -- .`

### Ripristino di File da un Commit Specifico (opzionale):

Se desideri ripristinare uno o più file da un commit specifico, puoi utilizzare il comando: `bash git checkout <ID commit> -- <nome file>`

### Utilizzo di `git diff`:

Il comando `git diff` ti consente di confrontare le differenze tra il tuo stato di lavoro attuale e un commit specifico o un branch. `bash git diff <ID commit>`

### Ritorno al Branch Corrente:

Dopo aver esplorato una versione specifica, assicurati di tornare al branch corrente utilizzando `git checkout` o `git switch`. `bash git checkout nome-branch`

Grazie a questi comandi, hai ora la flessibilità di esplorare il tuo progetto attraverso diverse fasi di sviluppo. La gestione del versionamento ti consente di mantenere un controllo preciso sullo stato del tuo codice nel tempo, un aspetto essenziale per lo sviluppo software efficace. Nella prossima sezione, esploreremo come collaborare con altri sviluppatori su GitHub.

## 8. COLLABORAZIONE SU GITHUB:

GitHub è una piattaforma di hosting basata su Git che facilita la collaborazione e la condivisione del codice tra sviluppatori. Impareremo come caricare il tuo repository su GitHub, collaborare con altri sviluppatori e gestire il flusso di lavoro con le pull request:

### Creazione di un Account su GitHub (se non hai già uno):

Visita [GitHub](https://github.com/) e crea un account se non ne hai già uno.

### Creazione di un Nuovo Repository su GitHub:

Dalla tua dashboard su GitHub, fai clic su “New” per creare un nuovo repository. Assegna un nome al repository, aggiungi una descrizione opzionale e inizializza con un README se desideri. Fai clic su “Create repository”.

### Collegamento del Repository Locale a GitHub:

Utilizza i comandi seguenti per collegare il tuo repository locale a quello su GitHub: `bash git remote add origin <URL del tuo repository su GitHub> git branch -M main git push -u origin main `Questo aggiunge un collegamento remoto chiamato “origin” e carica il tuo branch principale su GitHub.

### Aggiornamento del Repository Locale da GitHub:

Puoi scaricare le ultime modifiche dal repository su GitHub utilizzando il comando: `bash git pull origin main`

### Creazione di una Pull Request:

Quando desideri contribuire al progetto di qualcun altro, crea una “pull request” (PR). Fai clic su “Pull requests” nella scheda del repository su GitHub e quindi su “New pull request”. Seleziona il branch del tuo fork e il branch di destinazione, quindi fai clic su “Create pull request”.

### Revisione delle Pull Request:

Se sei il proprietario del repository, puoi revisionare le PR ricevute e, se necessario, approvarle. Puoi commentare direttamente sul codice, evidenziare linee specifiche e avviare discussioni.

### Fusione della Pull Request:

Dopo la revisione, fai clic su “Merge pull request” per integrare le modifiche nel branch di destinazione. Puoi scegliere di eliminare il branch dopo la fusione.

### Sincronizzazione del Repository Locale:

Dopo la fusione, puoi sincronizzare il tuo repository locale con le modifiche utilizzando: `bash git pull origin main`

Questo processo di collaborazione su GitHub è essenziale per lavorare in team, consentendo una gestione trasparente delle modifiche e facilitando la revisione del codice. Nella prossima sezione, esploreremo come gestire eventuali conflitti che possono sorgere durante le fusioni di branch o le pull request.

## 9. RISOLUZIONE DI CONFLITTI:

Durante la collaborazione su un progetto Git con altri sviluppatori, è possibile che si verifichino conflitti quando si tenta di unire branch o fusionare pull request. I conflitti si verificano quando le modifiche apportate in una branch interferiscono con le modifiche apportate in un’altra, richiedendo una risoluzione manuale. Ecco come gestire i conflitti:

### Rilevamento di Conflitti:

Durante un’operazione di unione di branch o di una pull request, Git può segnalare che ci sono conflitti. Puoi rilevare i conflitti anche utilizzando il comando `git status`, che mostrerà i file in conflitto.

### Risoluzione Manuale dei Conflitti:

Apri i file in conflitto con un editor di testo e cerca le sezioni contrassegnate da Git come “«««\<”, “=======” e “»»»\>”. Queste sezioni rappresentano le modifiche conflittuali. Modifica manualmente il codice per risolvere le differenze in conflitto, mantenendo solo le parti necessarie. Rimuovi anche i marcatori di conflitto.

### Aggiunta e Commit delle Modifiche:

Dopo aver risolto i conflitti, utilizza il comando `git add <nome file>` per segnare i file come risolti. Successivamente, esegui un commit per confermare la risoluzione dei conflitti: `bash git commit -m "Risoluzione dei conflitti"`

### Fusione del Branch o Pull Request:

Prosegui con l’operazione di fusione del branch o di accettazione della pull request. Se stai risolvendo i conflitti in una pull request su GitHub, la PR verrà aggiornata automaticamente dopo che hai effettuato il commit di risoluzione dei conflitti.

### Continuazione dell’Operazione Originale:

Dopo aver risolto i conflitti, puoi continuare con l’operazione originale, come la fusione del branch o l’accettazione della pull request.

La risoluzione dei conflitti è un aspetto comune quando si lavora in un ambiente collaborativo. È essenziale affrontare i conflitti in modo tempestivo per mantenere l’integrità del codice e garantire una collaborazione senza problemi. Con questi passaggi, sarai in grado di gestire i conflitti e proseguire con il tuo flusso di lavoro. Nella sezione successiva, esploreremo alcune best practice per garantire una gestione del codice fluida e senza intoppi.

## 10. BEST PRACTICE PER UNA GESTIONE DEL CODICE EFFICACE:

Una gestione del codice efficace è essenziale per lo sviluppo software di successo. Seguire alcune best practice ti aiuterà a mantenere un flusso di lavoro organizzato, migliorare la collaborazione e ridurre potenziali problemi. Ecco alcune raccomandazioni:

- **Messaggi di Commit Significativi:** Scrivi messaggi di commit chiari e descrittivi. I messaggi informativi aiutano te e gli altri sviluppatori a comprendere le modifiche apportate in un determinato commit.
- **Commit Frequenti e Atomici:** Effettua commit frequenti e atomici. Un commit dovrebbe rappresentare una singola unità logica di lavoro. Questo semplifica la revisione del codice e la gestione dei conflitti.
- **Branch Descrittivi:** Usa nomi di branch descrittivi e significativi. Questo facilita la comprensione del lavoro svolto su ciascun branch e semplifica la gestione dei branch stessi.
- **Aggiornamento Regolare del Repository:** Mantieni il tuo repository locale aggiornato con i cambiamenti dal repository remoto. Utilizza `git pull` regolarmente per ottenere le ultime modifiche.
- **Evita il Codice “Spaghetti”:** Scrivi codice pulito e ben strutturato. Utilizza pratiche di codifica consistenti e seguine le linee guida del progetto.
- **Utilizzo di .gitignore:** Utilizza un file `.gitignore` per escludere file temporanei, file di build e altri elementi non desiderati dal controllo versione.
- **Test Unitari e Test di Integrazione:** Implementa test unitari e di integrazione per garantire la stabilità del codice. Esegui test regolarmente durante lo sviluppo.
- **Documentazione Adeguata:** Documenta il tuo codice in modo chiaro e completo. Questo aiuta sia te che gli altri sviluppatori a comprendere il funzionamento del codice.
- **Code Reviews:** Partecipa alle revisioni del codice. Le revisioni sono un’opportunità per migliorare la qualità del codice, condividere conoscenze e garantire la coerenza nel progetto.
- **Backup Regolari:** Esegui backup regolari del tuo repository, soprattutto prima di operazioni delicate come la fusione di branch complessi o la modifica di parti cruciali del codice.

Seguendo queste best practice, sarai in grado di mantenere un ambiente di sviluppo sano e collaborativo. Una gestione del codice ben organizzata è fondamentale per la crescita e il successo a lungo termine di qualsiasi progetto software.

## CONCLUSIONE:

Navigare nel complesso mondo dello sviluppo web e della gestione del codice richiede competenze solide e una comprensione approfondita degli strumenti a disposizione. In questa guida, abbiamo esplorato i fondamenti della gestione del codice con Git, fornendo una panoramica dettagliata dei concetti chiave e delle pratiche consigliate.

Dall’installazione di Git e la creazione di repository, alla gestione di branch, conflitti e pull request, hai acquisito una solida base per gestire progetti software in modo efficace. Abbiamo anche esaminato l’importante aspetto della collaborazione su GitHub, consentendoti di lavorare con altri sviluppatori in un ambiente distribuito.

Per migliorare ulteriormente il tuo flusso di lavoro, abbiamo esplorato best practice come l’uso di messaggi di commit significativi, la scrittura di codice pulito, l’implementazione di test e l’automazione dei processi con Git Hooks. Infine, hai imparato come gestire efficientemente le dipendenze attraverso l’uso di Git Submodules.

Ricorda che lo sviluppo software è un percorso continuo di apprendimento. Mantieni aggiornate le tue competenze, esplora nuove tecnologie e partecipa attivamente alla community dello sviluppo web. Con una solida comprensione di Git e delle pratiche consigliate, sei pronto per affrontare sfide più complesse nel tuo viaggio di sviluppo web. Buona codifica!
