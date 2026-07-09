/* build-site.mjs - setzt Chrome (Header/Footer/Demo-Leiste/Reviews-Panel) aus EINER
   Quelle idempotent per Marker in jede *.html. Byte-identisch auf allen Seiten
   (Web-Starter-Kit §2a). Aufruf: node build-site.mjs   Danach deployen.
   partials/ + diese Datei werden NICHT deployed (reine Quellen). */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = dirname(fileURLToPath(import.meta.url));
const read = f => readFileSync(join(ROOT, f), 'utf8').trim();

const blocks = {
  header:  { open: '<!-- #chrome:header -->',  close: '<!-- /#chrome:header -->',  html: read('partials/header.html') },
  reviews: { open: '<!-- #chrome:reviews -->', close: '<!-- /#chrome:reviews -->', html: read('partials/reviews.html') },
  demobar: { open: '<!-- #chrome:demobar -->', close: '<!-- /#chrome:demobar -->', html: read('partials/demobar.html') },
  footer:  { open: '<!-- #chrome:footer -->',  close: '<!-- /#chrome:footer -->',  html: read('partials/footer.html') },
};

function inject(src) {
  let out = src, changed = false;
  for (const b of Object.values(blocks)) {
    const oi = out.indexOf(b.open), ci = out.indexOf(b.close);
    if (oi === -1 || ci === -1 || ci < oi) continue;
    const next = out.slice(0, oi + b.open.length) + '\n' + b.html + '\n' + out.slice(ci);
    if (next !== out) { out = next; changed = true; }
  }
  return { out, changed };
}

let n = 0;
for (const f of readdirSync(ROOT).filter(f => f.endsWith('.html'))) {
  const p = join(ROOT, f);
  const { out, changed } = inject(readFileSync(p, 'utf8'));
  if (changed) { writeFileSync(p, out, 'utf8'); n++; console.log('  chrome -> ' + f); }
}
console.log(`build-site: ${n} Seiten aktualisiert.`);
