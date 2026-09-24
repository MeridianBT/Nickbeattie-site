# nickbeattie.com

A single-page personal site for Nick Beattie. It uses plain HTML, CSS and vanilla JavaScript, with no build step and no dependencies. You can open `index.html` directly, or serve the folder from GitHub Pages.

```
index.html      All page content (hero, case studies, timeline, capabilities, contact)
styles.css      Design system, layout, motion
main.js         Settings + LinkedIn cards at the top; site behaviour below
CNAME           nickbeattie.com (for GitHub Pages)
.nojekyll       Tells GitHub Pages to serve files as-is
robots.txt, sitemap.xml
assets/
  fonts/        Newsreader + IBM Plex Sans (self-hosted woff2, OFL licences included)
  img/          favicon.svg/png, apple-touch-icon.png, og-image.png, headshot files, cases/
  logos/        Company logo SVGs (optional)
  video/        Hoshin Kanri demo video + poster (optional)
tools/          Helpers you run occasionally; they aren't loaded by the site
```

## Preview locally

Either double-click `index.html`, or run a tiny server from this folder (better, because it matches GitHub Pages):

```
npx serve .          # or: python3 -m http.server 8080
```

---

## 1. Things still to fill in `[TBC]`

Anything unconfirmed is wrapped in `class="tbc"` and shows with a **yellow highlight**.

- **On your computer, on `*.github.io` and on preview links**, the highlights are visible.
- **On nickbeattie.com**, highlighted items are hidden automatically. A case study "beat" that is entirely `[TBC]` disappears rather than showing a placeholder.
- To see them on the live site, add `?tbc` to the URL: `https://nickbeattie.com/?tbc`.
- To force them on or off everywhere, change `SHOW_TBC` in the small script in the `<head>` of `index.html`. It accepts `'auto'`, `true` or `false`.

Search `index.html` for `tbc` to find each one:

| # | Where | What's needed |
|---|---|---|
| 1 | Case 01 Digital sales › The situation | One or two sentences on what buying looked like before, and why it needed to change. |
| 2 | Case 02 Merger › hero number | Currently **2 → 1** "entities combined". Swap it for a hard number if you have one, then delete the `tbc` note. |
| 3 | Case 02 Merger › The situation | Any extra context after "Two related businesses…". |
| 4 | Case 02 Merger › What changed | The outcome: cost, headcount, time to integrate. |
| 5 | Case 04 Commercial › The situation | What the parts business looked like before, and the problem to solve. |
| 6 | Case 05 People › The situation | The brief had no "situation" beat for this case, so I added a slot. Fill it or delete the whole `<div class="beat beat--tbc">`. |
| 7 | Build › copy | One line on who uses the Hoshin Kanri app and one result. |
| 8 | Writing › 3 LinkedIn cards | Edit the `WRITING` array at the top of `main.js`. Until at least one card has `tbc: false`, the whole Writing section and its nav link are hidden on the live site. |

When you fill an item in, delete the `<span class="tbc">…</span>` wrapper. If the whole beat was TBC, also remove `beat--tbc` from its `<div class="beat …">`.

## 2. Missing assets (add the file, then flip the switch)

All the switches are in the `CONFIG` block at the top of `main.js`. Until a switch is `true`, the site uses a designed fallback and never requests a missing file, so there are no 404s.

| Asset | Put it here | Then |
|---|---|---|
| Headshot | `assets/img/headshot.jpg` (portrait, at least 1200×1500) | Run the image tool (below), then set `ASSETS.headshot: true`. Until then the hero shows an "NB" monogram panel. |
| Resume (public, no phone) | `assets/Nick-Beattie-Resume.pdf` | Set `ASSETS.resume: true`. Until then the resume buttons show a dashed yellow outline locally and are **hidden** on nickbeattie.com. |
| Hoshin app video | `assets/video/hoshin.mp4` (muted H.264, short loop, ideally under 3 MB) | Also add a poster frame (below), then set `ASSETS.hoshinVideo: true`. Until then the laptop shows a strategy-cascade diagram. |
| Hoshin video poster | `assets/video/hoshin-poster-src.png` or `.jpg` | Run the image tool, which writes `assets/video/hoshin-poster.jpg`. |
| Case study screenshots (optional) | `assets/img/cases/src/<key>.png`, where the keys are `digital-sales-browser`, `digital-sales-phone`, `merger`, `integration`, `parts`, `people` | Run the image tool, then set `CASE_SHOTS['<key>']: true`. Add `data-alt="…"` to that `.frame__screen` in `index.html` to describe the screenshot. Until then each frame shows its drawn diagram. **Don't use real Honda UI** unless you're cleared to. |
| Company logos (optional) | `assets/logos/honda.svg`, `holden.svg`, `futuris.svg` | Set `LOGOS_AS_TEXT: false`. Logos render grey and turn full colour on hover. Any file that fails to load falls back to its text wordmark. |
| Contact form key | n/a | See section 4. |

### Image tool

Run this once to install the tool:

```
npm install --no-save sharp
```

Then run this each time you add images:

```
node tools/optimise-images.mjs
```

It writes AVIF, WebP and JPEG at several widths. The headshot is cropped to 4:5 around the most interesting area. The page picks the best format and size for each device.

`tools/render-og.mjs` regenerates `og-image.png` (the LinkedIn/social preview card) and the favicon PNGs from `tools/og-template.html` and `assets/img/favicon.svg`. It needs Playwright, which you install with `npx playwright install chromium`.

---

## 3. Editing content later (no layout code)

- **Case studies:** In `index.html`, each case is an `<article class="chapter">` between `CASE STUDIES` comments. Edit the label, title, standfirst, hero number and the three beats (`<dt>` is the heading, `<dd>` is the text) in place.
  - Adding `chapter--flip` to the article's class puts the visual on the left. Alternate them.
  - A count-up number looks like `<span data-count data-prefix="$" data-to="10" data-suffix="m">$10m</span>`. Keep the plain text inside it the same as the final value, because that's what shows with JavaScript or motion switched off.
- **Metrics strip:** The `AT A GLANCE` section in `index.html` works the same way.
- **Career timeline:** In `index.html`, each role is an `<li class="role">`. The `<summary>` is always visible (title, company · dates, one-line summary). The `<ul class="role__highlights">` holds the 2–3 points shown on expand. Copy an existing `<li>` to add a role.
- **LinkedIn cards:** Edit the `WRITING` array at the top of `main.js`. Set `tbc: false` once a card is real.
  - To let visitors open a post in place, add its `embedUrl`. On LinkedIn, open the post, choose "… › Embed this post" and copy the `src="https://www.linkedin.com/embed/feed/update/…"` part.
  - Nothing from LinkedIn loads until someone clicks **Show post**.
- **Capabilities, education, contact copy, footer:** Plain text in `index.html`.
- **Colours and fonts:** The tokens are at the top of `styles.css` under `:root`, with the dark theme just below.

## 4. Contact form (Web3Forms)

1. Go to https://web3forms.com and create a free access key with the inbox you want messages sent to. Your address stays with Web3Forms and never appears in this code.
2. Paste the key into `CONFIG.WEB3FORMS_KEY` in `main.js`. The key is designed to be public.
3. Send yourself a test message from the live site. Until the key is set, the form tells visitors it isn't connected yet and points them to LinkedIn.

Spam protection: a hidden `botcheck` honeypot field. Web3Forms also filters on its side.

## 5. Deploy to GitHub Pages with your VentraIP domain

> I couldn't create a new repository from the build session: GitHub returned "Resource not accessible by integration". So the site sits in the `nickbeattie-site/` folder of the working branch. Moving it into its own repository takes about two minutes. Your GitHub username is **MeridianBT**.

### a. Create the repository and push

1. On GitHub, click **New repository**. Name it `nickbeattie-site` and make it **Public**, since free Pages needs a public repo. Don't add a README.
2. From inside this `nickbeattie-site` folder:
   ```
   git init -b main
   git add .
   git commit -m "nickbeattie.com v1"
   git remote add origin https://github.com/MeridianBT/nickbeattie-site.git
   git push -u origin main
   ```

### b. Turn on Pages

3. In the repo, go to **Settings › Pages**. Set **Source** to "Deploy from a branch", **Branch** to `main`, folder `/ (root)`, and click **Save**.
4. Wait a minute. The site appears at `https://meridianbt.github.io/nickbeattie-site/`. Check it there first, with the [TBC] highlights showing.

### c. Add the custom domain *before* touching DNS

5. Still in **Settings › Pages**, under **Custom domain**, enter `nickbeattie.com` and click **Save**. The `CNAME` file in this repo already says the same thing.
6. Recommended: protect the domain from takeover. Go to your GitHub account (**Settings › Pages › Add a domain**) and verify `nickbeattie.com`. GitHub will give you a TXT record to *add* (see the note below).

### d. VentraIP DNS

7. Log in to VentraIP and open **My Services › Domain Names › nickbeattie.com › DNS Management**.
8. Remove any existing **A** records for `@` (the bare domain) that point elsewhere, such as parking or old hosting. Then add these four:

   | Type | Host | Value | TTL |
   |---|---|---|---|
   | A | @ | 185.199.108.153 | 3600 |
   | A | @ | 185.199.109.153 | 3600 |
   | A | @ | 185.199.110.153 | 3600 |
   | A | @ | 185.199.111.153 | 3600 |

9. Add, or replace any existing `www` record with, this:

   | Type | Host | Value | TTL |
   |---|---|---|---|
   | CNAME | www | meridianbt.github.io | 3600 |

   The value is `<username>.github.io` with no repo name and no `https://`.

> ⚠️ **Leave every MX and TXT record exactly as it is.** They run your nickbeattie.com email and its SPF/DKIM/DMARC checks. Changing or deleting them will stop mail from arriving. The only TXT change is *adding* the new GitHub verification record from step 6, if you did that step.

### e. HTTPS

10. DNS usually takes 10 minutes to a few hours. Back in **Settings › Pages**, wait for "DNS check successful". GitHub then issues a free certificate, which can take up to an hour.
11. Tick **Enforce HTTPS**. If the box is greyed out, the certificate isn't ready yet, so come back later.
12. Visit https://nickbeattie.com and https://www.nickbeattie.com. Both should load, and www redirects to the bare domain.

### Before launch

- Set `ASSETS.resume: true` once the PDF is in (otherwise resume buttons are hidden live), and add the Web3Forms key.
- Fill or delete the `[TBC]`s. Open `https://nickbeattie.com/?tbc` to check none are left.
- Paste the URL into LinkedIn's [Post Inspector](https://www.linkedin.com/post-inspector/) to refresh the preview card.

## 6. Analytics (off in v1)

There is no tracking, no cookies and no analytics. A commented placeholder for Plausible or GoatCounter sits in the `<head>` of `index.html`. Uncomment one line when you want it.

## 7. What was checked

- 375, 768, 1024 and 1440px widths, in light, dark and reduced motion. No horizontal scroll at any width.
- Lighthouse (mobile, with gzip like GitHub Pages): Performance 98–100, Accessibility 100, Best Practices 100, SEO 100. The page is about 220 KB transferred, excluding the resume PDF.
- W3C Nu HTML validator: no errors. The remaining notices are deliberate `role="list"` attributes, which keep list semantics in Safari/VoiceOver.
- No console errors. No external requests on page load. LinkedIn loads only on click. Web3Forms is contacted only on submit.
- No email address or phone number anywhere in the code.
- Text contrast meets WCAG AA in both themes. The lowest is copper on paper, at 4.9:1 in light and 5.7:1 in dark.
- Form: inline errors (announced via `aria-live`), focus moves to the first problem, spinner while sending, retry on failure, and an inline thank-you on success.
