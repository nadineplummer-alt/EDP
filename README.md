# Everyday Performance — 6-Week Foundation Programme landing page

A mobile-first, conversion-focused landing page for Meta (Facebook/Instagram) ads promoting EDP's
6-Week Foundation Programme. Plain HTML/CSS/JS — no build step. Host it on Netlify, Vercel,
GitHub Pages, or any web host by uploading the folder.

```
index.html     the landing page
styles.css     all styles (mobile-first)
script.js      form validation/submission, Meta Pixel events, sticky CTA, UTM capture
privacy.html   privacy policy template (linked from the form)
assets/        put photos here (see below)
```

Preview locally: `python3 -m http.server` then open http://localhost:8000

## Launch checklist

Search the code for `EDIT` to find every spot.

1. **Form destination**: set `FORM_ENDPOINT` at the top of `script.js` (Formspree, or a Zapier/Make
   webhook → Google Sheets / email / CRM). Until it's set, the form runs in demo mode and nothing is sent.
2. **Meta Pixel**: paste your Pixel base code into `<head>` in `index.html`. The page fires a
   standard `Lead` event on successful submission (optimise your campaign for this), plus custom
   `FormStart` and `CTAClick` events for diagnosing drop-off.
3. **Price**: replace `£XX` in the offer section and in the FAQ.
4. **Next start date**: update the announcement bar at the top (a real date improves conversions).
5. **Testimonials**: replace the three sample quotes with real member reviews (with permission),
   then remove the `is-sample` class from `.testimonials` to hide the "Sample" labels.
6. **Photos**: add these to `assets/` (real photos of your gym and members convert far better than stock):
   - `hero.jpg` — member(s) training, smiling, natural light, portrait ~1200×1500
   - `community.jpg` — the group together after a session, square ~1200×1200
   - `coach.jpg` — head coach/owner in the gym, portrait ~1000×1250
   - `og-image.jpg` — 1200×630 image used when the link is shared
   Until they're added, a designed colour panel shows instead, so nothing looks broken.
7. **Coach section, FAQ (sessions per week), footer address/phone/socials**: personalise.
8. **Privacy policy**: complete `privacy.html` with your business details.

## Ad tips

- Add UTM parameters to your ad URLs (e.g. `?utm_source=facebook&utm_campaign=foundation-oct`).
  They're captured automatically and sent with each lead, so you can see which ad produced it.
- Keep the ad's message consistent with the hero headline ("get back into a routine you'll actually
  stick to") — message match between ad and page lifts conversion.
- Call new leads quickly; speed-to-lead matters more than anything on the page.
