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
    'support_tickets','ticket_messages','audit_logs','driver_tasks'
  ] loop
    execute format('drop table if exists public.%I cascade;', t);
  end loop;
end $$;

-- ------------------------------------------------ roles
create table if not exists public.roles (
  id          uuid primary key default gen_random_uuid(),
  key         text unique not null,
  label       text not null,
  description text,
  is_system   boolean not null default false,
  created_at  timestamptz default now()
);

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
create index if not exists idx_profiles_branch on public.profiles(branch_id);
create index if not exists idx_profiles_status on public.profiles(status);

-- Add FK constraint for branch_id (if not already present)
do $$
begin
  if not exists (
    select 1 from information_schema.table_constraints
    where constraint_name = 'profiles_branch_id_fkey'
    and table_name = 'profiles'
  ) then
    alter table public.profiles
      add constraint profiles_branch_id_fkey foreign key (branch_id) references public.branches(id) on delete set null;
  end if;
end $$;

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

create index if not exists idx_branches_status on public.branches(status);

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
  driver_id   uuid references public.profiles(id) on delete set null,
  location    text,
  capacity    text,
  shipment_id uuid references public.shipments(id) on delete set null,
  created_at  timestamptz default now()
);
create index if not exists idx_vehicles_driver on public.vehicles(driver_id);
create index if not exists idx_vehicles_status on public.vehicles(status);

create table public.routes (
  id           uuid primary key default gen_random_uuid(),
  route_code   text unique not null,
  origin       text not null,
  destination  text not null,
  distance     text,
  duration     text,
  status       text not null default 'Active',
  driver_id    uuid references public.profiles(id) on delete set null,
  vehicle_id   uuid references public.vehicles(id) on delete set null,
  shipment_id  uuid references public.shipments(id) on delete set null,
  created_at   timestamptz default now()
);
create index if not exists idx_routes_driver on public.routes(driver_id);
create index if not exists idx_routes_vehicle on public.routes(vehicle_id);

create table public.containers (
  id           uuid primary key default gen_random_uuid(),
  container_no text unique not null,
  type         text not null,
  status       text not null default 'Available',
  location     text,
  shipment_id  uuid references public.shipments(id) on delete set null,
  capacity     text,
  created_at   timestamptz default now()
);
create index if not exists idx_containers_status on public.containers(status);

create table public.deliveries (
  id            uuid primary key default gen_random_uuid(),
  delivery_code text unique not null,
  shipment_id   uuid references public.shipments(id) on delete cascade,
  driver_id     uuid references public.profiles(id) on delete set null,
  route_id      uuid references public.routes(id) on delete set null,
  vehicle_id    uuid references public.vehicles(id) on delete set null,
  status        text not null default 'Pending',
  location      text,
  progress      int default 0 check (progress between 0 and 100),
  eta           text,
  lat           double precision,
  lng           double precision,
  proof_url     text,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);
create index if not exists idx_deliveries_shipment on public.deliveries(shipment_id);
create index if not exists idx_deliveries_driver on public.deliveries(driver_id);
create index if not exists idx_deliveries_status on public.deliveries(status);

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
  warehouse_id uuid not null references public.warehouses(id) on delete cascade,
  sku          text not null,
  name         text not null,
  category     text,
  zone         text,
  qty          int default 0 check (qty >= 0),
  reorder_at   int check (reorder_at >= 0),
  status       text default 'OK' check (status in ('OK','Low','Out')),
  shipment_id  uuid references public.shipments(id) on delete set null,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);
create index if not exists idx_inventory_warehouse on public.inventory_items(warehouse_id);
create index if not exists idx_inventory_sku on public.inventory_items(sku);
create index if not exists idx_inventory_status on public.inventory_items(status);

create table public.warehouse_tasks (
  id           uuid primary key default gen_random_uuid(),
  warehouse_id uuid references public.warehouses(id) on delete cascade,
  task_type    text not null default 'inbound' check (task_type in ('inbound','outbound','putaway','pick','count')),
  shipment_id  uuid references public.shipments(id) on delete set null,
  reference    text,
  description  text,
  status       text not null default 'Pending' check (status in ('Pending','In Progress','Done')),
  assigned_to  uuid references public.profiles(id) on delete set null,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);
create index if not exists idx_warehouse_tasks_warehouse on public.warehouse_tasks(warehouse_id);
create index if not exists idx_warehouse_tasks_assigned on public.warehouse_tasks(assigned_to);
create index if not exists idx_warehouse_tasks_status on public.warehouse_tasks(status);

-- ------------------------------------------------ finance
create table if not exists public.expenses (
  id           uuid primary key default gen_random_uuid(),
  category     text not null default 'Operational',
  amount       double precision not null default 0 check (amount >= 0),
  currency     text not null default 'USD',
  branch_id    uuid references public.branches(id) on delete set null,
  description  text,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);
create index if not exists idx_expenses_branch on public.expenses(branch_id);

create table public.invoices (
  id          uuid primary key default gen_random_uuid(),
  invoice_no  text unique not null,
  customer_id uuid references public.profiles(id) on delete restrict,
  shipment_id uuid references public.shipments(id) on delete set null,
  amount      double precision not null default 0 check (amount >= 0),
  tax         double precision not null default 0 check (tax >= 0),
  total       double precision not null default 0 check (total >= 0),
  currency    text not null default 'USD',
  status      text not null default 'Pending' check (status in ('Pending','Paid','Overdue','Cancelled')),
  issue_date  text,
  due_date    text,
  description text,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);
create index if not exists idx_invoices_customer on public.invoices(customer_id);
create index if not exists idx_invoices_status on public.invoices(status);

create table public.payments (
  id          uuid primary key default gen_random_uuid(),
  payment_ref text unique not null,
  invoice_id  uuid references public.invoices(id) on delete restrict,
  customer_id uuid references public.profiles(id) on delete restrict,
  amount      double precision not null default 0 check (amount >= 0),
  currency    text not null default 'USD',
  method      text check (method in ('card','bank_transfer','wallet','cash')),
  status      text not null default 'pending' check (status in ('pending','completed','failed','refunded')),
  paid_at     text,
  created_at  timestamptz default now()
);
create index if not exists idx_payments_invoice on public.payments(invoice_id);
create index if not exists idx_payments_customer on public.payments(customer_id);

-- ------------------------------------------------ customs
create table public.customs_entries (
  id             uuid primary key default gen_random_uuid(),
  entry_ref      text unique not null,
  shipment_id    uuid references public.shipments(id) on delete cascade,
  direction      text not null default 'import' check (direction in ('import','export')),
  status         text not null default 'pending' check (status in ('pending','under_review','cleared','held','rejected')),
  hs_code        text,
  declared_value double precision check (declared_value >= 0),
  duty_amount    double precision check (duty_amount >= 0),
  currency       text not null default 'USD',
  reviewed_by    uuid references public.profiles(id) on delete set null,
  notes          text,
  created_at     timestamptz default now(),
  updated_at     timestamptz default now()
);
create index if not exists idx_customs_shipment on public.customs_entries(shipment_id);
create index if not exists idx_customs_status on public.customs_entries(status);

-- ------------------------------------------------ insurance
create table public.insurance_policies (
  id              uuid primary key default gen_random_uuid(),
  policy_ref      text unique not null,
  shipment_id     uuid references public.shipments(id) on delete set null,
  customer_id     uuid references public.profiles(id) on delete restrict,
  coverage_amount double precision check (coverage_amount >= 0),
  premium         double precision check (premium >= 0),
  currency        text not null default 'USD',
  status          text not null default 'requested' check (status in ('requested','approved','active','rejected','expired')),
  valid_from      text,
  valid_until     text,
  notes           text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);
create index if not exists idx_insurance_shipment on public.insurance_policies(shipment_id);
create index if not exists idx_insurance_customer on public.insurance_policies(customer_id);

-- ------------------------------------------------ support
create table public.support_tickets (
  id          uuid primary key default gen_random_uuid(),
  ticket_ref  text unique not null,
  customer_id uuid references public.profiles(id) on delete restrict,
  subject     text not null,
  category    text check (category in ('delivery','billing','damage','documentation','general')),
  priority    text not null default 'medium' check (priority in ('low','medium','high','urgent')),
  status      text not null default 'open' check (status in ('open','in_progress','resolved','closed')),
  description text,
  assigned_to uuid references public.profiles(id) on delete set null,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);
create index if not exists idx_tickets_customer on public.support_tickets(customer_id);
create index if not exists idx_tickets_assigned on public.support_tickets(assigned_to);
create index if not exists idx_tickets_status on public.support_tickets(status);

create table public.ticket_messages (
  id         uuid primary key default gen_random_uuid(),
  ticket_id  uuid references public.support_tickets(id) on delete cascade,
  sender_id  uuid references public.profiles(id) on delete set null,
  body       text not null,
  created_at timestamptz default now()
);
create index if not exists idx_messages_ticket on public.ticket_messages(ticket_id);

-- ------------------------------------------------ reviews
create table if not exists public.reviews (
  id              uuid primary key default gen_random_uuid(),
  customer_id     uuid not null references public.profiles(id) on delete cascade,
  customer_name   varchar(255) not null,
  customer_company varchar(255),
  customer_role   varchar(100),
  rating          integer not null check (rating >= 1 and rating <= 5),
  title           varchar(255),
  comment         text not null,
  approved        boolean not null default false,
  created_at      timestamptz default now()
);

create index if not exists idx_reviews_customer on public.reviews(customer_id);
create index if not exists idx_reviews_approved on public.reviews(approved) where approved = true;

-- ------------------------------------------------ notifications + audit
create table public.notifications (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references public.profiles(id) on delete cascade,
  channel      text not null default 'in_app' check (channel in ('in_app','sms','email')),
  title        text,
  message      text not null,
  type         text check (type in ('shipment','invoice','ticket','system')),
  related_id   text,
  related_type text,
  read         boolean default false,
  status       text not null default 'queued' check (status in ('queued','sent','failed','read')),
  sent_at      text,
  created_at   timestamptz default now()
);
create index if not exists idx_notifications_user on public.notifications(user_id);
create index if not exists idx_notifications_read on public.notifications(user_id, read) where read = false;

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
    'roles','branches','quotes','shipments','shipment_status_history','documents',
    'vehicles','routes','containers','deliveries','warehouses','inventory_items',
    'warehouse_tasks','expenses','invoices','payments','customs_entries','insurance_policies',
    'support_tickets','ticket_messages','notifications','audit_logs','reviews'
  ] loop
    execute format('alter table public.%I enable row level security;', t);
  end loop;
end $$;
