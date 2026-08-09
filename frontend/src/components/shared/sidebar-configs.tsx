import {
  LayoutDashboard, Users, GitBranch, ShieldCheck, BarChart2,
  Warehouse, Truck, TrendingUp, Navigation, Bell,
  MapPin, FileSignature, Receipt, CreditCard, Shield, HeadphonesIcon, Star, Package,
  Container, Route, PackageOpen, ScanBarcode, ClipboardList, Settings,
  CheckCircle2, User, MessageSquare, Phone, BookOpen, FileText, Calculator,
  Banknote, Package as PackageIcon,
} from "lucide-react";

export const adminNavItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
  { icon: Truck, label: "Dispatch", href: "/admin/dispatch" },
  { icon: Users, label: "User Management", href: "/admin/users" },
  { icon: GitBranch, label: "Branch Management", href: "/admin/branches" },
  { icon: ShieldCheck, label: "Access Control", href: "/admin/access" },
  { icon: BarChart2, label: "Analytics", href: "/admin/analytics" },
  { icon: Bell, label: "Notifications", href: "/admin/notifications" },
];

export const adminPortalLinks = [
  { icon: Truck, label: "Logistics", href: "/admin/logistics" },
  { icon: Warehouse, label: "Warehouse", href: "/admin/warehouse" },
  { icon: Navigation, label: "Driver App", href: "/admin/driver" },
  { icon: TrendingUp, label: "Finance", href: "/admin/finance" },
];

export const customerNavItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/customer", enabled: true },
  { icon: MapPin, label: "Track Shipments", href: "/customer/track", enabled: true },
  { icon: FileSignature, label: "Request Quotes", href: "/customer/quotes", enabled: true },
  { icon: Package, label: "Book Shipment", href: "/customer/shipments/new", enabled: true },
  { icon: Receipt, label: "Invoices", href: "/customer/invoices", enabled: true },
  { icon: CreditCard, label: "Payments", href: "/customer/payment", enabled: true },
  { icon: Shield, label: "Cargo Insurance", href: "/customer/insurance", enabled: true },
  { icon: HeadphonesIcon, label: "Support Tickets", href: "/customer/support", enabled: true },
  { icon: Star, label: "Feedback", href: "/customer/feedback", enabled: true },
];

export const financeNavItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/finance" },
  { icon: Receipt, label: "Invoices", href: "/finance/invoices" },
  { icon: Banknote, label: "Payments", href: "/finance/payments" },
  { icon: TrendingUp, label: "Revenue", href: "/finance/revenue" },
  { icon: FileText, label: "Reports", href: "/finance/reports" },
  { icon: Settings, label: "Settings", href: "/finance/settings" },
];

export const logisticsNavItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/logistics" },
  { icon: PackageIcon, label: "Shipments", href: "/logistics/shipments" },
  { icon: Container, label: "Containers", href: "/logistics/containers" },
  { icon: Route, label: "Routes", href: "/logistics/routes" },
  { icon: MapPin, label: "Delivery Tracking", href: "/logistics/deliveries" },
  { icon: Users, label: "Our Team", href: "/logistics/team" },
];

export const warehouseNavItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/warehouse" },
  { icon: PackageOpen, label: "Inventory", href: "/warehouse/inventory" },
  { icon: ScanBarcode, label: "Inbound", href: "/warehouse/inbound" },
  { icon: Truck, label: "Outbound", href: "/warehouse/outbound" },
  { icon: ClipboardList, label: "Tasks", href: "/warehouse/tasks" },
  { icon: Users, label: "Our Team", href: "/warehouse/team" },
  { icon: Settings, label: "Settings", href: "/warehouse/settings" },
];

export const supportNavItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/support" },
  { icon: MessageSquare, label: "Tickets", href: "/support/tickets" },
  { icon: HeadphonesIcon, label: "Live Chat", href: "/support/chat" },
  { icon: Phone, label: "Call Queue", href: "/support/calls" },
  { icon: BookOpen, label: "Knowledge Base", href: "/support/kb" },
  { icon: Users, label: "Our Team", href: "/support/team" },
];

export const customsNavItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/customs" },
  { icon: FileText, label: "Clearance", href: "/customs/clearance" },
  { icon: FileText, label: "Documents", href: "/customs/documents" },
  { icon: Calculator, label: "Duty Calculator", href: "/customs/duty-calc" },
  { icon: Shield, label: "Compliance", href: "/customs/compliance" },
  { icon: Users, label: "Our Team", href: "/customs/team" },
];

export const driverNavItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/driver" },
  { icon: Navigation, label: "Routes", href: "/driver/routes" },
  { icon: CheckCircle2, label: "Tasks", href: "/driver/tasks" },
  { icon: User, label: "Profile", href: "/driver/profile" },
  { icon: Settings, label: "Settings", href: "/driver/settings" },
];
