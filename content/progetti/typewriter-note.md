---
title: "Typewriter Note"
seoTitle: "Typewriter Note: app di note minimale in stile macchina da scrivere"
description: "Un foglio bianco nel browser, in stile macchina da scrivere: niente formattazione, solo il testo."
date: 2026-10-06
translationKey: "project-typewriter-note"
projectType: "Web app · Progetto personale"
projectUrl: "https://typewriternote.com"
image: "img/projects/typewriternote.jpg"
imageAlt: "Typewriter Note: l'elenco delle note a sinistra e una nota aperta a destra, in font monospace"
---

Typewriter Note è un'app di note che si fa da parte. Gira nel browser, usa un font monospace e ha una modalità focus a schermo intero che nasconde tutto tranne il testo. Niente titoli, grassetti o scelta dei font: li ho tolti io, apposta.

- **Stato**: online dal 20 settembre 2026, ancora agli inizi
- **Costruita con**: Cloudflare Pages, Functions e D1
- **Fatta da**: me, da solo, nel tempo libero

## Perché l'ho fatta

Volevo un posto dove scrivere racconti brevi senza venti finestre aperte: un foglio bianco e basta. Quasi tutte le app di note continuano ad aggiungere funzioni. Io ne volevo una che facesse il contrario. Togliere è più difficile che aggiungere, e proprio per questo mi interessava.

## Cosa fa

- Font monospace e solo testo semplice: niente titoli, grassetti o scelta del font, per scelta.
- Una modalità focus a schermo intero che nasconde tutto tranne il testo.
- Tag per ordinare le note, e un cestino per ripristinare quelle eliminate.
- Conteggio di parole e caratteri.
- Esportazione delle note in CSV.
- Si installa come app su desktop e mobile, in tema chiaro o scuro.

## Cosa non fa

Non gestisce capitoli né progetti complessi, e non fa finta di poterlo fare: l'app lo dichiara apertamente. Se stai scrivendo un romanzo con una struttura da gestire, ti serve uno strumento pensato per quello. Questa è per la prima stesura della cosa breve.

## Come è costruita

Hosting e backend girano su Cloudflare: Pages per il sito, Functions per il codice lato server e D1 per il database, tutto sul piano gratuito. Non c'è un server tradizionale da aggiornare e tenere acceso, e finché il progetto è piccolo costa quasi niente da ospitare.

Lo stack è quello di un progetto agli inizi, e l'ho scelto apposta: volevo metterlo online in modo semplice, senza aggiungere altro lavoro di gestione a quello dei server che già seguo. Il prezzo è dipendere da una sola piattaforma e dai suoi limiti, un prezzo che per ora pago volentieri. Se il progetto parte, valuterò soluzioni più robuste. Per ora, semplice batte scalabile.

## Account e privacy

Ci si registra con email e password, con verifica via email. Esiste anche una demo senza account, limitata a tre note.

Sulla privacy non ho fatto le cose a metà. Il sito ha un banner cookie basato su Google Consent Mode v2 (Google Analytics parte solo se accetti) e una privacy policy vera. Puoi eliminare l'account dalle impostazioni, e i dati vengono cancellati definitivamente dopo 30 giorni.
