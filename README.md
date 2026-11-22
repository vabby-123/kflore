# KFLORÉ — Luxury Floral E-Commerce Platform

A production-ready storefront and admin CMS for KFLORÉ, a premium Malaysian florist. Built with Next.js (App
Router), TypeScript, Tailwind CSS, Drizzle ORM + PostgreSQL, and WhatsApp-based ordering.

---

## 1. Project Overview

- **Storefront**: Home, Shop (search/filter/sort/pagination), Collections, Product detail, About, Same-Day
  Delivery, Contact, FAQ, Privacy, Terms.
- **Ordering**: WhatsApp is the core conversion mechanism — every product, the cart, and every CTA generates a
  pre-filled WhatsApp message. A lightweight cart (localStorage-backed) supports multi-item WhatsApp order enquiries.
- **Admin panel** (`/admin`): authenticated dashboard for managing products, categories, collections, orders/
  enquiries, homepage/about/delivery/contact content, media, settings, and admin users.
- **CMS-first**: brand copy that could vary by business decision (delivery charges, cut-off times, years of
  experience, social links, etc.) is stored in the database and edited from `/admin` — never hardcoded.

## 2. Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, Server Actions, Turbopack) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 |
| Database | PostgreSQL |
| ORM | **Drizzle ORM** (see note below) |
| Auth | Auth.js / NextAuth v5 (Credentials, JWT sessions) |
| Forms | React Hook Form patterns + Zod validation + Server Actions |
| Image storage | Local disk in development; Cloudinary when configured |
| Icons | lucide-react |
| Animation | CSS keyframes + Framer-Motion-style easing (respects `prefers-reduced-motion`) |

### ⚠️ Note on the ORM: Drizzle instead of Prisma

The original spec asked for Prisma. In the sandboxed environment this project was built in, Prisma's classic CLI
could not download its query/schema engine binaries (the host `binaries.prisma.sh` was blocked by network policy),
and the `prisma` package's current `latest` npm tag resolves to a pre-release **v8** CLI with a completely
different, largely undocumented workflow (`contract emit` / `db update` instead of `generate` / `migrate`).
Rather than build a "must work, no bugs" production app against an ORM API with no reliable reference
documentation, the data layer was implemented with **Drizzle ORM** instead — same PostgreSQL database, same schema
shape (see `lib/db/schema.ts`), fully type-safe, stable, and it needs no native binaries at all.

If you specifically want Prisma:
1. `npm install prisma @prisma/client`
2. Recreate `prisma/schema.prisma` from `lib/db/schema.ts` (the field names, types and relations map 1:1).
3. Replace `lib/db/index.ts` and `lib/db/queries.ts` with a `PrismaClient` and equivalent queries.
4. Replace `lib/actions/*.ts` Drizzle calls with Prisma Client calls (the surrounding validation/Server Action
   logic does not need to change).

Everything else in this codebase (routes, components, validation, auth) is ORM-agnostic.

## 3. Installation

```bash
git clone <your-repo-url> kflore
cd kflore
npm install
```

## 4. Environment Variables

Copy `.env.example` to `.env` and fill in:

```bash
cp .env.example .env
```

| Variable | Purpose | Required? |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `AUTH_SECRET` | Random secret for NextAuth session signing (`openssl rand -base64 32`) | Yes |
| `AUTH_URL` | Public URL of the deployed app (e.g. `https://kflore.com`) | Yes in production |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Used by `npm run db:seed` to create the first admin user | Yes, before seeding |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | Enables Cloudinary image storage | No — falls back to local `/public/uploads` |
| `WHATSAPP_NUMBER` | Default WhatsApp number used before Contact Settings are configured | Yes |
| `BUSINESS_EMAIL` | Destination for contact-form notification emails | No |
| `RESEND_API_KEY` | Enables transactional email via Resend | No — enquiries are still saved to the DB and visible in `/admin/orders` without it |
| `GOOGLE_MAPS_URL` | Fallback Maps link before Contact Settings are configured | No |

## 5. Database Setup

Requires PostgreSQL 14+.

```bash
# 1. Create a database
createdb kflore   # or via your hosting provider's dashboard

# 2. Push the schema (creates all tables/enums/indexes)
npm run db:generate   # generates SQL migration files into /drizzle
npm run db:migrate    # applies them to DATABASE_URL

# 3. Seed demo content (admin user, categories, collections, demo products, CMS defaults)
npm run db:seed
```

`npm run db:studio` opens Drizzle Studio, a visual database browser, if you want to inspect data directly.

All demo products are clearly marked `[Demo product — replace from the admin panel]` in their descriptions, and
demo images are procedurally generated brand-toned SVG illustrations (`public/images/placeholders/`) — replace both
before launch.

## 6. Run Locally

```bash
npm run dev
```

Visit `http://localhost:3000` for the storefront and `http://localhost:3000/admin` for the admin panel (log in with
the `ADMIN_EMAIL` / `ADMIN_PASSWORD` you seeded).

## 7. Build & Production

```bash
npm run build
npm run start
```

## 8. Deploying to Vercel

1. Push this repository to GitHub.
2. Import it into Vercel.
3. Add all variables from section 4 as Vercel Environment Variables (`DATABASE_URL` should point at a managed
   Postgres instance — Vercel Postgres, Neon, Supabase, or RDS all work).
4. Run `npm run db:migrate && npm run db:seed` once against the production database (locally, with `DATABASE_URL`
   pointed at production, or via a one-off Vercel deployment script).
5. Deploy.

## 9. Configuring Cloudinary (optional but recommended for production)

Create a free Cloudinary account, then set `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and
`CLOUDINARY_API_SECRET`. Once set, all uploads from `/admin` (product images, category/collection images, media
library) are automatically stored on Cloudinary instead of local disk — required for Vercel, since its filesystem
is not persistent.

## 10. Configuring WhatsApp

Set `WHATSAPP_NUMBER` (E.164 digits only, no `+`, e.g. `60123456789` for a Malaysian number) in `.env`, or set the
**WhatsApp Number** field in `/admin/contact` (the admin-configured value always takes priority on the live site).

## 11. Configuring Email Notifications

Create a [Resend](https://resend.com) account, verify a sending domain, and set `RESEND_API_KEY` and
`BUSINESS_EMAIL`. Contact-form enquiries are always saved to the database and visible in `/admin/orders`
regardless of whether email is configured.

## 12. Admin Login

Default (from seeding): the email/password you set as `ADMIN_EMAIL` / `ADMIN_PASSWORD` before running
`npm run db:seed`. **Change this password or create a new admin user and deactivate/delete the seed account before
launch.**

Two roles exist:
- **Admin** — full access, including Settings, Admin Users, and Audit Logs.
- **Editor** — products, categories, collections, orders, media, and all content (Homepage/About/Delivery/Contact)
  CMS screens, but not Settings/Users/Audit Logs.

## 13. Adding Products

`/admin/products/new` → fill in name (slug auto-generates), price, category, description, upload images
(drag to reorder — the first is the primary photo), optionally add size/option variants, assign to one or more
collections, then Save. Mark **Featured** to show on the homepage collections rail context, or **Best Seller** to
show in the homepage Best Sellers rail.

## 14. Managing Content

| Section | Where |
|---|---|
| Hero heading, subtitle, CTAs, hero image, about teaser | `/admin/homepage` |
| Brand story, founder name, years of experience, mission, values | `/admin/about` |
| Delivery areas, charges, cut-off time, notes | `/admin/delivery` |
| WhatsApp, phone, email, address, Google Maps, opening hours, socials | `/admin/contact` |
| Business name, currency, timezone | `/admin/settings` |
| Product/category/collection photography, general image library | `/admin/media` |

---

## 15. Configurable CMS Fields (full list)

**Homepage**: hero heading (2 lines), hero subtitle, hero image, primary/secondary CTA labels + links, about-teaser
heading, about-teaser excerpt, about-teaser image, Instagram toggle + handle, testimonials toggle.

**About**: family-florist flag, founder name, years of experience (nullable — no number is shown until set),
brand story, mission statement, values (list), image.

**Delivery**: delivery areas, excluded areas, same-day-available flag, delivery charges, order cut-off time,
delivery notes, public holiday notes.

**Contact / Settings**: business name, WhatsApp number, phone, email, address, Google Maps URL, opening hours,
Instagram/Facebook/TikTok URLs, currency, timezone.

**Products**: name, slug, short description, description, price, compare-at price, category, tags, featured,
best seller, status (draft/published), stock status, occasion, flower type, colour, size, delivery-eligible,
images (ordered), variants (name/SKU/price override/stock), collections.

**Categories / Collections**: name, slug, description, image, sort order, status.

## 16. Admin Capabilities (full list)

- Dashboard: live counts (products, active, featured, best sellers, enquiries, orders, completed-order revenue) and
  a recent-enquiries feed — all pulled from real data, with an empty state rather than fabricated numbers when
  there is none yet.
- Products: full CRUD, image upload + drag-to-reorder, variants, collection assignment, featured/best-seller/
  status/stock toggles.
- Categories & Collections: full CRUD with image, description, sort order, publish status.
- Orders/Enquiries: view every contact-form submission with inline status updates (New → Contacted → Confirmed →
  Completed → Cancelled).
- Homepage / About / Delivery / Contact: CMS editors backing the public pages.
- Media Library: upload, search, copy URL, delete.
- Settings: business name, currency, timezone, contact details (Admin only).
- Admin Users: create/edit/deactivate/delete Admin or Editor accounts (Admin only).
- Audit Logs: a record of create/update/delete actions across the admin panel (Admin only).
- Auth: credential-based login, bcrypt-hashed passwords, JWT sessions, all `/admin/*` routes protected by
  middleware (`proxy.ts`) plus a server-side session check in the dashboard layout.

## 17. What Still Needs to Be Supplied by the Business

Per the brief's own instruction not to invent factual business information, the following are intentionally left
as empty/placeholder CMS fields and **must** be filled in from `/admin` before launch:

- Real product photography (current images are generated placeholder illustrations, clearly not real flowers).
- Real product catalogue, pricing and descriptions (seeded products are explicitly labelled as demo content).
- Years of experience (left blank — no number is shown on the site until set).
- Full brand story / founder biography beyond the provided name "Keshwini Ganesan".
- Delivery charges and order cut-off time (left blank — the site shows "please contact us" copy until set).
- WhatsApp number, phone number, email address, physical address, Google Maps link, opening hours.
- Instagram / Facebook / TikTok URLs.
- Company registration details, if any legal/registration info should appear in the footer or legal pages (none
  has been invented).
- Final legal review of `/privacy` and `/terms`, which currently contain clearly labelled placeholder copy.

## 18. Known Simplifications (given the scope of this build)

- **Pagination** on `/shop` is in-memory (fine for a boutique catalogue of dozens–low-hundreds of products); a
  very large catalogue would want the `LIMIT`/`OFFSET` pushed into `getPublishedProducts`.
- **Role-based restrictions** are enforced for Settings/Users/Audit Logs (Admin-only) at the page level; a fuller
  system would also restrict specific server actions per-role rather than per-page.
- **Audit Logs** record create/update/delete actions on the main entities; extremely granular field-level diffs are
  not captured.
- **Dashboard charts** (enquiries/orders over time, top products, category distribution) are described in the
  spec but intentionally left as a documented follow-up rather than fabricated with fake data — the dashboard
  shows real counts today and an honest empty state instead of invented charts.
- **Checkout** is enquiry-based via WhatsApp (as the brief specifies) rather than a payment gateway — "Add to
  Cart" collects items for a single WhatsApp order message; there is no online payment processing.

## 19. Project Structure

```
app/
  (website)/            Public storefront (Header/Footer layout)
    page.tsx             Home
    shop/                Shop with filters/search/sort/pagination
    collections/         Collections + [slug]
    product/[slug]/      Product detail
    about/ delivery/ contact/ faq/ privacy/ terms/
  admin/
    login/               Standalone login (no sidebar)
    (dashboard)/         Protected admin shell (sidebar + header)
      products/ categories/ collections/ orders/ homepage/ about/
      delivery/ contact/ media/ settings/ users/ audit-logs/
  api/
    auth/[...nextauth]/  NextAuth route handler
    products/            Search API for the header search overlay
    upload/              Authenticated image upload endpoint
components/
  website/ ecommerce/ admin/ shared/ ui/
lib/
  db/                    Drizzle schema, client, query helpers
  actions/               Server Actions (products, categories, collections, cms, users, enquiries, media, audit)
  auth/  whatsapp/ validations/ seo/ storage/ email/ cart/
drizzle/                 Generated SQL migrations
scripts/
  seed.ts                Database seed script
  generate-placeholders.mjs   Generates the demo SVG illustrations
```

## 20. Development Quality

- TypeScript strict mode; `any` avoided outside a couple of narrowly-scoped, justified spots.
- `npm run lint` passes with zero errors/warnings.
- `npm run build` completes cleanly (Turbopack, Next.js 16).
- Semantic HTML, ARIA labels on icon-only buttons, visible focus states, `prefers-reduced-motion` respected.
- Every page has metadata (title/description/canonical/Open Graph/Twitter); products emit `Product` structured
  data, the Contact page emits `LocalBusiness`/`FloristShop` structured data, and the root layout emits
  `Organization` structured data. `sitemap.xml` and `robots.txt` are generated dynamically from live data.
- 404 and global error pages are on-brand rather than framework defaults; no raw stack traces are shown to
  customers.

---

## 21. Storefront redesign (admin-controlled homepage)

New CMS screens in `/admin`: **Storefront** (announcement bar, section on/off + order, newsletter and footer copy),
**Hero Slides** (desktop + mobile image, overlay, text position, focus point, live preview), **Signature Picks**
(one per month with start/end dates; the storefront switches automatically), **Journal** (the homepage section
hides itself when there are no published articles), **Subscribers**, and **Collections** now have a type
(Occasion / Type / Style / Flower / any custom label), tagline, featured flag and homepage position.

Performance notes: public pages are statically cached (ISR, 2–5 min, plus instant `revalidatePath` on admin edits);
fonts are self-hosted via `next/font/local`; only the first hero image is preloaded; product/collection queries select
only the columns they need and fetch images in one query; uploads are validated, resized (max 2400px) and get a
480px thumbnail (needs `sharp`, already installed). Build needs the database reachable (pages pre-render at build).
Hero/collection images seeded here are illustrated placeholders — replace with real photography.

## 22. Online Payment (Billplz)

KFLORÉ now supports two ordering paths side by side: the original **WhatsApp enquiry** flow (unchanged), and an
optional **Pay Online** checkout via [Billplz](https://www.billplz.com), a Malaysian payment gateway supporting FPX
online banking, cards and e-wallets.

### How it behaves with no keys configured

With `BILLPLZ_API_KEY` / `BILLPLZ_COLLECTION_ID` empty (the default), "Pay Online" is hidden everywhere — the cart
drawer shows only "Order via WhatsApp", and visiting `/checkout` directly shows a friendly "coming soon" message. The
site is fully functional without a Billplz account.

### Setting it up

1. Create a free account at [billplz-sandbox.com](https://www.billplz-sandbox.com) (test mode) or
   [billplz.com](https://www.billplz.com) (live).
2. Create a **Collection** (Billplz's term for a group of bills) and note its ID.
3. Copy your **Secret Key** (API key) and **X Signature Key** from Account Settings → API.
4. Set in `.env`:
   ```bash
   BILLPLZ_API_KEY="your-secret-key"
   BILLPLZ_COLLECTION_ID="your-collection-id"
   BILLPLZ_X_SIGNATURE_KEY="your-x-signature-key"
   BILLPLZ_SANDBOX="true"   # set to "false" only once you switch to a live account
   ```
5. Restart the app. The cart drawer and `/checkout` will now offer "Pay Online".
6. **Webhook**: Billplz calls back to `{your domain}/api/webhooks/billplz` to confirm payment server-to-server —
   this is the only thing that marks an order "Paid"; the browser redirect after payment is for the customer's
   benefit only. On localhost, Billplz can't reach you, so test with a tunnel (e.g. `ngrok http 3000`) and set
   `NEXT_PUBLIC_SITE_URL` to the tunnel URL while testing.

### How it works

- **Cart → Checkout**: the cart drawer gets a "Pay Online" button (when configured) leading to `/checkout`, which
  collects name/phone/email/delivery address, then creates an `orders` + `order_items` row and a Billplz bill.
  **Prices are always re-read from the database** at this point — a tampered cart cannot change what's charged.
- **Payment confirmation**: Billplz's webhook (`/api/webhooks/billplz`) verifies the request's `X-Signature` and
  updates the order's `paymentStatus` (`PENDING` → `PAID`/`FAILED`). The customer lands on
  `/checkout/confirmation/[orderId]`, which polls briefly if the webhook hasn't landed yet.
- **Admin**: `/admin/payments` lists every online order with its payment status (read-only, set by the webhook) and
  a fulfillment status you control (`New` → `Contacted` → `Confirmed` → `Completed` → `Cancelled`), same lifecycle
  as WhatsApp enquiries. The dashboard's "Paid Orders" / "Revenue (Paid)" stats come from this data.
- **Existing WhatsApp flow**: completely unchanged — `/admin/orders` still tracks contact-form and WhatsApp
  enquiries separately from paid online orders.

### Known limitations

- The webhook's `X-Signature` verification follows Billplz's documented scheme, but **has not been verified against
  a real sandbox callback** (no account was available while building this). Before going live, trigger a real
  sandbox payment and confirm `/api/webhooks/billplz` logs a successful verification — if it doesn't, check the
  raw posted fields against `lib/billplz/index.ts`'s `verifyBillplzSignature`.
- No inventory is decremented on payment; stock levels remain manually managed from `/admin/products`, same as
  before.
- Only Billplz is wired up. The code is isolated to `lib/billplz/`, `lib/actions/checkout.ts`, and the
  `/api/webhooks/billplz` route, so swapping or adding another gateway later doesn't touch the cart/order schema.