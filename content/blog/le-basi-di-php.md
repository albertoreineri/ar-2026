---
title: "6. Le basi di PHP"
date: 2020-03-17
description: "PHP è uno dei linguaggi di programmazione più utilizzati al mondo in ambito web. Moltissime grandi aziende lo utilizzano per i loro progetti, tra cui Facebook Wikipedia Yahoo Mailchimp Slack…"
tags: ["Guide", "Inizia Qui"]
---

**PHP** è uno dei linguaggi di programmazione **più utilizzati al mondo** in ambito web.

Moltissime **grandi aziende** lo utilizzano per i loro progetti, tra cui

- Facebook
- Wikipedia
- Yahoo
- Mailchimp
- Slack
- Dailymotion
- Etsy

Fra queste c’è anche Automattic, l’azienda che ha realizzato e gestisce **WordPress**.

Il nostro **CMS** è infatti realizzato utilizzando il **PHP**.

Come per ogni Framework è sempre bene conoscere, almeno in linea generale, il linugaggio su cui è costruito. In questo caso a noi interessa **WordPress**, perciò **è bene sapere un po’ di PHP** per riuscire a comprenderlo a fondo.

Vediamo quindi **come funziona il PHP**

## Il PHP

Il php è un linguaggio **lato server,** cioè non può funzionare semplicemente sul browser, come avviene per HTML, CSS e Javascript, ma **ha bisogno di un server **per poter funzionare.

La particolarità del PHP è che **può essere eseguito all’interno delle pagine HTML,** può essere inserito direttamente in mezzo ai vari tag html.

**Esempio:**

``` wp-block-code
<html>
   <head></head>
   <body>
      <?php echo "CIAO"; ?>
   </body>
</html>
```

In questo caso puoi notare come** il PHP sia inserito direttamente nel body della pagina HTML.**

Questo rende il suo utilizzo molto **semplice** ed immediato.

### Server locale

Per poter iniziare a utilizzare PHP sul nostro computer dobbiamo **utilizzare un server locale.**

Come già detto prima, se HTML, CSS e Javascript possono girare nel browser, il PHP ha bisogno di un server.

Esistono molti server locali. In questa guida utilizzeremo [XAMPP](https://albertoreineri.it/guide/come-funziona-xampp/), perché è semplice e disponibile per tutti i sistemi operativi.

Se vuoi sapere come installare XAMPP guarda [qui](https://albertoreineri.it/guide/come-funziona-xampp/).

### Sintassi di base

Come già detto il PHP viene eseguito nelle pagine HTML, ma occorre **separare ciò che è PHP da ciò che non lo è.**

Il codice PHP va inserito all’interno di questi tag:*** \<?php*** e *?\>*

``` wp-block-code
<?php 
    //Codice php
?>
```

Tutto ciò inserito fra questi tag sarà php, il resto sarà HTML.

### Fine riga

Come per il Javascript, anche il PHP necessita del **punto e virgola** alla fine di ogni riga, per poter capire dove termina una regola e ne inizia un’altra. Ricordati perciò semprio di inserire il punto e virgola dopo ogni riga

``` wp-block-code
echo "CIAO";
```

### Commenti

I commenti possono essere di **due tipi:**

**Una riga: **Se si vuole commentare l’intera riga basta inserire un **doppio slash** all’inizio della riga

``` wp-block-code
// Commento di una riga
```

**Più righe: **Per commentare più righe occorre utilizzare ***/\* commento \*/.***

``` wp-block-code
/* Commento su
più righe
Commento
Commento*/
```

### Variabili

Le variabili in PHP sono precedute da **\$**, in questo modo:

``` wp-block-code
$saluto = "CIAO";
echo $saluto;
```

**Iniziamo!**

Per prima cosa andando nella cartella **htdocs** di XAMPP e creando una nuova cartella “**php_test**“.

## Stampare testo in HTML

Iniziamo con un semplice esercizio: stampiamo il classico “**Ciao mondo!**” su una pagina HTML.

Creiamo un file **“index.php**” e apriamolo con **VS Code.**

Ora possiamo premere **Punto esclamativo **seguito da **tab**, in questo modo **VS Code **ci fornirà lo **scheletro** html di base.

Ora procediamo a **stampare la nostra scritta.**

La funzione PHP per stampare del testo è **echo();**

Scriviamo quindi questo nel body:

``` wp-block-code
<?php
   echo("Ciao mondo!");
?>
```

Ora **salviamo**, apriamo il browser e **andiamo a questo link:**

<http://localhost/php_test>

Se tutto è andato liscio dovremmo vedere scritto “**Ciao mondo!**“.

**Perfetto**! Hai iniziato ad usare il PHP. Ma ora andiamo un po’ più a fondo.

## Variabili

In php possiamo **definire una variabile **con questa sintassi:

``` wp-block-code
$x = 1;
$y = "ciao";
$z = True;
```

Abbiamo appena definito una variabile denominata *x* con il numero 1, una variabile denominata *y* con la stringa “ciao” e un nome variabile *z* con il valore booleano True. Una volta definiti, possiamo usarli nel codice.

PHP ha molti tipi di variabili, ma i tipi di variabili più basilari sono numeri interi (numeri interi), float (numeri decimali), stringhe e valori booleani.

PHP può utilizzare anche **array** e oggetti che spiegheremo più avanti.

Le variabili possono anche essere impostate su **NULL**, il che significa che le variabili esistono, ma non contengono alcun valore.

## Operatori aritmetici

Possiamo usare semplici operatori aritmetici per **aggiungere**, **sottrarre** o **concatenare** le variabili.

Possiamo anche **stampare** le variabili PHP usando il comando *echo* (come abbiamo visto poco fa).

Proviamo per esempio a sommare due numeri, inserire il risultato in una nuova variabile e stamparla.

``` wp-block-code
$x = 1;
$y = 2;
$somma = $x + $y;
echo $somma;       // Stampa 3
```

## Concatenare stringhe

In PHP è possibile concatenare variabili e stringhe utilizzando il pungo (*.*), in questo modo:

``` wp-block-code
$anni = 30;
$nome = "Marco";
echo $nome . " ha " . $anni . " anni!";
```

## Stringhe

Le stringhe sono **variabili che contengono testo**. Ad esempio, una stringa che contiene un nome è definita come segue:

``` wp-block-code
$nome = "Marco";
echo $nome;
```

Possiamo **formattare facilmente le stringhe usando le variabili**. Per esempio:

``` wp-block-code
$nome = "Marco";
$frase = "Ciao $nome";
echo $frase;
```

Possiamo anche **concatenare** le stringhe usando l’ *.* operatore punto . Per esempio:

``` wp-block-code
$nome = "Marco";
$cognome = "Rossi";
$nome_completo = $nome . " " . $cognome;
echo $nome_completo;
```

Per misurare la **lunghezza** di una stringa, utilizziamo la funzione *strlen*:

``` wp-block-code
$string = "Misuriamo quanti caratteri ha questa stringa";
echo strlen($string);
```

Per tagliare una parte di una stringa e restituirla come nuova stringa, possiamo usare la funzione *substr*:

``` wp-block-code
$filename = "image.png";
$extension = substr($filename, strlen($filename) - 3);
echo "L'estensione di questo file è $extension";
```

## Matrici semplici

Le matrici sono un tipo speciale di v**ariabile che può contenere molte variabili** e tenerle in un elenco.

Ad esempio, supponiamo di voler creare un elenco di tutti i numeri dispari tra 1 e 10. Una volta creato l’elenco, possiamo assegnare nuove variabili che faranno riferimento a una variabile nell’array, utilizzando l’indice della variabile.

Per utilizzare la prima variabile nell’elenco (in questo caso il numero 1), dovremo fornire **il primo indice**, che è **0**, poiché PHP utilizza indici basati su zero, come quasi tutti i linguaggi di programmazione oggi.

``` wp-block-code
$numeri_dispari = [1,3,5,7,9];
$primo_numero_dispari = $numeri_dispari[0];
$secondo_numero_dispari = $numeri_dispari[1];

echo "Il primo numero dispari è $primo_numero_dispari\n";
echo "Il secondo numero dispari è $secondo_numero_dispari\n";
```

Ora possiamo aggiungere nuove variabili usando un indice. Per aggiungere un elemento alla fine dell’elenco, possiamo assegnare l’array con l’indice 5 (la sesta variabile):

``` wp-block-code
$numeri_dispari = [1,3,5,7,9];
$numeri_dispari[5] = 11;
print_r($numeri_dispari);
```

## Loop

I loop ci aiutano a scorrere su una variabile utilizzando un indice. Esistono **due tipi di loop**: **semplice** (stile C) e un loop **foreach**.

### Loop semplice

I loop sono molto utili quando dobbiamo **scorrere su un array e fare riferimento al membro dell’array usando un indice che cambia**. Ad esempio, supponiamo di avere un elenco di numeri dispari. Per stamparli, dobbiamo fare riferimento a ciascun articolo singolarmente. Il codice che scriviamo nel ciclo for può usare l’indice *i*, che cambia in ogni iterazione del ciclo for.

``` wp-block-code
$numeri = [1,3,5,7,9];
for ($i = 0; $i < count($numeri); $i=$i+1) {
    $numero = $numeri[$i];
    echo $numero . "\n";
}
```

**La prima riga del ciclo for definisce 3 parti:**

- La dichiarazione di inizializzazione – nel nostro caso, inizializziamo la variabile *\$i* su 0.
- L’istruzione condizionale – questa istruzione viene valutata in ogni ciclo. Il loop si interrompe quando questa condizione non è soddisfatta. Questo accadrà quando la variabile *\$i* sarà più grande della lunghezza dell’array.
- L’istruzione incrementale: questa istruzione viene eseguita ogni volta per aumentare la variabile indice della quantità necessaria. Di solito aumenteremo *\$i* di 1. Esistono anche due modi più brevi per aumentare una variabile di 1. 

### Ciclo foreach

Il ciclo **foreach** esegue il loop su un elemento come una matrice o un oggetto, fornendo i membri in una specifica variabile uno alla volta.

Ad esempio, supponiamo di voler creare un elenco di tutti i numeri dispari tra 1 e 10 e stamparli uno per uno, come nell’esempio precedente. Questa volta, useremo il *foreach*   invece di un *for*  regolare con una variabile. Invece di utilizzare la variabile come indice dell’array, otteniamo l’elemento dall’array direttamente nella variabile *\$numeri_dispari* .

``` wp-block-code
$numeri_dispari = [1,3,5,7,9];
foreach ($numeri_dispari as $numero) {
  echo $numero . "\n";
}
```

## Ciclo di While

I cicli **While** sono semplici blocchi che vengono eseguiti ripetutamente fino a quando non viene soddisfatta la condizione del ciclo while.

Ecco un esempio di un ciclo che viene eseguito per un totale di 10 volte:

``` wp-block-code
$counter = 0;

while ($counter < 10) {
    $counter += 1;
    echo "Funzione eseguita $counter\n volte.<br>";
}
```

## funzioni

Le funzioni sono semplici **blocchi di codice che possiamo chiamare da qualsiasi luogo**. Ad esempio, possiamo creare una funzione che somma un elenco di numeri e restituisce il risultato. Chiamiamo questa funzione *somma*.

Una funzione riceve un elenco di argomenti separati da virgole. Ogni argomento esiste solo nel contesto della funzione, nel senso che diventano variabili all’interno del blocco funzione, ma non sono definiti al di fuori di quel blocco funzione.

``` wp-block-code
// Definiamo una funzione chiamata "somma" che farà la somma di una lista di numeri
function somma($numeri) {
    // inizializziamo la variabile somma
    $somma = 0;

    // Sommiamo i numero
    foreach ($numeri as $numero) {
        $somma += $numero;
    }

    // restituiamo la somma
    return $somma;
}

// Esempio di utilizzo della funzione
echo somma([1,2,3,4,5,6,7,8,9,10]);
```

In questo caso abbiamo la funzione “***somma***” che sommerà tutti i numeri che passeremo al loro interno.

**Richiamiamo** quindi la funzione in un *echo*, in questo modo stamperemo la somma dei numeri inseriti nel’array dentro la funzione.

Come per ogni cosa il metodo migliore è sempre quello di **provare, provare e riprovare!**

**Prenditi quindi il tuo tempo** e prova a smanettare un po’ con le funzioni che hai imparato qui sopra!

Il PHP consente di fare ben altre cose, ma **per iniziare con WordPress questo può bastare!**

**Quando ti senti pronto prova** adare un’occhiata alle nostre guide per **[creare un tema WordPress da zero](https://albertoreineri.it/guide/creare-un-tema-wordpress-da-zero-parte-1/)**, così potra imettere in pratica quello che hai imparato

*[\<\< Le basi di jQuery](https://albertoreineri.it/guide/le-basi-di-jquery/)*
