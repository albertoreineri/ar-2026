// Pannello info: mostra l'edificio selezionato (scorte, stato, bloccaggi) o le unità selezionate
let edificioSelezionato = null, pannelloChiave = null;

const NOMI_DIREZIONE = { N: 'Nord', S: 'Sud', E: 'Est', O: 'Ovest' };
const FRECCE_DIREZIONE = { N: '⬆️', S: '⬇️', E: '➡️', O: '⬅️' };

const ETICHETTE_STATO = {
    cerca: 'In attesa', vaLavoro: 'In cammino', vaAlbero: 'Va verso un albero', taglia: 'Taglia',
    lavora: 'Al lavoro', cercaMag: 'Cerca dove consegnare', torna: 'Consegna il carico',
};

function aggiornaPannello() {
    const el = document.getElementById('info'), sel = stato.unita.filter(u => u.sel);
    const chiave = edificioSelezionato ? 'e' + stato.edifici.indexOf(edificioSelezionato) : sel.length ? 'u' : '';
    if (chiave !== pannelloChiave) {
        pannelloChiave = chiave;
        el.innerHTML = '';
        el.style.display = chiave ? 'block' : 'none';
        if (edificioSelezionato) {
            el.innerHTML = `<b>${edificioSelezionato.def.nome}</b><div id="info-dyn"></div>`;
            if (edificioSelezionato.tipo !== 'fossato') {
                const b = document.createElement('button');
                b.id = 'btn-ripara';
                b.onclick = () => riparaEdificio(edificioSelezionato);
                el.appendChild(b);
            }
            if (edificioSelezionato.def.apribile) {
                const b = document.createElement('button');
                b.id = 'btn-portone';
                b.onclick = () => alternaPortone(edificioSelezionato);
                el.appendChild(b);
            }
            if (edificioSelezionato.def.commercio) {
                for (const [r, p] of Object.entries(PREZZI)) {
                    const riga = document.createElement('div');
                    riga.style.cssText = 'display:flex;gap:4px;margin-top:6px;align-items:center';
                    riga.append(`${ICONE_RISORSE[r]} ${LOTTO_MERCATO}`);
                    for (const compra of [true, false]) {
                        const b = document.createElement('button');
                        b.style.cssText = 'margin:0;padding:6px 8px';
                        b.textContent = `${compra ? 'Compra' : 'Vendi'} ${(compra ? p.compra : p.vendi) * LOTTO_MERCATO}💰`;
                        b.onclick = () => commercia(r, compra);
                        riga.appendChild(b);
                    }
                    el.appendChild(riga);
                }
            }
            for (const tipo of edificioSelezionato.def.recluta || []) {
                const u = UNITA[tipo], b = document.createElement('button');
                b.textContent = `Recluta ${u.nome} (${Object.entries(u.costo).map(([r, n]) => n + ' ' + r).join(', ')} + ${u.pop || 1} 👥)`;
                b.onclick = () => recluta(tipo, edificioSelezionato);
                el.appendChild(b);
            }
        } else if (chiave) el.innerHTML = '<b>Unità</b><div id="info-dyn"></div><small>Clic sul terreno: muovi · doppio clic: stesso tipo</small>';
    }
    const dyn = document.getElementById('info-dyn');
    if (!dyn) return;
    const righe = [];
    if (edificioSelezionato) {
        const e = edificioSelezionato, t = e.tipo, f = Math.floor;
        if (e.def.apribile) {
            document.getElementById('btn-portone').textContent = e.aperto ? '🔒 Chiudi portone' : '🔓 Apri portone';
            righe.push(e.aperto ? 'Aperto: passano tutti' : 'Chiuso: nessuno passa');
        }
        if (t === 'magazzino') righe.push(`🪵 Legno: ${f(stato.legno)}`, `🪨 Pietra: ${f(stato.pietra)}`, `⛏️ Ferro: ${f(stato.ferro)}`);
        else if (t === 'granaio') righe.push(`🍞 Pane: ${f(stato.pane)}`, `🧀 Formaggio: ${f(stato.formaggio)}`);
        else if (t === 'mercato') righe.push(`💰 Oro: ${f(stato.oro)}`);
        else if (t === 'casa') righe.push(`Ospita ${e.def.popolazione} abitanti`, `Popolazione: ${stato.pop}/${stato.popMax}`);
        else if (t === 'caserma') righe.push(...Object.keys(UNITA).map(k => `${UNITA[k].nome}: ${stato.unita.filter(u => u.tipo === k).length}`));
        righe.push(`❤️ Vita: ${Math.ceil(e.hp)}/${e.hpMax}`);
        const rip = document.getElementById('btn-ripara');
        if (rip) {
            rip.style.display = e.hp < e.hpMax && !e.nemico ? 'block' : 'none';
            rip.textContent = `🔧 Ripara (${costoRiparazione(e)} ${ICONE_RISORSE[e.def.riparaCon || 'legno']})`;
        }
        if (t === 'panetteria') righe.push(`Grano in deposito: ${f(e.grano || 0)}`);
        if (e.w) righe.push(`Lavoratore: ${ETICHETTE_STATO[e.w.stato] || e.w.stato}`);
        if (e.w && e.w.blocco) righe.push(`<span style="color:#ff7675">⚠ ${e.w.blocco}</span>`);
    } else {
        const n = {};
        sel.forEach(u => n[u.d.nome] = (n[u.d.nome] || 0) + 1);
        righe.push(...Object.entries(n).map(([k, v]) => `${k}: ${v}`));
    }
    dyn.innerHTML = righe.join('<br>');
}
