// posizione del mouse nella finestra (null se è fuori), per lo scorrimento ai bordi
let mouseFinestra = null;
const BORDO_SCROLL = 8;
window.addEventListener('mousemove', e => mouseFinestra = { x: e.clientX, y: e.clientY });
document.addEventListener('mouseleave', () => mouseFinestra = null);

const SOGLIA_TOCCO = 12; // px: oltre questa distanza un dito che si muove è un trascinamento
let aggiornaComandiTouch = null;
let tocco = null, pinch = null, hudAltezza = 0; // stato dei gesti touch
const TOUCH = window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
let usaTouch = TOUCH, modoDito = 'sposta'; // modoDito: 'sposta' (trascina = scorre la mappa), 'area' (selezione ad area), 'disegna' (muri e fossati)
let puntoAnteprima = { x: window.innerWidth / 2, y: window.innerHeight / 2 }; // dove si piazza con il touch (si sposta con un tocco, si conferma col bottone)
window.addEventListener('pointermove', e => { if (e.pointerType) usaTouch = e.pointerType === 'touch'; });
const puntoPuntatore = scene => usaTouch ? puntoAnteprima : scene.input.activePointer;
let inPausa = false; // con la pausa il tempo di gioco non avanza (si può comunque guardare la mappa e costruire)
let ultimoClick = null; // per il doppio clic su un'unità
let dirCostruzione = 'N'; // direzione del portone in costruzione (tasto R per girarlo)
let mappa, mapGfx, ghost, gfxLavoratori, gfxUnita, gfxAlto, selezione = null, dragStart = null, destroDown = null;

const scena = {
    preload() { caricaImmaginiMappa(this); this.load.atlasXML('rts', 'img/rts.png', 'img/rts.xml'); this.load.atlasXML('rts1', 'img/rts1.png', 'img/rts1.xml'); caricaMusica(this); },
    create() {
        mappa = generaMappa(partita.mappa, partita.seme);
        if (MODO_DEMO) preparaTerrenoDemo(mappa);
        mapGfx = disegnaMappa(this, mappa);
        ghost = this.add.graphics().setDepth(10);
        gfxLavoratori = this.add.graphics().setDepth(5.9); // carichi e bandierine, sopra gli sprite dei lavoratori
        gfxUnita = this.add.graphics().setDepth(5.5);
        gfxAlto = this.add.graphics().setDepth(8); // barre della vita ed effetti dei colpi, sopra gli sprite

        const cam = this.cameras.main;
        cam.setBounds(0, 0, MAP_W * TILE, MAP_H * TILE);
        cam.centerOn(MAP_W * TILE / 2, MAP_H * TILE / 2);

        this.cursori = this.input.keyboard.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT,ESC');
        this.input.mouse.disableContextMenu();
        this.input.keyboard.on('keydown-N', () => { if (MODO_TEST || MODO_DEMO) generaOndata(); }); // test: ondata subito
        this.input.keyboard.on('keydown-R', () => {
            if (!selezione || !EDIFICI[selezione].ponte) return;
            dirCostruzione = { N: 'E', E: 'S', S: 'O', O: 'N' }[dirCostruzione];
            mostraMsg('Ponte a ' + NOMI_DIREZIONE[dirCostruzione]);
        });

        // Zoom con rotella
        this.input.on('wheel', (p, o, dx, dy) => {
            cam.setZoom(Phaser.Math.Clamp(cam.zoom * (dy > 0 ? 0.9 : 1.1), zoomMinimo(this), 2));
        });
        // Touch: un dito che trascina sposta la mappa, due dita fanno zoom (pizzico); un tocco breve seleziona, muove o piazza
        this.input.addPointer(1);
        // Trascina con tasto destro/centrale
        this.input.on('pointermove', p => {
            const p1 = this.input.pointer1, p2 = this.input.pointer2;
            if (p1.isDown && p2.isDown) { // pizzico: zoom sulla distanza tra le dita, e la mappa segue il punto medio
                const d = Phaser.Math.Distance.Between(p1.x, p1.y, p2.x, p2.y), cx = (p1.x + p2.x) / 2, cy = (p1.y + p2.y) / 2;
                if (pinch) {
                    cam.setZoom(Phaser.Math.Clamp(cam.zoom * d / pinch.d, zoomMinimo(this), 2));
                    cam.scrollX -= (cx - pinch.cx) / cam.zoom; cam.scrollY -= (cy - pinch.cy) / cam.zoom;
                }
                pinch = { d, cx, cy }; dragStart = null; tocco = null;
                return;
            }
            pinch = null;
            if (p.wasTouch && tocco && modoDito === 'disegna' && selezione) { tentaPiazza(this, p, true); return; } // il dito disegna muri o fossati
            if (p.wasTouch && tocco && modoDito === 'area') return; // il dito disegna il riquadro di selezione (lo mostra aggiornaGhost)
            if (p.wasTouch && tocco) {
                if (Math.hypot(p.x - tocco.x, p.y - tocco.y) > SOGLIA_TOCCO) tocco.pan = true;
                if (tocco.pan) { cam.scrollX -= (p.x - p.prevPosition.x) / cam.zoom; cam.scrollY -= (p.y - p.prevPosition.y) / cam.zoom; dragStart = null; }
                return;
            }
            if (p.leftButtonDown() && !p.wasTouch && selezione && selezione !== 'demolisci' && EDIFICI[selezione].trascina) tentaPiazza(this, p, true);
            if (p.rightButtonDown() || p.middleButtonDown()) {
                cam.scrollX -= (p.x - p.prevPosition.x) / cam.zoom;
                cam.scrollY -= (p.y - p.prevPosition.y) / cam.zoom;
            }
        });
        // Sinistro: piazza edificio, oppure seleziona (clic, doppio clic = stesso tipo, trascinamento = area) e muove le unità selezionate. Destro: scorre la mappa; senza trascinare annulla la selezione
        this.input.on('pointerdown', p => {
            if (p.rightButtonDown()) destroDown = { x: p.x, y: p.y };
            if (!p.leftButtonDown()) return;
            if (p.wasTouch) tocco = { x: p.x, y: p.y, pan: false };
            if (!selezione) { dragStart = { x: p.x, y: p.y }; return; }
            if (p.wasTouch) { if (modoDito === 'disegna') tentaPiazza(this, p, true); return; } // altrimenti con il dito un tocco sposta solo l'anteprima
            tentaPiazza(this, p, false);
        });
        this.input.on('pointerup', p => {
            if (p.wasTouch) {
                const t = tocco;
                tocco = null;
                if (!t || t.pan) { dragStart = null; return; } // era un trascinamento o un pizzico: nessuna azione
                if (selezione) { if (modoDito !== 'disegna') puntoAnteprima = { x: p.x, y: p.y }; return; } // il tocco posiziona l'anteprima; si piazza col bottone ✔
            }
            if (p.button === 2 && destroDown) {
                const mosso = Math.hypot(p.x - destroDown.x, p.y - destroDown.y) > 5;
                destroDown = null;
                if (mosso) return;
                if (selezione) return selezionaEdificio(null);
                stato.unita.forEach(u => u.sel = false); // clic destro senza trascinare: annulla la selezione
                edificioSelezionato = null;
            }
            if (p.button === 0 && dragStart) {
                const cam = this.cameras.main, a = cam.getWorldPoint(dragStart.x, dragStart.y), b = cam.getWorldPoint(p.x, p.y);
                const click = Math.hypot(p.x - dragStart.x, p.y - dragStart.y) < (p.wasTouch ? SOGLIA_TOCCO : 5);
                dragStart = null;
                if (modoDito === 'area') { modoDito = 'sposta'; if (click) return; } // la selezione ad area vale una volta sola
                const selezionate = stato.unita.some(u => u.sel);
                if (click) {
                    const margine = p.wasTouch ? 16 : 6, ora = performance.now();
                    const u = stato.unita.filter(u => Math.hypot(u.x - b.x, u.y - b.y) < u.d.raggio + margine).sort((x, y) => Math.hypot(x.x - b.x, x.y - b.y) - Math.hypot(y.x - b.x, y.y - b.y))[0]; // la più vicina al tocco
                    if (u) { // clic su un'unità: la seleziona; doppio clic: tutte quelle dello stesso tipo
                        const doppio = ultimoClick && ultimoClick.tipo === u.tipo && ora - ultimoClick.t < 400;
                        stato.unita.forEach(x => x.sel = doppio ? x.tipo === u.tipo : x === u);
                        edificioSelezionato = null;
                        ultimoClick = { tipo: u.tipo, t: ora };
                        return;
                    }
                    ultimoClick = null;
                    const ed = stato.edifici.find(e => b.x >= e.tx * TILE && b.x < (e.tx + e.def.w) * TILE && b.y >= e.ty * TILE && b.y < (e.ty + e.def.h) * TILE);
                    if (ed && !(selezionate && muroAmico(ed) && stato.unita.some(x => x.sel && x.d.sulleMura))) { stato.unita.forEach(x => x.sel = false); edificioSelezionato = ed; return; }
                    if (selezionate) { const { tx, ty } = tileSotto(this, p); return comanda(mappa, tx, ty); } // clic su terreno: muove le unità selezionate
                    edificioSelezionato = null;
                } else {
                    edificioSelezionato = null;
                    const x1 = Math.min(a.x, b.x), x2 = Math.max(a.x, b.x), y1 = Math.min(a.y, b.y), y2 = Math.max(a.y, b.y);
                    stato.unita.forEach(u => u.sel = u.x >= x1 && u.x <= x2 && u.y >= y1 && u.y <= y2);
                }
            }
        });

        // fortezza e magazzino iniziali gratuiti al centro
        const base = partita.base || { tx: MAP_W / 2 - 6, ty: MAP_H / 2 - 3 };
        piazzaEdificio(this, mappa, 'fortezza', base.tx, base.ty, true);
        piazzaEdificio(this, mappa, 'magazzino', base.tx + 5, base.ty + 2, true);
        if (partita.modo === 'assedio') costruisciCastello(this);
        cam.centerOn((base.tx + 2.5) * TILE, (base.ty + 2.5) * TILE);
        if (MODO_DEMO) popolaDemo(this);
        // finestra ridimensionata: rimetti lo zoom dentro i limiti
        this.scale.on('resize', () => cam.setZoom(Math.max(cam.zoom, zoomMinimo(this))));
        cam.setZoom(Math.max(cam.zoom, zoomMinimo(this)));
        creaMenu();
        creaMusica(this);
        const pausa = document.createElement('button');
        pausa.style.cssText = 'background: none; border: none; font-size: 18px; cursor: pointer; padding: 0 4px;';
        const alternaPausa = () => { inPausa = !inPausa; pausa.textContent = inPausa ? '▶️' : '⏸️'; document.getElementById('msg').textContent = inPausa ? '⏸️ In pausa' : ''; };
        pausa.textContent = '⏸️'; pausa.title = 'Pausa (P)';
        pausa.onclick = () => { pausa.blur(); alternaPausa(); };
        document.getElementById('hud').insertBefore(pausa, document.getElementById('msg'));
        this.input.keyboard.on('keydown-P', alternaPausa);
        if (TOUCH) aggiornaComandiTouch = creaComandiTouch(this);
    },
    update(time, delta) {
        const cam = this.cameras.main, k = this.cursori, v = 600 * delta / 1000 / cam.zoom;
        if (k.A.isDown || k.LEFT.isDown) cam.scrollX -= v;
        if (k.D.isDown || k.RIGHT.isDown) cam.scrollX += v;
        if (k.W.isDown || k.UP.isDown) cam.scrollY -= v;
        if (k.S.isDown || k.DOWN.isDown) cam.scrollY += v;
        if (mouseFinestra) {
            if (mouseFinestra.x <= BORDO_SCROLL) cam.scrollX -= v;
            if (mouseFinestra.x >= window.innerWidth - BORDO_SCROLL) cam.scrollX += v;
            if (mouseFinestra.y <= BORDO_SCROLL) cam.scrollY -= v;
            if (mouseFinestra.y >= window.innerHeight - BORDO_SCROLL) cam.scrollY += v;
        }
        if (k.ESC.isDown) selezionaEdificio(null);
        const hud = document.getElementById('hud').offsetHeight; // il pannello info resta sotto l'HUD anche quando va a capo
        if (hud !== hudAltezza) { hudAltezza = hud; document.documentElement.style.setProperty('--hud-h', hud + 8 + 'px'); }

        const dt = inPausa ? 0 : delta / 1000;
        aggiornaEconomia(mappa, dt);
        // ridisegna la mappa se un albero è stato abbattuto
        if (mappaSporca) {
            mappaSporca = false;
            mapGfx.destroy(); mapGfx = disegnaMappa(this, mappa); mapGfx.setDepth(-1);
        }
        aggiornaUnita(dt);
        aggiornaCombattimento(dt);
        aggiornaMusica(this, dt);
        separaUnita();
        disegnaLavoratori(gfxLavoratori, this, time);
        sincronizzaSprite(this, time);
        disegnaUnita(gfxUnita);
        disegnaCombattimento(gfxAlto);
        aggiornaPannello();
        aggiornaGhost(this);
        aggiornaHud();
        if (aggiornaComandiTouch) aggiornaComandiTouch();
    },
};

// Piazza (o demolisce) sotto il puntatore; silenzioso = niente messaggi d'errore (per i muri trascinati)
function tentaPiazza(scene, p, silenzioso) {
    const { tx, ty } = tileSotto(scene, p);
    if (selezione === 'demolisci') {
        const e = edificioA(tx, ty);
        if (e) demolisci(e);
        return;
    }
    const def = conDirezione(EDIFICI[selezione], dirCostruzione), msg = silenzioso ? () => {} : mostraMsg;
    if (!puoPagare(def)) return msg('Risorse insufficienti');
    if (!areaLibera(mappa, tx, ty, def)) return msg('Posizione non valida');
    piazzaEdificio(scene, mappa, selezione, tx, ty, false, dirCostruzione);
}

// Zoom minimo: la mappa deve coprire tutta la finestra, senza bordi neri
function zoomMinimo(scene) {
    return Math.max(scene.scale.width / (MAP_W * TILE), scene.scale.height / (MAP_H * TILE));
}

function tileSotto(scene, p) {
    const w = scene.cameras.main.getWorldPoint(p.x, p.y);
    return { tx: Math.floor(w.x / TILE), ty: Math.floor(w.y / TILE) };
}

function aggiornaGhost(scene) {
    ghost.clear();
    if (edificioSelezionato) {
        const e = edificioSelezionato;
        ghost.lineStyle(3, 0xf1c40f, 1).strokeRect(e.tx * TILE, e.ty * TILE, e.def.w * TILE, e.def.h * TILE);
    }
    const p = scene.input.activePointer;
    if (dragStart && p.leftButtonDown() && Math.hypot(p.x - dragStart.x, p.y - dragStart.y) >= 5) {
        const a = scene.cameras.main.getWorldPoint(dragStart.x, dragStart.y), b = scene.cameras.main.getWorldPoint(p.x, p.y);
        ghost.lineStyle(2, 0xffffff, 1).strokeRect(a.x, a.y, b.x - a.x, b.y - a.y);
    }
    if (!selezione) return;
    const { tx, ty } = tileSotto(scene, puntoPuntatore(scene));
    if (selezione === 'demolisci') {
        const e = edificioA(tx, ty);
        if (e) ghost.fillStyle(0xff0000, 0.45).fillRect(e.tx * TILE, e.ty * TILE, e.def.w * TILE, e.def.h * TILE);
        return;
    }
    const def = conDirezione(EDIFICI[selezione], dirCostruzione);
    const ok = areaLibera(mappa, tx, ty, def) && puoPagare(def);
    ghost.fillStyle(ok ? 0x00ff00 : 0xff0000, 0.45).fillRect(tx * TILE, ty * TILE, def.w * TILE, def.h * TILE);
    if (def.ponte) { const r = rettPonte(tx, ty, def.w, def.h, def.dir); ghost.fillStyle(ok ? 0x8b5a2b : 0xff0000, 0.45).fillRect(r.x * TILE, r.y * TILE, r.w * TILE, r.h * TILE); }
}

function selezionaEdificio(tipo) {
    selezione = tipo;
    modoDito = 'sposta';
    if (tipo) puntoAnteprima = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    if (tipo) { edificioSelezionato = null; stato.unita.forEach(u => u.sel = false); }
    const apri = document.getElementById('menu-apri');
    if (apri) apri.textContent = tipo ? '✖ Annulla' : '🔨 Costruisci';
}

// Annulla: costruzione in corso, altrimenti selezione di unità o edificio
function annullaTutto() {
    if (selezione) return selezionaEdificio(null);
    stato.unita.forEach(u => u.sel = false);
    edificioSelezionato = null;
    modoDito = 'sposta';
}

// Bottoni touch (solo su dispositivi touch): ✖ annulla, ✔ conferma costruzione, ⬚ area, ✏️ disegna muri
function creaComandiTouch(scene) {
    const box = document.createElement('div');
    box.id = 'comandi-touch';
    const bottone = (id, testo, onclick) => { const b = document.createElement('button'); b.id = id; b.textContent = testo; b.onclick = onclick; box.appendChild(b); return b; };
    bottone('btn-disegna', '✏️ Disegna', () => { modoDito = modoDito === 'disegna' ? 'sposta' : 'disegna'; });
    bottone('btn-area', '⬚ Area', () => { modoDito = modoDito === 'area' ? 'sposta' : 'area'; });
    bottone('btn-conferma', '✔ Piazza', () => tentaPiazza(scene, puntoAnteprima, false));
    bottone('btn-annulla', '✖ Annulla', annullaTutto);
    document.body.appendChild(box);
    return () => { // chiamata a ogni frame: mostra solo i bottoni utili
        const unita = stato.unita.some(u => u.sel), costruendo = !!selezione, tr = costruendo && selezione !== 'demolisci' && EDIFICI[selezione].trascina;
        const vis = { 'btn-disegna': tr, 'btn-area': !costruendo, 'btn-conferma': costruendo, 'btn-annulla': costruendo || unita || !!edificioSelezionato };
        for (const [id, v] of Object.entries(vis)) {
            const b = document.getElementById(id);
            b.style.display = v ? 'block' : 'none';
            b.classList.toggle('attivo', (id === 'btn-area' && modoDito === 'area') || (id === 'btn-disegna' && modoDito === 'disegna'));
        }
        document.getElementById('btn-conferma').textContent = selezione === 'demolisci' ? '✔ Demolisci' : '✔ Piazza';
    };
}

function creaMenu() {
    const menu = document.getElementById('menu');
    const popup = document.createElement('div'), apri = document.createElement('button');
    popup.id = 'menu-popup';
    apri.id = 'menu-apri';
    apri.textContent = '🔨 Costruisci';
    menu.append(popup, apri);

    // livello 1: categorie; livello 2: edifici della categoria
    const chiudi = () => popup.classList.remove('aperto');
    const aggiungi = (testo, onclick, tipo) => {
        const b = document.createElement('button');
        b.textContent = testo;
        if (tipo) b.dataset.tipo = tipo;
        b.onclick = onclick;
        popup.appendChild(b);
    };
    const mostraCategorie = () => {
        popup.innerHTML = '';
        for (const [cat, nome] of Object.entries(CATEGORIE)) aggiungi(nome, () => mostraEdifici(cat));
        aggiungi('🗑️ Demolisci', () => { selezionaEdificio('demolisci'); chiudi(); }, 'demolisci');
    };
    const mostraEdifici = cat => {
        popup.innerHTML = '';
        aggiungi('← ' + CATEGORIE[cat], mostraCategorie);
        for (const [tipo, def] of Object.entries(EDIFICI)) {
            if (def.categoria !== cat) continue;
            aggiungi(`${def.icona} ${def.nome} (${etichettaCosto(def)})`, () => def.ponte ? mostraDirezioni(tipo, cat) : (selezionaEdificio(tipo), chiudi()), tipo);
        }
    };
    // livello 3 (solo portone): dove si affaccia il ponte
    const mostraDirezioni = (tipo, cat) => {
        popup.innerHTML = '';
        aggiungi('← ' + EDIFICI[tipo].nome, () => mostraEdifici(cat));
        for (const [d, nome] of Object.entries(NOMI_DIREZIONE))
            aggiungi(`${FRECCE_DIREZIONE[d]} Ponte a ${nome}`, () => { dirCostruzione = d; selezionaEdificio(tipo); chiudi(); });
    };
    apri.onclick = () => {
        if (selezione) { selezionaEdificio(null); return chiudi(); }
        if (popup.classList.toggle('aperto')) mostraCategorie();
    };
    // click/tap fuori dal menu = chiude il menu (senza piazzare nulla)
    document.addEventListener('pointerdown', ev => {
        if (popup.classList.contains('aperto') && !menu.contains(ev.target)) {
            chiudi();
            ev.stopPropagation();
        }
    }, true);
}

if (partita) new Phaser.Game({ type: Phaser.AUTO, width: window.innerWidth, height: window.innerHeight, backgroundColor: '#000', scale: { mode: Phaser.Scale.RESIZE }, fps: { forceSetTimeOut: true, min: 1 }, disableVisibilityChange: true, scene: scena }); // il gioco prosegue anche con la scheda in secondo piano (il browser rallenta i timer, ma non li ferma)
