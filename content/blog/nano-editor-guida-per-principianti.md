---
title: "Nano Editor, Guida per principianti"
date: 2022-06-27
description: "Gli utenti Linux hanno molte opzioni tra cui scegliere quando si tratta di editor di testo. Da base ad avanzato, esistono un sacco di editor di testo, ma alcuni come Vim ed Emacs possono risultare…"
tags: ["Guide", "Linux"]
---

Gli utenti [Linux](/argomento/linux/) hanno molte opzioni tra cui scegliere quando si tratta di editor di testo. Da base ad avanzato, esistono un sacco di editor di testo, ma alcuni come Vim ed Emacs possono risultare molto complicati per gli utenti meno avanzati.

In questo casi ci viene in aiuto Nano, forse il miglior editor di testo per principianti.

## Nano:

Nano è un editor di testo semplice e leggero sviluppato appositamente per sistemi UNIX e ambienti desktop che utilizzano un’interfaccia a riga di comando. Nano è concesso in licenza sotto la GNU General Public License ed emula l’editor di testo Pico.

## Come installare Nano:

Sto usando Ubuntu per questo tutorial e il processo di installazione sarà lo stesso su altre distribuzioni Linux.

Prima di procedere con il processo di installazione, sarebbe una buona idea verificare se l’editor di testo Nano è già installato o meno sul tuo sistema. Alcune distribuzioni Linux vengono fornite con l’editor Nano preinstallato.

Per controllare, esegui il seguente comando in Terminale.

``` wp-block-code
$ nano --version
```

Se ottieni un output con l’attuale versione di nano, puoi saltare l’installazione poiché l’editor di testo Nano è già installato sul tuo sistema.

L’installazione di Nano Text Editor è semplice, basta eseguire il seguente comando da Terminale e attendere il completamento dell’installazione.

``` wp-block-code
$ sudo apt-get install nano
```

Gli utenti CentOS/Red Hat Enterprise Linux (RHEL) possono utilizzare il comando seguente per installare l’editor Nano.

``` wp-block-code
$ yum installa nano
```

Ora che l’editor nano è stato installato correttamente sul tuo sistema e pronto per l’uso, possiamo iniziare con una guida per principianti all’uso dell’editor di testo Nano.

## Guida all’uso dell’editor di testo Nano

Vediamo ora come utilizzare l’editor di testo Nano.

### Come aprire/chiudere il Nano Text Editor

Il comando per aprire l’editor di testo Nano è il seguente.

``` wp-block-code
$ nano nomefile 
```

Puoi aprire vari tipi di file nell’editor di testo Nano, inclusi .txt, .php, .html e molti altri. Devi solo digitare il nome del file seguito da un’estensione per aprire il file particolare nell’editor Nano. Ad esempio, supponiamo di dover aprire il file denominato il_mio_file.txt, il comando sarà il seguente.

``` wp-block-code
$ nano il_mio_file.txt
```

Devi assicurarti di essere nella directory in cui è stato salvato il file. Se il file non è presente nella directory, l’editor di testo Nano creerà un nuovo file nella directory attuale.

Una volta aperto il file noterai che l’interfaccia nano presenta il nome del file nella parte superiore, mentre nella parte inferiore noterai principalmente scorciatoie come taglia, sostituisci, vai alla riga e giustifica. Qui ˄ significa il tasto **CTRL** sulla tastiera.

Ad esempio, per **scrivere** o salvare le modifiche, devi premere i pulsanti CTRL + O sulla tastiera.

Se stai aprendo un file di configurazione, assicurati di utilizzare l’ opzione **–w** , questo comanderà a Nano editor di aprire il file di configurazione in un formato standard. Se non si utilizza questa opzione, l’editor Nano avvolgerà il testo del file per adattarlo alla finestra, che alla fine sarà difficile da leggere.

## Come cercare / sostituire il testo

**CTRL + W** è la scorciatoia per cercare la parola nell’editor. Ora devi inserire il testo che vuoi cercare e quindi premere il tasto Invio. Per continuare a cercare lo stesso testo, usa il tasto **ALT + W.**

Per sostituire il testo, devi usare **CTRL + R**, l’editor ti porterà alla prima istanza del testo che desideri sostituire; per sostituire tutto il testo, devi premere **A** . Ma se vuoi sostituire un solo testo, devi premere **Y**.

## Come copiare e incollare il testo

L’operazione di copia incolla non è così semplice come altri editor di testo nell’editor Nano. Se desideri tagliare e incollare una riga particolare, devi prima portare il cursore all’inizio di quella riga.

Ora devi premere **CTRL + K** per tagliare la linea, quindi spostare il cursore nel punto in cui vuoi incollarlo, ora infine, premere **CTRL + U** per incollare la linea.

Per copiare e incollare una particolare stringa o parola, devi selezionare quella parola o stringa premendo **CTRL + 6** o **ALT + A** , assicurati che il cursore sia all’inizio della parola.

Ora puoi usare **CTRL + K** e **CTRL + U** per tagliare e incollare la parola o la stringa.

Ecco come puoi iniziare a utilizzare l’editor di testo Nano. Modificare un file di testo utilizzando la riga di comando non è facile, ma l’editor di testo Nano lo rende più semplice. È affidabile e uno degli strumenti più facili da usare.

Dagli utenti inesperti ai professionisti, tutti trovano l’editor di testo Nano un utile strumento da riga di comando. Spero che questa guida ti abbia sicuramente aiutato a iniziare con l’editor Nano.

Di seguito ti lascio una serie di comandi spesso utilizzati:

## Scoriatoie utili per nano:

<figure class="wp-block-table">
<table>
<thead>
<tr>
<th>Command</th>
<th>Action</th>
</tr>
</thead>
<tbody>
<tr>
<td>CTRL + A</td>
<td>Vai all’inizio della riga</td>
</tr>
<tr>
<td>CTRL + E</td>
<td>Vai alla fine della riga</td>
</tr>
<tr>
<td>CTRL + Y</td>
<td>Scorri in basso nella pagina</td>
</tr>
<tr>
<td>CTRL + V</td>
<td>Scorri in alto nella pagina</td>
</tr>
<tr>
<td>CTRL + _</td>
<td>Scorri fino alla riga speficina</td>
</tr>
<tr>
<td>CTRL + C</td>
<td>Scopri dov’è il cursore</td>
</tr>
<tr>
<td>CTRL + V</td>
<td>Scorri verso l’alto</td>
</tr>
<tr>
<td>CTRL + W</td>
<td>Cerca un testo</td>
</tr>
<tr>
<td>CTRL + D</td>
<td>Cancella il carattere sotto al cursore</td>
</tr>
<tr>
<td>CTRL + K</td>
<td>Cancella l’intera riga</td>
</tr>
<tr>
<td>CTRL + \</td>
<td>Sostituisci una stringa</td>
</tr>
<tr>
<td>CTRL + O</td>
<td>Salva il contenuto senza uscire</td>
</tr>
<tr>
<td></td>
<td></td>
</tr>
</tbody>
</table>
</figure>
