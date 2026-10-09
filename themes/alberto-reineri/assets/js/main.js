/* THEME */
const root = document.documentElement;
const themeSwitch = document.getElementById("themeSwitch");

themeSwitch.addEventListener("click", () => {
  root.classList.toggle("dark");
  localStorage.setItem("ar-theme", root.classList.contains("dark") ? "dark" : "light");
});

/* COOKIE CONSENT (Google Consent Mode v2) — popup modale con sfondo sfumato */
const cookieBanner = document.getElementById("cookieBanner");

if (cookieBanner && window.AR_GA_ID) {
  const openCookieBanner = () => {
    cookieBanner.hidden = false;
    document.body.style.overflow = "hidden";
  };

  const closeCookieBanner = () => {
    cookieBanner.hidden = true;
    document.body.style.overflow = "";
  };

  const setConsent = (granted) => {
    localStorage.setItem("ar-cookie-consent", granted ? "granted" : "denied");
    if (granted) {
      // Carica GA solo adesso (vedi head.html): il page_view di questa pagina parte già con consenso
      window.arStartGA();
    } else {
      // Revoca dal bottone "preferenze cookie": se GA era già attivo, smette di usare i cookie
      gtag("consent", "update", { analytics_storage: "denied" });
    }
    closeCookieBanner();
  };

  const storedConsent = localStorage.getItem("ar-cookie-consent");
  if (storedConsent !== "granted" && storedConsent !== "denied") {
    openCookieBanner();
  }

  document.getElementById("cookieAccept").addEventListener("click", () => setConsent(true));
  document.getElementById("cookieReject").addEventListener("click", () => setConsent(false));

  const cookiePrefsBtn = document.getElementById("cookiePrefsBtn");
  if (cookiePrefsBtn) {
    cookiePrefsBtn.addEventListener("click", openCookieBanner);
  }
}

/* LINGUA: la scelta fatta dal selettore vale più della lingua del browser (la legge il redirect in head.html) */
document.querySelectorAll(".lang-switch").forEach((link) => {
  link.addEventListener("click", () => {
    try { localStorage.setItem("ar-lang", link.dataset.lang); } catch (e) {}
    // Stessa scelta anche in un cookie: la legge il redirect lingua lato server (Worker Cloudflare)
    document.cookie = "ar-lang=" + link.dataset.lang + "; path=/; max-age=31536000; SameSite=Lax" + (location.protocol === "https:" ? "; Secure" : "");
  });
});

/* MENU HAMBURGER (mobile) */
const menuToggle = document.getElementById("menuToggle");
const mobileMenu = document.getElementById("mobileMenu");

function closeMobileMenu() {
  mobileMenu.classList.remove("open");
  menuToggle.classList.remove("open");
  menuToggle.setAttribute("aria-expanded", "false");
  document.body.style.overflow = "";
}

menuToggle.addEventListener("click", () => {
  const isOpen = mobileMenu.classList.toggle("open");
  menuToggle.classList.toggle("open", isOpen);
  menuToggle.setAttribute("aria-expanded", isOpen);
  document.body.style.overflow = isOpen ? "hidden" : "";
});

mobileMenu.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", closeMobileMenu);
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 800) closeMobileMenu();
});

/* SCROLL REVEAL */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll(".reveal").forEach(el => revealObserver.observe(el));

/* TITOLO HERO & NOMI PROGETTI: lettere sciolte con floating leggero e sfasato, anche da fermi */
(function () {
  document.querySelectorAll(".hero-title .accent-word, .project-image span").forEach((el) => {
    const isCard = el.closest(".project-image");
    const ampMin = isCard ? 1 : 3;
    const ampRange = isCard ? 1.5 : 4;

    const words = el.textContent.split(" ");
    el.textContent = "";

    words.forEach((token, i) => {
      const wordWrap = document.createElement("span");
      wordWrap.style.display = "inline-block";

      [...token].forEach((ch) => {
        const letter = document.createElement("span");
        letter.className = "letter";
        letter.textContent = ch;
        letter.style.animationDelay = `${(-Math.random() * 5).toFixed(2)}s`;
        letter.style.setProperty("--letter-amp", `${(ampMin + Math.random() * ampRange).toFixed(1)}px`);
        wordWrap.appendChild(letter);
      });

      el.appendChild(wordWrap);
      if (i < words.length - 1) el.appendChild(document.createTextNode(" "));
    });
  });
})();

/* HERO MOUSE PARALLAX — presente solo in home */
if (window.matchMedia("(pointer:fine)").matches) {
  const heroTitle = document.getElementById("heroTitle");

  if (heroTitle) {
    window.addEventListener("pointermove", (e) => {
      const x = (e.clientX / window.innerWidth - .5) * 2;
      const y = (e.clientY / window.innerHeight - .5) * 2;
      heroTitle.style.transform = `translate(${x * 5}px, ${y * 3}px)`;
    });
  }
}

/* CONTACT FORM (via Formspree) — nel footer su ogni pagina tranne Contatti, e nella pagina Contatti stessa */
const contactForm = document.getElementById("contactForm");

if (contactForm) {
  const statusEl = contactForm.querySelector(".form-status");
  const submitBtn = contactForm.querySelector(".contact-submit");
  const msg = contactForm.dataset;

  const setStatus = (text, modifier) => {
    if (!statusEl) return;
    statusEl.textContent = text;
    statusEl.className = modifier ? `form-status form-status--${modifier}` : "form-status";
    // Il messaggio deve vedersi anche se il form è lungo o il footer è a metà schermo
    if (text) statusEl.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  /* Cloudflare Turnstile: lo script viene caricato solo quando il form si avvicina allo schermo,
     così le pagine che nessuno scorre fino in fondo non contattano Cloudflare.
     Il token finisce nel campo nascosto "cf-turnstile-response" e lo verifica Formspree. */
  const captchaEl = contactForm.querySelector(".contact-captcha");
  let widgetId = null;
  let turnstileLoading = null;

  const loadTurnstile = () => {
    if (!turnstileLoading) {
      turnstileLoading = new Promise((resolve, reject) => {
        window.arTurnstileReady = () => resolve(window.turnstile);
        const script = document.createElement("script");
        script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=arTurnstileReady";
        script.async = true;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    }
    return turnstileLoading;
  };

  const renderCaptcha = () => {
    if (!captchaEl || widgetId !== null) return;
    loadTurnstile()
      .then((turnstile) => {
        if (widgetId !== null) return;
        widgetId = turnstile.render(captchaEl, {
          sitekey: captchaEl.dataset.sitekey,
          language: captchaEl.dataset.lang,
          theme: document.documentElement.classList.contains("dark") ? "dark" : "light",
          size: "flexible",
        });
      })
      .catch(() => setStatus(msg.msgError, "error"));
  };

  if (captchaEl) {
    if ("IntersectionObserver" in window) {
      const captchaObserver = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            captchaObserver.disconnect();
            renderCaptcha();
          }
        },
        { rootMargin: "400px 0px" }
      );
      captchaObserver.observe(contactForm);
    }
    // Rete di sicurezza: se l'utente arriva al form prima dell'observer (link diretto, tastiera)
    contactForm.addEventListener("focusin", renderCaptcha, { once: true });
  }

  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const token = contactForm.querySelector('[name="cf-turnstile-response"]');
    if (captchaEl && !(token && token.value)) {
      renderCaptcha();
      setStatus(msg.msgCaptcha, "error");
      return;
    }

    if (submitBtn) submitBtn.disabled = true;
    setStatus(msg.msgSending);

    fetch(contactForm.action, {
      method: "POST",
      body: new FormData(contactForm),
      headers: { Accept: "application/json" },
    })
      .then((response) => {
        if (!response.ok) throw new Error("Invio non riuscito");
        contactForm.reset();
        setStatus(msg.msgOk, "ok");
      })
      .catch(() => {
        setStatus(msg.msgError, "error");
      })
      .finally(() => {
        if (submitBtn) submitBtn.disabled = false;
        // Ogni token Turnstile vale per un solo invio: ne serve uno nuovo per il prossimo messaggio
        if (widgetId !== null && window.turnstile) window.turnstile.reset(widgetId);
      });
  });
}

/* INDICE ARTICOLO: collassabile + evidenzia la voce della sezione visibile — presente solo nei single del blog */
const postToc = document.querySelector(".post-toc");

if (postToc) {
  const tocToggle = postToc.querySelector(".post-toc-toggle");

  tocToggle.addEventListener("click", () => {
    const collapsed = postToc.classList.toggle("collapsed");
    tocToggle.setAttribute("aria-expanded", !collapsed);
  });

  const tocLinks = postToc.querySelectorAll("a[href^='#']");
  const headings = [...tocLinks]
    .map((link) => document.getElementById(decodeURIComponent(link.hash.slice(1))))
    .filter(Boolean);

  const tocObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const link = postToc.querySelector(`a[href="#${entry.target.id}"]`);
      if (!link) return;
      link.classList.toggle("active", entry.isIntersecting);
    });
  }, { rootMargin: "-20% 0px -70% 0px" });

  headings.forEach((heading) => tocObserver.observe(heading));
}

/* MAGNETIC PROJECT IMAGES */
if (window.matchMedia("(pointer:fine)").matches) {
  document.querySelectorAll(".magnetic").forEach(el => {
    el.addEventListener("pointermove", (e) => {
      const rect = el.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - .5) * 2;
      const y = ((e.clientY - rect.top) / rect.height - .5) * 2;

      el.style.transform =
        `perspective(900px) rotateX(${y * -2.2}deg) rotateY(${x * 2.2}deg)`;
    });

    el.addEventListener("pointerleave", () => {
      el.style.transform = "";
    });
  });
}

/* CURSOR */
if (window.matchMedia("(pointer:fine)").matches) {
  const cursor = document.querySelector(".cursor-dot");

  window.addEventListener("pointermove", (e) => {
    cursor.style.left = e.clientX + "px";
    cursor.style.top = e.clientY + "px";
  });

  document.querySelectorAll("a, button, .magnetic").forEach(el => {
    el.addEventListener("mouseenter", () => document.body.classList.add("hovering"));
    el.addEventListener("mouseleave", () => document.body.classList.remove("hovering"));
  });
}
