---
title: "Collegare PHP e MySQL con PDO"
date: 2021-06-30
lastmod: 2026-09-24
description: "Collegare un database MySQL ad un progetto PHP è quasi sempre fondamentale, vediamo come farlo utilizzando PDO. È possibile continuare ad utilizzare MySQLi, ma PDO garantisce livelli di sicurezza…"
tags: ["Guide", "PHP"]
---

Collegare un database MySQL ad un progetto [PHP](/tags/php/) è quasi sempre fondamentale, vediamo come farlo utilizzando PDO.

È possibile continuare ad utilizzare MySQLi, ma <a href="https://www.html.it/pag/63991/pdo-vs-mysqli/" target="_blank" rel="noreferrer noopener">PDO</a> garantisce livelli di sicurezza maggiori.

{{< youtube x_2koTcxdDg >}}

La procedura è molto semplice, vediamo come fare:

Per prima cosa definiamo le variabili di connessione al nostro database:

```
$servername = "localhost";
$username = "esempio";
$passworddb = "una-password-lunga-e-casuale";
$dbname = "esempio";
```

Non usare l'utente `root` di MySQL nelle applicazioni: crea un utente dedicato con permessi solo sul suo database. Nella mia guida alla [LAMP stack su Ubuntu](/come-installare-una-lamp-stack/) trovi i comandi per farlo.

Ora non ci resta che effettuare la connessione vera e propria, in questo modo:

```
try {
    $db = new PDO("mysql:host=$servername;dbname=$dbname;charset=utf8mb4", $username, $passworddb);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    print "Errore! " . $e->getMessage() . "<br>";
    die();
}
```

Il `charset=utf8mb4` nella stringa di connessione evita problemi con accenti ed emoji. In produzione non stampare il messaggio di errore a video, perché può contenere dettagli sulla configurazione: scrivilo nei log.

Con questo effettueremo la connessione al nostro DB e genereremo un messaggio in caso di errore, in modo da velocizzare il debug.

Ora non ci resta che testare la connessione. Aprendo il file contenente questo codice dovrete vedere una pagina completamente bianca, se è così allora la connessione funziona, altrimenti dovrete vedere un messaggio di errore.

Per essere ancora più sicuri della connessione proviamo a inserire dei dati nel nostro db e andarli a prendere e stampare sulla pagina PHP.

In questo esempio ho creato una tabella “Users” con all’interno un campo “Nome”. Ora andiamo a stampare tutti i dati all’interno di questa tabella:

```
// Seleziono da DB
$query = $db->prepare("SELECT * FROM Users");
$query->execute();
$query->setFetchMode(PDO::FETCH_ASSOC);
while ($row = $query->fetch()) {
    echo htmlspecialchars($row['Nome']) . "<br>";
}
```

`htmlspecialchars` impedisce che un valore salvato nel database venga interpretato come HTML: senza, un nome come `<script>...` verrebbe eseguito nel browser.

E Voilà! Se vi appare l’elenco dei nomi che avete inserito nel DB allora la connessione del php con MySQL attraverso PDO è fatta, non resta che svilupparci la web app intorno!

*Buon codice!*
