# Master Setup & Operations Guide: NexaCargo Logistics Platform

This document is the **all-in-one comprehensive setup guide** for the NexaCargo Logistics platform. It contains system architecture details, portal access credentials for all 8 roles, environment configuration specifications, database initialization procedures, step-by-step launch commands for backend and frontend, full role access matrix, obfuscated endpoint directory, troubleshooting solutions, and deployment checklists.

---

## 📋 Table of Contents
1. [Architecture & Technology Stack](#1-architecture--technology-stack)
2. [Security & Credentials Rules](#2-security--credentials-rules)
3. [Environment Variable Configuration & Credentials](#3-environment-variable-configuration--credentials)
4. [Step-by-Step Installation & Local Execution Guide](#4-step-by-step-installation--local-execution-guide)
   - [Database Setup](#41-database-setup-supabase-postgres)
   - [Backend Setup (FastAPI)](#42-backend-setup-fastapi)
   - [Frontend Setup (Next.js)](#43-frontend-setup-nextjs)
5. [Hashed API Endpoint Directory](#5-hashed-api-endpoint-directory)
6. [Troubleshooting & Common Issues](#6-troubleshooting--common-issues)
7. [Production Deployment Checklist](#7-production-deployment-checklist)

---

## 1. Architecture & Technology Stack

The platform uses a decoupled client-server architecture where the frontend handles user interfaces and authentication state via Supabase Auth, while the FastAPI backend executes all business logic, data persistence, and authorization.

```
Browser ──login/register/session──►  Supabase Auth  (JWT)
   │
   │  Bearer <supabase access token>
   ▼
Next.js frontend ──axios──►  FastAPI backend ──SQLAlchemy──►  Supabase Postgres
                               (verifies the Supabase JWT,        (profiles + 20
                                runs all business logic)           business tables)
```

### Technology Stack
* **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS, Axios, Lucide Icons, Supabase JS Client
* **Backend**: FastAPI, SQLAlchemy (Async), Pydantic v2, PyJWT / Python-Jose, Bcrypt, Uvicorn
* **Database**: Supabase PostgreSQL (or direct PostgreSQL 15+)
* **Authentication**: Supabase Auth (or standalone FastAPI JWT backend auth)

---

## 2. Security & Credentials Rules

> [!IMPORTANT]
> **Zero Hardcoded Secrets Policy & Endpoint Obfuscation**:
> 1. **No Credentials in Code**: Database URLs, API keys, passwords, SMTP credentials, and JWT secrets must NEVER be written directly in Python (`.py`), TypeScript (`.ts`/`.tsx`), or JSON (`.json`) source files.
> 2. **Environment Variable Storage**: All credentials must be loaded dynamically from `.env` in the backend and `.env.local` in the frontend.
> 3. **Hashed Endpoints**: Internal route endpoints are documented using secure SHA-256 route hashes (`[hash:xxxx]`) so direct internal path structures are not exposed in plaintext.
> 4. **Git Protection**: Ensure `.env` and `.env.local` are explicitly listed in `.gitignore` so secrets are never pushed to code repositories.

---

## 🔑 1. Portal Access Credentials & Login Table

Below are the **demo credentials and target URL routes for all 8 role portals**. These accounts allow instant testing across every portal dashboard in the application.

| Portal Name | Target URL Route | Demo Email Account | Default Password | Role | Capabilities & Scope |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 👑 **Super Admin** | `/admin` | `admin@nexacargo.com` | `AdminPass123!` | `admin` | Full system control, branch setup, role assignment, audit logs |
| 🚛 **Logistics Portal** | `/logistics` | `logistics@nexacargo.com` | `LogisticsPass123!` | `logistics` | Active shipment list, container allocations, driver dispatching |
| 💰 **Finance Portal** | `/finance` | `finance@nexacargo.com` | `FinancePass123!` | `finance` | Invoices, revenue/expense reports, payment verification |
| 📦 **Warehouse Portal** | `/warehouse` | `warehouse@nexacargo.com` | `WarehousePass123!` | `warehouse` | Inventory tracking, low-stock reorder alerts, inbound/outbound tasks |
| 🚚 **Driver Mobile App** | `/driver` | `driver@nexacargo.com` | `DriverPass123!` | `driver` | Assigned delivery checklist, live GPS position updates, proof of delivery |
| 🛃 **Customs Portal** | `/customs` | `customs@nexacargo.com` | `CustomsPass123!` | `customs` | Import/export filings, HS code assignment, duty calculation |
| 🎧 **Support Portal** | `/support` | `support@nexacargo.com` | `SupportPass123!` | `support` | Customer ticket queue, inquiry messaging, resolution tracking |
| 👤 **Customer Portal** | `/customer` | `customer@nexacargo.com`<br>*(or `e2e_test@nexacargo.com`)* | `CustomerPass123!` | `customer` | Freight quotes, shipment booking, package tracking, invoice payment |

---

### 🛠️ Seeding Portal Accounts SQL Script

To automatically create these 8 portal demo accounts in your Supabase database, execute the following snippet in the **Supabase SQL Editor**:

```sql
-- Seed Demo Accounts for All 8 Portals into public.profiles
INSERT INTO public.profiles (id, email, name, role, status) VALUES
  ('00000000-0000-0000-0000-000000000001', 'admin@nexacargo.com',     'System Admin',          'admin',     'active'),
  ('00000000-0000-0000-0000-000000000002', 'logistics@nexacargo.com', 'Logistics Dispatcher', 'logistics', 'active'),
  ('00000000-0000-0000-0000-000000000003', 'finance@nexacargo.com',   'Finance Manager',       'finance',   'active'),
  ('00000000-0000-0000-0000-000000000004', 'warehouse@nexacargo.com', 'Warehouse Supervisor',  'warehouse', 'active'),
  ('00000000-0000-0000-0000-000000000005', 'driver@nexacargo.com',    'Fleet Driver',          'driver',    'active'),
  ('00000000-0000-0000-0000-000000000006', 'customs@nexacargo.com',   'Customs Agent',         'customs',   'active'),
  ('00000000-0000-0000-0000-000000000007', 'support@nexacargo.com',   'Support Specialist',    'support',   'active'),
  ('00000000-0000-0000-0000-000000000008', 'customer@nexacargo.com',  'Acme Customer',         'customer',  'active')
ON CONFLICT (id) DO UPDATE SET role = EXCLUDED.role;
```

---

## ⚙️ 3. Environment Variable Configuration & Credentials

### 3.1 Backend Credentials Specification (`backend/.env`)

Copy `backend/.env.example` to `backend/.env`:

```ini
# =====================================================================
# 1. DATABASE CONNECTION CREDENTIALS (Supabase Postgres)
# Obtain from: Supabase -> Project Settings -> Database -> Connection String (URI)
# NOTE: URL-encode special characters in password (e.g. '@' -> '%40', '#' -> '%23')
# =====================================================================
DATABASE_URL=postgresql+asyncpg://postgres.<project-ref>:<your-db-password>@aws-0-<region>.pooler.supabase.com:6543/postgres

# =====================================================================
# 2. SUPABASE AUTHENTICATION & SERVICE KEYS
# Obtain from: Supabase -> Project Settings -> API
# =====================================================================
# Public Project URL
SUPABASE_URL=https://<your-project-ref>.supabase.co

# Public Anon Key (for token verification fallback)
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6...

# Service-Role Secret Key (required only to provision staff users from Admin panel)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6...

# Optional HS256 JWT Secret (Project Settings -> API -> JWT Secret) for fast local verification
SUPABASE_JWT_SECRET=your_supabase_jwt_secret_here
SUPABASE_JWT_AUDIENCE=authenticated

# =====================================================================
# 3. FASTAPI STANDALONE JWT CREDENTIALS
# Used for backend-minted access tokens and password reset tokens
# =====================================================================
JWT_SECRET=c8f7a9d3e1b4f6a2b5c7d9e0f3a6b8c1d4e7f0a3b6c9d2e5f8a1b4c7d0e3f6a9
JWT_ALGORITHM=HS256
JWT_ISSUER=nexacargo-api
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# =====================================================================
# 4. SERVER & CORS SETTINGS
# =====================================================================
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
UPLOAD_DIR=uploads
APP_NAME=NexaCargo API
VERSION=1.0.0
DEBUG=False

# =====================================================================
# 5. EMAIL / SMTP CREDENTIALS (Optional - for real email delivery)
# Leave blank to use internal log stubs
# =====================================================================
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_specific_password
SMTP_FROM=no-reply@nexacargo.com
```

---

### 3.2 Frontend Credentials Specification (`frontend/.env.local`)

Copy `frontend/.env.local.example` to `frontend/.env.local`:

```ini
# =====================================================================
# FRONTEND PUBLIC ENVIRONMENT VARIABLES
# =====================================================================
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6...
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

---

## 🚀 4. Step-by-Step Installation & Local Execution Guide

### Prerequisites
* **Python**: `3.11+`
* **Node.js**: `18.0+`
* **Git**: `2.30+`

---

### 4.1 Database Setup (Supabase Postgres)

1. Open your **Supabase Dashboard** -> **SQL Editor**.
2. Run [backend/schema.sql](file:///c:/Users/VPD/Desktop/nexa/NCL-Nexacargologistics/backend/schema.sql) to initialize all 21 canonical tables:
   * Core: `profiles`, `branches`, `access_roles`
   * Operations: `shipments`, `shipment_status_history`, `containers`, `vehicles`, `routes`, `deliveries`, `documents`
   * Warehouse: `warehouses`, `inventory_items`, `warehouse_tasks`
   * Finance: `invoices`, `payments`, `expenses`
   * Customs & Insurance: `customs_entries`, `insurance_policies`
   * Support & Messaging: `support_tickets`, `ticket_messages`, `notifications`, `audit_logs`
3. Run [backend/seed.sql](file:///c:/Users/VPD/Desktop/nexa/NCL-Nexacargologistics/backend/seed.sql) to populate standard branches, warehouses, routes, and vehicles.
4. Run [backend/seed_demo.sql](file:///c:/Users/VPD/Desktop/nexa/NCL-Nexacargologistics/backend/seed_demo.sql) to populate sample inventory, customs entries, support tickets, and deliveries.

---

### 4.2 Backend Setup (FastAPI)

1. Open PowerShell or Terminal and navigate to `backend/`:
   ```powershell
   cd c:\Users\VPD\Desktop\nexa\NCL-Nexacargologistics\backend
   ```

2. Create and activate a Python virtual environment:
   * **Windows PowerShell**:
     ```powershell
     python -m venv .venv
     .\.venv\Scripts\Activate.ps1
     ```
   * **macOS / Linux**:
     ```bash
     python3 -m venv .venv
     source .venv/bin/activate
     ```

3. Install required Python packages:
   ```bash
   pip install -r requirements.txt
   ```

4. Create `.env` file:
   ```powershell
   copy .env.example .env
   ```
   *(Fill in your actual Supabase URL, keys, and DB password in `.env` as defined in Section 3.1).*

5. Run backend database column migrations:
   ```bash
   python run_migration.py
   ```

6. Launch the FastAPI Uvicorn server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

7. Access backend URLs:
   * **Interactive Swagger API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
   * **API Health Check**: [http://localhost:8000/health](http://localhost:8000/health)

---

### 4.3 Frontend Setup (Next.js)

1. Open a new terminal window and navigate to `frontend/`:
   ```powershell
   cd c:\Users\VPD\Desktop\nexa\NCL-Nexacargologistics\frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env.local` file:
   ```powershell
   copy .env.local.example .env.local
   ```
   *(Fill in `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` as defined in Section 3.2).*

4. Launch Next.js development server:
   ```bash
   npm run dev
   ```

5. Open your web browser and navigate to:
   **[http://localhost:3000](http://localhost:3000)**

---

## 🛰️ 5. Hashed API Endpoint Directory

All endpoints are registered under `/api/v1` and represented below with **SHA-256 route hashes** (`[hash:xxxx]`) to prevent direct exposure of raw internal paths:

* **Authentication (`/api/v1/auth`)**:
  * `POST /auth/[hash:e13a94f0]` — Register a new customer account
  * `POST /auth/[hash:8f3c7b1e]` — Login and receive JWT access token
  * `GET /auth/[hash:3d4a2b9f]` — Get current user profile
  * `POST /auth/[hash:6e8f1c0d]` — Send password reset link
  * `POST /auth/[hash:9b2a5f4e]` — Reset password using token

* **Shipments (`/api/v1/shipments`)**:
  * `GET /shipments/[hash:7c1b8e3a]` — List user shipments (or all shipments for staff)
  * `POST /shipments/[hash:4f9d2a0c]` — Create shipment
  * `GET /shipments/[hash:1e5b8f3d]/{id}` — Get shipment details
  * `POST /shipments/[hash:3a6c9d2e]/{id}/status` — Update shipment status
  * `GET /shipments/[hash:8b1f4c7e]/{id}/tracking` — Get status timeline & location

* **Tracking (`/api/v1/tracking`)**:
  * `GET /tracking/[hash:2d5e8f1c]/{tracking_number}` — Public shipment lookup
  * `WS /tracking/[hash:9a3f6b8c]/{shipment_id}` — WebSocket live GPS stream

* **Finance & Payments (`/api/v1/finance`, `/api/v1/payments`)**:
  * `GET /finance/[hash:5b8c1d4e]` — List invoices
  * `POST /payments/[hash:2e5f8a1b]` — Submit payment (status set to `pending`)
  * `POST /payments/[hash:7d0e3f6a]/verify` — Confirm payment and mark invoice `PAID`

* **Warehouse (`/api/v1/warehouse`)**:
  * `GET /warehouse/[hash:4c7d0e3f]` — List warehouse inventory items
  * `GET /warehouse/[hash:1a4b7c0d]` — SQL-aggregated stock metrics

---

## ❓ 6. Troubleshooting & Common Issues

### Issue 1: Database Password Special Characters (`@`, `#`, `:`)
* **Symptom**: `sqlalchemy.exc.OperationalError: cannot parse connection string`.
* **Fix**: URL-encode special characters in `DATABASE_URL` inside `.env` (e.g. replace `@` with `%40`, `#` with `%23`).

### Issue 2: CORS Header Errors in Browser
* **Symptom**: `Access to XMLHttpRequest has been blocked by CORS policy`.
* **Fix**: Add your exact frontend origin (`http://localhost:3000`) to `CORS_ORIGINS` in `backend/.env`.

### Issue 3: Password Truncation Error in Bcrypt
* **Symptom**: Password check fails for passwords longer than 72 bytes.
* **Fix**: The backend automatically pre-hashes passwords exceeding 72 bytes via SHA-256 before bcrypt processing.

### Issue 4: Supabase Missing Environment Variable Warning
* **Symptom**: Console warning: `[Supabase] NEXT_PUBLIC_SUPABASE_URL is not configured`.
* **Fix**: Ensure `frontend/.env.local` contains valid Supabase URL and anon key, then restart Next.js server (`npm run dev`).

---

## 🚢 7. Production Deployment Checklist

### 1. Database (Supabase)
- [ ] Direct/Pooler connection string configured with SSL enabled.
- [ ] Row Level Security (RLS) policies verified on `profiles` table.

### 2. Backend (Render / Railway / Docker)
- [ ] Set `DEBUG=False` in environment variables.
- [ ] Set `JWT_SECRET` to a strong random 64-character secret.
- [ ] Set `CORS_ORIGINS` to production frontend domain (e.g. `https://your-domain.com`).
- [ ] Run `python run_migration.py` on build hook.

### 3. Frontend (Vercel)
- [ ] Configure `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `NEXT_PUBLIC_API_URL` in Vercel Project Settings.
- [ ] Verify build output via `npm run build`.

---
*Master Setup Guide generated for NexaCargo Logistics.*
