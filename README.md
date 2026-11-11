# ORIIKO (`oriiko_web`)

Storefront web application for **ORIIKO**, an India-focused contemporary streetwear label specializing in heavyweight hoodies (`480 GSM`), chain-stitch embroidered oversized t-shirts (`280 GSM`), crewneck sweatshirts, wide-leg bottoms, and accessories.

Designed for the Indian market (`INR ₹`) around a strict four-colour palette and soft, rounded editorial UI geometry.

---

## Brand & Visual System

- **Target Market:** India only (`INR ₹`, `en-IN` number formatting, pan-India delivery, UPI / Card / Netbanking / Cash on Delivery).
- **Shipping & Promotions:**
  - Free pan-India express shipping on orders above `₹2,999` (`₹149` standard shipping below threshold).
  - Active storefront promo code: `ORIIKO10` (`10%` bag discount).
- **Strict Colour Palette:**
  - `#591623` — Deep Burgundy (primary actions, headers, contrast surfaces)
  - `#8C072B` — Rich Burgundy (accents, active badges, highlights)
  - `#F2F2F0` — Off-White (primary viewport & card surfaces)
  - `#26231F` — Dark Brown-Charcoal (primary typography & dark editorial sections)
- **Typography & Geometry:** Cormorant Garamond / Didot serif display headings paired with Inter UI copy and Futura wordmark lockups, wrapped in rounded containers (`rounded-lg`, `rounded-xl`, `rounded-2xl`, and `rounded-full` pills).

---

## Tech Stack & Infrastructure

| Layer | Technology / Version | Notes |
| --- | --- | --- |
| Framework | Next.js `16.4.4` (App Router) | `React 19.3.0`, TypeScript `^5` |
| Styling | Tailwind CSS `^4` (`@tailwindcss/turbopack`) | `next dev` uses Turbopack rules in `next.config.ts`; production build uses `next build --webpack` |
| Database | Supabase PostgreSQL | `@supabase/supabase-js ^2.119.0`, `@supabase/ssr ^0.12.7` |
| Auth & Sessions | Custom Postgres RPC + Signed HTTP-only Cookie | Cookie name `oriiko_session`, `HMAC-SHA256` signed + `SHA-256` hashed session token |
| Media Config | `next.config.ts` | Remote image allowlist configured for `images.unsplash.com` |
| Build Patch | `scripts/patch-magic-string.js` (`postinstall`) | Transpiles/exposes CJS entry for `magic-string` compatibility |

---

## Environment Variables

Create `.env.local` at the repository root with the following keys:

```env
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-project-url>
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<your-supabase-publishable-key>
AUTH_SESSION_SECRET=<random-hmac-signing-secret>
# Optional server override for privileged operations:
# SUPABASE_SERVICE_ROLE_KEY=<your-supabase-service-role-key>
```

> If `AUTH_SESSION_SECRET` is omitted locally, `lib/auth/session.ts` falls back to `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Set an explicit random `AUTH_SESSION_SECRET` in production.

---

## Application Routes

### Storefront & Catalog

| Route | Type | Purpose |
| --- | --- | --- |
| `/` | Static (`app/page.tsx`) | Editorial landing page (hero slider, offers, collections, size helper, lookbook, fit bundle, marquee, reviews) |
| `/shop` | Static (`app/shop/page.tsx`) | Filterable catalog (`hoodies`, `t-shirts`, `sweatshirts`, `bottoms`, `accessories`), size pills, colour matching, `₹1,000–₹5,000` price slider, sorting |
| `/product/[slug]` | Dynamic (`app/product/[slug]/page.tsx`) | Product gallery, variant selector, quantity controls, fabric/embroidery/care/shipping accordions, related fits |

### Authentication & Member Account

| Route | Type | Purpose |
| --- | --- | --- |
| `/signin` | Static (`app/signin/page.tsx`) | Dedicated email + passcode sign-in page using `AuthShell` |
| `/signup` | Static (`app/signup/page.tsx`) | Dedicated registration page using `AuthShell` |
| `/account` | Static (`app/account/page.tsx`) | Authenticated member view with role badge, benefits summary, and sign-out action |
| `/auth` | Static (`app/auth/page.tsx`) | Redirects to `/account` if signed in, or `/signin` / `/signup` based on `?mode=` |
| `/auth/callback` | Dynamic (`app/auth/callback/route.ts`) | Reserved OAuth callback handler placeholder (future Google Sign-In integration) |

### Customer Policy Pages

Powered by the shared layout [`components/legal/PolicyPageShell.tsx`](components/legal/PolicyPageShell.tsx) and linked in [`Footer.tsx`](components/footer/Footer.tsx):

| Route | Purpose |
| --- | --- |
| `/refunds-and-cancellations` | Pre-dispatch cancellations, 14-day reverse pickup exchanges, defective item replacements, UPI/COD refund timelines |
| `/shipping-policy` | Pan-India coverage (`19,000+` pin codes), `₹2,999` free shipping threshold, `24–48h` dispatch, transit estimates |
| `/privacy-policy` | Data collected, `oriiko_session` cookie usage, gateway payment privacy, DPDP-aligned deletion requests |
| `/terms-and-conditions` | India storefront terms, INR GST-inclusive pricing, stock/colour variance, IP, Indian governing law |

### Auth API Endpoints

| Endpoint | Method | Backing RPC / Behaviour |
| --- | --- | --- |
| `/api/auth/signup` | `POST` | Validates payload, creates token pair (`createSessionTokens`), calls `register_user`, sets `oriiko_session` cookie |
| `/api/auth/signin` | `POST` | Validates credentials via `login_user` RPC, rotates `oriiko_session` cookie |
| `/api/auth/signout` | `POST` | Hashes token, calls `revoke_session` RPC, clears `oriiko_session` cookie |
| `/api/auth/me` | `GET` | Verifies signed cookie via `getCurrentUser()` and calls `get_user_by_session` RPC |

---

## Core Implementations

### 1. Custom Postgres-Backed Authentication (`lib/auth/session.ts` & `context/AuthContext.tsx`)

Authentication intentionally avoids Supabase GoTrue (`supabase.auth`) and uses direct Postgres RPCs via `@supabase/supabase-js`:

1. `createSessionTokens()` generates 32 random bytes (`rawToken`), computes its `SHA-256` hash (`tokenHash`) for database storage, and signs `rawToken` with `HMAC-SHA256` (`signedCookie`).
2. `setSessionCookie()` stores `signedCookie` in an HTTP-only, `SameSite=Lax` cookie (`oriiko_session`, 30-day TTL, `Secure` in production).
3. Server verification (`verifySignedCookie()` + `getCurrentUser()`) checks the HMAC signature with `crypto.timingSafeEqual` before hashing the token and querying `get_user_by_session(p_token_hash)`.
4. `AuthProvider` (`context/AuthContext.tsx`) syncs auth state on mount from `/api/auth/me` with `cache: "no-store"` and exposes `signIn`, `signUp`, `signOut`, and `refreshProfile`.
5. `middleware.ts` exposes a request matcher excluding static assets (`_next/static`, `_next/image`, icons/images) ready for future route-protection rules.

### 2. E-Commerce Store State (`context/StoreContext.tsx` & `data/products.ts`)

- `StoreProvider` manages shopping bag items, quantities, currency formatting (`INR` via `Intl.NumberFormat("en-IN")`), `freeShippingThreshold` (`2999`), `freeShippingProgress`, search query, toast state, and global drawers/modals (`isCartOpen`, `isSearchOpen`, `isNavOpen`, `quickViewProduct`).
- Static catalog data in `data/products.ts` exports 8 SKUs (`ork-01` through `ork-08`), verified Indian customer `REVIEWS`, and brand craft `STORY_SLIDES`, typed strictly by `types/ecommerce.ts`.

### 3. Landing Page Architecture (`app/page.tsx` & `components/home/*`)

Organized as 14 editorial streetwear sections:

1. `HeroCollection` — Full-width rounded 2-slide hero slider (`Heavyweight Hoodies` / `Embroidered Tees & Crewnecks`).
2. `DropOffersSection` — Twin rounded cards for Drop 01 offers (`ORIIKO10`, free shipping > ₹2,999, UPI/COD) and Drop 02 early access.
3. `PromotionalCampaigns` — 2-column padded editorial category cards.
4. `BestsellingProducts` — Centered `Most Popular` 4-card grid.
5. `BrandMission` — Dark `#26231F` rounded brand statement banner.
6. `ProductQualityShowcase` — Deep `#591623` container with 3 numbered pillar cards (`1/3`, `2/3`, `3/3`).
7. `FeaturedProductPromotion` — Drop 01 spotlight featuring gallery thumbnails, variant selector pills, and an interactive collapsible **Find My Size** helper (height + drape preference).
8. `ShopTheLook` — Interactive hotspot lookbook image paired with instant add-to-bag card.
9. `DeliveryMarquee` — Continuous `#8C072B` pan-India shipping & fabric marquee.
10. `EditorialCollectionIntro` — 50/50 split craft and combed cotton showcase.
11. `NewArrivals` — Centered `New Pieces` product grid.
12. `CompleteTheLook` — Selectable 3-piece outfit builder (`PRODUCTS[0]`, `PRODUCTS[1]`, `PRODUCTS[5]`).
13. `ReviewCarousel` — Centered verified rating pill (`4.9 / 5`) and review quote slider.
14. `SocialGallery` — 5-column `@ORIIKO.IN` community lookbook strip.

---

## Project Structure

```text
oriiko_web/
├── app/
│   ├── account/page.tsx                # Authenticated member dashboard
│   ├── api/auth/                       # Custom session REST handlers (signup, signin, signout, me)
│   ├── auth/                           # /auth redirector & future OAuth callback
│   ├── privacy-policy/page.tsx         # Privacy Policy
│   ├── product/[slug]/page.tsx         # Dynamic PDP
│   ├── refunds-and-cancellations/page.tsx
│   ├── shipping-policy/page.tsx
│   ├── shop/page.tsx                   # Filterable catalog
│   ├── signin/page.tsx                 # Dedicated sign-in page
│   ├── signup/page.tsx                 # Dedicated sign-up page
│   ├── terms-and-conditions/page.tsx
│   ├── globals.css                     # Tailwind v4 theme variables & marquee/zoom utilities
│   ├── layout.tsx                      # Root providers, header, global drawers, footer
│   └── page.tsx                        # Landing page composition
├── components/
│   ├── auth/                           # AuthShell, AuthModal (legacy helper)
│   ├── cart/CartDrawer.tsx             # Slide-out shopping bag, promo code & shipping meter
│   ├── footer/Footer.tsx               # Benefits strip, sitemap, policy links, drop alerts form
│   ├── home/                           # Landing page section components
│   ├── legal/PolicyPageShell.tsx       # Shared layout for policy pages
│   ├── navigation/                     # AnnouncementBar, MainHeader, NavigationDrawer, SearchDrawer
│   ├── product/                        # ProductCard, QuickViewModal
│   └── ui/Icons.tsx                    # Custom inline SVG icon set
├── context/
│   ├── AuthContext.tsx                 # Client auth state + API calls
│   └── StoreContext.tsx                # Bag, INR formatting & UI drawer state
├── data/products.ts                    # Streetwear catalog, reviews, and story slides
├── lib/auth/session.ts                 # HMAC cookie signing, SHA-256 hashing & Supabase RPC helpers
├── public/                             # Burgundy, off-white, black & accent ORIIKO SVG logos
├── scripts/
│   ├── patch-magic-string.js           # Postinstall CJS compatibility helper
│   └── test-db.mjs                     # Supabase table reachability verification script
├── types/ecommerce.ts                  # Product, Variant, CartItem, Review & StorySlide types
├── utils/supabase/                     # SSR/browser Supabase client helpers
├── middleware.ts                       # Route matcher hook for cookie inspection
├── next.config.ts                      # Turbopack CSS rules & Unsplash image remotePatterns
└── package.json
```

---

## Scripts & Local Development

Install dependencies (`postinstall` runs automatically to apply `scripts/patch-magic-string.js`):

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Verify types, linting, and production compilation:

```bash
./node_modules/.bin/tsc --noEmit
npm run lint
npm run build
```

> **Note:** `npm run build` executes `next build --webpack` cleanly rather than Turbopack production bundling.

Start the production server after building:

```bash
npm run start
```

Optional database connectivity check (verifies table reachability against the configured Supabase instance):

```bash
node scripts/test-db.mjs
```
