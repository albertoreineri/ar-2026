---
title: "tmux: guida pratica al terminal multiplexer"
date: 2026-11-09
description: "Come usare tmux per gestire più sessioni terminale in parallelo, tenere processi vivi dopo una disconnessione SSH e organizzare il lavoro in finestre e pannelli."
tags: ["Guide", "Linux"]
translationKey: "tmux-practical-guide"
---

Ti è mai capitato di lanciare un comando lungo su un server remoto via SSH e perdere tutto perché la connessione è caduta? O di dover aprire dieci terminali diversi per tenere sotto controllo un log, un editor e un processo in esecuzione? **tmux** risolve entrambi i problemi con un solo strumento, ed è installato o installabile su praticamente qualsiasi server Linux.

Se usi già [SSH per connetterti ai tuoi server](/introduzione-a-ssh-cose-e-come-funziona/), tmux è il passo naturale successivo: ti permette di avere sessioni di lavoro persistenti, che sopravvivono alla disconnessione e che puoi riprendere esattamente da dove le avevi lasciate.

## Cos'è un terminal multiplexer

tmux (**t**erminal **mu**ltiple**x**er) è un programma che gira dentro il tuo terminale e ti permette di creare più "schermi" virtuali all'interno di una singola connessione. Puoi aprire finestre diverse, dividerle in pannelli, passare dall'una all'altra con una scorciatoia da tastiera, e soprattutto staccarti da tutto (*detach*) senza chiudere nulla: i processi continuano a girare sul server, e quando ti riconnetti ritrovi tutto com'era.

La cosa che fa davvero la differenza rispetto ad aprire più finestre di terminale sul tuo computer è che con tmux la sessione vive **sul server**, non sul client. Se la tua connessione SSH cade, se chiudi il laptop, se cambi rete: la sessione tmux resta lì, attiva, pronta per essere ripresa.

<svg class="hi-diagram" width="300" height="160" viewBox="0 0 300 160" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="10" y="15" width="280" height="130" rx="14" class="hi-fill hi-ink-stroke" stroke-width="2.5"/>
  <circle cx="30" cy="35" r="4" class="hi-accent-dot"/>

  <line x1="150" y1="25" x2="150" y2="135" class="hi-muted-stroke" stroke-width="2"/>

  <rect x="25" y="50" width="100" height="35" rx="10" class="hi-fill hi-line" stroke-width="2"/>
  <rect x="35" y="62" width="50" height="5" rx="2.5" class="hi-bar"/>
  <rect x="35" y="72" width="35" height="5" rx="2.5" class="hi-bar"/>

  <rect x="25" y="95" width="100" height="35" rx="10" class="hi-fill hi-line" stroke-width="2"/>
  <rect x="35" y="107" width="45" height="5" rx="2.5" class="hi-bar"/>
  <rect x="35" y="117" width="60" height="5" rx="2.5" class="hi-bar"/>

  <rect x="165" y="50" width="110" height="80" rx="10" class="hi-fill hi-line" stroke-width="2"/>
  <rect x="178" y="65" width="55" height="5" rx="2.5" class="hi-bar"/>
  <rect x="178" y="75" width="70" height="5" rx="2.5" class="hi-bar"/>
  <rect x="178" y="85" width="40" height="5" rx="2.5" class="hi-bar"/>
  <rect x="178" y="105" width="60" height="5" rx="2.5" class="hi-bar"/>
</svg>

Il rettangolo grande è la **sessione** tmux (il pallino giallo segna che è attiva); dentro ci sono due **finestre** (a sinistra, come le tab di un browser) e una finestra a destra divisa in più **pannelli** affiancati nello stesso spazio.

## Installazione e primo avvio

Su quasi tutte le distribuzioni è nei repository ufficiali:

```
sudo apt install tmux      # Debian/Ubuntu
sudo dnf install tmux      # Fedora
```

Per avviare una nuova sessione basta digitare:

```
tmux
```

Ti ritrovi in un terminale che sembra identico a prima, con l'unica differenza di una barra verde in basso che mostra il nome della sessione e l'orario. Da qui in poi, tutto quello che lanci dentro questa finestra sopravvive al *detach*.

## Il prefisso e le scorciatoie fondamentali

Tutti i comandi di tmux passano da un **prefisso**, di default `Ctrl+b`. Lo premi, lo lasci andare, e poi premi il tasto del comando che vuoi eseguire. Non è una combinazione tenuta premuta insieme, è una sequenza.

Le scorciatoie che userai davvero ogni giorno sono poche:

- `Ctrl+b` poi `d` — **detach**, ti stacchi dalla sessione lasciandola attiva sul server
- `Ctrl+b` poi `c` — crea una nuova finestra
- `Ctrl+b` poi `n` / `p` — passa alla finestra successiva/precedente
- `Ctrl+b` poi un numero (`0`, `1`, `2`...) — vai direttamente alla finestra con quel numero
- `Ctrl+b` poi `%` — divide il pannello corrente in verticale (due colonne)
- `Ctrl+b` poi `"` — divide il pannello corrente in orizzontale (due righe)
- `Ctrl+b` poi le freccette — passa da un pannello all'altro

Per uscire davvero da tmux (non solo staccarsi), basta chiudere tutte le finestre, ad esempio digitando `exit` in ognuna, oppure premere `Ctrl+b` poi `x` per chiudere il pannello corrente chiedendo conferma.

## Sessioni: il motivo per cui usi tmux

Il comando chiave è `tmux attach`. Dopo esserti staccato con `Ctrl+b d`, la sessione resta in background. Per riprenderla:

```
tmux attach
```

Se ne hai più di una attiva, tmux te lo fa notare e devi specificare quale riprendere:

```
tmux list-sessions
tmux attach -t nome-sessione
```

Conviene dare un nome sensato alle sessioni invece di lasciare quello numerico di default, soprattutto se ne tieni aperte diverse per progetti diversi:

```
tmux new -s deploy-staging
tmux new -s log-produzione
```

Questo è lo scenario classico in cui tmux ti salva la giornata: lanci un'importazione di dati che richiede un'ora, ti stacchi con `Ctrl+b d`, chiudi il laptop e vai a pranzo. Il processo continua a girare sul server. Quando torni, `tmux attach -t nome-sessione` e sei esattamente dove avevi lasciato, output compreso.

## Finestre e pannelli: organizzare il lavoro

Una **finestra** in tmux è l'equivalente di una tab: occupa tutto lo schermo e puoi passare da una all'altra senza perdere nulla di quelle rimaste indietro. Un **pannello** invece divide lo spazio della finestra corrente in più riquadri visibili contemporaneamente.

Un setup molto comune per chi lavora su un progetto web è:

```
Ctrl+b %     # divide in due colonne
Ctrl+b "     # divide il pannello di destra in due righe
```

Risultato: a sinistra un editor o una shell per i comandi, in alto a destra i log dell'applicazione (`tail -f`), in basso a destra magari `htop` per controllare il carico del server. Tutto visibile insieme, nella stessa finestra di terminale.

Per ridimensionare i pannelli tieni premuto il prefisso e usa `Ctrl+b` seguito dalle freccette tenendo premuto `Ctrl` (dipende dalla configurazione, ma di default funziona con `Ctrl+b` poi la freccia mentre il tasto resta attivo per qualche secondo), oppure più semplicemente trascina i bordi con il mouse se hai abilitato il supporto mouse (ne parlo più sotto).

## Un file di configurazione minimo che vale la pena avere

tmux legge la configurazione da `~/.tmux.conf`. Non serve molto per migliorare sensibilmente l'esperienza:

```
# abilita il supporto del mouse (click per cambiare pannello, drag per ridimensionare)
set -g mouse on

# tiene molte righe di history per finestra
set -g history-limit 10000

# avvia la numerazione delle finestre da 1 invece che da 0
set -g base-index 1

# riduce il tempo di attesa dopo Esc, utile con Vim/Neovim dentro tmux
set -sg escape-time 0
```

Dopo averlo modificato, non serve riavviare tmux: basta ricaricare la configurazione dalla sessione attiva con `Ctrl+b` poi `:` e scrivere:

```
source-file ~/.tmux.conf
```

## tmux vs screen

Chi lavora su server Linux da tempo probabilmente conosce anche `screen`, il predecessore storico di tmux. Fanno più o meno la stessa cosa — sessioni persistenti, finestre, detach/attach — ma tmux ha un modello di pannelli più flessibile (puoi dividerli in qualsiasi configurazione, non solo a griglia fissa), una configurazione più leggibile e uno sviluppo attivo, mentre `screen` è sostanzialmente fermo da anni. Se puoi scegliere su un server nuovo, scegli tmux.

## Errori comuni

**"sessions should be nested with care, unset $TMUX to force"** — stai provando ad aprire tmux da dentro un'altra sessione tmux già attiva. Di solito è un errore: se ti sei connesso via SSH e vedi questo messaggio, probabilmente la shell di login lancia già tmux automaticamente. Usa `tmux attach` invece di `tmux` per riprendere quella esistente, oppure staccati prima con `Ctrl+b d`.

**Il mouse non funziona / seleziona testo in modo strano** — ricordati di aggiungere `set -g mouse on` al file di configurazione. Senza quella riga, il click con il mouse viene passato al terminale sottostante invece che gestito da tmux.

**Copiare testo è scomodo** — con il mouse disabilitato, selezionare testo con il trackpad come faresti normalmente in un terminale funziona comunque, basta tenere premuto `Shift` mentre selezioni (su molti terminali) per bypassare tmux e usare la selezione nativa del terminale.

**La sessione è sparita dopo un riavvio del server** — tmux non salva lo stato su disco, vive in memoria. Se il server si riavvia o il demone tmux viene ucciso, la sessione è persa per sempre. Per processi davvero critici che devono sopravvivere a un riavvio, serve un supervisore come `systemd` o `supervisord`, non tmux.

## Quando usarlo (e quando no)

tmux è perfetto per lavoro interattivo su server remoti: deploy manuali, debug in tempo reale, monitoraggio di log, sessioni di lavoro lunghe che non vuoi perdere per una disconnessione. Non è lo strumento giusto per far girare un servizio in produzione in background in modo permanente — per quello esistono `systemd`, Docker o un process manager dedicato, che gestiscono riavvii automatici e logging in modo molto più robusto.

Ma per il lavoro quotidiano da terminale su un server, soprattutto se ci passi più di qualche minuto al giorno, è uno degli strumenti che ripaga il tempo investito a impararlo già dalla prima settimana.
