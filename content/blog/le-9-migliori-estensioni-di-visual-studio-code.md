---
title: "Le migliori estensioni di VS Code nel 2026 (e quelle che non servono più)"
seoTitle: "Le migliori estensioni di VS Code nel 2026"
date: 2023-10-29
lastmod: 2026-09-24
description: "Le estensioni di VS Code che uso davvero nel 2026: qualità del codice, Git, sviluppo remoto via SSH e container, PHP e AI, più quelle ormai integrate."
tags: ["Web Dev"]
translationKey: "vscode-extensions"
---

La prima versione di questo articolo consigliava Bracket Pair Colorizer, Debugger for Chrome e Auto Rename Tag. Oggi sono tutte e tre inutili: le loro funzioni sono **integrate in VS Code** e l'estensione, nel migliore dei casi, duplica qualcosa che hai già.

È il motivo per cui ho riscritto la lista da capo. Le estensioni non sono gratis: ognuna rallenta un po' l'avvio, consuma memoria e **gira con tutti i permessi del tuo utente**. La regola che seguo è installare solo quello che uso ogni settimana, e controllare ogni tanto se l'editor non fa già la stessa cosa da solo.

## Prima di installare: quello che VS Code fa già

Queste impostazioni sostituiscono tre o quattro estensioni che trovi ancora in quasi tutte le liste. Aprile con `Ctrl + Shift + P` → "Preferences: Open User Settings (JSON)":

```
{
  "editor.bracketPairColorization.enabled": true,
  "editor.guides.bracketPairs": "active",
  "editor.linkedEditing": true,
  "editor.stickyScroll.enabled": true,
  "editor.formatOnSave": true,
  "files.trimTrailingWhitespace": true,
  "files.insertFinalNewline": true
}
```

- **Parentesi colorate** (`bracketPairColorization`): è ciò che faceva Bracket Pair Colorizer, ma nativo e molto più veloce. L'estensione è stata deprecata dal suo stesso autore.
- **Rinomina del tag di chiusura** (`linkedEditing`): modifichi `<div>` e `</div>` si aggiorna da solo. È ciò che faceva Auto Rename Tag, per HTML e JSX.
- **Debug JavaScript nel browser**: il debugger integrato gestisce Chrome ed Edge da anni. Debugger for Chrome è deprecato.
- **Sticky scroll**: tiene in cima allo schermo la firma della funzione o della classe in cui ti trovi. Sui file lunghi è più utile di qualunque estensione.

## Qualità del codice

### [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)

Mostra gli errori di ESLint mentre scrivi e può correggerli al salvataggio. Da ESLint 9 la configurazione è nel formato *flat* (`eslint.config.js`): se l'estensione non segnala niente in un progetto nuovo, la causa è quasi sempre una configurazione nel vecchio formato `.eslintrc`.

### [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

Formatta JavaScript, TypeScript, CSS, HTML, JSON, YAML e Markdown secondo regole fisse, così nel team non si discute più di virgole e indentazione. Impostalo come formattatore predefinito e lascia che lavori al salvataggio:

```
{
  "editor.defaultFormatter": "esbenp.prettier-vscode"
}
```

Se parti da zero su un progetto JavaScript, guarda anche [Biome](https://marketplace.visualstudio.com/items?itemName=biomejs.biome): fa sia da linter che da formattatore, con un solo file di configurazione, ed è molto più veloce. Su progetti esistenti con ESLint e Prettier già configurati non vale la pena cambiare.

### [Error Lens](https://marketplace.visualstudio.com/items?itemName=usernamehw.errorlens)

Mostra errori e avvisi direttamente sulla riga, invece di costringerti a passare il mouse sulla sottolineatura. Sembra poco, ma cambia il modo in cui leggi il codice: gli errori li vedi mentre scrivi, non quando apri il pannello dei problemi.

### [EditorConfig](https://marketplace.visualstudio.com/items?itemName=EditorConfig.EditorConfig)

Legge il file `.editorconfig` del progetto e applica le regole su indentazione, fine riga e charset. Il valore sta nel fatto che il file vale per tutti gli editor, non solo per VS Code: il collega che usa PhpStorm o Vim rispetta le stesse regole.

### [Code Spell Checker](https://marketplace.visualstudio.com/items?itemName=streetsidesoftware.code-spell-checker)

Un controllo ortografico che capisce il codice: separa `camelCase` e `snake_case` e controlla le singole parole. Trova refusi nei nomi di variabili, nei commenti e nei testi dell'interfaccia prima che finiscano in produzione. Per i progetti in italiano aggiungi il [dizionario italiano](https://marketplace.visualstudio.com/items?itemName=streetsidesoftware.code-spell-checker-italian).

## Git

### [GitLens](https://marketplace.visualstudio.com/items?itemName=eamodio.gitlens)

Mostra accanto a ogni riga chi l'ha modificata, quando e in quale commit, e permette di navigare la storia di un file senza uscire dall'editor. È la prima cosa che guardo quando devo capire *perché* un pezzo di codice è scritto in un certo modo. Alcune funzioni avanzate, come il grafico dei commit completo o le funzioni per i team, richiedono un abbonamento. Per l'uso quotidiano basta la parte gratuita.

Se ti interessa soprattutto il grafico dei branch, [Git Graph](https://marketplace.visualstudio.com/items?itemName=mhutchie.git-graph) è un'alternativa più leggera e gratuita.

## Sviluppo remoto e container

Queste sono le estensioni che mancavano del tutto nella vecchia versione dell'articolo, e sono quelle che uso di più.

### [Remote - SSH](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-ssh)

Apre una cartella su un server remoto come se fosse locale: esplora file, terminale integrato, ricerca, estensioni, tutto gira sul server. Legge il tuo `~/.ssh/config`, quindi gli host che hai già configurato compaiono da soli. Per mettere le mani sulla configurazione di un server o fare debug su una macchina di staging, è molto più comodo che editare file uno alla volta via terminale. Per le modifiche al volo resta comunque utile [conoscere nano](/nano-editor-guida-per-principianti/).

### [Dev Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)

Definisci l'ambiente di sviluppo in un file `.devcontainer/devcontainer.json` (immagine Docker, versione di PHP o Node, estensioni necessarie) e VS Code apre il progetto dentro quel container. Chi clona il repository ottiene lo stesso ambiente in un clic, senza installare niente sulla propria macchina. Per i progetti con più persone, o per i vecchi progetti che richiedono versioni vecchie di PHP, è la soluzione più pulita che conosco.

## Linguaggi

### [PHP Intelephense](https://marketplace.visualstudio.com/items?itemName=bmewburn.vscode-intelephense-client)

Il supporto PHP integrato in VS Code è minimo. Intelephense aggiunge autocompletamento vero, navigazione verso le definizioni, ricerca dei riferimenti e analisi degli errori su tutto il progetto, `vendor` compreso. Dopo averlo installato, disattiva l'estensione integrata "PHP Language Features" per non avere suggerimenti doppi. Alcune funzioni, come la rinomina dei simboli, sono nella versione a pagamento, che costa poco e si paga una volta sola.

### [YAML](https://marketplace.visualstudio.com/items?itemName=redhat.vscode-yaml)

Validazione e autocompletamento per i file YAML basati su schema: `docker-compose.yml`, workflow di GitHub Actions, manifest Kubernetes. Trova l'indentazione sbagliata o la chiave scritta male prima che te lo dica la pipeline fallita.

## Assistenti AI

Nel 2026 un assistente AI nell'editor è diventato normale. Quelli che vale la pena conoscere:

- **[GitHub Copilot](https://marketplace.visualstudio.com/items?itemName=GitHub.copilot)**: il più integrato in VS Code, con completamento inline, chat e modalità agente che modifica più file. Ha un piano gratuito con limiti mensili, sufficiente per capire se fa per te.
- **[Claude Code](https://marketplace.visualstudio.com/items?itemName=anthropic.claude-code)**: l'estensione ufficiale di Anthropic. Lavora sul progetto intero: legge il codice, propone modifiche su più file che rivedi come diff, lancia comandi nel terminale.
- **[Continue](https://marketplace.visualstudio.com/items?itemName=Continue.continue)**: open source, ti permette di usare il modello che vuoi, compresi modelli locali tramite Ollama. È l'opzione giusta quando il codice non può uscire dalla tua macchina.

Due avvertenze da chi li usa ogni giorno. Il codice che invii a un servizio esterno esce dalla tua macchina: prima di usarli su progetti di clienti, verifica cosa prevede il contratto. E il codice generato va letto come quello di un collega junior molto veloce: spesso giusto, a volte sbagliato con grande sicurezza.

## Estetica

### [Material Icon Theme](https://marketplace.visualstudio.com/items?itemName=PKief.material-icon-theme)

Icone diverse per ogni tipo di file e per le cartelle più comuni (`src`, `tests`, `config`, `.github`). Non rende più produttivi, ma trovare il file giusto nell'albero a colpo d'occhio è piacevole. Se cerchi anche un tema di colori, ho raccolto [i migliori temi per VS Code](/i-migliori-temi-per-visual-studio-code/).

## Quelle che ho tolto

- **Bracket Pair Colorizer**, **Auto Rename Tag** e **Debugger for Chrome**: sostituite da funzioni native, come visto sopra.
- **Live Server**: comoda per un file HTML statico, ma poco mantenuta. Per HTML semplice c'è [Live Preview](https://marketplace.visualstudio.com/items?itemName=ms-vscode.live-server) di Microsoft. In un progetto moderno il ricaricamento automatico lo fa già il tuo tool di build, per esempio Vite.

## Usa i profili

I **profili** di VS Code (`Ctrl + Shift + P` → "Profiles: New Profile") permettono di avere set di estensioni e impostazioni separati: uno per PHP, uno per il frontend, uno minimale per scrivere documentazione. Ogni progetto carica solo quello che serve, e l'editor resta veloce.

Per portarti dietro la configurazione su un'altra macchina c'è il Settings Sync integrato. Se preferisci qualcosa da mettere in un repository di dotfile:

```
code --list-extensions > extensions.txt
cat extensions.txt | xargs -L 1 code --install-extension
```

## Una nota sulla sicurezza

Un'estensione di VS Code è codice che gira con i permessi del tuo utente: può leggere i tuoi file, le chiavi SSH, i file `.env`. Nel Marketplace sono state trovate più volte estensioni malevole che imitavano quelle popolari. Prima di installare, controlla l'editore (il segno di spunta indica un editore verificato), il numero di installazioni e la data dell'ultimo aggiornamento. E ogni tanto apri la lista delle estensioni installate e disinstalla quelle che non usi più.
