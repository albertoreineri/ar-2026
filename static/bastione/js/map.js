// Generatore pseudo-casuale con seme (mulberry32): stesso seme = stessa mappa
function creaRandom(seme) {
    let s = seme >>> 0;
    return () => { s = (s + 0x6D2B79F5) >>> 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}

// Genera la mappa: erba con boschi, laghetti, pietra e ferro. profilo = quante macchie di ciascun tipo, seme = mappa ripetibile
function generaMappa(profilo = {}, seme = Date.now()) {
    const rnd = creaRandom(seme), tra = (a, b) => a + Math.floor(rnd() * (b - a + 1));
    const p = { alberi: 18, acqua: 4, pietra: 4, ferro: 3, ...profilo };
    const m = [];
    for (let y = 0; y < MAP_H; y++) {
        m.push(new Array(MAP_W).fill(T.ERBA));
    }
    const macchie = (tipo, n, rMin, rMax) => {
        for (let i = 0; i < n; i++) {
            const cx = tra(0, MAP_W - 1), cy = tra(0, MAP_H - 1);
            const r = tra(rMin, rMax);
            for (let y = cy - r; y <= cy + r; y++)
                for (let x = cx - r; x <= cx + r; x++)
                    if (m[y] && m[y][x] !== undefined && Math.hypot(x - cx, y - cy) <= r && rnd() < 0.85)
                        m[y][x] = tipo;
        }
    };
    macchie(T.ALBERO, p.alberi, 3, 6);
    macchie(T.ACQUA, p.acqua, 2, 4);
    macchie(T.PIETRA, p.pietra, 2, 3);
    macchie(T.FERRO, p.ferro, 2, 3);
    // zone di partenza libere (default: il centro; assedio: attorno alle due basi)
    for (const [x1, y1, x2, y2] of p.libere || [[MAP_W / 2 - 8, MAP_H / 2 - 6, MAP_W / 2 + 5, MAP_H / 2 + 5]])
        for (let y = y1; y <= y2; y++) for (let x = x1; x <= x2; x++) m[y][x] = T.ERBA;
    return m;
}

// Immagini del pack Kenney (img/): chiave = nome file
const IMMAGINI_MAPPA = ['erba1', 'erba2', 'erba3', 'erba4', 'erba5', 'acqua1', 'acqua2', 'pietra1', 'pietra2', 'ferro1', 'ferro2',
    'albero1', 'albero2', 'albero3', 'roccia1', 'roccia2', 'roccia3', 'minerale1', 'minerale2', 'minerale3'];

function caricaImmaginiMappa(scene) {
    for (const k of IMMAGINI_MAPPA) scene.load.image(k, `img/${k}.png`);
}

// Disegna tutta la mappa su una texture: prima il terreno, poi gli oggetti (alberi, rocce) riga per riga così si sovrappongono bene
function disegnaMappa(scene, mappa) {
    const rt = scene.add.renderTexture(0, 0, MAP_W * TILE, MAP_H * TILE).setOrigin(0).setDepth(-1);
    const h = (x, y) => (x * 7 + y * 13 + x * y) % 100; // variante deterministica per tile
    const OGGETTO = { [T.ALBERO]: ['albero1', 'albero1', 'albero2', 'albero3'], [T.PIETRA]: ['roccia1', 'roccia2', 'roccia3'], [T.FERRO]: ['minerale1', 'minerale2', 'minerale3'] };
    rt.beginDraw();
    for (let y = 0; y < MAP_H; y++) for (let x = 0; x < MAP_W; x++) {
        const t = mappa[y][x], v = h(x, y);
        let k;
        if (t === T.ACQUA) k = (x + y) % 2 ? 'acqua1' : 'acqua2';
        else if (t === T.PIETRA) k = v % 2 ? 'pietra1' : 'pietra2';
        else if (t === T.FERRO) k = v % 2 ? 'ferro1' : 'ferro2';
        else k = v < 70 ? 'erba1' : v < 90 ? 'erba2' : ['erba3', 'erba4', 'erba5'][v % 3]; // alberi: terreno d'erba sotto
        rt.batchDraw(k, x * TILE, y * TILE);
    }
    for (let y = 0; y < MAP_H; y++) for (let x = 0; x < MAP_W; x++) {
        const lista = OGGETTO[mappa[y][x]];
        if (!lista) continue;
        const v = h(x, y), cx = x * TILE + TILE / 2 + (v % 5 - 2), cy = y * TILE + TILE / 2 - (mappa[y][x] === T.ALBERO ? 6 : 0);
        rt.batchDraw(lista[v % lista.length], cx - 22, cy - 22);
    }
    rt.endDraw();
    return rt;
}

// Rettangolo del ponte di un portone: il lato davanti nella direzione dir (N di default)
function rettPonte(tx, ty, w, h, dir) {
    if (dir === 'S') return { x: tx, y: ty + h, w, h: 1 };
    if (dir === 'E') return { x: tx + w, y: ty, w: 1, h };
    if (dir === 'O') return { x: tx - 1, y: ty, w: 1, h };
    return { x: tx, y: ty - 1, w, h: 1 };
}

// Definizione con direzione applicata: per E/O il portone è verticale (w e h invertiti)
function conDirezione(def, dir) {
    if (!def.ponte) return def;
    const vert = dir === 'E' || dir === 'O';
    return { ...def, dir: dir || 'N', w: vert ? def.h : def.w, h: vert ? def.w : def.h };
}

// Controlla se un'area è libera (solo erba, nessun edificio sopra)
function areaLibera(mappa, tx, ty, def) {
    const { w, h } = def, tipo = def.deposito === undefined ? T.ERBA : def.deposito;
    if (tx < 0 || ty < 0 || tx + w > MAP_W || ty + h > MAP_H) return false;
    for (let y = ty; y < ty + h; y++)
        for (let x = tx; x < tx + w; x++)
            if (mappa[y][x] !== tipo) return false;
    const ov = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
    const area = { x: tx, y: ty, w, h }, zona = def.ponte ? rettPonte(tx, ty, w, h, def.dir) : null;
    if (zona) {
        if (zona.x < 0 || zona.y < 0 || zona.x + zona.w > MAP_W || zona.y + zona.h > MAP_H) return false;
        for (let y = zona.y; y < zona.y + zona.h; y++)
            for (let x = zona.x; x < zona.x + zona.w; x++) if (mappa[y][x] !== T.ERBA) return false; // davanti serve erba (il fossato si sostituisce)
    }
    return !stato.edifici.some(e => {
        const r = { x: e.tx, y: e.ty, w: e.def.w, h: e.def.h };
        if (!(def.sopraMuri && e.tipo === 'muro') && ov(area, r)) return true;
        if (e.ponte && ov(area, e.ponte)) return true;
        return zona && e.tipo !== 'fossato' && (ov(zona, r) || (e.ponte && ov(zona, e.ponte)));
    });
}
