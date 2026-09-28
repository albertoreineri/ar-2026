---
title: "Fail2ban: come bloccare automaticamente i tentativi di accesso brute-force su SSH"
date: 2026-09-28
description: "Guida pratica a Fail2ban: come installarlo, configurare la jail SSH, capire bantime/findtime/maxretry ed estenderlo ad altri servizi senza bannarsi da soli."
tags: ["Guide", "Linux"]
translationKey: "fail2ban-guide"
---

Se hai mai aperto i log di un server con SSH esposto su internet, avrai visto qualcosa del genere: centinaia di tentativi di login falliti al giorno, con username come `root`, `admin` o `test`, provenienti da IP sparsi in mezzo mondo. Non è un attacco mirato a te: sono bot che scansionano continuamente internet cercando porte 22 aperte e password debole. **Fail2ban** è lo strumento più semplice per smettere di ignorarli e iniziare a bloccarli in automatico.

## Perché il tuo server è già sotto attacco

Non serve che il tuo sito sia famoso o che tu abbia fatto qualcosa per attirare attenzione. Basta avere un IP pubblico con la porta SSH aperta perché diventi un bersaglio automatico. Questi bot non sanno chi sei: provano combinazioni di username e password comuni, sperando che qualcuno da qualche parte abbia lasciato `admin`/`admin123`.

Il rischio reale non è tanto che indovinino la password (se usi chiavi SSH e hai disabilitato il login con password, quel rischio è quasi zero), quanto il carico che questi tentativi generano: log che si riempiono, CPU sprecata nell'autenticazione, e nei casi peggiori un vero accesso non autorizzato su server configurati male.

## Cosa fa davvero fail2ban

Fail2ban **non è un firewall**: è un servizio che legge i log di sistema, cerca pattern di autenticazione fallita, e quando un IP supera una soglia di tentativi in un certo intervallo di tempo, dice al firewall di bloccarlo temporaneamente. È la parte intelligente che decide "chi" bannare; il blocco vero e proprio lo eseguono `iptables`, `nftables` o `firewalld`, secondo la configurazione del sistema.

Il funzionamento si basa su tre concetti che tornano in ogni configurazione:

- **filter** — l'espressione regolare che identifica un tentativo fallito in un log (es. "Failed password for" nei log SSH).
- **jail** — la configurazione che collega un filter a un servizio specifico (SSH, Nginx, WordPress) con le sue soglie.
- **action** — cosa fare quando la soglia viene superata: di solito bannare l'IP nel firewall e, opzionalmente, inviare una notifica.

<svg class="hi-diagram" width="300" height="230" viewBox="0 0 300 230" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="10" y="16" width="120" height="46" rx="14" class="hi-fill hi-line" stroke-width="2"/>
  <line x1="70" y1="62" x2="70" y2="92" class="hi-muted-stroke" stroke-width="2"/>

  <rect x="10" y="94" width="120" height="46" rx="14" class="hi-fill hi-line" stroke-width="2"/>
  <line x1="70" y1="140" x2="70" y2="170" class="hi-muted-stroke" stroke-width="2"/>

  <rect x="10" y="172" width="120" height="46" rx="14" class="hi-fill hi-ink-stroke" stroke-width="2.5"/>
  <circle cx="105" cy="182" r="6" class="hi-accent-dot"/>

  <line x1="130" y1="195" x2="180" y2="195" class="hi-muted-stroke" stroke-width="2"/>
  <rect x="180" y="172" width="110" height="46" rx="14" class="hi-fill hi-line" stroke-width="2"/>
</svg>

Dall'alto in basso: log del sistema (SSH) → filter che riconosce i tentativi falliti → jail che conta le soglie e decide il ban (in evidenza) → azione sul firewall che blocca l'IP.

## Installazione su Ubuntu/Debian

Fail2ban è nei repository standard di quasi tutte le distribuzioni. Su Ubuntu o Debian:

```
sudo apt update
sudo apt install fail2ban
```

Su sistemi con dnf (Fedora, AlmaLinux, Rocky):

```
sudo dnf install fail2ban
```

Una volta installato, il servizio parte già con una configurazione di default ragionevole, ma **non modificarla direttamente**. I file in `/etc/fail2ban/jail.conf` vengono sovrascritti a ogni aggiornamento del pacchetto: le tue personalizzazioni vanno in un file separato che fail2ban legge automaticamente dopo.

```
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
sudo nano /etc/fail2ban/jail.local
```

## Configurare la jail SSH

Dentro `jail.local` trovi la sezione `[sshd]`. Le impostazioni che contano davvero sono queste tre:

```
[sshd]
enabled = true
port = ssh
maxretry = 5
findtime = 10m
bantime = 1h
```

- **maxretry** — quanti tentativi falliti sono ammessi prima del ban. 5 è un valore equilibrato: basso abbastanza da fermare i bot, alto abbastanza da non bannarti per un typo sulla password.
- **findtime** — la finestra di tempo in cui quei tentativi vengono contati. Se in 10 minuti un IP supera `maxretry` tentativi, scatta il ban.
- **bantime** — per quanto tempo l'IP resta bloccato. Un'ora è un buon punto di partenza; per bot insistenti puoi usare valori più alti, anche in formato `1d` o `1w`.

Un'impostazione che vale la pena aggiungere fin da subito è `bantime.increment`, che aumenta progressivamente la durata del ban per chi continua a riprovare dopo essere stato sbannato:

```
[DEFAULT]
bantime.increment = true
bantime.factor = 2
bantime.maxtime = 1w
```

Dopo ogni modifica, riavvia il servizio:

```
sudo systemctl restart fail2ban
```

## Non bannarti da solo

L'errore più comune, soprattutto la prima volta che si configura fail2ban su un server remoto, è restare fuori dal proprio stesso server dopo qualche tentativo sbagliato (magari mentre si testa una nuova chiave SSH). La soluzione è aggiungere il tuo IP alla whitelist tramite `ignoreip`, nella sezione `[DEFAULT]`:

```
[DEFAULT]
ignoreip = 127.0.0.1/8 ::1 IL.TUO.IP.QUI
```

Puoi separare più indirizzi o subnet con uno spazio. Se lavori da IP che cambiano spesso (VPN aziendale, mobile), considera in alternativa di autenticarti **solo** con chiavi SSH e disabilitare del tutto il login con password: a quel punto un bot che indovina una password non può comunque entrare, e puoi anche alzare `maxretry` senza preoccuparti troppo.

## Controllare cosa sta succedendo

Fail2ban espone un client da riga di comando per vedere lo stato in tempo reale:

```
sudo fail2ban-client status
sudo fail2ban-client status sshd
```

Il secondo comando mostra quanti IP sono attualmente bannati sulla jail SSH e la lista dei loro indirizzi. Se hai bisogno di sbannare manualmente un IP (perché era il tuo, o perché hai cambiato idea):

```
sudo fail2ban-client set sshd unbanip 123.45.67.89
```

Per un log dettagliato di ogni ban e sban, con relativo motivo:

```
sudo tail -f /var/log/fail2ban.log
```

## Estenderlo ad altri servizi

Fail2ban non serve solo per SSH. Molte distribuzioni includono filter già pronti per Nginx, Apache, Postfix e altri servizi comuni: basta abilitare la jail corrispondente in `jail.local`, ad esempio per bloccare chi tenta ripetutamente l'accesso a `wp-login.php` su un sito WordPress dietro Nginx:

```
[nginx-botsearch]
enabled = true
```

Per casi più specifici, come proteggere il login di WordPress, serve spesso un filter personalizzato che riconosca la riga di log giusta (dipende da come il tuo setup registra i tentativi falliti): il principio è identico a quello della jail SSH, cambia solo cosa viene letto e riconosciuto come "tentativo fallito".

## In sintesi

Fail2ban non sostituisce chiavi SSH forti, un firewall ben configurato o aggiornamenti regolari, ma è la difesa automatica più semplice ed efficace contro il rumore di fondo di internet: bot che bussano a caso, ogni giorno, su ogni server esposto in rete. Installalo, configura una jail SSH con soglie ragionevoli, metti il tuo IP in whitelist per non chiuderti fuori da solo, e lascia che sia il server a occuparsi di bannare chi non dovrebbe essere lì.
