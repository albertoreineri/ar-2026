---
title: "rsync: la guida pratica per sincronizzare file e fare backup"
date: 2026-10-26
description: "Come usare rsync per sincronizzare cartelle e fare backup incrementali, in locale e su server remoti via SSH: i flag essenziali, gli errori comuni e qualche trucco utile."
tags: ["Guide", "Linux"]
translationKey: "rsync-practical-guide"
---

Se gestisci un server o anche solo il tuo computer, prima o poi ti troverai a dover copiare una cartella piena di file da un posto a un altro: un backup, una migrazione, una sincronizzazione tra due macchine. Il primo istinto è spesso `cp -r` o, se la destinazione è remota, `scp -r`. Funzionano, ma hanno un difetto grosso: copiano **tutto**, ogni volta. Se la cartella ha 50 GB e ne cambi 10 MB, aspetti comunque che vengano trasferiti 50 GB. **rsync** risolve esattamente questo problema, ed è uno degli strumenti che uso più spesso quando lavoro da terminale.

## Cos'è rsync e perché è diverso da cp o scp

rsync (remote sync) confronta la sorgente e la destinazione e trasferisce **solo le differenze**: file nuovi, file modificati, file cancellati (se lo chiedi esplicitamente). Per farlo usa un algoritmo che divide i file in blocchi e trasferisce solo i blocchi che sono effettivamente cambiati, non l'intero file.

Il risultato pratico: la prima sincronizzazione di una cartella grande richiede lo stesso tempo di una copia normale, ma tutte le volte successive sono quasi istantanee, perché rsync deve occuparsi solo di quello che è cambiato da allora. Per backup periodici o per mantenere sincronizzate due copie dello stesso progetto, è la differenza tra aspettare un'ora e aspettare pochi secondi.

In più, a differenza di `cp`, rsync può:

- preservare permessi, proprietario e timestamp dei file originali;
- lavorare su una connessione remota via SSH, cifrando il trasferimento;
- riprendere un trasferimento interrotto senza ripartire da zero;
- cancellare dalla destinazione i file che non esistono più nella sorgente, se glielo chiedi.

## La sintassi di base

```
rsync [opzioni] origine destinazione
```

L'esempio più semplice, per sincronizzare due cartelle sulla stessa macchina:

```
rsync -av /home/alberto/progetti/ /mnt/backup/progetti/
```

Qui `-a` (archive) è l'opzione che userai quasi sempre: è una scorciatoia che abilita insieme ricorsione nelle sottocartelle, preservazione di permessi, timestamp, link simbolici e proprietario. `-v` (verbose) mostra cosa sta facendo, file per file, utile per capire cosa viene effettivamente trasferito.

<svg class="hi-diagram" width="300" height="200" viewBox="0 0 300 200" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="10" y="30" width="110" height="60" rx="14" class="hi-fill hi-line" stroke-width="2"/>
  <rect x="26" y="48" width="78" height="6" rx="3" class="hi-bar"/>
  <rect x="26" y="60" width="52" height="6" rx="3" class="hi-bar"/>
  <rect x="26" y="72" width="64" height="6" rx="3" class="hi-bar"/>

  <line x1="122" y1="60" x2="168" y2="60" class="hi-muted-stroke" stroke-width="2"/>
  <circle cx="145" cy="60" r="5" class="hi-accent-dot"/>

  <rect x="170" y="30" width="110" height="60" rx="14" class="hi-fill hi-ink-stroke" stroke-width="2.5"/>
  <rect x="186" y="48" width="78" height="6" rx="3" class="hi-bar"/>
  <rect x="186" y="60" width="30" height="6" rx="3" class="hi-bar"/>
  <rect x="186" y="72" width="64" height="6" rx="3" class="hi-bar"/>
</svg>

A sinistra la cartella di origine, a destra la destinazione: rsync confronta i file (il pallino giallo segna il punto di controllo) e trasferisce solo i blocchi diversi, qui la seconda riga, più corta nella destinazione perché non ancora aggiornata.

**Attenzione alla barra finale (`/`) dopo il nome della cartella**, perché cambia completamente il comportamento:

- `rsync -av progetti/ /backup/` copia il **contenuto** di `progetti` dentro `/backup`.
- `rsync -av progetti /backup/` copia la cartella `progetti` **stessa** dentro `/backup`, creando `/backup/progetti`.

È l'errore più comune per chi inizia a usare rsync, e capita di scoprirlo solo guardando dove sono finiti davvero i file.

## Sincronizzare con un server remoto via SSH

Il caso d'uso più comune è il backup verso (o da) un server remoto, usando SSH come trasporto:

```
rsync -avz -e ssh /home/alberto/progetti/ utente@server.remoto.it:/home/utente/backup/
```

Qui `-z` comprime i dati durante il trasferimento (utile su connessioni lente, inutile se stai già trasferendo file compressi come immagini o video), e `-e ssh` specifica esplicitamente SSH come canale, anche se nella maggior parte dei casi è già il default se hai SSH installato.

Se usi chiavi SSH (e dovresti: ne ho parlato nella [guida pratica a SSH](/introduzione-a-ssh-cose-e-come-funziona/)) e una porta non standard, puoi specificarla così:

```
rsync -avz -e "ssh -p 2222" /home/alberto/progetti/ utente@server.remoto.it:/home/utente/backup/
```

Per copiare nella direzione opposta, dal server remoto al tuo computer, basta invertire origine e destinazione:

```
rsync -avz -e ssh utente@server.remoto.it:/var/www/sito/ /home/alberto/backup-sito/
```

## Simulare prima di eseguire: --dry-run

Prima di lanciare un comando che tocca molti file, specialmente se include `--delete` (ne parliamo subito), vale sempre la pena simulare l'operazione:

```
rsync -avz --dry-run /home/alberto/progetti/ /mnt/backup/progetti/
```

Con `--dry-run` rsync mostra esattamente cosa farebbe — quali file copierebbe, quali cancellerebbe — senza toccare nulla. È la rete di sicurezza che ti evita sorprese, soprattutto quando il comando è lungo o lo stai eseguendo su un server in produzione.

## Mantenere identiche due cartelle: --delete

Di default, rsync aggiunge e aggiorna file nella destinazione, ma non cancella nulla. Se un file viene rimosso dalla sorgente, resta comunque nella destinazione. Questo va bene per un backup che vuoi accumulare nel tempo, ma non se vuoi che la destinazione sia uno specchio esatto della sorgente.

```
rsync -avz --delete /home/alberto/progetti/ /mnt/backup/progetti/
```

`--delete` cancella dalla destinazione tutto ciò che non esiste più nella sorgente. È un'opzione potente e, se usata nella direzione sbagliata (per esempio invertendo per errore origine e destinazione), può cancellare dati che volevi tenere. **Usala sempre prima con `--dry-run`**, specialmente le prime volte che la usi su una nuova coppia di cartelle.

## Escludere file e cartelle

Raramente vuoi sincronizzare davvero tutto. Cartelle come `node_modules`, `.git`, file di cache o log temporanei di solito non servono in un backup:

```
rsync -avz --exclude 'node_modules' --exclude '.git' --exclude '*.log' /home/alberto/progetti/ /mnt/backup/progetti/
```

Se le esclusioni diventano tante, è più comodo metterle in un file e referenziarlo:

```
rsync -avz --exclude-from='escludi.txt' /home/alberto/progetti/ /mnt/backup/progetti/
```

dove `escludi.txt` contiene un pattern per riga, con la stessa sintassi usata negli esempi sopra.

## Backup incrementali con cronologia: --link-dest

Un trucco che uso spesso per i backup di un sito o di un progetto è combinare rsync con `--link-dest`, che crea backup "incrementali" risparmiando spazio su disco: i file non cambiati vengono collegati tramite hard link alla copia del backup precedente, invece di essere duplicati fisicamente.

```
rsync -avz --delete --link-dest=/mnt/backup/2026-10-25/ /home/alberto/progetti/ /mnt/backup/2026-10-26/
```

Il risultato è una cartella `2026-10-26` che contiene l'intero stato della sorgente a quella data, ma occupa spazio reale su disco solo per i file effettivamente cambiati rispetto al backup del giorno prima. Ogni cartella di backup resta comunque navigabile e completa, come se fosse una copia a parte: è lo stesso principio usato da tool come Time Machine di Apple o da `rsnapshot`, che internamente si basa proprio su rsync con questa tecnica.

## Automatizzare con cron

Una volta trovato il comando giusto, ha senso automatizzarlo. Ne ho scritto nella [guida a cron](/come-funziona-cron/): basta aggiungere una riga al crontab, per esempio per un backup ogni notte alle 3:

```
0 3 * * * rsync -avz --delete /var/www/sito/ /mnt/backup/sito/ >> /var/log/backup-sito.log 2>&1
```

Il redirect verso un file di log è importante: cron non ha un terminale a cui mostrare l'output, quindi senza salvarlo da qualche parte non avrai modo di scoprire se il backup è andato storto finché non ti servirà davvero e non ci sarà.

## Qualche opzione utile in più

- `--progress`: mostra l'avanzamento del trasferimento file per file, comodo quando copi pochi file molto grandi e vuoi vedere a che punto sei.
- `-n`: alias di `--dry-run`, per chi scrive comandi al volo.
- `--max-size=100M`: esclude dal trasferimento i file più grandi della soglia indicata, utile per lasciare fuori dump di database enormi da un backup "leggero".
- `--backup --backup-dir=precedente/`: invece di sovrascrivere i file modificati, li sposta in una cartella separata prima di aggiornarli, come rete di sicurezza aggiuntiva.
- `-u` (update): salta i file nella destinazione che hanno una data più recente di quelli nella sorgente, utile se sincronizzi in entrambe le direzioni e vuoi evitare di sovrascrivere modifiche più fresche.

## In sintesi

rsync non è solo "un cp più veloce": è lo strumento giusto ogni volta che devi mantenere sincronizzate due copie degli stessi dati, in locale o tra server diversi, senza risprecare banda e tempo a ritrasferire quello che non è cambiato. Parti sempre con `--dry-run` quando il comando è nuovo o distruttivo (`--delete` in particolare), automatizza con cron una volta che sei sicuro del comando, e considera `--link-dest` se ti serve una cronologia di backup senza far esplodere lo spazio su disco. Una volta che il comando giusto è nel tuo crontab, il backup smette di essere una cosa a cui pensare.
