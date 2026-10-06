---
title: "Encrypt & Decrypt Text"
seoTitle: "Encrypt & Decrypt Text Online: AES-256 or simple XOR, in your browser"
description: "A tool to encrypt and decrypt text in your browser: AES-256 with a password, or a simple XOR with a numeric key. No server. Open source."
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
imageHeight: 1193
imageAlt: "Encrypt & Decrypt Text in Password · AES-256 mode: on the left the text «Ci vediamo alle otto, porto io il caffè.» encrypted into a string that starts with «aes1.», on the right the same string turned back into the original text with the same password"
---

Encrypt & Decrypt Text is a small tool with two modes: **AES-256 with a password**, to really encrypt, and a **XOR with a numeric key**, to hide things without effort. It runs in the browser, and your text never leaves your computer.

- **Status**: online since 2024; in 2026 I added AES encryption
- **Built with**: HTML, CSS and JavaScript (jQuery, Bootstrap) and the browser's Web Crypto API
- **Licence**: open source, GPL-3.0
- **Made by**: me, alone

## What it's for

I made the first version for myself. I have data I want to keep hidden but that isn't secret: I didn't need serious cryptography, I just didn't want it readable at a glance. I wanted a simple, quick way to do it, in the browser, without going through a server and without complex machinery: I open the page, type, copy the result. That was the XOR mode, and for that use it's enough.

But one question was inevitable: "what's the point if it isn't secure?". For anyone who wants more I added the **AES-256 with a password** mode, which is real encryption. I kept the XOR as it was for two reasons: it's the one built for the way I use it, and anyone who used the tool before 6 October 2026 and has texts saved can still recover them, by opening [the XOR mode](/crypt/#xor) and using the same key.

## The two modes

### Password · AES-256

The password becomes a 256-bit key with **PBKDF2** (SHA-256, 600,000 iterations and a random salt), and the text is encrypted with **AES-256-GCM**. The core is the browser's Web Crypto API, with no libraries:

```
crypto.subtle.deriveKey(
  { name: "PBKDF2", salt, iterations: 600000, hash: "SHA-256" },
  material, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]
)
```

The result is a single string that starts with `aes1.` and holds the salt, the nonce and the encrypted text, in base64: it copies and pastes without surprises, and works with accents and emoji too. GCM authenticates the content: with a wrong password, or an altered text, decryption fails with a clear error instead of returning garbage.

The format is standard and documented: the same text can be decrypted with other tools too (I checked it by cross-testing against Node's AES-GCM implementation, in both directions).

### Numeric key · XOR

Every character of the text is combined with the numeric key using the **XOR** operation (exclusive OR). The heart of it is this line:

```
String.fromCharCode(str.charCodeAt(pos) ^ key)
```

XOR is symmetric: applying it twice with the same key gives you back the original. That's why encrypting and decrypting are the same operation. If you leave the key empty, the tool uses 1.

All the JavaScript takes a few minutes to read, and it makes no network calls.

## How secure is it

**AES mode**: within its limits, yes. AES-256-GCM is a standard, well-studied cipher, and the weak point is always the password: a short or common one can be guessed, so use a long passphrase and keep it somewhere safe. There's no recovery: if you lose the password, the text is gone. And like any tool that runs in the browser, it relies on the code the page serves you. For truly sensitive data, prefer a vetted tool you run on your own computer: [age](https://age-encryption.org/) or [GnuPG](https://gnupg.org/).

**XOR mode**: not at all, and it isn't meant to be. A single-number XOR is **obfuscation**, not encryption: anyone who knows how it works can try every key in a fraction of a second. It's fine for hiding a spoiler, a riddle or a note from a casual glance.

## How to use it

Pick the mode with the two tabs at the top. In AES mode, type the text in the **Encrypt** column, enter a password and press **Encrypt**. To get the original back, paste the `aes1.…` string into the **Decrypt** column, enter the same password and press **Decrypt**. Each result has a button to copy it to the clipboard.

The video below shows the numeric key mode, the original one.

{{< youtube nFo4QFugNA8 >}}

## Where to find it

The tool is online at [albertoreineri.it/crypt](/crypt/), and the code is on [GitHub](https://github.com/albertoreineri/encrypt-tool): it's just HTML, CSS and JavaScript, so you can download the repository and open `index.html`. You can host it wherever you like. Pull requests are welcome.
