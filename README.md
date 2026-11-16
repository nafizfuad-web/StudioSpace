# StudioSpace

StudioSpace is a full-stack marketplace for renting creative studio space. Creators can discover photography, film, podcast, music, and workshop spaces, check listing details and availability guidance, save favourites, and request bookings. Hosts can list studios and manage incoming reservations. Administrators review host applications and can assign roles.

The repository contains two independent applications:

| Directory | Purpose | Stack |
| --- | --- | --- |
| `client/` | Browser application and dashboards | Next.js 16 App Router, React 19, Tailwind CSS v4 |
| `server/` | REST API, authentication, persistence | Express 4, native MongoDB driver, Better Auth |

There is no root `package.json` or workspace. Install and run each app from its own directory.

---

## Contents

- [Current status](#current-status)
- [Roles and permissions](#roles-and-permissions)
- [User workflows](#user-workflows)
- [Architecture](#architecture)
- [Tech stack](#tech-stack)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Authentication and Google OAuth](#authentication-and-google-oauth)
- [API reference](#api-reference)
- [Data model](#data-model)
- [Scripts and verification](#scripts-and-verification)
- [Security notes](#security-notes)
- [Troubleshooting](#troubleshooting)
- [Known limitations](#known-limitations)
- [Roadmap](#roadmap)

---

## Current status

Status legend:

- **Complete** — implemented and verified by build/lint/tests or by live end-to-end checks against the running API and MongoDB.
- **Partial** — implemented but incomplete, configuration-dependent, or not persisted.
- **API only** — backend exists and is tested, but there is no user interface yet.
- **Planned** — not implemented.

### Marketplace and discovery

| Feature | Status | Notes |
| --- | --- | --- |
| Marketing homepage | Complete | Hero with carousel and search form, category grid, featured studios, how-it-works, value props, host CTA, testimonials, footer. Marketing copy and testimonials are static demo content, not live metrics. |
| Studio catalogue | Complete | Loads all studios from `GET /api/studios`, normalises `_id`, and renders result cards. |
| Search and filtering | Complete | Category, location text, date, price range, capacity, facility groups, instant-book, same-day, and sorting. Filters are encoded in the URL and can be shared. |
| Map and list view | Complete | Custom OpenStreetMap tile map using city-level coordinates with marker clustering and list/map selection. Coordinates are city centroids, not exact street addresses. |
| Studio details | Complete | Gallery, pricing, capacity, features, host summary, booking-terms panel, availability guidance, and 404/error/loading states. |
| Date availability guidance | Complete | Interprets listing `booking.availability`, `leadTimeDays`, and the current date. This is listing-data guidance, not a live reservation calendar. |
| Saved studios (wishlist) | Complete | Add, remove, check, and list saved studios. Requires an authenticated session. |
| Responsive navigation and theme | Complete | Responsive navbar/footer and a dark/light theme with pre-paint theme initialisation. |

### Accounts and bookings

| Feature | Status | Notes |
| --- | --- | --- |
| Email/password sign-up and sign-in | Complete | Better Auth with MongoDB persistence; duplicate email, wrong password, and validation errors are surfaced. |
| Google sign-in | Partial | Code path and callback URL are configured correctly; end-to-end Google consent still requires real OAuth credentials and a browser login. See [Authentication and Google OAuth](#authentication-and-google-oauth). |
| Session-protected routes | Complete | Renter dashboard and profile pages require a valid session; unauthenticated API requests return `401`. Server authorization revalidates the session against the database so role changes and sign-outs take effect immediately. |
| Renter dashboard | Complete | Overview stats, upcoming bookings, saved-studios preview, and quick actions. |
| Booking creation | Complete | Server calculates duration and price from the studio record, enforces capacity and minimum hours, and rejects overlapping `pending`/`confirmed` bookings with `409`. |
| Booking list and cancellation | Complete | Renter can list their bookings, filter by status, and cancel pending/confirmed bookings. |
| Booking modification | Planned | Only cancellation is supported; dates and guest counts cannot be edited after creation. |
| Payments, deposits, refunds, escrow, payouts | Planned | `totalPrice` and `depositPercentage` are recorded/displayed only. No payment provider is integrated. |
| Email notifications and reminders | Planned | Settings toggles are local UI state; no email transport is configured. |
| Profile editing | Planned | Profile and role are displayed; name, avatar, email, and password changes have no UI. |
| Account deletion | Planned | Not implemented. |

### Host and admin

| Feature | Status | Notes |
| --- | --- | --- |
| Host application | Complete | Renter submits an application; duplicate pending applications are rejected. Latest status and rejection reason are shown on the profile page. |
| Application review | API only | Admins list applications and approve/reject them. Approval promotes the applicant's database role to `host`. No admin UI. |
| Direct role assignment | API only | Admins can set a user's role to `renter`, `host`, or `admin`. Admins cannot demote themselves. |
| Owner studio list | API only | Hosts list their own studios; admins list all studios. |
| Studio create/update/delete | API only | Host/admin only. New studios are created as `draft`. No studio-management UI. |
| Incoming bookings and accept/reject | API only | Hosts list bookings for their studios and accept or reject pending requests. No host dashboard UI. |
| Image uploads | Planned | Studios accept image URLs only. Remote images are allowlisted in `client/next.config.ts`. |

> The homepage and footer contain aspirational copy about scale, escrow, and payouts. Those are not implemented capabilities. Use the tables above as the source of truth.

---

## Roles and permissions

| Role | How it is assigned | Capabilities |
| --- | --- | --- |
| Visitor (no session) | — | Browse studios, view studio details, search/filter, open sign-in/sign-up. |
| `renter` | Default for new accounts | Everything a visitor can do, plus book studios, view/cancel own bookings, manage saved studios, view the dashboard, and submit a host application. |
| `host` | Promoted by an admin after an approved application, or assigned directly by an admin | Everything a renter can do, plus create/update/delete owned studios, list owned studios, list incoming bookings, and accept/reject pending bookings. |
| `admin` | Assigned directly in MongoDB or by another admin through the role API | All renter/host capabilities across all studios and bookings, plus host-application review and direct role assignment. |

Authorization rules enforced by the API:

- `hostId` is always derived from the verified session; a client-supplied `hostId` is rejected.
- Studio updates reject protected fields: `hostId`, `_id`, `status`, `createdAt`, `updatedAt`.
- Studio update/delete requires ownership, or an admin role.
- Booking price, duration, host, and renter are derived server-side.
- Hosts cannot book their own studios.
- Hosts can manage only bookings for their own studios; admins can manage any booking.
- Admins cannot review their own host application or demote themselves.
- A rejected applicant may submit a new application; a pending application cannot be duplicated.

### Bootstrapping the first admin

There is no admin UI or seed command for administrators. Create an account through the normal sign-up flow, then set its role in MongoDB:

```js
// mongosh
use studiospace
db.users.updateOne(
  { email: "you@example.com" },
  { $set: { role: "admin", updatedAt: new Date() } }
)
```

Sign out and sign back in after changing the role, or simply make another API request: the server resolves the role from the database on every protected request.

---

## User workflows

### 1. Discover and book a studio

1. Open `/` and use the hero search, or go to `/studios`.
2. Filter by category, location, date, price, capacity, facilities, instant book, or same-day availability.
3. Open a studio detail page to review the gallery, features, host, price, and booking terms.
4. Choose start/end date-times, guest count, and optional notes.
5. Sign in when prompted, then submit the booking.
6. The server validates the studio, computes the price, checks for overlaps, and creates the booking as `pending`, or `confirmed` when the listing has instant book enabled.
7. The booking appears under **Dashboard → Bookings**, where it can be cancelled while pending or confirmed.

### 2. Become a host

1. Sign in as a renter and open **Dashboard → Profile**.
2. Submit the host application with optional notes.
3. The application is stored as `pending` and the profile shows its status.
4. An administrator approves or rejects it through the admin API.
5. On approval, the user's role becomes `host` immediately; no re-login is required.
6. Rejected applicants can apply again; the rejection reason is returned by the API and shown when available.

### 3. Host operations (API)

1. `GET /api/owner/studios` to list owned studios.
2. `POST /api/studios` to create a draft listing, or `PUT /api/studios/:id` to edit one.
3. `GET /api/owner/bookings` to see incoming reservations with renter contact details.
4. `PATCH /api/owner/bookings/:id/status` with `{ "status": "confirmed" }` or `{ "status": "rejected" }`.

### 4. Admin operations (API)

1. `GET /api/admin/host-applications?status=pending`.
2. `PATCH /api/admin/host-applications/:id/review` with `{ "action": "approve" }` or `{ "action": "reject", "rejectionReason": "..." }`.
3. `PATCH /api/admin/users/:id/role` with `{ "role": "renter" | "host" | "admin" }`.

### 5. Account session

- Sign-up creates a `renter` account and signs the user in.
- Sign-out revokes the session. Protected API calls with the old cookie return `401`.
- Sessions last 30 days and are refreshed daily when used.
- Server-side authorization bypasses Better Auth's cookie cache, so sign-out and role changes are effective on the next request.

---

## Architecture

```text
Browser (http://localhost:3000)
  |
  |  Next.js App Router: server-rendered pages + client components
  |  fetch(..., { credentials: "include" })
  v
Express API (http://localhost:5000)
  |
  |-- /api/auth/*  -> Better Auth (mounted before express.json)
  |-- /api/*       -> health, studios, users, bookings, wishlist
  |
  +--> MongoDB (users, sessions, accounts, verifications,
                studios, bookings, saved_studios, host_applications)
```

Key architectural points:

- Better Auth is mounted with `app.all("/api/auth/*")` **before** `express.json()` so it can read the raw request stream.
- The API and frontend are separate origins in development. CORS allows `CLIENT_URL` with credentials; in development only, loopback and private-LAN origins are also accepted.
- `client/src/lib/apiUrl.ts` resolves the API base URL. `NEXT_PUBLIC_API_URL` wins; otherwise the browser uses the current hostname on port `5000`, and server-side fetches use `localhost:5000`.
- Route modules export `create*Router(deps)` factories for dependency-injected tests, plus a default router wired to production middleware and collections.
- MongoDB collections are accessed through model helpers that lazily create indexes.

### Project layout

```text
StudioSpace/
├─ client/
│  ├─ src/app/                 # App Router pages: /, /studios, /dashboard, /signin, /signup
│  ├─ src/components/          # home, search, studios, dashboard, auth, layout, ui
│  ├─ src/lib/                 # API clients, studio normalisation, search/filter logic, theme
│  ├─ next.config.ts           # remote image allowlist, Turbopack CSS loader
│  └─ AGENTS.md                # Next.js 16 agent notes
├─ server/
│  ├─ src/config/              # MongoDB and Better Auth setup
│  ├─ src/routes/              # Express routers
│  ├─ src/middleware/          # requireAuth, requireRole, requireStudioOwner
│  ├─ src/models/              # typed collection helpers and indexes
│  ├─ src/data/                # 24-studio demo catalogue and demo hosts
│  ├─ src/scripts/             # idempotent demo seed
│  └─ test/                    # offline node:test suite with fake collections
├─ AGENTS.md
└─ README.md
```

---

## Tech stack

| Layer | Technology | Version |
| --- | --- | --- |
| Frontend framework | Next.js (App Router, Cache Components, Partial Prefetching) | 16.4.6 |
| UI runtime | React / React DOM | 19.3.0 |
| Styling | Tailwind CSS v4 with `@tailwindcss/postcss` and `@tailwindcss/turbopack` | 4.3.3 |
| Client auth | `better-auth/react` | 1.7.22 |
| API server | Express | 4.21.x |
| Language | TypeScript | 5.7.x (server), 5.x (client) |
| Database | MongoDB via the native `mongodb` driver | 6.22.x |
| Authentication | Better Auth with MongoDB adapter | 1.7.22 |
| Server runtime | Node.js with `tsx` in development | Node 20+ |
| Tests | `node:test` with injected fake collections | built in |
| Lint | ESLint flat config with `eslint-config-next` | 9.x / 16.4.6 |

No ORM, component library, state-management library, payment SDK, email SDK, or CI pipeline is used.

---

## Getting started

### Prerequisites

- Node.js 20 or newer and npm
- A MongoDB database (local MongoDB or MongoDB Atlas)
- Free local ports `3000` and `5000`
- Optional: a Google Cloud project for Google sign-in

### 1. Install dependencies

```bash
cd server
npm install

cd ../client
npm install
```

### 2. Configure the server

```bash
cd server
cp .env.example .env        # Windows PowerShell: Copy-Item .env.example .env
```

Set at least:

```dotenv
MONGODB_URI=mongodb://127.0.0.1:27017
MONGODB_DATABASE=studiospace
BETTER_AUTH_SECRET=replace-with-a-random-32-plus-character-secret
```

Generate a secret without hard-coding one:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

For MongoDB Atlas, allow your current IP in **Network Access** and use the SRV connection string.

### 3. Start the API

```bash
cd server
npm run dev
```

The server connects to MongoDB before accepting requests and listens on `http://localhost:5000`. A failed database connection exits the process.

### 4. Optional: load the demo catalogue

The seed is idempotent and upserts **24 published studios** and **6 demo hosts**:

```bash
cd server
npm run seed:studios
```

Coverage: 6 photography, 6 film, 6 podcast, and 6 music studios, each with a unique multi-image gallery and booking terms. Open `/studios` after signing in or browsing publicly.

> The seeded hosts are profile-only users with `role: "host"`. They have no Better Auth credential/account records, so they cannot sign in. Use a normal sign-up to test renter and host flows.

### 5. Start the frontend

```bash
cd client
npm run dev
```

Open `http://localhost:3000`.

By default the client calls `http://<current-hostname>:5000`, so opening the app at `127.0.0.1:3000` calls `127.0.0.1:5000`. For a different API location, create `client/.env.local`:

```dotenv
NEXT_PUBLIC_API_URL=https://api.example.com
```

### 6. Production build

```bash
cd server
npm run build
npm start

cd ../client
npm run build
npm start
```

The client build intentionally uses `next build --webpack`; keep the Turbopack CSS loader configuration in `next.config.ts`.

---

## Environment variables

### Server (`server/.env`)

| Variable | Required | Default | Purpose |
| --- | --- | --- | --- |
| `MONGODB_URI` | Yes | — | MongoDB connection string. The process exits if missing or unreachable. |
| `MONGODB_DATABASE` | No | `studiospace` | Database name. |
| `PORT` | No | `5000` | API port. |
| `NODE_ENV` | No | — | Set `development` for local CORS (loopback/LAN) and `test` to skip `app.listen()`. |
| `CLIENT_URL` | No | `http://localhost:3000` | Trusted browser origin for CORS and Better Auth. Trailing slashes are stripped. |
| `BETTER_AUTH_SECRET` | Yes | — | Random secret of at least 32 characters. Never commit or log it. |
| `BETTER_AUTH_URL` | No | `http://localhost:<PORT>` | Public API origin. Determines the OAuth callback URL generated by Better Auth. |
| `GOOGLE_CLIENT_ID` | For Google | — | OAuth 2.0 Web application client ID. |
| `GOOGLE_CLIENT_SECRET` | For Google | — | OAuth 2.0 Web application client secret. |

Google is enabled only when **both** Google variables are present. Otherwise the server starts without a Google provider.

### Client (`client/.env.local`, optional)

| Variable | Required | Default | Purpose |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | No | Same hostname on port `5000` (browser); `http://localhost:5000` (server-side) | API base URL. Do not read this variable directly in code; use `API_URL` / `getApiBaseUrl()` from `client/src/lib/apiUrl.ts`. |

Never put server secrets in `NEXT_PUBLIC_*` variables; those values are shipped to the browser.

---

## Authentication and Google OAuth

### How authentication works

- Better Auth handles email/password and Google OAuth at `/api/auth/*`.
- Users, sessions, accounts, and verification tokens are stored in separate MongoDB collections.
- Browser requests must include credentials. The client auth instance sets `fetchOptions.credentials = "include"`.
- The server resolves sessions with `query: { disableCookieCache: true }`. This deliberately trades a small amount of latency for correctness: sign-outs, revoked sessions, and role changes are visible immediately.
- New accounts default to `role: "renter"`. The `role` field is marked `input: false`, so clients cannot choose their own role during sign-up.

### Google Cloud Console setup

The exact values depend on the hostnames you actually use. For the standard local setup:

| Console field | Value |
| --- | --- |
| Application type | **Web application** |
| Authorized JavaScript origin | `http://localhost:3000` |
| Authorized redirect URI | `http://localhost:5000/api/auth/callback/google` |

Steps:

1. Open [Google Cloud Console → APIs & Services → Credentials](https://console.cloud.google.com/apis/credentials).
2. Configure the **OAuth consent screen** if prompted. For local testing, an External app in testing mode is sufficient; add your Google account as a test user.
3. Create credentials → **OAuth client ID** → **Web application**.
4. Add the JavaScript origin and redirect URI exactly as shown above.
5. Copy the client ID and client secret into `server/.env`:

   ```dotenv
   GOOGLE_CLIENT_ID=your-client-id
   GOOGLE_CLIENT_SECRET=your-client-secret
   BETTER_AUTH_URL=http://localhost:5000
   CLIENT_URL=http://localhost:3000
   ```

6. Restart the API (environment variables are read at startup).
7. Open `http://localhost:3000/signin` and choose **Continue with Google**.

For production, add the deployed equivalents **in the same OAuth client** (or a separate production client):

| Field | Example |
| --- | --- |
| Authorized JavaScript origin | `https://app.example.com` |
| Authorized redirect URI | `https://api.example.com/api/auth/callback/google` |
| `CLIENT_URL` | `https://app.example.com` |
| `BETTER_AUTH_URL` | `https://api.example.com` |

The redirect URI is derived from `BETTER_AUTH_URL`. If the API is behind a proxy, set `BETTER_AUTH_URL` to the public HTTPS API origin, not an internal hostname.

### What has been verified

- The Better Auth social-sign-in endpoint generates an authorize URL whose `redirect_uri` is exactly `http://localhost:5000/api/auth/callback/google` with the default configuration.
- A request to that generated Google URL reached Google's sign-in page without `redirect_uri_mismatch` or `invalid_client` at the time of testing, using the development client configuration in `server/.env`.
- Email/password sign-up, sign-in, profile access, booking access, duplicate-email rejection, wrong-password rejection, sign-out, and post-sign-out `401` behavior were exercised against a live server and MongoDB.
- The host-application workflow was exercised end to end: submit, list as admin, approve, role promotion to `host`, and owner access with the pre-approval session.

**Not verified:** completing an actual Google consent flow and returning to the app with a real Google account. That requires human credentials and a browser session. Do not treat Google sign-in as production-ready until you complete that manual test in your own environment.

### Important hostname consistency

Use the same hostname everywhere. Mixing `localhost` and `127.0.0.1` creates two different origins, two different cookie scopes, and a redirect URI that may not match the Console entry.

- Choose `http://localhost:3000` for the app and `http://localhost:5000` for the API.
- If you must use `127.0.0.1`, add `http://127.0.0.1:3000` as a JavaScript origin as well, and set `BETTER_AUTH_URL=http://127.0.0.1:5000` so the generated callback uses the same host.
- OAuth Console changes can take a few minutes to propagate.

---

## API reference

Base URL: `http://localhost:5000`. All responses are JSON with `success: boolean`; errors include a `message`.

### Public

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/api/health` | Liveness response. |
| `GET` | `/api/studios` | All studio documents. Currently includes drafts and archived listings. |
| `GET` | `/api/studios/:id` | One studio plus public host fields (`name`, `avatar`, `role`, `createdAt`). |

### Authentication

| Method | Path | Description |
| --- | --- | --- |
| `ALL` | `/api/auth/*` | Better Auth endpoints: sign-up, sign-in, social sign-in, callback, session, sign-out. |

### User and host application (session required)

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/api/user/me` | Profile, effective role, `emailVerified`, and latest host application. |
| `POST` | `/api/user/host-application` | Submit an application. Body: `{ "notes"?: string }`. |
| `POST` | `/api/user/become-host` | Alias for the same submission handler. |
| `GET` | `/api/user/host-application` | Latest application status, notes, review time, and rejection reason. |

### Studios and owner resources

| Method | Path | Role | Description |
| --- | --- | --- | --- |
| `POST` | `/api/studios` | `host`, `admin` | Create a draft studio. Required: `title`, `description`, `category`, `location`, `pricePerHour`, `capacity`. `hostId` is forbidden in the body. |
| `PUT` | `/api/studios/:id` | Owner or `admin` | Update whitelisted studio fields. Protected fields are rejected with `400`. |
| `DELETE` | `/api/studios/:id` | Owner or `admin` | Delete a studio. |
| `GET` | `/api/owner/studios` | `host`, `admin` | Owned studios, or all studios for admins. |

### Bookings

| Method | Path | Role | Description |
| --- | --- | --- | --- |
| `POST` | `/api/bookings` | Authenticated | Body: `{ "studioId", "startAt", "endAt", "guestCount"?, "notes"? }`. Price and duration are computed server-side. |
| `GET` | `/api/bookings/my-bookings` | Authenticated | The current renter's bookings, enriched with studio summary data. |
| `GET` | `/api/bookings/:id` | Renter, host, or `admin` | Single booking with authorization check. |
| `PATCH` | `/api/bookings/:id/cancel` | Renter, host, or `admin` | Cancel a pending/confirmed booking. Completed bookings cannot be cancelled. |
| `GET` | `/api/owner/bookings` | `host`, `admin` | Incoming bookings for owned studios, including renter name/email/avatar. |
| `PATCH` | `/api/owner/bookings/:id/status` | `host`, `admin` | Body: `{ "status": "confirmed" \| "rejected" }`. Only pending bookings can be changed. |

### Wishlist

| Method | Path | Role | Description |
| --- | --- | --- | --- |
| `GET` | `/api/wishlist` | Authenticated | Saved studios with full studio summaries. |
| `GET` | `/api/wishlist/:studioId/check` | Authenticated | Returns `{ "isSaved": boolean }`. |
| `POST` | `/api/wishlist/:studioId` | Authenticated | Idempotently save a studio. |
| `DELETE` | `/api/wishlist/:studioId` | Authenticated | Remove a studio from the wishlist. |

### Administration

| Method | Path | Role | Description |
| --- | --- | --- | --- |
| `GET` | `/api/admin/host-applications` | `admin` | List applications; optional `?status=pending\|approved\|rejected`. |
| `PATCH` | `/api/admin/host-applications/:id/review` | `admin` | Body: `{ "action": "approve" \| "reject", "rejectionReason"?: string }`. Approval promotes the applicant to `host`. |
| `PATCH` | `/api/admin/users/:id/role` | `admin` | Body: `{ "role": "renter" \| "host" \| "admin" }`. |

### Status codes

| Code | Meaning |
| --- | --- |
| `200` | Success. |
| `201` | Resource created (booking, application, studio). |
| `400` | Malformed ID, invalid body, protected field, invalid state transition, invalid date range, or self-service restriction. |
| `401` | No valid session. |
| `403` | Authenticated but not permitted for this resource or role. |
| `404` | Resource not found. |
| `409` | Duplicate pending application or overlapping booking window. |
| `500` | Unexpected server error. Internal details are logged server-side, not returned to the client. |

---

## Data model

| Collection | Purpose | Notable fields |
| --- | --- | --- |
| `users` | Better Auth users plus application profile | `name`, `email`, `emailVerified`, `image`/`avatar`, `role` (`renter` \| `host` \| `admin`), timestamps |
| `sessions` | Login sessions | Session token, user reference, expiry |
| `accounts` | OAuth/credential links | Provider, provider account ID, tokens |
| `verifications` | Verification tokens | Identifier, value, expiry |
| `studios` | Listings | `title`, `description`, `category`, `location`, `pricePerHour`, `capacity`, `features`, `images`, `booking`, `hostId`, `status` (`draft` \| `published` \| `archived`), timestamps |
| `bookings` | Reservations | `studioId`, `renterId`, `hostId`, `startAt`, `endAt`, `totalPrice`, `guestCount`, `notes`, `status` (`pending` \| `confirmed` \| `rejected` \| `cancelled` \| `completed`), timestamps |
| `saved_studios` | Wishlist entries | `userId`, `studioId`, `createdAt`; unique index on `userId + studioId` |
| `host_applications` | Host onboarding | `userId`, `userName`, `userEmail`, `status` (`pending` \| `approved` \| `rejected`), `notes`, `reviewedBy`, `reviewedAt`, `rejectionReason`, timestamps |

Studio indexes: `category`, `location.city`, `pricePerHour`, `status`, `hostId`, and a text index on `title`/`description`. Booking and host-application indexes are created lazily by their model helpers.

Booking totals are calculated as `ceil(duration in hours) × pricePerHour`, with a minimum of one hour. Minimum booking hours, capacity, and overlaps are validated before insertion. Overlap prevention is an application-level check, not a unique database constraint.

---

## Scripts and verification

### Server (`cd server`)

| Command | Description |
| --- | --- |
| `npm run dev` | Start the API with `tsx watch`. |
| `npm run typecheck` | `tsc --noEmit` over `src/` (test files are excluded). |
| `npm test` | Offline `node:test` suite with injected fake collections. No MongoDB or `.env` needed. |
| `npm run build` | Compile TypeScript to `dist/`. |
| `npm start` | Run `dist/index.js`. |
| `npm run seed:studios` | Upsert the 24-studio demo catalogue. Requires a live database. |

Run a single test file:

```bash
node --import tsx --test test/studio.route.test.ts
```

New test files must be added to the explicit `test` script in `server/package.json`; they will not run automatically.

### Client (`cd client`)

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Next.js development server. |
| `npm run lint` | Run ESLint. |
| `npm run build` | Production build with webpack (`next build --webpack`). |
| `npm start` | Serve the production build. |

There is no client test suite and no CI workflow. Server changes are verified with typecheck/test/build; client changes with lint/build.

### Last verified baseline

On 2026-11-16:

- `server`: `npm run typecheck` passed, `npm test` passed **72/72**, `npm run build` passed.
- `client`: `npm run lint` passed, `npm run build` passed and generated the expected routes.

Re-run these commands after pulling changes; do not assume the baseline still holds.

---

## Security notes

- **Server-derived identity.** User IDs, roles, ownership, prices, durations, and booking hosts come from the verified session or database, never from request bodies.
- **Ownership checks.** `requireStudioOwner` allows only the studio owner or an admin. Booking reads/cancellations check renter, host, or admin membership.
- **Immediate revocation.** Session resolution bypasses the cookie cache, so a signed-out cookie or changed role is reflected on the next protected request.
- **Input validation.** Resource IDs must be 24-character hex ObjectIds. Bodies must be non-null objects. Studio updates use a whitelist and reject protected fields.
- **Overlap protection.** Booking creation rejects conflicting `pending`/`confirmed` windows. This is application-level; consider a database transaction or reservation lock for high-concurrency use.
- **CORS and cookies.** CORS uses an explicit origin allowlist with `credentials: true`. Production allows only `CLIENT_URL`; development also allows loopback and private-LAN origins.
- **Secret handling.** `BETTER_AUTH_SECRET` must be at least 32 characters. Secrets are read from the environment and are never returned to clients or written to logs.
- **Error handling.** Route handlers log internal errors server-side and return generic `500` messages. Auth middleware logs only the error name, not cookies, tokens, or headers.
- **Role self-protection.** Admins cannot review their own application or demote themselves.
- **Not included:** rate limiting, brute-force lockout, CSRF tokens beyond Better Auth/origin protections, audit logs, account deletion, email verification enforcement, and payment security. Add these before production use.

---

## Troubleshooting

### `Error 400: redirect_uri_mismatch`

The redirect URI sent by Better Auth must exactly match an entry in the Google OAuth client.

1. Open the Google sign-in URL and decode its `redirect_uri` query parameter. With the default configuration it is:

   ```text
   http://localhost:5000/api/auth/callback/google
   ```

2. Compare it character by character with the Console entry:
   - `http` vs `https`
   - `localhost` vs `127.0.0.1`
   - port `5000` vs `3000`
   - no trailing slash
   - no extra path segments
3. Confirm `BETTER_AUTH_URL` is the public API origin. If it is unset, the default is `http://localhost:<PORT>`.
4. Confirm you edited the same OAuth client whose client ID is in `server/.env`.
5. Wait a few minutes after saving Console changes, then retry in a fresh tab.

For the standard local setup, the two Console values are:

```text
Authorized JavaScript origin: http://localhost:3000
Authorized redirect URI:      http://localhost:5000/api/auth/callback/google
```

### Google button returns an error immediately

- Both `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` must be set; restart the server after changing `.env`.
- The OAuth consent screen must be configured, and your Google account must be a test user while the app is in testing mode.
- Check that the API is reachable at `BETTER_AUTH_URL` from the browser.

### Signed in but API returns `401`

- Use the same hostname for the app and API (`localhost` vs `127.0.0.1` are different origins).
- Ensure `CLIENT_URL` matches the browser origin exactly.
- Confirm requests include `credentials: "include"`; the shared API helpers already do.
- Clear cookies for both origins and sign in again.
- Check for clock skew on the machine issuing/validating session timestamps.

### `EADDRINUSE: address already in use :::5000`

Another API process is running. Stop it, or set a different `PORT` and update `NEXT_PUBLIC_API_URL` accordingly.

### Server exits at startup

- `MONGODB_URI` missing or unreachable.
- `BETTER_AUTH_SECRET` missing or shorter than 32 characters.
- MongoDB Atlas IP allowlist does not include your current address.
- Start the server from `server/` so `dotenv.config()` finds `server/.env`.

### Studio list is empty

Run `npm run seed:studios` from `server/` with a valid `MONGODB_URI`, then refresh. The public endpoint returns all studios, including drafts, so an empty list usually means the database has no studio documents.

### Images do not load

Remote images are allowlisted in `client/next.config.ts`; currently only `images.unsplash.com` is allowed. Add any new image host there before using it in studio data.

### Client build fails on dashboard types

The dashboard expects normalised studio fields (`_id`, `pricePerHour`) from `client/src/lib/studios.ts`. Do not use raw API shapes (`id`, `pricing`) in components. Run `npm run build` in `client/` to type-check.

### Windows notes

- Use `Copy-Item .env.example .env` instead of `cp` in PowerShell.
- Run each app from its own directory; the repository has no root scripts.
- If PowerShell blocks `npm.ps1`, use `npm.cmd` or adjust the execution policy.

---

## Known limitations

1. **Google OAuth is not fully verified end to end.** Configure the Console values above and complete a real consent flow before relying on it.
2. **No host, owner, or admin UI.** Studio management, incoming bookings, application review, and role assignment are API-only. The renter dashboard is the only implemented dashboard.
3. **No studio creation/editing UI.** Listings can be created and edited only through the API or the demo seed.
4. **No image uploads.** Listings store image URLs; there is no file storage or upload pipeline.
5. **No payments.** Prices are computed and displayed, but there is no checkout, deposit collection, refund, escrow, or host payout.
6. **No email delivery.** Email verification is not enforced, password reset is not exposed in the UI, and notification preferences are local state only.
7. **Public catalogue includes drafts.** `GET /api/studios` does not filter by `status`, so draft and archived listings can appear in the marketplace. Filtering by `status: "published"` is a recommended follow-up.
8. **Availability is guidance, not a calendar.** Date filtering interprets listing availability text and lead time. It does not query existing bookings or host calendars.
9. **Map coordinates are city-level.** The map uses city centroids from `client/src/lib/studioLocations.ts`, not exact addresses.
10. **Booking overlap check is not atomic.** Two simultaneous requests could both pass the conflict check. Use a transaction/unique reservation constraint for production.
11. **Seeded hosts cannot sign in.** Demo hosts have profile documents but no credential accounts.
12. **No account management.** Profile editing, avatar upload, password change, email change, and account deletion are not implemented.
13. **Static marketing content.** Testimonials, scale claims, escrow/payout copy, and some homepage statistics are demo content, not live data.
14. **No CI, deployment configuration, rate limiting, or client tests.** Server tests run offline with fake collections; there is no browser/E2E suite.

---

## Roadmap

Recommended next steps, in dependency order:

1. **Owner dashboard UI** — studio list, create/edit form, draft/publish controls, incoming bookings, accept/reject.
2. **Admin console** — host-application queue, review actions with reasons, user role management.
3. **Studio media pipeline** — authenticated image uploads, storage, validation, and cleanup.
4. **Booking hardening** — transactional overlap prevention, rescheduling, host calendar blocks, and automated completion.
5. **Payments** — provider integration, deposits, refunds, cancellation policies, and host payouts.
6. **Email and notifications** — verification, password reset, booking confirmations, reminders, and persisted preferences.
7. **Catalogue correctness** — publish-status filtering, server-side search/pagination, and exact listing coordinates.
8. **Operations** — rate limiting, audit logging, CI (typecheck/lint/test/build), deployment manifests, and monitoring.
9. **Accessibility and E2E coverage** — keyboard/focus audits and browser tests for the critical booking and host-onboarding paths.

---

## License

The server package declares `ISC`; the client package is private. There is no repository-level `LICENSE` file. Add one before distributing the project.
