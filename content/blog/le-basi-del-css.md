---
title: "2. Le basi del CSS"
date: 2020-03-17
description: "Il CSS è il linguaggio di formattazione del web. Sta per Cascading Style Sheets ed è utilizzato per assegnare uno stile alle pagine html. Ha una sintassi specifica e permette di separare l’html…"
tags: ["Guide", "Inizia Qui"]
noindex: true
sitemap:
  disable: true
---

Il CSS è il linguaggio di **formattazione **del web. Sta per *Cascading Style Sheets* ed è utilizzato per **assegnare uno stile alle pagine html**.

Ha una sintassi specifica e permette di separare l’html dal suo stile, mantene do così il **codice pulito ed ordinato**.

Come l’HTML, anche il css **non è un linguaggio di programmazione**, è un linguaggio utilizzato per creare i layout delle pagine web. Consente di gestire gli spazi, modificare i colori, creare i layout e tutto ciò che ha a che fare con la parte grafica di un contenuto web.

------------------------------------------------------------------------

*Questo corso è rivolto ai **principianti**, pertanto se conosci già il CSS questo articolo non fa per te, se invece sei agli inizi **BENVENUTO **e buono studio! Vedrai che** imparerai presto** a cerare fantastici contenuti web!*

------------------------------------------------------------------------

Questo articolo è una continuazione del la guida [Le basi di](https://albertoreineri.it/le-basi-dellhtml/) [HTML](https://albertoreineri.it/le-basi-dellhtml/), che puoi trovare [qui](https://albertoreineri.it/le-basi-dellhtml/).

Se ti perdi durante l’articolo sul fondo di questo articolo potrai trovare il codice di tutto ciò che andremo a creare.

## Come inserire il CSS in una pagina HTML

Il CSS da solo quindi non serve a nulla, ma **deve essere inserito in una pagina html.**

Esistono **3 modi** per inserire del codice CSS in una pagina HTML

- **Inline CSS**
- **CSS Interno**
- **CSS Esterno**

### Inline CSS

Consente di inserire del codice CSS **direttamente all’interno del codice HTML.**

Con questo metodo **i linguaggi HTML e CSS restano mischiati insieme**. Un esempio di questa tipologia di codice è quello che abbiamo inserito nel corso intensivo di HTML, quando abbiamo impostato lo sfondo verde al div, o il rosso alla parola nello span.

**Esempio**:

```
<div style="background-color:green>Ciao Mondo</div>
```

Sebbene sia molto veloce da applicare, **è il modo peggiore** per inserire del codice CSS.

**Mischiare i linguaggi di programmazione non è mai un bene**, è meglio imparare fin da subito che l’ordine è una caratteristica fondamentale per un buon sviluppatore.

Vediamo quindi gli altri metodi.

### CSS Interno

Questo metodo consiste nell’inserire il codice CSS **all’interno dell’head **della pagina HTML.

In questo modo il CSS è all’interno della pagina HTML ma **non in mezzo al contenuto HTML.** È una scelta sicuramente migliore rispetto all’Inline CSS ma non ancora ottimale.

Per inserire del CSS interno occorre andare **fra i tag \<head\>\</head\>** e indicare che stiamo per scrivere del codice CSS, in questo modo:

```
<style type="text/css">

</style>
```

All’interno del tag \<style\> possiamo inserire il codice CSS.

**Esempio:**

```
<style type="text/css">
   h1{
      color:red
   }
</style>
```

In questo caso** tutti gli h1 della pagina saranno rossi.**

### CSS Esterno

Questo è **il modo migliore** e più efficiente di gestire i file CSS.

Consiste nel **creare un file esterno**, che deve avere estensione .css, e **richiamarlo nell’head della pagina HTML.**

In questo modo **i linguaggi sono ben separati**, ognuno nel suo file.

**Esempio:**

Ora **creiamo un nuovo file** (CTRL+N) e salviamolo (CTRL+S) con il nome “***style.css***“.

In questo file possiamo inserire questo:

```
h1{
   color:red;
}
```

Ora **salviamo** “***style.css***” e apriamo “***index.html***“.

Andiamo **nell’head** di “index.html” e inseriamo questo sotto al title:

```
<link rel="stylesheet" href="style.css">
```

Se apri il file “***index.html***” nel tuo browser noterai che **l’h1 ora è rosso.**

Questi sono **i tre metodi **per inserire del codice CSS in una pagina HTML. Come avrai potuto capire **il metodo migliore è il terzo**, ma ci sono alcune occasioni nelle quali può essere utile applicare uno dei primi due metodi.

Ora che abbiamo imparato a inserire il CSS in una pagina HTML iniziamo a parlare proprio di CSS!

## Sintassi CSS

Il CSS è un linguaggio con una **sintassi specifica**. Se si commette un **errore** nella scrittura della sintassi il codice **non funzionerà.**

Ecco uno **schema** che raccoglie gli **elementi** del linguaggio CSS:

<div class="wp-block-image">

</div>

### Selettore

Indica **l’oggetto a cui applicare lo stile**. Questo può essere un tag html, come \<h1\>, \<p\> etc., oppure una classe o un id (approfondiremo classi e id fra poco).

### Proprietà

Una proprietà è una **regola che si applica al selettore**. Il CSS ha moltissime proprietà, man mano che imparerai questo linguaggio ne scoprirai sempre di più. Fortunatamente VS Code offre una lista di tutte le proprietà, visibile premendo “CTRL+Space Bar”.

Nell’esempio di prima la proprietà è “***color***“, altre fra le più utilizzate sono “background-color”, “margin”, “padding”, “border” etc.

### Valore

È il **valore da assegnare alla proprietà**. Può essere un colore, un numero in pixel o altro ancora. Imparerai ad utilizzare i valori corretti man mano che utilizzerai il CSS.

Proprietà e Valore devono essere racchiusi in una **parentesi graffa.**

Al termine di ogni Valore occorre inserire un “**punto e virgola**“.

**Esempio:**

```
h1{
   color:red;
}
```

- **h1** è il **selettore**
- sopo il selettore apro la **graffa**
- **color** è la **Proprietà**
- **red** è il **Valore**
- alla fine del valore inserisco il **punto e virgola**
- chiudo la **graffa**.

Dopo questa piccola introduzione teorica **iniziamo a fare sul serio!**

## **Iniziamo a sporcarci le mani**

Andiamo nel nostro file “style.css” e iniziamo a scrivere del codice CSS!

Iniziamo con il dare uno stile generale alla nostra pagina, utilizzando il selettore “body”, in questo modo:

```
body{
   color:#444;
   background-color:#f2f2f2
}
```

In questo modo abbiamo inserito un colore grigio scuro al testo e un bianco leggermente sporco allo sfondo.

## I colori

Nel codice CSS ci sono **vari modi con i quali inserire i colori:**

- Nome del colore
- Esadecimale
- RGB

### Nome del colore

Questo modo consente di indicare il colore semplicemente scrivendo il **nome del colore in inglese**.

Per esempio se voglio un colore bianco basterà scrivere “white”, e così via.

**Esempio:**

```
color:blue;
```

### Esadecimale

Il colore è indicato utilizzando un codice esadecimale, chiamato anche **Hex code**. Per utilizzare questo metodo occorre inserire un \# seguito dal codice a 6 cifre. È di gran lunga il metodo più utilizzato.

**Esempio:**

```
color:#f4f4f4;
```

### RGB

Consiste nell’indicare il colore utilizzando il **metodo RGB**. È possibile anche utilizzare delle trasparenze con l’RGBA.

**Esempi:**

**RGB:**

```
rgb(243, 163, 44)
```

**RGBA**:

```
rgba(243, 163, 44,.7)
```

In questo caso il “.7” indica che la trasparenza sarà al 70%.

## Font

Una delle prime cose da fare quando si personalizza un layout è **scegliere un bel font.**

Per inserire un font in un sito web occorre **importarlo**, per essere certi che qualsiasi utente su qualsiasi computer visualizzi il font corretto.

Fortunatamente **google **mette a disposizione moltissimi **font **in maniera **gratuita **e semplicissima da utilizzare. Vediamo come.

Per prima cosa andiamo su **google fonts**, a questo link: <https://fonts.google.com/>

Qua possiamo cercare il font che più ci piace. In questa guida utilizzeremo il “**Source Sans Pro**“.

Inseriamo quindi “**Source Sans Pro**” nella barra di ricerca di Google Fonts

<div class="wp-block-image">

</div>

e lo **selezioniamo**.

Ora ci troveremo di fronte ad una schermata come questa:

<div class="wp-block-image">

</div>

Sulla destra possiamo cliccare su “**+ Select this style**” in corrispondenza del carattere che vogliamo. Possiamo selezionarli tutti per avere tutte le variabili possibili del font, ma per ottimizzare i tempo di caricamento della pagina è meglio selezionare solo l’essenziale.

In questa guida selezioniamo solo il “**regular 400**” e il “**bold 700**“.

Ora si aprirà sulla destra una finestra come questa:

<div class="wp-block-image">

</div>

Qua clicchiamo su “**Embed**” e successivamente su “**@import**“

<div class="wp-block-image">

</div>

Adesso possiamo copiare il contenuto fra *\<style\>* e *\</style\>* e incollarlo nel nostro **“style.css**“, cancellando tutto il resto.

Ora aggiungiamo questo codice:

```
body{
    font-family: 'Source Sans Pro', sans-serif;
    font-size: 22px;
    font-weight: 400;
    font-style: normal;
    line-height: 35px;
}
```

In questo modo abbiamo impostato **“Source Sans Pro” come font primario **del sito.

Ecco cos’altro abbiamo impostato:

- **Font-size** indica la **dimensione **del font, che abbiamo settato a 22 pixel.
- **Font-weight** indica lo **spessore **del font, in questo caso è settato come regolare. In questo campo possiamo utilizzare sia i numeri da 100 a 900, sia il nome, da “lighter” a “bolder”. Logicamente occorrerà importare queste dimensioni da google fonts, per il momento abbiamo importato solo il 400 e il 700.
- **Font-style** indica lo **stile **del font, in questo caso è normale. Puoi inserire per esempio “italiac” per avere un font in corsivo.
- **Line-height **indica **l’altezza **del font, lo spazio fra le righe, in questo caso impostato a 35 pixel.

Prova a **salvare **il foglio di stile e **aggiornare **la pagina, vedrai che **il testo sarà cambiato!**

## Classi e id

Come abbiamo già accennato poco fa, è possibile impostare delle classi e degli id ai tag html, in modo da poterli **raggruppare **alcune regole di css.

Classi e id sono **attributi **che possiamo** aggiungere ai tag html** per distinguerli fra loro.

### Id

Un **id **è un** attributo univoco**, va utilizzato nel caso ci sia un elemento particolare che **non si ripeterà **mai. Se per esempio voglio che un titolo sia giallo, solo quel titolo, posso dargli un id particolare.

Per indicare un id nel CSS occorre farlo precedere da un **hashtag**

**Esempio:**

***style.css***

```
#giallo{
   color:yellow
}
```

***index.html***

```
<h2 id="giallo">Questo titolo è giallo</h2>
```

### Classi

Una classe è un** elemento che ritorna spesso**, e che quindi posso **riutilizzare**. Per esempio se voglio inserire una serie di bottoni con la stessa formattazione, posso dare loro la classe “**bottone**“, impostarla una sola volta nel CSS e questa verrà applicata a tutti gli elementi con la classe “bottone”

Per indicare una classe nel CSS occorre farla precedere da un **punto**.

**Esempio:**

***style.css***

```
.bottone{
   background-color:coral;
   border-radius: 15px;
   color:white;
}
```

***index.html***

```
<div class="bottone">Premi qui!</div>
```

## Margin e Padding

Per gestire gli spazi fra gli elementi si possono utilizzare “**margin**” e “**padding**“.

Ecco uno **schema **per spiegarti che differenza c’è fra i due:

<div class="wp-block-image">

</div>

Il **margin **indica lo spazio **all’esterno** del contenuto, il **padding **lo spazio **all’interno**.

È possibile indicare la **direzione **dello spazio sia per il margin che per il padding, per esempio se si vuole inserire un margine superiore occorre utiilzzare “**margin-top**“.

Ecco alcuni **esempi**:

***style.css***

```
.box-margin{
    background-color: coral;
    margin:50px
}
.box-padding{
    background-color: coral;
    padding:50px
}
.box-margin-top{
    margin-top: 50px;
    background-color: aquamarine;
}
```

***index.html***

```
    <h2>Margin e Padding</h2>
    <h3>Margin:</h3>
    <div class="box-margin">
        Questo è un box con del margine
    </div>
    
    <div class="box-margin-top">
        Questo box ha solo il margine superiore
    </div>
    
    <h3>Padding</h3>
    <div class="box-padding">
        Questo è un box con del padding
    </div>
```

## Contenitore

Gli elementi del CSS possono essere** uno dentro l’altro**, in questo modo permettono di creare layout più elaborati.

Proviamo a rendere la nostra pagina HTML un po’ più carina inserendola in un **contenitore**.

Andiamo** sotto il tag body** e inseriamo un **div **con classe “**container**“, in questo modo:

```
<div class="container">
```

Ora andiamo prima del \</body\> e** chiudiamo questo div**, inserendo:

```
</div>
```

Ora aggiungiamo questo codice nel nostro “**style.css**“:

```
.container{
    max-width: 800px;
    margin: 0 auto;
}
```

In questo modo abbiamo impostato una **larghezza massima del contenuto della nostra pagina a 800 pixel**, e impostato il margine del contenuto a 0 pixel dall’alto e dal basso e **automaticamente **da destra e sinistra.

Ora **salviamo **e **aggiorniamo **e vedremo il contenuto inserito a centro pagina, più carino no?

## Immagine come sfondo

Vediamo ancora un’ultima cosa prima di terminare questa prima carrellata generale di CSS: come inserire **un’immagine come sfondo** di un elemento.

Per poter inserire un’immagine come sfondo occorre utilizzare la proprietà “**background-image**“.

Creiamo un **div **che conterrà la nostra immagine nel file **html**:

```
<div class="immagine-sfondo">
    Questo div ha un'immagine di sfondo!
</div>
```

E inseriamo l’url all’immagine tramite il **CSS **nel nostro “style.css”:

```
.immagine-sfondo{
    background-image: url(img/immagine.jpg);
    height:500px;
    text-align: center;
    padding-top: 250px;
    color:white;
}
```

In questo modo abbiamo impostato **la nostra immagine come sfondo. **Abbiamo anche impostato **un’altezza **in modo da far vedere bene l’immagine.

Prova a **salvare **e **aggiornare **e vedrai cosa succede.

**Ora prova a smanettare un po’ **con queste classi e con queste regole, modificando dimensioni, font, colori, immagini e tutto ciò che hai in mente!

Ricorda che** il modo migliore per imparare e dedicare tanto tempo** alla pratica, quindi** inizia a darci dentro con il CSS!**

### Codice completo:

Qua puoi trovare il **codice completo** dei file index.html e style.css

***index.html***

```
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>La mia prima pagina web</title><!-- Il titolo della pagina che appare nella scheda del browser -->
    <link rel="stylesheet" href="style.css">
</head>

<body>
<div class="container">
    <!-- Titolo -->
    <h1>La mia prima pagina web</h1>
    <!-- Paragrafo -->
    <p>Benvenuto nella mia prima pagina web!</p>

    <br><!-- questo è un a capo-->

    <!-- Sottotitolo -->
    <h2>Sottotitolo</h2>

    <p>Questo è il secondo paragrafo della mia prima pagina web</p>

    <br>

    <h2>Elenco</h2>
    <!-- Elenco -->
    <ul>
        <li>Primo Item</li><!-- Item di un elenco -->
        <li>Secondo Item</li>
    </ul>

    <!-- Immagine -->
    <img src="img/immagine.jpg" width="200">

    <!-- DIV: block element -->
    <div style="background-color: green;">
        Questo è un contenitore con sfondo verde
    </div>

    <!-- SPAN: inline element -->
    <p>
        Questo è un paragrafo con del testo inserito a caso. In questo testo voglio
        <span style="color:red">colorare</span> una parola di rosso
    </p>

    <!-- FORM -->
    <form>
        <!-- Casella di testo -->
        <input type="text" placeholder="Nome">
        <br><br>
        <input type="text" placeholder="Cognome">
        <br><br>
        <!-- Menù a tendina -->
        <select name="select" id="">
            <option value="0">Opzione 1</option>
            <option value="1">Opzione 2</option>
            <option value="2">Opzione 3</option>
        </select>
        <br><br>
        <!-- Area di testo -->
        <textarea name="" id="" cols="30" rows="10" placeholder="Inserisci il testo qui."></textarea>
        <br><br>
        <!-- Checkbox-->
        <input type="checkbox" name="privacy" value="0">Accetto la Privacy Policy
        <br><br>
        <!-- Bottone -->
        <button>Invia</button>
    </form>

    <h2>Margin e Padding</h2>
    <h3>Margin:</h3>
    <div class="box-margin">
        Questo è un box con del margine
    </div>
    
    <div class="box-margin-top">
        Questo box ha solo il margine superiore
    </div>

    <h3>Padding</h3>
    <div class="box-padding">
        Questo è un box con del padding
    </div>

<div class="immagine-sfondo">
    Questo div ha un'immagine di sfondo!
</div>

</div>
</body>

</html>
```

***style.css***

```
@import url('https://fonts.googleapis.com/css2?family=Source+Sans+Pro:wght@400;700&display=swap');
body{
    font-family: 'Source Sans Pro', sans-serif;
    font-size: 22px;
    font-weight: lighter;
    line-height: 35px;
    font-style: normal;
}
.box-margin{
    background-color: coral;
    margin:50px
}
.box-padding{
    background-color: coral;
    padding:50px
}
.box-margin-top{
    margin-top: 50px;
    background-color: aquamarine;
}
.container{
    max-width: 800px;
    margin: 0 auto;
}
.immagine-sfondo{
    background-image: url(img/immagine.jpg);
    height:500px;
    text-align: center;
    padding-top: 250px;
    color:white;
}
```

<div class="wp-block-columns are-vertically-aligned-center is-layout-flex wp-container-core-columns-is-layout-8f761849 wp-block-columns-is-layout-flex">

<div class="wp-block-column is-vertically-aligned-center is-layout-flow wp-block-column-is-layout-flow">

*[\<\< Le basi di HTML](https://albertoreineri.it/le-basi-dellhtml/)*

</div>

<div class="wp-block-column is-vertically-aligned-center is-layout-flow wp-block-column-is-layout-flow">

*[Le basi di Javascript \>\>](https://albertoreineri.it/le-basi-di-javascript/)*

</div>

</div>
