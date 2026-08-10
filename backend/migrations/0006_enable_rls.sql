-- 0006_enable_rls.sql
-- Re-enables Row-Level Security on all tables and creates security policies.
--
-- IDEMPOTENT: safe to run multiple times. Drops existing policies before
-- recreating them. Run AFTER 0004_reviews.sql (which creates the reviews table).

-- =====================================================
-- 1. Enable RLS on all tables
-- =====================================================

ALTER TABLE IF EXISTS profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS insurance_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS containers ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS customs_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS warehouse_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS shipment_status_history ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 2. Profiles table policies
-- =====================================================

DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
CREATE POLICY "Users can read own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Staff can read all profiles" ON profiles;
CREATE POLICY "Staff can read all profiles"
ON profiles FOR SELECT
USING (auth.role() = 'authenticated' AND (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'logistics', 'finance', 'warehouse', 'driver', 'support', 'customs'))
));

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admin can delete profiles" ON profiles;
CREATE POLICY "Admin can delete profiles"
ON profiles FOR DELETE
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- =====================================================
-- 3. Shipments table policies
-- =====================================================

DROP POLICY IF EXISTS "Customers can read own shipments" ON shipments;
CREATE POLICY "Customers can read own shipments"
ON shipments FOR SELECT
USING (
    customer_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'logistics', 'customs'))
);

DROP POLICY IF EXISTS "Staff can manage shipments" ON shipments;
CREATE POLICY "Staff can manage shipments"
ON shipments FOR ALL
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'logistics', 'customs')));

-- =====================================================
-- 4. Invoices table policies
-- =====================================================

DROP POLICY IF EXISTS "Finance can read all invoices" ON invoices;
CREATE POLICY "Finance can read all invoices"
ON invoices FOR SELECT
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'finance')));

DROP POLICY IF EXISTS "Customers can read own invoices" ON invoices;
CREATE POLICY "Customers can read own invoices"
ON invoices FOR SELECT
USING (customer_id = auth.uid());

-- =====================================================
-- 5. Roles table policies
-- =====================================================

DROP POLICY IF EXISTS "Admin can manage roles" ON roles;
CREATE POLICY "Admin can manage roles"
ON roles FOR ALL
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- =====================================================
-- 6. Audit logs table policies
-- =====================================================

DROP POLICY IF EXISTS "Admin can read audit logs" ON audit_logs;
CREATE POLICY "Admin can read audit logs"
ON audit_logs FOR SELECT
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- =====================================================
-- 7. Quotes table policies
-- =====================================================

DROP POLICY IF EXISTS "Customers can read own quotes" ON quotes;
CREATE POLICY "Customers can read own quotes"
ON quotes FOR SELECT
USING (
    customer_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'logistics', 'finance'))
);

-- =====================================================
-- 8. Insurance policies table policies
-- =====================================================

DROP POLICY IF EXISTS "Finance can read insurance policies" ON insurance_policies;
CREATE POLICY "Finance can read insurance policies"
ON insurance_policies FOR SELECT
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'finance')));

-- =====================================================
-- 9. Support tickets table policies
-- =====================================================

DROP POLICY IF EXISTS "Support can read tickets" ON support_tickets;
CREATE POLICY "Support can read tickets"
ON support_tickets FOR SELECT
USING (
    customer_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'support'))
);

-- =====================================================
-- 10. Warehouse inventory table policies
-- =====================================================

DROP POLICY IF EXISTS "Warehouse staff can read inventory" ON inventory_items;
CREATE POLICY "Warehouse staff can read inventory"
ON inventory_items FOR SELECT
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'warehouse')));

-- =====================================================
-- 11. Notifications table policies
-- =====================================================

DROP POLICY IF EXISTS "Users can read own notifications" ON notifications;
CREATE POLICY "Users can read own notifications"
ON notifications FOR SELECT
USING (user_id = auth.uid() OR user_id IS NULL);

-- =====================================================
-- 12. Reviews table policies (public read approved only)
-- =====================================================

DROP POLICY IF EXISTS "Anyone can read approved reviews" ON reviews;
CREATE POLICY "Anyone can read approved reviews"
ON reviews FOR SELECT
USING (approved = true);

DROP POLICY IF EXISTS "Admin can manage reviews" ON reviews;
CREATE POLICY "Admin can manage reviews"
ON reviews FOR ALL
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- =====================================================
-- 13. Generic staff read access for operational tables
-- =====================================================

DROP POLICY IF EXISTS "Staff can read containers" ON containers;
CREATE POLICY "Staff can read containers"
ON containers FOR SELECT
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'logistics')));

DROP POLICY IF EXISTS "Staff can read routes" ON routes;
CREATE POLICY "Staff can read routes"
ON routes FOR SELECT
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'logistics')));

DROP POLICY IF EXISTS "Staff can read vehicles" ON vehicles;
CREATE POLICY "Staff can read vehicles"
ON vehicles FOR SELECT
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'logistics')));

DROP POLICY IF EXISTS "Staff can read deliveries" ON deliveries;
CREATE POLICY "Staff can read deliveries"
ON deliveries FOR SELECT
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'logistics', 'driver')));

DROP POLICY IF EXISTS "Finance can read expenses" ON expenses;
CREATE POLICY "Finance can read expenses"
ON expenses FOR SELECT
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'finance')));

DROP POLICY IF EXISTS "Finance can read payments" ON payments;
CREATE POLICY "Finance can read payments"
ON payments FOR SELECT
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'finance')));

DROP POLICY IF EXISTS "Customs can read entries" ON customs_entries;
CREATE POLICY "Customs can read entries"
ON customs_entries FOR SELECT
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'customs')));

DROP POLICY IF EXISTS "Staff can read branches" ON branches;
CREATE POLICY "Staff can read branches"
ON branches FOR SELECT
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role != 'customer'));

DROP POLICY IF EXISTS "Warehouse staff can read warehouses" ON warehouses;
CREATE POLICY "Warehouse staff can read warehouses"
ON warehouses FOR SELECT
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'warehouse')));

DROP POLICY IF EXISTS "Staff can read tasks" ON warehouse_tasks;
CREATE POLICY "Staff can read tasks"
ON warehouse_tasks FOR SELECT
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'logistics', 'warehouse')));

DROP POLICY IF EXISTS "Warehouse staff can read warehouse tasks" ON warehouse_tasks;
CREATE POLICY "Warehouse staff can read warehouse tasks"
ON warehouse_tasks FOR SELECT
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'warehouse')));

DROP POLICY IF EXISTS "Staff can read documents" ON documents;
CREATE POLICY "Staff can read documents"
ON documents FOR SELECT
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'logistics', 'customs')));

DROP POLICY IF EXISTS "Staff can read shipment history" ON shipment_status_history;
CREATE POLICY "Staff can read shipment history"
ON shipment_status_history FOR SELECT
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'logistics', 'customs')));
