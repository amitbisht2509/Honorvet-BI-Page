# HonorVet Dashboard Portal

An internal, department-gated portal for HonorVet Technologies' Power BI
dashboards. Employees pick their department, enter that department's password,
and see only the dashboards belonging to it.

Built with **HTML, CSS and vanilla JavaScript only** — no React, Angular, Vue,
Bootstrap, jQuery, build step, bundler, or `npm install`. It deploys to GitHub
Pages exactly as it sits on disk.

```
Landing page (dark)  →  department card  →  password popup
      →  department portal (light)  →  dashboard card  →  embedded Power BI report
```

---

## Table of contents

1. [Deploy to GitHub Pages](#1-deploy-to-github-pages)
2. [Change a password](#2-change-a-password)
3. [Update a Power BI report URL](#3-update-a-power-bi-report-url)
4. [Add a new dashboard](#4-add-a-new-dashboard)
5. [Add a new department](#5-add-a-new-department)
   &nbsp;·&nbsp; [5b. Sub-portals](#5b-sub-portals-healthcare-delivery-managers)
6. [Replace the HonorVet logo](#6-replace-the-honorvet-logo)
7. [How authentication works](#7-how-authentication-works)
8. [Limitations of GitHub Pages authentication](#8-limitations-of-github-pages-authentication)
9. [Upgrading to Cloudflare Access or Microsoft Entra ID](#9-upgrading-to-cloudflare-access-or-microsoft-entra-id)
10. [Folder structure](#10-folder-structure)
11. [Run it locally](#11-run-it-locally)
12. [Pre-rollout checklist](#12-pre-rollout-checklist)

---

## Default passwords — change these before rollout

| Portal | Default password |
|---|---|
| Executive | `Exec@HVT2026` |
| HR | `HR@HVT2026` |
| Healthcare | *no password — see below* |
| &nbsp;&nbsp;↳ Sunita Chauhan (Delivery Manager) | `Sunita@HVT2026` |
| &nbsp;&nbsp;↳ Team Leaders (group) | *no password — one per leader below* |
| &nbsp;&nbsp;&nbsp;&nbsp;↳ Heather Brown | `Heather@HVT2026` |
| &nbsp;&nbsp;&nbsp;&nbsp;↳ Shubham Abrol | `Shubham@HVT2026` |
| &nbsp;&nbsp;&nbsp;&nbsp;↳ Arthur Swift | `Arthur@HVT2026` |
| &nbsp;&nbsp;&nbsp;&nbsp;↳ Alex Ross | `Alex@HVT2026` |
| &nbsp;&nbsp;&nbsp;&nbsp;↳ Shailesh Singh | `Shailesh@HVT2026` |
| &nbsp;&nbsp;&nbsp;&nbsp;↳ Shivansh Sanmotra | `Shivansh@HVT2026` |
| &nbsp;&nbsp;&nbsp;&nbsp;↳ Rajnish Kumar | `Rajnish@HVT2026` |
| &nbsp;&nbsp;&nbsp;&nbsp;↳ Harshita Kukreja | `Harshita@HVT2026` |
| &nbsp;&nbsp;&nbsp;&nbsp;↳ Nitish Sharma | `Nitish@HVT2026` |
| IT | `IT@HVT2026` |
| NON-IT | `NonIT@HVT2026` |
| Pharmaceutical | `Pharma@HVT2026` |

**Healthcare is a hub, two levels deep.** Clicking its card asks for nothing and
opens a selection screen with two cards: delivery manager Sunita Chauhan
(password-protected) and **Team Leaders**, which also asks for nothing and opens a
further screen listing the nine leaders — each with their own password. Everyone
sees only their own dashboards, and no one can open anyone else's page. See
[section 5b](#5b-sub-portals-healthcare-delivery-managers).

Only the SHA-256 hashes are stored in `js/config.js`. Section 2 below explains
how to change them. If you want one shared password for everyone, generate the
hash for that one password for each portal.

---

## 1. Deploy to GitHub Pages

### Option A — no command line

1. Create a repository at [github.com/new](https://github.com/new), e.g.
   `honorvet-dashboard-portal`. On a free personal account GitHub Pages requires
   a **public** repository; GitHub Team/Enterprise can serve Pages from a
   private repo. See section 8 before making this public.
2. On the new repo page click **"uploading an existing file"**.
3. Drag in the **contents** of this folder (`index.html`, the six department
   pages, `viewer.html`, `.nojekyll`, and the `css/`, `js/`, `images/`,
   `icons/`, `tools/` folders) — not the folder itself. Commit.
4. **Settings → Pages → Build and deployment**: Source = "Deploy from a
   branch", Branch = `main`, Folder = `/ (root)`. Save.
5. Wait 1–2 minutes. Your URL will be
   `https://<username>.github.io/honorvet-dashboard-portal/`.

### Option B — command line

```bash
cd "Honorvet-BI-Page-main"
git init
git add .
git commit -m "HonorVet Dashboard Portal"
git branch -M main
git remote add origin https://github.com/<username>/honorvet-dashboard-portal.git
git push -u origin main
```

Then do step 4–5 above.

### Notes

- `.nojekyll` is already included — it tells Pages to serve the files as-is and
  skip Jekyll processing.
- Every path in the project is **relative** (`css/light.css`, not
  `/css/light.css`), so the portal works from a repo subpath without changes.
- Filenames are lowercase and referenced in lowercase. GitHub Pages is
  case-sensitive, so keep them that way.
- Publishing an update is just another commit — Pages redeploys in ~1 minute.
- Optional: delete the `tools/` folder before publishing if you'd rather not
  ship the password-hash authoring page. Nothing else depends on it.

---

## 2. Change a password

Passwords are never stored — only `SHA-256(saltPrefix + departmentKey + "|" + password)`.

1. Open **`tools/hash-generator.html`** in a browser (locally or on the
   deployed site).
2. Choose the department and type the new password. The hash appears instantly;
   nothing is uploaded anywhere.
3. Click **Copy config.js line**.
4. Open `js/config.js`, find that department in `HVBI.departments`, and replace
   its `passwordHash:` line with what you copied.
5. Commit and push. Anyone currently signed in keeps their session until they
   close the tab; new sign-ins need the new password.

<details>
<summary>Generating the hash without the tool</summary>

The hashed string is exactly `HVBI|v1|<departmentKey>|<password>`:

```powershell
# PowerShell
$text = 'HVBI|v1|hr|MyNewPassword'
$sha  = [System.Security.Cryptography.SHA256]::Create()
($sha.ComputeHash([Text.Encoding]::UTF8.GetBytes($text)) | % { $_.ToString('x2') }) -join ''
```

```bash
# macOS / Linux
printf '%s' 'HVBI|v1|hr|MyNewPassword' | shasum -a 256
```
</details>

> Changing `saltPrefix` or `sessionSecret` in `js/config.js` invalidates **all
> six** hashes / all active sessions. `sessionSecret` is a handy way to force
> everyone to sign in again.

---

## 3. Update a Power BI report URL

Everything lives in `js/config.js` → `HVBI.dashboards`. Find the dashboard and
edit its `url`:

```js
{
  id: "revenue",
  name: "Revenue Dashboard",
  description: "Revenue by vertical, client and period against target.",
  icon: "dollar",
  url: "https://app.powerbi.com/view?r=PASTE_REPORT_LINK_HERE",   // ← only this changes
  refreshed: "2026-08-03",
},
```

Save, commit, push. No HTML or CSS changes are ever needed.

- Leave `url: ""` for a report you don't have yet. The card renders in a clearly
  marked "Awaiting report URL" state instead of opening something broken.
- `refreshed: "YYYY-MM-DD"` drives the card's "Refreshed …" line and the
  department's "Last refresh" stat. Omit it and the card just says "recently".
- Add `embeddable: false` to a report you already know Power BI refuses to
  frame — the viewer then goes straight to its "Open in new tab" screen.

**Which kind of Power BI link should I use?**

| Link type | Sign-in required | Row-Level Security | Use for |
|---|---|---|---|
| **Publish to web** (`app.powerbi.com/view?r=…`) | ❌ None — public to anyone with the link | ❌ Not supported | Genuinely public data only |
| **Standard report link** (`app.powerbi.com/groups/…/reports/…`) | ✅ Microsoft Entra ID | ✅ If configured in the model | Most internal dashboards |
| **Power BI Embedded** (embed token from a backend) | ✅ Per-user token | ✅ If configured | Seamless embedding at scale; needs a backend |

The three URLs currently in `config.js` are "Publish to web" links carried over
from the previous version of this site. **Anyone with those links can view those
reports without signing in, regardless of this portal's password.** Swap them
for standard report links if the data is confidential — see section 8.

---

## 4. Add a new dashboard

Add one object to the right department array in `js/config.js`:

```js
HVBI.dashboards = {
  healthcare: [
    // … existing dashboards …
    {
      id: "nurseUtilisation",          // unique within this department
      name: "Nurse Utilisation",
      description: "Billable hours and utilisation by unit and shift.",
      icon: "gauge",                   // see the icon list below
      url: "https://app.powerbi.com/view?r=…",
      refreshed: "2026-08-03",
    },
  ],
};
```

Save and reload — the card, the search index, the department's dashboard count
and its "last refresh" stat all update automatically.

**Available `icon` keywords:** `trending`, `trendingDown`, `users`, `userPlus`,
`heart`, `server`, `briefcase`, `flask`, `target`, `dollar`, `chart`, `gauge`,
`clipboard`, `shield`, `shieldCheck`, `building`, `database`, `calendar`,
`clock`, `lock`, `key`, `grid`, `layers`. An unrecognised keyword silently falls
back to `grid`, so a typo never breaks a card. To add your own icon, drop a new
entry into the `ICONS` map at the top of `js/app.js` (24×24 stroked SVG paths).

---

## 5. Add a new department

Four small steps.

**1. Add it to `HVBI.departments` in `js/config.js`:**

```js
{
  key: "finance",                       // internal id, lowercase, no spaces
  name: "Finance",
  page: "finance.html",
  tagline: "Billing, collections and margin analytics.",
  icon: "dollar",
  from: "#6366F1",                      // gradient start
  to: "#8B5CF6",                        // gradient end
  passwordHash: "…",                    // from tools/hash-generator.html
},
```

> The hash generator reads its department list from `config.js`, so add the
> department first (with a placeholder hash), reload the tool, then generate the
> real hash and paste it in.

**2. Add its dashboards to `HVBI.dashboards`:**

```js
finance: [
  { id: "billing", name: "Billing", description: "…", icon: "dollar", url: "" },
],
```

**3. Create `finance.html`** — copy any existing department page (e.g.
`hr.html`) and change exactly three things:

```html
<title>Finance Portal — HonorVet Dashboard Portal</title>
<script>HVAuth.guard("finance");</script>
<body class="theme-light" data-page="department" data-dept="finance">
```

**4. Done.** The landing page reads the department list from config, so the new
card appears automatically. Six cards fill two rows of three; a seventh starts a
third row and the grid stays responsive.

---

## 5b. Sub-portals (Healthcare delivery managers)

A portal can be turned into a **hub**: its own card asks for no password and
instead opens a selection screen listing sub-portals. Hubs nest to any depth, so
a hub can contain further hubs. Healthcare uses both levels today:

```
index.html                          Six department cards
   └── Healthcare  (no password)
        └── healthcare.html         Three cards
             ├── Sunita Chauhan  → password → healthcare-sunita.html
             └── Team Leaders  (no password)
                  └── healthcare-team-leaders.html    Nine leader cards
                       ├── Heather Brown     → password → healthcare-tl-heather.html
                       ├── Shubham Abrol     → password → healthcare-tl-shubham.html
                       ├── Arthur Swift      → password → healthcare-tl-arthur.html
                       ├── Alex Ross         → password → healthcare-tl-alex.html
                       ├── Shailesh Singh    → password → healthcare-tl-shailesh.html
                       ├── Shivansh Sanmotra → password → healthcare-tl-shivansh.html
                       ├── Rajnish Kumar     → password → healthcare-tl-rajnish.html
                       ├── Harshita Kukreja  → password → healthcare-tl-harshita.html
                       └── Nitish Sharma     → password → healthcare-tl-nitish.html
```

Every leaf page is an ordinary light-theme dashboard page. The two hub pages
(`healthcare.html`, `healthcare-team-leaders.html`) hold no dashboards and no
report URLs — only the list of who exists — which is why it is safe for them to
be unguarded.

**Team Leaders holds nine leaders.** Its card opens without a password and lists
all nine, each with their own password and their own copy of the six healthcare
reports. Their dashboards roll up automatically: the Team Leaders card shows 54,
and the Healthcare card on the landing page shows 60 (1 manager x 6 + 9 leaders
x 6). Adding or removing a leader is a `js/config.js` edit plus one copied page —
the counts, badges and breadcrumbs all follow.

**Access rules** (all enforced by `HVAuth.guard()`, verified end-to-end):

- Opening `healthcare-sunita.html` without signing in redirects to
  `healthcare.html` — the screen that can let you in — not to the landing page.
- A Sunita session cannot open `healthcare-tl-nitish.html`, or
  `viewer.html?dept=healthcare-tl-nitish&id=…`. It is redirected.
- Nitish's password does not unlock Sunita's portal, and vice versa.
- The Healthcare *card* itself cannot be logged into at all — it has no hash.

### Adding a Healthcare team leader

1. Pick a key, e.g. `healthcare-tl-anita`, and generate its hash in
   `tools/hash-generator.html`.
2. Add an entry to `HVBI.subPortals["healthcare-team-leaders"]` in `js/config.js`:

   ```js
   {
     key: "healthcare-tl-anita",
     name: "Anita Rao",
     role: "Team Leader",
     parent: "healthcare-team-leaders",
     page: "healthcare-tl-anita.html",
     tagline: "Healthcare pipeline led by Anita Rao.",
     icon: "users",
     from: "#38BDF8",
     to: "#0EA5E9",
     passwordHash: "…",
   },
   ```

3. Add the same key to `HVBI.dashboards` with that leader's dashboards (copy the
   `healthcare-sunita` block if they should have the standard six).
4. Copy `healthcare-sunita.html` to `healthcare-tl-anita.html` and change three
   things — the `<title>`, `HVAuth.guard("healthcare-tl-anita")`, and
   `data-dept="healthcare-tl-anita"` on `<body>`.

Everything else — breadcrumb (`Portal › Healthcare › Team Leaders › Anita Rao`),
back button, avatar initials, footer, card counts — is derived from config at
runtime. Verified end to end with a temporary leader before shipping this.

### Adding another manager to Healthcare

1. Generate a hash for them in `tools/hash-generator.html` (sub-portals appear in
   the dropdown, grouped under their department).
2. Add an entry to `HVBI.subPortals.healthcare` in `js/config.js`:

   ```js
   {
     key: "healthcare-rahul",         // must be unique; also used in HVBI.dashboards
     name: "Rahul Verma",
     role: "Delivery Manager",
     parent: "healthcare",
     page: "healthcare-rahul.html",
     tagline: "Healthcare delivery portfolio managed by Rahul Verma.",
     icon: "users",
     from: "#6366F1",
     to: "#8B5CF6",
     passwordHash: "…",
   },
   ```

3. Add their dashboards under the same key in `HVBI.dashboards`.
4. Copy `healthcare-sunita.html` to `healthcare-rahul.html` and change three
   things — the `<title>`, `HVAuth.guard("healthcare-rahul")`, and
   `data-dept="healthcare-rahul"` on `<body>`. Everything else (header, avatar
   initials, breadcrumb, back button, footer) is filled in from config at runtime.

The hub card's dashboard count and "last updated" are aggregated across its
sub-portals automatically, so nothing else needs maintaining.

### Turning another department into a hub

Add a `HVBI.subPortals.<deptKey>` array, set `requiresAuth: false` on that
department and delete its `passwordHash`, then replace its page with a copy of
`healthcare.html` (change `data-parent`, the `<title>`, the eyebrow, and the
heading text). Move its dashboards from `HVBI.dashboards.<deptKey>` to the new
sub-portal keys.

### Going back to a single Healthcare portal

Delete the `HVBI.subPortals.healthcare` array, give the Healthcare department a
`passwordHash` again and drop `requiresAuth: false`, move the dashboards back
under a `healthcare:` key, and replace `healthcare.html` with a copy of another
department page guarded on `"healthcare"`.

---

## 6. Replace the HonorVet logo

Two logo files are in use, on purpose:

| File | Used on | Size |
|---|---|---|
| `honorvet-logo.png` | **Landing page hero only** — the full mark + "HONORVET TECHNOLOGIES" wordmark | 1536×1024 |
| `honorvettech_logo-removebg-preview.png` | Everywhere else: the login popups, the Healthcare hub, and every department app bar | 200×200 |
| `honorvet-logo-lockup.png` | *Not referenced.* An optional pre-cropped, sharper copy of the hero lockup — see the note at the end of this section | 640×192 |

The landing page also falls back to the **square mark** on windows shorter than
730px, because the wordmark's small "TECHNOLOGIES" line stops being legible below
about 74px tall. Both `<img>` tags are in `index.html`; CSS shows one at a time.

**Easiest change:** overwrite `honorvettech_logo-removebg-preview.png` with your
own **square, transparent** logo. That updates every page except the landing hero.

### How the hero lockup is cropped

`honorvet-logo.png` is 1536×1024 and roughly **60% of it is empty margin**, so it
is cropped in CSS rather than sized naively — otherwise the lockup shrinks to a
speck inside its tile. Geometry measured from the file's alpha channel:

| Region | Source rows |
|---|---|
| Mark + "HONORVET TECHNOLOGIES" | 287–640 |
| Accreditation line | 677–709 *(cropped out)* |

The crop lives in `css/dark.css` under `.brand-mark-wide .brand-lockup`:

```css
aspect-ratio: 1536 / 397;          /* visible band height, in source pixels */
object-fit: cover;
object-position: center 45.26%;    /* vertical centre of the lockup */
height: clamp(72px, 10vh, 108px);  /* drives the on-screen size */
```

That shows source rows 265–662 — the lockup with an even 22px margin above and
below. **The accreditation line is deliberately excluded**: at hero size it
renders about 5px tall and reads as a smudge rather than text. To include it,
change two values to `aspect-ratio: 1536 / 460` and `object-position: center 48.6%`.

If you replace `honorvet-logo.png` with different artwork, re-measure and update
those numbers, or delete all four lines if your file is already tightly cropped.

**Optional: a sharper hero.** Because the source is 1536px wide and displays at
about 330px, the browser downscales it ~4.6×, which softens fine detail.
`honorvet-logo-lockup.png` is the same crop resampled offline to 640×192 with a
light unsharp mask — it renders visibly crisper and is 126 KB instead of 1.6 MB.
To use it, point the `.brand-lockup` `<img>` at that file, set its `width`/`height`
to `640`/`192`, and delete the `aspect-ratio` / `object-fit` / `object-position`
lines above (the file is already cropped). To regenerate it after changing the
logo, needs Python + Pillow:

```bash
python - <<'EOF'
from PIL import Image, ImageFilter
src = Image.open("images/honorvet-logo.png").convert("RGBA")
art = src.crop((160, 287, 1340, 641))          # trim margin + accreditation line
w, h = art.size
out = art.resize((round(w * 192 / h), 192), Image.LANCZOS)
out = out.filter(ImageFilter.UnsharpMask(radius=0.7, percent=65, threshold=2))
out.save("images/honorvet-logo-lockup.png", "PNG", optimize=True)
print(out.size)
EOF
```

**If you want a different filename or format** (e.g. `images/logo.svg`), update
these 15 references — two `<img>` tags plus the `apple-touch-icon` link in
`index.html`, and one `<img>` plus the `apple-touch-icon` link in each of the six
department pages. Find them all with:

```bash
grep -rn "honorvettech_logo-removebg-preview.png" *.html
```

**Resizing.** Three variables in `css/components.css` cover the square mark:

```css
--logo-size-hero: 68px;    /* hub pages e.g. healthcare.html (58x58 tile) */
--logo-size-modal: 42px;   /* login popup                    (58x58 tile) */
--logo-size-bar: 28px;     /* department app bar             (34x34 chip) */
```

The landing hero lockup is height-driven instead, in `css/dark.css`:

```css
.theme-dark .brand-mark-wide .brand-lockup { height: clamp(72px, 10vh, 108px); }
```

That height is the **cropped band**, not the artwork — the artwork fills 89% of
it, so 86px of band gives about 77px of visible logo.

Each tile sizes itself from the image plus its padding, so raising a value grows
the tile with it. Keep the hero within its clamp — the landing page is built to
fit one screen without scrolling (see [section 10](#10-folder-structure)), and a
taller logo eats that budget. The app-bar chip is hidden under 760px, where the
department tile carries the branding instead.

**Notes on logo files**

- A **square** image is ideal — all three containers are square. A wide lockup
  will be letterboxed inside them rather than distorted (`object-fit: contain`),
  so if you must use one, widen the containers too.
- A **transparent** background is important. The landing and popup tiles are
  translucent glass and the app-bar chip is white; a logo with its own solid
  background would cover them with a rectangle.
- Avoid files with large built-in blank margins — they make the artwork look
  small inside the tile, since the container has no way to tell padding from
  artwork.
- `images/honorvet-logo.png` (the earlier 1536×1024 marketing render) is no
  longer referenced anywhere. It is safe to delete, and doing so removes 1.6 MB
  from the deployed site.

The browser-tab icon is separate: `icons/favicon.svg`. Edit its gradient stops
and bars, or replace it with your own SVG/ICO and update the
`<link rel="icon">` tags.

---

## 7. How authentication works

**Sign-in**

1. Clicking a department card opens the login popup — no navigation happens yet.
2. `js/auth.js` computes `SHA-256("HVBI|v1|" + deptKey + "|" + password)` in the
   browser and compares it to that department's `passwordHash` in `config.js`
   using a length-safe, constant-time-style comparison. The password itself is
   never stored, logged, or sent anywhere.
3. On a match, a signed session record is written to `sessionStorage`:

   ```json
   { "dept": "healthcare", "exp": 1785807286148, "sig": "…" }
   ```

   where `sig = SHA-256(dept | passwordHash | sessionSecret | exp)`.

4. The browser navigates to that department's page.

**Staying signed in**

- `sessionStorage` means the session lives in **one browser tab** and dies when
  that tab closes — a new tab requires signing in again.
- Sessions also expire after `auth.maxSessionMinutes` (default 480 = 8 hours).
  The remaining time is shown in the avatar menu.
- Re-clicking your own department's card while signed in skips the popup and
  shows "Resume Session".

**Protecting pages**

Every protected page runs the guard as its first script, before anything
renders:

```html
<script src="js/config.js"></script>
<script src="js/auth.js"></script>
<script>HVAuth.guard("healthcare");</script>
```

`guard()` adds `hv-locked` to `<html>`, which CSS uses to keep the page blank,
then verifies the session and only reveals the page if it is valid. It
redirects to `index.html?denied=1` — and the landing page explains why — when
the session is:

- missing (someone typed `healthcare.html` directly),
- expired,
- signed for a **different** department (an HR session cannot open Executive),
- or tampered with (the signature no longer matches, and it is deleted).

`viewer.html` guards on the `?dept=` value in its own URL, so report URLs can't
be reached by editing the query string from another department's session.

Because the gate fails closed, a browser with JavaScript disabled never reveals
a protected page — it shows the "JavaScript required" banner instead.

**Brute-force throttle:** 5 wrong attempts locks the popup for 30 seconds
(`auth.maxAttempts` / `auth.lockoutSeconds`), and each attempt takes a minimum
of ~420 ms.

**What is stored on the user's machine**

| Where | Key | Contents |
|---|---|---|
| `sessionStorage` | `hvbi.session` | department key, expiry, signature |
| `localStorage` | `hvbi.favorites.<dept>` | starred dashboard ids |

No personal data, no passwords, no analytics.

---

## 8. Limitations of GitHub Pages authentication

**Please read this before publishing real dashboards.**

GitHub Pages serves static files. There is no server-side code, no session
server, and no way to hide anything from a visitor's browser. So:

- **The password hashes are public.** Anyone can open `js/config.js` (or press
  F12) and read all six hashes. SHA-256 is fast to compute, so a weak or
  guessable password can be brute-forced offline. Use long, random passwords.
- **The report URLs are public.** They sit in `js/config.js` in plain text. The
  password gate hides the *portal UI*, not the links. A visitor who reads the
  source can copy a report URL and open it directly, skipping the portal
  entirely.
- **Which is only a problem if the URL itself isn't protected.** A standard
  `app.powerbi.com` report link still demands a Microsoft Entra ID sign-in and
  still enforces Row-Level Security — so the real gate is Power BI. A
  **"Publish to web"** link has no sign-in at all and is viewable by anyone on
  the internet who has it, forever, no matter what this portal does.
- **Client-side checks can be bypassed.** Anyone comfortable with dev tools can
  write a session record by hand or disable the guard script.
- **A public repo means public source.** On a free account, Pages requires a
  public repo — so `config.js` and every report URL in it are world-readable.

**Therefore, treat this portal's password as organisation and convenience, not
as security:** it stops casual browsing, keeps departments in their own lane,
and makes the portal feel like an internal tool. Real confidentiality has to
come from Power BI itself (Entra ID sign-in + RLS) or from a proper edge gate —
next section.

**Practical mitigations if you stay on GitHub Pages:**

1. Use **standard `app.powerbi.com` report links**, not "Publish to web", for
   anything confidential.
2. Configure **Row-Level Security** in the Power BI semantic model.
3. Use long, unique department passwords and rotate them when people leave.
4. Host from a **private repo** (GitHub Team/Enterprise) so the source isn't
   world-readable.
5. Delete `tools/` from the published site.

---

## 9. Upgrading to Cloudflare Access or Microsoft Entra ID

Both options put a real identity check **in front of** the static files, so
nothing — not `config.js`, not the report URLs — is served until the visitor has
proved who they are. The portal keeps working exactly as-is; you can leave the
department passwords on as a second layer or delete them.

### Option A — Cloudflare Access (Zero Trust) — quickest real gate

Free for small teams and needs no code changes.

1. Put the site behind Cloudflare: either move hosting to **Cloudflare Pages**
   (drag-and-drop or connect the repo, no build command), or keep GitHub Pages
   and point a Cloudflare-proxied custom domain at it.
2. In the **Cloudflare Zero Trust** dashboard → **Access → Applications → Add
   an application → Self-hosted**, enter the portal's hostname.
3. Add a policy, e.g. *Allow · Emails ending in `@honorvet.com`*, or require
   membership of a group.
4. Connect an identity provider — Microsoft Entra ID, Google Workspace, or
   one-time email PINs (no IdP setup needed).

Visitors now hit a Cloudflare login before a single file is served. Optionally
also enable **Cloudflare Web Analytics** for usage stats, and delete the
department popup once Access groups mirror your departments.

### Option B — Microsoft Entra ID — best fit for a Microsoft tenant

You already use Entra ID for Power BI, so this gives one sign-in for both.

- **Azure Static Web Apps** (simplest): deploy this same folder (no build step),
  then add Entra ID authentication in `staticwebapp.config.json`:

  ```json
  {
    "routes": [{ "route": "/*", "allowedRoles": ["authenticated"] }],
    "responseOverrides": { "401": { "redirect": "/.auth/login/aad", "statusCode": 302 } }
  }
  ```

  Users are redirected to their normal Microsoft sign-in. Entra ID app roles or
  security groups (`Portal-HR`, `Portal-Executive`, …) can then drive which
  department pages someone may open — replacing the password popup with real
  identity.

- **Azure App Service** with "Authentication / Easy Auth" set to Entra ID
  achieves the same for the same static files.

- **Power BI Embedded** is the end state for a fully seamless experience:
  reports render inside the portal with no Power BI sign-in prompt, using
  per-user embed tokens minted by a small backend (an Azure Function is enough).
  This also lets RLS follow the signed-in user automatically. At that point
  `config.js` holds report *ids* rather than public URLs, and nothing sensitive
  ships to the browser.

**Recommended path:** ship as-is with standard Power BI links → add Cloudflare
Access or Azure Static Web Apps + Entra ID → move to Power BI Embedded if you
want the fully in-portal experience.

---

## 10. Folder structure

```
├── index.html                Landing page — six department cards + login popup (dark)
├── executive.html            Executive portal      (light)
├── hr.html                   HR portal             (light)
├── healthcare.html           Healthcare HUB — manager/group picker (dark, no login)
├── healthcare-sunita.html    Sunita Chauhan portal (light)
├── healthcare-team-leaders.html  Team Leaders HUB — leader picker (dark, no login)
├── healthcare-tl-*.html      Nine team leader portals (light) — heather, shubham,
│                              arthur, alex, shailesh, shivansh, rajnish, harshita,
│                              nitish
├── it.html                   IT portal             (light)
├── nonit.html                NON-IT portal         (light)
├── pharma.html               Pharmaceutical portal (light)
├── viewer.html               Embedded Power BI report viewer (light)
├── css/
│   ├── components.css        Design tokens, reset, buttons, modal, toasts,
│   │                          skeletons, keyframes  (shared by both themes)
│   ├── dark.css              Landing page + login popup
│   └── light.css             Department pages + report viewer
├── js/
│   ├── config.js             ← EDIT THIS: passwords, departments, dashboards, URLs
│   ├── auth.js               SHA-256, session signing, guard() — used by every page
│   └── app.js                Icons + landing / department / viewer controllers
├── images/
│   ├── honorvet-logo.png     Landing hero: mark + wordmark (cropped in CSS)
│   ├── honorvettech_logo-removebg-preview.png  Square mark, used everywhere else
│   └── honorvet-logo-lockup.png  Unused: optional pre-cropped, sharper hero copy
├── icons/
│   └── favicon.svg           Browser-tab icon
├── tools/
│   └── hash-generator.html   Admin helper for generating password hashes
├── .nojekyll                 Serve files as-is on GitHub Pages
└── README.md                 This file
```

### The landing page is designed to fit one screen

`index.html` and `healthcare.html` are built to show everything — logo, title,
subtitle, stat chips, all cards and the footer — **without scrolling** on any
desktop or laptop window. Three mechanisms do this, all in `css/dark.css`:

1. **`.portal` is a centred flex column with `min-height: 100dvh`**, applied only
   at widths above 680px.
2. **Every vertical measurement is a `vh`-based `clamp()`** — paddings, margins,
   the logo, the title, the icon tiles, the button height. The page compresses
   smoothly as the window shortens instead of jumping at breakpoints.
3. **A short-viewport tier at `max-height: 730px`** trims the least essential
   details once those clamps bottom out: the card tagline drops from two lines to
   one, and the logo and title step down.

Two related constraints, worth knowing before you edit them:

- **The 3-column breakpoint is held at 900px** (`css/components.css`), not the
  usual ~1080px. Three columns keep the six cards in *two* rows; two columns
  would make three rows, which cannot fit a short window.
- **The hero logo is capped at 96px tall.** Growing it further pushes the cards
  off screen; below 730px of window height it is swapped for the square mark.
- **The card is deliberately compact** — icon, name and lock badge share one row,
  and the two stats are a single meta line rather than a bordered block. Below
  1040px wide the badge collapses to its icon so "Pharmaceutical" is not
  truncated; the full text stays as a tooltip.

Verified with no scrolling at 1920×1080, 1440×900, 1440×860, 1366×768,
1280×800, 1280×720, 1280×700, 1152×620, 1024×768 and 920×660. Below ~600px tall
the page is allowed to scroll rather than shrink into illegibility, and phones
(≤680px wide) scroll normally — six cards in one column cannot fit any phone.

**If you add a seventh department**, the grid becomes three rows and the landing
page will scroll again. Either accept that, or reduce what each card shows.

Design system notes: all colour, spacing, radius, shadow and motion values are
CSS custom properties in `css/components.css` (`:root`). Each theme redefines
`--bg`, `--surface`, `--text`, `--border` etc. on `.theme-dark` / `.theme-light`,
and each department's gradient (`--from` / `--to`) is applied at runtime from
`config.js`, so re-theming is a token edit, not a rewrite. Fonts are the system
stack (Inter → Segoe UI → system-ui) so there are no web-font downloads.
Animations respect `prefers-reduced-motion`.

---

## 11. Run it locally

Serve it over `http://` rather than opening the files as `file://`, so
`sessionStorage`, `localStorage` and the report iframe all behave normally.

```bash
python -m http.server 8080
```

Then open `http://localhost:8080`. Alternatives: VS Code's **Live Server**
extension (right-click `index.html` → "Open with Live Server"), or `npx serve .`
if Node is already installed. There is nothing to build or install.

**Keyboard shortcuts on a department page:** `/` focuses search, `Esc` clears
it. In the login popup, `Esc` cancels and `Enter` submits.

---

## 12. Pre-rollout checklist

- [ ] All fifteen passwords changed from the defaults (five departments, one
      Healthcare delivery manager, nine Healthcare team leaders).
- [ ] Passwords communicated to each department / manager through a secure channel.
- [ ] Every `url` in `js/config.js` filled in (80 of the 84 dashboards are still
      `""` and show "Awaiting report URL").
- [ ] Confirmed Sunita's and Nitish's dashboard URLs point at *their own*
      filtered reports — they start as identical placeholders.
- [ ] No confidential report uses a **"Publish to web"** link — the three
      inherited URLs in `config.js` are Publish-to-web and should be reviewed.
- [ ] Row-Level Security configured in Power BI wherever different users must
      see different data.
- [ ] `refreshed` dates set for the reports you configured.
- [ ] Logo replaced if needed (`images/honorvet-logo.png`).
- [ ] `tools/` deleted from the published site (optional).
- [ ] Tested: direct visit to `healthcare.html` without signing in redirects to
      the landing page.
- [ ] Tested: an HR session cannot open `executive.html` or an Executive
      `viewer.html?dept=executive&id=…` URL.
- [ ] Tested: the Healthcare card opens with no password, and a Sunita session
      cannot open `healthcare-tl-nitish.html`.
- [ ] All nine team leader passwords changed from the defaults above.
- [ ] Each leader's six dashboard URLs pointed at *their own* filtered reports —
      they ship as identical empty placeholders.
- [ ] Tested: wrong password shows the inline error, five wrong attempts lock
      the popup for 30 seconds.
- [ ] Tested: logout clears the session, and closing the tab does too.
- [ ] Tested at desktop, tablet (2 columns) and mobile (1 column) widths.
- [ ] Tested at least one real report end-to-end: it embeds, or the
      "Open in New Tab" fallback appears correctly if Power BI blocks framing.
- [ ] Read section 8 and decided whether GitHub Pages is appropriate for this
      data, or whether to go straight to section 9.
