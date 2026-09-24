---
title: "Nano: guida pratica all'editor di testo da terminale"
seoTitle: "Nano: comandi e scorciatoie da terminale"
date: 2022-06-27
lastmod: 2026-09-24
description: "Guida pratica a nano: aprire, salvare e uscire, cercare e sostituire, copia e incolla, le scorciatoie essenziali, il file .nanorc e gli errori più comuni."
tags: ["Guide", "Linux"]
translationKey: "nano-editor-guide"
---

Prima o poi, su un server, ti trovi davanti a un file di configurazione da modificare e nessuna interfaccia grafica. Su quasi ogni distribuzione [Linux](/tags/linux/) il primo editor che trovi è **nano**: leggero, preinstallato quasi ovunque e con le scorciatoie scritte in fondo allo schermo, così non resti bloccato dentro come succede la prima volta con Vim.

Uso Vim da anni, eppure per una modifica veloce a un `sshd_config` o a un virtual host apro ancora nano. In questa guida trovi quello che serve davvero: aprire, salvare e uscire, le scorciatoie che uso ogni giorno, come configurarlo con `.nanorc` e gli errori in cui prima o poi incappano tutti.

## Nano in breve

Nano è un editor di testo da terminale rilasciato sotto licenza GNU GPL, nato come clone libero di **Pico**. Non ha modalità come Vim: apri il file e scrivi. Tutti i comandi sono combinazioni di tasti, e le principali sono sempre visibili nelle due righe in fondo.

Nella barra in basso trovi due simboli:

- `^` significa **Ctrl**: `^O` vuol dire `Ctrl + O`.
- `M-` significa **Meta**, cioè il tasto **Alt** (su Mac, Option: vedi [gli errori comuni](#errori-comuni-e-come-uscirne)): `M-U` vuol dire `Alt + U`.

## Installare nano

Controlla prima se è già installato:

```
nano --version
```

Se non c'è, installalo con il gestore di pacchetti della tua distribuzione (se non hai chiaro cosa siano, ho scritto una [guida alla gestione dei pacchetti in Linux](/gestione-dei-pacchetti-in-linux-cosa-sono-e-come-funzionano/)):

```
# Debian, Ubuntu e derivate
sudo apt install nano

# Fedora, RHEL, Rocky, AlmaLinux
sudo dnf install nano

# Arch Linux
sudo pacman -S nano

# Alpine (tipico nei container Docker)
apk add nano

# macOS
brew install nano
```

Su macOS la nota è d'obbligo: dalle versioni recenti il comando `nano` di sistema è in realtà un collegamento a **pico**, che non legge `.nanorc` e non ha la maggior parte delle funzioni descritte qui. Con Homebrew installi il vero GNU nano.

## Aprire, salvare e uscire

Per aprire un file (o crearlo, se non esiste):

```
nano nomefile.txt
```

Alcune varianti che uso spesso:

```
nano +42 config.php      # apre il file con il cursore alla riga 42
nano -l nginx.conf       # mostra i numeri di riga
nano -v /var/log/syslog  # sola lettura: niente modifiche accidentali
```

Una volta dentro:

- **Salvare**: `Ctrl + O`, poi `Invio` per confermare il nome del file. Nelle versioni recenti c'è anche `Ctrl + S`, che salva senza chiedere niente.
- **Uscire**: `Ctrl + X`. Se ci sono modifiche non salvate, nano chiede se salvarle: `Y` per sì, `N` per uscire senza salvare, `Ctrl + C` per annullare e restare nel file.

### Modificare file di sistema: meglio `sudoedit`

Per modificare un file in `/etc` il riflesso è scrivere `sudo nano /etc/...`. Funziona, ma così l'editor gira interamente come root. L'alternativa più pulita è:

```
sudoedit /etc/ssh/sshd_config
```

`sudoedit` (equivalente a `sudo -e`) copia il file in una posizione temporanea, lo apre con il tuo editor **come utente normale**, con la tua configurazione, e al salvataggio lo rimette al suo posto con i permessi giusti. Usa l'editor indicato nella variabile `SUDO_EDITOR`, `VISUAL` o `EDITOR`: se nano non si apre, trovi come impostarlo più sotto.

## Cercare e sostituire

- `Ctrl + W` apre la ricerca: scrivi il testo e premi `Invio`.
- `Alt + W` va all'occorrenza successiva, `Alt + Q` a quella precedente.
- `Ctrl + \` (oppure `Alt + R`) apre la sostituzione: nano chiede il testo da cercare, poi quello con cui sostituirlo. A ogni occorrenza premi `Y` per sostituire, `N` per saltarla o `A` per sostituirle tutte.

Nel prompt di ricerca, `Alt + R` attiva le **espressioni regolari** e `Alt + C` rende la ricerca sensibile a maiuscole e minuscole. Per esempio `^#?Port ` con le regex attive trova la riga della porta in `sshd_config`, commentata o no.

## Selezionare, copiare e incollare

Il copia-incolla in nano non usa `Ctrl + C` / `Ctrl + V`, e all'inizio confonde tutti:

1. Porta il cursore all'inizio del testo e premi `Alt + A` (o `Ctrl + 6`) per iniziare la selezione.
2. Muovi il cursore fino alla fine del testo che ti serve.
3. Premi `Alt + 6` per **copiare** oppure `Ctrl + K` per **tagliare**.
4. Porta il cursore dove vuoi incollare e premi `Ctrl + U`.

Senza selezione, `Ctrl + K` taglia l'intera riga su cui si trova il cursore. Premuto più volte di fila, accumula le righe: è il modo più rapido per spostare un blocco.

Se invece vuoi incollare testo che arriva **da fuori** (dal browser, per esempio), usa l'incolla del terminale: `Ctrl + Shift + V` su Linux, `Cmd + V` su Mac.

## Le scorciatoie da tenere a portata

Questa è la tabella che terrei stampata accanto al monitor. `Ctrl + G` apre comunque l'help completo, direttamente dentro nano.

| Scorciatoia | Azione |
|---|---|
| `Ctrl + O` | Salva (chiede conferma del nome) |
| `Ctrl + S` | Salva senza chiedere |
| `Ctrl + X` | Esci |
| `Ctrl + G` | Help con tutti i comandi |
| `Ctrl + W` | Cerca |
| `Alt + W` / `Alt + Q` | Occorrenza successiva / precedente |
| `Ctrl + \` | Cerca e sostituisci |
| `Ctrl + _` | Vai a una riga (e colonna) specifica |
| `Ctrl + A` / `Ctrl + E` | Inizio / fine della riga |
| `Ctrl + Y` / `Ctrl + V` | Pagina su / pagina giù |
| `Alt + \` / `Alt + /` | Inizio / fine del file |
| `Ctrl + C` | Mostra la posizione del cursore (riga e colonna) |
| `Alt + A` | Inizia una selezione |
| `Alt + 6` | Copia la riga o la selezione |
| `Ctrl + K` | Taglia la riga o la selezione |
| `Ctrl + U` | Incolla |
| `Alt + U` / `Alt + E` | Annulla / ripeti |
| `Alt + 3` | Commenta o decommenta la riga o la selezione |
| `Alt + }` / `Alt + {` | Aumenta / riduci l'indentazione |
| `Alt + N` | Mostra o nasconde i numeri di riga |
| `Ctrl + R` | Inserisce il contenuto di un altro file |
| `Ctrl + J` | Giustifica il paragrafo |

`Alt + 3` da solo vale l'articolo: per disattivare al volo un blocco di configurazione lo selezioni e lo commenti in un colpo, con il carattere di commento giusto per quel tipo di file.

## Configurare nano con `.nanorc`

Le impostazioni predefinite sono spartane. Il file `~/.nanorc` (per il tuo utente) o `/etc/nanorc` (per tutto il sistema) le cambia in modo permanente. Questa è una base ragionevole:

```
set linenumbers          # numeri di riga sempre visibili
set constantshow         # posizione del cursore sempre nella barra di stato
set indicator            # barra di scorrimento laterale
set autoindent           # mantiene l'indentazione della riga precedente
set tabsize 4
set tabstospaces         # spazi al posto dei tab (vedi YAML più sotto)
set mouse                # clic per posizionare il cursore e selezionare
set backup               # tiene una copia del file prima di salvarlo
set backupdir "~/.cache/nano/backups"

# evidenziazione della sintassi
include "/usr/share/nano/*.nanorc"
```

Due precisazioni. La cartella di `backupdir` deve esistere (`mkdir -p ~/.cache/nano/backups`), altrimenti nano non riesce a salvare il backup. Il percorso dei file di sintassi cambia da sistema a sistema: con Homebrew su Mac Apple Silicon è `/opt/homebrew/share/nano/*.nanorc`. Su Debian e Ubuntu spesso l'`include` è già presente in `/etc/nanorc`.

### Nano come editor predefinito

Molti programmi (`git commit`, `crontab -e`, `visudo`, `sudoedit`) aprono l'editor indicato dalle variabili `VISUAL` ed `EDITOR`. Per usare nano, aggiungi al tuo `~/.bashrc` o `~/.zshrc`:

```
export EDITOR=nano
export VISUAL=nano
```

Su Debian e Ubuntu puoi anche scegliere l'editor di sistema con `sudo update-alternatives --config editor`. Per Git c'è l'impostazione dedicata:

```
git config --global core.editor nano
```

## Errori comuni (e come uscirne)

**"Error writing ...: Permission denied" al salvataggio.** Hai aperto un file di sistema senza `sudo` e hai già fatto tutte le modifiche. Non uscire e non perdere il lavoro: premi `Ctrl + O`, cambia il nome in `/tmp/nomefile` e salva lì. Poi copialo al suo posto con `sudo cp /tmp/nomefile /percorso/originale`. La prossima volta usa `sudoedit`.

**Le scorciatoie con Alt non funzionano su Mac.** Il Terminale di macOS non invia il tasto Option come Meta. In *Terminale → Impostazioni → Profili → Tastiera* attiva "Usa Opzione come tasto Meta". Su iTerm2 imposta il tasto Option sinistro su "Esc+". In alternativa, premi e rilascia `Esc` e poi la lettera: `Esc`, `U` equivale ad `Alt + U`.

**YAML che non viene letto dopo la modifica.** YAML non accetta i tab per l'indentazione. Se modifichi un `docker-compose.yml` o un playbook Ansible con nano impostato sui tab, il file si rompe senza che si veda nulla a schermo. `set tabstospaces` nel `.nanorc` (o l'opzione `-E`) risolve alla radice. Attenzione al caso opposto: i `Makefile` vogliono proprio i tab.

**Righe lunghe spezzate in due.** Le versioni vecchie di nano, per esempio quelle ancora in giro su CentOS 7, andavano a capo da sole inserendo veri ritorni a capo, cosa letale in un file di configurazione. Sulle versioni vecchie apri i file con `nano -w`. Da nano 4.0 questo comportamento è disattivato di default. Se una riga lunga ti dà fastidio a schermo, `Alt + S` attiva l'a capo solo visivo, che non modifica il file.

**Un file con i caratteri `^M` o "Converted from DOS format".** Il file ha le terminazioni di riga di Windows (CRLF). Nano le converte in lettura. Al salvataggio, nel prompt di `Ctrl + O`, `Alt + D` sceglie se riscriverlo in formato DOS o Unix. Per script shell e configurazioni vuoi Unix.

**Terminale bloccato dopo `Ctrl + S`.** Succede su sistemi o terminali datati con il controllo di flusso XON/XOFF attivo: `Ctrl + S` congela l'output invece di salvare. `Ctrl + Q` sblocca. Poi salva con `Ctrl + O`.

**"Sono dentro un editor e non riesco a uscire".** Se in basso vedi le scorciatoie, sei in nano: `Ctrl + X`. Se non vedi niente e in fondo c'è solo `~` su ogni riga, sei in Vim: premi `Esc` e poi scrivi `:q!` e `Invio` per uscire senza salvare.

## Nano o Vim?

Non è una gara. Nano è la scelta giusta per modifiche puntuali: un parametro in un file di configurazione, una riga nel crontab, un messaggio di commit. Quando passi ore dentro un file, o devi fare modifiche ripetitive su molte righe, Vim (o un editor vero via SSH, come VS Code Remote) ripaga il tempo che ci metti a impararlo.

Anche da utente Vim, però, conoscere bene nano serve: è quasi sempre installato, anche nel container minimale o sul server di un cliente dove non puoi installare niente. Se lavori spesso su server remoti, ti possono servire anche la mia [introduzione a SSH](/introduzione-a-ssh-cose-e-come-funziona/) e la guida a [ncdu per analizzare lo spazio su disco](/ottimizzare-lo-spazio-su-disco-da-terminale-con-ncdu-una-guida-essenziale-per-i-server/).
