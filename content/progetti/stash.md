---
title: "Stash"
seoTitle: "Stash: app per confrontare BTP, ETF e conti deposito"
description: "Un'app nel browser per confrontare BTP, ETF e conti deposito al netto delle tasse. Nessun account, nessun server: i dati restano sul tuo computer."
date: 2026-10-06
translationKey: "project-stash"
projectType: "Web app · Open source"
projectUrl: "https://github.com/albertoreineri/Stash-Demo"
projectLinkLabel: "Vedi il codice su GitHub ↗"
image: "img/projects/stash.jpg"
imageWidth: 1920
imageHeight: 1046
imageAlt: "Stash, pagina Obbligazioni: filtri per scadenza, paese e rischio, e una tabella di BTP e altri titoli con rendimento netto annuo e confronto con inflazione e conto deposito"
---

Stash è l'app con cui tengo sotto controllo i dati finanziari che mi interessano: obbligazioni di Stato italiane, ETF, fondi, certificati e conti deposito. Gira interamente nel browser, senza account e senza server: i dati restano sul computer di chi la usa.

- **Stato**: la uso io; il codice è pubblico su GitHub, con licenza MIT
- **Costruita con**: HTML, CSS e JavaScript senza build, più script Node.js per i dati
- **Fonti dei dati**: Borsa Italiana, Yahoo Finance, Eurostat e BCE
- **Fatta da**: me, da solo, per passatempo

## Perché l'ho fatta

Volevo un posto solo per i dati finanziari che mi interessano, con i rendimenti calcolati al netto di tasse e costi su un importo a mia scelta. L'ho fatta per me, come passatempo, e l'ho costruita in modo che i dati restino sul mio computer: nessun account, nessun server.

## Cosa fa

- **Obbligazioni**: confronta BTP, BOT e gli altri titoli di Stato per rendimento netto dopo tasse e costi, sull'importo che scegli. Applica la tassa del 12,5% sui titoli di Stato italiani e del 26% sugli altri. Ci sono filtri per scadenza, paese, valuta e rischio, il trend a 30 giorni, il confronto con inflazione e conto deposito, e l'esportazione in CSV.
- **ETF**: proietta il rendimento storico su un numero di anni a scelta, con la tassa del 26%, e mostra anche la volatilità.
- **Fondi, certificati e conti deposito**: i prezzi arrivano da schede pubbliche. Per i conti deposito il valore si calcola da tasso lordo e scadenza.
- **Diario**: preferiti, acquisti (con il valore calcolato da prezzi pubblici, oppure da tasso e scadenza, o inserito a mano) e voci di riflessione, per annotare perché si è fatta una scelta e rileggerla dopo. Tutto resta nel browser, con esportazione e importazione in JSON.
- **Una guida per ogni pagina**: la prima volta si apre da sola e spiega come leggere la pagina.

## Come è fatto

Il sito è una cartella statica: HTML, CSS e JavaScript, senza build. Niente framework, niente passaggi intermedi: la si pubblica così com'è su GitHub Pages o su Cloudflare Pages, e una volta aperta funziona anche offline.

I dati li aggiornano degli script Node.js che leggono fonti pubbliche: Borsa Italiana e Yahoo Finance per i prezzi, simpletoolsforinvestors.eu per l'elenco dei titoli di Stato, Eurostat per l'inflazione e la BCE per i tassi sui depositi. Per aggiornarli ogni giorno uso GitHub Actions, con un workflow pianificato che esegue gli script e salva i file dei dati: gratis su un repository pubblico, e senza un server da mantenere. Ci sono anche notifiche opzionali via Telegram o email.

L'interfaccia è in italiano, ed è una scelta voluta: gli strumenti e la fiscalità sono quelli italiani.

### Versione pubblica e versione privata

Il repository su GitHub è la versione pubblica: senza dati personali, con dati di esempio (c'è un diario di esempio da importare) e senza nessun server.

Nella mia versione privata, con i miei dati reali, ho aggiunto due piccole funzioni su Cloudflare Pages. Una sincronizza il diario con un file JSON in un repository, ed è quella dietro la scritta «Sincronizzato» che si vede nello screenshot. L'altra fa partire l'aggiornamento dei dati con un bottone. Nella versione pubblica non sono incluse.

## Cosa ho imparato

- Le fonti pubbliche non sono ufficiali e cambiano formato senza preavviso, quindi mi fido solo di quello che ho verificato. Ho confrontato ogni fonte con i valori della mia banca: su cinque strumenti, il valore calcolato coincide con quello dell'estratto al centesimo.
- Per i conti deposito la formula (interessi = capitale × tasso × giorni / 365, tassati al 26%) riproduce gli interessi che mostra l'app della banca.
- Un sito statico può fare molto, ma non può lanciare comandi né leggere i siti che bloccano le richieste dal browser. Per aggiornare i dati a richiesta serve una piccola funzione sul server.

## Avvertenza

Stash non è consulenza finanziaria: mostra dati pubblici e calcoli semplici, e le decisioni restano a chi usa lo strumento. È un passatempo che ho sviluppato per uso personale e che condivido così com'è, senza garanzie di alcun tipo.
