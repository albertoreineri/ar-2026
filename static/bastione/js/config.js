const TILE = 32;
const MAP_W = 80;
const MAP_H = 60;

const T = { ERBA: 0, ALBERO: 1, ACQUA: 2, PIETRA: 3, FERRO: 4 };

// parti = elenco di sprite che compongono l'edificio ({ f: frame, a: atlante (default rts), riempi: occupa tutta l'area, x/y: punto in basso al centro (0-1), l: larghezza 0-1 }); decoro = disegni aggiuntivi;
// calpestabile = non blocca il passaggio (campi); campoInterno = il lavoratore lavora dentro l'area;
// stile = disegno procedurale (muro, portone, acqua);
// sprite = frame dello spritesheet Kenney (img/rts.png) disegnato al posto del rettangolo colorato;
// hp = punti vita (default HP_EDIFICIO); riparaCon = risorsa per ripararlo (default legno, 1 ogni 10 hp mancanti); tiro = la torre spara ai nemici in gittata (tile)
// size in tile; costo in legno (+ costoPietra opzionale). trascina = si piazza trascinando il mouse; sopraMuri = può sostituire dei muri già esistenti; ponte = occupa anche il lato davanti (direzione N/S/E/O, w e h si invertono per E/O), sostituendo il fossato: marrone se aperto, azzurro se chiuso; apribile = si apre e si chiude dal pannello info (aperto: ci passano tutti, chiuso: blocca tutti); nonCostruibile = solo iniziale.
// Produttori: raggio (opzionale, senza = tutta la mappa), risorsa/resa per viaggio, lavoro = secondi di lavoro, dest = dove consegna (default magazzino),
// deposito = tipo di terreno richiesto, campo = lavora in un punto casuale attorno all'edificio
const CATEGORIE = { economia: '🪵 Economia', cibo: '🌾 Cibo', militare: '⚔️ Militare', difesa: '🧱 Difesa' };
const EDIFICI = {
    legnaiolo:    { parti: [{ a: 'rts1', f: 'medievalEnvironment_06.png', x: 0.5, y: 0.72, l: 1.05 }, { a: 'rts1', f: 'medievalEnvironment_05.png', x: 0.22, y: 0.98, l: 0.4 }, { a: 'rts1', f: 'medievalEnvironment_05.png', x: 0.8, y: 0.98, l: 0.35 }], icona: '🪓', categoria: 'economia', nome: 'Legnaiolo',     w: 1, h: 1, costo: 5, colore: 0x8e5a2b, risorsa: 'legno', resa: 8 },
    mercato:      { sprite: 'medievalStructure_22.png', icona: '🏪', categoria: 'economia', nome: 'Mercato', w: 2, h: 2, costo: 40, colore: 0xc0783c, commercio: true },
    magazzino:    { sprite: 'medievalStructure_21.png', icona: '📦', categoria: 'economia', nome: 'Magazzino',     w: 3, h: 3, costo: 30, colore: 0x7a6a55 },
    granaio:      { sprite: 'medievalStructure_19.png', icona: '🏚️', categoria: 'cibo', nome: 'Granaio',       w: 3, h: 3, costo: 30, colore: 0xc9a66b },
    cava:         { parti: [{ f: 'medievalTile_15.png', riempi: true }, { a: 'rts1', f: 'medievalEnvironment_09.png', x: 0.27, y: 0.58, l: 0.42 }, { a: 'rts1', f: 'medievalEnvironment_11.png', x: 0.74, y: 0.5, l: 0.42 }, { a: 'rts1', f: 'medievalEnvironment_08.png', x: 0.3, y: 0.98, l: 0.36 }, { f: 'medievalStructure_08.png', x: 0.74, y: 0.98, l: 0.36 }], icona: '⛏️', categoria: 'economia', nome: 'Cava pietra',   w: 2, h: 2, costo: 20, colore: 0x8a8a8a, deposito: T.PIETRA, risorsa: 'pietra', resa: 4, lavoro: 4, campo: true },
    minieraFerro: { sprite: 'medievalStructure_20.png', icona: '⚒️', categoria: 'economia', nome: 'Miniera ferro', w: 2, h: 2, costo: 20, colore: 0xa0522d, deposito: T.FERRO, risorsa: 'ferro', resa: 3, lavoro: 4, campo: true },
    fattoria:     { calpestabile: true, campoInterno: true, decoro: 'grano', parti: [{ f: 'medievalTile_56.png', riempi: true }, { f: 'medievalStructure_18.png', x: 0.17, y: 0.36, l: 0.3 }], icona: '🌾', categoria: 'cibo', nome: 'Fattoria grano', w: 3, h: 3, costo: 30, colore: 0xd4b13a, risorsa: 'grano', resa: 1, lavoro: 2.5, dest: 'panetteria', campo: true },
    mucche:       { calpestabile: true, campoInterno: true, decoro: 'mucche', parti: [{ f: 'medievalTile_55.png', riempi: true }, { f: 'medievalStructure_09.png', x: 0.5, y: 0.42, l: 0.42 }], icona: '🐄', categoria: 'cibo', nome: 'Fattoria mucche', w: 3, h: 3, costo: 35, colore: 0xe8e0d0, risorsa: 'formaggio', resa: 1, lavoro: 3, dest: 'granaio', campo: true },
    panetteria:   { sprite: 'medievalStructure_07.png', icona: '🥖', categoria: 'cibo', nome: 'Panetteria',    w: 2, h: 2, costo: 30, colore: 0xd98c5f, risorsa: 'pane', resa: 2, lavoro: 4, dest: 'granaio', consuma: 2 },
    caserma:      { sprite: 'medievalStructure_02.png', icona: '⚔️', categoria: 'militare', nome: 'Caserma',       w: 3, h: 3, costo: 40, colore: 0x555a66, recluta: ['arciere', 'fante', 'corazzato', 'catapulta'] },
    fortezza:     { sprite: 'medievalStructure_06.png', icona: '🏰', hp: 3000, riparaCon: 'pietra', nome: 'Fortezza',      w: 5, h: 5, costo: 0, colore: 0x4a4a5a, popolazione: 8, nonCostruibile: true },
    muro:         { icona: '🧱', categoria: 'difesa', hp: 120, riparaCon: 'pietra', stile: 'muro', nome: 'Muro',          w: 1, h: 1, costo: 0, costoPietra: 2, colore: 0x9a9a9a, trascina: true },
    portone:      { sopraMuri: true, apribile: true, ponte: true, icona: '🚪', categoria: 'difesa', hp: 250, riparaCon: 'pietra', stile: 'portone', nome: 'Portone', w: 3, h: 1, costo: 15, costoPietra: 8, colore: 0x7b4a22 },
    fossato:      { trascina: true, icona: '🌊', categoria: 'difesa', stile: 'acqua', nome: 'Fossato', w: 1, h: 1, costo: 1, colore: 0x2a6fb5 },
    torre:        { sprite: 'medievalStructure_05.png', sopraMuri: true, icona: '🗼', categoria: 'difesa', hp: 500, tiro: { distanza: 15, gittata: 9 }, riparaCon: 'pietra', nome: 'Torre',         w: 2, h: 2, costo: 10, costoPietra: 20, colore: 0x6b6b7a },
    casa:         { sprite: 'medievalStructure_17.png', icona: '🏠', categoria: 'economia', nome: 'Casa',          w: 2, h: 2, costo: 20, colore: 0xb0b0b0, popolazione: 4 },
};

// costo in risorse + pop abitanti (default 1) per ogni recluta; vel = pixel/s.
// sprite = [alleato, nemico] frame dell'atlante rts1 (senza sprite si disegna una forma); scala = ingrandimento; tintNemico = colore applicato al nemico;
// Combattimento: hp, mischia/distanza = danno al secondo, gittata in tile, ritmo = secondi tra i colpi (default 1),
// munizione = risorsa consumata per ogni lancio, splash = raggio in px del danno ad area, assedio = bombarda anche gli edifici
const UNITA = {
    arciere:    { nome: 'Arciere', sprite: ['medievalUnit_02.png', 'medievalUnit_08.png'], scala: 1.15,    costo: { legno: 8 },              colore: 0x2ecc71, coloreNemico: 0xe74c3c, sulleMura: true, vel: 90, raggio: 6,  hp: 40,  mischia: 3,  distanza: 12, gittata: 7 },
    fante:      { nome: 'Fante', sprite: ['medievalUnit_03.png', 'medievalUnit_09.png'], scala: 1.15,      costo: { ferro: 8, legno: 5 },    colore: 0x9b59b6, coloreNemico: 0xc0392b, vel: 90, raggio: 6,  hp: 80,  mischia: 15, distanza: 0,  gittata: 0 },
    corazzato:  { nome: 'Corazzato', sprite: ['medievalUnit_21.png', 'medievalUnit_09.png'], scala: 1.4, tintNemico: 0x999999,  costo: { ferro: 25, legno: 10 },   colore: 0x34495e, coloreNemico: 0x7b241c, vel: 45, raggio: 8,  hp: 200, mischia: 35, distanza: 0,  gittata: 0 },
    catapulta:  { nome: 'Catapulta',  costo: { legno: 120 }, pop: 4,     colore: 0x8e5a2b, coloreNemico: 0x6e2c1c, vel: 35, raggio: 14, hp: 120, mischia: 0,  distanza: 60, gittata: 12, ritmo: 3, splash: 40, assedio: true, munizione: { pietra: 5 } },
};

// prezzi in oro per 1 unità: compra = quanto paghi, vendi = quanto incassi
const PREZZI = { legno: { compra: 2, vendi: 1 }, pietra: { compra: 4, vendi: 2 }, ferro: { compra: 6, vendi: 3 }, pane: { compra: 4, vendi: 2 }, formaggio: { compra: 4, vendi: 2 } };
const LOTTO_MERCATO = 5;
const ICONE_RISORSE = { legno: '🪵', pietra: '🪨', ferro: '⛏️', pane: '🍞', formaggio: '🧀' };

const COLORE_CARICO = { legno: 0x8e5a2b, pietra: 0xb5b5b5, ferro: 0xd2691e, grano: 0xe6c84a, formaggio: 0xfff0a0, pane: 0xc47a3a };

// pane e formaggio stanno nel granaio; il grano si accumula nelle panetterie (e.grano)
const stato = { nemici: [], effetti: [], oro: 50, legno: 100, pietra: 0, ferro: 0, pane: 0, formaggio: 0, pop: 0, popMax: 0, edifici: [], unita: [] };

const MODO_TEST = new URLSearchParams(location.search).has('test');
// Modalità test: apri la pagina con ?test per avere tutte le risorse al massimo
if (MODO_TEST) Object.assign(stato, { oro: 9999, legno: 9999, pietra: 9999, ferro: 9999, pane: 9999, formaggio: 9999 });
