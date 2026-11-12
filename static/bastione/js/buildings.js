let versioneMappa = 0; // cresce a ogni cambio di edifici: invalida il campo di flusso dei nemici

function mostraMsg(testo) {
    const el = document.getElementById('msg');
    el.textContent = testo;
    clearTimeout(mostraMsg.t);
    mostraMsg.t = setTimeout(() => el.textContent = '', 2500);
}

function aggiornaHud() {
    const set = (id, t) => document.getElementById(id).textContent = t;
    set('r-oro', `💰 ${Math.floor(stato.oro)}`);
    set('r-legno', `🪵 ${Math.floor(stato.legno)}`);
    set('r-pietra', `🪨 ${Math.floor(stato.pietra)}`);
    set('r-ferro', `⛏️ ${Math.floor(stato.ferro)}`);
    set('r-pane', `🍞 ${Math.floor(stato.pane)}`);
    set('r-formaggio', `🧀 ${Math.floor(stato.formaggio)}`);
    set('r-pop', `👥 ${stato.pop}/${stato.popMax}`);
}

// Compra o vende un lotto di una risorsa al mercato
function commercia(risorsa, compra) {
    const p = PREZZI[risorsa], n = LOTTO_MERCATO;
    if (compra) {
        if (stato.oro < p.compra * n) return mostraMsg('Oro insufficiente');
        stato.oro -= p.compra * n; stato[risorsa] += n;
    } else {
        if (stato[risorsa] < n) return mostraMsg(`Servono ${n} ${risorsa}`);
        stato[risorsa] -= n; stato.oro += p.vendi * n;
    }
}

function puoPagare(def) {
    return stato.legno >= def.costo && stato.pietra >= (def.costoPietra || 0);
}

function etichettaCosto(def) {
    return [def.costo && `${def.costo}🪵`, def.costoPietra && `${def.costoPietra}🪨`].filter(Boolean).join(' ') || 'gratis';
}

// Crea le immagini dell'edificio: uno sprite singolo (def.sprite) oppure più parti (def.parti)
function creaSprite(scene, def, tx, ty) {
    const parti = def.parti || (def.sprite ? [{ f: def.sprite }] : []);
    return parti.map((p, i) => {
        const a = p.a || 'rts', f = scene.textures.getFrame(a, p.f);
        if (p.riempi) return scene.add.image(tx * TILE, ty * TILE, a, p.f).setOrigin(0).setDisplaySize(def.w * TILE, def.h * TILE).setDepth(-0.5);
        const bx = (tx + def.w * (p.x ?? 0.5)) * TILE, by = (ty + def.h * (p.y ?? 1)) * TILE - (p.y === undefined ? 2 : 0);
        const s = p.l ? p.l * def.w * TILE / f.width : Math.min(def.w * TILE / f.width, def.h * TILE * 1.25 / f.height); // senza l: adatta l'area (max 1,25 volte l'altezza)
        return scene.add.image(bx, by, a, p.f).setOrigin(0.5, 1).setScale(s).setDepth(1 + i * 0.01);
    });
}

// Decorazioni disegnate: righe di grano nel campo, mucche nel recinto
function disegnaDecoro(g, e) {
    const x0 = e.tx * TILE, y0 = e.ty * TILE, W = e.def.w * TILE, H = e.def.h * TILE;
    if (e.def.decoro === 'grano') {
        g.fillStyle(0xd9a52e, 1);
        for (let y = 14; y < H - 6; y += 8) for (let x = 8; x < W - 6; x += 7) if (!(x < 34 && y < 38)) g.fillRect(x0 + x, y0 + y, 2, 5);
    } else if (e.def.decoro === 'mucche') {
        for (const [fx, fy] of [[0.3, 0.68], [0.68, 0.6], [0.5, 0.88]]) {
            const cx = x0 + W * fx, cy = y0 + H * fy;
            g.fillStyle(0xffffff, 1).fillEllipse(cx, cy, 13, 8).fillCircle(cx + 7, cy - 1, 3.5);
            g.fillStyle(0x333333, 1).fillCircle(cx - 2, cy - 1, 2).fillCircle(cx + 3, cy + 1.5, 1.5).fillRect(cx + 8, cy - 4, 2, 2);
        }
    }
}

// nemico = edificio del castello nemico (modalità assedio): niente popolazione, tinto di rosso, vita scalata dal livello
function piazzaEdificio(scene, mappa, tipo, tx, ty, gratis, dir, nemico) {
    const def = conDirezione(EDIFICI[tipo], dir);
    if (!gratis) { stato.legno -= def.costo; stato.pietra -= def.costoPietra || 0; }
    const ponte = def.ponte ? rettPonte(tx, ty, def.w, def.h, def.dir) : null;
    if (def.sopraMuri || ponte) { // sostituisce i muri sotto l'edificio e i fossati davanti (senza rimborso)
        const dentro = (e, r) => e.tx >= r.x && e.tx < r.x + r.w && e.ty >= r.y && e.ty < r.y + r.h;
        const area = { x: tx, y: ty, w: def.w, h: def.h };
        for (const m of stato.edifici.filter(e => (e.tipo === 'muro' && def.sopraMuri && dentro(e, area)) || (e.tipo === 'fossato' && ponte && dentro(e, ponte)))) {
            m.gfx.destroy();
            stato.edifici.splice(stato.edifici.indexOf(m), 1);
        }
    }
    const gfx = scene.add.graphics();
    const imgs = creaSprite(scene, def, tx, ty);
    const label = def.w * def.h > 1 && !def.sprite && !def.parti && !def.stile ? scene.add.text((tx + def.w / 2) * TILE, (ty + def.h / 2) * TILE, def.nome, { fontSize: '11px', color: def.nonCostruibile ? '#fff' : '#000' }).setOrigin(0.5) : null;
    const ed = { tipo, def, tx, ty, nemico: !!nemico, porta: { x: tx + Math.floor(def.w / 2), y: ty + def.h } };
    ed.casa = { x: (ed.porta.x + 0.5) * TILE, y: (ed.porta.y + 0.5) * TILE };
    ed.gfx = gfx; ed.label = label; ed.imgs = imgs;
    if (def.apribile) ed.aperto = true;
    ed.hpMax = ed.hp = Math.round((def.hp || HP_EDIFICIO) * (nemico ? partita.hpNemici || 1 : 1));
    if (nemico) imgs.forEach(i => i.setTint(0xffa0a0));
    versioneMappa++;
    ed.ponte = ponte; ed.dir = def.dir;
    disegnaEdificio(ed);
    stato.edifici.push(ed);
    if (def.risorsa) creaLavoratore(ed);
    if (def.popolazione && !nemico) stato.popMax += def.popolazione;
    return ed;
}

// Disegna il rettangolo dell'edificio; un portone aperto è semitrasparente con i bordi tratteggiati
function disegnaEdificio(e) {
    disegnaEdificioBase(e);
    if (e.nemico && !e.def.sprite && !e.def.parti) { // gli edifici disegnati a codice si segnano con una velatura rossa
        const { def, tx, ty } = e;
        e.gfx.fillStyle(0xc0392b, 0.28).fillRect(tx * TILE, ty * TILE, def.w * TILE, def.h * TILE);
    }
}

function disegnaEdificioBase(e) {
    const { def, tx, ty } = e, g = e.gfx, aperto = def.apribile && e.aperto;
    g.clear();
    if (def.parti) return void disegnaDecoro(g, e);
    if (def.sprite) return void g.fillStyle(0x8a6b3f, 0.35).fillRect(tx * TILE, ty * TILE, def.w * TILE, def.h * TILE); // terra battuta sotto lo sprite
    if (def.stile === 'muro') return void disegnaMuro(g, tx * TILE, ty * TILE);
    if (def.stile === 'acqua') return void disegnaAcqua(g, tx * TILE, ty * TILE);
    if (def.stile === 'portone') return void disegnaPortone(g, e, aperto);
    g.fillStyle(def.colore, 1).fillRect(tx * TILE, ty * TILE, def.w * TILE, def.h * TILE);
    g.lineStyle(2, 0x000000, 0.6).strokeRect(tx * TILE, ty * TILE, def.w * TILE, def.h * TILE);
}

// Muro di pietra: blocchi sfalsati, bordo chiaro sopra e ombra sotto
function disegnaMuro(g, x, y) {
    g.fillStyle(0xa8acb2, 1).fillRect(x, y, TILE, TILE);
    g.lineStyle(1, 0x7d828a, 1);
    g.lineBetween(x, y + 10, x + TILE, y + 10).lineBetween(x, y + 21, x + TILE, y + 21);
    g.lineBetween(x + 16, y + 4, x + 16, y + 10).lineBetween(x + 8, y + 10, x + 8, y + 21).lineBetween(x + 24, y + 10, x + 24, y + 21).lineBetween(x + 16, y + 21, x + 16, y + TILE);
    g.fillStyle(0xd3d6da, 1).fillRect(x, y, TILE, 4);
    g.fillStyle(0x6f747b, 1).fillRect(x, y + TILE - 3, TILE, 3);
}

// Acqua del fossato: colore dei laghi con piccole onde
function disegnaAcqua(g, x, y) {
    g.fillStyle(0xa6e1f5, 1).fillRect(x, y, TILE, TILE);
    g.lineStyle(2, 0xcdf3ff, 1);
    for (const oy of [9, 23]) g.lineBetween(x + 3, y + oy, x + 9, y + oy - 3).lineBetween(x + 9, y + oy - 3, x + 15, y + oy).lineBetween(x + 15, y + oy, x + 21, y + oy - 3).lineBetween(x + 21, y + oy - 3, x + 27, y + oy);
}

// Portone: cornice di pietra con battenti di legno (chiuso) o varco scuro (aperto); ponte levatoio davanti
function disegnaPortone(g, e, aperto) {
    const { def, tx, ty } = e, x0 = tx * TILE, y0 = ty * TILE, W = def.w * TILE, H = def.h * TILE, orizz = def.w >= def.h;
    for (let j = 0; j < def.h; j++) for (let i = 0; i < def.w; i++) disegnaMuro(g, x0 + i * TILE, y0 + j * TILE);
    const dx = orizz ? x0 + 10 : x0 + 4, dy = orizz ? y0 + 4 : y0 + 10, dw = orizz ? W - 20 : W - 8, dh = orizz ? H - 8 : H - 20;
    const arco = orizz ? { tl: 14, tr: 14, bl: 0, br: 0 } : 4;
    g.fillStyle(0x6f747b, 1).fillRoundedRect(dx - 2, dy - 2, dw + 4, dh + 2, orizz ? { tl: 16, tr: 16, bl: 0, br: 0 } : 6); // arco di pietra scura attorno al varco
    if (aperto) { // varco: interno in penombra, terra battuta per terra, battenti ripiegati ai lati
        g.fillStyle(0x5a4630, 1).fillRoundedRect(dx, dy, dw, dh, arco);
        g.fillStyle(0x8a6b3f, 1).fillRect(orizz ? dx : dx + dw - 9, orizz ? dy + dh - 8 : dy, orizz ? dw : 9, orizz ? 8 : dh);
        g.fillStyle(0x9b6a35, 1).fillRect(dx, dy + 8, orizz ? 5 : dw, orizz ? dh - 8 : 5).fillRect(orizz ? dx + dw - 5 : dx, orizz ? dy + 8 : dy + dh - 5, orizz ? 5 : dw, orizz ? dh - 8 : 5);
    } else { // battenti chiusi: assi di legno con fasce di ferro
        g.fillStyle(0x9b6a35, 1).fillRoundedRect(dx, dy, dw, dh, arco);
        g.lineStyle(1, 0x5e3d1c, 1);
        if (orizz) for (let x = dx + 7; x < dx + dw - 2; x += 7) g.lineBetween(x, dy + 3, x, dy + dh);
        else for (let y = dy + 7; y < dy + dh - 2; y += 7) g.lineBetween(dx + 2, y, dx + dw - 2, y);
        g.fillStyle(0x444a52, 1);
        if (orizz) g.fillRect(dx, dy + 10, dw, 3).fillRect(dx, dy + dh - 9, dw, 3); else g.fillRect(dx + 8, dy, 3, dh).fillRect(dx + dw - 11, dy, 3, dh);
        g.fillStyle(0xe0c060, 1).fillCircle(orizz ? dx + dw / 2 : dx + dw - 6, orizz ? dy + dh / 2 + 2 : dy + dh / 2, 2); // maniglia
    }
    if (e.ponte) { // ponte: assi di legno se aperto, acqua del fossato se chiuso
        const p = e.ponte;
        if (aperto) {
            g.fillStyle(0x9a6a35, 1).fillRect(p.x * TILE, p.y * TILE, p.w * TILE, p.h * TILE);
            g.lineStyle(1, 0x5e3d1c, 1);
            if (p.w >= p.h) for (let x = p.x * TILE + 8; x < (p.x + p.w) * TILE; x += 8) g.lineBetween(x, p.y * TILE, x, (p.y + p.h) * TILE);
            else for (let y = p.y * TILE + 8; y < (p.y + p.h) * TILE; y += 8) g.lineBetween(p.x * TILE, y, (p.x + p.w) * TILE, y);
            g.lineStyle(2, 0x5e3d1c, 1).strokeRect(p.x * TILE, p.y * TILE, p.w * TILE, p.h * TILE);
        } else for (let j = 0; j < p.h; j++) for (let i = 0; i < p.w; i++) disegnaAcqua(g, (p.x + i) * TILE, (p.y + j) * TILE);
    }
}

function alternaPortone(e) {
    e.aperto = !e.aperto;
    versioneMappa++;
    disegnaEdificio(e);
}

const VEL_LAVORATORE = 60; // pixel al secondo
let mappaSporca = false;

function tileDi(w) {
    return { x: Phaser.Math.Clamp(Math.floor(w.x / TILE), 0, MAP_W - 1), y: Phaser.Math.Clamp(Math.floor(w.y / TILE), 0, MAP_H - 1) };
}

function creaLavoratore(e) {
    e.casa = { x: (e.porta.x + 0.5) * TILE, y: (e.porta.y + 0.5) * TILE };
    e.w = { x: e.casa.x, y: e.casa.y, stato: 'cerca', t: 0, attesa: 0, target: null, path: [], porta: false };
    e.scartati = new Set();
}

// Muove il lavoratore verso (x,y); ritorna true quando arriva
function muoviVerso(w, x, y, dt) {
    const d = Math.hypot(x - w.x, y - w.y), passo = (w.vel || VEL_LAVORATORE) * dt;
    if (d <= passo) { w.x = x; w.y = y; return true; }
    w.x += (x - w.x) / d * passo; w.y += (y - w.y) / d * passo;
    return false;
}

// Segue il percorso calcolato; true quando è arrivato in fondo
function muoviLungo(w, dt) {
    while (w.path.length) {
        if (!muoviVerso(w, w.path[0].x, w.path[0].y, dt)) return false;
        w.path.shift();
    }
    return true;
}

// Edificio del tipo richiesto più vicino al lavoratore
function destinoVicino(w, tipo) {
    let best = null, bd = Infinity;
    for (const m of stato.edifici) {
        if (m.tipo !== tipo) continue;
        const d = Math.hypot(m.casa.x - w.x, m.casa.y - w.y);
        if (d < bd) { bd = d; best = m; }
    }
    return best;
}

// Il grano resta nella panetteria, il resto va nelle scorte globali
function deposita(dest, risorsa, n) {
    if (risorsa === 'grano') dest.grano = (dest.grano || 0) + n;
    else stato[risorsa] += n;
}

// Porta il carico alla destinazione (stati 'cercaMag' e 'torna'), poi torna a 'cerca'
function consegna(e, mappa, dt) {
    const w = e.w, d = e.def;
    if (w.stato === 'cercaMag') {
        const dest = destinoVicino(w, d.dest || 'magazzino'), t = tileDi(w);
        const path = dest && trovaPercorso(mappa, t.x, t.y, dest.porta.x, dest.porta.y);
        if (!path) { w.blocco = `Nessun ${d.dest || 'magazzino'} raggiungibile`; w.attesa = 1; return; }
        w.dest = dest; w.path = path; w.stato = 'torna';
    } else if (w.stato === 'torna' && muoviLungo(w, dt)) {
        deposita(w.dest, d.risorsa, d.resa);
        w.porta = false; w.stato = 'cerca';
    }
}

function aggiornaLegnaiolo(e, mappa, dt) {
    const w = e.w;
    if (w.attesa > 0) { w.attesa -= dt; return; }
    w.blocco = null;
    switch (w.stato) {
        case 'cerca': {
            const a = alberoVicino(mappa, e);
            if (!a) { w.blocco = 'Nessun albero raggiungibile'; w.attesa = 1; break; }
            const t = tileDi(w), path = trovaPercorso(mappa, t.x, t.y, a.x, a.y);
            if (!path) { e.scartati.add(a.x + ',' + a.y); break; } // irraggiungibile, prova un altro
            w.target = a; w.path = path; w.stato = 'vaAlbero';
            break;
        }
        case 'vaAlbero':
            if (muoviLungo(w, dt)) { w.stato = 'taglia'; w.t = 0; }
            break;
        case 'taglia':
            w.t += dt;
            if (w.t >= 3) {
                mappa[w.target.y][w.target.x] = T.ERBA;
                mappaSporca = true;
                stato.edifici.forEach(x => x.scartati && x.scartati.clear());
                w.target = null; w.porta = true; w.stato = 'cercaMag';
            }
            break;
        default:
            consegna(e, mappa, dt);
    }
}

// Cava, miniera, fattorie: vanno in un punto accanto all'edificio, lavorano, consegnano
function aggiornaProduttore(e, mappa, dt) {
    const w = e.w, d = e.def;
    if (w.attesa > 0) { w.attesa -= dt; return; }
    w.blocco = null;
    switch (w.stato) {
        case 'cerca': {
            const dentro = d.campoInterno, tx = dentro ? Phaser.Math.Between(e.tx, e.tx + d.w - 1) : Phaser.Math.Between(e.tx - 1, e.tx + d.w), ty = dentro ? Phaser.Math.Between(e.ty, e.ty + d.h - 1) : Phaser.Math.Between(e.ty - 1, e.ty + d.h);
            const t = tileDi(w), path = !tileBloccato(mappa, tx, ty) && trovaPercorso(mappa, t.x, t.y, tx, ty);
            if (!path) { w.attesa = 0.2; break; }
            w.path = path; w.stato = 'vaLavoro';
            break;
        }
        case 'vaLavoro':
            if (muoviLungo(w, dt)) { w.stato = 'lavora'; w.t = 0; }
            break;
        case 'lavora':
            w.t += dt;
            if (w.t >= d.lavoro) { w.porta = true; w.stato = 'cercaMag'; }
            break;
        default:
            consegna(e, mappa, dt);
    }
}

// Panetteria: quando ha abbastanza grano inforna, poi porta il pane al granaio
function aggiornaPanetteria(e, mappa, dt) {
    const w = e.w, d = e.def;
    if (w.attesa > 0) { w.attesa -= dt; return; }
    w.blocco = null;
    switch (w.stato) {
        case 'cerca':
            if ((e.grano || 0) >= d.consuma) { e.grano -= d.consuma; w.stato = 'lavora'; w.t = 0; }
            else { w.blocco = 'Manca il grano'; w.attesa = 0.5; }
            break;
        case 'lavora':
            w.t += dt;
            if (w.t >= d.lavoro) { w.porta = true; w.stato = 'cercaMag'; }
            break;
        default:
            consegna(e, mappa, dt);
    }
}

// Produzione: chiamata ogni frame con delta in secondi
function aggiornaEconomia(mappa, dt) {
    for (const e of stato.edifici) {
        if (e.tipo === 'legnaiolo') aggiornaLegnaiolo(e, mappa, dt);
        else if (e.tipo === 'panetteria') aggiornaPanetteria(e, mappa, dt);
        else if (e.def.risorsa) aggiornaProduttore(e, mappa, dt);
    }
    // la popolazione cresce lentamente se c'è posto e cibo nel granaio
    stato.popTimer = (stato.popTimer || 0) + dt;
    if (stato.popTimer >= 5) {
        stato.popTimer = 0;
        if (stato.pop < stato.popMax) {
            if (stato.pane >= 1) { stato.pop++; stato.pane -= 1; }
            else if (stato.formaggio >= 1) { stato.pop++; stato.formaggio -= 1; }
        }
    }
}

// Disegna i pallini dei lavoratori (un solo Graphics ridisegnato ogni frame)
// Contadino di ogni lavoratore, in base alla risorsa prodotta (frame dell'atlante rts1)
const SPRITE_LAVORATORE = { legno: 'medievalUnit_18.png', pietra: 'medievalUnit_24.png', ferro: 'medievalUnit_24.png', grano: 'medievalUnit_17.png', formaggio: 'medievalUnit_23.png', pane: 'medievalUnit_05.png' };

function disegnaLavoratori(g, scene, t) {
    g.clear();
    for (const e of stato.edifici) {
        const w = e.w;
        if (!w) continue;
        let y = w.y;
        if (w.stato === 'taglia') y += Math.sin(w.t * 20) * 2;        // colpi d'ascia
        if (w.stato === 'lavora') y += Math.sin(w.t * 10) * 3;        // zappa, piccone, impasto
        if (!w.spr) { w.spr = scene.add.image(w.x, w.y, 'rts1', SPRITE_LAVORATORE[e.def.risorsa] || 'medievalUnit_18.png').setOrigin(0.5, 0.85).setDepth(5.8); w.px = w.x; }
        const dx = w.x - w.px, muove = Math.abs(dx) > 0.05 || w.path.length > 0 && w.stato !== 'cerca';
        if (Math.abs(dx) > 0.05) w.spr.setFlipX(dx < 0);
        w.px = w.x;
        w.spr.setPosition(w.x, y - (muove ? Math.abs(Math.sin(t / 90)) * 1.5 : 0));
        if (w.blocco) { // bandierina rossa: edificio bloccato
            const fx = (e.tx + e.def.w) * TILE - 10, fy = e.ty * TILE + 10;
            g.fillStyle(0xe74c3c, 1).fillCircle(fx, fy, 9).lineStyle(1, 0xffffff, 1).strokeCircle(fx, fy, 9);
            g.fillStyle(0xffffff, 1).fillRect(fx - 1, fy - 5, 2, 6).fillRect(fx - 1, fy + 3, 2, 2);
        }
        if (w.porta) g.fillStyle(COLORE_CARICO[e.def.risorsa], 1).fillRect(w.x + 4, y - 3, 5, 5);
    }
}

function alberoVicino(mappa, e) {
    const cx = e.tx + e.def.w / 2, cy = e.ty + e.def.h / 2, r = e.def.raggio || Infinity; // senza raggio cerca su tutta la mappa
    let best = null, bd = Infinity;
    for (let y = Math.max(0, Math.floor(cy - r)); y <= Math.min(MAP_H - 1, cy + r); y++)
        for (let x = Math.max(0, Math.floor(cx - r)); x <= Math.min(MAP_W - 1, cx + r); x++)
            if (mappa[y][x] === T.ALBERO && !alberoPrenotato(x, y) && !e.scartati.has(x + ',' + y)) {
                const d = Math.hypot(x - cx, y - cy);
                if (d <= r && d < bd) { bd = d; best = { x, y }; }
            }
    return best;
}

function alberoPrenotato(x, y) {
    return stato.edifici.some(e => e.w && e.w.target && e.tipo === 'legnaiolo' && e.w.target.x === x && e.w.target.y === y);
}

// Rimuove un edificio rimborsando metà dei costi
function demolisci(ed) {
    if (ed.nemico) return mostraMsg('Non puoi demolire gli edifici nemici');
    if (ed.def.nonCostruibile) return mostraMsg('Non si può demolire');
    stato.legno += Math.floor(ed.def.costo / 2);
    stato.pietra += Math.floor((ed.def.costoPietra || 0) / 2);
    if (ed.def.popolazione) { stato.popMax -= ed.def.popolazione; stato.pop = Math.min(stato.pop, stato.popMax); }
    rimuoviEdificio(ed);
    if (edificioSelezionato === ed) edificioSelezionato = null;
}

function edificioA(tx, ty) {
    return stato.edifici.find(e => tx >= e.tx && tx < e.tx + e.def.w && ty >= e.ty && ty < e.ty + e.def.h);
}

function rimuoviEdificio(ed) {
    ed.gfx.destroy();
    if (ed.label) ed.label.destroy();
    ed.imgs.forEach(i => i.destroy());
    if (ed.w && ed.w.spr) ed.w.spr.destroy();
    stato.edifici.splice(stato.edifici.indexOf(ed), 1);
    versioneMappa++;
}
