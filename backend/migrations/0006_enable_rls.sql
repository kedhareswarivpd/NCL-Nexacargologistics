-- =====================================================================
-- Migration 0006 — Re-enable Row-Level Security for production
--
-- Reverses 0002_disable_rls.sql. Each table gets a policy that allows
-- the service-role (used by FastAPI) full access, while the anon role
-- is restricted to public data only.
--
-- Run this migration before going to production.
-- =====================================================================

-- ------------------------------------------------ Re-enable RLS on all tables
do $$
declare t text;
begin
  foreach t in array array[
    'profiles','roles','branches','quotes','shipments','shipment_status_history','documents',
    'vehicles','routes','containers','deliveries','warehouses','inventory_items',
    'warehouse_tasks','expenses','invoices','payments','customs_entries','insurance_policies',
    'support_tickets','ticket_messages','notifications','audit_logs','reviews'
  ] loop
    execute format('alter table public.%I enable row level security;', t);
    -- Service role bypasses RLS by default in Supabase (no policy needed).
    -- Deny all access to anon/authenticated roles unless a specific policy grants it.
    execute format(
      'drop policy if exists "deny_all_%s" on public.%I;', t, t
    );
  end loop;
end $$;

-- ------------------------------------------------ profiles: users see/edit only their own row
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

-- ------------------------------------------------ notifications: users see only their own
create policy "notifications_select_own" on public.notifications
  for select using (auth.uid() = user_id);

create policy "notifications_update_own" on public.notifications
  for update using (auth.uid() = user_id);

-- ------------------------------------------------ reviews: public read, authenticated insert
create policy "reviews_select_all" on public.reviews
  for select using (true);

create policy "reviews_insert_auth" on public.reviews
  for insert with check (auth.uid() is not null);

-- ------------------------------------------------ support_tickets: customers see their own
create policy "tickets_select_own" on public.support_tickets
  for select using (auth.uid() = customer_id);

create policy "ticket_messages_select_own" on public.ticket_messages
  for select using (
    exists (
      select 1 from public.support_tickets t
      where t.id = ticket_id and t.customer_id = auth.uid()
    )
  );

-- ------------------------------------------------ quotes/shipments: customers see their own
create policy "quotes_select_own" on public.quotes
  for select using (auth.uid() = customer_id);

create policy "shipments_select_own" on public.shipments
  for select using (auth.uid() = customer_id);

-- ------------------------------------------------ invoices/payments: customers see their own
create policy "invoices_select_own" on public.invoices
  for select using (auth.uid() = customer_id);

create policy "payments_select_own" on public.payments
  for select using (auth.uid() = customer_id);

-- ------------------------------------------------ insurance: customers see their own
create policy "insurance_select_own" on public.insurance_policies
  for select using (auth.uid() = customer_id);
