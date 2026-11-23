---
title: "Docker: guida pratica per iniziare con i container"
date: 2026-11-23
description: "Cos'è Docker, perché conviene usarlo anche per progetti piccoli, e come scrivere il tuo primo Dockerfile e il tuo primo docker-compose.yml, passo per passo."
tags: ["Guide", "Linux"]
translationKey: "docker-practical-guide"
---

"Funziona sul mio PC" è probabilmente la frase più pronunciata nella storia dello sviluppo software, di solito un attimo prima di scoprire che sul server qualcosa va storto. Versione diversa di PHP, estensione mancante, variabile d'ambiente che nessuno ricordava più di aver impostato. **Docker** nasce per eliminare questo problema: non ti dà "un ambiente simile" a quello di produzione, te lo dà identico, perché lo impacchetti tu stesso insieme al codice.

Non è uno strumento solo per team grandi o infrastrutture complesse. Lo uso regolarmente anche per progetti piccoli, proprio perché mi evita di installare (e disinstallare) versioni diverse di PHP, Node o database direttamente sul mio computer o su un server condiviso.

## Cos'è Docker (e cosa non è)

Docker non è una macchina virtuale, anche se all'inizio può sembrare che faccia la stessa cosa. Una VM virtualizza un intero sistema operativo, con il suo kernel, i suoi driver, i suoi processi: pesante da avviare, pesante da mantenere. Un **container** Docker, invece, condivide il kernel del sistema che lo ospita e isola solo i processi, il filesystem e la rete dell'applicazione. Il risultato è che un container si avvia in meno di un secondo e pesa una frazione di una VM equivalente.

La differenza pratica: puoi far girare decine di container sulla stessa macchina senza accorgertene, mentre con altrettante VM il server andrebbe in ginocchio.

## Le tre parole chiave: Dockerfile, immagine, container

Qui si confondono quasi tutti quando iniziano, quindi vale la pena fissarlo bene:

- Il **Dockerfile** è una ricetta testuale: una lista di istruzioni che dice "parti da questa base, copia questi file, installa queste dipendenze, esegui questo comando all'avvio".
- L'**immagine** è il risultato di quella ricetta: un pacchetto statico, pronto all'uso, che contiene tutto il necessario per far girare l'applicazione.
- Il **container** è un'istanza in esecuzione di un'immagine. Puoi avviarne una, dieci, cento copie dalla stessa immagine, ognuna isolata dalle altre.

<svg class="hi-diagram" width="300" height="130" viewBox="0 0 300 130" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="10" y="35" width="80" height="60" rx="14" class="hi-fill hi-line" stroke-width="2"/>
  <rect x="24" y="52" width="52" height="6" rx="3" class="hi-bar"/>
  <rect x="24" y="64" width="40" height="6" rx="3" class="hi-bar"/>
  <rect x="24" y="76" width="46" height="6" rx="3" class="hi-bar"/>

  <line x1="92" y1="65" x2="118" y2="65" class="hi-muted-stroke" stroke-width="2"/>

  <rect x="120" y="35" width="80" height="60" rx="14" class="hi-fill hi-line" stroke-width="2"/>
  <rect x="134" y="50" width="52" height="6" rx="3" class="hi-bar"/>
  <rect x="134" y="62" width="52" height="6" rx="3" class="hi-bar"/>
  <rect x="134" y="74" width="30" height="6" rx="3" class="hi-bar"/>

  <line x1="202" y1="65" x2="228" y2="65" class="hi-muted-stroke" stroke-width="2"/>
  <circle cx="215" cy="65" r="5" class="hi-accent-dot"/>

  <circle cx="260" cy="48" r="28" class="hi-fill hi-ink-stroke" stroke-width="2.5"/>
  <circle cx="260" cy="90" r="18" class="hi-fill hi-ink-stroke" stroke-width="2"/>
</svg>

Da sinistra a destra: il Dockerfile (la ricetta), l'immagine che ne risulta dopo la build, e i container in esecuzione — qui due cerchi di dimensione diversa, per ricordare che dalla stessa immagine puoi avviare quante copie ti servono, anche con risorse diverse.

## I comandi essenziali

Prima di scrivere un Dockerfile, vale la pena giocare un po' con un'immagine già pronta, per capire il ciclo di vita di un container:

```
docker run -d -p 8080:80 --name mio-nginx nginx
```

Qui `-d` avvia il container in background (detached), `-p 8080:80` mappa la porta 8080 della tua macchina sulla porta 80 dentro il container, `--name` gli dà un nome leggibile invece di un ID casuale, e `nginx` è il nome dell'immagine, scaricata automaticamente da Docker Hub se non l'hai già in locale.

Gli altri comandi che userai di continuo:

```
docker ps                 # container in esecuzione
docker ps -a               # anche quelli fermi
docker logs mio-nginx      # output del container
docker exec -it mio-nginx bash   # entra dentro il container
docker stop mio-nginx
docker rm mio-nginx
docker images              # immagini scaricate/costruite
docker rmi nginx           # elimina un'immagine
```

`docker exec -it` è probabilmente quello che uso più spesso in fase di debug: ti apre una shell interattiva dentro il container già in esecuzione, utile per controllare file, variabili d'ambiente o log senza dover modificare nulla.

## Scrivere il tuo primo Dockerfile

Supponiamo di avere una semplice applicazione Node.js. Un Dockerfile minimo ma sensato è questo:

```
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

EXPOSE 3000
CMD ["node", "server.js"]
```

Qualche nota su scelte che non sono casuali:

- `node:20-alpine` usa una variante **Alpine**, una distribuzione Linux minimale: l'immagine finale pesa decine di MB invece di centinaia.
- `COPY package*.json ./` seguito da `RUN npm ci` **prima** di `COPY . .` non è un caso: Docker mette in cache ogni istruzione, e se non cambi il `package.json` la build successiva salta direttamente l'installazione delle dipendenze, risparmiando minuti ogni volta che modifichi il codice.
- `npm ci` invece di `npm install` installa esattamente le versioni bloccate nel `package-lock.json`, garantendo una build riproducibile.

Costruisci l'immagine con:

```
docker build -t mia-app:1.0 .
```

e avviala con `docker run -d -p 3000:3000 mia-app:1.0`.

## Volumi: far sopravvivere i dati al container

Un container è pensato per essere "effimero": lo distruggi e lo ricrei senza pensarci, per esempio quando aggiorni l'immagine. Il problema è che tutto quello che scrivi dentro il filesystem del container viene perso quando lo elimini. Per un database o per file caricati dagli utenti, questo non va bene.

La soluzione sono i **volumi**: cartelle gestite da Docker (o montate dal filesystem dell'host) che restano vive anche dopo che il container viene rimosso.

```
docker run -d --name mio-db -v dati-db:/var/lib/mysql mysql:8
```

`dati-db` qui è un volume gestito da Docker: se cancelli e ricrei il container `mio-db`, i dati dentro `/var/lib/mysql` restano intatti nel volume, pronti per il prossimo container che li monta.

## Orchestrare più container con docker-compose

Quasi nessuna applicazione reale è fatta di un solo container: di solito c'è almeno un'app e un database, spesso anche una cache o un reverse proxy. Scrivere a mano tutti i comandi `docker run` con le reti e i volumi giusti diventa presto ingestibile. **docker-compose** risolve il problema descrivendo l'intero stack in un unico file YAML.

<svg class="hi-diagram" width="300" height="170" viewBox="0 0 300 170" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="20" y="20" width="110" height="70" rx="14" class="hi-fill hi-ink-stroke" stroke-width="2.5"/>
  <rect x="36" y="40" width="78" height="6" rx="3" class="hi-bar"/>
  <rect x="36" y="52" width="60" height="6" rx="3" class="hi-bar"/>
  <rect x="36" y="64" width="70" height="6" rx="3" class="hi-bar"/>

  <rect x="170" y="20" width="110" height="70" rx="14" class="hi-fill hi-line" stroke-width="2"/>
  <rect x="186" y="40" width="78" height="6" rx="3" class="hi-bar"/>
  <rect x="186" y="52" width="40" height="6" rx="3" class="hi-bar"/>

  <line x1="130" y1="55" x2="170" y2="55" class="hi-muted-stroke" stroke-width="2"/>
  <circle cx="150" cy="55" r="5" class="hi-accent-dot"/>

  <line x1="225" y1="90" x2="225" y2="120" class="hi-muted-stroke" stroke-width="2"/>
  <rect x="190" y="122" width="70" height="30" rx="10" class="hi-fill hi-line" stroke-width="2"/>
  <rect x="200" y="134" width="50" height="6" rx="3" class="hi-bar"/>
</svg>

A sinistra il container dell'app (il riquadro con il contorno più marcato), a destra il container del database collegati dalla rete interna creata automaticamente da Compose (il pallino giallo segna la connessione), e sotto il volume che conserva i dati del database anche a container fermo.

Un `docker-compose.yml` per un'app web con database potrebbe essere:

```
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=mysql://utente:password@db:3306/miodb
    depends_on:
      - db

  db:
    image: mysql:8
    restart: unless-stopped
    environment:
      - MYSQL_ROOT_PASSWORD=password
      - MYSQL_DATABASE=miodb
    volumes:
      - dati-db:/var/lib/mysql

volumes:
  dati-db:
```

Due cose da notare: dentro la rete creata da Compose, il servizio `app` può raggiungere il database semplicemente usando `db` come hostname (il nome del servizio), senza bisogno di conoscere IP o configurare nulla. E con un solo comando avvii tutto lo stack:

```
docker compose up -d
```

e con `docker compose down` lo fermi e lo rimuovi (i volumi restano, a meno che aggiungi `-v`).

## Qualche buona pratica

- **Usa un `.dockerignore`**, lo stesso principio del `.gitignore`: evita di copiare `node_modules`, `.git` o file di log dentro l'immagine, rendendola più piccola e la build più veloce.
- **Non far girare i processi come root** dentro il container quando non è necessario: molte immagini ufficiali (incluso `node`) permettono di passare a un utente non privilegiato con `USER node` nel Dockerfile.
- **Usa tag espliciti per le immagini** (`node:20-alpine`, non solo `node:latest`): `latest` cambia nel tempo e quello che funziona oggi potrebbe rompersi dopo un aggiornamento che non hai controllato tu.
- **Pulisci regolarmente** con `docker system prune`, che rimuove container fermi, immagini non referenziate e reti inutilizzate: su un server che usa Docker da mesi può liberare diversi GB.

## In sintesi

Docker non elimina la complessità di un'applicazione, ma la rende **esplicita e riproducibile**: tutto quello che serve per far girare il progetto, dalle dipendenze alle variabili d'ambiente, finisce scritto in un Dockerfile o in un docker-compose.yml, invece che nella memoria di chi ha configurato il server tre anni fa. Se gestisci anche un solo server con più di un progetto sopra, vale la pena investire un pomeriggio per containerizzare almeno quello più delicato: la differenza, al prossimo deploy o al prossimo cambio di server, si sente.
