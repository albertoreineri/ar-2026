# Redirect lingua (Cloudflare Worker)

Manda alla versione inglese chi apre una pagina italiana con un browser senza italiano tra le lingue accettate.
Le regole sono nel commento in cima a `worker.js`. Il redirect inglese → italiano è invece nel sito (`head.html`).

## Deploy

Con Wrangler (serve il login a Cloudflare):

    cd workers/lang-redirect
    npx wrangler deploy

Oppure dal pannello: Workers & Pages → Create → Worker → incolla `worker.js` → Deploy, poi Settings → Domains & Routes →
aggiungi la route `albertoreineri.it/*` (zona `albertoreineri.it`).

Dopo un deploy del sito la mappa `/lang-map.json` si aggiorna da sola (il Worker la rilegge ogni 5 minuti).

## Verifica

Il Worker salta i crawler e gli strumenti da riga di comando (anche `curl`): senza un User-Agent da browser non
fa mai redirect. Per questo i comandi sotto impostano `-A`.

    UA="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36"

    # inglese → 302 verso /en/
    curl -sI -A "$UA" -H "Accept-Language: en-US,en;q=0.9" https://albertoreineri.it/ | grep -iE "^(HTTP|location)"
    # italiano → 200
    curl -sI -A "$UA" -H "Accept-Language: it-IT,it;q=0.9,en;q=0.8" https://albertoreineri.it/ | grep -iE "^(HTTP|location)"
    # scelta dell'utente: cookie "it" batte il browser inglese → 200
    curl -sI -A "$UA" -H "Accept-Language: en-US" -H "Cookie: ar-lang=it" https://albertoreineri.it/ | grep -iE "^(HTTP|location)"
    # Googlebot, anche con inglese → 200
    curl -sI -A "Googlebot/2.1" -H "Accept-Language: en-US" https://albertoreineri.it/ | grep -iE "^(HTTP|location)"
    # un articolo del blog non viene mai spostato → 200
    curl -sI -A "$UA" -H "Accept-Language: en-US" https://albertoreineri.it/nano-editor-guida-per-principianti/ | grep -iE "^(HTTP|location)"

## Disattivarlo

Rimuovi la route dal pannello (o `npx wrangler delete`): il sito torna a comportarsi come prima.
