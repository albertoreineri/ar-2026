---
title: "Gestione dei pacchetti in Linux: apt, dnf, pacman, Flatpak e Snap"
seoTitle: "Pacchetti Linux: apt, dnf, pacman, snap, flatpak"
date: 2024-03-20
lastmod: 2026-09-24
description: "I comandi essenziali di APT, DNF, Pacman, Flatpak, Snap e AppImage: installare, aggiornare e rimuovere software su Linux e gestire i repository."
tags: ["Guide", "Linux"]
translationKey: "linux-package-management"
---

Su Linux non si scarica un installer da un sito e si clicca "Avanti". Il software arriva quasi sempre da un **gestore di pacchetti**, che lo scarica da repository firmati, risolve le dipendenze e sa esattamente quali file ha messo dove, così può aggiornarli o toglierli senza lasciare residui.

Il problema è che ogni famiglia di distribuzioni ha il suo gestore, con la sua sintassi. Quando lavori su server di clienti diversi passi da Ubuntu a Rocky Linux a un container Alpine nella stessa giornata. Questa guida è quella che avrei voluto avere: cosa sono i pacchetti, i comandi che servono davvero per ogni gestore, una tabella di confronto e gli errori che prima o poi incontrerai.

## Cos'è un pacchetto

Un pacchetto è un archivio che contiene il software (binari, librerie, file di configurazione, documentazione) più una serie di **metadati**: nome, versione, dipendenze, script da eseguire prima e dopo l'installazione. Il gestore di pacchetti legge i metadati, controlla la firma, installa le dipendenze mancanti e registra ogni file in un database locale.

I formati principali sono tre:

- **.deb**: Debian, Ubuntu, Linux Mint e derivate. Il gestore è **APT**, che si appoggia a `dpkg`.
- **.rpm**: Fedora, Red Hat Enterprise Linux, Rocky Linux, AlmaLinux, openSUSE. Il gestore è **DNF** (su openSUSE, `zypper`), che si appoggia a `rpm`.
- **.pkg.tar.zst**: Arch Linux e derivate (Manjaro, EndeavourOS). Il gestore è **pacman**.

A questi si aggiungono **Alpine** con `apk`, che incontri spesso nelle immagini Docker, e i formati **universali** (Flatpak, Snap, AppImage), che funzionano su qualsiasi distribuzione portandosi dietro le proprie dipendenze.

## Pacchetti nativi o universali?

La distinzione conta più di quanto sembri:

- I **pacchetti nativi** sono compilati per la tua distribuzione e condividono le librerie di sistema. Sono leggeri, ben integrati e ricevono le patch di sicurezza dal team della distribuzione. In cambio, su una distribuzione stabile come Debian o RHEL spesso trovi versioni vecchie di mesi o anni.
- I **pacchetti universali** includono le proprie dipendenze. Hai la versione più recente direttamente dallo sviluppatore, su qualsiasi distribuzione, ma a costo di più spazio su disco, integrazione a volte imperfetta con il desktop e aggiornamenti di sicurezza che dipendono da chi pubblica il pacchetto.

La mia regola pratica: **su un server solo pacchetti nativi** (più container, se serve una versione diversa). **Su un desktop**, nativi per il sistema e Flatpak per le applicazioni grafiche.

## I comandi a confronto

La tabella che consulto quando salto da una distribuzione all'altra:

| Operazione | APT (Debian/Ubuntu) | DNF (Fedora/RHEL) | pacman (Arch) | apk (Alpine) |
|---|---|---|---|---|
| Aggiorna l'indice dei pacchetti | `apt update` | `dnf makecache` | `pacman -Sy` | `apk update` |
| Aggiorna il sistema | `apt upgrade` | `dnf upgrade` | `pacman -Syu` | `apk upgrade` |
| Installa | `apt install pkg` | `dnf install pkg` | `pacman -S pkg` | `apk add pkg` |
| Rimuovi | `apt remove pkg` | `dnf remove pkg` | `pacman -R pkg` | `apk del pkg` |
| Rimuovi con configurazione e dipendenze inutili | `apt purge pkg` + `apt autoremove` | `dnf remove pkg` | `pacman -Rns pkg` | `apk del pkg` |
| Cerca | `apt search testo` | `dnf search testo` | `pacman -Ss testo` | `apk search testo` |
| Informazioni su un pacchetto | `apt show pkg` | `dnf info pkg` | `pacman -Si pkg` | `apk info -a pkg` |
| Pacchetti installati | `apt list --installed` | `dnf list --installed` | `pacman -Q` | `apk info` |
| File installati da un pacchetto | `dpkg -L pkg` | `rpm -ql pkg` | `pacman -Ql pkg` | `apk info -L pkg` |
| Quale pacchetto possiede un file | `dpkg -S /percorso` | `rpm -qf /percorso` | `pacman -Qo /percorso` | `apk info --who-owns /percorso` |

Tutti i comandi che modificano il sistema vanno lanciati con `sudo` (o da root, come di solito succede in un container).

Gli ultimi due sono quelli che mi salvano più spesso: trovare **da dove arriva un file** in `/etc` o in `/usr/bin` è il primo passo per capire chi l'ha messo lì e come aggiornarlo.

## APT: Debian, Ubuntu e derivate

### apt o apt-get?

`apt` è l'interfaccia pensata per l'uso interattivo: output più leggibile, barra di avanzamento, colori. `apt-get` e `apt-cache` sono i comandi storici con un output stabile, e sono quelli da usare **negli script** e nei `Dockerfile`: `apt` stesso avvisa che la sua interfaccia a riga di comando può cambiare. A mano usa `apt`, nell'automazione usa `apt-get`.

### I comandi quotidiani

```
sudo apt update                 # scarica l'indice aggiornato dei repository
sudo apt upgrade                # aggiorna i pacchetti senza rimuoverne nessuno
sudo apt full-upgrade           # aggiorna anche se servono rimozioni o nuove dipendenze
sudo apt install nginx
sudo apt remove nginx           # rimuove il pacchetto, lascia la configurazione
sudo apt purge nginx            # rimuove anche la configurazione in /etc
sudo apt autoremove             # rimuove le dipendenze non più necessarie
apt policy nginx                # versione installata, candidata e da quale repository
sudo apt-mark hold nginx        # blocca un pacchetto alla versione attuale
```

`apt update` non aggiorna niente: scarica solo l'elenco di cosa è disponibile. È l'equivoco più comune per chi arriva da altri sistemi.

### Repository e chiavi, nel modo attuale

I repository sono definiti in `/etc/apt/sources.list` e nei file in `/etc/apt/sources.list.d/`. Le versioni recenti (Ubuntu dalla 24.04, per esempio) usano il formato **deb822**, con file `.sources` al posto delle vecchie righe `deb ...`.

Per aggiungere un repository di terze parti, per esempio quello di un database o di Docker, `apt-key` è deprecato e nelle versioni più recenti non esiste più. Il modo corretto è salvare la chiave in un file dedicato e legarla **solo** a quel repository:

```
sudo install -d -m 0755 /etc/apt/keyrings
curl -fsSL https://repo.esempio.com/key.gpg | sudo gpg --dearmor -o /etc/apt/keyrings/esempio.gpg
```

E poi `/etc/apt/sources.list.d/esempio.sources`:

```
Types: deb
URIs: https://repo.esempio.com/apt
Suites: stable
Components: main
Signed-By: /etc/apt/keyrings/esempio.gpg
```

`Suites` e `Components` cambiano da repository a repository: li trovi nella documentazione di chi lo pubblica. Con `Signed-By` quella chiave vale solo per quel repository, invece di essere considerata affidabile per tutto il sistema come succedeva con `apt-key`.

Per modificare questi file al volo da terminale va benissimo nano: ho scritto una [guida pratica a nano](/nano-editor-guida-per-principianti/) con le scorciatoie essenziali.

### Aggiornamenti automatici sui server

Su un server Debian o Ubuntu, le patch di sicurezza conviene lasciarle installare in automatico con `unattended-upgrades`:

```
sudo apt install unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

Di default installa solo gli aggiornamenti di sicurezza, che è esattamente quello che vuoi. Gli aggiornamenti funzionali li fai tu, quando decidi.

## DNF: Fedora, RHEL, Rocky Linux, AlmaLinux

**YUM** è stato il gestore storico del mondo Red Hat. Da RHEL 8 è stato sostituito da **DNF**, e il comando `yum` è rimasto solo come alias. Fedora dalla versione 41 usa **DNF5**, una riscrittura più veloce: i comandi di base sono gli stessi, ma alcuni sottocomandi (come `config-manager`) hanno cambiato sintassi, quindi occhio alle guide vecchie.

```
sudo dnf upgrade                # aggiorna il sistema (scarica anche i metadati)
sudo dnf install nginx
sudo dnf remove nginx           # rimuove anche le dipendenze non più usate
dnf provides /usr/bin/dig       # quale pacchetto fornisce un file o comando
dnf repolist                    # repository attivi
dnf history                     # storico delle transazioni
sudo dnf history undo 42        # annulla la transazione numero 42
```

`dnf history undo` è una funzione che su APT manca e che mi ha salvato più di una volta dopo un aggiornamento andato storto.

I repository sono file `.repo` in `/etc/yum.repos.d/`. Su RHEL e cloni molti pacchetti comuni (per esempio `htop` o `ncdu`) non sono nei repository base ma in **EPEL**. Su Rocky Linux e AlmaLinux 9:

```
sudo dnf install epel-release
sudo dnf config-manager --set-enabled crb
```

## pacman: Arch Linux e derivate

Arch è una distribuzione **rolling release**: non esistono "versioni", il sistema si aggiorna di continuo. Questo cambia il modo di usare pacman.

```
sudo pacman -Syu                # sincronizza e aggiorna tutto il sistema
sudo pacman -S nginx            # installa (dopo un -Syu!)
sudo pacman -Rns nginx          # rimuove pacchetto, dipendenze inutili e configurazioni
pacman -Ss testo                # cerca nei repository
pacman -Qi nginx                # informazioni su un pacchetto installato
pacman -Qdtq                    # pacchetti orfani
sudo pacman -Rns $(pacman -Qdtq) # rimuove gli orfani
```

La regola da non violare mai: **non usare `pacman -Sy pkg`**, cioè aggiornare l'indice e installare un pacchetto senza aggiornare il resto del sistema. È un aggiornamento parziale, non supportato su Arch, e prima o poi rompe le librerie. Sempre `-Syu`, poi installi.

Il software che non è nei repository ufficiali sta nell'**AUR** (Arch User Repository): ricette di build mantenute dalla comunità, che si installano con un helper come `yay` o `paru`. Sono script scritti da chiunque, quindi prima di installare leggi il `PKGBUILD`.

## apk: Alpine e i container

Alpine è la base di moltissime immagini Docker, per cui `apk` lo incontri anche se non l'hai mai installato su una macchina vera. In un `Dockerfile` la forma giusta è:

```
RUN apk add --no-cache curl ca-certificates
```

`--no-cache` evita di lasciare l'indice dei pacchetti dentro l'immagine. L'equivalente per le immagini Debian è `apt-get update && apt-get install -y --no-install-recommends ... && rm -rf /var/lib/apt/lists/*`, tutto nello stesso `RUN`.

## Flatpak

Flatpak è lo standard di fatto per le **applicazioni desktop** distribuite indipendentemente dalla distribuzione. Le applicazioni girano in una **sandbox** con permessi dichiarati, e il repository principale è **Flathub**.

```
flatpak remote-add --if-not-exists flathub https://dl.flathub.org/repo/flathub.flatpakrepo
flatpak install flathub org.gimp.GIMP
flatpak run org.gimp.GIMP
flatpak update
flatpak uninstall --unused      # rimuove i runtime non più usati da nessuna app
```

Le applicazioni si identificano con un nome in formato dominio invertito (`org.gimp.GIMP`), che trovi con `flatpak search`. Se un'app non vede una cartella o una periferica, il problema è quasi sempre un permesso della sandbox: si gestisce con `flatpak override` o, più comodamente, con l'app **Flatseal**.

## Snap

Snap è il formato universale sviluppato da Canonical ed è integrato di default in Ubuntu, che ci distribuisce anche Firefox. A differenza di Flatpak funziona anche per servizi e strumenti da riga di comando, ed è per esempio il metodo consigliato per installare **Certbot** su Ubuntu.

```
sudo snap install certbot --classic
snap list
sudo snap refresh               # aggiorna (lo fa comunque da solo in automatico)
sudo snap refresh --hold        # sospende gli aggiornamenti automatici
sudo snap remove certbot
```

`--classic` installa lo snap senza il confinamento della sandbox, necessario per gli strumenti che devono accedere liberamente al sistema.

Snap è anche il formato più discusso, e le critiche hanno basi concrete:

- **Store centralizzato**: esiste un solo store, gestito da Canonical, con un server non open source. Non puoi aggiungere repository alternativi come con Flatpak.
- **Aggiornamenti automatici**: gli snap si aggiornano da soli. Si possono rimandare o sospendere, ma su un server il fatto che il software cambi senza che tu lo decida non è un dettaglio.
- **Rumore nel sistema**: ogni snap è montato come dispositivo di loop, e `df` e `lsblk` si riempiono di voci `/snap/...`.

## AppImage

Un'AppImage è un singolo file eseguibile che contiene l'applicazione e le sue dipendenze. Non si installa: lo scarichi, lo rendi eseguibile e lo lanci.

```
chmod +x Applicazione.AppImage
./Applicazione.AppImage
```

Due cose che le guide spesso non dicono. Le AppImage **non hanno una sandbox** di default: girano con tutti i permessi del tuo utente, esattamente come un binario scaricato da internet, quindi scaricale solo da fonti di cui ti fidi. Inoltre richiedono **FUSE 2**, che sulle distribuzioni recenti non è più installato di default. Su Ubuntu 24.04, per esempio, serve:

```
sudo apt install libfuse2t64
```

Non c'è nessun meccanismo di aggiornamento centrale: ogni app si aggiorna a modo suo, o scaricando a mano la nuova versione.

## Errori comuni (e come risolverli)

**"Could not get lock /var/lib/dpkg/lock-frontend".** Un altro processo sta usando APT. Quasi sempre è `unattended-upgrades` che lavora in background subito dopo l'avvio. **Non cancellare il file di lock**: aspetta qualche minuto, o controlla chi lo tiene con `ps aux | grep -E 'apt|dpkg'`. Se un'operazione precedente è stata davvero interrotta, `sudo dpkg --configure -a` rimette in ordine il database.

**"The following packages have been kept back".** `apt upgrade` non installa aggiornamenti che richiedono nuove dipendenze o rimozioni. Con `apt full-upgrade` li installi, dopo aver letto cosa propone di rimuovere. Su Ubuntu, se il messaggio parla di aggiornamenti "deferred due to phasing", non c'è niente da fare: Canonical distribuisce alcuni aggiornamenti in modo graduale, a una percentuale di macchine alla volta, e arriveranno da soli.

**"NO_PUBKEY" o "repository is not signed".** La chiave del repository manca o è scaduta. Scarica la chiave aggiornata dalla documentazione del fornitore e salvala in `/etc/apt/keyrings/`, come visto sopra, invece di usare `apt-key`.

**"Unable to locate package".** Nell'ordine: non hai lanciato `apt update` (tipico nei container, che partono con l'indice vuoto), il nome è diverso (cercalo con `apt search`), oppure il pacchetto sta in un repository non attivo, come `universe` su Ubuntu.

**"Unable to find a match" su RHEL e derivate.** Il pacchetto è quasi sempre in EPEL o in CRB, che non sono attivi di default.

**"invalid or corrupted package (PGP signature)" su Arch.** Il portachiavi è più vecchio delle chiavi con cui sono firmati i pacchetti nuovi, di solito dopo mesi senza aggiornare. Aggiorna prima il portachiavi, poi il resto: `sudo pacman -Sy archlinux-keyring && sudo pacman -Su`.

## In sintesi

I concetti sono gli stessi ovunque: repository firmati, un indice da aggiornare, dipendenze risolte in automatico e un database che sa quale file appartiene a quale pacchetto. Cambia solo la sintassi, e per quella basta la tabella sopra.

Se stai configurando un server, il passo successivo naturale è installare lo stack web: trovi la mia guida per [installare una LAMP stack su Ubuntu](/come-installare-una-lamp-stack/). Quando il disco comincia a riempirsi di cache e log, [ncdu](/ottimizzare-lo-spazio-su-disco-da-terminale-con-ncdu-una-guida-essenziale-per-i-server/) ti dice in pochi secondi dove guardare.
