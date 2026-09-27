// Cognimorph build
// 1. Renders the shared header and footer into every page (between the
//    <header id="site-header"> / <footer id="site-footer"> tags), so navigation
//    is real HTML: it paints immediately and works without JavaScript.
// 2. Minifies css/styles.css and js/*.js into the .min files the pages load.
//
// Edit navigation, footer links or contact details here, then run `npm run build`.
import { readFileSync, writeFileSync, readdirSync, existsSync, rmSync, mkdirSync, cpSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { createHash } from 'node:crypto';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

const SITE = {
  contactUrl: 'contact.html', // → https://cognimorph.co/contact.html
  email: 'hello@cognimorph.co',
  linkedin: 'https://www.linkedin.com/company/cognimorph'
};

const NAV = [
  ['services.html', 'Services'],
  ['work.html', 'Work'],
  ['insights.html', 'Insights'],
  ['about.html', 'About'],
  ['team.html', 'Team'],
  ['careers.html', 'Careers']
];

const FOOTER = [
  ['Capabilities', [
    ['services.html#build', 'Digital Build'],
    ['services.html#growth', 'Digital Growth'],
    ['services.html#creative', 'Creative'],
    ['services.html#ai', 'AI & Automation']
  ]],
  ['Company', [
    ['work.html', 'Work'],
    ['insights.html', 'Insights'],
    ['about.html', 'About'],
    ['team.html', 'Team'],
    ['careers.html', 'Careers']
  ]],
  ['Get in touch', [
    [SITE.contactUrl, 'Contact us'],
    ['mailto:' + SITE.email, 'Email'],
    [SITE.linkedin, 'LinkedIn', true]
  ]]
];

// Pages that live outside the site root resolve shared links through a prefix
const PAGES = [
  ...readdirSync(ROOT).filter(f => f.endsWith('.html')).map(f => ({ file: f, root: f === '404.html' ? '/' : '' })),
  ...(existsSync(join(ROOT, 'thank-you/index.html')) ? [{ file: 'thank-you/index.html', root: '../' }] : [])
];

const esc = s => s.replace(/&(?![a-z]+;|#\d+;)/g, '&amp;');
const link = (root, href) => /^(https?:|mailto:|tel:|#|\/)/.test(href) ? href : root + href;

const ICON = {
  moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" class="icon-moon" aria-hidden="true"><path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z"/></svg>',
  sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" class="icon-sun" aria-hidden="true"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.4M12 19.1v2.4M4.6 4.6l1.7 1.7M17.7 17.7l1.7 1.7M2.5 12h2.4M19.1 12h2.4M4.6 19.4l1.7-1.7M17.7 6.3l1.7-1.7"/></svg>',
  menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M3 7h18M3 12h18M3 17h18"/></svg>',
  close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M5 5l14 14M19 5L5 19"/></svg>'
};

function header(page, root) {
  const cur = href => (href === page ? ' aria-current="page"' : '');
  const logos = `<img class="logo-light" src="${root}assets/logo-horizontal.png" alt="Cognimorph" width="122" height="30">`
    + `<img class="logo-dark" src="${root}assets/logo-horizontal-dark.png" alt="Cognimorph" width="122" height="30">`;
  const brand = `<a class="brand" href="${link(root, 'index.html')}" aria-label="Cognimorph home">${logos}</a>`;
  const contact = link(root, SITE.contactUrl);
  return `<header id="site-header">
  <div class="site-header">
    <div class="container nav-row">
      ${brand}
      <nav class="nav-links" aria-label="Primary">
        ${NAV.map(([h, l]) => `<a href="${link(root, h)}"${cur(h)}>${l}</a>`).join('\n        ')}
      </nav>
      <div class="nav-right">
        <button type="button" class="icon-btn theme-toggle" id="theme-toggle" aria-pressed="false" aria-label="Switch to dark mode">${ICON.moon}${ICON.sun}</button>
        <a class="btn btn-primary" id="nav-cta" href="${contact}">Let&rsquo;s talk</a>
        <button type="button" class="icon-btn menu-toggle" id="menu-open" aria-label="Open menu" aria-expanded="false" aria-controls="mobile-menu">${ICON.menu}</button>
      </div>
    </div>
  </div>
  <div class="mobile-menu" id="mobile-menu" role="dialog" aria-modal="true" aria-label="Site menu" inert>
    <div class="mobile-menu-top">
      ${brand}
      <button type="button" class="icon-btn mobile-menu-close" id="menu-close" aria-label="Close menu">${ICON.close}</button>
    </div>
    <nav class="mobile-menu-links" aria-label="Mobile">
      ${NAV.map(([h, l], i) => `<a href="${link(root, h)}"${cur(h)} style="--i:${i}"><span class="mnum" aria-hidden="true">0${i + 1}</span>${l}</a>`).join('\n      ')}
    </nav>
    <div class="mobile-menu-foot">
      <a class="btn btn-primary" href="${contact}">Let&rsquo;s talk <span class="btn-arrow" aria-hidden="true">&rarr;</span></a>
      <a class="mail" href="mailto:${SITE.email}">${SITE.email}</a>
    </div>
  </div>
</header>`;
}

function footer(root) {
  const cols = FOOTER.map(([title, links]) => `      <div>
        <h2>${title}</h2>
        <ul>
          ${links.map(([h, l, ext]) => `<li><a href="${link(root, h)}"${ext ? ' target="_blank" rel="noopener"' : ''}>${esc(l)}</a></li>`).join('\n          ')}
        </ul>
      </div>`).join('\n');
  return `<footer id="site-footer" class="site-footer bg-navy">
  <div class="container">
    <div class="footer-top">
      <div class="footer-brand">
        <img src="${root}assets/logo-horizontal-dark.png" alt="Cognimorph" width="114" height="28" loading="lazy">
        <p>Your digital partner for the AI age. Built by an expert team in Nepal, accessible globally.</p>
        <p><a class="footer-link" href="mailto:${SITE.email}">${SITE.email}</a></p>
        <p class="footer-offices">Offices: Kathmandu, Nepal &middot; Dubai, UAE</p>
      </div>
${cols}
    </div>
    <div class="footer-bottom">
      <span>&copy; <span id="footer-year">${new Date().getFullYear()}</span> Cognimorph. All rights reserved.</span>
      <div class="footer-bottom-links">
        <a href="${link(root, 'privacy.html')}">Privacy</a>
        <a href="${link(root, 'terms.html')}">Terms</a>
        <a href="#main">Back to top &uarr;</a>
      </div>
    </div>
  </div>
</footer>`;
}

// Content-Security-Policy: only our own files, plus FormSubmit for the contact form.
// The one inline script (theme + JS flag, runs before first paint) is allowed by hash,
// so the policy stays correct automatically whenever that snippet changes.
function csp(html) {
  const hashes = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)]
    .map(m => `'sha256-${createHash('sha256').update(m[1]).digest('base64')}'`);
  return [
    "default-src 'self'",
    `script-src 'self' ${hashes.join(' ')}`.trim(),
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self'",
    "connect-src 'self' https://formsubmit.co",
    "form-action 'self' https://formsubmit.co",
    "manifest-src 'self'",
    "base-uri 'self'",
    "object-src 'none'"
  ].join('; ');
}
const SECURITY_META = html =>
  `<meta http-equiv="Content-Security-Policy" content="${csp(html)}">\n<meta name="referrer" content="strict-origin-when-cross-origin">`;

let changed = 0;
for (const { file, root } of PAGES) {
  const path = join(ROOT, file);
  const page = file.split('/').pop();
  const src = readFileSync(path, 'utf8');
  const out = src
    .replace(/<header id="site-header"[\s\S]*?<\/header>/, header(page, root))
    .replace(/<footer id="site-footer"[\s\S]*?<\/footer>/, footer(root))
    .replace(/<meta http-equiv="Content-Security-Policy"[^>]*>\n<meta name="referrer"[^>]*>\n/, '')
    .replace(/(<meta charset="UTF-8">\n)/, (m) => m + SECURITY_META(src) + '\n');
  if (out !== src) { writeFileSync(path, out); changed++; }
}

// Keep the host-level header file (_headers) on the same inline-script hash
const headersPath = join(ROOT, '_headers');
if (existsSync(headersPath)) {
  const index = readFileSync(join(ROOT, 'index.html'), 'utf8');
  const hash = (csp(index).match(/'sha256-[^']+'/) || [''])[0];
  const h = readFileSync(headersPath, 'utf8').replace(/'sha256-[^']*'/, hash);
  writeFileSync(headersPath, h);
  const vercelPath = join(ROOT, 'vercel.json');
  if (existsSync(vercelPath)) {
    const v = JSON.parse(readFileSync(vercelPath, 'utf8'));
    for (const rule of v.headers || []) for (const hd of rule.headers) {
      if (hd.key === 'Content-Security-Policy') hd.value = hd.value.replace(/'sha256-[^']*'/, hash);
    }
    writeFileSync(vercelPath, JSON.stringify(v, null, 2) + '\n');
  }
}

await build({ entryPoints: ['js/site.js', 'js/home.js', 'js/world.js'].map(f => join(ROOT, f)), outdir: join(ROOT, 'js'), outExtension: { '.js': '.min.js' }, minify: true, target: 'es2017', logLevel: 'warning' });
await build({ entryPoints: [join(ROOT, 'css/styles.css')], outfile: join(ROOT, 'css/styles.min.css'), minify: true, logLevel: 'warning' });

// 3. Assemble dist/: only the files the public site needs (no docs, sources or build scripts)
const DIST = join(ROOT, 'dist');
rmSync(DIST, { recursive: true, force: true });
mkdirSync(DIST);
const PUBLIC = [
  ...readdirSync(ROOT).filter(f => f.endsWith('.html')),
  'thank-you', 'assets', 'css/styles.min.css', 'js/site.min.js', 'js/home.min.js', 'js/world.min.js',
  'site.webmanifest', 'robots.txt', 'sitemap.xml', 'llms.txt', '_headers', '.well-known'
];
for (const p of PUBLIC) {
  if (existsSync(join(ROOT, p))) cpSync(join(ROOT, p), join(DIST, p), { recursive: true });
}

console.log(`Built: ${PAGES.length} pages checked, ${changed} updated; css/styles.min.css, js/site.min.js, js/home.min.js written; dist/ ready to publish.`);
