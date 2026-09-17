---
title: "Come abilitare gli aggiornamenti automatici in WordPress per le Major Release"
date: 2021-02-19
description: "Sapevi che WordPress include aggiornamenti automatici abilitati per le versioni minori? Ciò significa che il team di WordPress.org può installare automaticamente gli aggiornamenti di sicurezza…"
tags: ["Guide", "WordPress Tricks"]
---

Sapevi che WordPress include **aggiornamenti automatici** abilitati per le versioni minori? Ciò significa che il team di WordPress.org può **installare automaticamente gli aggiornamenti di sicurezza** senza richiedere nulla dell’utente.

Tuttavia, **non aggiorna automaticamente il tuo sito Web quando è disponibile una nuova versione del sistema**. A meno che tu non faccia parte di un servizio di hosting WordPress gestito , dovrai avviare manualmente l’aggiornamento da solo.

In questo articolo, ti mostreremo come a**bilitare facilmente gli aggiornamenti automatici anche per le major release.**

## Come funzionano gli aggiornamenti automatici di WordPress

WordPress ha introdotto la funzione di aggiornamento automatico in WordPress 3.7 (24 ottobre 2013). Ciò ha permesso a WordPress di installare automaticamente le nuove versioni minori per migliorare la sicurezza del tuo sito web.

C’è un’opzione per disabilitare gli aggiornamenti automatici in WordPress. Tuttavia, ti consigliamo di **mantenere abilitati gli aggiornamenti automatici **perché in genere risolvono importanti problemi di sicurezza e vulnerabilità.

I provider di hosting WordPress gestiti aggiornano automaticamente WordPress per tutte le nuove versioni, non solo per quelle minori.

Ora, se gestisci solo uno o due siti Web WordPress, puoi aggiornarli manualmente senza grossi problemi.

D’altra parte, **se gestisci più siti WordPress**, l’aggiornamento di tutti questi può richiedere molto tempo.

Diamo un’occhiata a come impostare facilmente gli aggiornamenti automatici per le principali versioni di WordPress.

## Preparazione agli aggiornamenti automatici in WordPress

Il livello più importante di sicurezza che è possibile aggiungere a qualsiasi sito Web è la configurazione di un sistema di **backup**. Che tu attivi gli aggiornamenti automatici o meno, dovresti sempre avere un sistema di backup automatico in atto per ogni sito Web WordPress.

Esistono diversi plug-in di backup WordPress utili che puoi utilizzare per impostare backup automatici sul tuo sito WordPress.

Ti consigliamo di utilizzare il plug-in <a href="https://it.wordpress.org/plugins/updraftplus/" target="_blank" rel="noreferrer noopener">UpdraftPlus </a>perché è il plug-in di WordPress più popolare sul mercato ed è gratuito. **UpdraftPlus **consente di impostare facilmente backup automatici dell’intero sito Web WordPress.

Inoltre, consente di archiviare automaticamente i file di backup in una posizione remota come **Google Drive**, Dropbox, ecc.

Dopo aver impostato i backup automatici di WordPress, puoi andare avanti e attivare l’aggiornamento automatico di WordPress per le versioni principali.

## Metodo 1. Abilita gli aggiornamenti automatici di WordPress per le versioni principali utilizzando un plug-in

Questo metodo è più **semplice **e consigliato a tutti gli utenti.

Innanzitutto, è necessario installare e attivare il plug-in <a href="https://wordpress.org/plugins/stops-core-theme-and-plugin-updates/" target="_blank" rel="noreferrer noopener">Easy Updates Manager</a> . 

Al momento dell’attivazione, è necessario visitare **Dashboard »** **Update Options** per configurare il plug-in.

Nella sezione “**WordPress core updates**“, fai clic sull’opzione “**Auto update all releases**“.

Il plugin memorizzerà automaticamente le tue impostazioni e consentirà **l’aggiornamento automatico delle principali versioni di WordPress.**

Questo plugin consente anche di** impostare altri aggiornamenti automatici** o disabilitarli. 

## Metodo 2. Abilita manualmente l’aggiornamento

Questo metodo richiede di **aggiungere codice** ai tuoi file WordPress.

Innanzitutto, devi aggiungere la seguente riga di codice al file *wp-config.php* del tuo sito .

``` wp-block-code
define( 'WP_AUTO_UPDATE_CORE', true );
```

C’è un piccolo problema con questo codice: consente aggiornamenti **notturni**.

Per **disabilitare build notturni **e aggiornamenti di sviluppo, è necessario aggiungere il seguente codice nel file* functions.php*

``` wp-block-code
add_filter( 'allow_dev_auto_core_updates', '__return_false' );
```

Questo filtro disabiliterà gli aggiornamenti automatici per build notturne o aggiornamenti di sviluppo.

Il tuo sito WordPress è ora pronto per aggiornarsi automaticamente, senza il tuo input, ogni volta che è disponibile una nuova versione di WordPress.

## Domande frequenti sugli aggiornamenti automatici di WordPress

### **1. Perché devo installare gli aggiornamenti di WordPress?**

**WordPress è un software regolarmente gestito**. Migliaia di sviluppatori contribuiscono a rendere WordPress migliore e sicuro.

Devi installare gli aggiornamenti di WordPress non appena sono disponibili. Ciò **garantisce che il tuo sito Web disponga delle ultime patch di sicurezza**, nuove funzionalità per velocità e prestazioni ottimali.

### **2. Gli aggiornamenti sono sicuri per il mio sito Web?**

Gli aggiornamenti di WordPress diventano immediatamente disponibili per milioni di siti Web. **Il team principale lavora molto duramente per garantire che siano assolutamente sicuri** per l’installazione di tutti i siti Web.

Tuttavia, consigliamo a tutti di **eseguire sempre il backup del sito Web WordPress prima degli aggiornamenti**. Ciò consente di tornare rapidamente indietro nel caso in cui qualcosa vada storto dopo un aggiornamento.

### **3. Posso anche aggiornare automaticamente i plugin di WordPress?**

Per impostazione predefinita, WordPress richiede l’installazione manuale degli aggiornamenti dei plug-in. Tuttavia, **puoi abilitare gli aggiornamenti automatici anche per i plugin**. 

Speriamo che questo articolo ti abbia aiutato a imparare come** abilitare gli aggiornamenti automatici in WordPress **per le
