# Ewurahils Fashion Store

Premium WhatsApp-first fashion e-commerce platform built with the Next.js App Router.

Customers browse a database-driven storefront, keep a guest cart in the browser, and hand the
order to the business over WhatsApp. Admins manage the catalogue, homepage, media, delivery
zones and store settings from a protected dashboard.

## Stack

- Next.js 16 (App Router, `proxy.ts` route protection) + TypeScript (strict)
- Tailwind CSS v4 + shadcn/ui (base-nova) + `lucide-react`
- PostgreSQL + Prisma 7 (`@prisma/adapter-pg`), money stored as integer pesewas
- Auth.js v5 credentials provider (JWT sessions, bcrypt hashes) for the admin dashboard
- Zod validation, React Hook Form–style controlled admin forms, server actions
- Cloudinary signed direct-to-browser uploads
- Vitest (unit) + Playwright (browser E2E)

## Setup

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Create a PostgreSQL database and set `DATABASE_URL` in `.env`.

3. Copy `.env.example` to `.env` and fill in the values:
   ```bash
   cp .env.example .env
   ```
   Generate a secret with `openssl rand -base64 32`.

4. Generate the Prisma client and apply migrations:
   ```bash
   pnpm prisma generate
   pnpm prisma migrate dev
   ```

5. Seed baseline content (admin user, categories, collections, delivery zones, store settings,
   homepage sections). The script is idempotent:
   ```bash
   pnpm db:seed
   ```
   Default admin: `admin@example.com` / `changeme123`. Override with `ADMIN_EMAIL`,
   `ADMIN_PASSWORD` and `ADMIN_NAME`, and change the password before going live.

6. Run the dev server:
   ```bash
   pnpm dev
   ```

## Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | yes | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | yes | Session/JWT signing secret |
| `NEXTAUTH_URL` | yes | Canonical auth origin (e.g. `https://ewurahils.com`) |
| `NEXT_PUBLIC_SITE_URL` | recommended | Public origin used for metadata, sitemap and WhatsApp product links |
| `CLOUDINARY_CLOUD_NAME` | for uploads | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | for uploads | Cloudinary API key (public) |
| `CLOUDINARY_API_SECRET` | for uploads | Cloudinary API secret (server only) |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `ADMIN_NAME` | optional | Seeded admin credentials |

Without Cloudinary credentials the storefront still runs; uploads return
`Cloudinary is not configured`.

## Scripts

- `pnpm dev` - development server
- `pnpm build` - production build
- `pnpm start` - start the production server
- `pnpm lint` - ESLint
- `pnpm typecheck` - TypeScript (`tsc --noEmit`)
- `pnpm test` - Vitest unit tests (`tests/`)
- `pnpm test:e2e` - Playwright browser tests (starts a dev server on port 3002)
- `pnpm db:seed` - idempotent seed script
- `pnpm prisma migrate deploy` - apply migrations in production

### Tests

- Unit tests cover money formatting, WhatsApp message/URL construction, banner scheduling and
  input validation.
- Playwright E2E covers admin authentication, unauthenticated API rejection, admin product
  creation, storefront rendering, unpublished-product 404s, variant selection, cart persistence
  across reloads, delivery-zone selection and the WhatsApp handoff.
  - First run needs a browser: `pnpm exec playwright install chromium`.
  - The E2E global setup writes fixtures (`E2E Linen Shirt`, `E2E Draft Product`, `E2E Delivery`
    zone) into the configured database; the global teardown deletes them again and restores the
    stored WhatsApp number. Point `DATABASE_URL` at a disposable database in CI.

## Placeholder media (temporary)

While the real photography is being shot, the store can be filled with placeholder images and
videos hosted on Pinterest (or any other public https URL):

1. Put your URLs in `prisma/placeholders.json`:
   ```json
   {
     "demoProducts": true,
     "media": [
       { "name": "look-01", "type": "image", "url": "https://i.pinimg.com/originals/…jpg" },
       { "name": "reel-01", "type": "video", "url": "https://v1.pinimg.com/videos/…mp4" }
     ],
     "banners": [
       {
         "name": "hero-01",
         "type": "image",
         "url": "https://i.pinimg.com/originals/…jpg",
         "headline": "The new season edit",
         "subtitle": "Considered pieces, made to be worn often.",
         "ctaLabel": "Shop the collection",
         "ctaUrl": "/shop"
       }
     ]
   }
   ```
2. Run the seeder:
   ```bash
   pnpm db:placeholders
   ```

The script checks every URL (a non-2xx response is skipped with a warning), creates/updates
`MediaAsset` rows under the `ewurahils/placeholders/` namespace, seeds six demo products with
variants and stock, assigns category and collection covers, creates the banners, links the
first banner to the hero homepage section and adds a promotional section for every extra
banner. It is idempotent — re-run it whenever you change the list.

Notes:
- Placeholder assets are never uploaded to Cloudinary and are never deleted from it; they can be
  removed from the media library like any other asset.
- `i.pinimg.com`, `v1.pinimg.com` and `media.pinimg.com` are allowed as remote image hosts in
  `next.config.ts`. Remove those entries once everything lives in Cloudinary.
- Pinterest `.m3u8`/HLS links are not usable in the `<video>` element — use the `.mp4` variant.
- The demo products are prefixed with `placeholder-`; delete them from **Admin → Products**
  when the real catalogue goes live.

## Storefront

- Homepage composed from ordered, typed homepage sections (hero, featured categories, new
  arrivals, featured products, selected collection, promotional banner, campaign video, brand
  story, social links). Sections are reordered from the admin dashboard.
- `/shop` with search, category filter, in-stock filter, sorting and pagination.
- Product pages with gallery/video, variant picker, live stock, quantity limits and related
  products.
- Guest cart persisted in `localStorage` (`ewurahils-cart`); the browser is never trusted for
  price or stock.
- Delivery area selection, live fee estimate and a WhatsApp order message.

## WhatsApp ordering

`server/actions/cart.ts` re-reads products and variants from the database, rejects unpublished
products, inactive/missing variants and out-of-stock lines, clamps quantities to available
stock, resolves the delivery zone fee and builds the message from trusted values only. The
customer then confirms the order in the WhatsApp chat — the platform never claims an order was
placed or confirmed. Long carts fall back to a shortened, then summarised message.

The business WhatsApp number is configured in **Admin → Settings**. Numbers are normalised to
international format (Ghana `0…` prefixes become `233…`).

## Media

- Admin uploads go straight from the browser to Cloudinary using a short-lived signed request
  issued by `POST /api/admin/media/sign` (admin session required, rate limited, folder
  restricted to `ewurahils/<allowed-folder>`).
- Metadata (public id, URL, dimensions, type) is persisted through a server action that
  re-validates the namespace and URL scheme.
- Deleting an asset first checks every reference (products, categories, collections, banners,
  store logo/favicon/social image) and then deletes the Cloudinary asset before the database
  row.

## Security notes

- Every admin mutation runs through a server action that calls `requireAdmin()`; the `proxy.ts`
  matcher redirects unauthenticated `/admin` traffic to the login page and the admin layout
  re-checks the session.
- Admin pages emit `robots: noindex` and `/admin` + `/api` are disallowed in `robots.txt`.
- Login attempts and media signing are rate limited per identity/IP. The limiter is in-memory,
  so it is per-instance — use a shared store (Upstash/Redis) if you run multiple instances.
- Security headers (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`,
  `Permissions-Policy`) are set in `next.config.ts`; `X-Powered-By` is disabled.
- Cloudinary secrets stay on the server and are never exposed to the browser.

## Deployment

1. Provision PostgreSQL (Vercel Postgres, Neon, Supabase, …) and set `DATABASE_URL`.
2. Set `NEXTAUTH_SECRET`, `NEXTAUTH_URL` and `NEXT_PUBLIC_SITE_URL` to the production origin.
3. Set the Cloudinary variables if you want uploads.
4. Apply migrations: `pnpm prisma migrate deploy`.
5. Provision the admin account: `pnpm db:seed` with `ADMIN_EMAIL`/`ADMIN_PASSWORD` set, then
   sign in and change the password. The dashboard has no self-service password reset yet.
6. Deploy to Vercel (build command `pnpm build`, install `pnpm install --frozen-lockfile`).

## Known limitations

- No online payments, no customer accounts and no order tables: ordering happens in WhatsApp.
- Inventory is modelled through product variants; a product without variants cannot be ordered.
- Rate limiting is in-memory and not shared between instances.
- Delivery fees are flat per zone; there is no courier API integration.
# EwuraHils
