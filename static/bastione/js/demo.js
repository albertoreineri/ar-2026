// Modalità demo: apri la pagina con ?demo (anche insieme a ?test) per avere una mappa già popolata
const MODO_DEMO = new URLSearchParams(location.search).has('demo');

const DEMO_EDIFICI = [
    ['casa', 34, 24], ['casa', 37, 24], ['casa', 40, 24], ['caserma', 43, 25],
    ['granaio', 42, 29], ['mercato', 44, 33], ['legnaiolo', 31, 30], ['legnaiolo', 31, 34],
    ['panetteria', 36, 34], ['fattoria', 38, 33], ['mucche', 41, 33],
    ['cava', 48, 26], ['minieraFerro', 48, 31],
    ['torre', 30, 20], ['torre', 47, 20],
];

// Terreno deterministico attorno alla fortezza: zona libera, bosco a ovest, pietra e ferro a est
function preparaTerrenoDemo(m) {
    const riempi = (tipo, x1, y1, x2, y2) => { for (let y = y1; y <= y2; y++) for (let x = x1; x <= x2; x++) m[y][x] = tipo; };
    riempi(T.ERBA, 24, 18, 56, 42);
    riempi(T.ALBERO, 24, 22, 29, 40);
    riempi(T.PIETRA, 48, 26, 51, 29);
    riempi(T.FERRO, 48, 31, 51, 34);
}

function popolaDemo(scene) {
    for (const [tipo, x, y] of DEMO_EDIFICI) piazzaEdificio(scene, mappa, tipo, x, y, true);
    for (let x = 32; x <= 46; x++) piazzaEdificio(scene, mappa, 'muro', x, 21, true);
    piazzaEdificio(scene, mappa, 'torre', 43, 21, true); // sopra il muro
    piazzaEdificio(scene, mappa, 'portone', 38, 21, true); // sostituisce 3 muri
    for (let x = 32; x <= 46; x++) if (x < 38 || x > 40) piazzaEdificio(scene, mappa, 'fossato', x, 20, true);
    stato.pop = stato.popMax;
}
