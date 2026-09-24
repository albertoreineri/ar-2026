---
title: "How to Create an Overlay Effect in CSS"
date: 2022-02-22
description: "How to create an overlay in CSS to make text readable over a background image: a semi-transparent absolutely positioned layer, in a few lines of code."
tags: ["Guides", "Web Dev"]
translationKey: "css-overlay-effect"
---

I personally use overlays a lot to improve text readability over an image, but **what exactly is this overlay?**

Simply put, it's nothing more than an **intermediate layer between the image and the text** — a layer that darkens the image to make the text more readable.

Naturally, **with the overlay the text is much more readable**, and in my opinion the image also feels less overwhelming, less distracting.

It's not hard to do at all.

## How it's done

Just go inside the image's container — in this case, the *div* with the class *sidebar* — and add an element called "*overlay*".

```
 <div class="sidebar" style="background:url('https://images.unsplash.com/photo-1534067783941-51c9c23ecefd?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80')">

        <div class="overlay"></div>

        <div class="sidebar-inner">

            <div class="site-header">

                <h2>Website Name</h2>

                <i>Lorem ipsum dolor sit amet</i>

            </div>

        </div>

    </div>
```

The HTML is done — now let's move to our **CSS** file, where we just need to create this class:

```
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

***And there you go! All done!***

Now all that's left is to customize it to your liking, changing the color and the opacity level.

*Happy coding!*
