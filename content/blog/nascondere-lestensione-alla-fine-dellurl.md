---
title: "Nascondere l’estensione alla fine dell’URL"
date: 2019-12-19
description: "Oggi vedere l’estensione alla fine dell’URL non è il massimo, sia per quanto riguarda la SEO che per la “figura” che il sito fa con l’utente finale, sarebbe meglio nasconderla. La possibilità di…"
tags: ["Guide", "Web Dev"]
---

Oggi vedere l’estensione alla fine dell’URL non è il massimo, sia per quanto riguarda la SEO che per la “figura” che il sito fa con l’utente finale, sarebbe meglio nasconderla.

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

La **possibilità di sceglierci gli URL** è fondamentale per creare un buon sito. Utilizzando nel modo corretto le pagine PHP si può arrivare semplicemente a questo risultato nascondendo solamente l’estensione dall’URL

In questa guida vedremo come** “cancellare” il .php** alla fine dell’URL.

Per fare questo è sufficiente** inserire il seguente codice nel file .htaccess** nella root del sito. Se il file .htaccess non esiste createlo utilizzando un editor di testo.

``` wp-block-code
RewriteEngine on

RewriteCond %{THE_REQUEST} /([^.]+)\.php [NC]

RewriteRule ^ /%1 [NC,L,R]

RewriteCond %{REQUEST_FILENAME}.php -f

RewriteRule ^ %{REQUEST_URI}.php [NC,L]
```

In questo modo tutti i vostri file “.php” verranno visualizzati senza estensione.

Così facendo tutto il sito risulta migliore. Gli indirizzi saranno molto più “*seo friendly*” e ne gioverà anche la sicurezza del sito web.

Se guardi i siti moderni delle grandi aziende ormai nessuno utilizza più l’estensione alla fine dell’URL.

Oggi possiamo utilizzare anche framework che ci permettono di gestire gli URL in maniera completamente personalizzata e ottimale, ma non sempre si ha bisogno di un intero framework. Spesso per piccoli progetti conviene fare le cose da zero, e in questi casi basta qualche riga di codice nel file .htaccess e si può facilmente nascondere l’estensione dall’URL.

Se vuoi imparare ad utilizzare un semplice sistema di routing, per organizzare il sito web nel modo migliore e gestire al meglio i tuoi URL, leggi questo [articolo](https://albertoreineri.it/guide/semplice-sistema-di-routing-in-php/). È molto basico e semplice ma può essere utilizzato per piccoli progetti senza grandi pretese. Certo non ha nulla a che vedere con il routing di <a href="https://laravel.com/" target="_blank" rel="noreferrer noopener">Laravel</a> per esempio, ma può essere un buon punto di partenza per migliorare le proprie skills.
