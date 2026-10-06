---
title: "Encrypt & Decrypt Text"
seoTitle: "Cifrare e decifrare testo online: Encrypt & Decrypt Text"
description: "Un piccolo strumento per cifrare e decifrare testo con una chiave numerica, nel browser. Un XOR semplice, non crittografia seria. Open source (GPL-3.0)."
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
imageHeight: 1046
imageAlt: "Encrypt & Decrypt Text: a sinistra il testo «Ci vediamo alle otto, porto io il caffe.» cifrato con la chiave 21, a destra il testo cifrato riportato com'era con la stessa chiave"
---

Encrypt & Decrypt Text è uno strumento minuscolo che fa una cosa sola: scrivi un testo, scegli una chiave numerica e ottieni il testo cifrato. Con la stessa chiave lo riporti com'era. Gira nel browser, e il testo non lascia il tuo computer.

- **Stato**: online dal 2024, e fa quello che deve
- **Costruito con**: HTML, CSS e JavaScript (jQuery), con Bootstrap
- **Licenza**: open source, GPL-3.0
- **Fatto da**: me, da solo

## A cosa serve

L'ho fatto per me. Ho dei dati che voglio tenere nascosti, ma che non sono segreti: non mi serve la crittografia seria, mi serve non lasciarli leggibili a colpo d'occhio. Volevo un modo semplice e veloce per farlo, nel browser, senza passare da un server e senza strutture complesse: apro la pagina, scrivo, copio il risultato.

Se la domanda è «a cosa serve se non è sicuro?», la risposta è questa: serve a nascondere, non a proteggere.

## Come funziona

Ogni carattere del testo viene combinato con la chiave numerica con l'operazione **XOR** (OR esclusivo). Il cuore di tutto è questa riga:

```
String.fromCharCode(str.charCodeAt(pos) ^ key)
```

XOR è simmetrico: applicarlo due volte con la stessa chiave restituisce l'originale. Per questo cifrare e decifrare sono la stessa operazione, e per decifrare serve esattamente la stessa chiave. Se lasci la chiave vuota, lo strumento usa 1.

Il JavaScript è di circa settanta righe, e si legge in pochi minuti. Non fa nessuna chiamata di rete.

## Quanto è sicuro

Per niente, e non vuole esserlo. Uno XOR con un solo numero è **offuscamento**, non crittografia: chiunque sappia come funziona può provare tutte le chiavi in una frazione di secondo. Va bene per nascondere uno spoiler, un indovinello o un appunto a uno sguardo distratto, e per vedere in pratica come funziona lo XOR.

Per password o dati che contano serve crittografia vera: un password manager, oppure strumenti come [age](https://age-encryption.org/) o [GnuPG](https://gnupg.org/).

## Come si usa

Scrivi il testo nella colonna **Encrypt**, scegli una chiave numerica e premi **Crypt**. Per tornare al testo originale, incolla il risultato nella colonna **Decrypt**, inserisci la stessa chiave e premi **Decrypt**. Ogni risultato ha un pulsante per copiarlo negli appunti.

{{< youtube nFo4QFugNA8 >}}

## Dove si trova

Lo strumento è online su [albertoreineri.it/crypt](/crypt/), e il codice è su [GitHub](https://github.com/albertoreineri/encrypt-tool): è solo HTML, CSS e JavaScript, quindi basta scaricare il repository e aprire `index.html`. Puoi ospitarlo dove vuoi. Le pull request sono benvenute.
