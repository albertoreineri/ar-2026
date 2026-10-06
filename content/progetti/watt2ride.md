---
title: "Watt2Ride"
seoTitle: "Watt2Ride: mappa dei punti di ricarica per e-bike"
description: "Una mappa per trovare dove ricaricare la e-bike, con dati OpenStreetMap aggiornati ogni settimana e i contributi della community."
date: 2026-10-06
translationKey: "project-watt2ride"
projectType: "Web app · Progetto personale"
projectUrl: "https://watt2ride.com"
image: "img/projects/watt2ride.jpg"
imageWidth: 1920
imageHeight: 1050
imageAlt: "Watt2Ride: la mappa con i punti di ricarica per e-bike raggruppati per zona, sul Piemonte e le regioni vicine"
---

Watt2Ride è una mappa per chi va in e-bike e vuole sapere dove ricaricare prima di scoprirlo a metà strada. I dati vengono da OpenStreetMap e si aggiornano da soli ogni settimana; a completarli ci pensano gli utenti, con preferiti, recensioni e punti segnalati. Intorno c'è un sito di presentazione e un blog, in inglese e in italiano.

- **Stato**: online, agli inizi
- **Costruita con**: JavaScript senza framework, Cloudflare Pages, Functions e D1, OpenStreetMap
- **Fatta da**: me, da solo, dall'idea al deploy, con l'AI come aiuto per velocizzare la realizzazione

## Perché l'ho fatta

Ho una bici elettrica, e quando vado in posti che non conosco devo sempre calcolare le distanze a casa, prima di partire, per essere sicuro di riuscire a tornare. Dover rientrare a forza di pedali per 25 km non è piacevole e rovinerebbe la gita.

Così mi sono costruito la mappa che mi serviva: una che mi dica dove posso ricaricare, senza fare i conti prima.

## Cosa fa

- Una mappa pubblica e navigabile senza account. La registrazione serve solo per salvare i preferiti, scrivere recensioni e proporre nuovi punti.
- Per ogni punto di ricarica mostra i dettagli utili (costo, orari, data dell'ultimo rilievo) e i bar o i servizi nei dintorni.
- Dice quanto sono completi i dati di un punto e avvisa quando la posizione è approssimativa. Da lì si può aprire il punto su Google Maps o OpenStreetMap, o suggerire una modifica.
- Ricerca per indirizzo, con suggerimenti mentre scrivi. I preferiti stanno in un elenco e si possono mostrare tutti insieme sulla mappa.
- Si installa come app sul telefono (PWA).
- Interfaccia bilingue, italiano e inglese, con sito di presentazione e blog.
- Un pannello di amministrazione protetto, per moderare i punti proposti dagli utenti.

<div class="project-shots">
  <figure class="project-shot">
    <img src="/img/projects/watt2ride-mobile.jpg" alt="Watt2Ride sul telefono: la mappa con il pulsante dei filtri e la barra con Vicino a me, Cerca, Preferiti e Menu" width="640" height="1028" loading="lazy">
    <figcaption>Sul telefono: mappa a tutto schermo e una barra con le azioni principali.</figcaption>
  </figure>
  <figure class="project-shot">
    <img src="/img/projects/watt2ride-details.jpg" alt="La scheda di un punto di ricarica in tema scuro: avviso sulla posizione approssimativa, completezza dei dati al 20%, link a Google Maps e OpenStreetMap, pulsanti per salvare nei preferiti e suggerire una modifica" width="900" height="907" loading="lazy">
    <figcaption>La scheda di un punto: avviso sulla posizione, completezza dei dati, link esterni, preferiti e recensione.</figcaption>
  </figure>
</div>

## Come è costruita

Prima una premessa: questo stack è quello di un progetto agli inizi, ed è semplice di proposito. Volevo metterlo online in modo semplice, senza aggiungere altro lavoro di gestione a quello dei server che già seguo. Se il progetto decolla, valuterò soluzioni più robuste.

### Niente framework

HTML, CSS e JavaScript puri, con pochi script Node senza dipendenze npm. Non perché non sappia usare i framework: è una scelta voluta, per tenere il sito leggero e semplice da mantenere, senza una catena di strumenti da aggiornare.

### Backend serverless

Il backend gira su Cloudflare Pages Functions, con un database D1 (SQLite). Non c'è un server tradizionale da gestire.

### Autenticazione fatta in casa

- Password con **PBKDF2**, tramite Web Crypto.
- Sessioni con cookie HttpOnly.
- Rate limiting.

Ho calibrato il numero di iterazioni dell'hash sul limite di 10 ms di CPU del piano gratuito di Cloudflare. Il numero è salvato per ogni utente, così in futuro posso aumentarlo senza invalidare gli account esistenti.

### La pipeline dei dati

I dati dei punti di ricarica non vengono interrogati a ogni visita: una pipeline li prepara e li pubblica come file statico. Una volta a settimana parte da sola, e io non devo fare niente.

```
Overpass API → pulizia e deduplica → geocoding inverso → file JSON statico
```

- **Pulizia**: scarta i falsi positivi, per esempio le colonnine per auto, che non servono a chi va in e-bike.
- **Esecuzione**: ogni settimana con GitHub Actions, che fa anche il deploy.
- **Punti di interesse vicini**: sono un file separato, caricato solo all'apertura del primo pannello. Il sito resta leggero e non carica un servizio pubblico come Overpass.

### Dati utente e licenza ODbL

I dati degli utenti (preferiti, recensioni) sono tenuti strutturalmente separati dai dati di OpenStreetMap, per rispettare la licenza ODbL con cui questi ultimi sono distribuiti.

### Contenuti e social semi-automatici

Sto sfruttando questa app per testare alcuni automatismi. Ho creato una pipeline che recupera le foto da Pexels, genera i caroselli per Instagram (1080×1350, con Playwright) e li mette in coda su Buffer per Instagram e Facebook.

### Deploy controllato

Una cartella `dist/` contiene solo i file pubblici. Il cache busting con hash dei contenuti evita che le PWA già installate restino ferme a una versione vecchia.

### Privacy

Google Analytics usa Consent Mode v2 con un banner cookie, quindi non traccia nulla prima del consenso.
