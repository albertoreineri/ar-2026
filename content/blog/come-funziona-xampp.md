---
title: "3. Come funziona XAMPP"
date: 2020-03-20
description: "Hai letto l’articolo sulla configurazione del PC per lo sviluppo web, hai installato tutti i programmi e sei pronto ad iniziare a sviluppare! MA COME FUNZIONA XAMPP? Sebbene non sia un software…"
tags: ["Guide", "WordPress Base"]
translationKey: "xampp-how-it-works"
---

Hai letto l’articolo sulla [configurazione del PC per lo sviluppo web](https://albertoreineri.it/configurare-il-pc-per-sviluppare-in-wordpress/), hai installato tutti i programmi e sei pronto ad iniziare a sviluppare!

## MA COME FUNZIONA XAMPP?

Sebbene non sia un software particolarmente complicato, il primo approccio potrebbe spaventare un pochino.

Oggi vedremo **come avviarlo e farlo funzionare correttamente**!

**Per prima cosa avvia XAMPP** cliccando sulla sua icona.

Ti troverai una schermata come questa:

Sulla sinistra puoi vedere che **XAMPP fornisce una serie di servizi.**

A noi interessano principalmente i primi 2:

- **Apache **(il server web che permette a WordPress di funzionare)
- **MySQL **(database dentro il quale salveremo i dati del sito WordPress)

Senza perderci in chiacchiere **inizia con l’avviare questi due servizi**, cliccando sul pulsante “**Start**” in corrispondenza di entrambi.

Se tutto è andato per il verso giusto le scritte “**Apache**” e “**MySQL**” dovrebbero avere sfondo verde, così:

A questo punto il nostro server locale è avviato e funzionante!

## E ORA CHE FACCIO?

Ora devi sapere ancora un paio di cose:

- **Dove inserire** materialmente **i siti web** da “*far girare*” sul server Apache
- **Come gestire il database**

Stai tranquillo, anche questa volta **è più facile a farsi che a dirsi.**

### DOVE INSERIRE I SITI WEB?

**XAMPP **fornisce una cartella dentro la quale inserire tutti i nostri siti web.

Sarà sufficiente **inserire i nostri siti all’interno di questa cartella** per poterli visualizzare nel browser.

La cartella è la seguente:

**Windows:** C:\xampp\htdocs

Tutti le cartelle presenti in questo percorso saranno sito web e saranno raggiungibili tramite il browser.

### COME RAGGIUNGERE IL SITO WEB DAL BROWSER?

Abbiamo visto dove inserire i nostri siti web, ova vediamo anche **come farli partire dal browser.**

Per poter vedere i siti in locale occorre **dire al browser di andare a cercare i nostri siti** appunto** in locale**, non nel www.

Per fare ciò **nella barra di ricerca** scriviamo “*localhost*“.

Se premete invio dovreste vedere la pagina di default di XAMPP, ma a noi interessa poco, noi vogliamo vedere i nostri siti.

È molto semplice, basterà digitare dopo “localhost” uno slash più la cartella presente in htdocs contentente il nostro sito.

#### Esempio:

- Andate nella cartella htdocs
- Create una cartella chiamata “test”
- Entrate nella cartella
- Fate click con il tasto destro del mouse e premete “Open with Code” (per farlo avrete bisogno di Visual Studio Code, se non l’hai installato [clicca qui](https://albertoreineri.it/configurare-il-pc-per-sviluppare-in-wordpress/))
- Premete “File – New File”
- Salvatelo come “index.html”
- All’interno del file scrivete “Ciao Mondo”
- Aprite il browser e digitate “localhost/test”

Dovreste vedere una pagina completamente bianca con la scritta “Ciao Mondo” in alto a sinistra!

**Congratulazioni!** Hai appena creato **un sito internet in locale con XAMPP!**

## E IL DATABASE?

Prima ho parlato di database, **fondamentare per ogni sito WordPress.**

Per poter accedere al database XAMPP installa in automatico un sito che permette di gestire i dati in maniera semplice e veloce: **phpmyadmin**.

Per accedere a phpmyadmin è sufficiente recarsi a questo **indirizzo **sul browser:

[localhost/phpmyadmin](http://localhost/phpmyadmin/)

Ed ecco qua, sei appena entrato nella gestione dei database del tuo server locale!

## TIPS:

Un paio di consigli per velocizzare il tuo lavoro:

- Crea un link sul desktop o sulla barra delle applicazioni a **XAMPP**
- Crea un link alla cartella “**htdocs**” sul desktop o sulla barra delle applicazioni
- Inserisci **phpyadmin **nei preferiti

Molto bene, **ora sei pronto a fare sul serio!**
