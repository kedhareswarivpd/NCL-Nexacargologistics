/**
 * Shared domain types for the NexaCargo frontend.
 *
 * The app ships without a backend, so these types describe the shape of the
 * data we persist locally (via the mock auth store) and pass through context.
 */

/** The roles defined by the platform's access matrix (see documentation). */
export type UserRole =
  | "customer"
  | "logistics"
  | "warehouse"
  | "driver"
  | "finance"
  | "customs"
  | "support"
  | "admin";

/** A registered user. `password` is never exposed outside the auth store. */
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  company?: string;
  phone?: string;
  /** ISO timestamp of account creation. */
  createdAt: string;
}

/** Credentials accepted by the login flow. */
export interface LoginInput {
  email: string;
  password: string;
  remember?: boolean;
}

/** Fields collected during registration. */
export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  company?: string;
  phone?: string;
  role?: UserRole;
}

/** Editable subset of a user profile. */
export interface ProfileInput {
  name: string;
  company?: string;
  phone?: string;
}

// ── Finance ──────────────────────────────────────────────────────────────────

export interface FinanceInvoice {
  id: string;
  client: string;
  amount: number;
  issued: string;
  due: string;
  status: "Pending" | "Paid" | "Overdue";
  description?: string;
}

export interface FinancePayment {
  id: string;
  invoice_id: string;
  client: string;
  amount: number;
  method: string;
  date: string;
  status: "Completed" | "Failed";
}

export interface MonthlyRevenue {
  id: string;
  month: string;
  revenue: number;
  expenses: number;
}

export interface TopClient {
  id: string;
  client: string;
  revenue: number;
}

export interface FinanceReport {
  id: string;
  name: string;
  type: "Quarterly" | "Monthly" | "Annual" | "Ad-hoc";
  generated: string;
  file_url?: string;
  size?: string;
}

// ── Driver ───────────────────────────────────────────────────────────────────

export interface DeliveryStop {
  id: string;
  route_id: string;
  stop_num: number;
  label: string;
  address: string;
  scheduled_time: string;
  status: "pending" | "active" | "done";
  lat?: number;
  lng?: number;
}

export interface DriverRoute {
  id: string;
  date: string;
  status: "Active" | "Completed";
  total_stops: number;
  completed_stops: number;
  distance_mi: number;
  eta: string;
}

export interface DriverTask {
  id: string;
  driver_id: string;
  description: string;
  priority: "High" | "Medium" | "Low";
  status: "Pending" | "Completed";
  due: string;
}

export interface DeliveryProof {
  id: string;
  delivery_id: string;
  stop_id: string;
  photo_url: string;
  note?: string;
  uploaded_at: string;
}

export interface DriverProfile {
  id: string;
  user_id: string;
  driver_code: string;
  phone: string;
  location: string;
  joined: string;
  license: string;
  vehicle: string;
  status: "On Duty" | "Off Duty";
  total_deliveries: number;
  on_time_rate: number;
  avg_rating: number;
  hours_this_week: number;
}

// ── Warehouse ────────────────────────────────────────────────────────────────

export interface InventoryItem {
  id: string;
  warehouse_id?: string;
  sku: string;
  name: string;
  category: string;
  zone: string;
  qty: number;
  reorder_at: number;
  // Backend auto-derives status ("Out" replaces the legacy "Critical").
  status: "OK" | "Low" | "Out" | "Critical";
  shipment_id?: string;
  created_at?: string;
  barcode?: string;
}

export interface StorageZone {
  id: string;
  zone: string;
  used_bins: number;
  total_bins: number;
}

export interface InboundShipment {
  id: string;
  supplier: string;
  items: number;
  zone: string;
  status: string;
  eta: string;
  date: string;
}

export interface WarehouseTask {
  id: string;
  warehouse_id?: string;
  task_type?: "inbound" | "outbound" | "putaway" | "pick" | "count";
  shipment_id?: string;
  reference?: string;
  description: string;
  status: "Pending" | "In Progress" | "Done" | "Completed";
  assigned_to?: string;
  created_at?: string;
  // Legacy Supabase fields — optional so existing JSX still compiles.
  priority?: "High" | "Medium" | "Low";
  assignee?: string;
  due?: string;
}

export interface ThroughputEntry {
  day: string;
  units: number;
}

/** A human-friendly default landing route for each role. */
export const ROLE_HOME: Record<UserRole, string> = {
  customer: "/customer",
  logistics: "/logistics",
  warehouse: "/warehouse",
  driver: "/driver",
  finance: "/finance",
  customs: "/customs",
  support: "/support",
  admin: "/admin",
};

export const ROLE_LABEL: Record<UserRole, string> = {
  customer: "Customer",
  logistics: "Logistics Manager",
  warehouse: "Warehouse Staff",
  driver: "Driver",
  finance: "Finance Team",
  customs: "Customs Officer",
  support: "Support Executive",
  admin: "Administrator",
};
