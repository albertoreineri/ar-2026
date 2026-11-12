---
title: "Bastione"
seoTitle: "Bastione: gioco di strategia medievale nel browser"
description: "Un gioco di strategia medievale nel browser: costruisci un villaggio, gestisci le risorse e difenditi dalle ondate nemiche. Gratis, senza installazione."
date: 2026-11-12
translationKey: "project-bastione"
projectType: "Gioco · Progetto personale"
projectUrl: "/bastione/"
projectLinkLabel: "Gioca ora →"
image: "img/projects/bastione.jpg"
imageWidth: 1920
imageHeight: 1047
imageAlt: "Bastione: un villaggio medievale con fortezza, case, cava di pietra e campi, circondato da fiume e foreste, con la barra delle risorse e l'ondata nemica in arrivo"
---

Bastione è un gioco di strategia medievale che gira nel browser: si costruisce un villaggio, si gestiscono le risorse e si respingono le ondate di nemici che arrivano dal castello avversario. Nessuna installazione, nessun account: si apre la pagina e si gioca.

- **Stato**: online, 3 livelli giocabili
- **Costruito con**: JavaScript senza framework e [Phaser 3](https://phaser.io/) per il motore di gioco, con gli asset grafici di [Kenney](https://kenney.nl/) (licenza CC0)
- **Fatto da**: me, da solo, con l'AI come aiuto per velocizzare la realizzazione

## Perché l'ho fatto

Mi piacciono i giochi di gestione e gli strategici in tempo reale, e volevo capire cosa serve per costruirne uno: una mappa, un'economia che si autosostiene, un pathfinding che non si rompa con decine di unità in movimento, un nemico che faccia qualcosa di più che camminare in linea retta. Bastione è il risultato: piccolo abbastanza da finirlo, completo abbastanza da essere un gioco vero.

## Cosa fa

- **Si costruisce un villaggio** su una mappa con alberi, pietra, ferro, fiumi e acqua: legnaioli, cave, miniere, fattorie, mucche, panetterie, mercato, case.
- **L'economia gira da sola**: i lavoratori raccolgono e consegnano le risorse (legno, pietra, ferro, grano, pane, formaggio, oro) senza microgestione continua; il mercato compra e vende quello che manca o avanza.
- **Si recluta un esercito** in caserma — arcieri, fanti, corazzati, catapulte — e si costruiscono mura, portoni, fossati e torri per difendere il perimetro.
- **Il nemico attacca a ondate** dal suo castello, con difensori e torri propri, e punta dritto agli edifici se li raggiunge: bisogna chiudere i varchi prima che arrivi.
- **3 livelli** con mappe e difficoltà diverse.
- **Funziona anche su telefono**: scorrimento a un dito, zoom a pizzico, pulsanti pensati per il tocco.

## Come è fatto

Il motore è [Phaser 3](https://phaser.io/), caricato da CDN; il resto è JavaScript semplice, senza build e senza framework — file `.js` caricati uno dopo l'altro nella pagina, niente bundler. La grafica usa gli sprite del pacchetto *RTS: Medieval* di Kenney, in licenza CC0.

Le parti che mi hanno preso più tempo:

- **Il pathfinding**: le unità devono muoversi su una mappa con alberi, acqua, edifici e mura che cambiano continuamente, senza bloccarsi a vicenda e senza infilarsi dentro gli ostacoli.
- **Il bilanciamento**: costi e rese delle risorse, tempi delle ondate, vita della fortezza — tutti numeri aggiustati a mano giocando e rigiocando, finché la curva di difficoltà non è sembrata giusta.
- **Il tocco su mobile**: i controlli pensati per mouse (trascina per costruire un muro, clicca per selezionare) hanno bisogno di un'interfaccia parallela per chi gioca da telefono, con pulsanti di conferma invece dei trascinamenti.

## Dove si trova

Si gioca direttamente online, su [bastione](/bastione/): nessuna registrazione, nessun download.
