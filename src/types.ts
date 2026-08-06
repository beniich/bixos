export type PageId =
  | 'home'
  | 'dashboard'
  | 'today'
  | 'members'
  | 'bookings'
  | 'billing'
  | 'analytics'
  | 'mobile_pwa'
  | 'visitors'
  | 'settings'
  | 'architecture'
  | 'pricing'
  | 'support'
  | 'demo'
  | 'vision'
  | 'security'
  | 'testimonials'
  | 'changelog'
  | 'blog'
  | 'contact'
  | 'login'
  | 'register'
  | 'subscription'
  | 'workspace'
  | 'licenses'
  | 'meet_ai'
  | 'inbox_ai'
  | 'call_copilot'
  | 'exit_ready'
  | 'schema';

// ==========================================
// SPACEFLOW COWORKING MANAGEMENT TYPES
// ==========================================

export interface GoogleAuthUser {
  email: string;
  name: string;
  avatar?: string;
  provider: 'GOOGLE_OAUTH' | 'ADMIN';
  scopesAuthorized?: string[];
  googleToken?: string;
  authenticatedAt: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  plan: 'FREE' | 'PRO' | 'ENTERPRISE';
  address?: string;
  city?: string;
  totalSpacesCount?: number;
  totalMembersCount?: number;
  monthlyRevenue?: number;
  mrrGrowthPercent?: number;
}

export type MemberPlan = 'DAY_PASS' | 'HOT_DESK' | 'DEDICATED' | 'PRIVATE_OFFICE';
export type MemberStatus = 'ACTIVE' | 'PENDING' | 'SUSPENDED' | 'EXPIRED';

export interface Member {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  companyName?: string;
  phone?: string;
  plan: MemberPlan;
  status: MemberStatus;
  orgId: string;
  joinedDate: string;
  monthlyFee: number;
  totalBookingsCount?: number;
  lastCheckIn?: string;
}

export type SpaceType = 'DESK' | 'MEETING_ROOM' | 'EVENT_SPACE' | 'PRIVATE_OFFICE';

export interface Space {
  id: string;
  name: string;
  type: SpaceType;
  capacity: number;
  hourlyRate: number;
  dailyRate?: number;
  floor: string;
  orgId: string;
  status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE';
  amenities: string[];
  imageUrl?: string;
  description?: string;
}

export type BookingStatus = 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'CHECKED_IN';

export interface Booking {
  id: string;
  spaceId: string;
  spaceName?: string;
  spaceType?: SpaceType;
  memberId: string;
  memberName?: string;
  memberEmail?: string;
  startTime: string; // ISO String
  endTime: string;   // ISO String
  status: BookingStatus;
  amount: number;
  orgId: string;
  notes?: string;
  qrCodeToken?: string;
  checkInTime?: string;
  checkOutTime?: string;
}

export type InvoiceStatus = 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED';

export interface Invoice {
  id: string;
  number: string;
  memberId: string;
  memberName: string;
  memberEmail?: string;
  amount: number;
  taxAmount: number;
  status: InvoiceStatus;
  dueDate: string;
  paidAt?: string;
  pdfUrl?: string;
  stripePaymentId?: string;
  items: { description: string; qty: number; unitPrice: number; total: number }[];
}

export interface VisitorPass {
  id: string;
  visitorName: string;
  visitorEmail: string;
  hostMemberId: string;
  hostMemberName: string;
  visitDate: string;
  timeSlot: string;
  status: 'EXPECTED' | 'CHECKED_IN' | 'DEPARTED';
  qrCodeToken: string;
  purpose?: string;
}

export interface SpaceflowKPIs {
  totalMembers: number;
  occupancyRatePercent: number;
  monthlyRecurringRevenueEur: number;
  activeBookingsToday: number;
  availableDesksCount: number;
  mrrGrowthRatePercent: number;
  totalInvoicesPaid: number;
  totalInvoicesPendingEur: number;
}

export interface SpaceflowAIPrediction {
  predictionId: string;
  confidenceScore: number;
  summary: string;
  predictedPeakHour: string;
  suggestedRateAdjustmentPercent: number;
  recommendedSpaceReconfiguration: string;
  forecastOccupancyNextWeekPercent: number;
}

// ==========================================
// CAFM / EXISTING ARCHITECTURE TYPES
// ==========================================

export interface AdminAuthUser {
  email: string;
  isSuperAdmin: boolean;
  name: string;
  role: 'SUPER_ADMIN' | 'FACILITY_MANAGER' | 'TECHNICIAN';
}

export interface CAFMAsset {
  id: string;
  code: string;
  name: string;
  category: 'HVAC' | 'ELEVATOR' | 'ENERGY_GRID' | 'SECURITY' | 'PLUMBING' | 'FIRE_SAFETY';
  location: string;
  floor: string;
  status: 'OPERATIONAL' | 'WARNING' | 'CRITICAL' | 'MAINTENANCE';
  healthScore: number; // 0 - 100%
  temperature?: number;
  powerUsageKw?: number;
  lastMaintenance: string;
  nextScheduled: string;
  serialNumber: string;
  vendor: string;
}

export interface CAFMWorkOrder {
  id: string;
  ticketNumber: string;
  title: string;
  assetName: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'PENDING_PARTS';
  assignedTo: string;
  createdDate: string;
  predictedFailureProb: number; // %
  description: string;
  location: string;
}

export interface CAFMSensorNode {
  id: string;
  nodeId: string;
  zone: string;
  type: 'TEMP_HUMIDITY' | 'CO2_AIR_QUALITY' | 'ENERGY_METER' | 'VIBRATION' | 'OCCUPANCY';
  currentValue: string;
  unit: string;
  status: 'ONLINE' | 'OFFLINE' | 'ALERT';
  lastPing: string;
}

export type LicenseStatus = 'AVAILABLE' | 'USED' | 'EXPIRED' | 'REVOKED';
export type LicensePlan = 'FREE' | 'PRO' | 'ENTERPRISE';

export interface LicenseKey {
  id: string;
  key: string;
  plan: LicensePlan;
  maxUsers: number;
  maxAssets: number;
  durationDays: number;
  expiresAt: string; // ISO date string
  status: LicenseStatus;
  usedByOrgId?: string;
  usedByOrgName?: string;
  usedAt?: string;
  usedByEmail?: string;
  usedByName?: string;
  generatedBy: string;
  generatedAt: string;
  notes?: string;
  revokedAt?: string;
  revokedBy?: string;
  revokedReason?: string;
}

export interface LicenseStats {
  total: number;
  available: number;
  used: number;
  revoked: number;
  expired: number;
  byPlan: Record<LicensePlan, number>;
}

export type Language = 'FR' | 'EN' | 'DE' | 'ES';

export type BackgroundTheme =
  | 'circuit'
  | 'building'
  | 'waves'
  | 'nodes'
  | 'brain'
  | 'map';

export type BrandVariant = 'CAFM Pro' | 'Sovereign Device Nexus' | 'ReclamTrack Pro';

export interface PricingPlan {
  id: string;
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  badge?: string;
  popular?: boolean;
  features: string[];
  description: string;
  ctaText: string;
}

export interface ComparisonRow {
  feature: string;
  starter: string | boolean;
  pro: string | boolean;
  enterprise: string | boolean;
}

export interface FAQItem {
  id: string;
  question: Record<Language, string>;
  answer: Record<Language, string>;
  category: 'general' | 'technical' | 'security' | 'billing';
}

export interface Article {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  date: string;
  readTime: string;
  author: string;
  image: string;
}

export interface ChangelogItem {
  id: string;
  version: string;
  title: string;
  date: string;
  tag: 'RELEASE' | 'PATCH' | 'FEATURE' | 'SECURITY';
  description: string;
  details: string[];
}

export interface Testimonial {
  id: string;
  quote: string;
  author: string;
  role: string;
  company: string;
  rating: number;
  industry: string;
}

export interface ArchNode {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  details: string[];
  metrics: { label: string; value: string; status?: 'normal' | 'warning' | 'good' }[];
  color: string;
}

export interface WorkspaceCalendarEvent {
  id?: string;
  summary: string;
  description?: string;
  location?: string;
  start: { dateTime: string; timeZone?: string };
  end: { dateTime: string; timeZone?: string };
  htmlLink?: string;
}

export interface WorkspaceContact {
  resourceName?: string;
  name: string;
  email?: string;
  phone?: string;
  organization?: string;
  role?: string;
  photoUrl?: string;
}

export interface WorkspaceSheetData {
  spreadsheetId: string;
  title: string;
  values: string[][];
  spreadsheetUrl?: string;
}
