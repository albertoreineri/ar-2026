/* THEME */
const root = document.documentElement;
const themeSwitch = document.getElementById("themeSwitch");

themeSwitch.addEventListener("click", () => {
  root.classList.toggle("dark");
  localStorage.setItem("ar-theme", root.classList.contains("dark") ? "dark" : "light");
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

/* HERO MOUSE PARALLAX */
if (window.matchMedia("(pointer:fine)").matches) {
  const heroTitle = document.getElementById("heroTitle");

  window.addEventListener("pointermove", (e) => {
    const x = (e.clientX / window.innerWidth - .5) * 2;
    const y = (e.clientY / window.innerHeight - .5) * 2;
    heroTitle.style.transform = `translate(${x * 5}px, ${y * 3}px)`;
  });
}

/* CONTACT FORM (via mailto, nessun backend) */
const contactForm = document.getElementById("contactForm");

contactForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const email = contactForm.email.value;
  const messaggio = contactForm.messaggio.value;

  const subject = "Nuovo contatto dal sito";
  const body = `${messaggio}\n\n— ${email}`;

  window.location.href =
    `mailto:ciao@albertoreineri.it?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
});

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
