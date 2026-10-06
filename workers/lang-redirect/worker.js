/**
 * Redirect lingua per albertoreineri.it (Cloudflare Worker).
 *
 * Chi apre una pagina italiana con un browser senza italiano tra le lingue accettate viene mandato alla
 * traduzione inglese. Regole, tutte pensate per non toccare l'indicizzazione italiana:
 *  - lavora lato server sull'intestazione Accept-Language, che Googlebot non invia: resta sull'italiano;
 *  - salta i crawler e gli strumenti di audit (User-Agent) e le richieste che non sono pagine;
 *  - redirect solo per le pagine presenti in /lang-map.json, generata da Hugo: pagine tradotte e
 *    istituzionali, mai gli articoli del blog;
 *  - la scelta fatta col selettore (cookie "ar-lang", impostato da main.js) vale più del browser;
 *  - 302 temporaneo e mai in cache pubblica: la risposta dipende da intestazioni e cookie.
 *
 * Il redirect inverso (inglese → italiano) sta nel sito, in head.html.
 * Deploy: vedi workers/lang-redirect/README.md
 */

const COOKIE_NAME = "ar-lang";
const MAP_PATH = "/lang-map.json";
const MAP_TTL_SECONDS = 300;

const BOT_PATTERN = /bot|crawl|spider|slurp|mediapartners|lighthouse|pagespeed|chrome-lighthouse|gtmetrix|facebookexternalhit|whatsapp|telegram|linkedin|preview|monitor|uptime|curl|wget|python-requests|headless/i;

/** Vero se tra le lingue accettate (q > 0) non c'è l'italiano, e l'intestazione non è vuota. */
export function acceptsNoItalian(header) {
  if (!header) return false;
  const tags = header
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const q = params.map((p) => p.trim()).find((p) => p.startsWith("q="));
      return { tag: tag.trim().toLowerCase(), q: q ? parseFloat(q.slice(2)) : 1 };
    })
    .filter((entry) => entry.tag && entry.tag !== "*" && entry.q > 0);
  if (tags.length === 0) return false;
  return !tags.some((entry) => entry.tag === "it" || entry.tag.startsWith("it-"));
}

function readCookie(header, name) {
  if (!header) return null;
  for (const part of header.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return rest.join("=");
  }
  return null;
}

let cachedMap = null;
let cachedAt = 0;

async function loadMap(origin) {
  const now = Date.now();
  if (cachedMap && now - cachedAt < MAP_TTL_SECONDS * 1000) return cachedMap;
  try {
    const res = await fetch(origin + MAP_PATH, { cf: { cacheEverything: true, cacheTtl: MAP_TTL_SECONDS } });
    if (res.ok) {
      cachedMap = await res.json();
      cachedAt = now;
    }
  } catch (e) {
    // Se la mappa non è raggiungibile non si fa nessun redirect: il sito resta in italiano
  }
  return cachedMap || {};
}

export default {
  async fetch(request) {
    if (request.method !== "GET" && request.method !== "HEAD") return fetch(request);

    const url = new URL(request.url);
    // Solo pagine: gli asset non finiscono con "/". Le pagine inglesi non si toccano.
    if (!url.pathname.endsWith("/") || url.pathname === "/en/" || url.pathname.startsWith("/en/")) {
      return fetch(request);
    }
    if (BOT_PATTERN.test(request.headers.get("User-Agent") || "")) return fetch(request);

    const choice = readCookie(request.headers.get("Cookie"), COOKIE_NAME);
    const wantsEnglish =
      choice === "en" ? true : choice === "it" ? false : acceptsNoItalian(request.headers.get("Accept-Language"));
    if (!wantsEnglish) return fetch(request);

    const map = await loadMap(url.origin);
    const target = map[url.pathname];
    if (!target) return fetch(request);

    return new Response(null, {
      status: 302,
      headers: {
        Location: target + url.search,
        "Cache-Control": "private, no-store",
        Vary: "Accept-Language, Cookie, User-Agent",
      },
    });
  },
};
