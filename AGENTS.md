# AGENTS.md

## Repository layout

- Two independent npm apps; there is no root `package.json` or workspace. Run installs/scripts inside `client/` or `server/` using npm (both have `package-lock.json`).
- `client/`: Next.js App Router frontend with Tailwind CSS v4. Currently a static homepage with no API calls wired in.
- `server/`: Express 4 API using the native `mongodb` driver (no Mongoose).

## Commands

No test suites or CI workflow exist. Verify server changes with typecheck/build and client changes with lint/build; the server has no lint script.

### Server (`server/`)

- `npm run dev` — start with `tsx watch`
- `npm run typecheck` — `tsc --noEmit`
- `npm run build` — compile to `dist/` (ignored)
- `npm start` — run the compiled server

### Client (`client/`)

- `npm run dev` — start the Next.js dev server
- `npm run lint` — run ESLint (flat config)
- `npm run build` — intentionally uses `next build --webpack`; keep the Turbopack CSS loader setup in `next.config.ts`
- Before editing client code, read `client/AGENTS.md` and the relevant guide under `client/node_modules/next/dist/docs/`. Next 16.4.6 has breaking changes versus older training data.

## Environment and runtime

- Copy `server/.env.example` to `server/.env` and set your own `MONGODB_URI` (required). `MONGODB_DATABASE` defaults to `studiospace`, and `PORT` defaults to `5000`.
- Start the server from `server/`: `dotenv.config()` loads `.env` from the process working directory.
- Importing `server/src/index.ts` immediately attempts the MongoDB connection and exits the process if it fails. `NODE_ENV=test` only skips `app.listen()`; the DB connection still runs.
- `client/.env.example` defines `NEXT_PUBLIC_API_URL=http://localhost:5000`, but no client code uses it yet.
- API routes mount under `/api` (for example `/api/health`, `/api/studios`). CORS is currently unrestricted; `CLIENT_URL` is not wired into the server.

## Server conventions

- Keep route handlers async with explicit `try/catch`; log internal errors server-side and return generic `500` responses.
- Use the model helpers (`createStudioDoc`, `getStudioCollection`, etc.) and whitelist request fields instead of passing `req.body` through.
- Authentication is not implemented: studio creation temporarily accepts `hostId` from the request body. Replace it with the authenticated user ID when auth lands.
- `server/src/config/database.ts` owns the shared MongoDB client/db; collection helpers create indexes lazily on first use.

## Client conventions

- App Router entrypoint is `client/src/app/page.tsx`; shared layout is in `layout.tsx`. The `@/*` alias maps to `client/src/*`.
- Reuse the Tailwind v4 theme tokens defined in `globals.css` (`bg-surface`, `text-accent`, etc.) and the primitives in `src/components/ui/` rather than adding one-off colors.
