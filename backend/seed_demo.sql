-- seed_demo.sql — demo rows for the modules that were empty.
-- Idempotent via unique *_ref / sku guards. References existing shipments,
-- warehouses, and the e2e test profile so the UI shows realistic data.

-- Resolve handy ids once.
do $$
declare
  wh1 uuid := (select id from public.warehouses order by created_at limit 1);
  cust uuid := (select id from public.profiles where email = 'e2e_test@nexacargo.com' limit 1);
  s1 uuid := (select id from public.shipments order by created_at limit 1 offset 0);
  s2 uuid := (select id from public.shipments order by created_at limit 1 offset 1);
  s3 uuid := (select id from public.shipments order by created_at limit 1 offset 2);
begin

  -- ---------------- Inventory ----------------
  insert into public.inventory_items (warehouse_id, sku, name, category, zone, qty, reorder_at, status)
  select wh1, v.sku, v.name, v.category, v.zone, v.qty, v.reorder_at, v.status
  from (values
    ('SKU-1001','Electronics Pallet','Electronics','A-01',120,40,'OK'),
    ('SKU-1002','Textile Rolls','Textile','B-03',18,25,'Low'),
    ('SKU-1003','Pharma Cold Box','Pharma','C-COLD',60,30,'OK'),
    ('SKU-1004','Auto Spare Parts','Automotive','A-07',5,20,'Out')
  ) as v(sku,name,category,zone,qty,reorder_at,status)
  where wh1 is not null
    and not exists (select 1 from public.inventory_items i where i.sku = v.sku);

  -- ---------------- Warehouse tasks ----------------
  insert into public.warehouse_tasks (warehouse_id, task_type, reference, description, status)
  select wh1, v.task_type, v.reference, v.description, v.status
  from (values
    ('inbound','WT-INB-01','Receive & check-in inbound container','Pending'),
    ('putaway','WT-PUT-02','Putaway electronics pallet to A-01','In Progress'),
    ('pick','WT-PCK-03','Pick order for dispatch','Pending')
  ) as v(task_type,reference,description,status)
  where wh1 is not null
    and not exists (select 1 from public.warehouse_tasks t where t.reference = v.reference);

  -- ---------------- Customs ----------------
  insert into public.customs_entries (entry_ref, shipment_id, direction, status, hs_code, declared_value, duty_amount, currency)
  select v.entry_ref, v.sid, v.direction, v.status, v.hs_code, v.declared_value, v.duty_amount, 'USD'
  from (values
    ('CE-2026-001', s1, 'import', 'pending',      '8471.30', 12000.0,   960.0),
    ('CE-2026-002', s2, 'export', 'under_review', '6204.42',  4500.0,   270.0),
    ('CE-2026-003', s3, 'import', 'cleared',      '3004.90',  8000.0,   640.0)
  ) as v(entry_ref,sid,direction,status,hs_code,declared_value,duty_amount)
  where not exists (select 1 from public.customs_entries c where c.entry_ref = v.entry_ref);

  -- ---------------- Insurance ----------------
  insert into public.insurance_policies (policy_ref, shipment_id, customer_id, coverage_amount, premium, currency, status, valid_from, valid_until)
  select v.policy_ref, v.sid, cust, v.coverage, v.premium, 'USD', v.status, '2026-06-01', '2026-12-31'
  from (values
    ('POL-2026-001', s1, 50000.0, 450.0, 'active'),
    ('POL-2026-002', s2, 20000.0, 180.0, 'requested')
  ) as v(policy_ref,sid,coverage,premium,status)
  where not exists (select 1 from public.insurance_policies p where p.policy_ref = v.policy_ref);

  -- ---------------- Support tickets ----------------
  insert into public.support_tickets (ticket_ref, customer_id, subject, category, priority, status, description)
  select v.ticket_ref, cust, v.subject, v.category, v.priority, v.status, v.description
  from (values
    ('TKT-2026-001','Shipment delayed at customs','customs','high','open','My shipment has been stuck in customs for 3 days.'),
    ('TKT-2026-002','Invoice amount mismatch','billing','medium','in_progress','Invoice total does not match the quoted price.'),
    ('TKT-2026-003','Tracking page not updating','tracking','low','resolved','Live tracking was frozen yesterday.')
  ) as v(ticket_ref,subject,category,priority,status,description)
  where not exists (select 1 from public.support_tickets t where t.ticket_ref = v.ticket_ref);

  -- one message thread on the first ticket
  insert into public.ticket_messages (ticket_id, sender_id, body)
  select t.id, cust, 'Hello, any update on this? Thank you.'
  from public.support_tickets t
  where t.ticket_ref = 'TKT-2026-001'
    and not exists (select 1 from public.ticket_messages m where m.ticket_id = t.id);

  -- ---------------- Notifications ----------------
  insert into public.notifications (user_id, channel, title, message, type, status, read)
  select cust, 'in_app', v.title, v.message, v.type, 'sent', v.read
  from (values
    ('Shipment booked','Your shipment NX has been booked successfully.','shipment', false),
    ('Payment received','We received your payment of $1,650.','invoice', false),
    ('Customs update','Customs entry CE-2026-003 has been cleared.','shipment', true)
  ) as v(title,message,type,read)
  where cust is not null
    and not exists (select 1 from public.notifications n where n.user_id = cust and n.title = v.title);

  -- ---------------- Deliveries (driver app) ----------------
  insert into public.deliveries (delivery_code, shipment_id, driver_id, status, location, progress, eta, lat, lng)
  select v.code, v.sid, cust, v.status, v.location, v.progress, v.eta, v.lat, v.lng
  from (values
    ('DLV-2026-001', s1, 'In Transit', 'Near Dhaka Hub',   65, '2026-06-21 14:00', 23.8103, 90.4125),
    ('DLV-2026-002', s2, 'Pending',    'Awaiting pickup',   0, '2026-06-22 09:00', 23.7806, 90.4193)
  ) as v(code,sid,status,location,progress,eta,lat,lng)
  where cust is not null
    and not exists (select 1 from public.deliveries d where d.delivery_code = v.code);

end $$;
