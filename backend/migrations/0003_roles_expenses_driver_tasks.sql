-- 0003_roles_expenses_driver_tasks.sql
-- New tables backing the expanded API surface:
--   roles         -> Admin "role management" CRUD (/admin/roles)
--   expenses      -> Finance expenses / profit-loss reporting (/finance/expenses)
--   driver_tasks  -> Driver task board (/tasks, /drivers/{id}/tasks)
-- RLS is left disabled (see 0002) — backend reaches these via the postgres role.

create table if not exists public.roles (
  id          uuid primary key default gen_random_uuid(),
  key         text unique not null,
  label       text not null,
  description text,
  is_system   boolean not null default false,
  created_at  timestamptz default now()
);

create table if not exists public.expenses (
  id           uuid primary key default gen_random_uuid(),
  category     text not null,
  amount       double precision not null default 0,
  currency     text not null default 'USD',
  branch_id    uuid references public.branches(id),
  note         text,
  incurred_at  text,
  created_at   timestamptz default now()
);

create table if not exists public.driver_tasks (
  id           uuid primary key default gen_random_uuid(),
  driver_id    uuid references public.profiles(id),
  shipment_id  uuid references public.shipments(id),
  description  text not null,
  priority     text not null default 'Medium',   -- High|Medium|Low
  status       text not null default 'Pending',   -- Pending|In Progress|Completed
  due          text,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

create index if not exists idx_driver_tasks_driver on public.driver_tasks(driver_id);
create index if not exists idx_expenses_branch on public.expenses(branch_id);

alter table public.roles disable row level security;
alter table public.expenses disable row level security;
alter table public.driver_tasks disable row level security;

-- Seed the canonical system roles (idempotent).
insert into public.roles (key, label, description, is_system) values
  ('admin','Super Admin','Full system access', true),
  ('customer','Customer','Create shipments, track cargo', true),
  ('logistics','Logistics Manager','Manage shipments and routes', true),
  ('warehouse','Warehouse Manager','Inventory and storage', true),
  ('customs','Customs Officer','Clearance management', true),
  ('driver','Driver','Delivery operations', true),
  ('finance','Finance Manager','Billing and payments', true),
  ('support','Support Executive','Ticket management', true)
on conflict (key) do nothing;
