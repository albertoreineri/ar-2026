---
title: "Rimuovere Virus da WordPress"
date: 2019-09-01
description: "WordPress è una delle piattaforme più utilizzate la mondo per la creazione di siti web ma a volte può essere facile imbattersi in un virus, ma come si possono rimuovere? WordPRess permette a…"
tags: ["Guide", "WordPress Tricks"]
---

WordPress è una delle piattaforme **più utilizzate la mondo** per la **creazione di siti web ma a volte può essere facile imbattersi in un virus, ma come si possono rimuovere?**

WordPRess permette a chiunque di **tirar su un sito internet** funzionante** in pochissimo tempo** e con **costi molto bassi.**

Questo però significa anche avere **moltissimi siti web creati da estranei ai lavori **che installato temi e plugin *a caso* senza sapere realmente cosa stanno facendo… Finché il sito è piccolino e con un numero esigui di utenti non c’è problema, quando invece raggiunge una audience più alta allora** la probabilità di essere bersagliati da qualche hacker diventa elevata.**

Si stima che almeno **il 30% dei siti web in WordPress abbia delle vulnerabilità.** Se pensiamo che **più di 75 milioni di siti web utilizzano questa piattaforma** allora le vulnerabilità sono moltissime.

Vedremo ora come** mantenere al sicuro il proprio sito WordPress e come eliminare eventuali virus.**

## Mettere in sicurezza WordPress

WordPress utilizza un sistema molto intelligente di **temi e plugin**, ma occorre **fare attenzione a ciò che si installa.**

Esistono alcune **regole fondamentali:**

- **Controllo sulla provenienza di temi e plugin**
- **Installare il minor numero di plugin possibili**
- **Avere un buon hosting**

### 1. Controllo sulla provenienza di temi e plugin

Ogni volta che si installa qualcosa su un sito in WordPress si va ad inserire del codice sul proprio progetto. Questo codice se ben scritto porterà funzionalità utili e migliorerà il sito, se invece è scritto male o contiene **bug** può causare molti problemi.

Quando si installa qualcosa su WordPress bisogna fare **molta molta attenzione alla fonte.**

**MAI** installare plugin o temi scaricati da **fonti non chiare.**

La cosa migliore è attenersi alla **repository ufficiale di WordPress** oppure ai grandi store garantiti.

### 2. Installare il minor numero di plugin possibili

Esistono plugin per ogni cosa ormai, ma **ogni plugin è un oggetto in più da gestire e mantenere.**

Avere plugin specifici per funzionalità pressoché inutili rischia di portarci **falle nel sistema**, oltre che appesantire inutilmente il sito.

Installare 20 plugin gestiti da sviluppatori diversi aumenta notevolmente il rischio di attacchi. Se uno di questi sviluppatori non corregge un bug oppure viene scoperta una falla, allora è a rischio l’intero sito.

***Il trucco è questo: “Pochi ma buoni”.***

### 3. Avere un buon hosting

Parliamo di hosting e non di server perché la stragrande maggioranza dei siti web è ospitata su hosting condiviso.

Questi servizi sono **migliorati moltissimo **e offrono servizi che in passato erano disponibili solamente sui server dedicati, come accessi **SSH**, **cache** e **sicurezza**.

Poter contare su un buon servizio è molto importante per **proteggersi dagli attacchi e gestirli** nel malaugurato caso in cui si venga infettati.

## Rimuovere un virus da un sito WordPress

**Non c’è un modo unico per rimuovere un virus,** perché questi agiscono in maniera molto diversa gli uni dagli altri.

Questo complica un pochino le cose… È difficile quindi spiegare come rimuovere un virus in un semplice articolo, ma cercherò di **indicare alcune vie per gestire il problema**

### 1. Cercare backup precedenti all’attacco

Se avete un buon hosting sicuramente avrete anche dei **backup giornalieri o almeno settimanali**. La prima cosa da fare è scaricarsi uno si questi backup e tenerlo da parte, per **avere una situazione “*****pre-virus*****“.**

Se il sito è **statico**, senza sezioni aggiornabili come blog o portfolio allora si può semplicemente ripristinare il backup alla versione pre-attacco e il gioco è fatto.

Se invece il sito ha subito **aggiornamenti** che non si vogliono perdere allora conviene tenersi una copia pre-virus per sicurezza e andare a cercare i file infetti.

### 2. Scansionare sito web con tool online

Esistono molti tool online in grado di analizzare il sito e individuare le criticità.

Si possono anche utilizzare alcuni plugin sviluppati per gestire la sicurezza, come **WordFence** o **Sucuri** e utilizzare il loro scan per analizzare tutti i file sul sito.

Questi non garantiscono un risultato ottimale al 100%, ma è comunque un buon punto di partenza.

Ecco una serie di link utili per effettuare le scansioni:

- <https://wpsec.com/>
- [https://sitecheck.sucuri.net/](https://sitecheck.sucuri.net/%E2%80%A8)
- [https://hackertarget.com/wordpress-security-scan/](https://hackertarget.com/wordpress-security-scan/%E2%80%A8)
- [https://wprecon.com/](https://wprecon.com/%E2%80%A8)
- <https://firstsiteguide.com/tools/free-fsg/wordpress-security-online-scanner/>

Se ve la cavate con la CLI potete anche utilizzare [WP Scan](https://wpscan.org/), il software per eccellenza per testare la sicurezza di un sito in WordPress.

### Disattivare Temi e Plugin

Per cercare di **isolare** il **virus** può essere utile procedere con la **disattivazione** di temi a plugin.

Se il sito senza plugin e con il tema di default di WordPress funziona allora si possono riattivare uno ad uno e capire dove si trova l’infezione.

### Copiare i file originali di temi e plugin

**ATTENZIONE!!!** Fai molta attenzione nel mettere in pratica questo punto, se non sei esperto potresti fare più danni di quelli già presenti!Se un tema o un plugin è stato infettato una soluzione per rimuovere il virus dal sito WordPress è quella di **sovrascrivere le cartelle contenenti il tema e i plugin** con le versioni scaricate dalle fonti ufficiali.

In questo caso se il virus era presente nella cartella verrà sovrascritto.

### Analizzare struttura WordPress

In ultima battuta si può** analizzare la struttura di file e cartelle di WordPress** per controllare che non ci siano file strani, non presenti nell’installazione originale.

Se si trovano file **strani** allora bisogna cancellarli, sempre prestando molta attenzione a ciò che si sta facendo.

## **Conclusione**

Questi sono alcuni passaggi **generici** da effettuare per controllare lo stato di un sito web.

Purtroppo **ogni virus è differente**, alcuni agiscono sul database, altri direttaemnte nei file di sistema, altri ancora in modi che non ci immaginiamo nemmeno.

In questo articolo ho provato a darti **alcuni consigli di base **da mettere in pratica per provare a rimuovere un virus da un **sito in WordPress.**

Se nessuno di questi ha funzionato ti consiglio di **rivolgerti ad un professionista.**

Se **hai un sito web hackerato e vuoi una consulenza o un intervento professionale **volto alla rimozione e alla messa in sicurezza del suo sito contattami tramite la pagina [contatti](https://albertoreineri.it/contatti)
