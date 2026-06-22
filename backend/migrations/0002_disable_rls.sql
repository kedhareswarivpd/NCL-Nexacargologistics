-- 0002_disable_rls.sql
-- Disable Row-Level Security across all public tables (development convenience).
--
-- Rationale: business data is reached exclusively through the FastAPI backend,
-- which connects as the `postgres` role and bypasses RLS anyway. The frontend
-- only touches `profiles` directly; while iterating we disable RLS everywhere
-- (and drop the profiles own-row policies) so nothing blocks direct access.
--
-- RE-ENABLE before production. See schema.sql lines ~400-427 for the original
-- policies to restore.

do $$
declare t text;
begin
  foreach t in array array[
    'profiles','branches','quotes','shipments','shipment_status_history','documents',
    'vehicles','routes','containers','deliveries','warehouses','inventory_items',
    'warehouse_tasks','invoices','payments','customs_entries','insurance_policies',
    'support_tickets','ticket_messages','notifications','audit_logs'
  ] loop
    execute format('alter table public.%I disable row level security;', t);
  end loop;
end $$;

-- Drop the own-row policies on profiles (harmless once RLS is off, but keeps
-- the schema clean so re-enabling RLS later is an explicit, deliberate step).
drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;
drop policy if exists "profiles_insert_own" on public.profiles;
