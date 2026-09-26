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
The form is already wired to deliver to **hello@cognimorph.co** via FormSubmit
(`contact.html` → `action="https://formsubmit.co/ajax/hello@cognimorph.co"`).

FormSubmit requires a one-time confirmation before it will forward anything:
1. Deploy the site, open the live contact page and send one test enquiry.
2. FormSubmit emails hello@cognimorph.co an activation link. Click it.
3. Send a second test — it should now arrive in the inbox.

Until that link is clicked, submissions are accepted but not delivered, so do the
test before announcing the site. A honeypot field (`_gotcha`) is already in place.

If you would rather self-host the endpoint, swap the `action` URL for a Formspree,
Basin or Netlify Forms endpoint — the JavaScript posts JSON and expects a 2xx, so
any of those work without further changes.

## 3. Set the WhatsApp number
`js/site.js` → `var WA_NUMBER = '9771000000000';`
Replace with the real business number in international format (no `+`, no spaces).

## 4. Confirm the domain and social links
- All canonical tags and the sitemap assume `https://cognimorph.co/`. Update if the
  domain differs (search all files for `cognimorph.co`).
- `js/site.js` → LinkedIn URL is a guess. Verify or remove.
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
- Images ship as WebP with JPEG fallback, lazy-loaded below the fold.
- Structured data: Organization + FAQ (home), BreadcrumbList (inner pages).
- Brand logos in the tool stack come from the open `simple-icons` set. LinkedIn,
  Adobe, Canva, OpenAI, Midjourney and Runway were removed from that set at the
  trademark holders' request, so those are original glyphs. If you want the official
  marks, download them from each brand's own asset page and check the usage terms.
- All motion respects `prefers-reduced-motion`.
