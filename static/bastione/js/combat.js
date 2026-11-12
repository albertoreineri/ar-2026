// Combattimento: ondate di nemici, bersagli, danni, torri e campo di flusso verso la fortezza
const RAGGIO_MISCHIA = 22, VISIONE = 8 * TILE, VISIONE_ALLEATI = 11 * TILE, // i tuoi reagiscono anche alle catapulte, che tirano da lontano
     HP_EDIFICIO = 150;
const LATI = ['Nord', 'Sud', 'Ovest', 'Est'];

let ondata = 0, prossimaOndata = partita ? (MODO_DEMO ? 15 : partita.primaOndata || 0) : 0, fine = false, campo = null, avvisoPietra = 0;

const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const centro = t => t.tx !== undefined ? { x: (t.tx + t.def.w / 2) * TILE, y: (t.ty + t.def.h / 2) * TILE } : t;

const BONUS_ALTEZZA = 2, RIPARO_ALTEZZA = 0.6; // arcieri su mura e torri: gittata in più (tile) e danni subiti

// ---- Ondate ----
function generaOndata() {
    ondata++;
    const n = ondata, gruppo = [];
    const scala = partita.scalaOndata || 1, aggiungi = (tipo, q) => { for (let i = 0; i < Math.max(1, Math.round(q * scala)); i++) gruppo.push(tipo); };
    aggiungi('arciere', 2 + n); aggiungi('fante', 2 + n);
    if (n >= 3) aggiungi('corazzato', Math.floor((n - 1) / 2));
    if (n >= 5) aggiungi('catapulta', Math.floor((n - 3) / 2));
    if (!campo || campo.ver !== versioneMappa) campo = calcolaCampo();
    const assedio = partita.modo === 'assedio', lato = Phaser.Math.Between(0, 3); // assedio: le ondate escono dal castello, davanti al portone
    const cx = assedio ? partita.nemico.cx - 12 : lato === 2 ? 1 : lato === 3 ? MAP_W - 2 : Phaser.Math.Between(6, MAP_W - 7);
    const cy = assedio ? partita.nemico.cy : lato === 0 ? 1 : lato === 1 ? MAP_H - 2 : Phaser.Math.Between(6, MAP_H - 7);
    for (const tipo of gruppo) {
        for (let prova = 0; prova < 40; prova++) {
            const tx = Phaser.Math.Clamp(cx + Phaser.Math.Between(-4, 4), 0, MAP_W - 1), ty = Phaser.Math.Clamp(cy + Phaser.Math.Between(-4, 4), 0, MAP_H - 1);
            if (tileBloccato(mappa, tx, ty) || campo.dist[ty * MAP_W + tx] === Infinity) continue; // solo dove c'è una strada fino alla tua fortezza
            const d = UNITA[tipo];
            const hp = Math.round(d.hp * (partita.hpNemici || 1));
            stato.nemici.push({ tipo, d, x: (tx + 0.5) * TILE, y: (ty + 0.5) * TILE, hp, hpMax: hp, cool: 0, nemico: true, ondata: true, path: [], vel: d.vel });
            break;
        }
    }
    mostraMsg(assedio ? `Il nemico sferra un attacco! (${gruppo.length} soldati)` : `Ondata ${n}: nemici da ${LATI[lato]}!`);
}

// ---- Campo di flusso: distanza (pesata) di ogni tile dalla fortezza ----
// Costo per entrare in una tile: 1 libera, 4 albero, 3 fossato/ponte chiuso (lenti), 8 edificio bloccante (va abbattuto), acqua invalicabile
function calcolaCampo() {
    const N = MAP_W * MAP_H, costo = new Float32Array(N).fill(1), d = new Float32Array(N).fill(Infinity);
    for (let y = 0; y < MAP_H; y++) for (let x = 0; x < MAP_W; x++) {
        const t = mappa[y][x];
        if (t === T.ACQUA) costo[y * MAP_W + x] = Infinity; else if (t === T.ALBERO) costo[y * MAP_W + x] = 4;
    }
    const imposta = (r, c) => { for (let y = r.y; y < r.y + r.h; y++) for (let x = r.x; x < r.x + r.w; x++) costo[y * MAP_W + x] = c; };
    const fort = [];
    for (const e of stato.edifici) {
        const r = { x: e.tx, y: e.ty, w: e.def.w, h: e.def.h };
        if (e.nemico) { if (bloccaPassaggio(e)) imposta(r, Infinity); } // gli edifici del nemico sono muri per i suoi soldati
        else if (e.tipo === 'fortezza') { imposta(r, 1); fort.push(r); }
        else if (e.tipo === 'fossato') imposta(r, 3);
        else if (bloccaPassaggio(e)) { imposta(r, 8); if (e.ponte) imposta(e.ponte, 3); }
    }
    const h = []; // heap di [distanza, indice]
    const push = (dd, i) => { h.push([dd, i]); let k = h.length - 1; while (k > 0) { const p = (k - 1) >> 1; if (h[p][0] <= h[k][0]) break; [h[p], h[k]] = [h[k], h[p]]; k = p; } };
    const pop = () => {
        const top = h[0], last = h.pop();
        if (h.length) {
            h[0] = last; let k = 0;
            for (;;) { const l = 2 * k + 1, r = l + 1; let m = k; if (l < h.length && h[l][0] < h[m][0]) m = l; if (r < h.length && h[r][0] < h[m][0]) m = r; if (m === k) break; [h[m], h[k]] = [h[k], h[m]]; k = m; }
        }
        return top;
    };
    for (const r of fort) for (let y = r.y; y < r.y + r.h; y++) for (let x = r.x; x < r.x + r.w; x++) { d[y * MAP_W + x] = 0; push(0, y * MAP_W + x); }
    while (h.length) {
        const [dd, i] = pop();
        if (dd > d[i]) continue;
        const cx = i % MAP_W, cy = (i / MAP_W) | 0;
        for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
            if (!dx && !dy) continue;
            const nx = cx + dx, ny = cy + dy;
            if (nx < 0 || ny < 0 || nx >= MAP_W || ny >= MAP_H) continue;
            const ni = ny * MAP_W + nx;
            if (costo[ni] === Infinity) continue;
            if (dx && dy && (costo[cy * MAP_W + nx] >= 8 || costo[ny * MAP_W + cx] >= 8)) continue; // niente scorciatoie sugli spigoli
            const nd = dd + costo[i] * (dx && dy ? Math.SQRT2 : 1);
            if (nd < d[ni]) { d[ni] = nd; push(nd, ni); }
        }
    }
    return { ver: versioneMappa, dist: d, costo };
}

// Tile successiva verso la fortezza (la vicina con distanza minore)
function prossimoPasso(u) {
    if (!campo || campo.ver !== versioneMappa) campo = calcolaCampo();
    const t = tileDi(u);
    let best = null, bd = campo.dist[t.y * MAP_W + t.x];
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        if (!dx && !dy) continue;
        const nx = t.x + dx, ny = t.y + dy;
        if (nx < 0 || ny < 0 || nx >= MAP_W || ny >= MAP_H) continue;
        if (dx && dy && (campo.costo[t.y * MAP_W + nx] >= 8 || campo.costo[ny * MAP_W + t.x] >= 8)) continue;
        const nd = campo.dist[ny * MAP_W + nx];
        if (nd < bd) { bd = nd; best = { x: nx, y: ny }; }
    }
    return best;
}

function ostacoloA(x, y) {
    return stato.edifici.find(e => !e.nemico && e.tipo !== 'fossato' && bloccaPassaggio(e) && x >= e.tx && x < e.tx + e.def.w && y >= e.ty && y < e.ty + e.def.h);
}

// ---- Bersagli e danni ----
function piuVicino(u, lista, raggio) {
    let best = null, bd = raggio;
    for (const t of lista) { const d = dist(u, t); if (d < bd) { bd = d; best = t; } }
    return best;
}

function distEdificio(u, e) {
    const x0 = e.tx * TILE, y0 = e.ty * TILE;
    return Math.hypot(Math.max(x0 - u.x, 0, u.x - x0 - e.def.w * TILE), Math.max(y0 - u.y, 0, u.y - y0 - e.def.h * TILE));
}

function lineaLibera(a, b) {
    const n = Math.ceil(dist(a, b) / (TILE / 2));
    for (let i = 1; i < n; i++) if (tileBloccato(mappa, Math.floor((a.x + (b.x - a.x) * i / n) / TILE), Math.floor((a.y + (b.y - a.y) * i / n) / TILE))) return false;
    return true;
}

// Arma usabile a distanza d: mischia da vicino, altrimenti tiro
function arma(u, d) {
    if (u.d.mischia > 0 && d <= RAGGIO_MISCHIA) return 'mischia';
    if (u.d.distanza > 0 && d <= (u.d.gittata + (u.sopra ? BONUS_ALTEZZA : 0)) * TILE) return 'distanza';
    return null;
}

function colpisci(u, t, a) {
    if (u.cool > 0) return;
    const d = u.d, ritmo = d.ritmo || 1;
    if (a === 'distanza' && d.munizione && !u.nemico) {
        for (const [r, n] of Object.entries(d.munizione)) if (stato[r] < n) {
            if (avvisoPietra <= 0) { mostraMsg(`${d.nome}: manca ${r}`); avvisoPietra = 5; }
            return;
        }
        for (const [r, n] of Object.entries(d.munizione)) stato[r] -= n;
    }
    u.cool = ritmo;
    const molt = u.nemico ? partita.dannoNemici || 1 : 1;
    t.hp -= d[a] * ritmo * molt * (t.sopra ? RIPARO_ALTEZZA : 1);
    const p = centro(t);
    if (a === 'distanza') stato.effetti.push({ x1: u.x, y1: u.y, x2: p.x, y2: p.y, t: 0.18, col: d.munizione ? 0x555555 : 0x5a3a1a, w: d.munizione ? 3 : 1 });
    else stato.effetti.push({ x1: p.x - 4, y1: p.y - 4, x2: p.x + 4, y2: p.y + 4, t: 0.1, col: 0xffffff, w: 2 });
    if (d.splash && t.tx === undefined) // la catapulta colpisce anche chi sta intorno
        for (const v of (u.nemico ? stato.unita : stato.nemici)) if (v !== t && dist(v, t) < d.splash) v.hp -= d[a] * ritmo * molt * 0.6;
}

function avvicina(u, t, dt) {
    if (lineaLibera(u, t)) return muoviVerso(u, t.x, t.y, dt);
    u.rifai = (u.rifai || 0) - dt;
    if (u.rifai > 0) return;
    u.rifai = 1;
    const a = tileDi(u), b = tileDi(t), p = trovaPercorso(mappa, a.x, a.y, b.x, b.y);
    if (p) u.path = p;
}

// Punto libero appena fuori dall'edificio, dal lato di u (dove una unità può arrivare per colpirlo)
function puntoAdiacente(u, e) {
    const x0 = e.tx * TILE, y0 = e.ty * TILE, x1 = x0 + e.def.w * TILE, y1 = y0 + e.def.h * TILE;
    let x = Math.min(Math.max(u.x, x0), x1), y = Math.min(Math.max(u.y, y0), y1);
    if (u.x < x0) x = x0 - 12; else if (u.x > x1) x = x1 + 12;
    if (u.y < y0) y = y0 - 12; else if (u.y > y1) y = y1 + 12;
    return { x, y };
}

// Edificio nemico da attaccare: il più vicino in vista (solo fanti, corazzati e catapulte: le frecce non scalfiscono le mura)
function bersaglioEdificio(u) {
    if (!(u.d.assedio || u.d.mischia >= 10)) return null;
    let best = null, bd = u.d.assedio ? Math.max(VISIONE, u.d.gittata * TILE) : VISIONE;
    for (const e of stato.edifici) { if (!e.nemico) continue; const d = distEdificio(u, e); if (d < bd) { bd = d; best = e; } }
    return best;
}

function aggiornaAlleato(u, dt) {
    u.cool -= dt;
    const t = piuVicino(u, stato.nemici, VISIONE_ALLEATI);
    if (t) {
        const a = arma(u, dist(u, t));
        if (a) colpisci(u, t, a);
        else if (!u.path.length && !u.sopra) avvicina(u, t, dt); // chi sta sulle mura non scende a inseguire
        return;
    }
    const e = bersaglioEdificio(u);
    if (!e) return;
    const a = arma(u, distEdificio(u, e));
    if (a) return colpisci(u, e, a);
    if (u.path.length) return;
    u.rifai = (u.rifai || 0) - dt; // senza strada fino a quell'edificio, ritenta ogni secondo (anche contro i muri che lo proteggono)
    if (u.rifai > 0) return;
    u.rifai = 1;
    const a0 = tileDi(u), vicini = stato.edifici.filter(x => x.nemico).sort((p, q) => distEdificio(u, p) - distEdificio(u, q)).slice(0, 4);
    for (const x of vicini) {
        const p = puntoAdiacente(u, x), b0 = tileDi(p), path = trovaPercorso(mappa, a0.x, a0.y, b0.x, b0.y);
        if (path) { u.path = path; return; }
    }
}

function aggiornaNemico(u, dt) {
    u.cool -= dt;
    if (u.casa) return aggiornaDifensore(u, dt);
    const t = piuVicino(u, stato.unita, VISIONE);
    if (t) {
        const a = arma(u, dist(u, t));
        if (a) return colpisci(u, t, a);
        if (lineaLibera(u, t)) return muoviVerso(u, t.x, t.y, dt);
    }
    if (u.d.assedio) { // catapulta: bombarda l'edificio più vicino in gittata
        let b = null, bd = u.d.gittata * TILE;
        for (const e of stato.edifici) { if (e.tipo === 'fossato') continue; const d = distEdificio(u, e); if (d < bd) { bd = d; b = e; } }
        if (b) return colpisci(u, b, 'distanza');
    }
    const p = prossimoPasso(u);
    if (!p) return;
    const ost = ostacoloA(p.x, p.y);
    if (ost) { if (u.d.mischia > 0) colpisci(u, ost, 'mischia'); return; } // un muro o un portone sbarra la strada: lo abbatte
    muoviVerso(u, (p.x + 0.5) * TILE, (p.y + 0.5) * TILE, dt * (campo.costo[p.y * MAP_W + p.x] === 3 ? 0.4 : 1));
}

// Difensore del castello: resta al suo posto, combatte chi si avvicina (senza allontanarsi troppo) e poi torna
function aggiornaDifensore(u, dt) {
    const t = piuVicino(u, stato.unita, VISIONE);
    if (t && dist(t, u.casa) < 12 * TILE) {
        const a = arma(u, dist(u, t));
        if (a) return colpisci(u, t, a);
        if (lineaLibera(u, t)) return muoviVerso(u, t.x, t.y, dt);
    }
    if (dist(u, u.casa) > 4) muoviVerso(u, u.casa.x, u.casa.y, dt);
}

function tiroTorre(b, dt) {
    b.cool = (b.cool || 0) - dt;
    if (b.cool > 0) return;
    const c = centro(b), t = piuVicino(c, b.nemico ? stato.unita : stato.nemici, b.def.tiro.gittata * TILE); // le torri nemiche sparano alle tue unità
    if (!t) return;
    b.cool = 1;
    t.hp -= b.def.tiro.distanza * (b.nemico ? partita.dannoNemici || 1 : 1);
    stato.effetti.push({ x1: c.x, y1: c.y, x2: t.x, y2: t.y, t: 0.18, col: 0x333333, w: 2 });
}

// Riparazione istantanea: 1 risorsa ogni 10 hp mancanti
function costoRiparazione(e) { return Math.ceil((e.hpMax - e.hp) / 10); }

function riparaEdificio(e) {
    const r = e.def.riparaCon || 'legno', n = costoRiparazione(e);
    if (e.hp >= e.hpMax) return;
    if (stato[r] < n) return mostraMsg(`Servono ${n} ${r}`);
    stato[r] -= n;
    e.hp = e.hpMax;
}

function distruggi(e) {
    if (e.def.popolazione && !e.nemico) { stato.popMax -= e.def.popolazione; stato.pop = Math.min(stato.pop, stato.popMax); }
    if (edificioSelezionato === e) edificioSelezionato = null;
    rimuoviEdificio(e);
    if (e.tipo === 'fortezza') e.nemico ? vittoria() : sconfitta();
}

// Schermata di fine partita con i bottoni indicati ([testo, azione])
function schermataFine(titolo, sotto, bottoni) {
    fine = true;
    const el = document.createElement('div');
    el.style.cssText = 'position:fixed;inset:0;display:flex;flex-direction:column;gap:16px;align-items:center;justify-content:center;background:#000a;color:#fff;font-size:28px;z-index:5';
    el.innerHTML = `${titolo}<small style="font-size:16px">${sotto}</small><div style="display:flex;gap:12px"></div>`;
    for (const [testo, azione] of bottoni) {
        const b = document.createElement('button');
        b.textContent = testo; b.style.cssText = 'font-size:18px;padding:10px 20px'; b.onclick = azione;
        el.lastChild.appendChild(b);
    }
    document.body.appendChild(el);
}

function sconfitta() {
    schermataFine('La fortezza è caduta', `Hai resistito a ${Math.max(0, ondata - 1)} ondate`, [['Riprova', () => location.reload()], ['Menu', () => location.href = location.pathname]]);
}

function vittoria() {
    const prossimo = LIVELLI.find(l => l.id === partita.id + 1);
    sbloccaLivello(partita.id + 1);
    schermataFine('🏆 Livello superato!', partita.modo === 'assedio' ? `${partita.nome}: il castello nemico è caduto` : `${partita.nome}: hai respinto tutte le ${partita.ondateVittoria} ondate`,
        [...(prossimo ? [['Livello successivo', () => location.href = `?livello=${prossimo.id}`]] : []), ['Rigioca', () => location.reload()], ['Menu', () => location.href = location.pathname]]);
}

function aggiornaCombattimento(dt) {
    if (fine) return;
    const ondate = partita.modo === 'ondate', assedio = partita.modo === 'assedio';
    if (assedio || (ondate && ondata < partita.ondateVittoria)) {
        prossimaOndata -= dt;
        if (prossimaOndata <= 0) { generaOndata(); prossimaOndata = partita.intervallo; }
    }
    avvisoPietra -= dt;
    for (const u of stato.unita) aggiornaAlleato(u, dt);
    for (const u of stato.nemici) aggiornaNemico(u, dt);
    for (const b of stato.edifici) if (b.def.tiro) tiroTorre(b, dt);
    for (const u of [...stato.unita, ...stato.nemici]) if (u.hp <= 0 && u.spr) u.spr.destroy();
    stato.unita = stato.unita.filter(u => u.hp > 0);
    stato.nemici = stato.nemici.filter(u => u.hp > 0);
    for (const e of stato.edifici.filter(e => e.hp <= 0)) distruggi(e);
    stato.effetti = stato.effetti.filter(f => (f.t -= dt) > 0);
    if (assedio) { // il castello nemico è l'obiettivo
        const f = stato.edifici.find(e => e.nemico && e.tipo === 'fortezza');
        document.getElementById('r-ondata').textContent = `🏰 ${partita.nome} · castello nemico ${f ? Math.ceil(f.hp) + '/' + f.hpMax : ''} · prossimo attacco tra ${Math.max(0, Math.ceil(prossimaOndata))}s`;
        return;
    }
    if (ondate && ondata >= partita.ondateVittoria && !stato.nemici.length) return vittoria();
    const tot = partita.ondateVittoria, attesa = ondata < tot ? ` · ondata ${ondata + 1}/${tot} tra ${Math.ceil(prossimaOndata)}s` : ' · ultima ondata!';
    document.getElementById('r-ondata').textContent = ondate ? `⚔️ ${partita.nome}${attesa}` + (stato.nemici.length ? ` · ${stato.nemici.length} nemici` : '') : '🏗️ Modalità libera';
}

// Barre della vita, effetti dei colpi (si disegna sopra le unità)
function disegnaCombattimento(g) {
    g.clear();
    const barra = (x, y, w, f) => g.fillStyle(0x000000, 0.7).fillRect(x - w / 2 - 1, y - 1, w + 2, 5).fillStyle(f > 0.5 ? 0x2ecc71 : f > 0.25 ? 0xf1c40f : 0xe74c3c, 1).fillRect(x - w / 2, y, w * Math.max(0, f), 3);
    for (const u of [...stato.unita, ...stato.nemici]) if (u.hp < (u.hpMax || u.d.hp)) barra(u.x, u.y - (u.d.sprite ? 30 * (u.d.scala || 1.15) : u.d.raggio + 7), 16, u.hp / (u.hpMax || u.d.hp));
    for (const e of stato.edifici) if (e.hp < e.hpMax) { const c = centro(e); barra(c.x, e.ty * TILE - 6, Math.min(e.def.w, 3) * TILE * 0.8, e.hp / e.hpMax); }
    for (const f of stato.effetti) g.lineStyle(f.w, f.col, Math.min(1, f.t / 0.1)).lineBetween(f.x1, f.y1, f.x2, f.y2);
}
