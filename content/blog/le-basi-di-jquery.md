---
title: "5. Le basi di jQuery"
date: 2020-03-17
description: "Se hai letto le nostre guide precedenti, ormai saprai bene che HTML, CSS e Javascript sono i tre linguaggi fondamentali del web. Con l’HTML strutturiamo i nostri siti, con il CSS li modelliamo e…"
tags: ["Guide", "Inizia Qui"]
---

Se hai letto le nostre [guide precedenti](/guide), ormai saprai bene che **HTML**, **CSS** e **Javascript** sono i tre **linguaggi fondamentali **del web.

Con **l’HTML** strutturiamo i nostri siti, con il **CSS** li modelliamo e li formattiamo e con il **Javascript** aggiungiamo funzionalità interattive e animazioni.

**<a href="https://jquery.com/" target="_blank" rel="noreferrer noopener">JQuery</a>** è una libreria Javascript che consente di **ottenere grandi risultati scrivendo meno codice**. In pratica si potrebbe utilizzare il vanilla Javascript (Javascript puro) per fare le stesse cose che si fanno con JQuery, però con questa libreria è più **semplice** e **veloce**!

Inoltre JQuery **è compatibile con la maggior parte dei browser,** il che significa che non dobbiamo preoccuparci di testare gli effettu su tutti i browser presenti, ma possiamo stare tranquilli che tutto funzionerà ovunque!

Vuoi **vedere** come** JQuery è più semplice** rispetto a Javascript?

**Ecco un esempio!**

In questo esempio andremo ad inserire la stringa “**Ciao mondo!**” in un div con id \#ciao, guarda la differenza fra i due codici:

**Javascript:**

``` wp-block-code
document.getElementById('ciao').innerHTML = 'Ciao mondo!'
```

**JQuery:**

``` wp-block-code
$('#ciao').html('Ciao mondo!')
```

**Visto?** Già da una cosa semplicissima come questa si può vedere che il codice è molto più semplice con JQuery!

**Ti sei convinto **che può valere la pena imparare ad utilizzare questa libreria? Molto bene!

**Iniziamo!**

## Installazione di JQuery

**JQuery** è semplicemente un **file Javascript **da inserire nel nostro HTML.

Questo inserimento può essere fatto in **due modi:** tramite **CDN** oppure **scaricando** i file in locale.

Puoi **scaricare** i file di JQuery dal sito ufficiale a questo link:

<https://jquery.com/download/>

Oppure puoi utilizzare una **CDN**, come faremo in questa guida. Utilizzeremo infatti una CDN di google:

<https://developers.google.com/speed/libraries/>

### Template HTML

Iniziamo con il creare un file **HTML** di base in cui installare JQuery. Ecco il nostro **scheletro** HTML:

``` wp-block-code
<!DOCTYPE html>
<html lang="it">
  <head>
    <title>Corso intensivo jQuery</title>
    <!-- CSS -->
    <link rel="stylesheet" href="css/styles.css" />
  </head>

  <body>

  
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.1.0/jquery.min.js"></script>
    <script src="js/scripts.js"></script>
  </body>
</html>
```

Ecco il nostro scheletro. Insieme al file html creiamo anche una cartella “**css**” con al suo interno un file “*style.css*” e una cartella “**js**” con al suo interno un file “*scripts.js*“.

Ricordati di inserire il file “scripts.js” sotto a JQuery, altrimenti non funzionerà!

Molto bene, abbiamo un progetto web configurato per poter utilizzare **JQuery**, vediamo ora come usare questa libreria!

## Le basi

**JQuery** è utilizzato per **connettersi con gli elementi HTML** nel browser tramite **DOM**.

Il **DOM** (Document Object Model) è il metodo con cui **Javascript** (e quindi anche JQuery) **interagisce con l’HTML** nel browser.

Per visualizzare esattamente qual è il DOM, facciamo clic con il tasto destro sulla pagina nel browser e selezioniamo **Ispeziona**. Il codice HTML che vediamo nel riquadro di ispezione è il DOM. Ogni elemento HTML è considerato un oggetto che JavaScript può utilizzare. JavaScript può aggiungere, rimuovere e modificare ognuno di questi elementi.

Il livello più esterno del DOM è l’oggetto **document**. Per iniziare a manipolare la pagina con jQuery, dobbiamo prima assicurarci che il document sia pronto, “*ready*“.

Apriamo quindi il nostro file *scripts.js *e inseriamo questo codice:

``` wp-block-code
$(document).ready(function() {
  // Tutte le funzioni di JQuery vanno inserite qui!
})
```

Qualsiasi jQuery personalizzato che scriveremo sarà contenuto all’interno di questa **funzione**. 

Nell’introduzione di questo articolo, abbiamo visto un semplice script “**Ciao mondo!**“. Per avviare questo script e stampare il testo sul browser con jQuery, per prima cosa creiamo un elemento vuoto a cui applichiamo un id “ciao”.

Torniamo quindi nel nostro* index.html *e inseriamo questo nel *\<body\>:*

``` wp-block-code
<p id="ciao"></p>
```

**jQuery** viene chiamato con e rappresentato dal **simbolo del dollaro **( `$`). Accediamo al DOM con jQuery utilizzando principalmente la **sintassi CSS **e applichiamo un’azione con un metodo. Un esempio di base di jQuery segue questo formato:

``` wp-block-code
$('selector').method()
```

Poiché un ID è rappresentato da un simbolo hash (#) nei CSS, accederemo all’ID ciao con il selettore* #ciao* *\#ciao*. *html()* è un metodo che modifica l’HTML all’interno di un elemento.

``` wp-block-code
$('#ciao').html('Ciao mondo!')
```

Il codice viene eseguito non **appena il documento è pronto. **

**Salviamo** tutto e apriamo index.html nel browser, **vedremo apparire l**a scritta “Ciao mondo”. Questa scritta è stata inserita da JQuery!

## I selettori

La maggior parte dei **selettori jQuery s**ono gli stessi di quelli che utilizziamo nei [CSS](https://albertoreineri.it/guide/le-basi-del-css/), con alcune aggiunte specifiche di jQuery. L’elenco completo dei selettori jQuery <a href="https://api.jquery.com/category/selectors/" target="_blank" rel="noreferrer noopener">è disponibile qui</a> .

Di seguito una breve panoramica di alcuni dei selettori più comunemente usati.

- *\$(“\*”)*– **Carattere jolly:** seleziona ogni elemento.
- *\$(this)*– **Corrente:** seleziona l’elemento corrente su cui operare all’interno di una funzione.
- *\$(“p”)*– **Elemento:** seleziona ogni istanza del *\<p\>*tag.
- *\$(“.esempio”)*– **Classe:** seleziona ogni elemento a cui è applicata la classe “esempio”.
- *\$(“#esempio”)*– **Id:** seleziona una singola istanza dell’ID univoco “esempio”.
- *\$(“\[type=’text’\]”)*– **Attributo:** seleziona qualsiasi elemento con *text*applicato *type*all’attributo.
- *\$(“p:first-of-type”)*– **Pseudo Element:** seleziona il primo *\<p\>*.

Generalmente, le **classi** e gli **ID **sono ciò che verrà utilizzato maggiormente: le classi quando si vogliono selezionare più elementi e gli id â€‹â€‹quando si vuole selezionarne solo uno.

## Eventi jQuery

Nell’esempio “Ciao mondo!”, il codice è stato eseguito non appena la pagina è stata caricata e il documento era pronto, e quindi non richiedeva l’interazione dell’utente. Chiaramente in questo caso, avremmo potuto facilmente scrivere il testo direttamente nell’HTML senza preoccuparci di jQuery.

Tuttavia, dovremo utilizzare jQuery se vogliamo **far apparire il testo sulla pagina con il clic di un pulsante**. Possiamo aggiungere un pulsante al nostro HTML per attivare l’evento.

``` wp-block-code
<button id="trigger">Cliccami!</button>
<p id="ciao"></p>
```

Ora possiamo usare il metodo *click() *per inserire il nostro testo “Ciao mondo!”:

``` wp-block-code
$('#trigger').click(function() {
  $('#ciao').html('Ciao mondo!')
})
```

Salva e aggiorna e se tutto è andato liscio, facendo clic sul pulsante vedrai apparire il testo.

Un elenco completo dei metodi degli eventi jQuery <a href="https://api.jquery.com/category/events/" target="_blank" rel="noreferrer noopener">è disponibile qui</a> . Un **evento** avviene ogni volta che l’utente interagisce con il browser. Abbiamo appena appreso [click ()](https://api.jquery.com/click/) , che viene eseguito con un solo clic del mouse.

Di seguito ti lascio una breve panoramica di alcuni dei metodi di eventi più comunemente utilizzati.

- [hover ()](https://api.jquery.com/hover/) – **Hover** viene eseguito quando il mouse viene spostato su un elemento. [mouseenter ()](https://api.jquery.com/mouseenter/) e [mouseleave () si](https://api.jquery.com/mouseleave/) applicano solo al mouse che entra o esce da un elemento, rispettivamente.
- [submit ()](https://api.jquery.com/submit/) – **Submit** viene eseguito quando viene inviato un modulo.
- [scroll ()](https://api.jquery.com/scroll/) – Lo **scorrimento** viene eseguito quando si [scorre](https://api.jquery.com/scroll/) lo schermo.
- [keydown ()](https://api.jquery.com/keydown/) – **Keydown** viene eseguito quando si preme un tasto sulla tastiera.

## Effetti jQuery

<a href="https://api.jquery.com/category/effects/" target="_blank" rel="noreferrer noopener">Gli effetti jQuery</a> lavorano di pari passo con gli eventi consentendo di aggiungere facilmente animazioni e manipolare in altro modo gli elementi della pagina.

Faremo un esempio in cui **apriamo e chiudiamo un overlay / popup modale.** Mentre potremmo usare **due id**: uno per aprire la modal e un altro per chiuderla. Utilizzeremo una classe per aprire e chiudere facilmente la modal con la stessa funzione.

**index.html**

``` wp-block-code
<button class="trigger">Apri</button>

<section class="overlay">
  <button class="trigger">Chiudi</button>
</section>
```

Useremo una minima quantità di CSS per nascondere il *overlay* con *display: none* e centrarlo sullo schermo.

**style.css**

``` wp-block-code
.overlay {
  display: none;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  height: 200px;
  width: 200px;
  background: gray;
}
```

Infine, useremo il metodo *toggle()*, che commuterà la proprietà  *display* CSS tra *none* e *block*, nascondendo e mostrando l’overlay quando si fa clic.

``` wp-block-code
$('.trigger').click(function() {
  $('.overlay').toggle()
})
```

Ora potrai **attivare / disattivare la visibilità del modale facendo clic sui pulsanti. **

Puoi anche provare a modificare *toggle()* per *fadeToggle()* o *slideToggle()* per vedere un paio di altri effetti incorporati jQuery.

Di seguito una breve panoramica di alcuni dei metodi di effetto più comunemente usati.

- [toggle ()](https://api.jquery.com/toggle/) – **Attiva** / **disattiva** la visibilità di uno o più elementi. [show ()](https://api.jquery.com/show/) e [hide ()](https://api.jquery.com/hide/) sono gli effetti unidirezionali correlati.
- [fadeToggle ()](https://api.jquery.com/fadetoggle/) – **Fade Toggle** attiva / **disattiva** la visibilità e anima l’opacità di uno o più elementi. [fadeIn ()](https://api.jquery.com/fadein/) e [fadeOut ()](https://api.jquery.com/fadeout/) sono i relativi effetti unidirezionali.
- [slideToggle ()](https://api.jquery.com/slidetoggle/) – **Slide Toggle** attiva o **disattiva** la visibilità di uno o più elementi con un effetto scorrevole. [slideDown ()](https://api.jquery.com/slidedown/) e [slideup ()](https://api.jquery.com/slideup) sono i relativi effetti unidirezionali.
- [animate ()](https://api.jquery.com/animate/) – **Animate** esegue effetti di animazione personalizzati sulla proprietà CSS di un elemento.

## Conclusione

Ora che hai imparato le basi di JQuery puoi **sbizzarrirti** e provare a realizzare gli effetti che vuoi!

Prova quindi a **creare qualche effetto **all’hover del mouse, al click, allo scroll, andando a modificare le **classi CSS **come il colore, lo sfondo o anche l’immagine!

**Con JQuery si può fare veramente di tutto**, basta mettersi sotto e studiare un pochino!

Ora che hai capito le basi dei linguaggi **front-end **è ora di dedicare un po’ di tempo anche al **linguaggio principale di WordPress: **

<div class="wp-block-columns are-vertically-aligned-center is-layout-flex wp-container-core-columns-is-layout-8f761849 wp-block-columns-is-layout-flex">

<div class="wp-block-column is-vertically-aligned-center is-layout-flow wp-block-column-is-layout-flow">

*[\<\< Le basi di Bootstrap](https://albertoreineri.it/guide/le-basi-di-bootstrap/)*

</div>

<div class="wp-block-column is-vertically-aligned-center is-layout-flow wp-block-column-is-layout-flow">

*[Le basi di PHP \>\>](https://albertoreineri.it/guide/le-basi-di-php/)*

</div>

</div>
