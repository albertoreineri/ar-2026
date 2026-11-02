---
title: "mysqldump: guida pratica al backup e restore di MySQL/MariaDB"
date: 2026-11-02
description: "Come fare il backup di un database MySQL o MariaDB con mysqldump, come ripristinarlo, come automatizzarlo con cron e gli errori più comuni da evitare."
tags: ["Guide", "Linux"]
translationKey: "mysql-backup-restore-guide"
---

Se gestisci un sito con WordPress, Laravel o qualsiasi altra app che si appoggia a MySQL o MariaDB, il backup dei file non basta. Puoi avere una copia perfetta di tutto il codice e degli upload, ma se il database va perso — un `DROP TABLE` sbagliato, un plugin che corrompe dati, un disco che muore — il sito è morto lo stesso. [Ho già scritto di rsync per il backup dei file](/rsync-guida-pratica-backup-sincronizzazione/), ma un database vive la sua vita a parte e va trattato con uno strumento dedicato: **mysqldump**.

## Perché il backup dei file non basta

Un database non è un file statico come una foto o un PDF: è un insieme di tabelle collegate tra loro, con indici, chiavi esterne e transazioni che possono essere a metà strada mentre leggi. Copiare a freddo i file binari di MySQL (di solito in `/var/lib/mysql`) mentre il server è in esecuzione è un'ottima ricetta per un backup corrotto e inutilizzabile: alcuni file potrebbero essere copiati mentre il motore li sta ancora scrivendo.

mysqldump risolve il problema lavorando a un livello più alto: si collega al database come farebbe un client qualsiasi, legge i dati **in modo consistente** e li traduce in un normale file di testo con i comandi SQL (`CREATE TABLE`, `INSERT INTO`...) necessari per ricrearlo da zero. Il risultato è un file che puoi leggere, versionare, comprimere, spostare su un altro server e, soprattutto, ripristinare senza sorprese.

## Un dump semplice

Il comando base per esportare un database si usa così:

```
mysqldump -u nome_utente -p nome_database > backup.sql
```

Il flag `-p` senza valore ti chiede la password a schermo (non scriverla mai in chiaro nel comando, finirebbe nella history della shell). Se preferisci non essere interrotto, puoi usare un file `.my.cnf` con le credenziali, ma su quello torno più avanti.

Il file `backup.sql` che ottieni è semplice testo SQL: puoi aprirlo con un editor, puoi fare `grep` per cercare una riga specifica, puoi persino copiare al suo interno solo la parte che ti interessa.

<svg class="hi-diagram" width="300" height="130" viewBox="0 0 300 130" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="35" cy="65" r="26" class="hi-fill hi-line" stroke-width="2"/>
  <line x1="61" y1="65" x2="105" y2="65" class="hi-muted-stroke" stroke-width="2"/>

  <rect x="107" y="40" width="90" height="50" rx="14" class="hi-fill hi-ink-stroke" stroke-width="2.5"/>
  <circle cx="178" cy="50" r="5" class="hi-accent-dot"/>
  <line x1="197" y1="65" x2="241" y2="65" class="hi-muted-stroke" stroke-width="2"/>

  <rect x="243" y="30" width="50" height="70" rx="12" class="hi-fill hi-line" stroke-width="2"/>
  <rect x="253" y="48" width="30" height="5" rx="2.5" class="hi-bar"/>
  <rect x="253" y="58" width="22" height="5" rx="2.5" class="hi-bar"/>
  <rect x="253" y="68" width="26" height="5" rx="2.5" class="hi-bar"/>
</svg>

Il cerchio a sinistra è il database vivo e in esecuzione; passa per mysqldump (il box in evidenza, con il pallino giallo che segna il punto dove i dati vengono letti in modo consistente) e finisce in un file di testo SQL a destra, pronto per essere compresso o spostato altrove.

## Comprimere il dump

Un dump di un database con migliaia di righe può diventare grande velocemente, ma è anche estremamente comprimibile, perché è testo ripetitivo. Conviene comprimerlo al volo con `gzip`, senza passare da un file intermedio non compresso:

```
mysqldump -u nome_utente -p nome_database | gzip > backup.sql.gz
```

Per ripristinarlo basta invertire il processo con `gunzip -c` o `zcat` in pipe verso `mysql`, come vedi più avanti.

## Opzioni che fanno davvero la differenza

Il comando base funziona, ma su un database in produzione con tabelle **InnoDB** (lo storage engine di default da anni) conviene aggiungere due flag:

```
mysqldump -u nome_utente -p --single-transaction --quick nome_database | gzip > backup.sql.gz
```

- **`--single-transaction`**: avvia il dump dentro un'unica transazione, così le tabelle InnoDB vengono lette in uno stato consistente in un dato istante, senza bloccare scritture concorrenti sul resto del database. Senza questo flag, mysqldump di default blocca le tabelle durante l'export, cosa che su un sito in produzione significa downtime delle query.
- **`--quick`**: forza mysqldump a leggere e scrivere riga per riga invece di caricare tutta la tabella in memoria prima di scrivere il dump. Su tabelle grandi evita che il processo esploda in RAM.

Se usi ancora tabelle **MyISAM** (più raro oggi, ma capita su installazioni vecchie), `--single-transaction` non serve a molto perché MyISAM non supporta le transazioni: in quel caso mysqldump blocca comunque le tabelle in lettura per garantire la consistenza.

### Backup di tutti i database insieme

Se il server ospita più database (comune su un VPS condiviso tra diversi siti), puoi esportarli tutti in un colpo:

```
mysqldump -u root -p --single-transaction --quick --all-databases | gzip > backup-completo.sql.gz
```

Utile per un disaster recovery completo del server, ma per un singolo sito è quasi sempre meglio avere un dump separato per database: più piccolo, più veloce da ripristinare, e non rischi di ripristinare per sbaglio dati di un altro progetto.

## Il restore

Ripristinare un dump è altrettanto semplice, basta reindirizzare il file SQL dentro il client `mysql` invece che fuori:

```
mysql -u nome_utente -p nome_database < backup.sql
```

Se il dump è compresso, lo decomprimi al volo in pipe, senza doverlo salvare su disco scompattato:

```
gunzip -c backup.sql.gz | mysql -u nome_utente -p nome_database
```

**Importante:** il database di destinazione (`nome_database` nel comando sopra) deve già esistere — mysqldump non lo crea da solo a meno che tu non abbia usato `--databases` in fase di export. Se non esiste ancora:

```
mysql -u root -p -e "CREATE DATABASE nome_database CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

Specificare il charset in fase di creazione evita uno dei problemi più fastidiosi del restore: caratteri accentati o emoji che diventano punti interrogativi perché il database di destinazione usa un charset diverso da quello di origine (tipicamente il vecchio `latin1` contro `utf8mb4`).

## Automatizzarlo con cron

Un backup che fai a mano quando ti ricordi non è un backup, è una scommessa. Come ho spiegato nella [guida a cron](/come-funziona-cron/), la soluzione è uno script schedulato che gira ogni notte:

```bash
#!/bin/bash
# backup-db.sh
DATA=$(date +%Y%m%d)
DEST=/home/backup/db
mkdir -p "$DEST"

mysqldump --defaults-extra-file=/etc/mysql-backup.cnf \
  --single-transaction --quick nome_database | gzip > "$DEST/nome_database_$DATA.sql.gz"

# tiene solo gli ultimi 14 giorni
find "$DEST" -name "nome_database_*.sql.gz" -mtime +14 -delete
```

e in crontab:

```
0 2 * * * /home/user/backup-db.sh >> /var/log/db-backup.log 2>&1
```

Il file `/etc/mysql-backup.cnf` referenziato con `--defaults-extra-file` è il modo corretto per non scrivere la password nello script o nella crontab, dove chiunque abbia accesso al server la leggerebbe in chiaro:

```
[client]
user=backup_user
password=una_password_lunga_e_dedicata
```

Dagli permessi restrittivi (`chmod 600`) e, se puoi, crea un utente MySQL dedicato ai backup con solo i permessi `SELECT`, `LOCK TABLES` e `SHOW VIEW` — non serve che l'utente che fa i dump possa anche scrivere nel database.

## Dump e restore tra server diversi

mysqldump è anche lo strumento giusto per migrare un database da un server a un altro, per esempio quando cambi hosting. Il trucco è non salvare mai un file intermedio se puoi evitarlo, e passare direttamente da un server all'altro via SSH:

```
mysqldump -u utente -p --single-transaction nome_database | \
  ssh user@nuovo-server "mysql -u utente -p nome_database"
```

In questo modo il dump non tocca mai il disco: esce dal vecchio server, passa in streaming attraverso SSH, ed entra direttamente nel database del nuovo server. Più veloce e più sicuro di scaricare un file, caricarlo altrove e poi importarlo.

## Problemi comuni

**"MySQL server has gone away" durante un dump grande.** Il server ha chiuso la connessione perché il dump ha superato `max_allowed_packet`. Si risolve aumentando il valore sia nel server (`my.cnf`) sia passando `--max-allowed-packet=256M` a mysqldump.

**Il restore è lentissimo.** Normale per database grandi: ogni `INSERT` nel dump viene eseguito con i suoi indici aggiornati in tempo reale. Aggiungere `--disable-keys` al dump (per tabelle MyISAM) o avvolgere l'import dentro una transazione con `--single-transaction` sul lato restore, quando possibile, aiuta parecchio.

**Charset sbagliato dopo il restore.** Come visto sopra, crea sempre il database di destinazione con lo stesso charset dell'originale, e verificalo con `SHOW CREATE DATABASE nome_database;` prima di importare, non dopo.

**Il backup cresce senza controllo.** Se non hai una rotazione (come il `find -mtime +14 -delete` dello script sopra), accumuli dump per mesi finché il disco non si riempie. [ncdu](/ottimizzare-lo-spazio-su-disco-da-terminale-con-ncdu-una-guida-essenziale-per-i-server/) è lo strumento giusto per scoprirlo quando è già troppo tardi — meglio prevenire con una rotazione automatica.

## In sintesi

mysqldump non ha bisogno di configurazioni complicate per essere utile: un comando con `--single-transaction` e `--quick`, una pipe verso `gzip`, uno script schedulato con cron e una rotazione dei vecchi file sono sufficienti per dormire sonni tranquilli. L'unica regola che vale davvero la pena ricordare è testare il restore almeno una volta, su un database di prova: un backup che non hai mai provato a ripristinare è, nella pratica, un backup che non sai se funziona.
