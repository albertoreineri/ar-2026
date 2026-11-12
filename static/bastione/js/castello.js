// Modalità assedio: il castello nemico (fortezza, mura, portone, torri, difensori)
function costruisciCastello(scene) {
    const { cx, cy } = partita.nemico, R = 7, nemico = true;
    const metti = (tipo, x, y, dir) => piazzaEdificio(scene, mappa, tipo, x, y, true, dir, nemico);
    metti('fortezza', cx - 2, cy - 2);
    for (let i = -R; i <= R; i++) for (const [x, y] of [[cx + i, cy - R], [cx + i, cy + R], [cx - R, cy + i], [cx + R, cy + i]]) {
        if (!stato.edifici.some(e => e.tx === x && e.ty === y && e.tipo === 'muro')) metti('muro', x, y);
    }
    metti('portone', cx - R, cy - 1, 'O'); // rivolto verso di te (ovest), sostituisce i muri
    [[cx - R - 1, cy - R - 1], [cx + R, cy - R - 1], [cx - R - 1, cy + R], [cx + R, cy + R]].slice(0, partita.torri ?? 4).forEach(([x, y]) => metti('torre', x, y));
    if (partita.fossato) { // anello d'acqua attorno al castello, con un varco davanti al portone
        for (let i = -R - 2; i <= R + 2; i++) for (const [x, y] of [[cx + i, cy - R - 2], [cx + i, cy + R + 2], [cx - R - 2, cy + i], [cx + R + 2, cy + i]]) {
            if (x === cx - R - 2 && y >= cy - 1 && y <= cy + 1) continue;
            if (!stato.edifici.some(e => e.tx === x && e.ty === y)) metti('fossato', x, y);
        }
    }
    // difensori attorno alla fortezza
    for (const [tipo, n] of Object.entries(partita.difensori || {})) for (let i = 0; i < n; i++) {
        for (let prova = 0; prova < 40; prova++) {
            const tx = cx + Phaser.Math.Between(-R + 2, R - 2), ty = cy + Phaser.Math.Between(-R + 2, R - 2);
            if (tileBloccato(mappa, tx, ty)) continue;
            const d = UNITA[tipo], hp = Math.round(d.hp * (partita.hpNemici || 1)), x = (tx + 0.5) * TILE, y = (ty + 0.5) * TILE;
            stato.nemici.push({ tipo, d, x, y, hp, hpMax: hp, cool: 0, nemico: true, path: [], vel: d.vel, casa: { x, y } });
            break;
        }
    }
}
