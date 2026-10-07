/**
 * Tipe domain utama untuk platform ISP.
 * Dicerminkan dari kontrak backend (DTO NestJS).
 */

export type CustomerStatus =
  | "CANDIDATE"
  | "TRIAL"
  | "ACTIVE"
  | "ISOLATED"
  | "SUSPENDED"
  | "TERMINATED";

export type InvoiceStatus = "UNPAID" | "PAID" | "OVERDUE" | "PARTIAL" | "VOID";

export type PaymentMethod =
  | "CASH"
  | "TRANSFER"
  | "VA"
  | "QRIS"
  | "EWALLET"
  | "RETAIL";

export interface Package {
  id: string;
  name: string;
  code: string;
  downloadMbps: number;
  uploadMbps: number;
  price: number;
  validityDays: number;
  serviceType: "PPPOE" | "STATIC_IP" | "DHCP";
  billingType: "PREPAID" | "POSTPAID";
  isActive: boolean;
}

export interface Onu {
  id: string;
  serialNumber: string;
  mac: string;
  model: string;
  vendor: string;
  firmware: string | null;
  status: "ONLINE" | "OFFLINE" | "LOS" | "DYING_GASP";
  rxPowerDbm: number | null;
  txPowerDbm: number | null;
  lastSeenAt: string | null;
}

export interface Subscription {
  id: string;
  packageId: string;
  package: Package | null;
  startDate: string;
  endDate: string | null;
  ipAddress: string | null;
  pppoeUsername: string | null;
  status: CustomerStatus;
}

export interface Customer {
  id: string;
  customerNo: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string;
  latitude: number | null;
  longitude: number | null;
  ktpNumber: string | null;
  category: "RETAIL" | "CORPORATE" | "RESELLER";
  status: CustomerStatus;
  dueDay: number;
  odpCode: string | null;
  odpPort: number | null;
  subscription: Subscription | null;
  onu: Onu | null;
  balance: number;
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: string;
  invoiceNo: string;
  customerId: string;
  customer: { id: string; customerNo: string; name: string } | null;
  period: string;
  subtotal: number;
  discount: number;
  adminFee: number;
  tax: number;
  total: number;
  paidAmount: number;
  status: InvoiceStatus;
  dueDate: string;
  issuedAt: string;
  paidAt: string | null;
  isOverdue: boolean;
}

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  method: PaymentMethod;
  reference: string | null;
  paidAt: string;
  createdBy: string | null;
}

export interface Olt {
  id: string;
  code: string;
  name: string;
  model: string;
  vendor: string;
  mgmtIp: string;
  popName: string;
  latitude: number;
  longitude: number;
  slotCount: number;
  ponCount: number;
  status: "ONLINE" | "OFFLINE" | "DEGRADED";
}

export interface Odc {
  id: string;
  code: string;
  name: string;
  latitude: number;
  longitude: number;
  capacity: number;
  usedPorts: number;
  status: string;
}

export interface Odp {
  id: string;
  code: string;
  name: string;
  latitude: number;
  longitude: number;
  capacity: number;
  usedPorts: number;
  freePorts: number;
  status: string;
  distanceMeters?: number;
}

export type TicketStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
export type TicketPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface Ticket {
  id: string;
  ticketNo: string;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  customerId: string | null;
  customer: { id: string; name: string; customerNo: string } | null;
  assignee: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NocAlarm {
  id: string;
  severity: "INFO" | "WARNING" | "CRITICAL";
  title: string;
  message: string;
  nodeType: string | null;
  nodeCode: string | null;
  createdAt: string;
}

export interface DashboardStats {
  activeCustomers: number;
  monthlyRevenue: number;
  overdueInvoices: number;
  onlineOnus: number;
  isolatedCount: number;
  ticketsOpen: number;
  /** Distribusi pelanggan per status untuk pie chart. */
  customersByStatus?: { status: CustomerStatus; count: number }[];
  /** Alarm NOC terbaru (opsional, tergantung backend). */
  alarms?: NocAlarm[];
}

export interface RevenuePoint {
  month: string;
  revenue: number;
}

export interface NocCustomerRow {
  id: string;
  customerNo: string;
  name: string;
  packageName: string;
  ipAddress: string | null;
  online: boolean;
  rxPower: number | null;
  status: CustomerStatus;
  lastSeenAt: string | null;
}

export interface GeoJsonFeature {
  type: "Feature";
  geometry: {
    type: "Point" | "LineString" | "Polygon";
    coordinates: number[] | number[][] | number[][][];
  };
  properties: Record<string, string | number | boolean | null | undefined>;
}

export interface GeoJsonFeatureCollection {
  type: "FeatureCollection";
  features: GeoJsonFeature[];
}

export interface Paginated<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: "ADMIN" | "NOC" | "CASHIER" | "TECHNICIAN" | "CS";
}

export interface LoginResponse {
  access_token: string;
  user: AuthUser;
}

/* ---------------- Paket (manajemen dashboard, kontrak /api/packages) -------- */

export type ServiceType = "PPPOE" | "STATIC_IP" | "DHCP" | "HOTSPOT";
export type BillingType = "PREPAID" | "POSTPAID";

export interface ManagedPackage {
  id: string;
  name: string;
  downloadMbps: number;
  uploadMbps: number;
  price: number;
  validityDays: number | null;
  fupGb: number | null;
  serviceType: ServiceType;
  billingType: BillingType;
  installFee: number | null;
  setupFee: number | null;
  description: string | null;
  mikrotikProfile: string | null;
  radiusRateLimit: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PackageFormInput {
  name: string;
  downloadMbps: number;
  uploadMbps: number;
  price: number;
  serviceType: ServiceType;
  billingType: BillingType;
  validityDays?: number;
  fupGb?: number;
  installFee?: number;
  setupFee?: number;
  description?: string;
  mikrotikProfile?: string;
  radiusRateLimit?: string;
}

/* ---------------- Pengguna sistem (ADMIN) ----------------------------------- */

export type SystemRole = "ADMIN" | "NOC" | "CASHIER" | "TECHNICIAN" | "CS";

export interface SystemUser {
  id: string;
  name: string;
  email: string;
  role: SystemRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/* ---------------- Perangkat NAS/Router -------------------------------------- */

export interface NasRouter {
  id: string;
  name: string;
  host: string;
  apiPort: number | null;
  username: string;
  useTls: boolean;
  type: string | null;
  location: string | null;
  status: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NasRouterFormInput {
  name: string;
  host: string;
  apiPort?: number;
  username: string;
  /** Wajib saat tambah; opsional saat edit (kosong = tidak diubah). */
  password?: string;
  useTls?: boolean;
  type?: string;
  location?: string;
}

export interface NasConnectionTestResult {
  ok: boolean;
  latencyMs?: number;
  error?: string;
}

/* ---------------- Auth pelanggan & portal ----------------------------------- */

export interface CustomerAuthUser {
  id: string;
  customerNo: string;
  name: string;
  email: string | null;
}

export interface CustomerLoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  customer: CustomerAuthUser;
}

export interface PortalProfile {
  id: string;
  customerNo: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string;
  status: CustomerStatus;
  dueDay: number;
  balance: number;
  subscription: {
    packageName: string;
    downloadMbps?: number | null;
    uploadMbps?: number | null;
    price?: number | null;
    pppoeUsername: string | null;
    status: CustomerStatus;
    startDate?: string | null;
    endDate?: string | null;
  } | null;
}
