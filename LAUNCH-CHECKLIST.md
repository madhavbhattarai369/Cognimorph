# Cognimorph — pre-launch checklist

Ordered by impact. Items 1–4 should be done before the site goes public.

## 1. Replace all sample content
Search the codebase for `SAMPLE` — every instance is marked.
- `work.html` — four case studies. Figures are illustrative. Replace with audited,
  client-approved numbers, or remove any case you cannot evidence.
- `index.html` — client marquee names, industry claims.
- `team.html` — names, roles, photos.
- Metrics band on `index.html` (7+ years, 150+ campaigns, 12 markets, 4 disciplines).

Publishing invented client names or metrics you cannot back is the single largest
risk on this site. Two real case studies beat four invented ones.

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
