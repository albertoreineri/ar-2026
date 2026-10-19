---
title: "Let's Encrypt e Certbot: certificati SSL gratuiti, spiegati bene"
date: 2026-10-19
description: "Come ottenere e rinnovare automaticamente certificati SSL gratuiti su un server Linux con Certbot e Let's Encrypt, senza passare dal pannello dell'hosting."
tags: ["Guide", "Linux"]
translationKey: "lets-encrypt-certbot-guide"
---

Qualche anno fa ho scritto [una guida per reindirizzare http a https](/certificato-ssl-come-reindirizzare-http-a-https/) partendo dal presupposto che il tuo hosting ti dia un pulsante "Attiva SSL" nel pannello. Funziona benissimo finché usi un hosting condiviso con pannello di controllo. Ma se gestisci un VPS da solo — una tua istanza Ubuntu, una macchina dove giri Nginx o Apache senza cPanel o Plesk — quel pulsante non esiste. Il certificato te lo devi procurare e rinnovare da terminale, ed è qui che entrano in gioco **Let's Encrypt** e **Certbot**.

La buona notizia è che il processo è più semplice di quanto sembri, e soprattutto si automatizza completamente: una volta impostato, non ci pensi più.

## Cos'è Let's Encrypt

Let's Encrypt è una **Certificate Authority (CA) gratuita**, gestita da una no-profit (Internet Security Research Group), che emette certificati SSL/TLS validati tramite un protocollo automatico chiamato **ACME**. Prima che esistesse, un certificato SSL costava decine di euro l'anno e andava rinnovato a mano, spesso dimenticandoselo fino a quando il sito non iniziava a mostrare l'avviso "connessione non sicura".

Let's Encrypt ha cambiato le regole del gioco con due scelte precise:

- **i certificati sono gratuiti**, senza limiti ragionevoli sul numero di domini;
- **durano solo 90 giorni**, apposta per spingere tutti ad automatizzare il rinnovo invece di farlo manualmente una volta l'anno.

Quella durata corta spaventa all'inizio, ma è proprio il punto di forza: se il rinnovo è automatico, 90 giorni o 1 anno non fa differenza per te. Se invece il rinnovo è manuale, 90 giorni ti costringono a non dimenticartene.

## Cos'è Certbot

Certbot è il **client ACME** più usato per parlare con Let's Encrypt da riga di comando. Si occupa di tre cose:

1. dimostra al server di Let's Encrypt che controlli davvero il dominio per cui chiedi il certificato;
2. scarica e installa il certificato ottenuto;
3. configura (opzionalmente) il rinnovo automatico.

È mantenuto dalla Electronic Frontier Foundation e supporta i server web più comuni tramite plugin dedicati, che modificano la configurazione di Nginx o Apache per te.

## Prerequisiti

Prima di partire, assicurati di avere:

- un **dominio** che punta già all'IP pubblico del tuo server (un record A o AAAA aggiornato — Let's Encrypt verifica il dominio, non l'IP);
- **Nginx o Apache** già in esecuzione sul server, con un virtual host configurato per quel dominio;
- le **porte 80 e 443 aperte** verso l'esterno. Se usi UFW, [l'ho già trattato in un altro articolo](/ufw-firewall-ubuntu-guida/): ti basta `sudo ufw allow "Nginx Full"` se usi Nginx, o il profilo equivalente per Apache.

Senza queste tre condizioni la richiesta del certificato fallirà: Let's Encrypt deve riuscire a raggiungere il tuo server sulla porta 80 (o 443, a seconda del metodo di verifica) per confermare che il dominio è davvero tuo.

## Installazione di Certbot

Su Ubuntu e Debian, il modo più aggiornato per installare Certbot è tramite `snap`, perché il pacchetto nei repository apt è spesso una versione più vecchia:

```
sudo snap install core
sudo snap refresh core
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot
```

Se preferisci restare su apt (va bene lo stesso, solo con versioni leggermente meno aggiornate):

```
sudo apt update
sudo apt install certbot python3-certbot-nginx
```

Sostituisci `python3-certbot-nginx` con `python3-certbot-apache` se il tuo server web è Apache.

## Richiedere il certificato

Con il plugin Nginx installato, l'intero processo si riduce a un comando:

```
sudo certbot --nginx -d tuosito.it -d www.tuosito.it
```

Certbot ti chiederà un'email (serve per gli avvisi di scadenza, nel caso improbabile che l'automazione fallisca) e ti farà accettare i termini di servizio. Poi:

1. verifica che tu controlli il dominio, rispondendo a una sfida HTTP-01 sulla porta 80;
2. ottiene il certificato da Let's Encrypt;
3. **modifica automaticamente la configurazione di Nginx** per usare il certificato e reindirizzare http a https, se gli dici di sì.

Per Apache il comando è identico, cambia solo il flag:

```
sudo certbot --apache -d tuosito.it -d www.tuosito.it
```

Se invece non vuoi che Certbot tocchi la configurazione del server web (per esempio perché la gestisci con un tool di configuration management come Ansible), puoi ottenere solo il certificato con il metodo standalone o webroot:

```
sudo certbot certonly --webroot -w /var/www/tuosito -d tuosito.it
```

In questo caso il certificato finisce in `/etc/letsencrypt/live/tuosito.it/` e sei tu a referenziarlo manualmente nella configurazione.

## Il rinnovo automatico

Qui sta il vero valore di Certbot rispetto a un certificato comprato a mano: l'installazione via snap o apt registra automaticamente un **timer systemd** (o, su sistemi più vecchi, una voce cron) che esegue un controllo due volte al giorno:

```
systemctl list-timers | grep certbot
```

Il comando eseguito dal timer è concettualmente `certbot renew`, che **non rinnova tutto alla cieca**: controlla la data di scadenza di ogni certificato e rinnova solo quelli che scadono entro 30 giorni. Puoi lanciarlo a mano in qualsiasi momento, è innocuo:

```
sudo certbot renew
```

<svg class="hi-diagram" width="300" height="260" viewBox="0 0 300 260" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="60" cy="40" r="22" class="hi-fill hi-line" stroke-width="2"/>
  <line x1="82" y1="40" x2="130" y2="40" class="hi-muted-stroke" stroke-width="2"/>

  <rect x="130" y="16" width="140" height="48" rx="14" class="hi-fill hi-line" stroke-width="2"/>
  <line x1="200" y1="64" x2="200" y2="94" class="hi-muted-stroke" stroke-width="2"/>

  <rect x="130" y="96" width="140" height="48" rx="14" class="hi-fill hi-ink-stroke" stroke-width="2.5"/>
  <circle cx="245" cy="106" r="6" class="hi-accent-dot"/>
  <line x1="200" y1="144" x2="200" y2="174" class="hi-muted-stroke" stroke-width="2"/>

  <rect x="130" y="176" width="140" height="48" rx="14" class="hi-fill hi-line" stroke-width="2"/>
  <line x1="130" y1="200" x2="90" y2="200" class="hi-muted-stroke" stroke-width="2"/>
  <line x1="90" y1="200" x2="90" y2="62" class="hi-muted-stroke" stroke-width="2"/>
  <line x1="90" y1="62" x2="60" y2="62" class="hi-muted-stroke" stroke-width="2"/>
</svg>

Il cerchio a sinistra è il timer systemd che si sveglia due volte al giorno; da lì scende lungo le tre tappe a destra: controlla la scadenza di ogni certificato, rinnova (il box in evidenza) solo quelli entro i 30 giorni, poi ricarica Nginx o Apache per usare il nuovo certificato — e la linea che torna al cerchio rappresenta il ciclo che si ripete da solo, senza che tu debba intervenire.

Per essere sicuro che tutto funzioni senza aspettare 60 giorni e scoprirlo troppo tardi, usa la simulazione:

```
sudo certbot renew --dry-run
```

Se questo comando va a buon fine, il rinnovo reale funzionerà allo stesso modo quando sarà il momento.

## Certificati wildcard

Se hai bisogno di coprire tutti i sottodomini (`*.tuosito.it`) con un solo certificato, la sfida HTTP-01 non basta: serve la verifica **DNS-01**, che richiede di creare un record TXT temporaneo sul tuo DNS. Certbot la supporta con plugin specifici per i provider DNS più comuni (Cloudflare, Route53, DigitalOcean), che automatizzano anche questo passaggio:

```
sudo apt install python3-certbot-dns-cloudflare
sudo certbot certonly --dns-cloudflare --dns-cloudflare-credentials /etc/letsencrypt/cloudflare.ini -d "*.tuosito.it" -d tuosito.it
```

Il file di credenziali contiene un token API con permessi limitati alla gestione dei DNS: trattalo come una password e impostagli permessi `600`.

## Problemi comuni

**"Challenge failed" durante la richiesta iniziale.** Quasi sempre è un problema di rete, non di Certbot: il dominio non punta ancora al server, oppure un firewall (UFW, il firewall del provider cloud, o entrambi) blocca la porta 80 dall'esterno. Verifica con `curl -I http://tuosito.it` da un'altra macchina.

**Rate limit raggiunto.** Let's Encrypt limita il numero di certificati per dominio registrabile a 50 a settimana, e i duplicati identici a 5 a settimana. Capita quando si fanno troppi test ravvicinati sullo stesso dominio: usa l'ambiente di staging (`--staging`) finché non sei sicuro che tutto funzioni, poi passa alla richiesta reale.

**Il rinnovo automatico sembra non essere scattato.** Controlla i log con `journalctl -u certbot.timer` e `cat /var/log/letsencrypt/letsencrypt.log`: quasi sempre la causa è una porta chiusa nel frattempo (un firewall riconfigurato) o un virtual host che nel tempo ha cambiato nome.

## In sintesi

Let's Encrypt e Certbot hanno reso HTTPS la configurazione di default invece dell'eccezione a pagamento: installi Certbot, chiedi il certificato una volta, e da quel momento il rinnovo è un problema che hai delegato al sistema. L'unico investimento è capire bene il primo setup — dominio puntato correttamente, porte aperte, plugin giusto per il tuo server web — dopodiché è una di quelle cose che, fatte bene una volta, non richiedono più pensieri per i prossimi anni.
