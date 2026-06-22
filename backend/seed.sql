-- =====================================================================
-- NexaCargo — optional demo seed data. Run AFTER schema.sql in Supabase.
-- Uses customer_name text (no auth users required). Safe to re-run-ish:
-- guarded by unique business keys with ON CONFLICT DO NOTHING.
-- =====================================================================

insert into public.branches (name, code, city, country) values
  ('Dhaka HQ', 'BR-DHK', 'Dhaka', 'Bangladesh'),
  ('Singapore Hub', 'BR-SIN', 'Singapore', 'Singapore'),
  ('Rotterdam Gateway', 'BR-RTM', 'Rotterdam', 'Netherlands')
on conflict (code) do nothing;

insert into public.shipments (tracking_id, origin, destination, mode, status, eta, weight, cargo_type, customer_name, lat, lng) values
  ('SHP-90421', 'Shanghai', 'Rotterdam', 'sea', 'In Transit', '2d 4h', '18,000 kg', 'Electronics', 'Amazon EU', 51.9244, 4.4777),
  ('SHP-90418', 'Dubai', 'Hamburg', 'sea', 'Delayed', '5d 1h', '9,500 kg', 'Auto Parts', 'Otto Germany', 53.5753, 9.9947),
  ('SHP-90410', 'Singapore', 'Los Angeles', 'sea', 'In Transit', '6d 12h', '3,200 kg', 'Textiles', 'Walmart MENA', 34.0522, -118.2437),
  ('SHP-90405', 'New York', 'Mumbai', 'air', 'Awaiting Dispatch', '-', '6,000 kg', 'Pharma', 'Flipkart India', 19.0760, 72.8777),
  ('SHP-90399', 'Mumbai', 'London', 'air', 'Delivered', '-', '4,800 kg', 'Dry Goods', 'Noon UAE', 51.5074, -0.1278)
on conflict (tracking_id) do nothing;

insert into public.containers (container_no, type, status, location, capacity) values
  ('CNTR-4401', 'FCL 40HQ', 'In Use', 'North Sea', '67 CBM'),
  ('CNTR-4398', 'FCL 20FT', 'In Use', 'Atlantic Ocean', '33 CBM'),
  ('CNTR-4395', 'LCL', 'Available', 'Singapore Port', '15 CBM'),
  ('CNTR-4390', 'FCL 40FT', 'Available', 'Dubai Depot', '60 CBM'),
  ('CNTR-4385', 'Reefer 20FT', 'Maintenance', 'Rotterdam WH', '28 CBM')
on conflict (container_no) do nothing;

insert into public.vehicles (vehicle_no, type, status, location, capacity) values
  ('VH-1201', 'Trailer', 'Available', 'Dhaka Depot', '24 t'),
  ('VH-1202', 'Box Truck', 'In Use', 'Singapore Hub', '10 t'),
  ('VH-1203', 'Reefer Truck', 'Available', 'Rotterdam', '12 t')
on conflict (vehicle_no) do nothing;

insert into public.routes (route_code, origin, destination, distance, duration, status) values
  ('RT-001', 'Shanghai', 'Rotterdam', '19,800 km', '28 d', 'Active'),
  ('RT-002', 'Singapore', 'Los Angeles', '14,100 km', '18 d', 'Active'),
  ('RT-003', 'Dhaka', 'Chattogram', '264 km', '6 h', 'Active')
on conflict (route_code) do nothing;

insert into public.warehouses (name, code, location, capacity, used_capacity) values
  ('Dhaka Central WH', 'WH-DHK', 'Gulshan, Dhaka', 10000, 6400),
  ('Singapore Bonded WH', 'WH-SIN', 'Jurong, Singapore', 25000, 18250)
on conflict (code) do nothing;
