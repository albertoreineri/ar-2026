---
title: "ncdu: trovare cosa occupa spazio su disco da terminale"
seoTitle: "ncdu: analizzare lo spazio su disco da terminale"
date: 2024-03-12
lastmod: 2026-09-24
description: "Come usare ncdu per trovare cosa riempie il disco di un server Linux, i colpevoli più comuni e cosa fare quando il disco è pieno ma ncdu non trova niente."
tags: ["Guide", "Linux"]
translationKey: "ncdu-disk-usage"
---

"No space left on device" è uno degli errori più banali e più distruttivi che possono capitare su un server. Il database smette di scrivere, i log si interrompono, le sessioni PHP falliscono, e a volte non riesci nemmeno a completare il login via SSH. In quel momento non ti serve una teoria sulla gestione dello storage: ti serve sapere **cosa** sta occupando spazio, e in fretta.

Lo strumento che uso per questo da anni è **ncdu**. In questa guida trovi come usarlo bene, le opzioni che contano su un server di produzione, i colpevoli che trovo più spesso e cosa fare nel caso più subdolo: il disco è pieno, ma ncdu non trova niente.

## Prima di ncdu: `df`

Il primo comando è sempre `df`, per capire **quale** filesystem è pieno:

```
df -h
```

Guarda la colonna `Use%` e il punto di montaggio (`Mounted on`). Il disco pieno potrebbe non essere quello di sistema: un volume separato per `/var` o per i backup, per esempio.

## Cos'è ncdu

**ncdu** (NCurses Disk Usage) è un'interfaccia interattiva per terminale sopra lo stesso concetto di `du`: scansiona una directory, calcola quanto occupa ogni sottocartella e ti mostra l'elenco ordinato per dimensione. Entri nelle cartelle con le frecce, risali, e in dieci secondi arrivi al file da 40 GB che non doveva essere lì.

La versione 2, riscritta in Zig, è più veloce e usa molta meno memoria sui filesystem con milioni di file. Alcune distribuzioni distribuiscono ancora la 1.x: i comandi descritti qui funzionano su entrambe.

## Installazione

```
# Debian, Ubuntu
sudo apt install ncdu

# Fedora
sudo dnf install ncdu

# RHEL, Rocky, AlmaLinux (serve EPEL)
sudo dnf install epel-release && sudo dnf install ncdu

# Arch
sudo pacman -S ncdu

# macOS
brew install ncdu
```

Su RHEL e derivate ncdu non è nei repository base: se non ti è chiaro cosa sia EPEL, trovi la spiegazione nella mia [guida alla gestione dei pacchetti in Linux](/gestione-dei-pacchetti-in-linux-cosa-sono-e-come-funzionano/).

## Come lo lancio su un server

Questo è il comando che uso quasi sempre:

```
sudo ncdu -x /
```

- **`sudo`**: senza privilegi di root ncdu non può leggere molte cartelle di sistema, e i totali risultano sbagliati per difetto.
- **`-x`**: resta su un solo filesystem. Senza questa opzione ncdu entra anche nei dischi montati, nelle condivisioni di rete e in `/proc`, e il risultato non ti dice niente su quale disco è pieno. Se `df` ti ha detto che il problema è su `/var`, lancia `sudo ncdu -x /var`.

Altre opzioni utili:

```
sudo ncdu -rx /                    # sola lettura: disattiva la cancellazione
sudo ncdu -x --exclude /srv/backup /
sudo ncdu -x -o /tmp/scan.json /   # salva la scansione in un file, senza interfaccia
ncdu -f /tmp/scan.json             # apre una scansione salvata
```

La modalità **`-r`** la uso sempre sui server di produzione, soprattutto quando ci lavora qualcun altro. Con `-rr` disattivi anche la possibilità di aprire una shell dall'interfaccia. Esportare la scansione con **`-o`** è comodo su un disco molto grande: la lanci una volta, magari di notte, e poi la esplori con calma, anche su un'altra macchina.

## I tasti che servono

| Tasto | Azione |
|---|---|
| `↑` `↓` (o `j` `k`) | Muoversi nell'elenco |
| `→` / `Invio` (o `l`) | Entrare nella cartella |
| `←` (o `h`, `<`) | Tornare alla cartella superiore |
| `s` / `n` / `C` | Ordina per dimensione / nome / numero di elementi |
| `a` | Dimensione reale su disco o dimensione apparente |
| `c` | Mostra quanti file contiene ogni cartella |
| `g` | Cambia visualizzazione di percentuale e grafico |
| `e` | Mostra o nasconde i file nascosti ed esclusi |
| `i` | Dettagli dell'elemento selezionato |
| `d` | Cancella l'elemento selezionato (chiede conferma) |
| `r` | Ricalcola la cartella corrente |
| `b` | Apre una shell nella cartella corrente |
| `q` | Esci |

Il tasto `c` insieme all'ordinamento con `C` è sottovalutato: ti mostra le cartelle con **centinaia di migliaia di file piccoli**, che non pesano molto in GB ma possono esaurire gli inode (ne parlo più sotto).

Sul tasto `d`: funziona, ma su un server io preferisco trovare il colpevole con ncdu e poi risolvere con il comando giusto. Cancellare a mano un file di log aperto o un file di Docker di solito crea più problemi di quanti ne risolva.

## I colpevoli più comuni

Dopo anni di server riempiti, i sospetti sono quasi sempre gli stessi.

**I log del journal di systemd** (`/var/log/journal`). Senza un limite possono arrivare a diversi GB. Controlla e riduci:

```
journalctl --disk-usage
sudo journalctl --vacuum-size=500M
```

Per rendere il limite permanente, imposta `SystemMaxUse=500M` in `/etc/systemd/journald.conf` e riavvia `systemd-journald`.

**I log delle applicazioni** (`/var/log/nginx`, `/var/log/apache2`, log di Laravel in `storage/logs`). Il problema è quasi sempre un log che nessuno ruota. La soluzione è una regola di **logrotate** in `/etc/logrotate.d/`, non la cancellazione a mano ogni tanto.

**Docker** (`/var/lib/docker`). Immagini vecchie, container fermi, cache di build. Prima guarda, poi pulisci:

```
docker system df
docker system prune
```

Attenzione: `docker system prune --volumes` cancella anche i volumi non collegati a un container, cioè potenzialmente i dati di un database. Non aggiungerlo senza sapere cosa c'è dentro.

**I binary log di MySQL** (`/var/lib/mysql/binlog.*`). MySQL 8 li attiva di default e li conserva per 30 giorni. Su un server con molte scritture possono pesare più del database stesso. Non cancellare i file a mano: dalla console di MySQL usa `PURGE BINARY LOGS BEFORE NOW() - INTERVAL 3 DAY;`, e riduci la conservazione con `binlog_expire_logs_seconds`. Se non usi la replica né il recupero point-in-time, valuta se ti servono. Ne parlo anche nella guida alla [LAMP stack su Ubuntu](/come-installare-una-lamp-stack/).

**Cache dei pacchetti e kernel vecchi.** `sudo apt clean` svuota `/var/cache/apt/archives`. `sudo apt autoremove` rimuove i kernel non più usati, che su `/boot` piccole sono una causa classica di aggiornamenti falliti.

**Le vecchie revisioni degli snap** (`/var/lib/snapd`). Ogni snap conserva di default tre versioni. `sudo snap set system refresh.retain=2` scende al minimo consentito.

**Backup dimenticati.** Il dump del database fatto "solo per sicurezza" prima di un aggiornamento, un anno fa, nella home di root. ncdu li trova in un secondo.

## Il disco è pieno, ma ncdu non trova niente

Il caso più frustrante: `df` dice 100%, ncdu somma 20 GB su un disco da 50. Le cause sono tre, in ordine di frequenza.

### File cancellati ma ancora aperti

Su Linux, cancellare un file rimuove il nome, ma lo spazio viene liberato solo quando **l'ultimo processo che lo tiene aperto lo chiude**. Classico: qualcuno cancella un log da 30 GB mentre il servizio ci sta ancora scrivendo. Il file sparisce da ncdu, ma lo spazio resta occupato.

```
sudo lsof +L1
```

mostra i file cancellati ancora aperti, con il processo che li tiene. La soluzione pulita è riavviare quel servizio. Se non puoi, puoi svuotare il file attraverso il descrittore del processo (con il PID e il numero di descrittore che vedi nell'output di `lsof`):

```
sudo truncate -s 0 /proc/PID/fd/NUMERO
```

La lezione per la prossima volta: per svuotare un log in uso non cancellarlo, **troncalo**: `sudo truncate -s 0 /var/log/file.log`.

### Inode esauriti

Un filesystem ha un numero massimo di file, non solo di byte. Se lo esaurisci, ottieni "No space left on device" con il disco mezzo vuoto:

```
df -i
```

Se `IUse%` è al 100%, cerca la cartella con milioni di file piccoli: in ncdu premi `c` per vedere il conteggio e `C` per ordinare. I responsabili tipici sono le sessioni PHP mai ripulite, le cache di un'applicazione e le code di posta.

### File nascosti sotto un punto di montaggio

Se scrivi in `/mnt/dati` mentre il disco non è montato, i file finiscono sul disco di sistema. Quando poi il disco viene montato, quei file restano lì, ma diventano invisibili. Per vederli, monta di nuovo la radice in un'altra posizione con un bind mount:

```
sudo mkdir /mnt/root-bind
sudo mount --bind / /mnt/root-bind
sudo ncdu -x /mnt/root-bind
```

Quando hai finito, `sudo umount /mnt/root-bind`.

## E se ncdu non è installato?

Sul server di un cliente non sempre puoi installare pacchetti. `du` c'è ovunque e dà lo stesso risultato, solo meno comodo da navigare:

```
sudo du -xh --max-depth=1 / 2>/dev/null | sort -h
```

Poi ripeti sulla cartella più grande, finché arrivi al colpevole.

## In sintesi

`df -h` per capire quale disco è pieno, `sudo ncdu -x` per capire cosa lo riempie, e il comando giusto per risolvere: `journalctl --vacuum-size`, logrotate, `docker system prune`, `PURGE BINARY LOGS`. Se i conti non tornano, `lsof +L1` e `df -i` risolvono quasi tutti i misteri.

Per le modifiche ai file di configurazione, come `journald.conf` o le regole di logrotate, ti può servire la mia [guida pratica a nano](/nano-editor-guida-per-principianti/).
