---
title: "Come aggiungere uno shortcode in WordPress?"
date: 2020-03-20
description: "Gli shortcode sono un modo semplice per aggiungere contenuti dinamici nei post, nelle pagine e nelle barre laterali di WordPress. Molti plugin e temi WordPress utilizzano shortcode per aggiungere…"
tags: ["Guide", "WordPress Tricks"]
---

Gli shortcode sono un modo semplice per **aggiungere contenuti dinamici** nei post, nelle pagine e nelle barre laterali di WordPress.

Molti **plugin e temi WordPress utilizzano shortcode** per aggiungere contenuti particolari come moduli di contatto, gallerie di immagini, cursori e altro.

In questo articolo, ti mostreremo come **aggiungere facilmente uno shortcode in WordPress**. Ti mostreremo anche come creare i tuoi shortcode personalizzati in WordPress.

## COSA SONO GLI SHORTCODE?

Gli shortcode in ​​WordPress sono stringhe che ti aiutano ad aggiungere contenuti dinamici nei post, nelle pagine e nei widget della sidebar di WordPress. Sono visualizzati **tra parentesi quadre** quadre in questo modo:

*\[shortcode\]*

Per comprendere meglio gli shortcode, diamo un’occhiata al motivo per cui sono stati inseriti.

WordPress filtra tutto il contenuto per assicurarsi che nessuno utilizzi post e contenuto della pagina per inserire **codice dannoso** nel database . Ciò significa che **puoi scrivere HTML di base nei tuoi post, ma non puoi scrivere codice PHP.**

E se volessi eseguire un codice personalizzato all’interno dei tuoi post per visualizzare post correlati, banner pubblicitari, moduli di contatto, gallerie, ecc.?

Qui entra in gioco **l’API Shortcode.**

Fondamentalmente, **consente agli sviluppatori di aggiungere il loro codice all’interno di una funzione** e quindi di registrarla con WordPress come shortcode, in modo che gli utenti possano usarlo facilmente senza avere alcuna conoscenza di sviluppo web.

Quando WordPress trova lo shortcode, eseguirà automaticamente il codice ad esso associato.

Vediamo **come aggiungere facilmente** shortcode nei post e nelle pagine di WordPress.

## AGGIUNTA DI UNO SHORTCODE NEI POST E NELLE PAGINE DI WORDPRESS

Innanzitutto, è necessario **modificare il post e la pagina in cui si desidera aggiungere lo shortcode**. Successivamente, è necessario fare clic sul pulsante **Aggiungi blocco** per inserire un blocco *shortcode*.

Dopo aver aggiunto il blocco *shortcode*, puoi semplicemente inserire il tuo shortcode nelle impostazioni del blocco. Lo shortcode sarà fornito da vari plugin di WordPress che potresti utilizzare.

Ora puoi salvare il tuo post o la pagina e visualizzare in anteprima le modifiche **per vedere lo shortcode in azione.**

## AGGIUNTA DI UNO SHORTCODE NEI WIDGET DELLA SIDEBAR DI WORDPRESS

Puoi anche usare gli shortcode nei widget della sidebar di WordPress . Basta visitare la pagina **Aspetto »Widget** e aggiungere il widget “Testo” a una sidebar.

Ora puoi **incollare il tuo shortcode** nell’area di testo del widget.

Non dimenticare di fare clic sul pulsante “**Salva**” per memorizzare le impostazioni del widget.

Successivamente, puoi visitare il tuo sito Web WordPress per vedere **l’anteprima dal vivo** dello shortcode nel widget della barra laterale.

## AGGIUNTA DI UNO SHORTCODE NEL VECCHIO EDITOR CLASSICO DI WORDPRESS

Se stai ancora utilizzando il vecchio **editor classico** in WordPress, ecco come aggiungere codici brevi ai tuoi post e alle tue pagine WordPress.

Modifica semplicemente il post e la pagina in cui desideri aggiungere lo shortcode. È possibile **incollare lo shortcode** in qualsiasi punto all’interno dell’editor dei contenuti nel punto in cui si desidera che venga visualizzato. Assicurati solo che lo shortcode sia nella sua stessa riga.

Non dimenticare di **salvare** le modifiche. Successivamente puoi visualizzare l’anteprima del tuo post e della pagina per vedere lo shortcode in azione.

## COME AGGIUNGERE UN SHORTCODE NEL TEMA WORDPRESS

Gli shortcode sono pensati per essere utilizzati all’interno di post, pagine e widget di WordPress. Tuttavia, a volte potresti voler **usare un shortcode all’interno di un tema** di WordPress.

Fondamentalmente, puoi aggiungere uno shortcode a qualsiasi file del tuo tema WordPress semplicemente aggiungendo il seguente codice.

``` wp-block-code
<?php echo do_shortcode("[shortcode]"); ?>
```

WordPress cercherà lo shortcode e visualizzerà il suo output nel file del tema.

## COME CREARE IL TUO SHORTCODE PERSONALIZZATO IN WORDPRESS

Gli shortcode possono essere davvero utili quando si desidera **aggiungere contenuto dinamico o codice personalizzato** all’interno del post e delle pagine di WordPress. Tuttavia, se vuoi **creare un tuo shortcode personalizzato**, dovrai scrivere un po’ di codice.

Se hai dimestichezza con la scrittura di codice PHP, ecco un esempio che puoi utilizzare come modello:

``` wp-block-code
// Funzione che viene eseguita quando è richiamato lo shortcode
function my_shortcode() { 
    $messaggio = 'Ciao mondo!';  // Output 
    return $messaggio;
} 
// Registro lo shortcode
add_shortcode('saluto', 'my_shortcode'); // Lo shortcode sarà [saluto]
```

Con questo codice abbiamo prima creato una funzione che esegue del codice e restituisce l’output. Successivamente, abbiamo creato un nuovo shortcode chiamato ‘saluto’ e abbiamo detto a WordPress di eseguire la funzione che abbiamo creato.

Ora puoi **usare aggiungi questo shortcode ai tuoi post**, pagine e widget usando il seguente codice:

*\[saluto\]*

Questo eseguirà la funzione creata e mostrerà l’output desiderato.

## SHORTCODE O BLOCCHI DI GUTENBERG?

Gli utenti ci chiedono spesso le differenze tra shortcode e nuovi blocchi di Gutenberg.

Fondamentalmente se trovi utili gli shortcode, adorerai i blocchi dell’editor di WordPress. I blocchi ti consentono di fare la stessa cosa ma **in modo più intuitivo.**

Invece di richiedere agli utenti di aggiungere uno shortcode per visualizzare contenuti dinamici, i blocchi consentono agli utenti di aggiungere contenuti dinamici all’interno di post / pagine con **un’interfaccia utente più intuitiva**. Molti plugin WordPress popolari stanno passando all’uso dei blocchi **Gutenberg** anziché degli shortcode perché sono **più adatti ai principianti.**

Speriamo che questo articolo ti abbia aiutato a imparare come aggiungere uno shortcode in WordPress.
