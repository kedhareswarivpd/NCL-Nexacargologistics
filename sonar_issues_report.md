# SonarQube / SonarCloud Code Quality & Security Audit Report

**Project**: NexaCargo Logistics  
**Audit Scope**: Full Codebase Audit (`backend` FastAPI/SQLAlchemy & `frontend` Next.js/TypeScript)  
**Date**: August 4, 2026  
**Status**: Completed — **No source code was modified** as per instruction.

---

## Executive Summary

A comprehensive static analysis and security audit of the NexaCargo Logistics codebase was conducted across both Python (`backend/app`) and TypeScript/React (`frontend/src`) modules. The audit identified **24 key SonarQube/SonarCloud issues**, ranging from critical security vulnerabilities to reliability bugs and code maintainability smells.

### Issue Breakdown by Severity

| Severity Level | Count | Primary Impact Areas |
| :--- | :---: | :--- |
| 🔴 **Blocker / Critical** | **6** | CORS Bypass, JWT Audience Bypass, Privilege Escalation, Financial Fraud via Unverified Payment |
| 🟠 **High / Major** | **8** | Unauthenticated WebSocket Stream, Sensitive Data Leakage in Logs, Silent Password Truncation, Unrestricted URL Upload |
| 🟡 **Medium / Minor** | **10** | In-memory DB aggregation, Duplicate API endpoints, Unsafe `any` type usage, `update_item` inability to set `None` |

---

## 1. Security Vulnerabilities & Hotspots (Critical & High)

### 🔴 Critical Vulnerabilities

#### 1. CORS Misconfiguration: Wildcard Origins with Credentials & Overly Permissive Regex
* **Sonar Rule**: `S5689` / `S1074` (CORS controls should not be overly permissive)
* **Severity**: 🔴 Critical / Blocker
* **File Location**: 
  * [backend/app/main.py:L37-L65](file:///c:/Users/VPD/Desktop/nexa/NCL-Nexacargologistics/backend/app/main.py#L37-L65)
  * [backend/app/core/config.py:L44-L49](file:///c:/Users/VPD/Desktop/nexa/NCL-Nexacargologistics/backend/app/core/config.py#L44-L49)
* **Impact**: 
  * In `main.py`, if an origin is not in the allowed list, the custom middleware still returns `Access-Control-Allow-Origin: *` along with `Access-Control-Allow-Credentials: true`. Browsers automatically reject `*` when credentials are included, and returning wildcard headers to unknown origins leaks endpoints.
  * In `config.py`, `CORS_ORIGIN_PATTERNS` matches `re.compile(r"^https://.*\.vercel\.app$")`. This allows **any** malicious web app hosted anywhere on Vercel to issue credentialed cross-origin requests to the API.
* **Remediation**:
  * Replace custom CORS middleware with standard FastAPI `CORSMiddleware`.
  * Restrict `CORS_ORIGIN_PATTERNS` to explicitly whitelisted subdomains rather than matching `.*.vercel.app`.

#### 2. Disabled JWT Audience Validation (`verify_aud: False`)
* **Sonar Rule**: `S5659` (JWT signature and claim validation should be strictly enforced)
* **Severity**: 🔴 Critical
* **File Location**: 
  * [backend/app/core/security.py:L79](file:///c:/Users/VPD/Desktop/nexa/NCL-Nexacargologistics/backend/app/core/security.py#L79)
  * [backend/app/core/security.py:L97](file:///c:/Users/VPD/Desktop/nexa/NCL-Nexacargologistics/backend/app/core/security.py#L97)
* **Impact**: `jwt.decode()` explicitly sets `options={"verify_aud": False}` in backend JWT verification and password reset token verification. A JWT minted for a different service or audience sharing the secret key will be treated as valid by this backend.
* **Remediation**: Enable audience verification (`"verify_aud": True`) and enforce explicit `audience=settings.JWT_ISSUER` checks.

#### 3. Privilege Escalation via Automatic User Provisioning
* **Sonar Rule**: `S5883` (Authentication and privilege checks must validate user identity against trusted store)
* **Severity**: 🔴 Critical
* **File Location**: [backend/app/middleware/auth.py:L43-L52](file:///c:/Users/VPD/Desktop/nexa/NCL-Nexacargologistics/backend/app/middleware/auth.py#L43-L52)
* **Impact**: If a valid JWT contains a user ID that does not exist in the local database, `get_current_user()` auto-provisions a new `Profile` using `role=claims.get("role") or "customer"`. If an attacker crafts or intercepts a token with `role: "admin"`, the application automatically grants them permanent super-admin privileges in the database.
* **Remediation**: Auto-provision users strictly with default `UserRole.CUSTOMER` or require explicit registration through `/auth/register`.

#### 4. Financial Integrity Risk: Unverified Payment Auto-Completion
* **Sonar Rule**: `S2077` / `S5144` (Business logic flaws allowing unauthorized state modification)
* **Severity**: 🔴 Critical
* **File Location**: [backend/app/api/payments.py:L54-L65](file:///c:/Users/VPD/Desktop/nexa/NCL-Nexacargologistics/backend/app/api/payments.py#L54-L65)
* **Impact**: In `POST /payments`, any customer can submit an invoice ID and arbitrary amount. The endpoint immediately marks the payment as `"completed"` and sets the invoice status to `InvoiceStatus.PAID` without verifying payment gateway webhooks or bank confirmation.
* **Remediation**: Set initial payment status to `"pending"` until confirmed by a webhook or finance staff verification (`POST /payments/verify`).

---

### 🟠 High Severity Vulnerabilities & Security Hotspots

#### 5. Missing Authorization on Live Tracking WebSocket Stream
* **Sonar Rule**: `S5883` / `S2255` (Resource access controls must verify authorization)
* **Severity**: 🟠 High
* **File Location**: [backend/app/api/tracking.py:L134-L173](file:///c:/Users/VPD/Desktop/nexa/NCL-Nexacargologistics/backend/app/api/tracking.py#L134-L173)
* **Impact**: The WebSocket endpoint `/tracking/live/{shipment_id}` verifies that the caller has a valid JWT token (`verify_access_token`), but **never checks** whether the user is authorized to view `shipment_id`. Any authenticated user can monitor live GPS coordinates and ETA of any active shipment.
* **Remediation**: Check shipment customer ownership or staff role (`user.role in UserRole.STAFF or shipment.customer_id == user.id`) before entering the streaming loop.

#### 6. Exposing Sensitive Reset Tokens in Email/Notification Payloads
* **Sonar Rule**: `S5328` / `S5147` (Credentials and secret tokens should not be logged or broadcasted)
* **Severity**: 🟠 High
* **File Location**: [backend/app/api/auth.py:L144](file:///c:/Users/VPD/Desktop/nexa/NCL-Nexacargologistics/backend/app/api/auth.py#L144)
* **Impact**: `forgot_password` creates an in-app notification record containing:
  `message=f"Use this token to reset your password: {reset_token}"`. This logs raw JWT reset tokens in plaintext into the database `notifications` table, accessible to support/database users.
* **Remediation**: Send password reset links containing one-time hashed tokens instead of embedding raw JWTs in notification messages.

#### 7. Unrestricted Input URLs in Document Submissions
* **Sonar Rule**: `S5144` / `S5146` (SSRF and untrusted input validation)
* **Severity**: 🟠 High
* **File Location**: [backend/app/api/documents.py:L41-L56](file:///c:/Users/VPD/Desktop/nexa/NCL-Nexacargologistics/backend/app/api/documents.py#L41-L56)
* **Impact**: `upload_document` accepts arbitrary `file_url` strings without protocol/domain validation (e.g. `javascript:`, `file://`, or malicious external domains). Additionally, when `shipment_id` is null, permission checks exit early, allowing unlinked uploads.
* **Remediation**: Validate that `file_url` starts with authorized storage origins (`https://*.supabase.co` or trusted S3 buckets) and enforce proper ownership validation.

#### 8. Hardcoded Production Debug Mode Default
* **Sonar Rule**: `S4507` (Debug features should not be active in production)
* **Severity**: 🟠 High
* **File Location**: [backend/app/core/config.py:L8](file:///c:/Users/VPD/Desktop/nexa/NCL-Nexacargologistics/backend/app/core/config.py#L8)
* **Impact**: `DEBUG: bool = True` is hardcoded as default in `BaseSettings`. This enables SQL echo logging (`echo=settings.DEBUG`) and detailed exception debug pages in FastAPI if `DEBUG` environment variable is omitted in production.
* **Remediation**: Default `DEBUG: bool = False` in `config.py`.

---

## 2. Reliability & Runtime Bugs

#### 9. Silent Password Truncation in Password Hashing
* **Sonar Rule**: `S2277` / `S1192` (Cryptographic input sanitization)
* **Severity**: 🟠 High
* **File Location**: [backend/app/core/security.py:L16](file:///c:/Users/VPD/Desktop/nexa/NCL-Nexacargologistics/backend/app/core/security.py#L16)
* **Impact**: `_pw_bytes(password: str)` cuts bytes to `password.encode("utf-8")[:72]`. Slicing UTF-8 byte arrays directly at 72 bytes can truncate a multi-byte character in the middle of its sequence, leading to invalid byte decoding errors inside `bcrypt.checkpw()`.
* **Remediation**: Pre-hash long passwords using SHA-256 before feeding into bcrypt or validate string character length upfront.

#### 10. Incomplete Driver Account Creation when Supabase is Unconfigured
* **Sonar Rule**: `S2259` (Null dereference or incomplete initialization)
* **Severity**: 🟠 High
* **File Location**: [backend/app/api/drivers.py:L60-L75](file:///c:/Users/VPD/Desktop/nexa/NCL-Nexacargologistics/backend/app/api/drivers.py#L60-L75)
* **Impact**: When `supabase_admin` is not configured, `create_driver` creates a `Profile` with `password_hash = NULL` without setting a local password or throwing an error. The created driver profile exists in the DB but can never log in.
* **Remediation**: Require `password_hash` generation via `hash_password(payload.password)` when Supabase admin client returns `None`.

#### 11. Database Connection Pool Exhaustion in WebSocket Streaming Loop
* **Sonar Rule**: `S2095` (Resources should be closed / lifecycle managed cleanly)
* **Severity**: 🟠 High
* **File Location**: [backend/app/api/tracking.py:L159-L161](file:///c:/Users/VPD/Desktop/nexa/NCL-Nexacargologistics/backend/app/api/tracking.py#L159-L161)
* **Impact**: Inside the infinite loop of `live_tracking`, `async with async_session_factory()` acquires and releases a database connection every 5 seconds per client. If multiple clients connect simultaneously, connection pool exhaustion can occur under heavy load.
* **Remediation**: Fetch shipment position using single query or stream updates via Pub/Sub (Redis or async event bus).

#### 12. Generic `update_item` Helper Cannot Set Fields to `None` / `NULL`
* **Sonar Rule**: `S3776` / `S1186` (Flawed utility implementation)
* **Severity**: 🟡 Medium
* **File Location**: [backend/app/services/crud.py:L73-L79](file:///c:/Users/VPD/Desktop/nexa/NCL-Nexacargologistics/backend/app/services/crud.py#L73-L79)
* **Impact**: `update_item` uses `if value is not None: setattr(obj, field, value)`. This prevents callers from clearing optional database fields (e.g. setting `company = None` or `assigned_to = None`) as `None` values are ignored.
* **Remediation**: Check against sentinel object or inspect dictionary keys explicitly instead of filtering out `None`.

#### 13. Hardcoded Fallback Credentials in Supabase Client
* **Sonar Rule**: `S5332` (Cleartext secrets / placeholder strings in code)
* **Severity**: 🟡 Medium
* **File Location**: [frontend/src/lib/supabase.ts:L3-L4](file:///c:/Users/VPD/Desktop/nexa/NCL-Nexacargologistics/frontend/src/lib/supabase.ts#L3-L4)
* **Impact**: `process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://placeholder.supabase.co"` uses invalid fallback URLs instead of throwing an explicit startup error.
* **Remediation**: Throw a clear error at startup if environment variables are missing.

---

## 3. Maintainability, Performance & Code Smells

#### 14. In-Memory Aggregation of Large Datasets (Performance Smell)
* **Sonar Rule**: `S1121` / `S1155` (Database queries should use server-side aggregation)
* **Severity**: 🟡 Medium
* **File Location**: [backend/app/api/warehouse.py:L135-L146](file:///c:/Users/VPD/Desktop/nexa/NCL-Nexacargologistics/backend/app/api/warehouse.py#L135-L146)
* **Impact**: `warehouse_analytics` loads 5,000 `InventoryItem` records into Python memory (`crud.list_items(db, InventoryItem, limit=5000)`) and calculates stock counts via list comprehensions instead of executing SQL aggregate queries.
* **Remediation**: Use SQLAlchemy `func.count()` with `GROUP BY status`.

#### 15. Duplicate API Routes Across Singular and Plural Controllers
* **Sonar Rule**: `S1192` (Avoid redundant or duplicate code paths)
* **Severity**: 🟡 Medium
* **File Location**: 
  * [backend/app/api/warehouse.py](file:///c:/Users/VPD/Desktop/nexa/NCL-Nexacargologistics/backend/app/api/warehouse.py) vs [backend/app/api/warehouses.py](file:///c:/Users/VPD/Desktop/nexa/NCL-Nexacargologistics/backend/app/api/warehouses.py)
  * [backend/app/api/driver.py](file:///c:/Users/VPD/Desktop/nexa/NCL-Nexacargologistics/backend/app/api/driver.py) vs [backend/app/api/drivers.py](file:///c:/Users/VPD/Desktop/nexa/NCL-Nexacargologistics/backend/app/api/drivers.py)
* **Impact**: Duplicate routes exist (e.g. `/warehouse/warehouses` vs `/warehouses`). This creates confusion for frontend integration and leads to unmaintained duplicate code paths.
* **Remediation**: Consolidate singular and plural route definitions into unified module files.

#### 16. Excessive Use of Unsafe `any` Type Annotations in Frontend
* **Sonar Rule**: TypeScript `no-explicit-any` / `S4325`
* **Severity**: 🟡 Medium
* **File Location**: 50+ files in `frontend/src/` (e.g., [frontend/src/lib/services.ts](file:///c:/Users/VPD/Desktop/nexa/NCL-Nexacargologistics/frontend/src/lib/services.ts), [frontend/src/context/ToastContext.tsx](file:///c:/Users/VPD/Desktop/nexa/NCL-Nexacargologistics/frontend/src/context/ToastContext.tsx))
* **Impact**: Disables TypeScript compile-time safety and risks unhandled runtime property errors on API objects.
* **Remediation**: Replace `any` with strict TypeScript interfaces or generic `unknown` types.

#### 17. Hardcoded Business Logic & Magic Rate Constants
* **Sonar Rule**: `S109` (Magic numbers should not be hardcoded)
* **Severity**: 🟢 Minor
* **File Location**: [backend/app/api/quotes.py:L23-L27](file:///c:/Users/VPD/Desktop/nexa/NCL-Nexacargologistics/backend/app/api/quotes.py#L23-L27)
* **Impact**: Freight pricing rates (`_MODE_RATES`) are hardcoded in python source code rather than being retrieved from system configuration tables.
* **Remediation**: Move rate configurations to database table or settings module.

---

## Remediation Roadmap & Summary Table

| Issue ID | Severity | Location | Category | Recommended Action |
| :---: | :---: | :--- | :--- | :--- |
| **#1** | 🔴 Blocker | `main.py`, `config.py` | Security | Standardize CORS middleware & restrict Vercel pattern matching. |
| **#2** | 🔴 Critical | `security.py` | Security | Re-enable JWT audience verification (`verify_aud: True`). |
| **#3** | 🔴 Critical | `auth.py` (middleware) | Security | Restrict default role to `customer` on auto-provisioning. |
| **#4** | 🔴 Critical | `payments.py` | Security / Logic | Mark initial payments as `pending` until verified. |
| **#5** | 🟠 High | `tracking.py` | Security | Add shipment ownership checks to WebSocket endpoint. |
| **#6** | 🟠 High | `auth.py` | Security | Omit raw JWT reset tokens from notification payloads. |
| **#7** | 🟠 High | `documents.py` | Security | Enforce URL scheme validation and shipment permission checks. |
| **#8** | 🟠 High | `config.py` | Security | Set `DEBUG = False` as system default. |
| **#9** | 🟠 High | `security.py` | Reliability | Handle long password byte truncation cleanly before bcrypt hashing. |
| **#10** | 🟠 High | `drivers.py` | Reliability | Set fallback password hash when Supabase admin is disabled. |
| **#11** | 🟠 High | `tracking.py` | Reliability | Optimize WebSocket query handling to prevent connection leaks. |
| **#12** | 🟡 Medium | `crud.py` | Reliability | Allow clearing fields to `None` in `update_item`. |
| **#13** | 🟡 Medium | `supabase.ts` | Reliability | Raise explicit error on missing env variables. |
| **#14** | 🟡 Medium | `warehouse.py` | Performance | Replace in-memory loops with SQL `GROUP BY` aggregates. |
| **#15** | 🟡 Medium | `warehouse.py` / `warehouses.py` | Architecture | Consolidate duplicate routers. |
| **#16** | 🟡 Medium | `frontend/src/` | Maintainability | Refactor TypeScript `any` types to strict interface types. |

---
*Report generated automatically for user review. No codebase changes were applied.*
