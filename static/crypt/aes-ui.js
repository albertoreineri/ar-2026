/* Interfaccia della modalità "Password · AES-256" (il motore è in aes.js) e scelta della modalità dall'indirizzo. */
(function () {
  "use strict";

  var byId = function (id) { return document.getElementById(id); };

  var MESSAGES = {
    unsupported: "This browser can't run encryption here. Use a recent browser, over HTTPS.",
    empty_password: "Enter a password.",
    empty_text: "Enter some text.",
    format: "This doesn't look like a text encrypted with this tool: it should start with “aes1.”",
    decrypt_failed: "Wrong password, or the text was changed."
  };

  function messageFor(error) {
    return MESSAGES[error && error.code] || "Something went wrong. Please try again.";
  }

  function wireForm(options) {
    var form = byId(options.form);
    var input = byId(options.input);
    var password = byId(options.password);
    var output = byId(options.output);
    var status = byId(options.status);
    var button = byId(options.button);
    var show = byId(options.show);

    show.addEventListener("change", function () {
      password.type = show.checked ? "text" : "password";
    });

    form.addEventListener("submit", async function (event) {
      event.preventDefault();
      status.textContent = options.working;
      status.className = "form-text";
      button.disabled = true;
      output.value = "";
      try {
        output.value = await options.run(input.value, password.value);
        status.textContent = "";
      } catch (error) {
        status.textContent = messageFor(error);
        status.className = "form-text text-danger";
      } finally {
        button.disabled = false;
      }
    });
  }

  wireForm({
    form: "aes-encrypt-form", input: "aes-text-to-encrypt", password: "aes-encrypt-password",
    output: "aes-encrypted-text", status: "aes-encrypt-status", button: "aes-encrypt-button", show: "aes-encrypt-show",
    working: "Encrypting…",
    run: function (text, password) { return AesText.encrypt(text, password); }
  });

  wireForm({
    form: "aes-decrypt-form", input: "aes-text-to-decrypt", password: "aes-decrypt-password",
    output: "aes-decrypted-text", status: "aes-decrypt-status", button: "aes-decrypt-button", show: "aes-decrypt-show",
    working: "Decrypting…",
    run: function (text, password) { return AesText.decrypt(text, password); }
  });

  // Avviso non bloccante sulle password corte
  var hint = byId("aes-password-hint");
  byId("aes-encrypt-password").addEventListener("input", function (event) {
    var length = event.target.value.length;
    hint.textContent = length > 0 && length < 12 ? "Short password: easy to guess. A longer passphrase is much safer." : "";
  });

  // Copia negli appunti
  document.querySelectorAll("[data-copy-target]").forEach(function (button) {
    button.addEventListener("click", function () {
      var target = byId(button.getAttribute("data-copy-target"));
      var done = byId(button.getAttribute("data-copy-done"));
      if (!target.value) return;
      navigator.clipboard.writeText(target.value).then(function () {
        done.style.display = "block";
        setTimeout(function () { done.style.display = "none"; }, 2000);
      });
    });
  });

  // La modalità si può scegliere dall'indirizzo: /crypt/#xor apre direttamente la chiave numerica
  var xorTab = byId("tab-xor");
  if (window.location.hash === "#xor" && window.bootstrap) {
    window.bootstrap.Tab.getOrCreateInstance(xorTab).show();
  }
  document.querySelectorAll('[data-bs-toggle="pill"]').forEach(function (tab) {
    tab.addEventListener("shown.bs.tab", function (event) {
      var hash = event.target.id === "tab-xor" ? "#xor" : window.location.pathname;
      window.history.replaceState(null, "", hash);
    });
  });
})();
