const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const hasFinePointer = window.matchMedia('(pointer: fine)').matches;

// Cursore personalizzato: solo su desktop con mouse e senza reduced motion
if (hasFinePointer && !prefersReducedMotion) {
    document.documentElement.classList.add('custom-cursor-active');

    const cursor = document.querySelector('.custom-cursor');
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let cursorX = mouseX;
    let cursorY = mouseY;

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    function renderCursor() {
        cursorX += (mouseX - cursorX) * 0.15;
        cursorY += (mouseY - cursorY) * 0.15;

        cursor.style.left = `${cursorX}px`;
        cursor.style.top = `${cursorY}px`;

        requestAnimationFrame(renderCursor);
    }
    renderCursor();

    const interactiveElements = document.querySelectorAll('a, button, .service-card, .testimonial-card, .method-item');

    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.style.width = '48px';
            cursor.style.height = '48px';
            cursor.style.backgroundColor = 'rgba(224, 169, 57, 0.15)';
            cursor.style.borderColor = 'var(--accent)';
        });
        el.addEventListener('mouseleave', () => {
            cursor.style.width = '24px';
            cursor.style.height = '24px';
            cursor.style.backgroundColor = 'transparent';
            cursor.style.borderColor = 'var(--text-primary)';
        });
    });
}

// Animazione della grafica geometrica in base allo scroll (disattivata con reduced motion)
if (!prefersReducedMotion) {
    const scrollGraphic = document.getElementById('scrollGraphic');

    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        const rotation = scrollY * 0.15;
        const scale = 1 + (scrollY * 0.0003);

        if (scrollGraphic) {
            scrollGraphic.style.transform = `rotate(${rotation}deg) scale(${Math.min(scale, 1.2)})`;
        }
    });
}

// Reveal delle sezioni allo scroll
const revealEls = document.querySelectorAll('.reveal');

if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach(el => el.classList.add('is-visible'));
} else {
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            entry.target.classList.toggle('is-visible', entry.isIntersecting);
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -10% 0px'
    });

    revealEls.forEach(el => revealObserver.observe(el));
}

// Tema chiaro / scuro — di default segue il sistema, ma un click sceglie
// sempre l'opposto di ciò che si vede in quel momento (bypassa "system").
(function () {
    const root = document.documentElement;
    const toggle = document.getElementById('theme-toggle');
    const darkMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const labels = {
        light: 'Tema chiaro attivo — passa allo scuro',
        dark: 'Tema scuro attivo — passa al chiaro'
    };

    function hasExplicitTheme() {
        const explicit = root.getAttribute('data-theme');
        return explicit === 'light' || explicit === 'dark';
    }

    function getResolvedTheme() {
        if (hasExplicitTheme()) return root.getAttribute('data-theme');
        return darkMediaQuery.matches ? 'dark' : 'light';
    }

    function updateMetaThemeColor() {
        const meta = document.querySelector('meta[name="theme-color"]');
        const bg = getComputedStyle(root).getPropertyValue('--bg-color').trim();
        if (meta && bg) meta.setAttribute('content', bg);
    }

    function updateToggleUI(resolved) {
        if (!toggle) return;
        toggle.dataset.mode = resolved;
        toggle.setAttribute('aria-label', labels[resolved]);
        toggle.title = labels[resolved];
    }

    function refresh() {
        updateToggleUI(getResolvedTheme());
        updateMetaThemeColor();
    }

    refresh();

    if (toggle) {
        toggle.addEventListener('click', () => {
            const next = getResolvedTheme() === 'dark' ? 'light' : 'dark';
            root.setAttribute('data-theme', next);
            try {
                localStorage.setItem('theme-preference', next);
            } catch (e) {}
            refresh();
        });
    }

    darkMediaQuery.addEventListener('change', () => {
        if (!hasExplicitTheme()) refresh();
    });
})();


// Effetto parallasse/rotazione sottile per le grafiche secondarie durante lo scroll
window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    
    // Grafica Hero (già presente)
    const scrollGraphic = document.getElementById('scrollGraphic');
    if (scrollGraphic) {
        const rotation = scrollY * 0.15;
        const scale = 1 + (scrollY * 0.0003);
        scrollGraphic.style.transform = `rotate(${rotation}deg) scale(${Math.min(scale, 1.2)})`;
    }

    // Grafiche secondarie (ruotano in senso opposto o a velocità diversa per dare dinamismo)
    const secondaryGraphics = document.querySelectorAll('.section-graphic svg');
    secondaryGraphics.forEach((svg, index) => {
        const speed = (index % 2 === 0) ? 0.05 : -0.05;
        const rotation = scrollY * speed;
        svg.style.transform = `rotate(${rotation}deg)`;
    });
});