// Campagna e modalità libera. Si sceglie dal menu iniziale (link con ?livello=N o ?libera); ?test / ?demo da soli avviano il livello 1
// tempi in secondi; scalaOndata/hpNemici/dannoNemici = moltiplicatori; mappa = quante macchie di ciascun terreno; seme = mappa sempre uguale
const LIVELLI = [
    { id: 1, nome: 'Valle tranquilla', difficolta: 'Facile', modo: 'ondate', seme: 101, mappa: { alberi: 14, acqua: 3, pietra: 5, ferro: 4 },
      ondateVittoria: 5, primaOndata: 180, intervallo: 110, scalaOndata: 0.7, hpNemici: 0.8, dannoNemici: 0.8, risorse: { legno: 250, pietra: 40, ferro: 30, pane: 15, formaggio: 10, oro: 100, pop: 6 },
      descrizione: 'Terre generose e pochi nemici: impara a costruire la tua fortezza.' },
    { id: 2, nome: 'Bosco fitto', difficolta: 'Media', modo: 'ondate', seme: 202, mappa: { alberi: 24, acqua: 6, pietra: 4, ferro: 3 },
      ondateVittoria: 8, primaOndata: 150, intervallo: 100, scalaOndata: 1, hpNemici: 1, dannoNemici: 1, risorse: { legno: 180, pietra: 20, ferro: 20, pane: 10, oro: 50, pop: 4 },
      descrizione: 'Il bosco rallenta i nemici ma anche te. Servono mura e torri.' },
    { id: 3, nome: 'Terre aspre', difficolta: 'Difficile', modo: 'ondate', seme: 303, mappa: { alberi: 28, acqua: 9, pietra: 3, ferro: 2 },
      ondateVittoria: 10, primaOndata: 150, intervallo: 90, scalaOndata: 1.15, hpNemici: 1.15, dannoNemici: 1.1, risorse: { legno: 120, pietra: 20, ferro: 10, pane: 5, oro: 0, pop: 3 },
      descrizione: 'Risorse scarse e nemici numerosi: ogni scelta conta.' },
];
const ZONE_ASSEDIO = [[4, 18, 28, 42], [52, 14, 78, 46]]; // zone libere attorno alla tua base (ovest) e al castello nemico (est)
LIVELLI.push(
    { id: 4, nome: 'Il fortino', difficolta: 'Assedio · facile', modo: 'assedio', seme: 404, mappa: { alberi: 14, acqua: 3, pietra: 5, ferro: 4, libere: ZONE_ASSEDIO },
      base: { tx: 12, ty: 27 }, nemico: { cx: 66, cy: 30 }, torri: 2, fossato: false, difensori: { arciere: 3, fante: 2 },
      primaOndata: 150, intervallo: 120, scalaOndata: 0.6, hpNemici: 0.8, dannoNemici: 0.8, risorse: { legno: 300, pietra: 60, ferro: 60, pane: 20, formaggio: 10, oro: 100, pop: 8 },
      descrizione: 'Un piccolo fortino con poche guardie. Costruisci un esercito e abbattilo.' },
    { id: 5, nome: 'Il castello', difficolta: 'Assedio · media', modo: 'assedio', seme: 505, mappa: { alberi: 22, acqua: 5, pietra: 4, ferro: 3, libere: ZONE_ASSEDIO },
      base: { tx: 12, ty: 27 }, nemico: { cx: 66, cy: 30 }, torri: 4, fossato: false, difensori: { arciere: 5, fante: 4, corazzato: 1 },
      primaOndata: 120, intervallo: 100, scalaOndata: 0.9, hpNemici: 1, dannoNemici: 1, risorse: { legno: 250, pietra: 50, ferro: 50, pane: 15, oro: 50, pop: 6 },
      descrizione: 'Mura, torri e un esercito che attacca a ondate. Servono catapulte.' },
    { id: 6, nome: 'La fortezza imprendibile', difficolta: 'Assedio · difficile', modo: 'assedio', seme: 606, mappa: { alberi: 26, acqua: 7, pietra: 3, ferro: 2, libere: ZONE_ASSEDIO },
      base: { tx: 12, ty: 27 }, nemico: { cx: 66, cy: 30 }, torri: 4, fossato: true, difensori: { arciere: 7, fante: 5, corazzato: 3 },
      primaOndata: 90, intervallo: 80, scalaOndata: 1.2, hpNemici: 1.2, dannoNemici: 1.2, risorse: { legno: 220, pietra: 40, ferro: 40, pane: 10, oro: 0, pop: 4 },
      descrizione: 'Un fossato la protegge: i soldati non arrivano alle mura, solo le catapulte.' },
);
const LIBERA = { id: 'libera', nome: 'Modalità libera', modo: 'libera', seme: undefined, mappa: {}, risorse: { legno: 300, pietra: 100, ferro: 50, pane: 20, formaggio: 20, oro: 100, pop: 8 } };

const CHIAVE_SBLOCCO = 'bastione-livelli-sbloccati', CHIAVE_VECCHIA = 'stronghold-livelli-sbloccati'; // la vecchia chiave si legge ancora, per non perdere i progressi
function livelliSbloccati() { try { return Math.max(1, +(localStorage.getItem(CHIAVE_SBLOCCO) || localStorage.getItem(CHIAVE_VECCHIA)) || 1); } catch (e) { return 1; } }
function sbloccaLivello(n) { try { localStorage.setItem(CHIAVE_SBLOCCO, Math.max(livelliSbloccati(), n)); } catch (e) { /* senza salvataggio si gioca lo stesso */ } }

const _params = new URLSearchParams(location.search);
const partita = _params.has('libera') ? LIBERA
    : _params.has('livello') ? LIVELLI[Math.min(+_params.get('livello'), LIVELLI.length) - 1] || null
    : (_params.has('test') || _params.has('demo')) ? LIVELLI[0] : null;

if (partita && !MODO_TEST) Object.assign(stato, partita.risorse);

// Menu iniziale (solo se non è stata scelta una partita)
if (!partita) {
    const sbloccati = livelliSbloccati(), el = document.createElement('div');
    el.id = 'menu-iniziale';
    el.innerHTML = `<h1>🏰 Bastione</h1><h2>Campagna</h2><div class="livelli">` + LIVELLI.map(l => {
        const aperto = l.id <= sbloccati;
        return `<a class="livello${aperto ? '' : ' chiuso'}" ${aperto ? `href="?livello=${l.id}"` : ''}><b>${aperto ? '' : '🔒 '}Livello ${l.id}: ${l.nome}</b><span>${l.difficolta} · ${l.modo === 'assedio' ? 'distruggi il castello nemico' : `sopravvivi a ${l.ondateVittoria} ondate`}</span><small>${l.descrizione}</small></a>`;
    }).join('') + `</div><h2>Modalità libera</h2><div class="livelli"><a class="livello" href="?libera"><b>Solo costruzione</b><span>Niente nemici</span><small>Costruisci con calma, senza attacchi.</small></a></div>`;
    document.body.appendChild(el);
}
