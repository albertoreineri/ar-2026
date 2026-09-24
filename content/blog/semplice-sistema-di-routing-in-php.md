---
title: "Semplice sistema di routing in PHP, senza framework"
seoTitle: "Routing in PHP da zero, senza framework"
date: 2021-06-04
lastmod: 2026-09-24
description: "Come costruire un semplice router in PHP puro: tutto il traffico su index.php con .htaccess, mappatura degli URL, parametri dinamici e pagina 404 corretta."
tags: ["Guide", "PHP"]
translationKey: "php-routing-system"
---

Gli URL di un sito contano, per i motori di ricerca e per le persone. Un indirizzo come `/articoli/2026/05` è leggibile, si ricorda e si può "accorciare" a mano per risalire all'elenco del mese o dell'anno. Un indirizzo come `/articoli.php?anno=2026&mese=05` fa lo stesso lavoro, ma male.

Un CMS o un framework come Laravel gestiscono tutto questo per te. Ma per un progetto piccolo, o per capire cosa fanno i framework dietro le quinte, un router scritto da zero richiede poche decine di righe di PHP. Se ti serve solo togliere il `.php` dagli URL c'è una soluzione ancora più semplice: [nascondere l'estensione con .htaccess](/nascondere-lestensione-alla-fine-dellurl/). Se invece vuoi pieno controllo sugli indirizzi, ecco come fare.

{{< youtube lFtPh9eoPrc >}}

L'idea è semplice: **mandare tutte le richieste a `index.php`** e decidere lì, in PHP, quale pagina mostrare.

## 1. Tutto il traffico su index.php

Nella root del sito crea (o apri) il file `.htaccess`:

```
RewriteEngine On
RewriteBase /

RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^(.+)$ index.php [QSA,L]
```

Le due condizioni escludono i file e le cartelle che esistono davvero: CSS, JavaScript e immagini continuano a essere serviti direttamente da Apache. Tutto il resto finisce a `index.php`. `QSA` conserva la query string, quindi `$_GET` continua a funzionare.

Perché il file `.htaccess` venga letto, Apache deve avere `mod_rewrite` attivo e `AllowOverride All` nel virtual host. Su Ubuntu nessuno dei due è attivo di default: trovi come configurarli nella mia guida alla [LAMP stack su Ubuntu](/come-installare-una-lamp-stack/).

Se usi **nginx**, l'equivalente è una riga nel blocco `server`:

```
location / {
    try_files $uri $uri/ /index.php?$query_string;
}
```

## 2. Il router

In `index.php`:

```
<?php

// Solo il percorso, senza query string: /chi-siamo?utm_source=x diventa /chi-siamo
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
// Tolgo la barra finale, così /chi-siamo/ e /chi-siamo sono la stessa pagina
$path = rtrim($path, '/') ?: '/';

$routes = [
    '/'          => 'home.php',
    '/chi-siamo' => 'chi-siamo.php',
    '/contatti'  => 'contatti.php',
];

if (isset($routes[$path])) {
    require __DIR__ . '/views/' . $routes[$path];
    exit;
}

http_response_code(404);
require __DIR__ . '/views/404.php';
```

Tre dettagli che fanno la differenza rispetto alla versione più ingenua, che usa direttamente `$_SERVER['REQUEST_URI']` in uno `switch`:

- **`parse_url`**: `REQUEST_URI` contiene anche la query string. Senza questa riga, basta che qualcuno arrivi da una campagna con `?utm_source=newsletter` perché la home finisca in 404.
- **La barra finale**: `/chi-siamo` e `/chi-siamo/` sono URL diversi. Normalizzarli evita pagine "introvabili" per un carattere.
- **`http_response_code(404)`**: senza, la pagina di errore viene servita con codice 200 e Google la considera una pagina valida, da indicizzare. È quello che nella Search Console compare come *soft 404*.

Le rotte stanno in un array invece che in uno `switch`: aggiungere una pagina è una riga, e l'elenco completo degli URL del sito è leggibile a colpo d'occhio.

## 3. Le view

Nella cartella `views` crea un file per ogni pagina:

**views/home.php**

```
<h1>Home page</h1>
```

**views/chi-siamo.php**

```
<h1>Chi siamo</h1>
```

**views/404.php**

```
<h1>Pagina non trovata</h1>
```

Header, footer e menu li puoi mettere in due file separati (`views/partials/header.php` e `footer.php`) da includere in ogni view, oppure direttamente in `index.php`, prima e dopo il `require` della view.

## 4. URL con parametri

Un router serve davvero quando gli URL contengono dati: `/articolo/come-funziona-il-dns`, `/prodotto/42`. Per questi casi basta un'espressione regolare, da aggiungere prima della risposta 404:

```
if (preg_match('#^/articolo/([a-z0-9-]+)$#', $path, $matches)) {
    $slug = $matches[1];
    require __DIR__ . '/views/articolo.php';
    exit;
}
```

Dentro `views/articolo.php` la variabile `$slug` contiene la parte finale dell'URL, e la usi per cercare l'articolo nel database. Sempre con una query preparata: nella mia guida su [come collegare PHP e MySQL con PDO](/collegare-php-e-mysql-con-pdo/) trovi come farlo. Se l'articolo non esiste, rispondi anche lì con `http_response_code(404)`.

L'espressione regolare fa anche da **filtro di sicurezza**: accetta solo lettere minuscole, numeri e trattini, quindi nel parametro non possono arrivare barre, punti o altri caratteri strani.

## 5. GET e POST

Un form di contatto usa lo stesso URL in due modi: `GET /contatti` mostra il form, `POST /contatti` lo riceve. Basta includere il metodo nella chiave delle rotte:

```
$method = $_SERVER['REQUEST_METHOD'];

$routes = [
    'GET /'          => 'home.php',
    'GET /chi-siamo' => 'chi-siamo.php',
    'GET /contatti'  => 'contatti.php',
    'POST /contatti' => 'contatti-invio.php',
];

$key = $method . ' ' . $path;

if (isset($routes[$key])) {
    require __DIR__ . '/views/' . $routes[$key];
    exit;
}
```

Per l'invio dell'email dal form, ho scritto una guida su come [inviare mail in PHP](/inviare-mail-in-php/).

## Una regola di sicurezza

Qualunque cosa aggiungi, **non costruire mai il percorso di un file direttamente dall'URL**. Qualcosa come `require 'views/' . $path . '.php'` sembra elegante, ma apre la porta a richieste come `/../../config` e permette di includere file che non dovevano essere raggiungibili. Con la mappa esplicita delle rotte e le espressioni regolari restrittive viste sopra, questo problema non esiste.

## Provarlo in locale senza Apache

Il server integrato di PHP accetta un *router script*, quindi puoi provare tutto senza `.htaccess` e senza installare niente:

```
php -S localhost:8000 index.php
```

In questo caso aggiungi in cima a `index.php` una riga che lascia servire direttamente i file statici, che altrimenti passerebbero anche loro dal router:

```
if (PHP_SAPI === 'cli-server' && is_file(__DIR__ . parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH))) {
    return false;
}
```

## Quando passare a qualcosa di più serio

Questo router va benissimo per un sito di qualche decina di pagine o per un piccolo pannello di amministrazione. È anche la base di [Orange CMS](/orange/), il CMS che ho scritto in PHP. Quando cominci a servirti middleware (autenticazione, CSRF), gruppi di rotte o generazione degli URL a partire dal nome della rotta, stai riscrivendo un framework: a quel punto conviene una libreria come [FastRoute](https://github.com/nikic/FastRoute) o direttamente un framework come Slim o Laravel.
