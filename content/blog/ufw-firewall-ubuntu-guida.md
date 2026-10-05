---
title: "UFW: come configurare il firewall su Ubuntu/Debian"
date: 2026-10-05
description: "Guida pratica a UFW (Uncomplicated Firewall): come abilitarlo senza perdere l'accesso SSH, le regole essenziali, i profili applicativi e il rate limiting anti brute-force."
tags: ["Guide", "Linux"]
translationKey: "ufw-firewall-guide"
---

Se gestisci un server con SSH protetto da chiavi e [Fail2ban](/fail2ban-proteggere-ssh-da-attacchi-brute-force/) attivo, hai già coperto due livelli di difesa importanti. Ma manca ancora un pezzo: un firewall che decida, porta per porta, cosa può entrare nel server e cosa no. Su Ubuntu e Debian lo strumento più semplice per farlo è **UFW**, Uncomplicated Firewall — e nonostante il nome rassicurante, è facile configurarlo male e tagliarsi fuori dal proprio server. Vediamo come farlo bene.

## Cos'è UFW e perché ti serve

UFW non è un firewall a sé: è un'interfaccia semplificata sopra `iptables` (o `nftables`, a seconda della distribuzione), pensata per evitare di scrivere regole a mano con una sintassi criptica. Lo scopo è lo stesso di qualsiasi firewall: bloccare di default tutto il traffico non richiesto, e aprire solo le porte che il server deve davvero esporre.

Perché ti serve anche se hai già altre protezioni? Perché fail2ban e le chiavi SSH riducono il rischio su un servizio specifico (SSH), ma non impediscono a un bot di provare a connettersi a un database esposto per errore, a un pannello di amministrazione lasciato aperto su una porta non standard, o a qualsiasi altro servizio che gira sul server senza che tu lo sappia. Il firewall è la rete di sicurezza che blocca tutto per default, a prescindere da cosa c'è in ascolto.

## Installazione e stato iniziale

Su Ubuntu, UFW è quasi sempre già installato. Se non lo è:

```
sudo apt update
sudo apt install ufw
```

Controlla lo stato attuale prima di toccare qualsiasi cosa:

```
sudo ufw status verbose
```

Se non l'hai mai configurato, probabilmente è `inactive`. **Non attivarlo ancora**: il primo errore comune è abilitare UFW con la policy di default (che blocca tutto il traffico entrante) prima di aver aperto la porta SSH, restando bloccati fuori dal server al primo riavvio o alla prima disconnessione.

## Le policy di default

UFW parte da due regole generali, che valgono per tutto il traffico non altrimenti specificato:

```
sudo ufw default deny incoming
sudo ufw default allow outgoing
```

Questa combinazione è quella corretta per la maggior parte dei server: blocca ogni connessione che arriva da fuori, ma lascia che il server stesso possa uscire liberamente (per aggiornamenti, chiamate API, invio mail, eccetera). Da qui in avanti, ogni servizio che vuoi rendere raggiungibile da fuori va aperto esplicitamente.

## Il primo passo: apri SSH prima di attivare UFW

Questo è il passaggio che evita di restare fuori dal server. Prima di abilitare UFW, assicurati che la porta SSH sia autorizzata:

```
sudo ufw allow OpenSSH
```

Se usi una porta SSH non standard (buona pratica, ma va specificata), usa il numero di porta invece del profilo:

```
sudo ufw allow 2222/tcp
```

Solo a questo punto puoi attivare UFW:

```
sudo ufw enable
```

Il sistema chiede conferma perché potrebbe interrompere connessioni esistenti: con SSH già autorizzato, la tua sessione attuale resta aperta e non perdi l'accesso.

## Come UFW decide cosa far passare

UFW valuta le regole nell'ordine in cui sono state inserite, e si ferma alla prima che corrisponde al traffico in arrivo. Se nessuna regola corrisponde, si applica la policy di default (di solito `deny`).

<svg class="hi-diagram" width="300" height="230" viewBox="0 0 300 230" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="10" y="16" width="120" height="46" rx="14" class="hi-fill hi-line" stroke-width="2"/>
  <line x1="70" y1="62" x2="70" y2="92" class="hi-muted-stroke" stroke-width="2"/>

  <rect x="10" y="94" width="120" height="46" rx="14" class="hi-fill hi-ink-stroke" stroke-width="2.5"/>
  <circle cx="105" cy="104" r="6" class="hi-accent-dot"/>
  <line x1="70" y1="140" x2="70" y2="170" class="hi-muted-stroke" stroke-width="2"/>

  <rect x="10" y="172" width="120" height="46" rx="14" class="hi-fill hi-line" stroke-width="2"/>

  <line x1="130" y1="117" x2="180" y2="117" class="hi-muted-stroke" stroke-width="2"/>
  <rect x="180" y="94" width="110" height="46" rx="14" class="hi-fill hi-line" stroke-width="2"/>
</svg>

Dall'alto: pacchetto in arrivo → UFW scorre le regole in ordine (in evidenza il punto in cui trova la prima corrispondenza) → se nessuna regola corrisponde, si applica la policy di default. A destra: l'azione finale, allow o deny, decisa dalla prima regola che ha trovato un match.

Per questo motivo l'ordine conta: se apri una porta in modo generico e poi provi ad aggiungere un'eccezione più specifica dopo, UFW potrebbe aver già deciso in base alla prima regola trovata. Nella pratica, per la maggior parte dei casi d'uso le regole semplici (allow su una porta, deny su un IP) non creano ambiguità, ma vale la pena tenerlo a mente quando le regole iniziano a sovrapporsi.

## Aprire le porte che ti servono davvero

Per un server web tipico, le porte da aprire sono poche:

```
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

Oppure, se preferisci usare i profili applicativi predefiniti (UFW ne include diversi per i servizi più comuni):

```
sudo ufw app list
sudo ufw allow "Nginx Full"
```

`ufw app list` mostra tutti i profili disponibili sul sistema, installati dai pacchetti stessi (Nginx, Apache, OpenSSH registrano i loro profili automaticamente). Usarli è comodo perché restano leggibili anche a distanza di mesi, molto più di un numero di porta isolato.

Evita di aprire porte "perché potrebbero servire": ogni porta aperta è superficie d'attacco. Se un servizio gira solo in locale (un database che usa solo l'applicazione sulla stessa macchina), non deve comparire tra le regole di UFW: semplicemente non è mai esposto all'esterno, e va bene così.

## Restringere l'accesso a IP specifici

Non tutte le porte devono essere aperte al mondo intero. Se un servizio (un pannello di amministrazione, una porta di database per un tool di gestione) deve essere raggiungibile solo da te o da un numero limitato di IP, specifica la sorgente:

```
sudo ufw allow from 203.0.113.42 to any port 5432
```

Questo autorizza solo quell'IP a raggiungere la porta 5432 (tipicamente PostgreSQL), bloccando tutti gli altri. Puoi anche specificare un'intera subnet:

```
sudo ufw allow from 203.0.113.0/24 to any port 5432
```

È lo stesso principio della whitelist che usi con `ignoreip` in fail2ban, applicato però a livello di rete invece che di autenticazione: il traffico da IP non autorizzati non arriva nemmeno a tentare la connessione.

## Rate limiting: una difesa in più per SSH

UFW include una funzione spesso ignorata ma molto utile: `limit`, che blocca temporaneamente un IP se tenta troppe connessioni in un breve periodo di tempo sulla stessa porta. Per SSH:

```
sudo ufw limit OpenSSH
```

Questo non sostituisce fail2ban (che è più configurabile e lavora sui log applicativi, non solo sul numero di connessioni), ma aggiunge un livello di protezione base anche se fail2ban dovesse essere fermo o non ancora installato. Usarli insieme è ridondanza utile, non spreco.

## Controllare, modificare, rimuovere regole

Per vedere le regole attive con i numeri di riferimento (utili per rimuoverle):

```
sudo ufw status numbered
```

Per eliminare una regola specifica usando il numero mostrato:

```
sudo ufw delete 3
```

Per rimuovere una regola conoscendo invece la sintassi con cui è stata creata:

```
sudo ufw delete allow 8080/tcp
```

E se qualcosa va storto e vuoi ripartire da zero:

```
sudo ufw reset
```

Attenzione: `reset` disattiva UFW e rimuove tutte le regole, incluse quelle per SSH. Se lo esegui su un server remoto, assicurati di avere un modo alternativo per accedere (console del provider, accesso fisico) prima di farlo, perché dovrai ri-autorizzare SSH da capo.

## IPv6: non dimenticarlo

Se il tuo server ha un indirizzo IPv6 pubblico (sempre più comune con i provider cloud), UFW gestisce IPv6 in automatico se nel file `/etc/default/ufw` la direttiva `IPV6` è impostata su `yes` (il default su Ubuntu). Le regole che scrivi con `ufw allow` vengono applicate automaticamente anche in IPv6, quindi nella maggior parte dei casi non devi fare nulla di più — ma vale la pena verificarlo una volta con:

```
sudo ufw status verbose
```

Se nell'output non vedi menzionato IPv6, controlla quella direttiva prima di assumere che il server sia protetto su entrambi i protocolli.

## In sintesi

UFW non elimina la necessità di capire cosa gira sul tuo server, ma rende banale applicare il principio più importante della sicurezza di rete: bloccare tutto per default, e aprire solo ciò che serve, esplicitamente. Attivalo partendo sempre dall'autorizzare SSH, tieni la lista delle regole il più corta possibile, e usalo insieme a fail2ban invece che in alternativa: uno blocca per default, l'altro reagisce ai comportamenti sospetti su quello che hai lasciato aperto. Insieme coprono molto più terreno di quanto farebbero da soli.
