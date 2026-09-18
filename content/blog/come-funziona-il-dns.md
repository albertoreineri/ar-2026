---
title: "Come funziona il DNS (e perché ti conviene capirlo)"
date: 2026-09-18
description: "Guida pratica al DNS: cosa succede davvero quando digiti un indirizzo nel browser, i record A, CNAME, MX e TXT più usati, e come evitare gli errori più comuni quando cambi hosting o email."
tags: ["Guide", "Web Dev"]
translationKey: "how-dns-works"
---

Ogni volta che un cliente mi scrive "il sito è down" la prima cosa che controllo, prima ancora del server, è il **DNS**. Nella maggior parte dei casi il problema non è il sito: è che il dominio punta dove non deve, o una modifica fatta un'ora prima non si è ancora propagata.

Il DNS è uno di quei pezzi di infrastruttura che usiamo tutti i giorni senza mai vederlo, finché non si rompe. Capire come funziona ti fa risparmiare ore di panico ingiustificato e ti evita errori stupidi quando cambi hosting, provider email o certificato SSL.

## Cos'è il DNS, in due frasi

Il **Domain Name System** è la rubrica di internet: traduce nomi leggibili dagli umani (`albertoreineri.it`) in indirizzi IP leggibili dalle macchine (tipo `76.76.21.21`). Senza DNS dovresti memorizzare numeri per ogni sito che visiti, cosa che nessuno vuole fare.

Il punto chiave da tenere a mente è che **il DNS non è un singolo server**, ma un sistema distribuito e gerarchico di migliaia di server sparsi per il mondo, ognuno responsabile di un pezzo dell'informazione.

## Cosa succede quando digiti un indirizzo

Quando scrivi `www.esempio.it` nel browser e premi invio, parte una catena di richieste che nella maggior parte dei casi impiega pochi millisecondi:

1. Il browser controlla se ha già la risposta in **cache** (locale o del sistema operativo).
2. Se non ce l'ha, la richiesta va a un **resolver DNS ricorsivo**, di solito quello del tuo provider internet o uno pubblico come `1.1.1.1` (Cloudflare) o `8.8.8.8` (Google).
3. Il resolver, se non ha già la risposta in cache, chiede ai **root server**, che rispondono indicando quale server è responsabile per il dominio di primo livello (`.it`, `.com`, ecc.).
4. Il server del **TLD** (top-level domain) indica a sua volta quale server è responsabile per quel dominio specifico: il **name server autoritativo**.
5. Il name server autoritativo restituisce finalmente l'IP corretto, che il resolver rimanda al browser.
6. Il browser si connette direttamente a quell'IP e carica il sito.

<svg class="hi-diagram" width="300" height="260" viewBox="0 0 300 260" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="10" y="20" width="110" height="46" rx="14" class="hi-fill hi-line" stroke-width="2"/>
  <rect x="180" y="20" width="110" height="46" rx="14" class="hi-fill hi-line" stroke-width="2"/>
  <line x1="120" y1="43" x2="180" y2="43" class="hi-muted-stroke" stroke-width="2"/>

  <rect x="180" y="107" width="110" height="46" rx="14" class="hi-fill hi-line" stroke-width="2"/>
  <line x1="235" y1="66" x2="235" y2="107" class="hi-muted-stroke" stroke-width="2"/>

  <rect x="180" y="194" width="110" height="46" rx="14" class="hi-fill hi-ink-stroke" stroke-width="2.5"/>
  <line x1="235" y1="153" x2="235" y2="194" class="hi-muted-stroke" stroke-width="2"/>
  <circle cx="270" cy="204" r="6" class="hi-accent-dot"/>

  <path d="M180 230 C 80 230, 40 150, 65 66" class="hi-muted-stroke" stroke-width="2" fill="none" stroke-linecap="round"/>
  <circle cx="65" cy="66" r="4" class="hi-muted-stroke" stroke-width="2"/>
</svg>

Da sinistra a destra e dall'alto in basso: **browser** → **resolver ricorsivo** → **root/TLD server** → **name server autoritativo** (in evidenza), che risponde con l'IP e chiude il cerchio verso il browser.

Tutto questo avviene in background, di solito in meno di 100 millisecondi, grazie al fatto che quasi ogni passaggio viene **memorizzato in cache** a vari livelli. Ed è proprio la cache la causa del problema più comune che vedrai come sviluppatore o gestore di siti: la **propagazione**.

## Perché una modifica DNS "non si vede subito"

Ogni record DNS ha un valore chiamato **TTL** (Time To Live), espresso in secondi, che dice ai resolver per quanto tempo possono tenere quella risposta in cache prima di richiederla di nuovo. Se il TTL è 3600, un resolver che ha già interrogato quel record potrebbe continuare a restituire il vecchio valore per un'ora, anche se tu l'hai già cambiato.

Questo spiega perché, dopo aver cambiato hosting o aggiornato un record, **non tutti vedono il cambiamento nello stesso momento**: dipende da quale resolver stanno usando e da quando quel resolver ha fatto l'ultima richiesta.

**Consiglio pratico**: se sai che dovrai fare un cambio importante (migrazione hosting, cambio email), abbassa il TTL dei record coinvolti a 300 secondi qualche giorno prima. Il cambiamento si propagherà molto più in fretta, e potrai sempre alzarlo di nuovo dopo.

## I record DNS che userai davvero

Non serve conoscerli tutti, ma questi li incontrerai di continuo lavorando su siti e domini:

- **A** — punta un nome di dominio a un indirizzo **IPv4** (es. `esempio.it → 76.76.21.21`). È il record più comune, quello che fa puntare il sito al server giusto.
- **AAAA** — come l'A, ma per indirizzi **IPv6**.
- **CNAME** — crea un **alias**: fa puntare un sottodominio a un altro nome di dominio invece che a un IP diretto (es. `www.esempio.it → esempio.it`). Comodo perché se l'IP dietro cambia, non devi aggiornare ogni alias.
- **MX** — indica quali server gestiscono la **posta elettronica** del dominio, con una priorità numerica (più basso = più prioritario). Sbagliare qui vuol dire email che smettono di arrivare.
- **TXT** — un campo di testo libero, usato soprattutto per **verifiche di proprietà** (Google Search Console, Cloudflare) e per record anti-spam come **SPF** e **DKIM**, che dicono ai server di posta quali IP sono autorizzati a spedire email a nome del tuo dominio.
- **NS** — indica quali **name server** sono autoritativi per il dominio. Se sposti un dominio a un nuovo provider DNS, sono questi record che devi aggiornare dal tuo registrar.

## Un errore comune: confondere registrar e provider DNS

Quando registri un dominio, il **registrar** (dove lo compri: Aruba, Namecheap, Register.it...) non è per forza chi gestisce i suoi record DNS. Puoi tranquillamente registrare un dominio su un provider e gestirne il DNS su un altro, ad esempio Cloudflare, che offre un pannello DNS gratuito, veloce e con protezioni aggiuntive.

Per farlo basta cambiare i **name server (NS)** del dominio dal pannello del registrar, puntandoli a quelli forniti dal nuovo provider DNS. Da quel momento è quest'ultimo a rispondere alle interrogazioni per quel dominio, registrar escluso.

Questo è utile da sapere perché spiega situazioni come: "ho cambiato un record su Aruba ma il sito non cambia" — magari il DNS reale è gestito su Cloudflare da mesi, e modificare i record dal pannello sbagliato semplicemente non ha alcun effetto.

## Come verificare la configurazione DNS

Da terminale, senza bisogno di strumenti esterni, puoi interrogare direttamente i record di un dominio:

```
dig esempio.it A
dig esempio.it MX
dig esempio.it TXT
```

Oppure, se `dig` non è disponibile (tipico su Windows senza WSL):

```
nslookup esempio.it
```

Se vuoi controllare che una modifica si sia già propagata su resolver diversi in giro per il mondo, siti come whatsmydns.net fanno l'interrogazione da decine di location contemporaneamente, così eviti di aspettare al buio chiedendoti se hai sbagliato qualcosa.

## In sintesi

Il DNS non è magia: è una gerarchia di server che si passano la domanda "chi è responsabile per questo dominio?" finché qualcuno non ha la risposta definitiva, e quella risposta viene tenuta in cache per il tempo che tu stesso hai deciso col TTL. Sapere questo ti toglie l'ansia da "modifica che non si vede" e ti aiuta a diagnosticare in trenta secondi problemi che altrimenti sembrano misteriosi: dominio che non risolve, email che non arrivano, sito che carica la versione vecchia dopo una migrazione.

La prossima volta che cambi hosting, ricordati solo due cose: abbassa il TTL qualche giorno prima, e verifica sempre con `dig` prima di dare la colpa al server.
