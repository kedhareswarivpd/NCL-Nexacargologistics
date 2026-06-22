# NexaCargo — Production Specification

**Platform:** Multi-portal logistics & freight management system (DHL / FedEx / Maersk class)
**Stack:** Next.js (frontend) · FastAPI (backend, REST) · Supabase / Postgres (database, auth, storage, realtime)
**Audience:** Engineering team — use this to design the DB schema, REST APIs, and UI directly.

---

## 0. System Overview

### Portals / Roles
| Portal | Primary Role | Scope |
|---|---|---|
| Customer Portal | `customer` | Book shipments, pay, track, support |
| Logistics Dashboard | `logistics` (Logistics Manager) | Approve shipments, routes, containers, vehicles |
| Warehouse Dashboard | `warehouse` (Warehouse Manager) | Check-in, storage, barcode, dispatch |
| Customs Dashboard | `customs` (Customs Officer) | Document verification, duty, clearance |
| Driver App (mobile) | `driver` | Pickup, GPS nav, status, proof of delivery |
| Finance Dashboard | `finance` (Finance Manager) | Invoicing, payments, revenue |
| Support Dashboard | `support` (Support Executive) | Tickets, resolution, feedback |
| Super Admin | `admin` | Users, roles, branches, audit, system analytics |

### Architecture (high level)
```
                ┌────────────────────────────────────────────┐
                │              Super Admin                     │
                └────────────────────────────────────────────┘
   ┌──────────┬──────────┬──────────┬──────────┬──────────┬─────────┐
   │ Customer │Logistics │Warehouse │ Finance  │ Customs  │ Support │
   │ Portal   │ Team     │ Team     │ Team     │ Team     │ Team    │
   └────┬─────┴────┬─────┴────┬─────┴────┬─────┴────┬─────┴────┬────┘
        └──────────┴──────────┴──── Shipment Core ──┴──────────┘
                          │            │            │
                  ┌───────┴───┐ ┌──────┴────┐ ┌─────┴──────┐
                  │ Driver App│ │ Tracking  │ │ Insurance  │
                  └───────────┘ │ Engine    │ │ Module     │
                                └───────────┘ └────────────┘
   External: Google Maps API (routing/tracking) · SMS + Email gateway · Payment gateway · Insurance partner API
```

### Cross-cutting principles
- **Auth:** Supabase Auth (JWT). FastAPI validates the JWT on every request and resolves role + branch.
- **Authorization:** Role-Based Access Control (RBAC) enforced in two layers — Postgres Row-Level Security (RLS) *and* FastAPI dependency guards.
- **Multi-branch:** Every operational row carries a `branch_id`; users see only their branch unless `admin`.
- **Audit:** All write operations on sensitive entities emit an `audit_log` row.
- **Money:** All amounts stored as integer minor units (cents) + `currency` (ISO-4217). Never floats.
- **Time:** All timestamps `timestamptz` in UTC; format on the client.
- **IDs:** UUID primary keys; human-facing reference codes (e.g. `NX-2026-00001`) are separate columns.

---

## 1. Modules & Entities

> Field notation: `PK` primary key, `FK` foreign key, `UQ` unique, `EN` enum, `IDX` indexed.
> Every table also has `id UUID PK`, `created_at timestamptz`, `updated_at timestamptz` unless stated.

### 1.1 Identity & Access Module
**`users`** (mirrors `auth.users`)
- `id` PK (matches Supabase auth uid)
- `name`
- `email` UQ, IDX
- `phone`
- `role` EN: customer | logistics | warehouse | customs | driver | finance | support | admin
- `branch_id` FK → branches
- `company` (customers only)
- `status` EN: active | suspended | invited
- `last_login_at`
- `created_at`

**`roles`** & **`permissions`** (for fine-grained admin control)
- `roles`: `key` UQ, `label`, `description`, `is_system`
- `permissions`: `key` UQ (e.g. `shipment.approve`), `label`, `module`
- `role_permissions`: `role_id` FK, `permission_id` FK *(many-to-many)*

**`branches`**
- `code` UQ (e.g. `BLR-01`)
- `name`, `country`, `city`, `address`
- `timezone`
- `manager_id` FK → users
- `status` EN: active | inactive

**Relationships:** branch `1—N` users · role `N—N` permissions · branch `1—N` shipments.

---

### 1.2 Customer Module
**`customers`** (extends a user; B2B/B2C)
- `user_id` FK → users UQ
- `customer_code` UQ
- `type` EN: individual | business
- `tax_id` / GSTIN
- `billing_address`, `shipping_address` (jsonb)
- `credit_terms_days` (default 0 = prepaid)
- `credit_limit` (minor units)
- `kyc_status` EN: pending | verified | rejected
- `default_currency`

**Relationships:** customer `1—N` shipments · `1—N` quotes · `1—N` invoices · `1—N` tickets · `1—N` policies.

---

### 1.3 Shipment Core Module
**`quotes`**
- `quote_code` UQ
- `customer_id` FK
- `origin` (jsonb: city, country, postcode, lat, lng)
- `destination` (jsonb)
- `mode` EN: air | sea | road
- `cargo_type` EN: general | hazardous | perishable | fragile | oversized
- `weight_kg`, `volume_cbm`
- `incoterm` EN: EXW | FOB | CIF | DDP …
- `amount` (minor units), `currency`
- `valid_until`
- `status` EN: draft | quoted | accepted | expired

**`shipments`** (central aggregate)
- `tracking_number` UQ, IDX (e.g. `NX-2026-00001`)
- `customer_id` FK, IDX
- `quote_id` FK (nullable)
- `branch_id` FK
- `mode` EN: air | sea | road
- `origin` / `destination` (jsonb)
- `cargo_description`, `weight_kg`, `volume_cbm`, `declared_value` (minor units)
- `status` EN: draft | booked | pending_review | customs_review | warehouse | container_assigned | dispatched | in_transit | out_for_delivery | delivered | closed | cancelled | on_hold
- `priority` EN: standard | express | critical
- `assigned_logistics_id` FK → users (nullable)
- `container_id` FK (nullable), `vehicle_id` FK (nullable), `route_id` FK (nullable)
- `eta`, `delivered_at`, `closed_at`
- `insurance_required` bool

**`shipment_items`** (cargo line items)
- `shipment_id` FK
- `description`, `hs_code` (customs harmonized code)
- `quantity`, `unit_weight_kg`, `unit_value` (minor units)
- `package_type` EN: box | pallet | crate | drum | container
- `dimensions` (jsonb: l/w/h cm)

**`documents`** (polymorphic attachments)
- `shipment_id` FK (nullable), `owner_type`, `owner_id`
- `doc_type` EN: invoice | packing_list | bill_of_lading | certificate_of_origin | customs_declaration | insurance_cert | proof_of_delivery | other
- `file_url` (Supabase Storage), `file_name`, `mime`, `size_bytes`
- `uploaded_by` FK → users
- `status` EN: uploaded | verified | rejected
- `verified_by` FK, `verified_at`

**`shipment_events`** (audit/status timeline — append only)
- `shipment_id` FK, IDX
- `event_type` EN (status_change | note | exception | scan | location_update)
- `from_status`, `to_status`
- `actor_id` FK → users
- `notes`, `location` (jsonb)
- `created_at`

**Relationships:** shipment `1—N` shipment_items · `1—N` documents · `1—N` shipment_events · `N—1` container · `N—1` vehicle · `N—1` route · `1—1` invoice · `1—1` policy (optional).

---

### 1.4 Logistics Module
**`containers`**
- `container_no` UQ (ISO 6346)
- `type` EN: dry | reefer | open_top | flat_rack | tank
- `size` EN: 20ft | 40ft | 40ft_hc
- `max_weight_kg`, `max_volume_cbm`
- `current_weight_kg`, `current_volume_cbm` (computed/maintained)
- `status` EN: available | loading | sealed | in_transit | delivered | maintenance
- `branch_id` FK
- `seal_no` (nullable)

**`vehicles`**
- `plate_no` UQ
- `type` EN: truck | van | trailer | container_truck
- `capacity_kg`, `capacity_cbm`
- `status` EN: available | assigned | in_transit | maintenance
- `driver_id` FK → users (nullable, current)
- `branch_id` FK
- `last_service_at`, `gps_device_id`

**`routes`**
- `route_code` UQ
- `origin` / `destination` (jsonb)
- `distance_km`, `est_duration_min`
- `mode` EN: road | multimodal
- `polyline` (Google Maps encoded path)
- `status` EN: planned | active | completed
- `optimized` bool

**`route_stops`**
- `route_id` FK
- `stop_num`, `label`, `address`, `lat`, `lng`
- `scheduled_time`
- `status` EN: pending | active | done
- `shipment_id` FK (nullable)

**Relationships:** route `1—N` route_stops · vehicle `N—N` shipments (via assignment) · container `1—N` shipments (consolidation) · vehicle `1—1` driver (active).

---

### 1.5 Warehouse Module
**`warehouses`**
- `code` UQ, `name`, `branch_id` FK, `address`, `total_capacity_cbm`

**`warehouse_slots`** (`storage` bins/zones)
- `warehouse_id` FK
- `zone`, `bin_code` UQ (e.g. `A-12-03`)
- `capacity_cbm`, `used_cbm`
- `status` EN: empty | partial | full | reserved | blocked

**`inventory_items`**
- `warehouse_id` FK
- `shipment_id` FK (nullable)
- `sku` UQ, `barcode` UQ, IDX
- `name`, `category`
- `slot_id` FK → warehouse_slots
- `qty`, `reorder_at`
- `status` EN: ok | low | critical | dispatched

**`warehouse_checkins`**
- `shipment_id` FK
- `warehouse_id` FK
- `received_by` FK → users
- `condition` EN: good | damaged | partial
- `barcode_generated` bool
- `checked_in_at`

**`warehouse_tasks`**
- `warehouse_id` FK, `description`
- `type` EN: putaway | pick | pack | load | count
- `priority` EN: high | medium | low
- `assignee_id` FK, `status` EN: pending | in_progress | completed, `due`

**Relationships:** warehouse `1—N` slots · slot `1—N` inventory_items · shipment `1—1` checkin.

---

### 1.6 Customs Module
**`customs_declarations`**
- `shipment_id` FK UQ
- `declaration_no` UQ
- `direction` EN: import | export
- `officer_id` FK → users (nullable until assigned)
- `status` EN: pending | under_review | docs_requested | approved | rejected | released
- `hs_codes` (jsonb array)
- `declared_value` (minor units), `currency`
- `duty_amount`, `tax_amount` (minor units, computed)
- `reviewed_at`, `released_at`

**`duty_rules`** (config)
- `hs_code`, `country`, `duty_pct`, `tax_pct`, `effective_from`

**Relationships:** shipment `1—1` customs_declaration · declaration `N—N` documents (verification set).

---

### 1.7 Driver Module
**`driver_profiles`**
- `user_id` FK UQ, `driver_code` UQ
- `license_no`, `license_expiry`
- `vehicle_id` FK (current)
- `status` EN: on_duty | off_duty | on_trip
- `total_deliveries`, `on_time_rate`, `avg_rating`
- `current_lat`, `current_lng`, `location_updated_at`

**`driver_assignments`**
- `driver_id` FK, `shipment_id` FK, `route_id` FK
- `status` EN: assigned | accepted | picked_up | in_transit | delivered | failed
- `assigned_at`, `accepted_at`, `completed_at`

**`delivery_proofs`**
- `assignment_id` FK / `shipment_id` FK
- `stop_id` FK (nullable)
- `photo_url`, `signature_url`
- `receiver_name`, `note`
- `lat`, `lng`, `uploaded_at`

**Relationships:** driver `1—N` assignments · assignment `1—N` delivery_proofs · driver `1—1` vehicle (active).

---

### 1.8 Tracking Module
**`tracking_pings`** (high-volume, partition by month)
- `shipment_id` FK, IDX
- `source` EN: gps_device | driver_app | manual | carrier_api
- `lat`, `lng`, `speed_kmh`, `heading`
- `recorded_at` IDX

**`tracking_status`** (denormalized latest snapshot per shipment — for fast reads)
- `shipment_id` FK UQ
- `last_lat`, `last_lng`, `last_status`, `eta`, `progress_pct`, `updated_at`

**Relationships:** shipment `1—N` tracking_pings · shipment `1—1` tracking_status.

---

### 1.9 Finance Module
**`invoices`**
- `invoice_no` UQ, IDX
- `shipment_id` FK, `customer_id` FK
- `amount`, `tax_amount`, `total` (minor units), `currency`
- `issued_at`, `due_at`
- `status` EN: draft | issued | partially_paid | paid | overdue | void
- `pdf_url` (Supabase Storage)

**`invoice_lines`**
- `invoice_id` FK, `description`, `qty`, `unit_price`, `line_total`, `tax_pct`

**`payments`**
- `payment_ref` UQ
- `invoice_id` FK, `customer_id` FK
- `amount` (minor units), `currency`
- `method` EN: card | bank_transfer | wallet | cash
- `gateway` EN: stripe | razorpay | manual
- `gateway_txn_id`
- `status` EN: initiated | succeeded | failed | refunded
- `paid_at`

**`revenue_reports`** (materialized/generated)
- `period`, `type` EN: monthly | quarterly | annual
- `revenue`, `expenses`, `outstanding` (minor units)
- `file_url`, `generated_at`

**Relationships:** shipment `1—1` invoice · invoice `1—N` invoice_lines · invoice `1—N` payments (partial payments).

---

### 1.10 Insurance Module
**`policies`**
- `policy_no` UQ
- `shipment_id` FK, `customer_id` FK
- `coverage_amount` (minor units), `currency`
- `premium` (minor units)
- `status` EN: requested | quoted | approved | active | rejected | expired | claimed
- `provider`, `provider_ref` (partner API)
- `effective_from`, `effective_to`

**`insurance_claims`**
- `policy_id` FK, `reason`, `claim_amount`
- `status` EN: filed | under_review | approved | rejected | paid
- `filed_at`, `resolved_at`

**Relationships:** shipment `1—1` policy · policy `1—N` claims.

---

### 1.11 Support Module
**`tickets`**
- `ticket_no` UQ, IDX
- `customer_id` FK, `shipment_id` FK (nullable)
- `subject`, `description`
- `category` EN: delivery | billing | damage | documentation | general
- `priority` EN: low | medium | high | urgent
- `status` EN: open | assigned | investigating | resolved | closed | reopened
- `assigned_agent_id` FK → users (nullable)
- `sla_due_at`, `resolved_at`
- `csat_rating` (1–5, nullable)

**`ticket_messages`**
- `ticket_id` FK, `sender_id` FK, `body`, `attachments` (jsonb), `is_internal` bool, `created_at`

**Relationships:** ticket `1—N` ticket_messages · ticket `N—1` agent · ticket `N—1` shipment.

---

### 1.12 Notifications & Audit (system)
**`notifications`**
- `user_id` FK, `channel` EN: email | sms | in_app
- `template_key`, `payload` (jsonb)
- `status` EN: queued | sent | failed | read
- `sent_at`

**`audit_logs`**
- `actor_id` FK, `action`, `entity_type`, `entity_id`
- `before` (jsonb), `after` (jsonb)
- `ip`, `user_agent`, `created_at` IDX

---

### 1.13 Entity Relationship Summary
- **Customer** `1—N` Shipment `1—N` ShipmentItem
- **Shipment** `1—1` Invoice `1—N` Payment
- **Shipment** `1—1` CustomsDeclaration · `1—1` Policy (optional)
- **Shipment** `N—1` Container · `N—1` Vehicle · `N—1` Route `1—N` RouteStop
- **Shipment** `1—N` Document · `1—N` ShipmentEvent · `1—N` TrackingPing
- **Driver** `1—N` DriverAssignment `1—N` DeliveryProof
- **Warehouse** `1—N` WarehouseSlot `1—N` InventoryItem
- **Customer** `1—N` Ticket `1—N` TicketMessage
- **Branch** `1—N` Users / Shipments / Containers / Vehicles
- **Role** `N—N` Permission

---

## 2. Feature List (production-level, by role)

> Each role section lists: **Features · Validations · Edge cases · Security.**

### 2.1 Customer
**Features**
- Register / login / forgot-password (Supabase Auth, email verification).
- Request freight quote (origin, destination, mode, cargo, weight/volume → instant estimate).
- Create shipment from accepted quote; auto-generate tracking number.
- Upload documents (invoice, packing list, etc.) with type tagging.
- Make payment via gateway; view payment status.
- Live track shipment on map + status timeline.
- Download invoices (PDF) and view history.
- Request insurance and view policy.
- Raise & follow support tickets, rate resolution (CSAT).

**Validations**
- Weight > 0, volume > 0, declared value ≥ 0; origin ≠ destination.
- Hazardous cargo requires hazmat doc upload before booking.
- Payment amount must equal invoice total; currency must match.
- File uploads ≤ 10 MB, allowed mime (pdf/jpg/png).

**Edge cases**
- Quote expired before booking → force re-quote.
- Payment succeeds but webhook delayed → idempotent reconciliation, show "processing".
- Duplicate booking (double-submit) → idempotency key on create.
- Partial payment → invoice `partially_paid`, shipment stays `on_hold`.

**Security**
- A customer can read/write only **their own** rows (RLS on `customer_id = auth.uid()`).
- No access to internal cost/margin fields.
- Rate-limit quote and ticket creation.

---

### 2.2 Logistics Manager
**Features**
- Review queue of new bookings; approve / reject / put on hold.
- Assign route (Google Maps optimization), container, vehicle, driver.
- Container load planning (weight/volume capacity checks).
- Monitor live deliveries on a map; update status; flag exceptions.
- Manage fleet (vehicles) and container pool.

**Validations**
- Cannot assign vehicle whose `capacity_kg` < shipment weight.
- Cannot assign a container already `sealed`/`in_transit`.
- Route must have ≥ 1 stop; driver must be `on_duty` and license not expired.
- Status transitions must follow allowed state machine (no skipping `customs_review` for international).

**Edge cases**
- Driver rejects assignment → auto-return to assignment pool + notify.
- Vehicle breaks down mid-route → reassign, preserve event history.
- Over-capacity consolidation → block + suggest split.

**Security**
- Scoped to `branch_id`; cannot edit finance/customs fields.
- All status changes audited with actor.

---

### 2.3 Warehouse Manager
**Features**
- Check-in received shipments (condition assessment).
- Generate & print barcodes; scan to put-away.
- Allocate storage slots; update inventory.
- Mark "ready for dispatch"; load cargo; confirm dispatch.
- Inventory tracking, low-stock alerts, warehouse analytics (throughput, utilization).

**Validations**
- Barcode unique; slot capacity not exceeded.
- Cannot dispatch before customs `released` (international) and logistics approval.
- Damaged check-in requires note + photo.

**Edge cases**
- Slot full → suggest alternate slot.
- Partial receipt → flag discrepancy vs manifest.
- Re-scan duplicate barcode → reject with message.

**Security**
- Scoped to warehouse/branch; read-only on customer PII beyond what's needed.

---

### 2.4 Customs Officer
**Features**
- Review queue of shipments pending clearance.
- Verify documents (approve/reject each).
- Import/export verification; HS-code validation.
- Duty & tax calculation (rule engine).
- Approve & release shipment, or request more docs / reject.

**Validations**
- All mandatory docs present & verified before approval.
- HS code must exist in `duty_rules` for the country.
- Duty/tax recomputed server-side (never trusted from client).

**Edge cases**
- Missing certificate of origin → `docs_requested`, notify customer.
- Value mismatch between declaration and invoice → flag for manual review.
- Rejected clearance → shipment `on_hold`, customer notified with reason.

**Security**
- Customs-only fields; cannot alter pricing/finance.
- Every approval/rejection audited.

---

### 2.5 Driver (mobile app)
**Features**
- View assigned deliveries & route.
- GPS navigation (Google Maps) with turn-by-turn.
- Accept assignment, pickup cargo, update status per stop.
- Capture proof of delivery (photo + signature + receiver name).
- Offline status queue with sync.

**Validations**
- Proof required before marking `delivered`.
- Geofence check: status `picked_up`/`delivered` only near stop coords (tolerance).
- Photo mandatory; signature optional per config.

**Edge cases**
- No network → queue updates locally, sync when online (idempotent).
- Failed delivery (recipient absent) → reason code, reschedule.
- GPS drift → smoothing; ignore pings with implausible speed.

**Security**
- Driver sees only own assignments; location shared only while `on_trip`.
- Token-scoped uploads to Supabase Storage.

---

### 2.6 Finance Manager
**Features**
- Auto-generate invoice on shipment completion.
- Track payments, outstanding & overdue invoices.
- Verify/record manual payments; issue refunds.
- Revenue reports (monthly/quarterly/annual), top clients, financial analytics.
- Export reports (PDF/CSV).

**Validations**
- Invoice total = Σ line items + tax; immutable once `issued` (void + reissue instead).
- Refund ≤ amount paid.
- Cannot mark `paid` without a `succeeded` payment record.

**Edge cases**
- Currency mismatch → block / convert with logged FX rate.
- Overpayment → credit note.
- Duplicate gateway webhook → idempotent by `gateway_txn_id`.

**Security**
- Finance role only; full read on invoices/payments, no operational write to shipments beyond billing status.

---

### 2.7 Support Executive
**Features**
- Ticket inbox with filters & SLA timers.
- Assign/claim tickets; threaded conversation (public + internal notes).
- Link tickets to shipments; escalate.
- Resolve & close; capture customer feedback (CSAT).

**Validations**
- SLA due computed from priority; status flow enforced.
- Cannot close without resolution note.

**Edge cases**
- Reopened ticket within X days → same agent, reset SLA.
- Bulk import / spam → rate limit + dedupe.

**Security**
- Agents see tickets in their queue/branch; internal notes hidden from customers.

---

### 2.8 Super Admin
**Features**
- User management (create/invite/suspend), role & permission management.
- Branch management.
- System-wide operations monitoring & analytics.
- View all reports; full audit-log access; access control matrix.

**Validations**
- Cannot delete the last admin; cannot self-suspend.
- Role changes re-evaluate permissions immediately.

**Edge cases**
- Orphaned data on user delete → soft-delete + reassign.
- Permission escalation attempts → blocked + audited.

**Security**
- Full access; **all** admin actions audited; sensitive actions may require re-auth.

---

### 2.9 Global Security Requirements
- **AuthN:** Supabase Auth JWT; refresh rotation; email verification; optional MFA for staff.
- **AuthZ:** RBAC via Postgres RLS + FastAPI dependency guards (defense in depth).
- **Data access:** branch + ownership scoping on every query; principle of least privilege.
- **Transport:** HTTPS only; HSTS; secure cookies.
- **Input:** server-side validation (Pydantic) on every endpoint; parametrized queries (no raw SQL injection).
- **Files:** signed URLs, mime/size checks, virus scan hook on upload.
- **Secrets:** env-managed; service-role key never exposed to frontend.
- **Rate limiting** on auth, quote, ticket, payment endpoints.
- **Audit logging** on all sensitive writes; immutable append-only.
- **PII:** encrypted at rest (Supabase), masked in logs.

---

## 3. Dashboard Views (screen-level)

### 3.1 Customer Portal
- **Widgets/cards:** Active shipments (status chips + mini-map), Pending payments, Recent quotes, Open tickets, Insurance policies, Notifications feed.
- **Filters/search:** by tracking number, date range, mode, status.
- **Actions:** `Get Quote`, `Create Shipment`, `Upload Docs`, `Pay Now`, `Track`, `Download Invoice`, `Request Insurance`, `New Ticket`.

### 3.2 Logistics Dashboard
- **Widgets:** New bookings queue, Shipments by status (kanban), Live fleet map, Container utilization, Vehicle availability, Exceptions/alerts.
- **Filters/search:** branch, mode, priority, status, date, assigned manager.
- **Actions:** `Approve`/`Reject`/`Hold`, `Assign Route`, `Assign Container`, `Assign Vehicle`, `Assign Driver`, `Update Status`, `View on Map`.

### 3.3 Warehouse Dashboard
- **Widgets:** Inbound today, Pending check-ins, Storage utilization by zone, Low-stock alerts, Tasks board, Throughput chart, Ready-to-dispatch.
- **Filters/search:** barcode/SKU, zone, status, supplier, date.
- **Actions:** `Check-In`, `Generate Barcode`, `Scan`, `Allocate Slot`, `Mark Ready`, `Load`, `Dispatch`.

### 3.4 Driver App (mobile)
- **Widgets:** Today's route map, Stop list (ordered), Current task card, Earnings/stats, Status toggle (on/off duty).
- **Filters/search:** by stop status; date.
- **Actions:** `Accept`, `Navigate`, `Pickup`, `Update Status`, `Capture POD (photo/signature)`, `Report Issue`.

### 3.5 Finance Dashboard
- **Widgets:** Revenue (MTD/QTD/YTD), Outstanding & overdue, Payments feed, Top clients, Invoice aging, Revenue vs expenses chart.
- **Filters/search:** invoice no, client, status, date range, currency.
- **Actions:** `Generate Invoice`, `Record Payment`, `Verify Payment`, `Refund`, `Export Report`, `Send Reminder`.

### 3.6 Customs Dashboard
- **Widgets:** Pending clearance queue, Docs awaiting verification, Duty calculation panel, Released today, Rejected/holds.
- **Filters/search:** declaration no, direction (import/export), status, country, date.
- **Actions:** `Verify Doc`, `Calculate Duty`, `Approve`, `Request Docs`, `Reject`, `Release`.

### 3.7 Support Dashboard
- **Widgets:** Ticket inbox (with SLA timers), By status/priority, My assigned, Unassigned queue, CSAT summary, Response-time chart.
- **Filters/search:** ticket no, customer, category, priority, status, agent.
- **Actions:** `Assign/Claim`, `Reply`, `Add Internal Note`, `Escalate`, `Resolve`, `Close`, `Link Shipment`.

### 3.8 Super Admin Dashboard
- **Widgets:** System KPIs (shipments, revenue, active users), Operations by branch, User/role summary, Audit-log feed, System health.
- **Filters/search:** user, role, branch, action type, date.
- **Actions:** `Add/Invite User`, `Edit Role`, `Manage Permissions`, `Add Branch`, `Suspend User`, `View Audit Log`, `Export`.

---

## 4. API / Backend Outline (FastAPI, REST)

> Base: `/api/v1`. All endpoints (except auth/public) require `Authorization: Bearer <jwt>`.
> Conventions: list endpoints support `?page&limit&sort&filter`; responses are JSON; errors use RFC-7807 problem format.

### 4.1 `/auth`
- `POST /auth/register` — create customer account.
- `POST /auth/login` — issue session (Supabase).
- `POST /auth/refresh` — rotate token.
- `POST /auth/forgot-password` / `POST /auth/reset-password`.
- `GET /auth/me` — current user + role + permissions.

### 4.2 `/quotes`
- `POST /quotes` — request quote (returns priced estimate).
- `GET /quotes` / `GET /quotes/{id}` — list/detail.
- `POST /quotes/{id}/accept` — accept → eligible for booking.

### 4.3 `/shipments`
- `POST /shipments` — create from quote (idempotent).
- `GET /shipments` / `GET /shipments/{id}`.
- `PATCH /shipments/{id}/status` — guarded state transition.
- `POST /shipments/{id}/documents` — upload doc.
- `POST /shipments/{id}/items` — add cargo items.
- `GET /shipments/{id}/events` — status timeline.
- **Logistics:** `POST /shipments/{id}/approve`, `/reject`, `/hold`, `/assign-route`, `/assign-container`, `/assign-vehicle`, `/assign-driver`.

### 4.4 `/tracking`
- `GET /tracking/{tracking_number}` — public-ish status snapshot.
- `GET /shipments/{id}/tracking` — full ping history (auth).
- `POST /tracking/ping` — driver/device location ingest.
- `GET /tracking/{id}/eta` — recompute ETA (Maps).

### 4.5 `/warehouse`
- `POST /warehouse/checkin` — receive shipment.
- `POST /warehouse/barcode` — generate barcode.
- `POST /warehouse/scan` — scan put-away/pick.
- `GET /warehouse/inventory` · `GET /warehouse/slots`.
- `POST /warehouse/slots/{id}/allocate`.
- `POST /warehouse/{shipment_id}/dispatch`.

### 4.6 `/logistics`
- `GET /containers` · `POST /containers` · `PATCH /containers/{id}`.
- `GET /vehicles` · `POST /vehicles` · `PATCH /vehicles/{id}`.
- `GET /routes` · `POST /routes/optimize` (Maps) · `GET /routes/{id}`.

### 4.7 `/customs`
- `GET /customs/declarations` — pending queue.
- `GET /customs/declarations/{id}`.
- `POST /customs/declarations/{id}/verify-doc`.
- `POST /customs/declarations/{id}/calculate-duty`.
- `POST /customs/declarations/{id}/approve` / `/reject` / `/request-docs` / `/release`.

### 4.8 `/driver`
- `GET /driver/assignments` — my deliveries.
- `POST /driver/assignments/{id}/accept`.
- `PATCH /driver/assignments/{id}/status`.
- `POST /driver/assignments/{id}/pod` — proof of delivery upload.
- `POST /driver/location` — location update (batch supported).

### 4.9 `/invoices` & `/payments`
- `GET /invoices` · `GET /invoices/{id}` · `GET /invoices/{id}/pdf`.
- `POST /invoices` — generate (finance / auto).
- `POST /invoices/{id}/void`.
- `POST /payments` — initiate payment.
- `POST /payments/webhook` — gateway callback (idempotent).
- `POST /payments/{id}/refund`.
- `GET /reports/revenue` · `GET /reports/outstanding`.

### 4.10 `/insurance`
- `POST /insurance/request` — request policy.
- `POST /insurance/{id}/quote` — premium calc.
- `POST /insurance/{id}/approve`.
- `GET /policies` · `GET /policies/{id}`.
- `POST /policies/{id}/claim`.

### 4.11 `/tickets`
- `POST /tickets` · `GET /tickets` · `GET /tickets/{id}`.
- `POST /tickets/{id}/assign`.
- `POST /tickets/{id}/messages`.
- `PATCH /tickets/{id}/status`.
- `POST /tickets/{id}/feedback` — CSAT.

### 4.12 `/admin`
- `GET/POST /admin/users` · `PATCH /admin/users/{id}`.
- `GET/POST /admin/roles` · `PATCH /admin/roles/{id}/permissions`.
- `GET/POST /admin/branches`.
- `GET /admin/audit-logs`.
- `GET /admin/analytics`.

### 4.13 `/notifications`
- `GET /notifications` — in-app feed.
- `PATCH /notifications/{id}/read`.
- (Internal) enqueue via service layer, not public.

---

## 5. Tech Notes (implementation)

### 5.1 Stack mapping
- **Frontend — Next.js:** App Router; server components for dashboards, client components for maps/realtime. Supabase JS client for auth session + realtime subscriptions. Driver app as a PWA (installable, offline-capable) or React Native if native is required.
- **Backend — FastAPI:** Pydantic models for request/response validation; dependency-injected auth guard that verifies Supabase JWT and loads role/branch; service layer per module; SQLAlchemy or `supabase-py`/`asyncpg` for DB access; `python-jose` for JWT.
- **Database — Supabase/Postgres:** RLS policies per table; `auth.users` as identity source; Storage buckets for documents/POD/invoices; Realtime for live tracking & ticket updates; Postgres functions/triggers for `updated_at`, audit, and barcode/reference sequences.

### 5.2 Background jobs / async work
Use a task queue (**Celery + Redis**, or Supabase Edge Functions / `pg_cron` for lighter needs):
- **Notifications:** send SMS/Email on status changes, payment, ticket updates (queued, retriable).
- **Tracking polls:** ingest GPS pings, recompute ETA from Google Maps, update `tracking_status` snapshot.
- **Invoice generation:** render PDF on shipment completion; store in Supabase Storage.
- **Report generation:** nightly revenue/outstanding aggregation → `revenue_reports`.
- **SLA timers:** escalate overdue tickets; mark invoices `overdue`.
- **Reconciliation:** match delayed payment webhooks; retry failed notifications.
- **Insurance partner sync:** poll/await partner API for policy approval.

### 5.3 Integration points
- **Google Maps API:** route optimization (Directions/Distance Matrix), geocoding, live tracking polylines, ETA. Server-side key for backend calls; restricted browser key for map display.
- **SMS + Email gateway:** e.g. Twilio (SMS) + SendGrid/SES (email); templated, queued via background jobs.
- **Payment gateway:** Stripe / Razorpay — `POST /payments` to create intent, webhook to confirm (idempotent by `gateway_txn_id`).
- **Insurance partner API:** premium quote + policy issuance; store `provider_ref`.
- **Barcode:** generate Code-128/QR server-side; store value + render label PDF.

### 5.4 Data & integrity notes
- Enforce **shipment state machine** in the service layer (table of allowed transitions) — never trust client.
- **Idempotency keys** on create-shipment and payment endpoints.
- **Money** in integer minor units + currency everywhere; FX rate logged on conversion.
- **Soft deletes** (`deleted_at`) for users/shipments to preserve audit & references.
- Index hot paths: `tracking_number`, `invoice_no`, `barcode`, `shipment_id` FKs, `tracking_pings(recorded_at)`.
- Partition `tracking_pings` by month for volume.

### 5.5 Suggested repo layout (backend)
```
app/
  core/        # config, security, deps (auth guard, rbac)
  models/      # SQLAlchemy / pydantic schemas
  modules/
    auth/  quotes/  shipments/  tracking/  warehouse/
    logistics/  customs/  driver/  finance/  insurance/
    tickets/  admin/  notifications/
  workers/     # celery tasks
  main.py
```

---

## 6. Adapting this document
Change the directive line *"Using the above workflows and context…"* to retarget the same source:
- **"Generate a BRD"** → reframe Sections 1–3 as business requirements with goals, stakeholders, success metrics.
- **"Generate detailed database schema only"** → expand Section 1 into full DDL (column types, constraints, indexes, RLS policies).
- **"Generate UI wireframe descriptions only"** → expand Section 3 into per-screen layout, component, and interaction specs.

---
*End of specification.*
