---
title: "Encrypt & Decrypt Text"
seoTitle: "Cifrare e decifrare testo online: AES-256 e XOR, nel browser"
description: "Uno strumento per cifrare e decifrare testo nel browser: AES-256 con password, oppure uno XOR semplice con chiave numerica. Nessun server. Open source."
date: 2026-10-06
translationKey: "project-encrypt-tool"
projectType: "Strumento · Open source"
projectLinks:
  - label: "Apri lo strumento →"
    url: "/crypt/"
  - label: "Scarica da GitHub ↗"
    url: "https://github.com/albertoreineri/encrypt-tool"
    external: true
image: "img/projects/encrypt-tool.jpg"
imageWidth: 1920
imageHeight: 1193
imageAlt: "Encrypt & Decrypt Text in modalità Password e AES-256: a sinistra il testo «Ci vediamo alle otto, porto io il caffè.» cifrato in una stringa che inizia con «aes1.», a destra la stessa stringa riportata al testo originale con la stessa password"
---

Encrypt & Decrypt Text è uno strumento piccolo con due modalità: **AES-256 con password**, per cifrare davvero, e uno **XOR con chiave numerica**, per nascondere senza fatica. Gira nel browser, e il testo non lascia il tuo computer.

- **Stato**: online dal 2024; nel 2026 ci ho aggiunto la cifratura AES
- **Costruito con**: HTML, CSS e JavaScript (jQuery, Bootstrap) e la Web Crypto API del browser
- **Licenza**: open source, GPL-3.0
- **Fatto da**: me, da solo

## A cosa serve

Ho fatto la prima versione per me. Ho dei dati che voglio tenere nascosti, ma che non sono segreti: non mi serviva la crittografia seria, mi serviva non lasciarli leggibili a colpo d'occhio. Volevo un modo semplice e veloce per farlo, nel browser, senza passare da un server e senza strutture complesse: apro la pagina, scrivo, copio il risultato. Quella era la modalità XOR, e per quell'uso basta.

Ma una domanda era inevitabile: «a cosa serve se non è sicuro?». Per chi vuole di più ho aggiunto la modalità **AES-256 con password**, che è cifratura vera. Lo XOR è rimasto com'era per due motivi: è quello pensato per l'uso che ne faccio io, e chi ha usato lo strumento prima del 6 ottobre 2026 e ha dei testi salvati può ancora recuperarli, aprendo [la modalità XOR](/crypt/#xor) e usando la stessa chiave.

## Le due modalità

### Password · AES-256

La password diventa una chiave da 256 bit con **PBKDF2** (SHA-256, 600.000 iterazioni e un sale casuale), e il testo viene cifrato con **AES-256-GCM**. Il cuore è la Web Crypto API del browser, senza librerie:

```
crypto.subtle.deriveKey(
  { name: "PBKDF2", salt, iterations: 600000, hash: "SHA-256" },
  material, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]
)
```

Il risultato è una sola stringa che inizia con `aes1.` e contiene sale, nonce e testo cifrato, in base64: si copia e si incolla senza sorprese, e funziona anche con accenti ed emoji. GCM autentica il contenuto: con una password sbagliata, o un testo modificato, la decifratura fallisce con un errore chiaro invece di restituire testo senza senso.

Il formato è standard e documentato: lo stesso testo si decifra anche con altri strumenti (l'ho provato incrociando l'implementazione AES-GCM di Node, in entrambe le direzioni).

### Chiave numerica · XOR

Ogni carattere del testo viene combinato con la chiave numerica con l'operazione **XOR** (OR esclusivo). Il cuore di tutto è questa riga:

```
String.fromCharCode(str.charCodeAt(pos) ^ key)
```

XOR è simmetrico: applicarlo due volte con la stessa chiave restituisce l'originale. Per questo cifrare e decifrare sono la stessa operazione. Se lasci la chiave vuota, lo strumento usa 1.

Tutto il JavaScript è leggibile in pochi minuti e non fa nessuna chiamata di rete.

## Quanto è sicuro

**Modalità AES**: entro i suoi limiti, sì. AES-256-GCM è un cifrario standard e molto studiato, e il punto debole è sempre la password: una corta o comune si indovina, quindi serve una frase lunga, da conservare in un posto sicuro. Non c'è recupero: se perdi la password, il testo è perso. E come ogni strumento che gira nel browser, si fida del codice che la pagina ti serve. Per dati davvero sensibili meglio uno strumento verificato, che usi sul tuo computer: [age](https://age-encryption.org/) o [GnuPG](https://gnupg.org/).

**Modalità XOR**: per niente, e non vuole esserlo. Uno XOR con un solo numero è **offuscamento**, non crittografia: chiunque sappia come funziona può provare tutte le chiavi in una frazione di secondo. Va bene per nascondere uno spoiler, un indovinello o un appunto a uno sguardo distratto.

## Come si usa

Scegli la modalità con le due schede in alto. In modalità AES scrivi il testo nella colonna **Encrypt**, inserisci una password e premi **Encrypt**. Per tornare al testo originale incolla la stringa `aes1.…` nella colonna **Decrypt**, inserisci la stessa password e premi **Decrypt**. Ogni risultato ha un pulsante per copiarlo negli appunti.

## Dove si trova

Lo strumento è online su [albertoreineri.it/crypt](/crypt/), e il codice è su [GitHub](https://github.com/albertoreineri/encrypt-tool): è solo HTML, CSS e JavaScript, quindi basta scaricare il repository e aprire `index.html`. Puoi ospitarlo dove vuoi. Le pull request sono benvenute.
