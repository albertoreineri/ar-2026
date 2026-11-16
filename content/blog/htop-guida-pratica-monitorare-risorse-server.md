---
title: "htop: guida pratica per monitorare le risorse del server"
date: 2026-11-16
description: "Come leggere l'output di htop, interpretare CPU, memoria e load average, trovare il processo che sta rallentando il server e usarlo al meglio da riga di comando."
tags: ["Guide", "Linux"]
translationKey: "htop-practical-guide"
---

Il server rallenta, un sito risponde lento, un processo sembra impazzito e sta mangiando risorse. Il primo strumento che apri in questi casi, prima di qualsiasi altra diagnosi, dovrebbe essere **htop**. È interattivo, mostra tutto in tempo reale e, soprattutto, ti permette di agire subito su quello che trovi, senza dover scrivere comandi diversi per ogni informazione.

Se lavori spesso in [sessioni tmux su un server remoto](/tmux-guida-pratica-terminal-multiplexer/), htop è lo strumento perfetto da tenere aperto in un pannello dedicato mentre lavori nell'altro.

## htop vs top: perché preferirlo

Praticamente ogni sistema Linux ha `top` preinstallato: mostra processi, CPU e memoria, ma con un'interfaccia scomoda, poco leggibile e senza interazione diretta col mouse o con tasti intuitivi. **htop** fa la stessa cosa ma meglio: barre colorate per CPU e memoria, scrolling verticale e orizzontale, possibilità di ordinare le colonne con un click, e azioni immediate (kill, nice, filtro) senza uscire dalla schermata.

Non è sempre preinstallato, ma è nei repository di quasi tutte le distribuzioni:

```
sudo apt install htop    # Debian/Ubuntu
sudo dnf install htop    # Fedora, AlmaLinux, Rocky
```

Si avvia semplicemente con:

```
htop
```

## Come leggere la schermata

La prima volta che si apre htop l'informazione è tanta e può disorientare. In realtà si divide in tre zone ben distinte.

<svg class="hi-diagram" width="300" height="220" viewBox="0 0 300 220" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="10" y="10" width="280" height="60" rx="14" class="hi-fill hi-ink-stroke" stroke-width="2.5"/>
  <circle cx="30" cy="28" r="4" class="hi-accent-dot"/>
  <rect x="25" y="40" width="250" height="8" rx="4" class="hi-bar"/>
  <rect x="25" y="52" width="180" height="8" rx="4" class="hi-bar"/>

  <line x1="150" y1="78" x2="150" y2="98" class="hi-muted-stroke" stroke-width="2"/>

  <rect x="10" y="100" width="280" height="40" rx="14" class="hi-fill hi-line" stroke-width="2"/>
  <rect x="25" y="114" width="120" height="6" rx="3" class="hi-bar"/>
  <rect x="25" y="124" width="90" height="6" rx="3" class="hi-bar"/>

  <line x1="150" y1="148" x2="150" y2="168" class="hi-muted-stroke" stroke-width="2"/>

  <rect x="10" y="170" width="280" height="40" rx="14" class="hi-fill hi-line" stroke-width="2"/>
  <rect x="25" y="182" width="60" height="6" rx="3" class="hi-bar"/>
  <rect x="100" y="182" width="60" height="6" rx="3" class="hi-bar"/>
  <rect x="175" y="182" width="90" height="6" rx="3" class="hi-bar"/>
  <rect x="25" y="195" width="80" height="6" rx="3" class="hi-bar"/>
  <rect x="150" y="195" width="50" height="6" rx="3" class="hi-bar"/>
</svg>

In alto (in evidenza) le **barre di CPU e memoria**, con il pallino giallo a indicare che è la prima cosa da guardare; al centro una riga riassuntiva con **load average, uptime e numero di processi**; in basso la **lista dei processi**, ordinabile e navigabile.

### Le barre in alto

Ogni core della CPU ha la sua barra, colorata a seconda di cosa sta facendo quel tempo di CPU (processi utente, processi di sistema, I/O wait). Sotto trovi la barra della memoria RAM e, se presente, quella dello swap. Una barra di swap che si riempie è quasi sempre un segnale che il server ha poca RAM per il carico che gli viene chiesto.

### Load average

Sulla destra (o in alto a seconda del tema) trovi tre numeri tipo `0.45 0.52 0.38`: sono il **load average** calcolato su 1, 5 e 15 minuti. Rappresentano il numero medio di processi che stavano aspettando CPU in quell'intervallo. La regola pratica è confrontarli con il numero di core disponibili: un load average di 4 su un server con 4 core significa che la CPU è saturata; lo stesso valore su un server con 16 core è irrilevante.

### La lista dei processi

Ogni riga è un processo, con colonne per PID, utente, consumo di CPU (`CPU%`) e memoria (`MEM%`), tempo di esecuzione e il comando che lo ha lanciato. Di default è ordinata per consumo di CPU, quindi il processo che sta facendo più danni di solito è già in cima.

## Le scorciatoie che userai davvero

htop si controlla quasi interamente da tastiera (il mouse funziona, ma da server remoto via SSH la tastiera è più comoda):

- `F6` (o `<` `>`) — cambia la colonna di ordinamento (utile per passare da "ordina per CPU" a "ordina per memoria")
- `F9` — invia un segnale a un processo selezionato (kill, ma anche segnali più "gentili" come `SIGTERM`)
- `F5` — passa alla vista ad albero, che mostra i processi raggruppati per processo padre/figlio
- `/` — filtra la lista digitando il nome di un processo
- `u` — mostra solo i processi di un determinato utente
- `F2` — apre il menu di configurazione per aggiungere o togliere colonne, cambiare i colori, decidere cosa mostrare nelle barre in alto
- `q` — esce

## Trovare il processo che sta rallentando tutto

Il caso d'uso più comune è: il server è lento, bisogna capire perché. Il procedimento con htop è sempre lo stesso:

1. Guarda le barre in alto: è un problema di CPU, di memoria, o di swap che si sta riempiendo?
2. Ordina per la metrica giusta (`F6`, poi scegli `CPU%` o `MEM%`).
3. Guarda il processo in cima. Se il nome non ti dice nulla, premi `F5` per la vista ad albero e capisci chi lo ha lanciato (spesso un processo "anonimo" è figlio di un servizio che riconosci subito, come `php-fpm`, `mysqld` o `node`).
4. Decidi se terminarlo (`F9`, poi scegli il segnale) o se è un carico legittimo che semplicemente richiede più risorse sul server.

Un dettaglio che confonde spesso chi inizia: un processo che usa il 100% di un singolo core su un server con 8 core mostra "100%" nella colonna CPU di htop, non "12,5%". Se vuoi la percentuale rispetto alla CPU totale della macchina, tienilo a mente mentre leggi i numeri.

## Swap e memoria: capire se serve più RAM

Se la barra della memoria è quasi sempre piena e la barra dello swap cresce costantemente (non solo un picco occasionale), è il segnale più chiaro che il server ha bisogno di più RAM o che qualche servizio è configurato per usarne troppa (un caso classico: MySQL con `innodb_buffer_pool_size` impostato più alto della RAM disponibile, o un numero eccessivo di worker PHP-FPM per la memoria reale del server).

Lo swap di per sé non è un problema — un piccolo uso occasionale è normale — ma uno swap costantemente attivo rende tutto molto più lento, perché il sistema sta scambiando dati tra RAM e disco in continuazione invece di tenerli in memoria veloce.

## Configurarlo com'è comodo per te

`F2` apre un menu con diverse sezioni utili:

- **Meters** — scegli cosa mostrare nelle barre in alto (puoi aggiungere la temperatura CPU se disponibile, la banda di rete, lo spazio disco)
- **Display options** — attiva il supporto al colore, la vista ad albero di default, la percentuale del load average rispetto ai core
- **Columns** — aggiungi colonne utili come `TIME+` (tempo totale di CPU usato dal processo) o `IO_READ_RATE`/`IO_WRITE_RATE` se hai bisogno di capire chi scrive di più su disco

Le preferenze vengono salvate automaticamente in `~/.config/htop/htoprc`, quindi configuralo una volta sola per utente e server.

## Quando htop non basta

htop è perfetto per una diagnosi rapida e interattiva, ma ha un limite: mostra solo lo stato **attuale**, non la storia. Se un server è andato in crisi alle 3 di notte e tu lo controlli alle 9, htop non ti dice nulla di quello che è successo. Per quello serve monitoraggio storico (strumenti come Netdata, Prometheus+Grafana, o anche solo i log di sistema), mentre htop resta lo strumento giusto per il "cosa sta succedendo proprio ora" quando sei già collegato al server e devi capire in fretta.

## In sintesi

htop trasforma una domanda vaga come "perché il server è lento" in una risposta concreta in meno di un minuto: guardi le barre in alto per capire se il collo di bottiglia è CPU, memoria o swap, ordini la lista dei processi per isolare il colpevole, e agisci direttamente da lì se serve terminarlo. È uno degli strumenti che vale la pena avere sempre a portata di mano in una sessione SSH, magari proprio accanto a un log in tempo reale in un altro pannello di tmux.
