---
title: "Gulp.js in un tema WordPress"
date: 2019-09-30
description: "Da qualche tempo sto lavorando su progetti abbastanza grandi e non è sempre facile riuscire a gestire il tutto senza perdersi nei migliaia di file e cartelle contenuti nel progetto.…"
tags: ["Guide", "Web Dev"]
---

Da qualche tempo sto lavorando su **progetti abbastanza grandi** e non è sempre facile riuscire a gestire il tutto senza perdersi nei **migliaia di file e cartelle** contenuti nel progetto.

**L’organizzazione del codice** è una parte fondamentale per lo sviluppo di software, che sia web, desktop o mobile.

Fortunatamente oggi possiamo utilizzare degli strumenti in grado di **aiutarci nel processo di sviluppo **e gestione del progetto.

Uno di questi è** Gulp.js!**

## Cos’è Gulp.js

Gulp è un **task runner**, cioè un programma che permette di **automatizzare una serie di operazioni** ripetitive e costanti, come minificare codice CSS e JS, effettuare refresh ad ogni salvataggio, sincronizzare pagine web, ottimizzare le immagini e molto altro.

***Per semplificare*** una volta impostato correttamente Gulp all’interno del mio progetto, ogni volta che salvo un file in automatico Gulp fa un check sull’operazione appena effettuata (il salvataggio) ed agisce di conseguenza, in questo caso fa un refresh del browser.

Se invece modifico un file CSS, al salvataggio Gulp minimizzerà il file e farà il refresh del browser!

Prova a pensare in un progetto che richiede mesi di sviluppo, poter evitare di *refresshare *il browser ogni volta, compilare i file SASS, ottimizzare le immagini etc. permette agli sviluppatori di **risparmiare moltissimo tempo**, o perlomeno concentrarsi su altro piuttosto che su azioni banali e ripetitive!

## Gulp e WordPress

Il bello di Gulp è che può essere utilizzato in **qualsiasi tipo di progetto**, anche durante lo sviluppo di un **tema **o **plugin **per **WordPress**, andando a **velocizzare **molto i tempi di programmazione!

Se vuoi installare ed **iniziare **ad utilizzare Gulp ti consiglio questo articolo: <https://css-tricks.com/gulp-for-beginners/> . Io ho iniziato da qui!

## Il mio Gulp per WordPress!

Se vuoi una **base di partenza** per configurare **Gulp **nel tuo progetto puoi guardare sul <a href="https://github.com/alby-dev/" target="_blank" rel="noreferrer noopener">mio profilo github</a>, ho inserito <a href="https://github.com/alby-dev/gulp-for-wordpress" target="_blank" rel="noreferrer noopener">il mio file</a> di **configurazione base per Gulp in WordPress.**

Nel mio ultimo progetto tramite **Gulp **ho effettuato queste **automazioni**:

- Effettuare un **refresh **ad ogni modifica di qualsiasi file
- Ottimizzare le **immagini**
- Unire tutti i file **SCSS **in uno solo, compilarlo e minificarlo
- Unire tutti i file **JS **in uno solo e minificarlo

Per poter utilizzare **Gulp **occorre sdoppiare la cartella con le risorse del sito. Una sarà la cartella di sviluppo, solidamente chiamata “**src**“, l’altra sarà quella che verrà pubblicata, chiamata “**assets**“

Su github puoi trovare il mio file di configurazione per gestire i task **Gulp all’interno di un tema WordPress.**

Per **iniziare **ad utilizzarlo devi solamente copiare il mio gulpfile.js all’interno del tuo tema e dare questo comando dalla CLI:

```
npm install --save-dev gulp gulp-imagemin gulp-uglify gulp-sass browser-sync del gulp-concat gulp-clean
```

Ora non ti resta che** modificare la riga 3** del file inserendo il path del tuo progetto WordPress.

Spero di essere riuscito ad invogliarti a **utilizzare questo strumento. **Sebbene sia un po’ complicato da configurare, sono sicuro che una volta che l’avrai capito a fondo **non potrai più farne a meno!**

Fammi sapere cosa ne pensi nei **commenti **e **buon codice!**
