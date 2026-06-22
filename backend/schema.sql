-- =====================================================================
-- NexaCargo Logistics — Authoritative Postgres schema (run in Supabase
-- SQL Editor, or via: psql "<DATABASE_URL>" -f schema.sql).
--
-- The FastAPI backend connects as the `postgres` pooler role (bypasses RLS)
-- and owns all business logic. The frontend only touches Supabase Auth and
-- its own `profiles` row.
--
-- ⚠️  DESTRUCTIVE: Section 0 DROPS the legacy prototype tables that were
--     created during early experimentation (incompatible shapes). `profiles`
--     and the Supabase `auth` schema are PRESERVED. Review before running on
--     any database that holds data you care about.
-- =====================================================================

-- ------------------------------------------------ 0. drop legacy prototype tables
do $$
declare t text;
begin
  foreach t in array array[
    'Register','Request Access','activity_logs','assigned_deliveries','barcodes',
    'container Management','customers','delivery_proofs','delivery_tracking','drivers',
    'gps_tracking','inventory','invoices','notifications','outstanding_reports','payments',
    'quotes','revenue_reports','roles_permissions','route_navigation','shipments',
    'storage_allocation','system_analytics','users','vehicle_assignments','vehicles',
    'warehouses','routes','containers','deliveries','shipment_status_history','documents',
    'branches','inventory_items','warehouse_tasks','customs_entries','insurance_policies',
    'support_tickets','ticket_messages','audit_logs'
  ] loop
    execute format('drop table if exists public.%I cascade;', t);
  end loop;
end $$;

-- ------------------------------------------------ profiles (preserve + extend)
-- NOTE: `id` is intentionally NOT a foreign key to auth.users. The backend can
-- register its own users (random UUID, password_hash set) alongside Supabase
-- users (id == auth.users.id, password_hash null). See drop-constraint below
-- for databases where the legacy FK still exists.
create table if not exists public.profiles (
  id            uuid primary key,
  email         text,
  name          text not null,
  role          text not null default 'customer',
  company       text,
  phone         text,
  department    text,
  branch_id     uuid,
  status        text not null default 'active',
  password_hash text,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- Add any columns missing from an older profiles table.
alter table public.profiles
  add column if not exists email         text,
  add column if not exists department    text,
  add column if not exists branch_id     uuid,
  add column if not exists status        text default 'active',
  add column if not exists password_hash text,
  add column if not exists updated_at    timestamptz default now();

-- Decouple profiles from auth.users so backend-registered users can exist
-- without a Supabase auth row. (Supabase-managed users still work; they just
-- lose ON DELETE CASCADE from auth.users.)
alter table public.profiles drop constraint if exists profiles_id_fkey;

-- Backfill email from auth.users where missing.
update public.profiles p
set email = u.email
from auth.users u
where p.id = u.id and (p.email is null or p.email = '');

create index if not exists idx_profiles_role on public.profiles(role);

-- Auto-create a profile whenever a Supabase auth user is created.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, name, role, company, phone)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'customer'),
    new.raw_user_meta_data->>'company',
    new.raw_user_meta_data->>'phone'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ------------------------------------------------ branches
create table public.branches (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  code        text unique not null,
  city        text,
  country     text,
  address     text,
  manager_id  uuid,
  status      text not null default 'active',
  created_at  timestamptz default now()
);

-- ------------------------------------------------ quotes
create table public.quotes (
  id            uuid primary key default gen_random_uuid(),
  quote_ref     text unique not null,
  customer_id   uuid references public.profiles(id),
  origin        text not null,
  destination   text not null,
  mode          text not null default 'sea',
  cargo_type    text,
  weight        double precision,
  volume        double precision,
  incoterm      text,
  amount        double precision,
  currency      text not null default 'USD',
  status        text not null default 'pending',
  valid_until   text,
  contact_name  text,
  contact_email text,
  contact_phone text,
  notes         text,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- ------------------------------------------------ shipments
create table public.shipments (
  id             uuid primary key default gen_random_uuid(),
  tracking_id    text unique not null,
  customer_id    uuid references public.profiles(id),
  quote_id       uuid references public.quotes(id),
  origin         text not null,
  destination    text not null,
  mode           text not null default 'sea',
  cargo_type     text,
  weight         text,
  volume         text,
  incoterm       text,
  status         text not null default 'Awaiting Dispatch',
  eta            text,
  customer_name  text,
  customer_email text,
  customer_phone text,
  value_amount   double precision,
  currency       text not null default 'USD',
  lat            double precision,
  lng            double precision,
  description    text,
  created_at     timestamptz default now(),
  updated_at     timestamptz default now()
);
create index idx_shipments_customer on public.shipments(customer_id);
create index idx_shipments_status on public.shipments(status);

create table public.shipment_status_history (
  id          uuid primary key default gen_random_uuid(),
  shipment_id uuid references public.shipments(id) on delete cascade,
  status      text not null,
  note        text,
  location    text,
  lat         double precision,
  lng         double precision,
  changed_by  uuid,
  changed_at  timestamptz default now()
);

create table public.documents (
  id          uuid primary key default gen_random_uuid(),
  shipment_id uuid references public.shipments(id) on delete cascade,
  doc_type    text not null default 'other',
  file_name   text not null,
  file_url    text,
  uploaded_by uuid,
  created_at  timestamptz default now()
);

-- ------------------------------------------------ logistics
create table public.vehicles (
  id          uuid primary key default gen_random_uuid(),
  vehicle_no  text unique not null,
  type        text not null,
  status      text not null default 'Available',
  driver_id   uuid references public.profiles(id),
  location    text,
  capacity    text,
  shipment_id uuid references public.shipments(id),
  created_at  timestamptz default now()
);

create table public.routes (
  id           uuid primary key default gen_random_uuid(),
  route_code   text unique not null,
  origin       text not null,
  destination  text not null,
  distance     text,
  duration     text,
  status       text not null default 'Active',
  driver_id    uuid references public.profiles(id),
  vehicle_id   uuid references public.vehicles(id),
  shipment_id  uuid references public.shipments(id),
  created_at   timestamptz default now()
);

create table public.containers (
  id           uuid primary key default gen_random_uuid(),
  container_no text unique not null,
  type         text not null,
  status       text not null default 'Available',
  location     text,
  shipment_id  uuid references public.shipments(id),
  capacity     text,
  created_at   timestamptz default now()
);

create table public.deliveries (
  id            uuid primary key default gen_random_uuid(),
  delivery_code text unique not null,
  shipment_id   uuid references public.shipments(id),
  driver_id     uuid references public.profiles(id),
  route_id      uuid references public.routes(id),
  vehicle_id    uuid references public.vehicles(id),
  status        text not null default 'Pending',
  location      text,
  progress      int default 0,
  eta           text,
  lat           double precision,
  lng           double precision,
  proof_url     text,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- ------------------------------------------------ warehouse
create table public.warehouses (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  code          text unique,
  location      text,
  manager_id    uuid references public.profiles(id),
  capacity      int,
  used_capacity int default 0,
  created_at    timestamptz default now()
);

create table public.inventory_items (
  id           uuid primary key default gen_random_uuid(),
  warehouse_id uuid not null references public.warehouses(id),
  sku          text not null,
  name         text not null,
  category     text,
  zone         text,
  qty          int default 0,
  reorder_at   int,
  status       text default 'OK',
  shipment_id  uuid references public.shipments(id),
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

create table public.warehouse_tasks (
  id           uuid primary key default gen_random_uuid(),
  warehouse_id uuid references public.warehouses(id),
  task_type    text not null default 'inbound',
  shipment_id  uuid references public.shipments(id),
  reference    text,
  description  text,
  status       text not null default 'Pending',
  assigned_to  uuid references public.profiles(id),
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- ------------------------------------------------ finance
create table public.invoices (
  id          uuid primary key default gen_random_uuid(),
  invoice_no  text unique not null,
  customer_id uuid references public.profiles(id),
  shipment_id uuid references public.shipments(id),
  amount      double precision not null default 0,
  tax         double precision not null default 0,
  total       double precision not null default 0,
  currency    text not null default 'USD',
  status      text not null default 'Pending',
  issue_date  text,
  due_date    text,
  description text,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

create table public.payments (
  id          uuid primary key default gen_random_uuid(),
  payment_ref text unique not null,
  invoice_id  uuid references public.invoices(id),
  customer_id uuid references public.profiles(id),
  amount      double precision not null default 0,
  currency    text not null default 'USD',
  method      text,
  status      text not null default 'pending',
  paid_at     text,
  created_at  timestamptz default now()
);

-- ------------------------------------------------ customs
create table public.customs_entries (
  id             uuid primary key default gen_random_uuid(),
  entry_ref      text unique not null,
  shipment_id    uuid references public.shipments(id),
  direction      text not null default 'import',
  status         text not null default 'pending',
  hs_code        text,
  declared_value double precision,
  duty_amount    double precision,
  currency       text not null default 'USD',
  reviewed_by    uuid references public.profiles(id),
  notes          text,
  created_at     timestamptz default now(),
  updated_at     timestamptz default now()
);

-- ------------------------------------------------ insurance
create table public.insurance_policies (
  id              uuid primary key default gen_random_uuid(),
  policy_ref      text unique not null,
  shipment_id     uuid references public.shipments(id),
  customer_id     uuid references public.profiles(id),
  coverage_amount double precision,
  premium         double precision,
  currency        text not null default 'USD',
  status          text not null default 'requested',
  valid_from      text,
  valid_until     text,
  notes           text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- ------------------------------------------------ support
create table public.support_tickets (
  id          uuid primary key default gen_random_uuid(),
  ticket_ref  text unique not null,
  customer_id uuid references public.profiles(id),
  subject     text not null,
  category    text,
  priority    text not null default 'medium',
  status      text not null default 'open',
  description text,
  assigned_to uuid references public.profiles(id),
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

create table public.ticket_messages (
  id         uuid primary key default gen_random_uuid(),
  ticket_id  uuid references public.support_tickets(id) on delete cascade,
  sender_id  uuid references public.profiles(id),
  body       text not null,
  created_at timestamptz default now()
);

-- ------------------------------------------------ notifications + audit
create table public.notifications (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references public.profiles(id),
  channel      text not null default 'in_app',
  title        text,
  message      text not null,
  type         text,
  related_id   text,
  related_type text,
  read         boolean default false,
  status       text not null default 'queued',
  sent_at      text,
  created_at   timestamptz default now()
);

create table public.audit_logs (
  id          uuid primary key default gen_random_uuid(),
  actor_id    uuid,
  actor_email text,
  action      text not null,
  entity_type text,
  entity_id   text,
  detail      text,
  created_at  timestamptz default now()
);

-- ------------------------------------------------ RLS
-- Only `profiles` is touched directly by the frontend; lock it to own-row.
-- Every other table is reached exclusively through the backend (postgres role,
-- which bypasses RLS), so RLS is enabled with no anon policies => deny direct
-- anon/authenticated access.
alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);

do $$
declare t text;
begin
  foreach t in array array[
    'branches','quotes','shipments','shipment_status_history','documents',
    'vehicles','routes','containers','deliveries','warehouses','inventory_items',
    'warehouse_tasks','invoices','payments','customs_entries','insurance_policies',
    'support_tickets','ticket_messages','notifications','audit_logs'
  ] loop
    execute format('alter table public.%I enable row level security;', t);
  end loop;
end $$;
