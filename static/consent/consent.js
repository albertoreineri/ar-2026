/*
 * Cookie banner + Google Consent Mode v2 per le pagine statiche fuori da Hugo (/crypt/, /orange/).
 * Replica la logica del sito (head.html + main.js): stessa chiave in localStorage, quindi una scelta
 * fatta sul sito vale anche qui e viceversa. GA si carica solo dopo il consenso (modalità "base").
 *
 * Uso, nell'<head>, come script sincrono (non async/defer):
 *   <script src="/consent/consent.js" data-ga-id="G-XXXXXXX"></script>
 * Per riaprire le preferenze: un link con l'attributo data-ar-cookie-prefs.
 */
(function () {
  var STORAGE_KEY = "ar-cookie-consent";
  var script = document.currentScript;
  var GA_ID = script && script.dataset.gaId;
  if (!GA_ID) return;

  window.AR_GA_ID = GA_ID;
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };

  var readConsent = function () {
    try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
  };

  gtag("consent", "default", {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: "denied"
  });

  window.arStartGA = function () {
    gtag("consent", "update", { analytics_storage: "granted" });
    if (window.arGAStarted) return;
    window.arGAStarted = true;
    gtag("js", new Date());
    gtag("config", GA_ID);
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(GA_ID);
    document.head.appendChild(s);
  };

  if (readConsent() === "granted") window.arStartGA();

  var isEn = (document.documentElement.lang || "it").toLowerCase().indexOf("en") === 0;
  var t = isEn ? {
    title: "I care about your privacy",
    body: "We use technical cookies (always active) and, only with your consent, Google Analytics to understand how the site is used.",
    privacy: "Privacy policy",
    cookies: "Cookie policy",
    privacyUrl: "/en/privacy-policy/",
    cookieAnchor: "#9-cookie-management",
    reject: "Reject",
    accept: "Accept"
  } : {
    title: "Ho a cuore la tua privacy",
    body: "Usiamo cookie tecnici (sempre attivi) e, solo con il tuo consenso, Google Analytics per capire come viene usato il sito.",
    privacy: "Privacy policy",
    cookies: "Politica sui cookie",
    privacyUrl: "/privacy-policy/",
    cookieAnchor: "#9-gestione-dei-cookie",
    reject: "Rifiuta",
    accept: "Accetta"
  };

  var css =
    ".ar-cookie{position:fixed;inset:0;z-index:2147483000;display:flex;align-items:center;justify-content:center;padding:24px;" +
    "background:rgba(10,10,9,.55);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);" +
    "font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;}" +
    ".ar-cookie[hidden]{display:none}" +
    ".ar-cookie-modal{width:min(100%,460px);box-sizing:border-box;background:#111210;color:#f1f0e9;border:1px solid #393b36;" +
    "border-radius:16px;padding:32px;box-shadow:0 30px 80px rgba(0,0,0,.35);text-align:left}" +
    ".ar-cookie-title{margin:0 0 12px;font-size:20px;font-weight:600;letter-spacing:-.02em;line-height:1.3;color:#f1f0e9}" +
    ".ar-cookie-body{margin:0 0 24px;font-size:14px;line-height:1.6;color:#94958d}" +
    ".ar-cookie-body a{color:#f1f0e9;text-decoration:none;border-bottom:1px solid #f1f0e9}" +
    ".ar-cookie-actions{display:flex;justify-content:flex-end;gap:12px}" +
    ".ar-cookie-btn{margin:0;padding:10px 20px;border-radius:100px;font:inherit;font-size:14px;line-height:1.2;cursor:pointer;" +
    "border:1px solid #f1f0e9;background:#f1f0e9;color:#111210;transition:opacity .3s ease}" +
    ".ar-cookie-btn:hover{opacity:.8}" +
    ".ar-cookie-btn:focus-visible{outline:2px solid #ffdd00;outline-offset:3px}" +
    ".ar-cookie-ghost{background:transparent;color:#f1f0e9}" +
    "@media (max-width:800px){.ar-cookie-actions{flex-direction:column-reverse}}";

  var banner = null;

  var open = function () {
    if (!banner) build();
    banner.hidden = false;
    document.body.style.overflow = "hidden";
  };

  var close = function () {
    banner.hidden = true;
    document.body.style.overflow = "";
  };

  var setConsent = function (granted) {
    try { localStorage.setItem(STORAGE_KEY, granted ? "granted" : "denied"); } catch (e) {}
    if (granted) {
      window.arStartGA();
    } else {
      gtag("consent", "update", { analytics_storage: "denied" });
    }
    close();
  };

  var build = function () {
    var style = document.createElement("style");
    style.textContent = css;
    document.head.appendChild(style);

    banner = document.createElement("div");
    banner.className = "ar-cookie";
    banner.hidden = true;
    banner.setAttribute("role", "dialog");
    banner.setAttribute("aria-modal", "true");
    banner.setAttribute("aria-labelledby", "arCookieTitle");
    banner.innerHTML =
      '<div class="ar-cookie-modal">' +
        '<p class="ar-cookie-title" id="arCookieTitle"></p>' +
        '<p class="ar-cookie-body"><span></span> <a class="ar-cookie-privacy"></a> · <a class="ar-cookie-policy"></a></p>' +
        '<div class="ar-cookie-actions">' +
          '<button type="button" class="ar-cookie-btn ar-cookie-ghost" data-choice="reject"></button>' +
          '<button type="button" class="ar-cookie-btn" data-choice="accept"></button>' +
        "</div>" +
      "</div>";

    banner.querySelector(".ar-cookie-title").textContent = t.title;
    banner.querySelector(".ar-cookie-body span").textContent = t.body;
    var privacy = banner.querySelector(".ar-cookie-privacy");
    privacy.textContent = t.privacy;
    privacy.href = t.privacyUrl;
    var policy = banner.querySelector(".ar-cookie-policy");
    policy.textContent = t.cookies;
    policy.href = t.privacyUrl + t.cookieAnchor;
    banner.querySelector('[data-choice="reject"]').textContent = t.reject;
    banner.querySelector('[data-choice="accept"]').textContent = t.accept;

    banner.addEventListener("click", function (e) {
      var choice = e.target.getAttribute && e.target.getAttribute("data-choice");
      if (choice) setConsent(choice === "accept");
    });

    document.body.appendChild(banner);
  };

  window.arOpenCookieBanner = open;

  var init = function () {
    var stored = readConsent();
    if (stored !== "granted" && stored !== "denied") open();

    document.addEventListener("click", function (e) {
      var link = e.target.closest && e.target.closest("[data-ar-cookie-prefs]");
      if (!link) return;
      e.preventDefault();
      open();
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
