---
title: "Come creare un effetto Overlay in CSS"
date: 2022-02-22
description: "Personalmente utilizzo moltissimo gli overlay per migliorare la leggibilità del testo sopra un’immagine, ma che cos’è questo overlay? In poche parole non è nient’altro che un livello intermedio…"
tags: ["Guide", "Web Dev"]
---

Personalmente utilizzo moltissimo gli overlay per migliorare la leggibilità del testo sopra un’immagine, **ma che cos’è questo overlay?**

In poche parole non è nient’altro che un** livello intermedio fra l’immagine e il testo**, un livello che va ‘opacizzare’ l’immagine per rendere più leggibile il testo.

Logicamente **con l’overlay il testo risulta molto più leggibile**, e secondo me l’immagnie è anche meno impattante, meno fastidiosa.

Farlo non è affatto difficile.

<figure class="wp-block-embed is-type-rich is-provider-handler-delloggetto-incorporato wp-block-embed-handler-delloggetto-incorporato wp-embed-aspect-16-9 wp-has-aspect-ratio">
<div class="wp-block-embed__wrapper">
<div class="iframe">
<div id="player">

</div>
<div class="player-unavailable">
<h1 id="si-è-verificato-un-errore." class="message">Si è verificato un errore.</h1>
<div class="submessage">
Impossibile eseguire JavaScript
</div>
</div>
</div>
</div>
</figure>

## Come si fa

Basterà recarci all’interno del contenitore dell’immagine, in questo caso nel *div* con classe *sidebar *e aggiungere un elemento chiamato “*overlay*“

``` wp-block-code
 <div class="sidebar" style="background:url('https://images.unsplash.com/photo-1534067783941-51c9c23ecefd?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80')">

        <div class="overlay"></div>

        <div class="sidebar-inner">

            <div class="site-header">

                <h2>Nome Sito Web</h2>

                <i>Lorem ipsum dolor sit amet</i>

            </div>

        </div>

    </div>
```

Con l’html siamo a posto, ora spostiamoci nel nostro file **CSS** e dobbiamo solamente creare questa classe:

``` wp-block-code
.overlay{

    position: absolute;

    top:0;

    left: 0;

    right: 0;

    bottom:0;

    background-color: rgba(0, 0, 0, 0.4);

    z-index: 2;

    width: 100%;

    height: 100%;

}
```

***E Voilà! Tutto finito!***

Ora non resta che personalizzarla a piacere, cambiando il colore e il livello di opacità.

*Buon codice!*
