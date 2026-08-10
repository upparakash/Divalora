# Divalora — Development Log

Premium, handbags-only e-commerce site in the visual and functional language of prada.com. No cart or
checkout on the customer-facing side — this is a browse + search catalog backed by a real database,
managed through an internal admin dashboard. Full plan lives at the roadmap below; each phase gets a
dated log entry here once it's done and verified.

## ▶ Resume here (updated 2026-08-09)

**Everything is done through Phase 6, plus five pieces of follow-on work** (admin auth, logo typography,
real product photos, favicon, banner management — see the checklist below). **Only Phase 7 (Deployment
Readiness) is left.** The site is fully functional locally; nothing is deployed anywhere yet.

**To pick this back up:**
```
npm run dev   # from the project root — client :5173, server :4001
```
`server/.env` already has working RDS credentials, JWT secret, and admin credentials — nothing to
reconfigure to keep developing locally.

- **Admin panel**: `http://localhost:5173/admin` — see "Admin Authentication" below for how login works;
  the plaintext password was shared with you in chat when generated, not stored anywhere in this repo or
  file. If it's lost, generate a new one and re-hash it into `ADMIN_PASSWORD_HASH`.
- **Catalog**: 23 products; 8 have real photography (Totes, Top Handle, one Shoulder Bag, one Clutch —
  see "Real Product Photography" below for exactly which). The other 15, and the Crossbody/Mini
  Bag/Travel categories entirely, still show the intentional placeholder graphic.
- **Hero banners**: every Hero (Home, Handbags, About) is now managed through `/admin` → Banners
  instead of hardcoded — see "Banner Management System" below. All 3 currently have one banner each with
  no media (text-only, falls back to the placeholder gradient), ready for real images/video to be
  uploaded whenever they exist.

**What's actually left:**
1. **Phase 7 — Deployment Readiness** (not started — the only unchecked roadmap item): production
   env config, **CORS lockdown** (currently wide open, fine for localhost-only dev), a secrets review,
   updating `SITE_URL` off `localhost` once a real domain exists, hosting + actual deploy.
2. **Content, not code**: more product photography and hero banner images/video whenever they exist —
   drop product files into `/public/products/<slug>/` or upload through `/admin`; banner media uploads
   through `/admin` → Banners → edit → Media. No code changes needed for either.
3. **Optional**: `logo.jpeg` (the real gold-foil brand mark) isn't used as the nav/footer logo itself —
   it has a solid cream background that would look wrong on white/black without a transparent export.
   Only its flourish emblem became the favicon; the wordmark still renders via the Bodoni Moda font.

## Roadmap

- [x] **Phase 0** — Foundation & Backend Bootstrap
- [x] **Phase 1** — Prada-Inspired Design System
- [x] **Phase 2** — Handbags Catalog Data Layer
- [x] **Phase 3** — Admin Dashboard
- [x] **Phase 4** — Storefront Core Pages (PLP + PDP)
- [x] **Phase 5** — Search Experience
- [x] **Phase 6** — Polish, Responsiveness, Performance, SEO
- [ ] **Phase 7** — Deployment Readiness

**Additional work done outside the numbered phases** (each has its own dated log entry below):
- [x] Admin Authentication — real login, no longer the open-by-design gap Phase 3 shipped with
- [x] Logo Typography — Bodoni Moda wordmark
- [x] Real Product Photography — 8 of 23 products
- [x] Favicon — cropped from the real logo file
- [x] Banner Management System — admin-managed hero carousels (image + video) for Home/Handbags/About

> **Phase 3 was inserted after Phase 2** (customer originally scoped "no accounts," but a code-only
> seed-script workflow for catalog management wasn't going to be usable day-to-day — see the Phase 3 log
> below). Phases that were previously numbered 3–6 are now 4–7.
>
> ✅ **Former standing security note, now resolved**: Phase 3 originally shipped the admin dashboard with
> no authentication (an explicit, informed decision to move faster). Real auth was added immediately
> after — see the "Admin Authentication" log entry below. `/api/admin/*` and `/admin` now require a
> valid login.

---

## Phase 0 — Foundation & Backend Bootstrap (2026-08-08)

### What was built
- New `server/` directory: a standalone Express + Sequelize (mysql2 dialect) API, separate
  `package.json` from the client.
- `server/src/config/env.js` — loads and validates required env vars.
- `server/src/db/sequelize.js` — Sequelize connection instance.
- `server/src/models/Product.js` — first data model, maps to table `Divalora_products` (prefixed to
  stay clearly separated from the existing `lms_management` database's other tables).
- `server/src/db/migrate.js` — connects to the DB and syncs the `Product` model, creating/altering
  `Divalora_products`. Run with `npm run migrate --prefix server`.
- `server/src/routes/health.js` + `server/src/app.js` + `server/src/index.js` — Express app with
  `GET /api/health` (checks live DB connectivity) and JSON 404 fallback.
- Root `vite.config.js` — dev server now proxies `/api/*` to `http://localhost:4001`.
- Root `package.json` — `npm run dev` now runs client (Vite) and server (`node --watch`) together via
  `concurrently`; `dev:client` / `dev:server` remain available individually.
- `server/.env` (gitignored, not committed) holds the real RDS credentials. `server/.env.example`
  documents the required shape with no real values. `.gitignore` updated to exclude `server/.env` and
  `server/node_modules`.

### Key decisions
- **Database**: your existing AWS RDS MySQL instance (`lms-backend...`, db `lms_management`), reused
  with all new tables prefixed `Divalora_`. Confirmed with you before wiring in real credentials.
- **Migrations**: using `Product.sync({ alter: true })` rather than full `sequelize-cli` migration
  files — this is a single-table catalog right now, so a model-driven sync keeps things simple. If the
  schema grows complex enough to need versioned up/down migrations later, swap this out then.
- **Monorepo shape**: `server/` sits alongside the existing `src/` as a sibling, not nested inside it —
  the client's file layout is untouched.

### How to run / verify
```
npm install               # root — installs concurrently
npm install --prefix server
npm run migrate --prefix server   # creates/updates Divalora_products on the real RDS DB
npm run dev                       # runs client (http://localhost:5173) + server (http://localhost:4001) together
```
Verified: `GET http://localhost:5173/api/health` → `{"status":"ok","database":"lms_management"}`,
proxied through Vite to the Express server, which itself confirmed a live connection to the RDS
instance and created the `Divalora_products` table.

### Note on the icons in the current Navbar
`src/components/Navbar.jsx` still has Account/Bag icons from the original skeleton — these are
non-functional and out of scope (no accounts/cart in this build) and will be removed in Phase 1 rather
than left as dead UI.

### What's next
Phase 1: replace the gold/cream DIVELORA palette with a monochrome, Prada-inspired design system, and
rebuild the Navbar into a mega-menu + working search-only header.

---

## Phase 1 — Prada-Inspired Design System (2026-08-08)

### What was built
- **Monochrome token rewrite** (`src/index.css`): the entire gold/cream palette is now driven by the
  same CSS custom properties, redefined to black/white/ivory (`--gold` → `#000`, `--cream`/`--paper` →
  `#fff`, `--ink`/`--charcoal` → near-black, `--line` → a neutral hairline). Because every component
  already consumed these tokens instead of hardcoded colors, this one change cascaded the whole site to
  monochrome — `Hero.css`, `CollectionGrid.css`, `EditorialSplit.css`, `About.css` needed no edits.
- **Typography**: `--font-serif` now resolves to the same Jost sans stack as `--font-sans`, so every
  headline (and the logo wordmark) renders in tracked-out uppercase sans instead of a serif — closer to
  Prada's type language. Dropped the now-unused Cormorant Garamond Google Fonts import.
- **Logo** (`Logo.jsx`/`Logo.css`): removed the decorative floral flourish SVG; the wordmark is now a
  clean tracked "DIVELORA" with a single thin rule underneath.
- **Navbar** (`Navbar.jsx`/`Navbar.css`, new `SearchOverlay.jsx`/`.css`): rebuilt into a 3-link header
  (New Arrivals / Handbags / Maison) with a **mega-menu** flyout under "Handbags" listing all seven
  handbag categories, a **sticky header that hides on scroll-down and reappears on scroll-up**, and a
  **search-only icon** — the old non-functional Account/Bag icons were removed rather than left as dead
  UI. Search opens a full-screen overlay (autofocus input, Escape/backdrop-independent close button);
  the input is intentionally inert right now with a visible "coming soon" hint — it gets wired to
  `/api/search` in Phase 4, not before.
- **Footer**: fixed two hardcoded gold `rgba()` values (`footer__divider`, `footer__copy`) and the
  newsletter input's border color that weren't driven by tokens and would otherwise have stayed gold-tinted
  or gone invisible against the new dark background.
- **ImagePanel** tone gradients (`gold`/`charcoal`/`cream`/`ink`/`line`) rewritten from warm gold/cream
  hex values to grayscale, keeping the same tone prop names so no caller (`Hero`, `CollectionGrid`,
  `products.js`) needed changes.
- **Copy**: `Home.jsx` hero/category grid now leads with handbag categories (Totes, Shoulder Bags, Top
  Handle) instead of Women/Men/Bags; `About.jsx`'s intro paragraph dropped the "ready-to-wear ... for men
  and women" framing in favor of handbags/leather goods only.
- Nav links to `/women` and `/men` were removed from the header (unlinked, not deleted) — the route
  files and their apparel copy still exist for now and will be formally retired in Phase 3 when routing
  is restructured around `/handbags`.

### Key decisions
- **Minimal-diff palette swap**: rather than touching every component's CSS, redefined the existing
  design tokens in `:root` and let the cascade do the work — much lower risk than a file-by-file rewrite,
  and it surfaced the few spots (Footer, ImagePanel) using hardcoded colors instead of tokens.
- **All handbag category links currently point to `/bags-and-accessories`** (the only real handbags route
  that exists yet). This is why "New Arrivals" and "Handbags" both show as active on that page right now
  — expected, and resolves itself in Phase 3 once each category gets its own `/handbags/:category` route.
- **Search overlay is chrome-only this phase** — visually complete, functionally inert with an honest
  "coming soon" label, rather than either faking results or silently doing nothing.

### How to verify
```
npm run dev   # http://localhost:5173
```
Verified via a headless-Chromium pass (Playwright): homepage, mega-menu open state, search overlay open
state, About page, Bags & Accessories listing, and a 390px mobile viewport (including the mobile menu
drawer) all render with no layout overflow and no browser console errors.

### What's next
Phase 2: seed the real handbags catalog into `Divalora_products` and switch the frontend from
`src/data/products.js` to the live API.

---

## Phase 2 — Handbags Catalog Data Layer (2026-08-08)

### What was built
- **API routes**: `GET /api/products` (filter by `category`, `sort` = `newest`/`price_asc`/`price_desc`,
  paginated via `page`/`limit`), `GET /api/products/:idOrSlug` (matches by `slug` OR `style_code` —
  this is the "unique ID search shows the full product page" lookup), `GET /api/categories` (all seven
  categories with live counts). Added `server/src/utils/asyncHandler.js` + a global Express error
  handler so any thrown/rejected error in a route returns a clean 500 instead of crashing the process.
- **Seed data** (`server/src/seeders/products.data.js` + `seedProducts.js`): 23 handbags across all
  seven categories (Tote, Shoulder Bag, Top Handle, Crossbody, Mini Bag, Clutch, Travel) with real-feeling
  style codes, prices, materials, dimensions, descriptions and detail bullets. The seeder upserts on
  `style_code`, so it's safe to re-run. Run with `npm run seed --prefix server`.
- **Image convention documented and implemented**: `server/src/models/Product.js`'s `images` column
  holds filenames only (e.g. `["1.jpg", "2.jpg"]`); the frontend's new `productImageUrl()` helper
  (`src/lib/api.js`) resolves them against **`/public/products/<slug>/<filename>`**. Drop real
  photography there per product slug (e.g. `public/products/galleria-top-handle/1.jpg`) and it will
  slot in automatically once Phase 3 wires actual `<img>` rendering into the product grid/gallery —
  right now the listing still shows the `ImagePanel` placeholder graphic regardless, since the grid
  itself gets rebuilt in Phase 3.
- **Frontend API layer**: new `src/lib/api.js` (`getProducts`, `getProduct`, `getCategories`,
  `productImageUrl`) and `src/lib/format.js` (`formatPrice`, currency-aware).
- **`Bags.jsx` now fetches live data** from `GET /api/products` instead of the mock file, with
  loading and error states. `ProductGrid.jsx` was updated to consume the API's shape directly
  (formats `price`+`currency`, assigns placeholder tones round-robin since "tone" was never real
  product data, uses `isNew` to label the New Season tag).
- **Retired `src/data/products.js`** entirely, and deleted `src/pages/Women.jsx` / `Men.jsx` along
  with their `/women` `/men` routes in `App.jsx` — both were already unlinked from the nav since
  Phase 1, contradicted the handbags-only positioning, and were the only remaining consumers of the
  mock data file, so removing them was a prerequisite for actually retiring it cleanly. This is a small
  piece of Phase 3's planned route cleanup pulled forward out of necessity, not a scope change.

### Key decisions
- **23-item seed catalog**, evenly spread across categories, gives the listing/search/PDP phases enough
  real variety to build and test against without hand-waving placeholder counts.
- **Images are optional per product** — most seed items have `images: []` deliberately, to prove the
  "missing photo" fallback path stays graceful once Phase 3 builds real `<img>` rendering, rather than
  assuming every product will have a photo by then.

### How to verify
```
npm run migrate --prefix server   # if not already run
npm run seed --prefix server      # seeds/updates 23 products in Divalora_products
npm run dev                       # client :5173, server :4001
```
Verified: `curl /api/categories` returns all 7 categories with correct counts; `curl /api/products?category=Tote`
returns 3 items; `curl /api/products/galleria-top-handle` and `curl /api/products/1BA144-G8V6` both
resolve to the same product; unknown category → 400, unknown product → 404. Headless-browser pass:
`/bags-and-accessories` renders all 23 live products with correct names/prices, `/women` now correctly
falls through to the 404 page, zero console errors.

### What's next
Phase 3 (inserted after this phase — see roadmap note above): build an internal admin dashboard so the
catalog can be managed without editing code. Phase 4 (originally "Phase 3"): restructure routing around
`/handbags` and `/handbags/:category`, build the real product listing page (filters, sort, hover
image-swap, actual product photography rendering) and the product detail page (gallery, style code,
details accordion, related products), and rebuild the homepage on live featured-product data.

---

## Phase 3 — Admin Dashboard (2026-08-08)

Inserted after Phase 2 at your request — managing the catalog via a code-only seed script wasn't
sustainable day-to-day. See the roadmap note above: this pushed the originally-numbered Phases 3–6 to
4–7.

### What was built
- **`sortOrder` column** added to `Divalora_products` (integer, default 0) to support manual reordering
  in the admin table independent of creation order or price.
- **Admin API** (`server/src/routes/admin.js`, mounted at `/api/admin/*`):
  - `GET /admin/products` — full unfiltered list, ordered by `sortOrder` then `id`
  - `GET /admin/products/:id`, `POST /admin/products`, `PUT /admin/products/:id`
  - `PATCH /admin/products/:id/flags` — quick `isFeatured`/`isNew` toggles
  - `PATCH /admin/products/reorder` — bulk `sortOrder` update, body `{ order: [{id, sortOrder}] }`
  - `DELETE /admin/products/:id` — also removes the product's `/public/products/<slug>/` folder
  - `POST /admin/products/:id/images` (multipart, field `image`) — writes to
    `/public/products/<slug>/<n>.<ext>`, JPEG/PNG/WEBP only, 8MB limit, via `multer` (memory storage,
    file written manually so the destination can depend on the product's slug)
  - `DELETE /admin/products/:id/images/:filename` — removes the file and un-lists it
  - Create validates required fields and rejects duplicate `styleCode`/`slug` (409)
- **Admin frontend** at `/admin` (`src/admin/`): a deliberately plain, utilitarian UI — not the Prada
  design system — so it reads unmistakably as an internal tool, not a customer-facing page.
  - `/admin` — product table: thumbnail, name, style code, category, price, Featured/New toggle
    buttons, ↑/↓ reorder, Edit, Delete (with confirm)
  - `/admin/products/new` and `/admin/products/:id/edit` — shared form component; slug
    auto-suggests from the name (kebab-cased) until manually edited; Details field is one bullet per
    line, converted to/from the DB's JSON array so nobody has to hand-write JSON
  - Image management lives on the edit page: thumbnail grid with per-image remove, file input for
    upload, with the `/public/products/<slug>/` destination shown inline
- **Routing split**: `App.jsx` now branches on `/admin/*` vs everything else, into two separate layout
  trees (`src/admin/AdminApp.jsx` vs the new `src/StorefrontLayout.jsx`, which is the old `App.jsx`
  body moved as-is). This keeps the Navbar/mega-menu/Footer off admin pages entirely, and there's no
  link to `/admin` anywhere in the public nav.

### Key decisions
- **No authentication — explicit, informed tradeoff**, made to move faster during development.
  *(Resolved immediately after this phase — see "Admin Authentication" below.)*
- **Reorder via ↑/↓ buttons, not drag-and-drop.** Gets the same outcome (manual `sortOrder` control)
  without pulling in a drag-and-drop library for what is, so far, a ~23-row table.
- **Details textarea, not a JSON editor.** The DB column is a JSON array, but nobody should have to type
  JSON syntax to edit a bullet list — the form does the array↔newline conversion.

### How to verify
```
npm run migrate --prefix server   # adds sort_order column
npm run dev                       # client :5173, server :4001
```
Then open `http://localhost:5173/admin`. Verified via a full headless-browser pass (Playwright): loaded
the list (23 products), created a new product through the form, uploaded a real image file (confirmed
written to disk under `/public/products/<slug>/` and rendered as a thumbnail), toggled its Featured
flag, moved it up a row, then deleted it — confirmed both the DB row and its image folder were removed.
Zero console errors throughout. Also re-verified via `curl`: validation (400 on missing fields, 409 on
duplicate style code/slug), reorder endpoint, and non-image file upload correctly rejected (400).

### What's next
Admin authentication (below), then Phase 4: restructure routing around `/handbags` and
`/handbags/:category`, build the real product listing page and product detail page, and rebuild the
homepage on live featured-product data.

---

## Admin Authentication (2026-08-08)

Built immediately after Phase 3, at your request — closes the "no auth" gap called out above before
any further phases build on top of the admin dashboard.

### What was built
- **Login**: `POST /api/admin/login` (`server/src/routes/adminAuth.js`) checks username + password
  (bcrypt-compared) against `ADMIN_USERNAME`/`ADMIN_PASSWORD_HASH` in `server/.env`, then signs a JWT
  (`server/src/config/auth.js`: 24h expiry) and sets it as an **httpOnly, SameSite=Lax** cookie
  (`secure` flag auto-enables when `NODE_ENV=production`). httpOnly means client-side JS can never read
  or exfiltrate the token, even via an XSS bug.
- **`requireAdminAuth` middleware** (`server/src/middleware/requireAdminAuth.js`): verifies the cookie's
  JWT, returns 401 if missing/invalid/expired. Applied to the entire `adminRouter` mount in `app.js` —
  every `/api/admin/products*` route now requires a valid session. `POST /admin/login`,
  `POST /admin/logout`, and `GET /admin/me` live in a separate, unprotected router (`/me` guards itself).
- **Frontend**: `AdminApp.jsx` now calls `GET /admin/me` on mount and gates on the result — shows
  `AdminLoginPage.jsx` (new) if unauthenticated, the existing dashboard if authenticated. `AdminLayout.jsx`
  shows "Signed in as {username}" and a working Log out button. All `adminApi.js` requests now send
  `credentials: "include"` so the cookie goes along.
- **Credentials**: username `admin`, with a freshly generated random password (bcrypt hash, cost 12,
  stored in `server/.env`, never committed) — you have the plaintext from earlier in this conversation;
  it is not repeated here. **Also replaced** the old placeholder `JWT_SECRET=supersecretkey` with a
  cryptographically random 48-byte value, since the secret was now actually going to be relied on for
  real security rather than sitting unused.

### Key decisions
- **httpOnly cookie over a JS-readable token** (localStorage/Authorization header) — removes an entire
  class of XSS-token-theft risk for very little extra work.
- **Single hardcoded admin account via env vars, not a users table** — there's one operator, so a users
  table with its own CRUD would be pure overhead. Revisit if multi-user admin access is ever needed.
- **No 401-triggered auto-redirect mid-session yet.** If the 24h token expires while someone's actively
  editing, the next action will surface a generic error rather than bouncing them to the login screen
  automatically. Acceptable for an internal tool at this scale; worth revisiting if it's ever annoying
  in practice.

### How to verify
```
npm run dev   # client :5173, server :4001
```
Verified via `curl`: unauthenticated request to `/api/admin/products` → 401; wrong password → 401;
correct login → 200 + `Set-Cookie`; same cookie on `/api/admin/products` → 200; `/api/admin/me` → 200;
after `/api/admin/logout`, the same cookie → 401 again. Also verified via a full headless-browser pass:
visiting `/admin` while logged out shows the login form (not the product table); wrong password shows an
inline error; correct password logs in and shows all 23 products; a page reload stays logged in (cookie
persists); Log out returns to the login form; a reload after logout stays logged out. Zero unexpected
console errors (the 401s logged during the logged-out `/me` check are expected and handled).

### What's next
Phase 4: restructure routing around `/handbags` and `/handbags/:category`, build the real product
listing page (filters, sort, hover image-swap, actual product photography rendering) and the product
detail page (gallery, style code, details accordion, related products), and rebuild the homepage on
live featured-product data — now manageable through the now-secured `/admin` instead of a seed script.

---

## Phase 4 — Storefront Core Pages (PLP + PDP) (2026-08-08)

### What was built
- **Routing restructure** (`src/StorefrontLayout.jsx`): `/handbags` (all products), `/handbags/:categorySlug`
  (one of the 7 categories), `/product/:slug` (PDP). `/bags-and-accessories` is gone — no redirect was
  added since the site has had no public users yet.
- **Category slug mapping** (`src/lib/categories.js`): single source of truth translating URL slugs
  (`totes`, `shoulder-bags`, ...) to the DB's category strings (`Tote`, `Shoulder Bag`, ...). Used by the
  PLP, the PDP breadcrumb, and the Navbar mega-menu so they can't drift out of sync.
- **`ProductCard`** (`src/components/ProductCard.jsx`, extracted from `ProductGrid`): renders the real
  photo when one loads, a second image on hover if present (pure CSS opacity crossfade, no JS), and now
  **actually falls back to the `ImagePanel` placeholder on image load failure** via `onError` — this was
  the missing piece from Phase 2's "graceful fallback" promise. Found and fixed during this phase's own
  verification: several seed products have image *filenames* on record with no real file behind them
  yet, which was rendering as a broken-image icon instead of the intended placeholder.
- **PLP** (`src/pages/Handbags.jsx`): category tabs (incl. "All"), a sort dropdown (Newest / Price
  asc / desc) reflected in the URL as `?sort=`, and `?new=true` for a dedicated New Arrivals view — all
  shareable/bookmarkable URLs, no client-only state. Unknown category slugs render the real `NotFound`
  page rather than silently showing nothing.
- **PDP** (`src/pages/ProductDetail.jsx`): breadcrumb (Home / Handbags / Category / Product), image
  gallery with a thumbnail rail (only for images that actually loaded — same `onError` tracking pattern
  as `ProductCard`, applied per-thumbnail), price, style code, colorway, and an `Accordion` (new,
  `src/components/Accordion.jsx`) for Details / Composition & Care / Dimensions. A "You May Also Like"
  row fetches up to 4 other products in the same category via the new `excludeSlug` API param. A missing
  product slug renders the real 404 page (verified via the API error now carrying `.status`, not just a
  message — `src/lib/api.js`).
- **Homepage** (`src/pages/Home.jsx`): new "Featured This Season" section pulling live
  `isFeatured` products (curated via `/admin`'s Featured toggle and sort order), replacing what was
  static category-only content. Category tiles now link to real `/handbags/:category` routes.
- **API additions** (`server/src/routes/products.js`): `GET /api/products` now accepts `featured=true`,
  `isNew=true`, and `excludeSlug=`; added a `curated` sort (by the admin-managed `sortOrder`).
- **Navbar**: mega-menu category links and "New Arrivals" now point at real routes instead of all
  funneling to one hub page.

### Key decisions
- **No redirect from the old `/bags-and-accessories`.** The site has never been public, so there are no
  external links or bookmarks pointing at it to preserve.
- **Image failure is handled with `onError`, not by trusting the DB's `images` array.** A filename being
  on record is not proof the file exists on disk — the fallback has to be render-time, not just
  "images.length === 0", or partially-seeded/partially-uploaded products break.

### How to verify
```
npm run dev   # client :5173, server :4001
```
Verified via a full headless-browser pass: homepage featured section (4 live products); `/handbags` (23
products); clicking the "Totes" tab correctly filters to 3 and updates the URL; sort-by-price-desc
re-orders results; clicking a card opens its PDP with the right title; the accordion opens/closes;
related products show (2, correctly excluding the current product from its own 3-item category); a
made-up product slug and a made-up category slug both render the real NotFound page; the "New Arrivals"
nav link lands on `/handbags?new=true` with the right heading. Zero unexpected console errors (only the
two expected 404s from the intentional bad-slug/bad-category checks).

### What's next
Phase 5: full-screen search overlay wired to a real `/api/search` endpoint (autofocus, debounced live
results, exact style-code match jumps straight to its PDP), plus a `/search?q=` results page reusing the
PLP grid.

---

## Phase 5 — Search Experience (2026-08-08)

### What was built
- **`GET /api/search?q=&limit=`** (`server/src/routes/search.js`, public, unauthenticated): substring
  match (case-insensitive `LIKE`) across name, style code, category, and colorway. Queries under 2
  characters return an empty result set rather than the whole catalog.
- **Live search overlay** (`src/components/SearchOverlay.jsx`, fully rewritten — Phase 1 shipped this as
  inert chrome with a "coming soon" label, which is now gone): typing debounces 250ms then calls
  `/api/search` (capped at 6 results for the dropdown), showing a thumbnail/name/style-code/price row per
  match, with loading and "no results for..." states.
- **Exact style-code / slug jump**: pressing Enter first tries `getProduct(query)` — the same
  slug-or-style-code lookup the PDP itself uses — and if it resolves, navigates straight to that
  product's page. Only falls through to the `/search?q=` results page if that exact lookup 404s. This is
  the behavior the very first request in this project asked for: "some products will have unique ids
  when searched through search bar... all the details and page would appear."
- **`/search?q=` results page** (`src/pages/Search.jsx`): reuses `ProductGrid` and `CategoryIntro`
  exactly as the PLP does, so results look identical to browsing a category. Handles empty query,
  loading, and no-results states.
- **`src/lib/api.js`**: added `search(q, limit)`.

### Key decisions
- **Exact-match-first via the existing PDP lookup, not a special search flag.** `/api/products/:idOrSlug`
  already matches by slug or style code — reusing it for the "jump straight to PDP" behavior means there's
  one lookup rule to keep correct, not two.
- **Debounce in the component, not a shared hook.** One overlay, one call site — a reusable
  `useDebouncedValue` hook would be premature abstraction for a single usage.

### How to verify
```
npm run dev   # client :5173, server :4001
```
Verified via a full headless-browser pass: typing "tote" in the overlay returns 3 live results; clicking
one navigates to its PDP and closes the overlay; a nonsense query shows the no-results state; submitting
an exact style code (`1BA144-G8V6`) via Enter jumps straight to `/product/galleria-top-handle`;
submitting a partial word ("leather") via Enter lands on `/search?q=leather` showing 5 matches across
categories; Escape closes the overlay. No unexpected console errors (the one 404 logged is the expected,
handled outcome of the exact-match attempt for "leather" before it falls back to the results page).

### What's next
Phase 6: mobile polish (mega-menu drawer already exists from Phase 1, revisit mobile search/PDP gallery),
micro-interactions, accessibility pass (focus management in the search overlay and mega-menu, aria
labels, keyboard nav), per-page SEO meta/OG tags + sitemap, image lazy-loading and route-level code
splitting.

---

## Phase 6 — Polish, Responsiveness, Performance, SEO (2026-08-09)

### What was built

**SEO**
- `Seo` component (`src/components/Seo.jsx`) using **React 19's native support for hoisting
  `<title>`/`<meta>` rendered anywhere in the tree into `<head>`** — no head-management library needed.
  Wired into every page: dynamic titles, descriptions, Open Graph tags, and a product-specific `og:image`
  on the PDP. Search and NotFound pages set `noindex` deliberately (see below).
- **Server-generated `/sitemap.xml` and `/robots.txt`** (`server/src/routes/sitemap.js`, mounted under
  `/api` and rewritten to clean paths via the Vite proxy in both dev and preview) — the sitemap enumerates
  every static route, all 7 categories, and every live product slug straight from the DB, so it never
  drifts from the real catalog. Both use a new `SITE_URL` env var for absolute URLs rather than trusting
  `req.protocol`/`req.get('host')`, which would resolve to the API's own internal host once client and
  server are deployed separately (see Key Decisions).
- **Fixed a systemic heading-hierarchy bug**: `CategoryIntro` and the About page's intro block both
  hardcoded `<h1>`, duplicating the real page `<h1>` from `Hero` and causing product-card `<h3>`s to skip
  a level. `CategoryIntro` now takes a `level` prop (1 when there's no Hero above it, e.g. Search; 2
  otherwise) and About's intro is now `<h2>`. Verified with a full heading-tag audit across every page —
  all now run cleanly h1 → h2 → h3 → h4 with no skips or duplicates.

**Accessibility**
- **Mega-menu is keyboard-operable**: focusing "Handbags" opens the flyout (not just `:hover`), Escape
  closes it and returns focus to the trigger, `aria-haspopup`/`aria-expanded` reflect state.
- **Search overlay has a real focus trap**: Tab cycles within the dialog instead of escaping into the page
  behind it, and closing (via Escape, a result click, or submit) returns focus to whatever triggered it.
- **Skip-to-content link** (visually hidden until focused) as the first focusable element on every
  storefront page.
- Fixed a genuine WCAG 2.5.3 (Label in Name) violation on the footer's social icons — `aria-label`
  ("Instagram") didn't contain the visible text ("IG"), which mismatches what a sighted user reads
  against what a screen reader announces. Replaced with visible text + an `.sr-only` expansion instead of
  an unrelated `aria-label`.
- `prefers-reduced-motion` respected for the new page-transition animation (below).

**Mobile / responsiveness**
- PDP gallery is now swipeable on touch devices (native `touchstart`/`touchend`, no library).
- Admin product table scrolls horizontally within its own container on narrow screens instead of
  breaking the page layout; admin form grid collapses to one column below 720px.

**Performance**
- **Route-level code splitting** via `React.lazy`/`Suspense`: the admin app and the storefront are
  separate bundles (customers never download admin JS/CSS and vice versa), and every storefront page is
  its own chunk. Confirmed in the build output — e.g. `ProductDetail` (4KB), `AdminApp` (12.7KB), and a
  shared `index` vendor chunk are all loaded independently.
- `loading="lazy"` on below-the-fold product images (grid hover images, PDP thumbnails, search result
  thumbnails); the PDP's main image and the first 4 grid images stay eager since they're likely
  above-the-fold / LCP candidates.
- Google Fonts CSS switched from a render-blocking `<link rel="stylesheet">` to the standard
  preload-then-swap pattern (`media="print" onload="this.media='all'"` + `<noscript>` fallback).
- Added `compression` middleware to the Express API — JSON responses (e.g. `/api/products`) are now
  gzipped; this was a real gap, not just a preview-server artifact (verified via `curl -H
  "Accept-Encoding: gzip"` before/after).
- **Fixed a real, severe layout-shift bug** (see Key Decisions) by building proper loading skeletons for
  the PDP and Search pages that mirror the final layout's shape, instead of a bare "Loading…" line.
- Subtle route-transition fade-in (`.page-fade-in`, keyed on `location.pathname` in
  `StorefrontLayout.jsx`) as the one micro-interaction added this phase — kept deliberately minimal.

### Key decisions
- **The sitemap/robots.txt bug was worth stopping for.** Initially built using
  `req.protocol`/`req.get('host')`, which resolved to the *API's* own host (`localhost:4001`) rather than
  the public site (`localhost:5173`) — correct-looking code that would have silently shipped a broken
  sitemap once client and server are on separate production hosts, exactly the architecture this project
  is heading toward in Phase 7. Fixed with an explicit `SITE_URL` config value instead of trusting the
  request.
- **The CLS bug was the most significant finding this phase.** A Lighthouse audit on the PDP first came
  back with **performance 73 and a raw CLS of 0.69** (the "poor" threshold is 0.25) — caused by the page
  going straight from a one-line "Loading…" paragraph to the entire populated layout (gallery + info +
  related products) in one jump, shoving the footer down by roughly a full viewport height. A first
  attempt at only reserving space for the async-loaded "You May Also Like" section had **zero effect**
  (identical CLS down to the decimal) because on a fast local API both fetches resolve close enough
  together that the intermediate state is never painted — the real fix had to mirror the *entire* final
  layout's shape from the very first render, not patch the second data fetch. After building a proper
  skeleton, performance went to 94-97 and CLS dropped out of the failing-audits list entirely. Applied the
  same pattern to Search once the same root cause was confirmed there too (CLS 0.21 → gone, performance
  75 → 95).
- **`noindex` on Search intentionally tanks that page's Lighthouse SEO score (63) — this is correct, not
  a bug.** Search-results pages are classic thin/duplicate content and shouldn't be indexed; Lighthouse's
  generic `is-crawlable` audit doesn't know that context. Every other page scores SEO 100.
- **Lighthouse chrome-launcher's temp-directory cleanup errors on Windows** (`EPERM` on `rmSync`) after
  every run in this environment — cosmetic only, the JSON report is written successfully before the
  cleanup step fails. Worth knowing if this is re-run rather than treating it as a failed audit.

### How to verify
```
npm run build && npm run preview   # client :4173 (proxies /api, /sitemap.xml, /robots.txt to :4001)
npm run dev --prefix server        # or the combined `npm run dev` for iterative work
```
Final Lighthouse scores (production build, mobile emulation) across all main pages:

| Page | Performance | Accessibility | Best Practices | SEO |
|---|---|---|---|---|
| Home | 97 | 100 | 100 | 100 |
| Handbags (PLP) | 94–95 | 100 | 100 | 100 |
| Product Detail | 94 | 100 | 100 | 100 |
| About | 95 | 100 | 100 | 100 |
| Search | 95 | 100 | 100 | 63 (intentional `noindex`) |

Also verified via headless-browser pass: skip-link is the first Tab stop; mega-menu opens on keyboard
focus and Escape closes it + returns focus; search overlay traps Tab and returns focus to the search
button on close; heading tags run h1→h2→h3→h4 with no skips on every page; mobile viewport (390px) has no
horizontal page overflow anywhere, including the admin table. Zero unexpected console errors throughout.

### What's next
Phase 7: production build/env config for client and server, CORS lockdown, secrets-handling review, and
hosting recommendations. Admin authentication is already in place (see the "Admin Authentication" entry
above), so Phase 7 is deployment mechanics rather than a security gate.

---

## Logo Typography (2026-08-09)

Small design change outside the phase structure, at your request. Real product photography and a logo
image file weren't available to drop in, so this addresses the "make it look real" ask through
typography instead of assets.

### What was built
- Added **Bodoni Moda** (a high-contrast Didone serif — the kind of typeface real fashion houses use for
  logotypes, e.g. Vogue-adjacent editorial branding) as a new `--font-logo` token, used only by
  `Logo.jsx`/`Logo.css`. Body copy, nav, and headings are untouched — still the clean Jost sans from
  Phase 1, so the logotype now reads as a deliberate, designed brand mark instead of just larger nav text.
- Retuned `Logo.css` sizing/letter-spacing for the new font: serif Didones carry their own visual weight
  and don't need the extreme tracking (`0.3em`+) the sans version required to look intentional — reduced
  to `~0.1–0.14em` and bumped font size slightly to compensate for a serif's lighter apparent weight at
  the same size.
- Loaded via the same preload-then-swap pattern from Phase 6 (`index.html`), so this doesn't reintroduce
  a render-blocking font request.

### Key decision
- **Product photography is still outstanding** — you confirmed no image files are ready yet. The
  `/public/products/<slug>/` convention and graceful placeholder fallback from Phases 2–4 are unchanged
  and ready to receive real photos whenever they're supplied; nothing else needs to change on the code
  side when that happens.
  *(Outdated within hours — see "Real Product Photography" below, which supersedes this. The photos
  existed the whole time in a differently-named folder that earlier searches missed.)*

### How to verify
`npm run dev`, check the wordmark in the navbar (white background) and footer (black background) — both
render the serif "DIVELORA" cleanly at full contrast. Verified at desktop (1440px) and mobile (390px)
widths via headless browser.

---

## Real Product Photography (2026-08-09)

Supersedes the "no image files ready yet" note above — you'd actually dropped 8 real product photos into
a `Products/` folder at the project root (not `public/products/`, which is why earlier searches missed
it) plus a `logo.jpeg` brand mockup. This entry covers the 8 product photos; the logo image has a
non-transparent cream background that would need cropping/editing to use directly as the nav/footer
mark, so it wasn't wired in — the Bodoni Moda typographic logo from the previous entry stands for now.

### What was built
- **`server/src/scripts/assignProductImages.js`** (new, one-off maintenance script): copies each source
  photo into `/public/products/<slug>/1.jpg` **and** updates that product's `images` field in the
  database — both steps matter, since `productImageUrl()` (`src/lib/api.js`) resolves from the DB field,
  not by scanning disk. A file sitting in the folder with no matching DB entry would never render.
- Manually matched each of the 8 photos to the best-fitting real product by category and appearance
  (not arbitrary — e.g. the cream floral bag went to the "Soft Nappa Shopping Tote" whose seed colorway
  was already "Talco"/cream; the dark structured top-handle with gold hardware went to "Galleria
  Top-Handle," the flagship icon product). Where a photo's actual color/material clearly didn't match
  the seed data (e.g. a product seeded as "Avorio" ivory that was about to get a brown python-embossed
  photo), corrected the `colorway`/`material` fields too, so the text and the photo agree:

  | Product | Photo | Fields corrected |
  |---|---|---|
  | Soft Nappa Shopping Tote | cream floral tote | — |
  | Structured Box Top-Handle | brown/gold python top-handle | colorway → Cognac, material → python-embossed |
  | Mini Top-Handle | black/gold zebra top-handle | material → zebra-embossed |
  | Galleria Top-Handle | dark brown smooth leather, gold clasp | — |
  | Structured Saffiano Tote | mint floral structured tote | colorway → Mint / Nero |
  | Pebbled Leather Hobo | black crocodile-embossed hobo | colorway → Nero, material → crocodile-embossed |
  | Canvas & Leather Tote | hand-painted floral canvas tote | colorway → Multicolor |
  | Leather Wristlet Pouch | green crocodile-embossed pouch | colorway → Verde, material → crocodile-embossed |

- **Cleaned up 3 products that still carried placeholder image filenames from early Phase 2 seed data**
  that never had real files behind them (`quilted-nappa-shoulder-bag`, `saffiano-crossbody`,
  `chain-mini-bag`) — cleared their `images` array to `[]` now that this was a real content pass, so the
  DB stops claiming photos exist that don't. They fall back to the placeholder graphic like every other
  un-photographed product, same as before.

### Key decisions
- **Went through the same DB-driven `images` field the admin dashboard already uses, not a filesystem
  hack.** Running this as a Sequelize script (same pattern as `seedProducts.js`) rather than an
  authenticated multipart upload against the admin API was a pragmatic choice for a one-off bulk
  assignment — the *effect* is identical to uploading through `/admin`, just faster for 8 files at once.
- **8 photos, 23 products.** No attempt to stretch the photography further than it honestly covers —
  the other 15 products still show the placeholder graphic, which was always designed to look
  intentional rather than broken (see Phase 2/4). Totes, Top Handle, and one Shoulder Bag and one Clutch
  now have real photography; Crossbody, Mini Bag, and Travel categories are still fully placeholder.

### How to verify
```
npm run dev
```
Verified via headless browser: homepage's "Featured This Season" now shows 3 real photos among 4; the
full `/handbags` grid shows 8 real photos mixed with 15 placeholders; the Galleria Top-Handle PDP shows
its real hero photo plus two real "You May Also Like" photos (both other Top Handle products also have
real photography). Zero console errors.

---

## Favicon (2026-08-09)

### What was built
- Cropped the decorative flourish/monogram from `logo.jpeg` (the gold-foil brand mockup found alongside
  the product photos) into a standalone square mark, using `sharp` to extract and resize it to
  `favicon-32.png` and an `favicon-180.png` apple-touch-icon. The full wordmark wasn't usable as-is — a
  wide horizontal logotype reads as noise at 16–32px — but the compact scroll/knot emblem beneath it
  works well as a square icon on its own, at any size.
- Replaced the old generic `favicon.svg` (from the original Phase 0 template) in `index.html` with the
  two new PNGs; deleted the unused SVG and an unreferenced 512px variant generated along the way.

### Key decision
- **Cream background kept, not removed.** Unlike the navbar/footer logo (which sits on white or black
  and needed transparency), a favicon is expected to have a background — browser tabs render it as a
  small solid square regardless. The logo's cream paper tone reads fine here and didn't need editing.

### How to verify
`npm run dev`, check the browser tab icon, or `curl -o /dev/null -w "%{http_code}" http://localhost:5173/favicon-32.png` → 200.

---

## Banner Management System (2026-08-09)

Every Hero section (Home, Handbags listing, About) was hardcoded in each page's source since Phase 1.
This moves them into the database, manageable through `/admin`, with support for **image or video**
backgrounds and a **rotating carousel** when a placement has more than one active banner — the three
scope decisions (all 3 placements, carousel not single-banner, full text+media control) were confirmed
with you before building, since each meaningfully changes the amount of work involved.

### What was built
- **`Banner` model** (`server/src/models/Banner.js` → `Divalora_banners`): `placement` (`home` /
  `handbags` / `about`), `mediaType` (`image` / `video`), `mediaFilename`, `posterFilename` (video poster
  frame), `eyebrow`/`title`/`subtitle`/`ctaLabel`/`ctaTo` (the full text content, not just media),
  `tone` (reuses Hero's existing light/dark text-color system), `isActive`, `sortOrder`.
- **Admin API** (`server/src/routes/adminBanners.js`, protected): full CRUD, `PATCH .../flags` for the
  Active toggle, `PATCH .../reorder` (scoped per-placement in the UI, though the endpoint itself is
  agnostic), media upload/delete, and a separate poster upload endpoint for video banners.
- **Video upload support**: `uploadBanner` multer instance (`server/src/middleware/upload.js`) accepts
  JPEG/PNG/WEBP *or* MP4/WEBM, 30MB limit (vs 8MB/image-only for product photos) — a deliberately
  separate instance from the existing product-image `upload`, so product uploads keep their tighter
  limit and format restriction.
- **Public API**: `GET /api/banners?placement=` returns only active banners for that placement, ordered
  by `sortOrder`. No auth — same as products/categories/search.
- **Default banners seeded** (`server/src/seeders/seedBanners.js`, `npm run seed:banners --prefix
  server`): one banner per placement using the *exact* copy that used to be hardcoded in
  Home/Handbags/About, no media attached — so migrating to this system didn't change what visitors see
  at all until banners are actually edited.
- **`Hero.jsx` extended**, not replaced: new `mediaUrl`/`mediaType`/`posterUrl` props render a real
  `<img>` or `<video autoPlay muted loop playsInline>` full-bleed background in place of the CSS gradient
  `ImagePanel`, with the same `onError`-triggered graceful fallback pattern used for product photos since
  Phase 4 — a banner with a broken/missing media file quietly falls back to the placeholder gradient
  instead of showing a broken image/video.
- **New `BannerCarousel.jsx`** (`src/components/BannerCarousel.jsx`) wraps `Hero`: fetches banners for a
  placement, and:
  - **0 banners** (or still loading) → renders the page's hardcoded `fallback` prop, so a hero is never
    blank and never causes layout shift (Hero's height is fixed regardless of content, so swapping
    fallback → real banner on load doesn't repeat Phase 6's CLS mistake)
  - **1 banner** → renders it directly, no carousel chrome
  - **2+ banners** → full carousel: autoplay every 6s (pauses on hover, resumes on mouse-leave, respects
    `prefers-reduced-motion` by disabling the timer while keeping manual controls), prev/next arrows,
    dot indicators, swipe on touch, and left/right arrow-key navigation when focused
  - Each slide is `<Hero key={banner.id} .../>` — the `key` forces a clean remount per slide, which
    matters for video banners specifically (the previous slide's video actually stops rather than
    continuing to play off-screen)
- **Admin UI**: new "Banners" tab in `AdminLayout`'s nav (added actual navigation between admin sections
  for the first time — previously only Products existed). `AdminBannerList.jsx` groups banners by
  placement (three sections, each with its own +New / reorder / Edit / Delete, matching how the carousel
  actually works per-placement) rather than one flat table. `AdminBannerForm.jsx` handles text fields,
  media upload with inline preview (video preview uses native `<video controls>`), a separate poster
  upload that only appears once a video is attached, and media removal.
- **Home/Handbags/About** now render `<BannerCarousel placement="..." fallback={{...}} />` instead of
  `<Hero .../>` directly, with `fallback` set to the exact props each page used to hardcode.

### Key decisions
- **Fallback-first loading, not a loading skeleton.** Unlike the PDP/Search CLS fix in Phase 6 (which
  needed a real skeleton because those pages' *layout* changed shape between loading and loaded), Hero's
  height is fixed by CSS regardless of content — so simply rendering the `fallback` Hero synchronously
  while banners load, then swapping to real data once fetched, causes zero layout shift. No skeleton
  needed here.
- **Video decode failure was validated, not just theorized.** Testing used a minimal real MP4 that,
  it turned out, Chromium's headless decoder rejected — the `onError` handler caught it and fell back to
  the placeholder gradient exactly as designed, with the correct tone, no visual glitch, no console
  crash. This is the same defensive pattern proven for product photos in Phase 4, now confirmed to hold
  for video too. (A proper video encoder wasn't available in this environment to produce a guaranteed-
  decodable test file — the upload/storage/type-detection pipeline is fully verified; actual smooth
  autoplay playback should be spot-checked once a real, properly-encoded video is uploaded.)
- **Found and fixed a real mobile bug during verification**: the carousel's prev/next arrows were
  vertically centered on the whole hero, which collided with the title/subtitle text on narrow screens
  once a real subtitle was present. Fixed by moving arrows to the bottom corner band alongside the dots
  on mobile — clear of the text regardless of how many lines it wraps to, rather than depending on
  guessing safe padding values.
- **Reorder and grouping are per-placement in the UI, global in the API.** The `/reorder` endpoint just
  applies whatever `sortOrder` values it's given — it doesn't know or care about placement — because the
  admin list only ever sends reorder requests scoped to one placement's banners at a time. Simpler than
  teaching the endpoint about grouping it doesn't otherwise need to know about.

### How to verify
```
npm run migrate --prefix server       # creates Divalora_banners
npm run seed:banners --prefix server  # seeds 1 default banner per placement (safe to re-run, skips existing)
npm run dev
```
Verified via a full headless-browser pass: all three pages render their seeded default banner with the
exact original copy (zero visual change from before this feature existed); admin login → Banners tab →
grouped by placement correctly; created a second Home banner, uploaded a real video file to it — admin
preview correctly showed a `<video>` element with controls; uploaded a poster image; on the storefront,
the Home hero correctly became a 2-dot carousel with working prev/next arrows, working left/right
keyboard navigation, and working touch swipe (tested via dispatched touch events at a 390px viewport);
the video failed to decode and gracefully fell back to the correct-toned placeholder rather than
breaking; deleting the test banner cascaded to remove its uploaded files with nothing orphaned on disk.
Fixed the mobile arrow/text collision bug found during this pass. Zero unexpected console errors
throughout.

### What's next
Phase 7: production build/env config for client and server, CORS lockdown, secrets-handling review, and
hosting recommendations.
