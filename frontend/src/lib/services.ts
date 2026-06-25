/**
 * Backend service layer — typed wrappers over the FastAPI endpoints.
 *
 * Every business data call in the app goes through here (NOT Supabase). Only
 * authentication (login/register/session/profile) uses Supabase directly.
 */

import { api } from "./api";

type Dict = Record<string, unknown>;
const data = <T = any>(p: Promise<{ data: T }>) => p.then((r) => r.data);

// ----------------------------- Reviews -----------------------------
export const reviewsApi = {
  list: () => data(api.get("/reviews")),
  create: (body: Dict) => data(api.post("/reviews", body)),
};

// ----------------------------- Quotes -----------------------------
export const quotesApi = {
  list: () => data(api.get("/quotes")),
  create: (body: Dict) => data(api.post("/quotes", body)),
  get: (id: string) => data(api.get(`/quotes/${id}`)),
  update: (id: string, body: Dict) => data(api.patch(`/quotes/${id}`, body)),
};

// ----------------------------- Shipments -----------------------------
export const shipmentsApi = {
  list: (params?: Dict) => data(api.get("/shipments", { params })),
  create: (body: Dict) => data(api.post("/shipments", body)),
  get: (id: string) => data(api.get(`/shipments/${id}`)),
  update: (id: string, body: Dict) => data(api.patch(`/shipments/${id}`, body)),
  setStatus: (id: string, body: Dict) => data(api.post(`/shipments/${id}/status`, body)),
  history: (id: string) => data(api.get(`/shipments/${id}/history`)),
  documents: (id: string) => data(api.get(`/shipments/${id}/documents`)),
  addDocument: (id: string, body: Dict) => data(api.post(`/shipments/${id}/documents`, body)),
  remove: (id: string) => data(api.delete(`/shipments/${id}`)),
};

// ----------------------------- Tracking (public) -----------------------------
export const trackingApi = {
  track: (trackingId: string) => data(api.get(`/tracking/${encodeURIComponent(trackingId)}`)),
};

// ----------------------------- Logistics -----------------------------
function resource(base: string) {
  return {
    list: (params?: Dict) => data(api.get(base, { params })),
    create: (body: Dict) => data(api.post(base, body)),
    update: (id: string, body: Dict) => data(api.patch(`${base}/${id}`, body)),
    remove: (id: string) => data(api.delete(`${base}/${id}`)),
  };
}

export const containersApi = resource("/logistics/containers");
export const routesApi = resource("/logistics/routes");
export const vehiclesApi = resource("/logistics/vehicles");
export const deliveriesApi = resource("/logistics/deliveries");

// ----------------------------- Driver -----------------------------
export const driverApi = {
  deliveries: () => data(api.get("/driver/deliveries")),
  updateDelivery: (id: string, body: Dict) => data(api.patch(`/driver/deliveries/${id}`, body)),
  uploadProof: (id: string, proofUrl: string) =>
    data(api.post(`/driver/deliveries/${id}/proof`, null, { params: { proof_url: proofUrl } })),
  profile: () => data(api.get("/driver/profile")),
};

// ----------------------------- Warehouse -----------------------------
export const warehouseApi = {
  warehouses: () => data(api.get("/warehouse/warehouses")),
  createWarehouse: (body: Dict) => data(api.post("/warehouse/warehouses", body)),
  inventory: (warehouseId?: string) =>
    data(api.get("/warehouse/inventory", { params: warehouseId ? { warehouse_id: warehouseId } : undefined })),
  createInventory: (body: Dict) => data(api.post("/warehouse/inventory", body)),
  updateInventory: (id: string, body: Dict) => data(api.patch(`/warehouse/inventory/${id}`, body)),
  removeInventory: (id: string) => data(api.delete(`/warehouse/inventory/${id}`)),
  tasks: (taskType?: string) =>
    data(api.get("/warehouse/tasks", { params: taskType ? { task_type: taskType } : undefined })),
  createTask: (body: Dict) => data(api.post("/warehouse/tasks", body)),
  updateTask: (id: string, body: Dict) => data(api.patch(`/warehouse/tasks/${id}`, body)),
  analytics: () => data(api.get("/warehouse/analytics")),
};

// ----------------------------- Finance -----------------------------
export const financeApi = {
  invoices: () => data(api.get("/finance/invoices")),
  getInvoice: (id: string) => data(api.get(`/finance/invoices/${id}`)),
  createInvoice: (body: Dict) => data(api.post("/finance/invoices", body)),
  updateInvoice: (id: string, body: Dict) => data(api.patch(`/finance/invoices/${id}`, body)),
  payments: () => data(api.get("/finance/payments")),
  pay: (body: Dict) => data(api.post("/finance/payments", body)),
  revenue: () => data(api.get("/finance/revenue")),
  outstanding: () => data(api.get("/finance/outstanding")),
  expenses: () => data(api.get("/finance/expenses")),
  addExpense: (body: Dict) => data(api.post("/finance/expenses", body)),
  profitLoss: () => data(api.get("/finance/profit-loss")),
  monthlyReport: () => data(api.get("/finance/monthly-report")),
  yearlyReport: () => data(api.get("/finance/yearly-report")),
};

// ----------------------------- Customs -----------------------------
export const customsApi = {
  entries: (params?: Dict) => data(api.get("/customs/entries", { params })),
  create: (body: Dict) => data(api.post("/customs/entries", body)),
  update: (id: string, body: Dict) => data(api.patch(`/customs/entries/${id}`, body)),
};

// ----------------------------- Insurance -----------------------------
export const insuranceApi = {
  policies: () => data(api.get("/insurance/policies")),
  request: (body: Dict) => data(api.post("/insurance/policies", body)),
  update: (id: string, body: Dict) => data(api.patch(`/insurance/policies/${id}`, body)),
};

// ----------------------------- Support -----------------------------
export const supportApi = {
  tickets: (params?: Dict) => data(api.get("/support/tickets", { params })),
  create: (body: Dict) => data(api.post("/support/tickets", body)),
  get: (id: string) => data(api.get(`/support/tickets/${id}`)),
  addMessage: (id: string, body: Dict) => data(api.post(`/support/tickets/${id}/messages`, body)),
  update: (id: string, body: Dict) => data(api.patch(`/support/tickets/${id}`, body)),
};

// ----------------------------- Notifications -----------------------------
export const notificationsApi = {
  list: () => data(api.get("/notifications")),
  markRead: (id: string) => data(api.post(`/notifications/${id}/read`)),
  send: (body: Dict) => data(api.post("/notifications", body)),
};

// ----------------------------- Users / Admin -----------------------------
export const usersApi = {
  list: (params?: Dict) => data(api.get("/users", { params })),
  me: () => data(api.get("/users/me")),
  create: (body: Dict) => data(api.post("/users", body)),
  get: (id: string) => data(api.get(`/users/${id}`)),
  update: (id: string, body: Dict) => data(api.patch(`/users/${id}`, body)),
  remove: (id: string) => data(api.delete(`/users/${id}`)),
};

export const adminApi = {
  branches: () => data(api.get("/admin/branches")),
  createBranch: (body: Dict) => data(api.post("/admin/branches", body)),
  updateBranch: (id: string, body: Dict) => data(api.patch(`/admin/branches/${id}`, body)),
  removeBranch: (id: string) => data(api.delete(`/admin/branches/${id}`)),
  analytics: () => data(api.get("/admin/analytics")),
  dashboard: () => data(api.get("/admin/dashboard")),
  auditLogs: () => data(api.get("/admin/audit-logs")),
  users: (params?: Dict) => data(api.get("/admin/users", { params })),
  setUserStatus: (id: string, status: string) => data(api.patch(`/users/${id}/status`, { status })),
  roles: () => data(api.get("/admin/roles")),
  createRole: (body: Dict) => data(api.post("/admin/roles", body)),
  updateRole: (id: string, body: Dict) => data(api.patch(`/admin/roles/${id}`, body)),
  removeRole: (id: string) => data(api.delete(`/admin/roles/${id}`)),
};

// ----------------------------- Customers -----------------------------
export const customersApi = {
  list: (params?: Dict) => data(api.get("/customers", { params })),
  create: (body: Dict) => data(api.post("/customers", body)),
  get: (id: string) => data(api.get(`/customers/${id}`)),
  update: (id: string, body: Dict) => data(api.patch(`/customers/${id}`, body)),
  remove: (id: string) => data(api.delete(`/customers/${id}`)),
  shipments: (id: string) => data(api.get(`/customers/${id}/shipments`)),
  invoices: (id: string) => data(api.get(`/customers/${id}/invoices`)),
};

// ----------------------------- Drivers (management) -----------------------------
export const driversApi = {
  list: (params?: Dict) => data(api.get("/drivers", { params })),
  create: (body: Dict) => data(api.post("/drivers", body)),
  get: (id: string) => data(api.get(`/drivers/${id}`)),
  update: (id: string, body: Dict) => data(api.patch(`/drivers/${id}`, body)),
  remove: (id: string) => data(api.delete(`/drivers/${id}`)),
  tasks: (id: string) => data(api.get(`/drivers/${id}/tasks`)),
  setAvailability: (id: string, status: string) => data(api.patch(`/drivers/${id}/availability`, { status })),
};

// ----------------------------- Driver tasks -----------------------------
export const tasksApi = {
  list: (params?: Dict) => data(api.get("/tasks", { params })),
  create: (body: Dict) => data(api.post("/tasks", body)),
  get: (id: string) => data(api.get(`/tasks/${id}`)),
  update: (id: string, body: Dict) => data(api.patch(`/tasks/${id}`, body)),
  setStatus: (id: string, status: string) => data(api.patch(`/tasks/${id}/status`, { status })),
  remove: (id: string) => data(api.delete(`/tasks/${id}`)),
};

// ----------------------------- Dispatch -----------------------------
export const dispatchApi = {
  assignDriver: (body: Dict) => data(api.post("/dispatch/assign-driver", body)),
  reassignDriver: (body: Dict) => data(api.post("/dispatch/reassign-driver", body)),
  availableDrivers: () => data(api.get("/dispatch/available-drivers")),
  activeShipments: () => data(api.get("/dispatch/active-shipments")),
};

// ----------------------------- Analytics & Reports -----------------------------
export const analyticsApi = {
  dashboard: () => data(api.get("/analytics/dashboard")),
  shipments: () => data(api.get("/analytics/shipments")),
  customers: () => data(api.get("/analytics/customers")),
  drivers: () => data(api.get("/analytics/drivers")),
  revenue: () => data(api.get("/analytics/revenue")),
  performance: () => data(api.get("/analytics/performance")),
};

export const reportsApi = {
  shipment: () => data(api.get("/reports/shipment-report")),
  customer: () => data(api.get("/reports/customer-report")),
  finance: () => data(api.get("/reports/finance-report")),
  driver: () => data(api.get("/reports/driver-report")),
  delivery: () => data(api.get("/reports/delivery-report")),
  downloadUrl: (type: string) => `${api.defaults.baseURL}/reports/download/${type}`,
};
