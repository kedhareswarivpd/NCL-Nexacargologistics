-- Supabase Row Level Security (RLS) Migration
-- Run this in Supabase SQL Editor to fix DFT-004 and DFT-005
-- This enables RLS and creates security policies for all tables

-- =====================================================
-- 1. Enable RLS on all tables
-- =====================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE insurance_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouse_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE containers ENABLE ROW LEVEL SECURITY;
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE customs_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouse_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipment_status_history ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 2. Profiles table policies
-- =====================================================

-- Users can read their own profile
CREATE POLICY "Users can read own profile"
ON profiles FOR SELECT
USING (auth.uid() = id::text);

-- Staff can read all profiles
CREATE POLICY "Staff can read all profiles"
ON profiles FOR SELECT
USING (auth.role() = 'authenticated' AND (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'logistics', 'finance', 'warehouse', 'driver', 'support', 'customs'))
));

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id::text);

-- Only admin can delete profiles
CREATE POLICY "Admin can delete profiles"
ON profiles FOR DELETE
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- =====================================================
-- 3. Shipments table policies
-- =====================================================

CREATE POLICY "Customers can read own shipments"
ON shipments FOR SELECT
USING (
    customer_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'logistics', 'customs'))
);

CREATE POLICY "Staff can manage shipments"
ON shipments FOR ALL
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'logistics', 'customs')));

-- =====================================================
-- 4. Invoices table policies
-- =====================================================

CREATE POLICY "Finance can read all invoices"
ON invoices FOR SELECT
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'finance')));

CREATE POLICY "Customers can read own invoices"
ON invoices FOR SELECT
USING (customer_id = auth.uid());

-- =====================================================
-- 5. Roles table policies
-- =====================================================

CREATE POLICY "Admin can manage roles"
ON roles FOR ALL
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- =====================================================
-- 6. Audit logs table policies
-- =====================================================

CREATE POLICY "Admin can read audit logs"
ON audit_logs FOR SELECT
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- =====================================================
-- 7. Quotes table policies
-- =====================================================

CREATE POLICY "Customers can read own quotes"
ON quotes FOR SELECT
USING (
    customer_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'logistics', 'finance'))
);

-- =====================================================
-- 8. Insurance policies table policies
-- =====================================================

CREATE POLICY "Finance can read insurance policies"
ON insurance_policies FOR SELECT
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'finance')));

-- =====================================================
-- 9. Support tickets table policies
-- =====================================================

CREATE POLICY "Support can read tickets"
ON support_tickets FOR SELECT
USING (
    customer_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'support'))
);

-- =====================================================
-- 10. Warehouse inventory table policies
-- =====================================================

CREATE POLICY "Warehouse staff can read inventory"
ON warehouse_inventory FOR SELECT
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'warehouse')));

-- =====================================================
-- 11. Notifications table policies
-- =====================================================

CREATE POLICY "Users can read own notifications"
ON notifications FOR SELECT
USING (user_id = auth.uid() OR user_id IS NULL);

-- =====================================================
-- 12. Reviews table policies (public read)
-- =====================================================

CREATE POLICY "Anyone can read approved reviews"
ON reviews FOR SELECT
USING (approved = true);

CREATE POLICY "Admin can manage reviews"
ON reviews FOR ALL
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- =====================================================
-- 13. Generic staff read access for operational tables
-- =====================================================

-- Containers
CREATE POLICY "Staff can read containers"
ON containers FOR SELECT
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'logistics')));

-- Routes
CREATE POLICY "Staff can read routes"
ON routes FOR SELECT
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'logistics')));

-- Vehicles
CREATE POLICY "Staff can read vehicles"
ON vehicles FOR SELECT
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'logistics')));

-- Deliveries
CREATE POLICY "Staff can read deliveries"
ON deliveries FOR SELECT
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'logistics', 'driver')));

-- Expenses
CREATE POLICY "Finance can read expenses"
ON expenses FOR SELECT
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'finance')));

-- Payments
CREATE POLICY "Finance can read payments"
ON payments FOR SELECT
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'finance')));

-- Customs entries
CREATE POLICY "Customs can read entries"
ON customs_entries FOR SELECT
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'customs')));

-- Branches
CREATE POLICY "Staff can read branches"
ON branches FOR SELECT
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role != 'customer'));

-- Warehouses
CREATE POLICY "Warehouse staff can read warehouses"
ON warehouses FOR SELECT
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'warehouse')));

-- Tasks
CREATE POLICY "Staff can read tasks"
ON tasks FOR SELECT
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'logistics', 'warehouse')));

-- Warehouse tasks
CREATE POLICY "Warehouse staff can read warehouse tasks"
ON warehouse_tasks FOR SELECT
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'warehouse')));

-- Documents
CREATE POLICY "Staff can read documents"
ON documents FOR SELECT
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'logistics', 'customs')));

-- Shipment status history
CREATE POLICY "Staff can read shipment history"
ON shipment_status_history FOR SELECT
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'logistics', 'customs')));
