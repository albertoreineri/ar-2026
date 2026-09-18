---
title: "Functions.php – Cos’è e come modificarlo"
date: 2021-03-20
description: "In WordPress, Functions.php è uno dei file più importanti presenti all’interno di un tema. Racchiude tutte le funzioni necessarie al funzionamento del tema. Funziona come un plugin per il tuo sito…"
tags: ["Guide", "WordPress Tricks"]
---

In WordPress, **Functions.php** è uno dei file più **importanti** presenti all’interno di un tema.

Racchiude **tutte le funzioni necessarie al funzionamento del tema**. Funziona come un **plugin per il tuo sito WordPress** che viene attivato automaticamente con il tuo tema attuale. Il file functions.php utilizza il codice [PHP ](https://albertoreineri.it/categoria_guide/php)per **aggiungere funzionalità** o modificare funzionalità predefinite su un sito WordPress.

Ad esempio, un tema WordPress potrebbe aggiungere un po’ di codice al file functions.php del tema per **aggiungere una nuova area widget** al piè di pagina o aggiungere un messaggio di benvenuto personalizzato alla dashboard di WordPress. Le possibilità sono infinite!

Il file Functions.php **si carica automaticamente** quando installi e attivi un tema sul tuo sito WordPress.

La modifica del file Functions.php utilizzando codici personalizzati ti consente di **aggiungere custom post type, tassonomie , shortcodes** e altro per migliorare il tuo sito web.

## Dove si trova il file Functions?

Il percorso del file Functions.php si trova **nella cartella del tema.**

Se vuoi aggiungere uno **snippet** di codice al tuo sito WordPress, puoi aggiungerlo al file Functions.php.

Ma di solito non è il modo migliore per farlo. WordPress cerca di separare design e funzionalità quando possibile. Questo è il motivo per cui abbiamo **temi** che determinano il **design** e **plugin**, che determinano le **funzioni**.

È meglio poter **cambiare il tema di WordPress senza cambiare il modo in cui funziona** il tuo sito o cambiare i tuoi plugin senza influire sulla progettazione del tuo sito.

Esistono molti tutorial di WordPress che ti diranno di aggiungere frammenti di codice al file Functions.php del tuo tema, ma **non sempre è la cosa migliore da fare**. Occorre analizzare bene il caso.

Se decidi di modificare il tuo file Functions.php, usa la massima **cautela**. Ecco 3 motivi per cui modificare il tuo file Functions.php non è una buona idea:

- Le modifiche al file delle funzioni andranno perse quando il tema viene aggiornato.
- Le modifiche andranno perse se cambi il tema di WordPress.
- Fare errori di codifica nel file delle funzioni può bloccare fuori dal tuo sito.

Anche qualcosa di semplice come un punto e virgola mancante potrebbe far scomparire tutto il tuo sito… 

Perché i plugin specifici del sito sono migliori (alternativa a Functions.php)

Quindi, se non vuoi modificare Functions.php, dove dovresti aggiungere le nuove funzioni del tuo sito?

La risposta è creare il tuo [plugin WordPress](https://albertoreineri.it/creare-un-plugin-wordpress/) .

Questo sarà un **plugin specifico per il tuo sito**, perché è specifico per il tuo sito e non verrà mai condiviso nella directory dei plug-in di WordPress.

L’uso di un plug-in specifico per il sito è la **soluzione migliore** perché i frammenti di codice vengono archiviati separatamente dal file Functions.php del tuo tema. Ciò significa che possono essere attivati â€‹â€‹o disattivati, proprio come qualsiasi altro plugin. Questo garantisce che **il tuo codice non scomparirà se cambi tema.**

Speriamo che questo articolo ti abbia aiutato a conoscere tutto sul file Functions.php in WordPress e su come aggiungere frammenti di codice al tuo sito!
