// Un edificio blocca il passaggio, tranne un portone aperto o un campo calpestabile
function bloccaPassaggio(e) { return !(e.def.apribile && e.aperto) && !e.def.calpestabile; }

// Mura e torri tue: gli arcieri ci salgono sopra e ci camminano (sopra = true per loro)
function muroAmico(e) { return !e.nemico && (e.tipo === 'muro' || e.tipo === 'torre'); }

// Tile non attraversabile (acqua, alberi, edifici)
function tileBloccato(mappa, x, y, sopra) {
    if (x < 0 || y < 0 || x >= MAP_W || y >= MAP_H || mappa[y][x] === T.ACQUA || mappa[y][x] === T.ALBERO) return true;
    return stato.edifici.some(e => bloccaPassaggio(e) && !(sopra && muroAmico(e)) && ((x >= e.tx && x < e.tx + e.def.w && y >= e.ty && y < e.ty + e.def.h) || (e.ponte && x >= e.ponte.x && x < e.ponte.x + e.ponte.w && y >= e.ponte.y && y < e.ponte.y + e.ponte.h)));
}

// A* a 8 direzioni. La tile di arrivo è sempre raggiungibile (es. un albero da tagliare).
// Ritorna l'elenco di punti in pixel (centro tile) o null se non c'è strada.
function trovaPercorso(mappa, sx, sy, gx, gy, sopra) {
    const N = MAP_W * MAP_H, idx = (x, y) => y * MAP_W + x;
    const blk = new Uint8Array(N);
    for (let y = 0; y < MAP_H; y++) for (let x = 0; x < MAP_W; x++) if (mappa[y][x] === T.ACQUA) blk[idx(x, y)] = 1; // gli alberi si attraversano, ma costano
    for (const e of stato.edifici)
        if (bloccaPassaggio(e) && !(sopra && muroAmico(e))) {
            for (let y = e.ty; y < e.ty + e.def.h; y++) for (let x = e.tx; x < e.tx + e.def.w; x++) blk[idx(x, y)] = 1;
            if (e.ponte) for (let y = e.ponte.y; y < e.ponte.y + e.ponte.h; y++) for (let x = e.ponte.x; x < e.ponte.x + e.ponte.w; x++) blk[idx(x, y)] = 1;
        }
    blk[idx(gx, gy)] = 0;
    if (gx < 0 || gy < 0 || gx >= MAP_W || gy >= MAP_H) return null;

    const g = new Float32Array(N).fill(Infinity), prev = new Int32Array(N).fill(-1), chiuso = new Uint8Array(N);
    const h = (x, y) => { const dx = Math.abs(x - gx), dy = Math.abs(y - gy); return dx + dy + (Math.SQRT2 - 2) * Math.min(dx, dy); };
    const start = idx(sx, sy), goal = idx(gx, gy);
    g[start] = 0;
    const aperti = [{ i: start, f: h(sx, sy) }];

    while (aperti.length) {
        let m = 0;
        for (let k = 1; k < aperti.length; k++) if (aperti[k].f < aperti[m].f) m = k;
        const cur = aperti.splice(m, 1)[0].i;
        if (cur === goal) break;
        if (chiuso[cur]) continue;
        chiuso[cur] = 1;
        const cx = cur % MAP_W, cy = (cur / MAP_W) | 0;
        for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
            if (!dx && !dy) continue;
            const nx = cx + dx, ny = cy + dy;
            if (nx < 0 || ny < 0 || nx >= MAP_W || ny >= MAP_H) continue;
            const ni = idx(nx, ny);
            if (blk[ni] || chiuso[ni]) continue;
            if (dx && dy && (blk[idx(cx + dx, cy)] || blk[idx(cx, cy + dy)])) continue; // niente scorciatoie sugli spigoli
            const ng = g[cur] + (dx && dy ? Math.SQRT2 : 1) * (mappa[ny][nx] === T.ALBERO ? 4 : 1);
            if (ng < g[ni]) { g[ni] = ng; prev[ni] = cur; aperti.push({ i: ni, f: ng + h(nx, ny) }); }
        }
    }
    if (prev[goal] === -1 && start !== goal) return null;
    const path = [];
    for (let i = goal; i !== start; i = prev[i]) path.unshift({ x: (i % MAP_W + 0.5) * TILE, y: (((i / MAP_W) | 0) + 0.5) * TILE });
    return path;
}
