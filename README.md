# NexaCargo Global Logistics Platform

A production-style logistics platform (customer portal + role dashboards for
logistics, warehouse, driver, finance, customs, support, and admin).

- **`frontend/`** — Next.js 16 (App Router, React 19, Tailwind). Uses **Supabase
  only for authentication**; all business data comes from the backend API.
- **`backend/`** — FastAPI + SQLAlchemy (async) on **Supabase Postgres**. Owns
  every business endpoint and verifies the Supabase access token on each request.

## Architecture

```
Browser ──login/register/session──►  Supabase Auth  (JWT)
   │
   │  Bearer <supabase access token>
   ▼
Next.js frontend ──axios──►  FastAPI backend ──SQLAlchemy──►  Supabase Postgres
                              (verifies the Supabase JWT,        (profiles + 20
                               runs all business logic)           business tables)
```

- The frontend obtains a Supabase session and attaches the access token to every
  API call (`src/lib/api.ts`).
- The backend verifies that token (locally via `SUPABASE_JWT_SECRET`, or remotely
  via Supabase's `/auth/v1/user`) and resolves it to a `profiles` row
  (`app/middleware/auth.py`). It never stores passwords.
- Role-based access is enforced per endpoint (`app/core/dependencies.py`).

## Prerequisites

- Python 3.11+ (tested on 3.14) and Node.js 18+.
- A Supabase project. From **Project Settings → API / Database** you need:
  the Postgres connection string, the Project URL, the anon key, and (optional)
  the JWT secret + service-role key.

## 1. Database setup (once)

Apply the schema to your Supabase Postgres. Either run `backend/schema.sql`
(and optionally `backend/seed.sql`) in the **Supabase SQL Editor**, or:

```bash
psql "<your-direct-connection-string>" -f backend/schema.sql
psql "<your-direct-connection-string>" -f backend/seed.sql   # optional demo data
```

> ⚠️ `schema.sql` is destructive: it drops legacy/prototype tables, then creates
> the 21 canonical tables. `profiles` and Supabase `auth` are preserved.

## 2. Backend

```bash
cd backend
python -m venv ../.venv && ../.venv/Scripts/activate   # Windows
# source ../.venv/bin/activate                          # macOS/Linux
pip install -r requirements.txt
cp .env.example .env        # then fill in the values (see below)
uvicorn app.main:app --reload --port 8000
```

`.env` keys:

| Key | Required | Notes |
| --- | --- | --- |
| `DATABASE_URL` | ✅ | Supabase pooler URI. **URL-encode `@` in the password as `%40`.** |
| `SUPABASE_URL` | ✅ | `https://<ref>.supabase.co` |
| `SUPABASE_ANON_KEY` | ✅ | Enables remote token verification |
| `SUPABASE_JWT_SECRET` | optional | Fast local token verification (HS256) |
| `SUPABASE_SERVICE_ROLE_KEY` | optional | Needed only to create staff users from the admin panel |
| `CORS_ORIGINS` | ✅ | e.g. `http://localhost:3000` |

- API docs: <http://localhost:8000/docs> · Health: <http://localhost:8000/health>
- All endpoints are under `/api/v1` (e.g. `GET /api/v1/shipments`).

## 3. Frontend

```bash
cd frontend
npm install
# .env.local needs:
#   NEXT_PUBLIC_SUPABASE_URL=...
#   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
#   NEXT_PUBLIC_API_URL=http://localhost:8000/api
npm run dev      # http://localhost:3000
```

## Roles

`customer`, `logistics`, `warehouse`, `driver`, `finance`, `customs`, `support`,
`admin`. A user's role lives in `profiles.role` (seeded from Supabase auth
metadata on first login). Admins can change roles via the admin panel; create
staff accounts requires `SUPABASE_SERVICE_ROLE_KEY`.

## Module coverage

Customer portal (register, quotes, shipments, tracking, invoices, payments,
insurance, support) · Logistics (shipments, containers, routes, vehicles,
deliveries) · Warehouse (inventory, tasks, analytics) · Driver app (deliveries,
status, proof) · Finance (invoices, payments, revenue/outstanding) · Customs
(clearance entries) · Support (tickets + messages) · Admin (users, branches,
analytics, audit, notifications). Status changes auto-queue notifications
(in-app + email stub).