---
title: "Nascondere l'estensione .php alla fine dell'URL con .htaccess"
seoTitle: "Togliere .php dall'URL con .htaccess"
date: 2019-12-19
lastmod: 2026-09-24
description: "Poche righe di mod_rewrite nel file .htaccess per nascondere l'estensione .php dagli URL e reindirizzare le vecchie richieste alla versione pulita."
tags: ["Guide", "Web Dev"]
translationKey: "hide-url-extension"
---

`/chi-siamo` è più pulito di `/chi-siamo.php`. Non è una questione di SEO in senso stretto, perché a Google l'estensione non interessa. Il punto è che un URL senza estensione non dipende dalla tecnologia: se un domani il sito passa a un framework o a un generatore statico, gli indirizzi restano gli stessi e non perdi link e posizionamento.

Su un sito in PHP semplice, senza CMS né framework, bastano poche righe nel file `.htaccess`.

{{< youtube VWqwsKL2-mM >}}

## Il codice

Nella root del sito, nel file `.htaccess` (se non esiste, crealo):

```
RewriteEngine On

# 1. /index.php e /cartella/index.php -> / e /cartella/
RewriteCond %{THE_REQUEST} \s/+(.*/)?index(\.php)?[\s?] [NC]
RewriteRule ^ /%1 [R=301,L,NE]

# 2. /pagina.php -> /pagina (redirect visibile, tranne per i form in POST)
RewriteCond %{REQUEST_METHOD} !POST
RewriteCond %{THE_REQUEST} \s/+(.+?)\.php[\s?] [NC]
RewriteRule ^ /%1 [R=301,L,NE]

# 3. /pagina -> pagina.php (rewrite interno, l'utente non lo vede)
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_FILENAME}.php -f
RewriteRule ^(.+)$ $1.php [L]
```

Cosa fa ogni blocco:

1. **La home e gli indici** non diventano `/index`: chi arriva su `/index.php` viene mandato a `/`.
2. **I vecchi URL con `.php`** (link esterni, risultati di Google, segnalibri) vengono reindirizzati alla versione pulita con un redirect **301**. È il 301 che dice a Google che l'indirizzo è cambiato per sempre, e trasferisce il posizionamento sul nuovo URL.
3. **Le richieste senza estensione** vengono servite dal file `.php` corrispondente, ma senza redirect: l'indirizzo nella barra resta `/chi-siamo`.

## Perché proprio così

Il codice che trovi in giro (compresa la prima versione di questo articolo) è spesso più corto. Questi sono i dettagli che fanno la differenza.

**`THE_REQUEST` invece di `REQUEST_URI`.** `THE_REQUEST` è la richiesta originale del browser, prima di qualsiasi riscrittura. Se la regola 2 guardasse `REQUEST_URI`, vedrebbe anche il `.php` aggiunto internamente dalla regola 3, e il risultato sarebbe un redirect infinito.

**I form in POST sono esclusi.** Se un form ha `action="contatti.php"` e il server risponde con un redirect, il browser rifà la richiesta in GET e i dati inviati vanno persi senza nessun errore visibile. Con la condizione `!POST` i vecchi form continuano a funzionare. Aggiorna comunque i link e le `action` dei form alla versione senza estensione.

**`R=301` esplicito.** Un semplice `R` produce un redirect **302**, cioè temporaneo, e Google continua a considerare il vecchio URL come quello principale.

**`NE`** evita che i caratteri speciali negli URL vengano codificati due volte durante il redirect.

## Prima di andare in produzione: testa con 302

I browser memorizzano i redirect 301 in modo molto aggressivo. Se sbagli una regola e la provi con il 301, il tuo browser continuerà a seguire il redirect sbagliato anche dopo che l'hai corretto. Mentre fai le prove, sostituisci `R=301` con `R=302` e lavora in una finestra anonima. Quando tutto funziona, torna a `R=301`.

Da terminale puoi verificare i redirect senza il browser di mezzo:

```
curl -I https://esempio.it/chi-siamo.php
```

Nella risposta devi vedere `HTTP/1.1 301` e `Location: https://esempio.it/chi-siamo`.

## Se non funziona

**Errore 500 appena salvi il file.** Di solito `mod_rewrite` non è attivo, e Apache non riconosce `RewriteEngine`. Su Debian e Ubuntu: `sudo a2enmod rewrite && sudo systemctl restart apache2`. Il motivo esatto è sempre nel log degli errori di Apache.

**Le regole vengono ignorate.** Apache non sta leggendo il file `.htaccess`: nel virtual host manca `AllowOverride All`. Nella mia guida alla [LAMP stack su Ubuntu](/come-installare-una-lamp-stack/) trovi la configurazione completa.

**Il sito è in una sottocartella.** Se il sito è in `esempio.it/progetto/`, aggiungi `RewriteBase /progetto/` sotto `RewriteEngine On`, e nelle regole 1 e 2 sostituisci `/%1` con `/progetto/%1`.

**Usi nginx.** nginx non legge i file `.htaccess`. L'equivalente della regola 3 va nella configurazione del server:

```
location / {
    try_files $uri $uri/ @php;
}

location @php {
    rewrite ^(.*)$ $1.php last;
}
```

## Un passo in più

Nascondere l'estensione è la soluzione giusta quando ogni pagina è già un file `.php` separato. Se vuoi URL con parametri, come `/articolo/come-funziona-il-dns`, o una pagina 404 gestita in PHP, il passo successivo è un router: ho scritto come costruire un [semplice sistema di routing in PHP](/semplice-sistema-di-routing-in-php/) da zero, senza framework.
