---
title: "Collegare PHP e MySQL con PDO"
date: 2021-06-30
description: "Collegare un database MySQL ad un progetto PHP è quasi sempre fondamentale, vediamo come farlo utilizzando PDO. È possibile continuare ad utilizzare MySQLi, ma PDO garantisce livelli di sicurezza…"
tags: ["Guide", "PHP"]
---

Collegare un database MySQL ad un progetto [PHP](/tags/php/) è quasi sempre fondamentale, vediamo come farlo utilizzando PDO.

È possibile continuare ad utilizzare MySQLi, ma <a href="https://www.html.it/pag/63991/pdo-vs-mysqli/" target="_blank" rel="noreferrer noopener">PDO</a> garantisce livelli di sicurezza maggiori.

<figure class="wp-block-embed is-type-video is-provider-youtube wp-block-embed-youtube wp-embed-aspect-16-9 wp-has-aspect-ratio">
<div class="wp-block-embed__wrapper">
<div class="iframe">
<div id="player">

</div>
<div class="player-unavailable">
<h1 id="si-è-verificato-un-errore." class="message">Si è verificato un errore.</h1>
<div class="submessage">
Impossibile eseguire JavaScript
</div>
</div>
</div>
</div>
</figure>

La procedura è molto semplice, vediamo come fare:

Per prima cosa definiamo le variabili di connessione al nostro database:

``` wp-block-code
$servername = "localhost";
$username="root";
$passworddb="root";
$dbname="dbname";
```

Ora non ci resta che effettuare la connessione vera e propria, in questo modo:

``` wp-block-code
try{
    $db = new PDO("mysql:=$servername;dbname=$dbname", $username, $passworddb);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e){
    print "Errore! ". $e->getMessage() ." <br/>";
    die();
}
```

Con questo effettueremo la connessione al nostro DB e genereremo un messaggio in caso di errore, in modo da velocizzare il debug.

Ora non ci resta che testare la connessione. Aprendo il file contenente questo codice dovrete vedere una pagina completamente bianca, se è così allora la connessione funziona, altrimenti dovrete vedere un messaggio di errore.

Per essere ancora più sicuri della connessione proviamo a inserire dei dati nel nostro db e andarli a prendere e stampare sulla pagina PHP.

In questo esempio ho creato una tabella “Users” con all’interno un campo “Nome”. Ora andiamo a stampare tutti i dati all’interno di questa tabella:

``` wp-block-code
// Seleziono da DB
$query = $db->prepare("SELECT * FROM Users");
$query->execute();
$query->setFetchMode(PDO::FETCH_ASSOC);
while($row = $query->fetch()){
    echo $row['nome']. "<br>;
}
```

E Voilà! Se vi appare l’elenco dei nomi che avete inserito nel DB allora la connessione del php con MySQL attraverso PDO è fatta, non resta che svilupparci la web app intorno!

*Buon codice!*
