---
title: "Come installare una LAMP stack su Ubuntu 24.04 (Apache, MySQL, PHP)"
seoTitle: "LAMP su Ubuntu 24.04: Apache, MySQL e PHP 8.3"
date: 2022-06-20
lastmod: 2026-09-24
description: "Apache, MySQL 8 e PHP 8.3 su Ubuntu 24.04: firewall, virtual host con .htaccess, utente database dedicato, HTTPS con Let's Encrypt ed errori comuni."
tags: ["Guide", "Linux"]
translationKey: "lamp-stack-install"
---

**LAMP** sta per **L**inux, **A**pache, **M**ySQL e **P**HP: il sistema operativo, il web server, il database e il linguaggio che genera le pagine. È lo stack su cui gira ancora una fetta enorme del web, WordPress e Laravel compresi, ed è il modo più diretto per capire cosa succede davvero tra la richiesta del browser e la risposta del server.

In questa guida configuriamo una LAMP stack completa su **Ubuntu 24.04 LTS**, pronta per ospitare un sito vero: non solo l'installazione dei pacchetti, ma anche firewall, virtual host, utente database dedicato e HTTPS. Alla fine trovi gli errori che vedo più spesso quando qualcuno mi chiede aiuto con un server.

## Prima di iniziare

Ti serve:

- un server o una macchina virtuale con **Ubuntu 24.04** e un utente con privilegi `sudo` (non lavorare direttamente come root);
- l'accesso via SSH, se il server è remoto;
- per l'HTTPS, un **dominio** con un record DNS di tipo A che punta all'IP del server. Se non ti è chiaro come impostarlo, ho scritto una guida su [come funziona il DNS](/come-funziona-il-dns/).

Su Ubuntu 26.04 i passaggi sono gli stessi. Cambiano i numeri di versione di PHP e MySQL, che puoi controllare con `php -v` e `mysql --version`. Su **Debian** è tutto uguale, con un'eccezione: nei repository non c'è `mysql-server` ma **MariaDB** (`sudo apt install mariadb-server`), compatibile per quasi ogni uso.

Durante la guida modificheremo diversi file di configurazione: io uso nano, e se non lo conosci ho scritto una [guida pratica con le scorciatoie essenziali](/nano-editor-guida-per-principianti/).

## Passaggio 1: aggiornare il sistema e configurare il firewall

```
sudo apt update && sudo apt upgrade
```

Ubuntu include **UFW**, un'interfaccia semplice per il firewall. Prima di attivarlo, autorizza SSH: se lo attivi senza questa regola su un server remoto, ti chiudi fuori da solo.

```
sudo ufw allow OpenSSH
sudo ufw enable
sudo ufw status
```

Apriremo le porte web subito dopo aver installato Apache.

## Passaggio 2: Apache

```
sudo apt install apache2
```

Apache si avvia da solo e viene abilitato al boot. Il pacchetto registra in UFW il profilo **Apache Full**, che apre le porte 80 (HTTP) e 443 (HTTPS):

```
sudo ufw allow "Apache Full"
```

Ora apri nel browser l'indirizzo IP del server (o `http://localhost`, se stai lavorando in locale): dovresti vedere la pagina di benvenuto di Apache. Se non conosci l'IP pubblico del server:

```
curl -4 icanhazip.com
```

`hostname -I` mostra invece gli indirizzi delle interfacce di rete, che su un server dietro NAT o su una VM locale non coincidono con l'IP pubblico.

## Passaggio 3: MySQL

```
sudo apt install mysql-server
```

Su Ubuntu 24.04 questo installa **MySQL 8.0**. Lancia poi lo script che toglie le impostazioni predefinite poco sicure:

```
sudo mysql_secure_installation
```

Lo script chiede se attivare il componente **VALIDATE PASSWORD**, che rifiuta le password deboli. Su un server di produzione ha senso, ma tieni presente che può far fallire strumenti che generano password in automatico. A tutte le altre domande rispondi `Y`: rimuove gli utenti anonimi, disabilita l'accesso remoto di root, elimina il database di test.

Una cosa che confonde molti: su Ubuntu l'utente **root di MySQL** si autentica con il plugin `auth_socket`, cioè in base all'utente di sistema che si collega, non con una password. Per questo entri nella console senza che ti venga chiesto niente:

```
sudo mysql
```

È una scelta sensata: solo chi ha `sudo` sul server può amministrare il database. La conseguenza pratica è che **la tua applicazione PHP non deve mai usare root**. Crea un database e un utente dedicato per ogni sito:

```
CREATE DATABASE esempio;
CREATE USER 'esempio'@'localhost' IDENTIFIED BY 'una-password-lunga-e-casuale';
GRANT ALL PRIVILEGES ON esempio.* TO 'esempio'@'localhost';
EXIT;
```

In MySQL 8 il set di caratteri predefinito è già `utf8mb4`, quindi emoji e caratteri speciali funzionano senza configurazioni aggiuntive. Non serve nemmeno `FLUSH PRIVILEGES`: con `CREATE USER` e `GRANT` i permessi si applicano subito.

## Passaggio 4: PHP

```
sudo apt install php libapache2-mod-php php-mysql
```

Su Ubuntu 24.04 ottieni **PHP 8.3**, già collegato ad Apache tramite `mod_php`. Quasi ogni applicazione reale ha bisogno di qualche estensione in più. Questo è il set che installo di solito, e copre WordPress, Laravel e la maggior parte dei CMS:

```
sudo apt install php-curl php-gd php-mbstring php-xml php-zip php-intl
sudo systemctl restart apache2
```

Con `php -m` vedi l'elenco dei moduli attivi.

## Passaggio 5: il virtual host

Apache serve di default la cartella `/var/www/html`. Per un sito vero conviene creare un **virtual host** dedicato: ogni dominio ha la sua cartella, la sua configurazione e i suoi log, e sullo stesso server puoi ospitarne quanti ne vuoi. Negli esempi uso `esempio.it`: sostituiscilo con il tuo dominio.

```
sudo mkdir -p /var/www/esempio.it/public
sudo chown -R $USER:$USER /var/www/esempio.it
```

La sottocartella `public` è una buona abitudine: solo quello che sta lì dentro è raggiungibile dal web, mentre configurazioni, file `.env` e codice applicativo possono stare un livello sopra. È la stessa struttura che usa Laravel.

Crea il file di configurazione:

```
sudo nano /etc/apache2/sites-available/esempio.it.conf
```

```
<VirtualHost *:80>
    ServerName esempio.it
    ServerAlias www.esempio.it
    DocumentRoot /var/www/esempio.it/public

    <Directory /var/www/esempio.it/public>
        AllowOverride All
        Require all granted
        DirectoryIndex index.php index.html
    </Directory>

    ErrorLog ${APACHE_LOG_DIR}/esempio.it-error.log
    CustomLog ${APACHE_LOG_DIR}/esempio.it-access.log combined
</VirtualHost>
```

Tre dettagli che fanno la differenza:

- **`AllowOverride All`** permette di usare i file `.htaccess`. Nella configurazione di default di Ubuntu sono ignorati, ed è per questo che tante regole di rewrite "non funzionano". Servono, per esempio, per [togliere l'estensione .php dagli URL](/nascondere-lestensione-alla-fine-dellurl/) o per costruire un [sistema di routing in PHP](/semplice-sistema-di-routing-in-php/).
- **`DirectoryIndex`** fa cercare `index.php` prima di `index.html`, solo per questo sito, senza toccare la configurazione globale.
- **Log separati per sito**: quando qualcosa si rompe, non devi cercare in un unico file che mescola tutti i domini.

Abilita il sito, il modulo `rewrite` (necessario per quasi ogni CMS e framework) e disabilita il sito predefinito:

```
sudo a2ensite esempio.it.conf
sudo a2enmod rewrite
sudo a2dissite 000-default.conf
sudo apache2ctl configtest
sudo systemctl reload apache2
```

`apache2ctl configtest` deve rispondere `Syntax OK`. Prendi l'abitudine di lanciarlo **prima** di ogni reload: un errore di sintassi in un virtual host può impedire ad Apache di ripartire, portandosi giù tutti i siti del server.

## Passaggio 6: verificare che PHP funzioni

Crea un file di test:

```
echo "<?php phpinfo();" > /var/www/esempio.it/public/info.php
```

Apri `http://esempio.it/info.php`: se vedi la pagina con la versione di PHP e l'elenco dei moduli, Apache sta eseguendo PHP correttamente. **Cancella subito il file**, perché espone a chiunque dettagli sulla configurazione del server:

```
rm /var/www/esempio.it/public/info.php
```

Per verificare anche la connessione al database con l'utente appena creato, puoi usare lo script della mia guida su [come collegare PHP e MySQL con PDO](/collegare-php-e-mysql-con-pdo/).

## Passaggio 7: HTTPS con Let's Encrypt

Nel 2026 un sito senza HTTPS non è un'opzione. Con **Certbot** il certificato è gratuito e si rinnova da solo. Il metodo consigliato dal progetto è lo snap (trovi di più sugli snap nella mia guida alla [gestione dei pacchetti in Linux](/gestione-dei-pacchetti-in-linux-cosa-sono-e-come-funzionano/)):

```
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot
sudo certbot --apache -d esempio.it -d www.esempio.it
```

Certbot legge il virtual host, ottiene il certificato, crea la configurazione per la porta 443 e, se glielo chiedi, aggiunge il redirect da HTTP a HTTPS. Il rinnovo è automatico. Puoi verificarlo con:

```
sudo certbot renew --dry-run
```

Perché funzioni, il dominio deve già puntare al server e la porta 80 deve essere aperta: Let's Encrypt verifica che il dominio sia tuo facendo una richiesta HTTP al server.

## Un passo in più: PHP-FPM

`mod_php` è il modo più semplice di far girare PHP con Apache, ma non il più efficiente: lega PHP a ogni processo di Apache, che deve usare il modulo MPM `prefork`, il più pesante. Su un server con traffico reale conviene passare a **PHP-FPM**, che esegue PHP in un pool di processi separato, e al modulo MPM `event`:

```
sudo apt install php-fpm
sudo a2dismod php8.3 mpm_prefork
sudo a2enmod mpm_event proxy_fcgi setenvif
sudo a2enconf php8.3-fpm
sudo apache2ctl configtest && sudo systemctl restart apache2
```

Se hai una versione di PHP diversa, sostituisci `8.3` con la tua. Il vantaggio non è solo la memoria: con FPM puoi dare a ogni sito un pool separato con il proprio utente di sistema, così un sito compromesso non può leggere i file degli altri.

## Errori comuni

**"AH00558: Could not reliably determine the server's fully qualified domain name".** È un avviso, non un errore: Apache funziona lo stesso. Per toglierlo:

```
echo "ServerName localhost" | sudo tee /etc/apache2/conf-available/servername.conf
sudo a2enconf servername && sudo systemctl reload apache2
```

**Il browser scarica il file PHP invece di eseguirlo.** Apache non sta passando i file `.php` all'interprete: il modulo `php8.3` (o la configurazione `php8.3-fpm`) non è attivo. Controlla con `apache2ctl -M | grep -i php` e riabilitalo.

**403 Forbidden.** Apache non ha i permessi per leggere la cartella, oppure manca il blocco `<Directory>` con `Require all granted`. L'utente `www-data` deve poter leggere i file e attraversare ogni cartella del percorso: `namei -l /var/www/esempio.it/public/index.php` mostra i permessi di tutto il percorso in un colpo.

**Le regole nel `.htaccess` vengono ignorate.** Manca `AllowOverride All` nel virtual host, oppure non hai abilitato `mod_rewrite` con `a2enmod rewrite`.

**"Access denied for user 'root'@'localhost'" dall'applicazione.** È `auth_socket` che fa il suo lavoro: root non si autentica con una password. Non cambiare il metodo di autenticazione di root: crea un utente dedicato come visto al passaggio 3.

**Apache non parte: "Address already in use".** Qualcos'altro occupa la porta 80, spesso un nginx installato in precedenza. `sudo ss -tlnp | grep ':80'` ti dice quale processo.

## In sintesi

Una LAMP stack pronta per la produzione non è solo `apt install`: firewall attivo prima di esporre il server, un virtual host per ogni sito, un utente database per ogni applicazione, HTTPS da subito e `configtest` prima di ogni reload. Sono cinque minuti in più al momento dell'installazione, e ti evitano le ore spese a capire perché qualcosa non funziona.

Quando il server comincia a riempirsi di log e backup, [ncdu](/ottimizzare-lo-spazio-su-disco-da-terminale-con-ncdu-una-guida-essenziale-per-i-server/) ti dice in pochi secondi dove sta finendo lo spazio.
