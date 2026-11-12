function recluta(tipo, caserma) {
    const d = UNITA[tipo], pop = d.pop || 1;
    if (stato.pop < pop) return mostraMsg(pop > 1 ? `Servono ${pop} abitanti` : 'Nessun abitante disponibile');
    for (const [r, n] of Object.entries(d.costo)) if (stato[r] < n) return mostraMsg(`Servono ${n} ${r}`);
    for (const [r, n] of Object.entries(d.costo)) stato[r] -= n;
    stato.pop -= pop;
    stato.unita.push({ tipo, d, x: caserma.casa.x, y: caserma.casa.y, path: [], sel: false, vel: d.vel, hp: d.hp, cool: 0 });
}

function tileSopraMuro(u) {
    const t = tileDi(u);
    return stato.edifici.some(e => muroAmico(e) && t.x >= e.tx && t.x < e.tx + e.def.w && t.y >= e.ty && t.y < e.ty + e.def.h);
}

function aggiornaUnita(dt) {
    for (const u of stato.unita) {
        if (u.path.length) muoviLungo(u, dt);
        u.sopra = u.d.sulleMura && tileSopraMuro(u); // in cima a un muro o a una torre
    }
}

// Le unità non si sovrappongono: le coppie troppo vicine si allontanano (non dentro acqua o edifici).
// Due unità in marcia si attraversano (altrimenti si bloccano a vicenda nei passaggi stretti); chi è in marcia sposta chi sta fermo.
function separaUnita() {
    const tutte = [...stato.unita, ...stato.nemici];
    const libero = (u, x, y) => {
        const tx = Math.floor(x / TILE), ty = Math.floor(y / TILE);
        return !tileBloccato(mappa, tx, ty, u.d.sulleMura) || (mappa[ty] && mappa[ty][tx] === T.ALBERO);
    };
    for (const u of tutte) u.inMarcia = u.sx !== undefined && Math.hypot(u.x - u.sx, u.y - u.sy) > 0.05;
    for (let i = 0; i < tutte.length; i++) for (let j = i + 1; j < tutte.length; j++) {
        const a = tutte[i], b = tutte[j], min = a.d.raggio + b.d.raggio;
        if (a.inMarcia && b.inMarcia) continue;
        let dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy);
        if (d >= min) continue;
        if (d < 0.01) { dx = Math.random() - 0.5; dy = Math.random() - 0.5; d = Math.hypot(dx, dy); } // esattamente sovrapposte: direzione a caso
        const p = (min - d) / d, qa = a.inMarcia ? 0 : b.inMarcia ? 1 : 0.5, qb = 1 - qa; // quota di spinta di ciascuno
        if (qa && libero(a, a.x - dx * p * qa, a.y - dy * p * qa)) { a.x -= dx * p * qa; a.y -= dy * p * qa; }
        if (qb && libero(b, b.x + dx * p * qb, b.y + dy * p * qb)) { b.x += dx * p * qb; b.y += dy * p * qb; }
    }
    for (const u of tutte) { u.sx = u.x; u.sy = u.y; }
}

// Sprite delle unità (immagini Phaser): creati al volo, voltati nel verso di marcia, con un saltello mentre camminano
function sincronizzaSprite(scene, t) {
    for (const u of [...stato.unita, ...stato.nemici]) {
        if (!u.d.sprite) continue;
        if (!u.spr) {
            u.spr = scene.add.image(u.x, u.y, 'rts1', u.d.sprite[u.nemico ? 1 : 0]).setOrigin(0.5, 0.85).setScale(u.d.scala || 1.15).setDepth(6);
            if (u.nemico && u.d.tintNemico) u.spr.setTint(u.d.tintNemico);
            u.px = u.x; u.py = u.y;
        }
        const dx = u.x - u.px, muove = Math.hypot(dx, u.y - u.py) > 0.05;
        if (Math.abs(dx) > 0.05) u.spr.setFlipX(dx < 0);
        u.px = u.x; u.py = u.y;
        u.spr.setPosition(u.x, u.y - (muove ? Math.abs(Math.sin(t / 90)) * 2 : 0));
    }
}

function disegnaUnita(g) {
    g.clear();
    for (const u of [...stato.unita, ...stato.nemici]) {
        const r = u.d.raggio;
        if (u.sel) g.lineStyle(2, 0xf1c40f, 1).strokeCircle(u.x, u.y + 2, r + 4);
        if (u.d.sprite) { g.fillStyle(0x000000, 0.25).fillEllipse(u.x, u.y + 3, r * 1.8, r * 0.8); continue; } // ombra sotto lo sprite
        g.fillStyle(u.nemico ? u.d.coloreNemico : u.d.colore, 1).lineStyle(u.nemico ? 2 : 1, 0x000000, 1);
        if (u.tipo === 'catapulta') { // rettangolo con due ruote
            g.fillRect(u.x - r, u.y - r * 0.6, r * 2, r * 1.2).strokeRect(u.x - r, u.y - r * 0.6, r * 2, r * 1.2);
            g.fillStyle(0x222222, 1).fillCircle(u.x - r * 0.6, u.y + r * 0.6, 3).fillCircle(u.x + r * 0.6, u.y + r * 0.6, 3);
        } else g.fillRect(u.x - r, u.y - r, r * 2, r * 2).strokeRect(u.x - r, u.y - r, r * 2, r * 2);
    }
}

// Manda le unità selezionate verso una tile, disponendole in griglia attorno ad essa
function comanda(mappa, tx, ty) {
    const sel = stato.unita.filter(u => u.sel);
    if (!sel.some(u => !tileBloccato(mappa, tx, ty, u.d.sulleMura))) return mostraMsg('Destinazione non valida'); // gli arcieri possono salire su mura e torri
    sel.forEach((u, i) => {
        const sopra = u.d.sulleMura;
        if (tileBloccato(mappa, tx, ty, sopra)) return;
        let gx = tx + (i % 3) - 1, gy = ty + (Math.floor(i / 3) % 3) - 1;
        if (tileBloccato(mappa, gx, gy, sopra)) { gx = tx; gy = ty; }
        const t = tileDi(u), path = trovaPercorso(mappa, t.x, t.y, gx, gy, sopra);
        if (path) u.path = path;
    });
}
