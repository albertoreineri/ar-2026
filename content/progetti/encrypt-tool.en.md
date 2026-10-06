---
title: "Encrypt & Decrypt Text"
seoTitle: "Encrypt & Decrypt Text Online: a small open source XOR tool"
description: "A small tool to encrypt and decrypt text with a numeric key, in the browser. A simple XOR, not serious cryptography. Open source (GPL-3.0)."
date: 2026-10-06
translationKey: "project-encrypt-tool"
url: "/en/projects/encrypt-tool/"
projectType: "Tool · Open source"
projectLinks:
  - label: "Open the tool →"
    url: "/crypt/"
  - label: "Download from GitHub ↗"
    url: "https://github.com/albertoreineri/encrypt-tool"
    external: true
image: "img/projects/encrypt-tool.jpg"
imageWidth: 1920
imageHeight: 1046
imageAlt: "Encrypt & Decrypt Text: on the left the text «Ci vediamo alle otto, porto io il caffe.» encrypted with key 21, on the right the encrypted text turned back into the original with the same key"
---

Encrypt & Decrypt Text is a tiny tool that does one thing: you type a text, pick a numeric key and get the encrypted text. With the same key you turn it back into what it was. It runs in the browser, and your text never leaves your computer.

- **Status**: online since 2024, and does what it should
- **Built with**: HTML, CSS and JavaScript (jQuery), with Bootstrap
- **Licence**: open source, GPL-3.0
- **Made by**: me, alone

## What it's for

I made it for myself. I have data I want to keep hidden but that isn't secret: I don't need serious cryptography, I just don't want it readable at a glance. I wanted a simple, quick way to do it, in the browser, without going through a server and without complex machinery: I open the page, type, copy the result.

If the question is "what's the point if it isn't secure?", this is the answer: it's for hiding, not for protecting.

## How it works

Every character of the text is combined with the numeric key using the **XOR** operation (exclusive OR). The heart of it is this line:

```
String.fromCharCode(str.charCodeAt(pos) ^ key)
```

XOR is symmetric: applying it twice with the same key gives you back the original. That's why encrypting and decrypting are the same operation, and why you need exactly the same key to decrypt. If you leave the key empty, the tool uses 1.

The JavaScript is about seventy lines, and takes a few minutes to read. It makes no network calls at all.

## How secure is it

Not at all, and it isn't meant to be. A single-number XOR is **obfuscation**, not encryption: anyone who knows how it works can try every key in a fraction of a second. It's fine for hiding a spoiler, a riddle or a note from a casual glance, and for seeing in practice how XOR works.

For passwords or data that matters you need real encryption: a password manager, or tools such as [age](https://age-encryption.org/) or [GnuPG](https://gnupg.org/).

## How to use it

Type the text in the **Encrypt** column, pick a numeric key and press **Crypt**. To get the original back, paste the result into the **Decrypt** column, enter the same key and press **Decrypt**. Each result has a button to copy it to the clipboard.

{{< youtube nFo4QFugNA8 >}}

## Where to find it

The tool is online at [albertoreineri.it/crypt](/crypt/), and the code is on [GitHub](https://github.com/albertoreineri/encrypt-tool): it's just HTML, CSS and JavaScript, so you can download the repository and open `index.html`. You can host it wherever you like. Pull requests are welcome.
