# Cognimorph website — project memory

Marketing site for **Cognimorph** (https://cognimorph.co), a digital agency: "Built by an expert team in
Nepal, accessible globally." Static HTML/CSS/vanilla JS, no framework. Live on **Vercel**
(project `cognimorph`, domains `cognimorph.co` primary, `www` → 308 → apex), DNS at **Namecheap**.

## Working rules
- Keep the brand exactly: colours (CSS tokens in `css/styles.css` `:root`), fonts (Source Serif 4 display,
  Inter body, self-hosted), logo and C+M mark. Don't rebuild sections without a reason; refine.
- Edit **sources**, then run `npm run build`. Never hand-edit `*.min.*` or the header/footer blocks in pages.
  - `css/styles.css` → `styles.min.css`; `js/site.js` (all pages), `js/home.js` (home), `js/world.js`
    (home + about world map) → `*.min.js`.
  - `scripts/build.mjs` renders the shared header/footer (NAV, FOOTER, SOCIAL icons) into every page,
    writes the CSP meta (hash of the inline theme script) and syncs it into `_headers` and `vercel.json`,
    and assembles `dist/` (what Vercel/Netlify publish).
- Clean URLs: link to `services`, `about`, `contact`… (no `.html`); home is `./`. Vercel `cleanUrls: true`;
  canonical/sitemap use `https://cognimorph.co/<page>`. `404.html` uses root `/`, `thank-you/` uses `../`.
- Motion: transform/opacity only, IntersectionObserver, one rAF scroll loop (`window.Cognimorph` toolkit),
  pause off-screen, full `prefers-reduced-motion` support; content visible without JS (`html.js` gates hidden states).
- Accessibility and performance are requirements: Lighthouse ~95–100 on all four categories, CLS 0, no
  horizontal overflow at 360–1920px, keyboard and focus states, alt text.
- Security: strict CSP (only FormSubmit external), no user input into innerHTML, `rel="noopener"` on
  external links, no third-party scripts or cookies.
- Write about people with their names or they/them (no guessed pronouns).
- Test before pushing: run the site (`npm start`, port 8080) and check desktop (1440/1920) and mobile (390)
  for layout, console errors and overflow.

## Content facts (confirmed by the client)
- Founded **2024**, Kathmandu. Offices: Kathmandu, Nepal and Dubai, UAE. Main markets: Dubai, Singapore,
  UK, Australia, USA.
- Leadership (both **Co-Founder & Managing Partner**):
  - **Madhav Bhattarai** (Dubai): vision, product, strategy, client growth, business development, team management.
  - **Bibesh Shrestha** (Kathmandu): operations, project delivery, team management, client growth,
    business development. (Earlier copies spelled it "Bibek"; client now writes "Bibesh".)
- Team (team.html, with "Based in" chips): Nabin Bhattarai (Sr. Developer, Germany), Sneha (Kathmandu),
  Nirmal Roka (Full Stack Developer, Finland); Digital Growth: Prakriti (Kathmandu), Rohan (UK),
  Sweta Pandey (Senior Social Media Manager, Nepal/Dubai); Creative: Sujata, Aashish (Kathmandu),
  Saugat Bhandari (Short-form Viral Video Lead, Dubai); AI & Automation: Nikita (Dubai), Manish (Kathmandu),
  Martin Roeters (AI Agent Developer, Netherlands).
- Clients (marquee): Hello5 (career intelligence), Risespace (AI productivity), 3B Foundation,
  Nepal Yoga Institute & Retreat, Bilva (fashion, natural thread), Radha Institute.
  Work page case studies: Risespace, Hello5.ai, Bilva.
- Metrics: 7+ years, $5M+ paid-media budget managed, 45M+ impressions, 150+ campaigns, 12 markets, 4 disciplines.
- Services: Digital Growth (performance marketing across paid social, search, programmatic — highlighted;
  SEO & AEO; social media; brand and content strategy), Digital Build, Creative, AI & Automation.
  Free consultation offered (`contact?topic=consultation` pre-selects it).
- Social (icons only, in `scripts/build.mjs` SOCIAL): LinkedIn https://www.linkedin.com/company/data-morph/,
  Instagram, Facebook, TikTok (full URLs in build.mjs).

## Contact form
`contact.html` posts to FormSubmit for **hello@cognimorph.co** (AJAX, then redirect to
https://cognimorph.co/thank-you). If the AJAX send is refused (e.g. FormSubmit not yet activated) it falls
back to a normal POST. FormSubmit needs a one-time "Activate Form" click from the hello@ inbox.

## Open items
- Home "Client voices" reviews are **placeholders**: replace with approved real quotes or remove before
  wide promotion; never add Review/Rating structured data for them.
- Add real team photos (currently initials). Confirm remaining sample team names.
- Vercel is on the Hobby plan (non-commercial); move to Pro or a company-owned account, ideally with the
  repo in a GitHub organization. See `LAUNCH-CHECKLIST.md` for DNS, FormSubmit and Search Console steps.
