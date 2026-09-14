(function () {
  'use strict';

  // Rete di sicurezza: se qualcosa va storto in questo script, il contenuto
  // resta comunque visibile e leggibile (nessuna dipendenza da JS per l'accesso ai contenuti).
  window.addEventListener('error', function () {
    document.querySelectorAll('.services__item, .help__item, .testimonials__item').forEach(function (el) {
      el.style.opacity = '';
      el.style.transform = '';
    });
  });

  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isDesktop = window.matchMedia('(min-width: 52rem)').matches;
  var hasGSAP = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';

  if (!hasGSAP || prefersReduced) {
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });

  document.fonts.ready.then(function () {
    ScrollTrigger.refresh();
  });

  initTopoLines();
  initHeroTitle();
  initReveal('.services__item', { y: 34, stagger: 0.09, rotate: true });
  initReveal('.help__item', { alternateX: 46, stagger: 0.1 });
  initReveal('.testimonials__item', { y: 22, stagger: 0.12 });

  // Le curve di livello dell'hero si "disegnano" seguendo lo scroll,
  // come se la mappa altimetrica prendesse forma mentre si esplora la pagina.
  function initTopoLines() {
    var paths = document.querySelectorAll('.hero__topo path');
    if (!paths.length) return;

    var tl = gsap.timeline({
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 0.6
      }
    });

    paths.forEach(function (path, i) {
      var length = path.getTotalLength();
      gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
      tl.to(path, { strokeDashoffset: 0, ease: 'none', duration: 1 }, i * 0.12);
    });
  }

  // Il titolo hero reagisce allo scroll: peso variabile e leggero spostamento.
  // Il cambio di peso (più costoso, perché il font reflow) resta solo da desktop in su.
  function initHeroTitle() {
    var title = document.querySelector('.hero__title');
    if (!title) return;

    var vars = {
      y: -22,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 0.6
      }
    };

    if (isDesktop) {
      vars['--wght'] = 700;
    }

    gsap.to(title, vars);
  }

  // Scelte di ingresso coordinate per sezione: le righe dei servizi si "depositano"
  // (come strati) mentre i punti di "posso aiutarti a" arrivano alternati da sinistra/destra.
  function initReveal(selector, opts) {
    var items = document.querySelectorAll(selector);
    if (!items.length) return;

    items.forEach(function (item, i) {
      var fromVars = { opacity: 0 };

      if (opts.alternateX) {
        fromVars.x = (i % 2 === 0) ? -opts.alternateX : opts.alternateX;
      } else {
        fromVars.y = opts.y || 30;
        if (opts.rotate) fromVars.rotate = (i % 2 === 0) ? -1.1 : 1.1;
      }

      gsap.set(item, fromVars);

      gsap.to(item, {
        opacity: 1,
        x: 0,
        y: 0,
        rotate: 0,
        duration: 0.7,
        delay: i * (opts.stagger || 0.08),
        ease: 'power3.out',
        scrollTrigger: {
          trigger: item,
          start: 'top 88%',
          toggleActions: 'play none none none'
        }
      });
    });
  }
})();
