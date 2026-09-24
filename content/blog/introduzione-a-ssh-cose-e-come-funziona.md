---
title: "SSH: guida pratica a chiavi, configurazione, tunnel e sicurezza"
seoTitle: "SSH: chiavi, config, tunnel e sicurezza del server"
date: 2024-03-12
lastmod: 2026-09-24
description: "Guida pratica a SSH: chiavi ed25519, ssh-agent, file ~/.ssh/config, trasferimento file, tunnel, hardening del server ed errori comuni come Permission denied."
tags: ["Guide", "Linux"]
translationKey: "ssh-guide"
---

Passo buona parte della giornata dentro sessioni SSH: server di clienti, macchine di staging, container, router. È lo strumento che uso di più dopo l'editor, e anche quello che la maggior parte degli sviluppatori usa al 10%: `ssh utente@ip`, password, e basta.

Questa guida parte dalle basi ma va dritta alle cose che fanno la differenza nel lavoro quotidiano: autenticazione con chiavi, il file `~/.ssh/config`, tunnel per raggiungere servizi non esposti, la messa in sicurezza del server e gli errori che ti capiteranno di sicuro.

## Cos'è SSH e cosa succede quando ti colleghi

**SSH** (Secure Shell) è un protocollo per aprire un canale cifrato tra due macchine su una rete non fidata. Ci passano una shell remota, il trasferimento di file, i tunnel verso altri servizi e anche Git. Lo standard di fatto è **OpenSSH**, preinstallato su Linux e macOS e integrato anche in Windows 10 e 11.

Quando lanci `ssh`, succedono tre cose in ordine:

1. **Il server si identifica** con la sua *host key*. Il client la confronta con quelle salvate in `~/.ssh/known_hosts`: è così che sai di parlare con il server giusto e non con qualcuno in mezzo.
2. **Client e server concordano una chiave di sessione** con uno scambio di chiavi Diffie-Hellman, senza che la chiave passi mai sulla rete. Le versioni recenti di OpenSSH usano di default uno scambio ibrido pensato per resistere anche ai futuri computer quantistici.
3. **Tu ti autentichi**, con una password o, molto meglio, con una chiave.

## La prima connessione

```
ssh utente@server.esempio.it
ssh -p 2222 utente@203.0.113.10     # porta diversa dalla 22
```

La prima volta vedrai qualcosa del genere:

```
The authenticity of host 'server.esempio.it (203.0.113.10)' can't be established.
ED25519 key fingerprint is SHA256:x3Jk...
Are you sure you want to continue connecting (yes/no/[fingerprint])?
```

Quasi tutti scrivono `yes` senza leggere. Su un server che hai creato tu, la fingerprint si verifica dalla console del provider con `ssh-keygen -lf /etc/ssh/ssh_host_ed25519_key.pub`. È l'unico momento in cui un attacco man-in-the-middle può passare inosservato.

Se in futuro vedi **"REMOTE HOST IDENTIFICATION HAS CHANGED"**, fermati. Di solito il server è stato reinstallato o l'IP è passato a un'altra macchina, ma è anche esattamente l'avviso che vedresti durante un attacco. Quando sei sicuro che il cambio è legittimo, rimuovi la vecchia chiave:

```
ssh-keygen -R server.esempio.it
```

## Autenticazione con chiavi

Le password su SSH hanno due problemi: si possono indovinare (e i bot ci provano di continuo su ogni server esposto) e ti obbligano a digitarle ogni volta. Le chiavi risolvono entrambi.

### Generare la chiave

```
ssh-keygen -t ed25519 -C "alberto@laptop"
```

**Ed25519** è l'algoritmo da usare oggi: chiavi corte, veloci e sicure. RSA va bene solo per sistemi molto vecchi che non supportano altro, e in quel caso almeno a 4096 bit.

Il comando crea due file in `~/.ssh/`:

- `id_ed25519`: la **chiave privata**. Non esce mai dal tuo computer.
- `id_ed25519.pub`: la **chiave pubblica**. È quella che copi sui server.

Quando ti chiede una **passphrase**, mettila. Se qualcuno ti ruba il portatile o un backup, la chiave privata senza passphrase è un accesso diretto a tutti i tuoi server. Con `ssh-agent` (sotto) la digiti una volta per sessione, quindi non è un fastidio.

### Copiare la chiave sul server

```
ssh-copy-id -i ~/.ssh/id_ed25519.pub utente@server.esempio.it
```

`ssh-copy-id` aggiunge la chiave pubblica al file `~/.ssh/authorized_keys` del server e imposta i permessi corretti. Su Windows non c'è: da PowerShell puoi fare lo stesso a mano.

```
type $env:USERPROFILE\.ssh\id_ed25519.pub | ssh utente@server.esempio.it "mkdir -p ~/.ssh && chmod 700 ~/.ssh && cat >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys"
```

Da questo momento `ssh utente@server.esempio.it` non chiede più la password del server.

### ssh-agent: la passphrase una volta sola

L'agent tiene in memoria le chiavi sbloccate per la durata della sessione:

```
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519
ssh-add -l                          # chiavi caricate
```

Su quasi tutti i desktop Linux l'agent parte già con la sessione grafica. Su macOS puoi salvare la passphrase nel Portachiavi con `ssh-add --apple-use-keychain ~/.ssh/id_ed25519`, e aggiungere `UseKeychain yes` nel config (lo vediamo tra poco).

Evita l'**agent forwarding** (`ssh -A`) verso server di cui non ti fidi del tutto: chi è root su quel server può usare le tue chiavi finché sei collegato. Per saltare da un server all'altro c'è un modo migliore, `ProxyJump`.

## Il file ~/.ssh/config

Se scrivi ancora `ssh -p 2222 -i ~/.ssh/cliente_ed25519 deploy@203.0.113.10`, questo è il paragrafo che ti cambia le giornate. Nel file `~/.ssh/config` dai un nome a ogni server:

```
Host *
    ServerAliveInterval 60
    AddKeysToAgent yes
    # solo su macOS:
    # UseKeychain yes

Host cliente-prod
    HostName 203.0.113.10
    User deploy
    Port 2222
    IdentityFile ~/.ssh/cliente_ed25519
    IdentitiesOnly yes

Host cliente-db
    HostName 10.0.0.5
    User deploy
    ProxyJump cliente-prod
```

Ora basta `ssh cliente-prod`. Il nome funziona ovunque si usi SSH: `scp`, `rsync`, Git e l'estensione Remote SSH di [VS Code](/le-9-migliori-estensioni-di-visual-studio-code/).

Le direttive che valgono il file:

- **`IdentitiesOnly yes`**: usa solo la chiave indicata. Senza, il client prova tutte le chiavi dell'agent, e con molte chiavi il server ti chiude la porta dopo pochi tentativi ("Too many authentication failures").
- **`ServerAliveInterval 60`**: manda un segnale ogni 60 secondi, così router e firewall non chiudono le connessioni inattive e non trovi più il terminale congelato con "Broken pipe".
- **`ProxyJump`**: raggiunge un server interno (qui il database, che non è esposto su internet) passando da un *bastion host*, in modo trasparente. `ssh cliente-db` fa tutto da solo, e le tue chiavi non lasciano mai il tuo computer.

Un'altra ottimizzazione che uso ovunque è il **multiplexing**: la prima connessione resta aperta in background e le successive verso lo stesso host la riutilizzano, senza rifare l'handshake. Le connessioni dopo la prima diventano istantanee:

```
Host *
    ControlMaster auto
    ControlPath ~/.ssh/cm-%C
    ControlPersist 10m
```

## Trasferire file

```
scp file.sql cliente-prod:/tmp/
scp cliente-prod:/var/log/nginx/error.log .
```

`scp` va bene per un file singolo. Dalle versioni recenti di OpenSSH usa internamente il protocollo SFTP, più sicuro del vecchio protocollo SCP, e per l'uso normale non cambia niente.

Per cartelle, trasferimenti grandi o sincronizzazioni ripetute, usa **rsync**: copia solo le differenze e riprende se la connessione cade.

```
rsync -avz --progress ./dist/ cliente-prod:/var/www/sito/public/
rsync -avzn --delete ./dist/ cliente-prod:/var/www/sito/public/   # -n: prova, senza modificare niente
```

Due dettagli di rsync che fanno danni. La **barra finale** sull'origine conta: `dist/` copia il *contenuto* della cartella, `dist` copia la cartella stessa. E prima di usare `--delete` (cancella dalla destinazione i file che non esistono più nell'origine) lancia sempre il comando con `-n`, per vedere cosa succederebbe.

## Tunnel: raggiungere servizi non esposti

Il port forwarding è la funzione di SSH che risolve più problemi e che meno persone conoscono.

### Tunnel locale (`-L`)

Il caso tipico: MySQL sul server ascolta solo su `localhost`, come deve essere, ma tu vuoi collegarti con un client grafico dal tuo computer.

```
ssh -N -L 3307:localhost:3306 cliente-prod
```

Ora il tuo client si collega a `127.0.0.1:3307` e parla con il MySQL del server, attraverso SSH. `-N` significa "non aprire una shell, fai solo il tunnel". Il database resta invisibile a internet: è molto meglio che aprire la porta 3306 nel firewall. Nella mia guida alla [LAMP stack su Ubuntu](/come-installare-una-lamp-stack/) trovi come creare un utente database dedicato da usare in questo modo.

### Tunnel remoto (`-R`)

Il contrario: esponi sul server una porta del tuo computer. Serve, per esempio, a mostrare a un cliente un'applicazione che gira sulla tua macchina di sviluppo, o a far ricevere un webhook a un'app locale.

```
ssh -N -R 8080:localhost:3000 cliente-staging
```

La porta 8080 del server ora porta alla porta 3000 del tuo computer.

### Proxy SOCKS (`-D`)

```
ssh -N -D 1080 cliente-prod
```

Crea un proxy SOCKS locale: configurando il browser per usarlo, navighi come se fossi il server. È utile per raggiungere pannelli di amministrazione accessibili solo dalla rete interna del cliente.

## Sessioni lunghe: tmux

Se la connessione cade durante un aggiornamento di sistema o un import di database da due ore, il processo può morire con lei. La soluzione è lavorare dentro **tmux**, che tiene viva la sessione sul server anche quando ti disconnetti:

```
tmux new -s lavoro        # nuova sessione
# Ctrl+b poi d            # stacca la sessione, i processi continuano
tmux attach -t lavoro     # riattacca, anche da un altro computer
```

E un trucco che pochi conoscono: se una sessione SSH si congela e non risponde più a niente, premi `Invio`, poi `~` e poi `.`. È la sequenza di escape del client SSH e chiude la connessione all'istante, senza dover chiudere il terminale.

## Mettere in sicurezza il server

Ogni server con la porta 22 aperta riceve tentativi di accesso dai bot entro pochi minuti dall'accensione. Con qualche impostazione diventano irrilevanti.

### La configurazione di sshd

Invece di modificare `/etc/ssh/sshd_config`, crea un file separato: sopravvive agli aggiornamenti del pacchetto ed è chiaro cosa hai cambiato tu.

```
sudoedit /etc/ssh/sshd_config.d/01-hardening.conf
```

```
PasswordAuthentication no
KbdInteractiveAuthentication no
PermitRootLogin no
PubkeyAuthentication yes
MaxAuthTries 3
AllowUsers alberto deploy
```

Il nome **`01-`** non è casuale. In `sshd_config` vale la **prima** occorrenza di ogni direttiva, e i file in `sshd_config.d/` vengono letti in ordine alfabetico. Sulle immagini cloud di Ubuntu c'è spesso un `50-cloud-init.conf` che imposta `PasswordAuthentication yes`: se chiami il tuo file `99-hardening.conf`, la tua impostazione viene ignorata senza nessun avviso. Per vedere la configurazione davvero in uso:

```
sudo sshd -T | grep -Ei 'passwordauthentication|permitrootlogin'
```

Prima di applicare, controlla la sintassi e **tieni aperta una seconda sessione SSH** finché non hai verificato di riuscire a rientrare. Se sbagli qualcosa, quella sessione è l'unico modo per rimediare senza passare dalla console del provider.

```
sudo sshd -t
sudo systemctl restart ssh
```

Su Ubuntu 24.04 il servizio si chiama `ssh` ed è attivato tramite socket: se cambi la **porta**, dopo la modifica serve `sudo systemctl daemon-reload && sudo systemctl restart ssh.socket`, altrimenti SSH continua ad ascoltare sulla porta vecchia.

Per modificare questi file dal terminale ti può servire la mia [guida pratica a nano](/nano-editor-guida-per-principianti/), che spiega anche perché usare `sudoedit`.

### Firewall e fail2ban

Tieni la porta SSH aperta nel firewall prima di attivarlo (`sudo ufw allow OpenSSH`) e, se puoi, limitala agli IP da cui lavori. **fail2ban** legge i log e blocca per un certo tempo gli IP che sbagliano l'accesso troppe volte. Su Debian e Ubuntu la protezione per SSH è attiva appena lo installi:

```
sudo apt install fail2ban
sudo fail2ban-client status sshd
```

Con l'accesso via password disattivato fail2ban serve meno, ma riduce il rumore nei log e il carico dei tentativi.

**Cambiare la porta** da 22 a un'altra riduce drasticamente i tentativi automatici, ma non è una misura di sicurezza vera: una scansione la trova in pochi secondi. Fallo pure per avere log più puliti, non al posto delle chiavi.

## Errori comuni

**"Permission denied (publickey)".** Il server non accetta nessuna delle chiavi che hai presentato. Prima di tutto lancia la connessione in modalità verbosa, che ti dice quali chiavi prova e cosa risponde il server:

```
ssh -v cliente-prod
```

Le cause più frequenti sono: utente sbagliato, la chiave non è in `authorized_keys`, oppure **permessi troppo larghi** sul server. SSH rifiuta le chiavi se `~/.ssh` non è `700`, se `authorized_keys` non è `600` o se la home è scrivibile da altri utenti. Lato server, `sudo journalctl -u ssh` spiega il motivo esatto.

**"WARNING: UNPROTECTED PRIVATE KEY FILE!".** È la stessa regola, ma lato client: la chiave privata è leggibile da altri utenti. `chmod 600 ~/.ssh/id_ed25519`.

**"Connection refused" o "Connection timed out".** Non sono la stessa cosa. *Refused* significa che la macchina risponde ma sulla porta non ascolta nessuno: SSH è fermo o in ascolto su un'altra porta. *Timed out* significa che non arriva nessuna risposta: un firewall, un security group del cloud o un problema di rete sta scartando i pacchetti.

**"Too many authentication failures".** L'agent ha offerto troppe chiavi sbagliate prima di quella giusta. Aggiungi `IdentityFile` e `IdentitiesOnly yes` per quell'host nel config.

**"Broken pipe" dopo qualche minuto di inattività.** Un router o un firewall chiude le connessioni inattive. `ServerAliveInterval 60` nel config risolve.

## In sintesi

Chiavi ed25519 con passphrase, un `~/.ssh/config` con un nome per ogni server, `ProxyJump` invece dell'agent forwarding, tunnel invece di porte aperte, rsync per i trasferimenti, tmux per i lavori lunghi. Sul server, niente password e niente root, e verifica con `sshd -T` che la configurazione sia quella che credi.

Quando sei collegato e il disco del server risulta pieno, [ncdu](/ottimizzare-lo-spazio-su-disco-da-terminale-con-ncdu-una-guida-essenziale-per-i-server/) ti dice in pochi secondi dove guardare.
