---
title: "ScrollShame"
seoTitle: "ScrollShame: l'estensione Chrome che ti becca sui social"
description: "Estensione gratuita per Chrome che ti richiama, con ironia crescente, ogni volta che apri un social durante l'orario di lavoro. Nessuna raccolta dati."
date: 2026-11-22
translationKey: "project-scrollshame"
projectType: "Estensione per Chrome · Progetto personale"
projectLinks:
  - label: "Installa su Chrome ↗"
    url: "https://chromewebstore.google.com/detail/scrollshame/mgdncpkoggbpoddllnimhdcbcjljnafb"
    external: true
  - label: "Privacy Policy"
    url: "/scrollshame-privacy/"
image: "img/projects/scrollshame.jpg"
imageWidth: 1920
imageHeight: 1049
imageAlt: "ScrollShame in azione su Facebook, tono Movimento: popup «Modalità statua attivata» con l'invito a alzarsi e i pulsanti «Hai ragione, mi alzo» e «Continua, tanto chi se ne frega»"
---

ScrollShame è l'estensione per Chrome che ti interrompe — con ironia crescente — ogni volta che apri un social durante l'orario di lavoro. Più ci torni nello stesso giorno, più il messaggio si fa pungente: si parte con un richiamo gentile e si finisce con una presa in giro scherzosa.

- **Stato**: pubblicata sul Chrome Web Store
- **Costruita con**: Chrome Extension Manifest V3, JavaScript vanilla, Shadow DOM, `chrome.storage`
- **Lingue**: italiano e inglese, con il sistema i18n nativo di Chrome
- **Fatta da**: me, da solo, per passatempo

## Perché l'ho fatta

Il problema non è decidere di non aprire i social in orario di lavoro: è che lo fai senza nemmeno accorgertene, per riflesso. Un blocco totale non mi convinceva — troppo rigido, e comunque c'è sempre un motivo legittimo per aprire quella scheda. Volevo invece qualcosa che interrompesse il riflesso con un attimo di autoironia, e che diventasse via via più diretto se il riflesso continua a ripetersi nello stesso giorno.

## Cosa fa

- **3 toni selezionabili**: Movimento (un invito a fare due passi o dello stretching), Focus (una spinta anti-procrastinazione) e Filosofico (una riflessione ironica sul tempo che passa)
- **Fascia oraria e giorni attivi personalizzabili**, ad esempio solo nei giorni feriali e in orario d'ufficio
- **Pausa rapida** di 30 minuti, 1 ora, 4 ore o fino al giorno dopo, più una tregua automatica per chi apre più schede di fila
- **Nessuna raccolta dati**: tutto resta sul dispositivo, nessun account, nessun server

## Come è fatta

È un'estensione Manifest V3 con un content script che gira sui domini social supportati (Facebook, Instagram, YouTube, X/Twitter, LinkedIn, TikTok). Il messaggio è iniettato dentro uno **Shadow DOM**, per isolarne lo stile da quello della pagina ospite senza bisogno di `!important` ovunque. Le preferenze — toni, orari, giorni, pause — sono salvate con `chrome.storage`, e le due lingue usano il sistema i18n nativo di Chrome invece di una libreria esterna.

## Privacy

L'estensione non raccoglie né trasmette alcun dato: tutto resta in locale. Dettagli completi nella [privacy policy](/scrollshame-privacy/).


