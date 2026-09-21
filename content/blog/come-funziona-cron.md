---
title: "Cron: come schedulare comandi automatici su Linux"
date: 2026-09-21
description: "Guida pratica a cron e crontab: come leggere la sintassi, schedulare backup e script ricorrenti, dove va a finire l'output e gli errori più comuni da evitare."
tags: ["Guide", "Linux"]
translationKey: "how-cron-works"
---

Se gestisci anche solo un server, prima o poi ti serve far girare qualcosa in automatico: un backup notturno, la pulizia di file temporanei, l'invio di una newsletter, il rinnovo di un certificato SSL. Su Linux lo strumento che fa questo da decenni si chiama **cron**, ed è probabilmente il demone più sottovalutato di tutto il sistema.

La cattiva notizia è che la sua sintassi sembra uscita da un rebus. La buona notizia è che una volta capita la logica, non la dimentichi più.

## Cos'è cron, in due frasi

**Cron** è un demone che gira in background su quasi ogni sistema Unix-like e controlla, minuto per minuto, se c'è qualche comando da eseguire secondo un orario prestabilito. Le regole che gli dici di seguire si chiamano **cron job**, e vivono dentro file di configurazione chiamati **crontab** (contrazione di "cron table").

Non serve installare niente: su Ubuntu, Debian, CentOS e praticamente ogni distribuzione server, cron è già lì, attivo di default.

## La sintassi crontab, spiegata una volta per tutte

Ogni riga di un crontab ha questa forma:

```
* * * * * comando-da-eseguire
```

I cinque asterischi rappresentano, nell'ordine: **minuto** (0-59), **ora** (0-23), **giorno del mese** (1-31), **mese** (1-12) e **giorno della settimana** (0-6, dove 0 è domenica).

<svg class="hi-diagram" width="300" height="180" viewBox="0 0 300 180" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="10" y="20" width="50" height="46" rx="12" class="hi-fill hi-line" stroke-width="2"/>
  <rect x="70" y="20" width="50" height="46" rx="12" class="hi-fill hi-line" stroke-width="2"/>
  <rect x="130" y="20" width="50" height="46" rx="12" class="hi-fill hi-line" stroke-width="2"/>
  <rect x="190" y="20" width="50" height="46" rx="12" class="hi-fill hi-line" stroke-width="2"/>
  <rect x="250" y="20" width="40" height="46" rx="12" class="hi-fill hi-ink-stroke" stroke-width="2.5"/>
  <circle cx="275" cy="30" r="5" class="hi-accent-dot"/>

  <line x1="35" y1="66" x2="35" y2="100" class="hi-muted-stroke" stroke-width="2"/>
  <line x1="95" y1="66" x2="95" y2="100" class="hi-muted-stroke" stroke-width="2"/>
  <line x1="155" y1="66" x2="155" y2="100" class="hi-muted-stroke" stroke-width="2"/>
  <line x1="215" y1="66" x2="215" y2="100" class="hi-muted-stroke" stroke-width="2"/>
  <line x1="270" y1="66" x2="270" y2="100" class="hi-muted-stroke" stroke-width="2"/>

  <rect x="15" y="110" width="270" height="50" rx="14" class="hi-fill hi-line" stroke-width="2"/>
  <rect x="30" y="124" width="60" height="8" rx="4" class="hi-bar"/>
  <rect x="100" y="124" width="90" height="8" rx="4" class="hi-bar"/>
  <rect x="200" y="124" width="70" height="8" rx="4" class="hi-bar"/>
  <rect x="30" y="140" width="120" height="8" rx="4" class="hi-bar"/>
</svg>

Da sinistra a destra: **minuto**, **ora**, **giorno del mese**, **mese**, **giorno della settimana** (in evidenza, con il pallino di accento a ricordare che è l'ultimo campo, spesso il più dimenticato), tutti e cinque confluiscono nel comando da eseguire, rappresentato dal box sotto.

Qualche esempio pratico vale più di mille spiegazioni:

```
0 3 * * *      → ogni giorno alle 3:00 di notte
*/15 * * * *   → ogni 15 minuti
0 9 * * 1      → ogni lunedì alle 9:00
0 0 1 * *      → il primo giorno di ogni mese, a mezzanotte
30 2 * * 1-5   → alle 2:30, dal lunedì al venerdì
```

L'asterisco `*` significa "ogni valore possibile" per quel campo. Lo slash `/` indica un intervallo (`*/15` = "ogni 15 unità"). Il trattino `-` indica un range (`1-5` = "da lunedì a venerdì"). La virgola `,` permette di elencare più valori (`1,15` = "il giorno 1 e il giorno 15 del mese").

## Come modificare il crontab

Non si modifica mai a mano il file di cron: si usa il comando `crontab`, che si occupa anche di far ripartire il demone quando serve.

```
crontab -e
```

Apre l'editor di default (spesso nano o vim) con il crontab dell'utente corrente. Da lì aggiungi una riga per ogni job, salvi ed esci: cron si accorge da solo della modifica, senza bisogno di riavviare nulla.

Altri comandi utili:

```
crontab -l      # elenca i job attivi per l'utente corrente
crontab -r      # rimuove TUTTI i job dell'utente (attenzione, è irreversibile)
sudo crontab -e -u www-data   # modifica il crontab di un altro utente
```

Ogni utente del sistema ha il proprio crontab, indipendente dagli altri. Se un job deve girare con permessi di root (es. riavviare un servizio), va messo nel crontab di root, non in quello del tuo utente normale.

## Un esempio reale: backup automatico del database

Supponiamo tu voglia fare un dump del database ogni notte alle 2:00, mantenendo la data nel nome del file:

```
0 2 * * * /usr/bin/mysqldump -u backup_user -p'password' nome_db > /home/backup/db_$(date +\%Y\%m\%d).sql
```

Nota il doppio `%` (`\%`) al posto del singolo: dentro un crontab, il simbolo `%` ha un significato speciale (va a capo nel comando), quindi se ti serve nel comando vero — come qui per `date +%Y%m%d` — va sempre scappato con il backslash.

Un'accortezza in più per gli script più complessi: **usa sempre percorsi assoluti**. Cron esegue i job con un ambiente (`PATH`, variabili) molto più povero di quello della tua shell interattiva, quindi un comando che a te funziona al volo dal terminale può fallire silenziosamente dentro cron perché non trova l'eseguibile.

## Dove finisce l'output (e perché non lo vedi mai)

Per default, cron invia l'output di ogni job (sia stdout che stderr) via email all'utente proprietario del crontab, usando il servizio di posta locale del sistema — che sulla maggior parte dei server moderni non è nemmeno configurato. Risultato: l'output sparisce nel nulla e non ti accorgi mai se un job sta fallendo.

La soluzione più semplice è reindirizzare tu stesso l'output verso un file di log:

```
0 3 * * * /home/user/backup.sh >> /var/log/backup.log 2>&1
```

`>>` aggiunge l'output in coda al file (senza sovrascriverlo), e `2>&1` fa sì che anche gli errori (stderr) finiscano nello stesso posto dell'output normale (stdout). Se un giorno il backup smette di funzionare, il log è il primo posto dove guardare.

Se invece vuoi **azzerare** completamente l'output (utile per comandi molto rumorosi di cui non ti interessa il risultato), puoi mandarlo verso `/dev/null`:

```
*/5 * * * * /home/user/script-rumoroso.sh > /dev/null 2>&1
```

## Errori comuni che perdono ore di debug

**Dimenticare l'ambiente**: come accennato, cron non carica il tuo `.bashrc` o `.bash_profile`. Se il tuo script si appoggia a variabili d'ambiente definite lì (es. `NODE_ENV`, path custom), vanno definite esplicitamente all'inizio dello script o direttamente nel crontab.

**Percorsi relativi**: uno script che fa `cd cartella` o richiama `python script.py` senza percorso assoluto probabilmente fallirà, perché la working directory di cron non è quella che ti aspetti. Meglio sempre `cd /percorso/assoluto && comando`, oppure indicare i path completi.

**Permessi mancanti**: se lo script scrive file o cartelle, verifica che l'utente proprietario del crontab abbia i permessi giusti su quei percorsi. Uno script lanciato manualmente da root che poi finisce nel crontab di un utente normale è una causa classica di fallimenti silenziosi.

**Job che si sovrappongono**: se un job gira ogni 5 minuti ma a volte impiega più di 5 minuti a finire, rischi di avere più istanze dello stesso script attive contemporaneamente, con risultati imprevedibili (due backup che scrivono sullo stesso file, per esempio). Per evitarlo, puoi usare `flock` per garantire che una sola istanza giri alla volta:

```
*/5 * * * * flock -n /tmp/mio-script.lock /home/user/mio-script.sh
```

Se lo script è già in esecuzione, `flock -n` fa terminare subito il nuovo tentativo senza avviarne un secondo.

## In sintesi

Cron non ha bisogno di essere capito al 100% per essere usato bene: bastano i cinque campi della sintassi, l'abitudine a usare sempre percorsi assoluti, e un reindirizzamento dell'output verso un file di log invece di lasciarlo sparire in un'email che nessuno legge. Con queste tre cose in tasca puoi automatizzare backup, pulizie, notifiche e qualunque script ricorrente senza dover ricordare tu stesso di lanciarlo ogni volta.

La prossima volta che ti ritrovi a fare la stessa operazione manuale ogni giorno alla stessa ora, chiediti se non sia il momento di darla in gestione a cron.
