/*
 * AES-256-GCM con chiave derivata da una password (PBKDF2-SHA256), tramite la Web Crypto API del browser.
 * Nessuna libreria e nessun server: tutto avviene sul computer di chi usa la pagina.
 *
 * Formato del testo cifrato (una sola stringa, facile da copiare e incollare):
 *
 *     aes1.<base64( salt[16] | iv[12] | testo cifrato + tag di autenticazione[16] )>
 *
 *  - chiave: PBKDF2 con HMAC-SHA256, 600.000 iterazioni, sale casuale di 16 byte -> chiave AES da 256 bit
 *  - cifratura: AES-GCM, IV casuale di 12 byte, tag da 128 bit, dati aggiuntivi autenticati = "aes1"
 *  - il testo è codificato in UTF-8, quindi funzionano accenti ed emoji
 *
 * Sono tutti formati standard: lo stesso testo si decifra anche con altri strumenti (OpenSSL, Python, Node...).
 * Se la password è sbagliata o il testo è stato modificato, la decifratura fallisce invece di restituire
 * testo senza senso, perché GCM autentica il contenuto.
 */
(function (root) {
  "use strict";

  var VERSION = "aes1";
  var PREFIX = VERSION + ".";
  var SALT_BYTES = 16;
  var IV_BYTES = 12;
  var TAG_BYTES = 16;
  var PBKDF2_ITERATIONS = 600000;

  function AesTextError(code, message) {
    var error = new Error(message);
    error.name = "AesTextError";
    error.code = code;
    return error;
  }

  function getCrypto() {
    var c = root.crypto;
    if (!c || !c.subtle || !c.getRandomValues) {
      throw AesTextError("unsupported", "Web Crypto is not available (a recent browser over HTTPS is required)");
    }
    return c;
  }

  function toBase64(bytes) {
    var binary = "";
    // a blocchi: String.fromCharCode.apply con troppi argomenti sfora il limite dello stack
    for (var i = 0; i < bytes.length; i += 0x8000) {
      binary += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    }
    return root.btoa(binary);
  }

  function fromBase64(text) {
    var binary = root.atob(text);
    var bytes = new Uint8Array(binary.length);
    for (var i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
  }

  async function deriveKey(c, password, salt) {
    // NFC: la stessa password scritta con una tastiera diversa (accenti composti o scomposti) resta la stessa
    var material = await c.subtle.importKey("raw", new TextEncoder().encode(password.normalize("NFC")), "PBKDF2", false, ["deriveKey"]);
    return c.subtle.deriveKey(
      { name: "PBKDF2", salt: salt, iterations: PBKDF2_ITERATIONS, hash: "SHA-256" },
      material,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"]
    );
  }

  async function encrypt(plainText, password) {
    if (!password) throw AesTextError("empty_password", "Enter a password");
    if (!plainText) throw AesTextError("empty_text", "Enter some text");
    var c = getCrypto();
    var salt = c.getRandomValues(new Uint8Array(SALT_BYTES));
    var iv = c.getRandomValues(new Uint8Array(IV_BYTES));
    var key = await deriveKey(c, password, salt);
    var encrypted = new Uint8Array(
      await c.subtle.encrypt(
        { name: "AES-GCM", iv: iv, additionalData: new TextEncoder().encode(VERSION), tagLength: TAG_BYTES * 8 },
        key,
        new TextEncoder().encode(plainText)
      )
    );
    var out = new Uint8Array(SALT_BYTES + IV_BYTES + encrypted.length);
    out.set(salt, 0);
    out.set(iv, SALT_BYTES);
    out.set(encrypted, SALT_BYTES + IV_BYTES);
    return PREFIX + toBase64(out);
  }

  async function decrypt(token, password) {
    if (!password) throw AesTextError("empty_password", "Enter a password");
    var cleaned = String(token || "").replace(/\s+/g, "");
    if (cleaned.indexOf(PREFIX) !== 0) throw AesTextError("format", "Not a text encrypted with this tool");

    var bytes;
    try {
      bytes = fromBase64(cleaned.slice(PREFIX.length));
    } catch (e) {
      throw AesTextError("format", "Not a text encrypted with this tool");
    }
    if (bytes.length < SALT_BYTES + IV_BYTES + TAG_BYTES) throw AesTextError("format", "The text is too short");

    var c = getCrypto();
    var salt = bytes.subarray(0, SALT_BYTES);
    var iv = bytes.subarray(SALT_BYTES, SALT_BYTES + IV_BYTES);
    var data = bytes.subarray(SALT_BYTES + IV_BYTES);
    var key = await deriveKey(c, password, salt);

    var decrypted;
    try {
      decrypted = await c.subtle.decrypt(
        { name: "AES-GCM", iv: iv, additionalData: new TextEncoder().encode(VERSION), tagLength: TAG_BYTES * 8 },
        key,
        data
      );
    } catch (e) {
      throw AesTextError("decrypt_failed", "Wrong password, or the text was changed");
    }
    try {
      return new TextDecoder("utf-8", { fatal: true }).decode(decrypted);
    } catch (e) {
      throw AesTextError("decrypt_failed", "Wrong password, or the text was changed");
    }
  }

  var api = { encrypt: encrypt, decrypt: decrypt, PREFIX: PREFIX, PBKDF2_ITERATIONS: PBKDF2_ITERATIONS };
  root.AesText = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof self !== "undefined" ? self : globalThis);
