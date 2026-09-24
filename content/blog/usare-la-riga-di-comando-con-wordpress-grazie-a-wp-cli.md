---
title: "Usare la riga di comando con WordPress grazie a WP-CLI"
date: 2022-06-27
description: "Se sei uno sviluppatore WordPress, probabilmente hai installato il CMS, l’hai aggiornato e hai attivato temi e plugin centinaia di volte. E sebbene queste attività di routine di sviluppo e…"
tags: ["Guide", "WordPress DEV"]
---

Se sei uno sviluppatore WordPress, probabilmente hai installato il CMS, l’hai aggiornato e hai attivato temi e plugin centinaia di volte. E sebbene queste attività di routine di sviluppo e manutenzione siano abbastanza facili da eseguire con l’interfaccia utente grafica di WordPress, eseguirle più e più volte non è molto efficiente.

La buona notizia è che puoi velocizzare facilmente ed efficacemente lo sviluppo e la manutenzione di [WordPress con l’interfaccia a riga di comando di WordPress (WP-CLI)](http://wp-cli.org/) . In questo post esploreremo i diversi modi in cui puoi utilizzare WP-CLI e vedremo alcuni utili comandi WP-CLI per aiutarti a iniziare con un passo nella giusta direzione.

## UN’INTRODUZIONE A WP-CLI

Se sei nello sviluppo web da un po’ di tempo, probabilmente hai familiarità con l’interfaccia da riga di comando. WP-CLI è l’interfaccia della riga di comando di WordPress. E per quelli di voi che non si sono dilettati molto nella programmazione, WP-CLI è uno strumento che consente di gestire le installazioni di WordPress senza utilizzare un browser web.

WP-CLI ti consente di fare qualsiasi cosa, dall’installazione del CMS WordPress su un sito Web nuovo di zecca all’esecuzione di operazioni a livello di sito su un sito Web WordPress esistente. E la parte migliore è che l’insieme di passaggi che devi seguire per completare tali attività sarà, nella maggior parte dei casi, ridotto a una singola riga di codice .

Ora che abbiamo visto a grandi linee cos’è WP-CLI e come può aiutarti ad accelerare lo sviluppo del tuo prossimo progetto, diamo un’occhiata a come puoi iniziare con questo potente strumento.

## INSTALLAZIONE DI WP-CLI SUL TUO AMBIENTE DI HOSTING

La prima cosa che devi fare per iniziare con WP-CLI è assicurarti che il tuo ambiente di hosting soddisfi i requisiti minimi:

- Ambiente UNIX.
- PHP 5.3.29 (o successivo).
- WordPress 3.7 (o successivo).
- Secure Shell (SSH) abilitato sul tuo server web.

Dopo aver verificato quegli elementi essenziali, vai avanti e scarica il file *wp-cli.phar* usando il seguente comando:

```
$ curl -O https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar
```

E voilà! WP-CLI dovrebbe ora essere installato nel tuo ambiente di hosting. Se desideri assicurarti che funzioni correttamente, esegui semplicemente il seguente comando:

```
$ php wp-cli.phar -info
```

Se tutto va bene, dovresti vedere qualcosa di simile sulla riga di comando che specifica quale versione di WP-CLI è in esecuzione nel tuo ambiente di hosting:

```
PHP binary: /usr/bin/php5
PHP version: 5.5.9-1ubuntu4.14
php.ini used: /etc/php5/cli/php.ini
WP-CLI root dir: /home/wp-cli/.wp-cli
WP-CLI packages dir: /home/wp-cli/.wp-cli/packages/
WP-CLI global config: /home/wp-cli/.wp-cli/config.yml
WP-CLI project config:
WP-CLI version: 1.3.0
```

Tuttavia, se scopri che WP-CLI non è stato installato correttamente sul tuo sistema, ti consiglio di controllare alcuni metodi di [installazione alternativi](https://make.wordpress.org/cli/handbook/installing/#alternative-installation-methods) per ulteriori informazioni su come configurarlo.

Infine, creeremo un file eseguibile per WP-CLI e lo sposteremo nella sua directory in modo da poterlo eseguire da qualsiasi luogo:

```
$ chmod +x wp-cli.phar
$ sudo mv wp-cli.phar /usr/local/bin/wp
```

Per semplicità, abbiamo chiamato la directory *wp* . Ora, ogni volta che devi usare WP-CLI, tutto ciò che devi fare è eseguire il comando *wp* dalla riga di comando.

## SVILUPPO WORDPRESS E MANUTENZIONE DEL SITO CON WP-CLI

Ora che WP-CLI è installato e pronto per l’uso, esaminiamo alcune delle cose più utili che puoi fare per accelerare le attività di routine di sviluppo e manutenzione di WordPress.

### INSTALLAZIONE DI WORDPRESS

Entra nella directory in cui desideri installare il CMS WordPress ed esegui la seguente riga di codice:

```
$ wp core download
```

Dovrai creare un file *wp-config.php* per proseguire con la tua installazione. Ecco come puoi farlo:

```
$ wp core config --dbname=databasename --dbuser=databaseuser --dbpass=databasepassword --dbhost=localhost --dbprefix=prfx_
```

*(Ho utilizzato del testo di esempio per il nome del database e le credenziali dell’utente del database. Assicurati di sostituirli con le informazioni del tuo database prima di eseguire il codice.)*

Infine, puoi iniziare l’installazione vera e propria eseguendo il comando di *installazione principale* indicato di seguito. Ricorda di sostituire i parametri di esempio con le informazioni del tuo sito prima di eseguire il codice.

```
$ wp core install –-url=yoursite.com -–title="Your WordPress Site's Title" –-admin_user=admin_username –-admin_password=admin_password –-admin_email=admin@yoursite.com
```

### AGGIORNAMENTO DI WORDPRESS

Prima o poi verrà lanciata una nuova versione di WordPress e dovrai aggiornare la tua installazione all’ultima versione. Se non sei sicuro di quale versione di WordPress è attualmente in esecuzione sul tuo sito, esegui semplicemente il seguente comando:

```
$ wp core version
```

Se ritieni che il tuo sito abbia effettivamente bisogno di essere aggiornato, è meglio eseguire un backup completo del suo database prima di procedere. Ecco come puoi farlo con WP-CLI:

```
$ wp db export my-db-backup.sql
```

L’esecuzione di questo comando creerà un backup completo del database del tuo sito e lo salverà nella directory principale in un file chiamato *my-db-backup.sql* .

Infine, puoi aggiornare i file core del tuo sito e il relativo database eseguendo le seguenti righe di codice:

```
$ wp core update
$ wp core update –db
```

Per quelli di voi che gestiscono più siti o reti multisito, eseguire il seguente script per aggiornare tutti i siti in una volta sola:

```
$ declare -a sites_to_update=('/var/www/wordpress_site_1' '/var/www/wordpress_site_2' '/var/www/wordpress_site_n')
for site in "${sites_to_update[@]}";
do
wp --path=$site core update
done
```

*(Ricordati di sostituire il testo di esempio con i nomi delle directory principali dei tuoi siti Web WordPress.)*

### GESTIONE DI TEMI E PLUGIN

Una delle cose migliori di WP-CLI è che collega il tuo server web alle directory ufficiali di WordPress [Theme](https://wordpress.org/themes/) e [Plugin](https://wordpress.org/plugins/). Ciò significa che puoi gestire le installazioni di temi e plug-in utilizzando solo la riga di comando.

**Comandi del tema WordPress:**

- **Per installare un tema: **wp theme install theme_name
- **Per attivare un tema installato: **wp theme activate theme_name
- **Per aggiornare un tema installato: **wp theme update theme_name
- **Per aggiornare tutti i temi installati: **wp theme update –all

**Comandi del plugin di WordPress:**

- **Per installare un plugin: **wp plugin install plugin_name
- **Per attivare un plugin installato: **wp plugin activate plugin_name
- **Per aggiornare un plugin installato: **wp plugin update plugin_name
- **Per aggiornare tutti i plugin installati: **wp plugin update –all

*(Ricordati di sostituire il testo di esempio con il nome del tema o del plugin con cui desideri interagire.)*

### CREAZIONE DI CUSTOM POST PERSONALIZZATI

WP-CLI elimina il lavoro pesante dalla creazione di custom post type in WordPress e lo riduce a una semplice riga di codice. Invece di scaricare un plug-in per aiutarti a portare a termine il lavoro, perché non provare la seguente riga di codice:

```
$ wp scaffold post-type cpt_slug --label=CPT_Label --theme=theme_name
```

Tutto quello che devi fare è sostituire il testo di esempio con lo slug, l’etichetta e il nome del tema del tuo custom post type e voilà!

### CREAZIONE DI TEMI CHILD

Se ti è già capitato di creare un tema child, avrai dovuto accedere al pannello di controllo e creareti cartella e file relativi dentro al sito. WP-CLI ti consente di creare un tema child con una singola riga di codice:

```
$ wp scaffold child-theme name-of-child-theme --parent_theme=name_of_parent_theme --theme_name='My Child Theme' --author='Your Name' --author_uri=http://www.yoursite.com --theme_uri=http://www.themesite.com --activate
```

*(Come sempre, ricorda di sostituire il testo di esempio con il tema child e le informazioni sul tema genitore.)*

## CONCLUSIONE

Con WP-CLI puoi ottenere di più facendo di meno. Se desideri aumentare la tua produttività accelerando le operazioni di routine di sviluppo e manutenzione di WordPress, allora vale sicuramente la pena provare WP-CLI.

Ti ho mostrato come installare lo strumento nel tuo ambiente di hosting e abbiamo visto alcuni scenari in cui WP-CLI batte la GUI di WordPress in termini di efficienza. Ora non ti resta che provarlo!

Ah, sembra scontato, ma NON FARE MAI TEST IN AMBIENTE DI PRODUZIONE, usa lo STAGING o falli in LOCALE.

Buon codice!
