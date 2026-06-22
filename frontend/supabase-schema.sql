-- =============================================
-- NexaCargo Logistics — Supabase Schema
-- Run this in your Supabase SQL Editor
-- =============================================

create table shipments (
  id uuid primary key default gen_random_uuid(),
  tracking_id text unique not null,
  origin text not null,
  destination text not null,
  status text not null default 'Awaiting Dispatch',
  eta text,
  weight text,
  cargo_type text,
  customer text,
  customer_email text,
  customer_phone text,
  lat double precision,
  lng double precision,
  created_at timestamptz default now()
);

create table containers (
  id uuid primary key default gen_random_uuid(),
  container_no text unique not null,
  type text not null,
  status text not null default 'Available',
  location text,
  shipment_id uuid references shipments(id),
  capacity text,
  created_at timestamptz default now()
);

create table routes (
  id uuid primary key default gen_random_uuid(),
  route_code text unique not null,
  origin text not null,
  destination text not null,
  distance text,
  duration text,
  status text not null default 'Active',
  driver text,
  vehicle text,
  created_at timestamptz default now()
);

create table deliveries (
  id uuid primary key default gen_random_uuid(),
  delivery_code text unique not null,
  shipment_id uuid references shipments(id),
  driver text not null,
  status text not null default 'Pending',
  location text,
  progress int default 0,
  eta text,
  lat double precision,
  lng double precision,
  created_at timestamptz default now()
);

create table vehicles (
  id uuid primary key default gen_random_uuid(),
  vehicle_no text unique not null,
  type text not null,
  status text not null default 'Available',
  driver text,
  location text,
  shipment_id uuid references shipments(id),
  created_at timestamptz default now()
);

-- Shipment status history
create table shipment_status_history (
  id uuid primary key default gen_random_uuid(),
  shipment_id uuid references shipments(id) on delete cascade,
  status text not null,
  note text,
  changed_at timestamptz default now()
);

-- Notifications table (SMS + Email queue)
create table notifications (
  id uuid primary key default gen_random_uuid(),
  channel text not null check (channel in ('sms', 'email')),
  recipient_name text not null,
  recipient_contact text not null,
  subject text,
  message text not null,
  status text not null default 'queued' check (status in ('queued', 'sent', 'failed')),
  related_id text,
  related_type text,
  sent_at timestamptz,
  created_at timestamptz default now()
);

-- Enable Realtime on key tables
alter publication supabase_realtime add table shipments;
alter publication supabase_realtime add table deliveries;
alter publication supabase_realtime add table notifications;

-- RLS for notifications
alter table notifications enable row level security;
create policy "Allow authenticated read" on notifications for select using (auth.role() = 'authenticated');
create policy "Allow authenticated insert" on notifications for insert with check (auth.role() = 'authenticated');

-- Sample Data

insert into shipments (tracking_id, origin, destination, status, eta, weight, cargo_type, customer, customer_email, customer_phone, lat, lng) values
  ('SHP-90421', 'Shanghai', 'Rotterdam', 'In Transit', '2d 4h', '18,000 kg', 'Electronics', 'Amazon EU', 'amazon@example.com', '+31612345678', 51.9244, 4.4777),
  ('SHP-90418', 'Dubai', 'Hamburg', 'Delayed', '5d 1h', '9,500 kg', 'Auto Parts', 'Otto Germany', 'otto@example.com', '+49612345678', 53.5753, 9.9947),
  ('SHP-90410', 'Singapore', 'Los Angeles', 'In Transit', '6d 12h', '3,200 kg', 'Textiles', 'Walmart MENA', 'walmart@example.com', '+12135550100', 34.0522, -118.2437),
  ('SHP-90405', 'New York', 'Mumbai', 'Awaiting Dispatch', '—', '6,000 kg', 'Pharma', 'Flipkart India', 'flipkart@example.com', '+912298765432', 19.0760, 72.8777),
  ('SHP-90399', 'Mumbai', 'London', 'Delivered', '—', '4,800 kg', 'Dry Goods', 'Noon UAE', 'noon@example.com', '+44712345678', 51.5074, -0.1278);

insert into containers (container_no, type, status, location, capacity) values
  ('CNTR-4401', 'FCL 40HQ', 'In Use', 'North Sea', '67 CBM'),
  ('CNTR-4398', 'FCL 20FT', 'In Use', 'Atlantic Ocean', '33 CBM'),
  ('CNTR-4395', 'LCL', 'Available', 'Singapore Port', '15 CBM'),
  ('CNTR-4390', 'FCL 40FT', 'Available', 'Dubai Depot', '60 CBM'),
  ('CNTR-4385', 'Reefer 20FT', 'Maintenance', 'Rotterdam WH', '28 CBM');

insert into routes (route_code, origin, destination, distance, duration, status, driver, vehicle) values
  ('RTE-2201', 'Shanghai', 'Rotterdam', '19,500 km', '25 days', 'Active', 'Elena Rodriguez', 'VESSEL-ORION'),
  ('RTE-2198', 'Dubai', 'Hamburg', '11,200 km', '14 days', 'Delayed', 'Marcus Chen', 'VESSEL-TITAN'),
  ('RTE-2195', 'Singapore', 'Los Angeles', '14,800 km', '18 days', 'Active', 'Sarah Jenkins', 'VESSEL-STAR'),
  ('RTE-2190', 'New York', 'Mumbai', '13,400 km', '20 days', 'Scheduled', 'James Wilson', 'TRUCK-082'),
  ('RTE-2185', 'London', 'Frankfurt', '820 km', '1 day', 'Completed', 'Sara M.', 'TRUCK-077');

insert into deliveries (delivery_code, driver, status, location, progress, eta, lat, lng) values
  ('DEL-8801', 'Elena Rodriguez', 'In Transit', 'North Sea', 72, 'May 24, 14:00', 56.1304, 3.4199),
  ('DEL-8798', 'Marcus Chen', 'Delayed', 'Atlantic Ocean', 45, 'May 28, 09:30', 35.6762, -22.1351),
  ('DEL-8795', 'Sarah Jenkins', 'In Transit', 'Indian Ocean', 30, 'May 21, 11:15', 7.8731, 80.7718),
  ('DEL-8790', 'James Wilson', 'Pending', 'New York Port', 5, 'May 30, 08:00', 40.7128, -74.0060),
  ('DEL-8785', 'Sara M.', 'Delivered', 'Frankfurt WH', 100, '—', 50.1109, 8.6821);

insert into vehicles (vehicle_no, type, status, driver, location) values
  ('VESSEL-ORION', 'Container Ship', 'In Use', 'Elena Rodriguez', 'North Sea'),
  ('VESSEL-TITAN', 'Bulk Carrier', 'In Use', 'Marcus Chen', 'Atlantic Ocean'),
  ('VESSEL-STAR', 'Container Ship', 'In Use', 'Sarah Jenkins', 'Indian Ocean'),
  ('TRUCK-082', 'Heavy Truck', 'Available', NULL, 'New York Hub'),
  ('TRUCK-077', 'Medium Truck', 'Available', NULL, 'London Depot'),
  ('TRUCK-091', 'Heavy Truck', 'Maintenance', NULL, 'Dubai Service Center');
