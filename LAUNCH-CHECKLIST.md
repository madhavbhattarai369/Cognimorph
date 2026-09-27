# Cognimorph — pre-launch checklist

Ordered by impact. Items 1–4 should be done before the site goes public.

## 1. Confirm remaining content
- Client marquee and Work page now use real clients (Hello5, Risespace, 3B Foundation, Nepal Yoga
  Institute & Retreat, Bilva, Radha Institute). Confirm each client is happy to be named, and review the
  product descriptions on `work.html`.
- Metrics band on `index.html` (7+ years, $5M+ paid media budget managed, 45M+ impressions, 150+ campaigns, 12 markets, 4 disciplines) — confirm these
  figures, or edit them. The on-page "illustrative" labels were removed at the client's request.
- `team.html` — confirm every name and role (leadership, Nabin Bhattarai, Nirmal Roka, Sweta Pandey,
  Saugat Bhandari and Martin Roeters were provided by the client; the rest are earlier sample names).
  Add real photos for everyone.
- `about.html` — "Founded 2024" (set on request); JSON-LD `foundingDate` matches.
- `index.html` — **Client voices**: the six reviews are placeholders written in a realistic style. Replace each with an approved quote from a real client (role, company type and city) before launch, or remove the section. Do not add Review/Rating structured data for them.

## 2. Activate the contact form (one click)
The form delivers to **hello@cognimorph.co** via FormSubmit and then sends the visitor to
**https://cognimorph.co/thank-you** (the page lives in `thank-you/index.html`).
- With JavaScript: `contact.html` posts to `https://formsubmit.co/ajax/hello@cognimorph.co`,
  then redirects to the URL in the form's `data-redirect` attribute.
- Without JavaScript: the form posts natively to `https://formsubmit.co/hello@cognimorph.co`
  and FormSubmit follows the hidden `_next` field to the same thank-you URL.

FormSubmit requires a one-time confirmation before it will forward anything:
1. Deploy the site, open the live contact page and send one test enquiry.
2. FormSubmit emails hello@cognimorph.co an activation link. Click it.
3. Send a second test — it should now arrive in the inbox and land on /thank-you.

Until that link is clicked FormSubmit answers "needs activation"; the page then shows an
"email us directly" fallback instead of pretending the message was sent. A honeypot field
(`_honey`, FormSubmit's spam trap) is in place.

## 3. Set the WhatsApp number
`js/site.js` → `CONFIG.whatsapp` (international format, digits only, e.g. `'9779800000000'`),
then run `npm run build`. While it is empty, every WhatsApp button stays hidden, so no
visitor is sent to a dead number.

## 4. Confirm the domain and social links
- All canonical tags and the sitemap assume `https://cognimorph.co/`. Update if the
  domain differs (search all files for `cognimorph.co`).
- LinkedIn URL is a guess. Verify it in `scripts/build.mjs` (header/footer) and `contact.html`, then run `npm run build`.
- `hello@cognimorph.co` must exist and be monitored.

## 4b. Hosting and security headers
- `_headers` works as-is on Netlify and Cloudflare Pages. On other hosts, set the same headers.
- Make sure the host serves `404.html` for missing pages and `thank-you/index.html` at `/thank-you`.
- If you add analytics, update the Content-Security-Policy in `scripts/build.mjs` and `_headers`, and the privacy policy.

## Publishing on Vercel (+ Namecheap DNS)
`vercel.json` runs `npm run build`, serves `dist/` and sends the same security headers as `_headers`.

1. Vercel → Project → **Settings → Git**: set the production branch to the branch that holds the site
   (or merge it into `main`).
2. Vercel → Project → **Settings → Domains**: add `cognimorph.co` and `www.cognimorph.co`; choose to redirect
   `www` to `cognimorph.co`. Vercel then shows the exact records to create (use those values if they differ
   from below).
3. Namecheap → Domain List → **Manage → Advanced DNS → Host Records**:
   - Delete the parking records (`URL Redirect Record` on `@`, `CNAME www → parkingpage.namecheap.com`) and
     any older A/CNAME for `@` or `www` (for example Netlify's).
   - **A Record**: Host `@`, Value `76.76.21.21` (or the newer IP Vercel shows, e.g. `216.198.79.1`), TTL Automatic.
   - **CNAME Record**: Host `www`, Value `cname.vercel-dns.com` (or the project-specific value Vercel shows),
     TTL Automatic.
   - Keep all **MX** and **TXT** records (email for hello@cognimorph.co). If you have a **CAA** record, add
     `0 issue "letsencrypt.org"` so Vercel can issue HTTPS.
4. Wait until Vercel shows "Valid Configuration" for both domains (minutes to a few hours); HTTPS is issued
   automatically. Then test `https://cognimorph.co/thank-you`, a made-up URL (404 page) and one form enquiry,
   and click FormSubmit's activation email.

## Publishing (Netlify + Namecheap)
The repo is ready for Netlify: `netlify.toml` runs `npm run build` and publishes `dist/` (public files only).
`_headers` (security + caching) and `404.html` are picked up automatically; `/thank-you` is served from
`thank-you/index.html`.

**1. Netlify**
1. Sign in at app.netlify.com with GitHub, then **Add new site → Import an existing project → GitHub**.
2. Pick `madhavbhattarai369/Cognimorph` and the branch that holds the site. Build settings fill in from
   `netlify.toml`; click **Deploy**. Check the preview URL (`something.netlify.app`).
3. **Domain management → Add a domain →** `cognimorph.co`. Choose to keep DNS at Namecheap
   ("external DNS"). Netlify then shows the records to create.

**2. Namecheap (Domain List → Manage → Advanced DNS → Host Records)**
- Delete the parking records: any `URL Redirect Record` for `@`, and `CNAME www → parkingpage.namecheap.com`.
- Add **A Record**: Host `@`, Value `75.2.60.5` (Netlify's load balancer; use the value Netlify shows if it
  differs), TTL Automatic.
- Add **CNAME Record**: Host `www`, Value `your-site-name.netlify.app`, TTL Automatic.
- Do **not** delete MX, TXT (SPF/DKIM) or other mail records: they keep hello@cognimorph.co working.

**3. After DNS updates (minutes to a few hours)**
- Netlify → Domain management: set `cognimorph.co` as primary (www redirects to it) and confirm HTTPS
  (Let's Encrypt) is active.
- Open `https://cognimorph.co/thank-you`, a made-up URL (should show the 404 page) and send one test
  enquiry, then click FormSubmit's activation email.
- SEO / AEO: submit `https://cognimorph.co/sitemap.xml` in Google Search Console and Bing Webmaster Tools,
  and run the home page through Google's Rich Results Test.

## 5. Analytics and tracking
Not installed deliberately — you should choose and configure these.
- GA4 + Google Tag Manager
- Meta Pixel + Conversions API
- Submit `sitemap.xml` in Google Search Console
- Set up conversion events for form submission and WhatsApp clicks

## 6. Nice to have, in priority order
- Booking link (Cal.com / Calendly) on "Start a project" — shortens the sales cycle
- Real team photography — the largest available trust upgrade
- Publish at least one genuine article; `insights.html` currently lists draft titles only
- Legal review of `terms.html` and `privacy.html` (both are unreviewed templates)
- Update the privacy policy once you know which analytics you run

## Technical notes
- See `README.md` for the build step and project structure.
- Images ship as AVIF → WebP → JPEG with responsive `srcset`, lazy-loaded below the fold.
- Structured data: Organization + FAQ (home), BreadcrumbList (inner pages).
- Brand logos in the tool stack come from the open `simple-icons` set. LinkedIn,
  Adobe, Canva, OpenAI, Midjourney and Runway were removed from that set at the
  trademark holders' request, so those are original glyphs. If you want the official
  marks, download them from each brand's own asset page and check the usage terms.
- All motion respects `prefers-reduced-motion`.
