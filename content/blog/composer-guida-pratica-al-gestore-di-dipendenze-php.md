---
title: "Composer: la guida pratica al gestore di dipendenze di PHP"
date: 2026-10-12
description: "Cos'è Composer, come funzionano composer.json e composer.lock, i comandi che uso ogni giorno, il semantic versioning e gli errori più comuni con progetti PHP moderni."
tags: ["Guide", "PHP"]
translationKey: "composer-guide"
---

Se lavori con PHP da un po', avrai sicuramente incontrato un file `composer.json` dentro un progetto Laravel, uno script da riga di comando o un plugin WordPress un po' più serio. **Composer** è il gestore di dipendenze di PHP: scarica le librerie di cui il tuo progetto ha bisogno, si assicura che le versioni siano compatibili tra loro e ti genera l'autoload, cioè smette di farti scrivere `require` a mano per ogni singolo file.

In questa guida vediamo cosa fa davvero, i comandi che uso ogni giorno e gli errori in cui inciampano quasi tutti la prima volta.

## Cos'è Composer e perché non puoi più farne a meno

Prima di Composer, in PHP le librerie si scaricavano a mano, si copiavano in una cartella `libs/` e si includevano con `require_once`. Funzionava, ma aveva due problemi grossi: aggiornare una libreria voleva dire sovrascrivere i file a mano, e se due librerie dipendevano da versioni diverse di una terza libreria, il conflitto lo scoprivi solo in produzione, nel peggiore dei modi.

Composer risolve entrambi i problemi. Tu dichiari **di cosa hai bisogno** (es. "Monolog versione 3, Guzzle versione 7"), e lui si occupa di:

- scaricare quelle librerie e tutte le loro dipendenze a cascata;
- calcolare un set di versioni compatibili tra tutte;
- generare un autoloader che carica le classi al bisogno, senza `require` sparsi ovunque.

Oggi praticamente ogni framework PHP moderno (Laravel, Symfony, Slim) e molte librerie standalone si installano così. Anche WordPress, nei progetti più strutturati, lo usa per gestire plugin e librerie custom invece del solito upload via FTP.

## composer.json e composer.lock: a cosa servono davvero

Sono i due file che Composer legge e scrive, e la differenza tra i due è la cosa che genera più confusione.

**`composer.json`** è quello che scrivi tu (o che Composer scrive per te quando aggiungi un pacchetto). Contiene i **vincoli** di versione, non le versioni esatte:

```json
{
  "require": {
    "monolog/monolog": "^3.0",
    "guzzlehttp/guzzle": "^7.8"
  }
}
```

**`composer.lock`** è generato automaticamente da Composer e contiene le **versioni esatte** che sono state effettivamente installate, con tanto di hash per verificarne l'integrità. Non lo scrivi mai a mano.

Perché serve il lock file? Perché `^3.0` è un vincolo che potrebbe risolversi in `3.0.0` oggi e in `3.4.2` il mese prossimo, se nel frattempo escono nuove versioni compatibili. Senza il lock file, due sviluppatori che clonano lo stesso repository in momenti diversi potrebbero finire con versioni leggermente diverse delle stesse librerie, e un bug che compare solo su una macchina è tra le cose più frustranti da debuggare.

**Il lock file va sempre committato in git**, anche se può sembrare controintuitivo per un file "generato". È l'unico modo per garantire che tu, un collega e il server di produzione stiate usando esattamente le stesse versioni.

## I comandi che uso ogni giorno

### composer install vs composer update

Questa è la distinzione più importante e quella che crea più danni quando viene confusa:

```
composer install
```

Legge il `composer.lock` e installa **esattamente** quelle versioni. Non tocca il lock file. È il comando che usi quando cloni un progetto esistente, e quello che deve girare in produzione o in CI.

```
composer update
```

Ignora le versioni bloccate, ricalcola le versioni più recenti compatibili con i vincoli in `composer.json` e **sovrascrive** il `composer.lock`. È il comando che usi quando vuoi aggiornare deliberatamente le dipendenze, non quello che usi per "tirare su" un progetto che hai appena clonato.

Una regola semplice: se non hai appena modificato `composer.json` a mano o non vuoi aggiornare nulla, usa `install`.

### Aggiungere e rimuovere pacchetti

```
composer require guzzlehttp/guzzle
composer require --dev phpunit/phpunit
composer remove guzzlehttp/guzzle
```

`--dev` installa il pacchetto solo come dipendenza di sviluppo (test, linter, debug bar): non viene scaricato quando qualcuno installa il progetto in produzione con `composer install --no-dev`.

### Autoload: niente più require a mano

Una volta installato qualcosa, nel tuo codice basta:

```php
require __DIR__ . '/vendor/autoload.php';

use Monolog\Logger;
$log = new Logger('app');
```

Composer genera `vendor/autoload.php` leggendo lo standard **PSR-4**: una convenzione che mappa i namespace delle classi alle cartelle sul disco. Funziona anche per il tuo codice, non solo per le librerie esterne: nella sezione `autoload` del tuo `composer.json` puoi dire "il namespace `App\\` corrisponde alla cartella `src/`", ed ecco che anche le tue classi si caricano da sole, senza un `require` in vista.

```json
{
  "autoload": {
    "psr-4": {
      "App\\": "src/"
    }
  }
}
```

Dopo aver modificato questa sezione serve un `composer dump-autoload` per rigenerare la mappa.

## Cosa succede davvero quando installi

<svg class="hi-diagram" width="220" height="300" viewBox="0 0 220 300" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="20" y="16" width="180" height="46" rx="14" class="hi-fill hi-line" stroke-width="2"/>
  <line x1="110" y1="62" x2="110" y2="92" class="hi-muted-stroke" stroke-width="2"/>

  <rect x="20" y="92" width="180" height="46" rx="14" class="hi-fill hi-ink-stroke" stroke-width="2.5"/>
  <circle cx="175" cy="102" r="6" class="hi-accent-dot"/>
  <line x1="110" y1="138" x2="110" y2="168" class="hi-muted-stroke" stroke-width="2"/>

  <rect x="20" y="168" width="180" height="46" rx="14" class="hi-fill hi-line" stroke-width="2"/>
  <line x1="110" y1="214" x2="110" y2="244" class="hi-muted-stroke" stroke-width="2"/>

  <rect x="20" y="244" width="180" height="46" rx="14" class="hi-fill hi-line" stroke-width="2"/>
</svg>

Dall'alto verso il basso: **composer.json**, con i vincoli di versione che hai scritto tu → il **resolver** di Composer (in evidenza, perché è il passaggio cruciale) che calcola un albero di dipendenze dove tutti i vincoli sono soddisfatti contemporaneamente → **composer.lock**, con le versioni esatte trovate e verificate → la cartella **vendor/**, con il codice scaricato e l'autoloader generato e pronto all'uso.

Il punto delicato è proprio il resolver: se due librerie richiedono versioni incompatibili di una terza dipendenza, è lì che l'operazione si blocca, prima ancora di scaricare un solo file.

## Semantic versioning e vincoli: cosa significano ^ e ~

I simboli davanti ai numeri di versione in `composer.json` seguono il **semantic versioning** (MAJOR.MINOR.PATCH, es. `3.4.2`):

- **`^3.4`** – permette aggiornamenti che non cambiano il numero MAJOR: va bene `3.5.0`, `3.99.0`, ma non `4.0.0`. È il vincolo che uso quasi sempre: per convenzione, un cambio di versione MAJOR può contenere modifiche che rompono la compatibilità.
- **`~3.4`** – più restrittivo, permette solo aggiornamenti del numero PATCH: va bene `3.4.9`, ma non `3.5.0`.
- **`3.4.2`** (senza simboli) – fissa quella esatta versione, nessun aggiornamento automatico. Utile solo in casi particolari, perché ti esponi a non ricevere più nemmeno le patch di sicurezza in automatico.
- **`*`** – qualsiasi versione. Da evitare quasi sempre: è una scommessa che la prossima versione, qualunque sia, non romperà nulla.

In pratica, `^` è il punto di equilibrio giusto tra "ricevo correzioni e miglioramenti" e "non mi ritrovo versioni che cambiano le API senza preavviso".

## Composer e WordPress: perché qui è diverso

In un progetto Laravel o Symfony, Composer gestisce *tutto* il progetto: persino il framework stesso è una dipendenza in `composer.json`. In WordPress la situazione è più ibrida, perché il core e la maggior parte dei plugin si installano ancora dalla dashboard o via FTP, non da Composer.

Dove Composer diventa utile in un progetto WordPress è per le **librerie custom** che usi nei tuoi plugin o temi: un client HTTP, un parser PDF, una libreria di validazione. Invece di scaricare lo zip a mano e infilarlo in una cartella `libs/`, lo richiedi con `composer require` e ottieni versioning, aggiornamenti e autoload gratis. Alcuni setup più avanzati (es. [Bedrock di Roots](https://roots.io/bedrock/)) spingono il concetto oltre, gestendo con Composer anche il core di WordPress e i plugin da WPackagist, ma è un passo in più che ha senso solo se il progetto è già abbastanza strutturato da trarne beneficio.

## Errori comuni

### "Your requirements could not be resolved to an installable set of packages"

È l'errore del resolver che non trova una combinazione di versioni che soddisfi tutti i vincoli. Prima di disperarti, prova `composer why-not vendor/pacchetto 3.0`: ti dice esattamente quale altra dipendenza sta bloccando quella versione. Spesso la soluzione è aggiornare anche la libreria che genera il conflitto, non solo quella che stai cercando di installare.

### Committare o no la cartella vendor/

**No**, `vendor/` non va mai messo in git. È voluminosa, contiene codice di terze parti che non ti appartiene, e il `composer.lock` basta a ricrearla identica con un `composer install`. L'unica eccezione reale sono alcuni ambienti di deploy molto rigidi senza accesso a internet durante il deploy, dove si preferisce portarsi dietro `vendor/` già pronta: un caso raro, non la norma.

### "Allowed memory size exhausted" durante un update

Il resolver di Composer, su progetti con molte dipendenze, può essere pesante in memoria. Se capita, prova:

```
COMPOSER_MEMORY_LIMIT=-1 composer update
```

che rimuove temporaneamente il limite di memoria di PHP per quel comando. Se il problema è ricorrente su un server con poca RAM, vale la pena fare l'update in locale e poi portare solo il `composer.lock` aggiornato in produzione, eseguendo lì solo `composer install`.

## In breve

`composer install` per installare quello che è già bloccato nel lock file, `composer update` solo quando vuoi davvero aggiornare le versioni, `^` come vincolo di default nella maggior parte dei casi, e il `composer.lock` sempre in git. Con queste poche regole in testa, la parte di Composer che sembra più oscura — perché il mio collega ha una versione diversa della stessa libreria? — smette di essere un mistero.

Se stai configurando un progetto PHP da zero, può interessarti anche la mia guida a [come scegliere un framework](/come-scegliere-un-framework/), oppure, se preferisci partire da un CMS, [i plugin indispensabili per ogni sito WordPress](/i-plugin-indispensabili-per-ogni-sito-wordpress-facile-da-installare-e-configurare/).
