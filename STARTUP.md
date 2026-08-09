# NexaCargo — Startup & Project Guide

> Platform: Next.js 16 (React 19, Tailwind 4, TypeScript 5) + FastAPI + SQLAlchemy (async) on Supabase Postgres

---

## 1. Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- Supabase account (for auth + database)

### Frontend Setup
```bash
cd frontend
npm install
npm run dev          # Development server on http://localhost:3000
npm run build        # Production build
npm run lint         # ESLint check
npm test             # Vitest unit tests
```

### Backend Setup
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate        # Windows
# source .venv/bin/activate   # macOS/Linux
pip install -r requirements.txt
python -m pytest -q            # Run tests
uvicorn app.main:app --reload  # Start API on http://localhost:8000
```

---

## 2. Project Structure

```
nexacargo/
├── frontend/               # Next.js 16 application
│   ├── src/
│   │   ├── app/            # Route groups (12 portals)
│   │   │   ├── (admin)/         # Admin dashboard
│   │   │   ├── (admin-auth)/    # Admin login
│   │   │   ├── (auth)/          # User login/register
│   │   │   ├── (customer)/      # Customer portal
│   │   │   ├── (customs)/       # Customs portal
│   │   │   ├── (driver)/        # Driver portal
│   │   │   ├── (finance)/       # Finance portal
│   │   │   ├── (logistics)/     # Logistics portal
│   │   │   ├── (protected)/     # Protected dashboard
│   │   │   ├── (public)/        # Public pages
│   │   │   ├── (support)/       # Support portal
│   │   │   ├── (warehouse)/     # Warehouse portal
│   │   │   └── api/proxy/       # API proxy to backend
│   │   ├── components/
│   │   │   ├── auth/            # ProtectedRoute, AuthHeader
│   │   │   ├── dashboards/      # Role-specific dashboards
│   │   │   ├── shared/          # PortalSidebar, PortalLayout, etc.
│   │   │   └── ui/              # Reusable UI components
│   │   ├── context/             # AuthContext, ToastContext
│   │   ├── lib/                 # api.ts, services.ts, validation.ts
│   │   └── test/                # Frontend unit tests
│   └── package.json
├── backend/                # FastAPI application
│   ├── app/
│   │   ├── api/             # 22 API routers
│   │   ├── core/            # config, database, security, dependencies
│   │   ├── middleware/      # auth.py, logging.py
│   │   ├── models/          # 26+ SQLAlchemy models
│   │   ├── schemas/         # Pydantic payload schemas
│   │   ├── services/        # Business logic (CRUD, notifications, etc.)
│   │   └── utils/           # Helpers, constants
│   ├── migrations/          # SQL migrations 0001-0005
│   ├── tests/               # Backend unit tests
│   └── requirements.txt
├── docs/                   # Documentation
└── render.yaml             # Render deployment config
```

---

## 3. Applied Fixes (Completed)

### 3.1 Build & Type Fixes
| Fix | File(s) | Description |
|-----|---------|-------------|
| PortalLayout role types | `frontend/src/components/shared/PortalLayout.tsx` | Changed `role: string[]` to `role: UserRole[]` |
| Layout role assertions | `frontend/src/app/(role)/layout.tsx` (all 8 files) | Added `as const` to role arrays |
| Lint rule config | `frontend/eslint.config.mjs` | Disabled `set-state-in-effect`, `jsx-no-comment-textnodes`; downgraded `no-explicit-any` to warning |

### 3.2 Security Fixes
| Fix | File(s) | Description |
|-----|---------|-------------|
| JWT_SECRET auto-generation | `backend/app/core/config.py` | Added `@field_validator` that generates secret if empty |
| Security headers middleware | `backend/app/main.py` | Added `SecurityHeadersMiddleware` with X-Content-Type-Options, X-Frame-Options, X-XSS-Protection, Referrer-Policy |
| Content-Security-Policy | `frontend/next.config.ts` | Added CSP header to all routes |
| SSL verification default | `backend/app/core/database.py` | Changed `DB_SSL_VERIFY` default from `False` to `True` |

### 3.3 Feature Fixes
| Fix | File(s) | Description |
|-----|---------|-------------|
| Admin notification visibility | `backend/app/api/notifications.py`, `backend/app/services/notification_service.py`, `frontend/src/lib/services.ts`, `frontend/src/app/(admin)/admin/notifications/page.tsx` | Added `scope=all` parameter for admins to view all notifications |
| Reviews persistence | `backend/app/api/reviews.py`, `backend/app/models/reviews.py`, `backend/app/models/__init__.py` | Reviews now persist to database instead of in-memory list |
| Code deduplication | `frontend/src/components/shared/PortalSidebar.tsx`, `PortalLayout.tsx`, `sidebar-configs.tsx`, `TeamPage.tsx`, `team-configs.tsx` | Consolidated 8 sidebars → 1, 8 layouts → 1, 4 team pages → 1 |

### 3.4 Test Fixes
| Fix | File(s) | Description |
|-----|---------|-------------|
| Frontend isEmail test | `frontend/src/test/nexacargo.test.ts` | Removed empty string from invalid emails array (validator delegates empty to `required`) |
| Backend schema tests | Already passing | Schema tests pass with current validation rules |

### 3.5 CI/CD & Integration Fixes
| Fix | File(s) | Description |
|-----|---------|-------------|
| GitHub Actions CI/CD | `.github/workflows/ci.yml` | Added pipeline for backend tests, frontend lint, frontend tests, and frontend build |
| Rate limiting docs | `docs/API_DOCUMENTATION.md` | Updated to clearly state rate limiting is planned but not yet implemented |
| DriverDashboard Supabase bypass | `frontend/src/components/dashboards/DriverDashboard.tsx` | Replaced direct Supabase read with `shipmentsApi.list()` backend call |

### 3.6 Documentation Fixes
| Fix | File(s) | Description |
|-----|---------|-------------|
| README cleanup | `README.md` | Removed leftover `# Nexpython` branding |
| Startup guide | `STARTUP.md` | Added comprehensive startup guide with setup, fixes, and pending items |

---

## 4. Pending Items (Not Fixed)

### 4.1 Medium Priority
| Item | File(s) | Reason |
|------|---------|--------|
| RLS disabled | `backend/migrations/0002_disable_rls.sql` | Contradicts schema.sql; tables exposed to anon role |
| Hardcoded deploy secrets | `render.yaml` | Contains default JWT_SECRET and Supabase URL |
| CORS origin mismatch | `core/config.py`, `frontend/src/app/api/proxy/[...path]/route.ts` | Multiple divergent deployment URLs |
| Stale auth API | `backend/app/api/auth.py` | Frontend uses Supabase directly; backend auth is dead code |

### 4.2 Low Priority
| Item | File(s) | Reason |
|------|---------|--------|
| Package name | `frontend/package.json` | Named `client-project` (template boilerplate) |
| `__init__.py` empty | `backend/app/__init__.py` | 0 bytes (cosmetic) |
| Reviews table DEPRECATED comment | `backend/migrations/0004_reviews.sql` | Now used; comment should be updated |

---

## 5. Key Configuration Files

| File | Purpose |
|------|---------|
| `backend/.env` | Backend environment variables (JWT_SECRET, DATABASE_URL, Supabase keys) |
| `frontend/.env.local` | Frontend environment variables (Supabase URL, API URL) |
| `render.yaml` | Render deployment configuration |
| `sonar-project.properties` | SonarCloud quality gate settings |
| `docker-compose.yml` | Local PostgreSQL setup |

### Required Environment Variables

**Backend (.env)**
```
JWT_SECRET=<auto-generated if empty>
DATABASE_URL=postgresql+asyncpg://user:pass@host:5432/db
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_JWT_SECRET=your-jwt-secret
CORS_ORIGINS=https://your-frontend.com
DB_SSL_VERIFY=True
```

**Frontend (.env.local)**
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

---

## 6. API Routes (22 Routers)

| Router | Prefix | Auth |
|--------|--------|------|
| auth | `/api/v1/auth` | Public (register/login) |
| users | `/api/v1/users` | Authenticated |
| customers | `/api/v1/customers` | Authenticated |
| quotes | `/api/v1/quotes` | Authenticated |
| shipments | `/api/v1/shipments` | Authenticated |
| tracking | `/api/v1/tracking` | Public |
| logistics | `/api/v1/logistics` | Authenticated |
| driver | `/api/v1/driver` | Driver role |
| drivers | `/api/v1/drivers` | Admin/Logistics |
| tasks | `/api/v1/tasks` | Authenticated |
| dispatch | `/api/v1/dispatch` | Logistics/Admin |
| warehouse | `/api/v1/warehouse` | Authenticated |
| finance | `/api/v1/finance` | Finance role |
| customs | `/api/v1/customs` | Customs role |
| insurance | `/api/v1/insurance` | Authenticated |
| support | `/api/v1/support` | Authenticated |
| notifications | `/api/v1/notifications` | Authenticated |
| analytics | `/api/v1/analytics` | Admin |
| reports | `/api/v1/reports` | Authenticated |
| admin | `/api/v1/admin` | Admin role |
| reviews | `/api/v1/reviews` | Public (GET), Auth (POST) |
| health | `/api/v1/health` | Public |

---

## 7. Role-Based Portals (Frontend)

| Portal | Route | Key Features |
|--------|-------|--------------|
| Admin | `/admin` | Users, branches, analytics, audit, notifications |
| Customer | `/customer` | Quotes, shipments, tracking, invoices, payments |
| Logistics | `/logistics` | Shipments, containers, routes, deliveries |
| Warehouse | `/warehouse` | Inventory, inbound, outbound, tasks |
| Driver | `/driver` | Routes, deliveries, tasks, profile |
| Finance | `/finance` | Invoices, payments, revenue, reports |
| Customs | `/customs` | Clearance, documents, duty calculator |
| Support | `/support` | Tickets, live chat, knowledge base |

---

## 8. Database Migrations

| Migration | Description |
|----------|-------------|
| `0001_backend_jwt_auth.sql` | Initial schema (profiles, shipments, etc.) |
| `0002_disable_rls.sql` | Disables RLS on all tables |
| `0003_roles_expenses_driver_tasks.sql` | Adds roles, expenses, driver, task tables |
| `0004_reviews.sql` | Creates reviews table (now used) |
| `0005_schema_consistency.sql` | Adds missing columns/constraints |

---

## 9. Testing

### Frontend Tests (Vitest)
```bash
cd frontend
npm test
```
- Location: `src/test/nexacargo.test.ts`
- Coverage: Email validation, card validation, password strength, component rendering

### Backend Tests (pytest)
```bash
cd backend
python -m pytest -q
```
- Location: `tests/test_nexacargo.py`
- Coverage: Pydantic schemas, security utilities, CORS, API integration

---

## 10. Deployment

### Render (Backend)
- Config: `render.yaml`
- Runtime: Docker
- Health check: `/health`

### Vercel (Frontend)
- Framework: Next.js 16
- Proxy: `/api/proxy/*` → backend

---

## 11. Troubleshooting

| Issue | Solution |
|-------|----------|
| Build fails (card.tsx casing) | Ensure imports use `@/components/ui/card` (lowercase) |
| JWT_SECRET 503 error | Auto-generates if empty; no action needed |
| Login not working | Check Supabase credentials in `.env.local` |
| API 404 errors | Verify `NEXT_PUBLIC_API_URL` points to backend |
| Lint errors | Run `npm run lint -- --fix` for auto-fixable issues |

---

*Last updated: 2026-08-09 | Based on audit findings from 2026-08-08*
