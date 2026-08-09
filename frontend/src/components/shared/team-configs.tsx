import { Truck, Globe, HeadphonesIcon, Warehouse, Award, Star, MapPin, Calendar, Shield, FileText, Phone, Mail } from "lucide-react";
import { usersApi } from "@/lib/services";

const initials = (name: string) => name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

export const logisticsTeam = {
  members: [
    { id: 1, name: "Rajesh Kumar", role: "Senior Logistics Manager", region: "North India", experience: "12 yrs", phone: "+91 98765 43210", email: "rajesh.k@logistics.com", image: "RK" },
    { id: 2, name: "Priya Sharma", role: "Logistics Manager", region: "West India", experience: "8 yrs", phone: "+91 98765 43211", email: "priya.s@logistics.com", image: "PS" },
    { id: 3, name: "Amit Patel", role: "Logistics Manager", region: "Gujarat", experience: "10 yrs", phone: "+91 98765 43212", email: "amit.p@logistics.com", image: "AP" },
    { id: 4, name: "Sneha Reddy", role: "Logistics Coordinator", region: "South India", experience: "6 yrs", phone: "+91 98765 43213", email: "sneha.r@logistics.com", image: "SR" },
    { id: 5, name: "Vikram Singh", role: "Logistics Manager", region: "Rajasthan", experience: "9 yrs", phone: "+91 98765 43214", email: "vikram.s@logistics.com", image: "VS" },
    { id: 6, name: "Anita Desai", role: "Senior Logistics Manager", region: "Mumbai", experience: "14 yrs", phone: "+91 98765 43215", email: "anita.d@logistics.com", image: "AD" },
    { id: 7, name: "Karthik Iyer", role: "Logistics Manager", region: "Tamil Nadu", experience: "7 yrs", phone: "+91 98765 43216", email: "karthik.i@logistics.com", image: "KI" },
    { id: 8, name: "Meera Joshi", role: "Logistics Coordinator", region: "Pune", experience: "5 yrs", phone: "+91 98765 43217", email: "meera.j@logistics.com", image: "MJ" },
    { id: 9, name: "Rahul Verma", role: "Logistics Manager", region: "UP/Bihar", experience: "11 yrs", phone: "+91 98765 43218", email: "rahul.v@logistics.com", image: "RV" },
    { id: 10, name: "Divya Nair", role: "Logistics Manager", region: "Kerala", experience: "8 yrs", phone: "+91 98765 43219", email: "divya.n@logistics.com", image: "DN" },
    { id: 11, name: "Sanjay Gupta", role: "Senior Logistics Manager", region: "Delhi NCR", experience: "15 yrs", phone: "+91 98765 43220", email: "sanjay.g@logistics.com", image: "SG" },
    { id: 12, name: "Pooja Malhotra", role: "Logistics Coordinator", region: "Chandigarh", experience: "4 yrs", phone: "+91 98765 43221", email: "pooja.m@logistics.com", image: "PM" },
    { id: 13, name: "Arjun Rao", role: "Logistics Manager", region: "Karnataka", experience: "9 yrs", phone: "+91 98765 43222", email: "arjun.r@logistics.com", image: "AR" },
    { id: 14, name: "Neha Kapoor", role: "Logistics Manager", region: "Punjab", experience: "7 yrs", phone: "+91 98765 43223", email: "neha.k@logistics.com", image: "NK" },
    { id: 15, name: "Manish Agarwal", role: "Head of Logistics", region: "Pan India", experience: "18 yrs", phone: "+91 98765 43224", email: "manish.a@logistics.com", image: "MA" },
  ],
  fetchFn: () => usersApi.list({ role: "logistics" }).then((staff: any[]) => staff.map((u: any) => ({
    id: u.id, name: u.name ?? u.email, role: u.department ? `Logistics · ${u.department}` : "Logistics Manager",
    region: u.department ?? "—", experience: "—", phone: u.phone ?? "—", email: u.email ?? "—", image: initials(u.name ?? u.email ?? "?"),
  }))),
  stats: [
    { label: "Total Managers", value: "15", icon: Award, color: "text-tertiary bg-tertiary/10" },
    { label: "Senior Managers", value: "4", icon: Star, color: "text-secondary bg-secondary/10" },
    { label: "Regions Covered", value: "12", icon: MapPin, color: "text-green-400 bg-green-400/10" },
    { label: "Avg Experience", value: "9.5 yrs", icon: Calendar, color: "text-on-tertiary-container bg-on-tertiary-container/10" },
  ],
  filters: ["All", "North India", "South India", "West India", "East India", "Central India", "Pan India"],
};

export const customsTeam = {
  members: [
    { id: 1, name: "Aditya Sharma", role: "Senior Customs Expert", specialization: "Import Clearance", phone: "+91 98765 50001", email: "aditya.s@customs.com", image: "AS", certifications: ["CBIC", "ICEGATE"] },
    { id: 2, name: "Kavita Menon", role: "Customs Expert", specialization: "Export Documentation", phone: "+91 98765 50002", email: "kavita.m@customs.com", image: "KM", certifications: ["FEMA"] },
    { id: 3, name: "Ravi Shankar", role: "Customs Expert", specialization: "Duty Drawback", phone: "+91 98765 50003", email: "ravi.s@customs.com", image: "RS", certifications: ["CBIC", "DGFT"] },
    { id: 4, name: "Pooja Hegde", role: "Customs Coordinator", specialization: "FTA Compliance", phone: "+91 98765 50004", email: "pooja.h@customs.com", image: "PH", certifications: ["ICEGATE"] },
    { id: 5, name: "Suresh Nair", role: "Senior Customs Expert", specialization: "Bonded Warehouse", phone: "+91 98765 50005", email: "suresh.n@customs.com", image: "SN", certifications: ["CBIC", "FEMA", "DGFT"] },
    { id: 6, name: "Anjali Bhatt", role: "Customs Expert", specialization: "Classification & Valuation", phone: "+91 98765 50006", email: "anjali.b@customs.com", image: "AB", certifications: ["ICEGATE"] },
    { id: 7, name: "Deepak Rao", role: "Customs Expert", specialization: "SEZ Operations", phone: "+91 98765 50007", email: "deepak.r@customs.com", image: "DR", certifications: ["DGFT", "FEMA"] },
    { id: 8, name: "Nisha Iyer", role: "Head of Customs", specialization: "Strategic Trade", phone: "+91 98765 50008", email: "nisha.i@customs.com", image: "NI", certifications: ["CBIC", "FEMA", "DGFT", "ICEGATE"] },
  ],
  fetchFn: () => usersApi.list({ role: "customs" }).then((staff: any[]) => staff.map((u: any) => ({
    id: u.id, name: u.name ?? u.email, role: "Customs Officer", specialization: u.department ?? "—",
    phone: u.phone ?? "—", email: u.email ?? "—", image: initials(u.name ?? u.email ?? "?"), certifications: [] as string[],
  }))),
  stats: [
    { label: "Total Experts", value: "8", icon: Award, color: "text-secondary bg-secondary/10" },
    { label: "Senior Experts", value: "3", icon: Star, color: "text-tertiary bg-tertiary/10" },
    { label: "Certifications", value: "15+", icon: Shield, color: "text-green-400 bg-green-400/10" },
    { label: "Clearances/Mo", value: "250+", icon: FileText, color: "text-on-tertiary-container bg-on-tertiary-container/10" },
  ],
  filters: ["All", "Import Clearance", "Export Documentation", "Duty Drawback", "FTA Compliance", "Bonded Warehouse", "Classification & Valuation", "SEZ Operations", "Strategic Trade"],
};

export const supportTeam = {
  members: [
    { id: 1, name: "Rahul Verma", role: "Senior Support Lead", specialization: "Technical Support", phone: "+91 98765 60001", email: "rahul.v@support.com", image: "RV" },
    { id: 2, name: "Sneha Patel", role: "Support Executive", specialization: "Customer Queries", phone: "+91 98765 60002", email: "sneha.p@support.com", image: "SP" },
    { id: 3, name: "Amit Kumar", role: "Support Executive", specialization: "Billing Support", phone: "+91 98765 60003", email: "amit.k@support.com", image: "AK" },
    { id: 4, name: "Priya Singh", role: "Support Executive", specialization: "Shipment Queries", phone: "+91 98765 60004", email: "priya.s@support.com", image: "PS" },
    { id: 5, name: "Vikram Joshi", role: "Support Lead", specialization: "Escalations", phone: "+91 98765 60005", email: "vikram.j@support.com", image: "VJ" },
    { id: 6, name: "Neha Gupta", role: "Support Executive", specialization: "Live Chat", phone: "+91 98765 60006", email: "neha.g@support.com", image: "NG" },
  ],
  fetchFn: () => usersApi.list({ role: "support" }).then((staff: any[]) => staff.map((u: any) => ({
    id: u.id, name: u.name ?? u.email, role: "Support Executive", specialization: u.department ?? "—",
    phone: u.phone ?? "—", email: u.email ?? "—", image: initials(u.name ?? u.email ?? "?"),
  }))),
  stats: [
    { label: "Total Staff", value: "6", icon: HeadphonesIcon, color: "text-tertiary bg-tertiary/10" },
    { label: "Senior Leads", value: "2", icon: Star, color: "text-secondary bg-secondary/10" },
    { label: "Avg Response", value: "< 5 min", icon: Phone, color: "text-green-400 bg-green-400/10" },
    { label: "Tickets/Day", value: "120+", icon: FileText, color: "text-on-tertiary-container bg-on-tertiary-container/10" },
  ],
  filters: ["All", "Technical Support", "Customer Queries", "Billing Support", "Shipment Queries", "Escalations", "Live Chat"],
};

export const warehouseTeam = {
  members: [
    { id: 1, name: "Suresh Kumar", role: "Warehouse Manager", zone: "Zone A", shift: "Morning", phone: "+91 98765 70001", email: "suresh.k@warehouse.com", image: "SK" },
    { id: 2, name: "Meena Sharma", role: "Inventory Supervisor", zone: "Zone B", shift: "Morning", phone: "+91 98765 70002", email: "meena.s@warehouse.com", image: "MS" },
    { id: 3, name: "Rajan Patel", role: "Inbound Coordinator", zone: "Dock 1-3", shift: "Morning", phone: "+91 98765 70003", email: "rajan.p@warehouse.com", image: "RP" },
    { id: 4, name: "Kavita Nair", role: "Outbound Coordinator", zone: "Dock 4-6", shift: "Evening", phone: "+91 98765 70004", email: "kavita.n@warehouse.com", image: "KN" },
    { id: 5, name: "Arun Singh", role: "Picker/Packer Lead", zone: "Zone C", shift: "Morning", phone: "+91 98765 70005", email: "arun.s@warehouse.com", image: "AS" },
    { id: 6, name: "Deepa Reddy", role: "Quality Checker", zone: "All Zones", shift: "Morning", phone: "+91 98765 70006", email: "deepa.r@warehouse.com", image: "DR" },
    { id: 7, name: "Vinod Gupta", role: "Forklift Operator", zone: "Zone A & B", shift: "Evening", phone: "+91 98765 70007", email: "vinod.g@warehouse.com", image: "VG" },
    { id: 8, name: "Sunita Joshi", role: "Inventory Clerk", zone: "Zone A", shift: "Morning", phone: "+91 98765 70008", email: "sunita.j@warehouse.com", image: "SJ" },
  ],
  fetchFn: () => usersApi.list({ role: "warehouse" }).then((staff: any[]) => staff.map((u: any) => ({
    id: u.id, name: u.name ?? u.email, role: "Warehouse Staff", zone: u.department ?? "—",
    shift: "—", phone: u.phone ?? "—", email: u.email ?? "—", image: initials(u.name ?? u.email ?? "?"),
  }))),
  stats: [
    { label: "Total Staff", value: "8", icon: Warehouse, color: "text-tertiary bg-tertiary/10" },
    { label: "Supervisors", value: "3", icon: Star, color: "text-secondary bg-secondary/10" },
    { label: "Zones Covered", value: "4", icon: MapPin, color: "text-green-400 bg-green-400/10" },
    { label: "Shifts", value: "2", icon: Calendar, color: "text-on-tertiary-container bg-on-tertiary-container/10" },
  ],
  filters: ["All", "Zone A", "Zone B", "Zone C", "Dock 1-3", "Dock 4-6", "All Zones"],
};

export const renderLogisticsCard = (member: any) => (
  <>
    <div className="flex items-center gap-2 text-xs text-on-surface-variant">
      <MapPin className="h-3 w-3 shrink-0" />
      <span className="truncate">{member.region}</span>
    </div>
    <div className="flex items-center gap-2 text-xs text-on-surface-variant">
      <Calendar className="h-3 w-3 shrink-0" />
      <span>{member.experience} experience</span>
    </div>
    <div className="flex items-center gap-2 text-xs text-on-surface-variant">
      <Phone className="h-3 w-3 shrink-0" />
      <span className="truncate">{member.phone}</span>
    </div>
    <div className="flex items-center gap-2 text-xs text-on-surface-variant">
      <Mail className="h-3 w-3 shrink-0" />
      <span className="truncate">{member.email}</span>
    </div>
  </>
);

export const renderCustomsCard = (member: any) => (
  <>
    <div className="flex items-center gap-2 text-xs text-on-surface-variant">
      <FileText className="h-3 w-3 shrink-0" />
      <span className="truncate">{member.specialization}</span>
    </div>
    <div className="flex items-center gap-2 text-xs text-on-surface-variant">
      <Award className="h-3 w-3 shrink-0" />
      <span className="truncate">{member.certifications.join(", ")}</span>
    </div>
    <div className="flex items-center gap-2 text-xs text-on-surface-variant">
      <Phone className="h-3 w-3 shrink-0" />
      <span className="truncate">{member.phone}</span>
    </div>
    <div className="flex items-center gap-2 text-xs text-on-surface-variant">
      <Mail className="h-3 w-3 shrink-0" />
      <span className="truncate">{member.email}</span>
    </div>
  </>
);
