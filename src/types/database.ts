// ===================== ENUMS =====================

export type UserRole =
  | 'SUPER_ADMIN'
  | 'ORG_MANAGER'
  | 'SITE_ADMIN'
  | 'COLLABORATOR'
  | 'TECHNICIAN'
  | 'CAFM_MANAGER'
  | 'AUDITOR'
  | 'CLIENT_VIEWER';

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING_INVITATION';

export type EnvironmentType =
  | 'BUILDING'
  | 'FLOOR'
  | 'ROOM'
  | 'ZONE'
  | 'TECHNICAL_ROOM'
  | 'RACK'
  | 'OUTDOOR_SITE'
  | 'INDUSTRIAL_SITE';

export type EnvironmentStatus = 'NORMAL' | 'PANNE' | 'INTERVENTION' | 'MAINTENANCE' | 'CLOSED';

export type CafmAssetType =
  | 'HVAC'
  | 'ELECTRICAL_PANEL'
  | 'UPS'
  | 'GENERATOR'
  | 'SERVER'
  | 'NETWORK_SWITCH'
  | 'PDU'
  | 'COOLING_UNIT'
  | 'FIRE_DETECTION'
  | 'ACCESS_CONTROL'
  | 'CCTV'
  | 'ELEVATOR'
  | 'PUMP'
  | 'COMPRESSOR'
  | 'BATTERY_BANK'
  | 'SENSOR'
  | 'OTHER';

export type AssetStatus = 'OPERATIONAL' | 'DEGRADED' | 'BROKEN' | 'MAINTENANCE' | 'RETIRED';

export type MaintenanceType =
  | 'PREVENTIVE'
  | 'CORRECTIVE'
  | 'PREDICTIVE'
  | 'CONDITION_BASED'
  | 'EMERGENCY'
  | 'INSPECTION';

export type AccessLevel = 'NONE' | 'VIEW' | 'COMMENT' | 'EDIT' | 'VALIDATE' | 'MANAGE' | 'OWNER';

export type ClaimPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type ClaimStatus = 'OPENED' | 'IN_PROGRESS' | 'PENDING_VALIDATION' | 'RESOLVED' | 'CLOSED' | 'CANCELLED';
export type ClaimSource = 'manual' | 'qr_scan' | 'iot_alert' | 'ai_prediction' | 'scheduled_inspection' | 'site_status_change';

// ===================== ENTITIES =====================

export interface Organization {
  id: string;
  name: string;
  slug: string;
  legalName?: string;
  taxId?: string;
  industry?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  city?: string;
  country: string;
  timezone: string;
  locale: string;
  currency: string;
  logo?: string;
  primaryColor: string;
  plan: 'trial' | 'starter' | 'pro' | 'enterprise';
  planExpiresAt?: string;
  seatsIncluded: number;
  seatsUsed: number;
  settings: Record<string, unknown>;
  isActive: boolean;
  onboardedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DBUser {
  id: string;
  firebaseUid: string;
  organizationId: string;
  email: string;
  emailVerified: boolean;
  firstName?: string;
  lastName?: string;
  displayName: string;
  avatar?: string;
  phone?: string;
  jobTitle?: string;
  department?: string;
  employeeId?: string;
  role: UserRole;
  status: UserStatus;
  managerId?: string;
  skills?: string[];
  certifications?: Certification[];
  preferredLanguage: string;
  timezone: string;
  notificationPreferences: NotificationPreferences;
  lastLoginAt?: string;
  lastActivityAt?: string;
  totalClaimsResolved: number;
  avgResolutionTimeMin?: number;
  satisfactionScore?: number;
  mfaEnabled: boolean;
  invitedById?: string;
  invitedAt?: string;
  acceptedAt?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface Certification {
  name: string;
  issuedAt: string;
  expiresAt?: string;
  issuer: string;
}

export interface NotificationPreferences {
  email?: boolean;
  push?: boolean;
  sms?: boolean;
  slack?: boolean;
}

export interface Environment {
  id: string;
  organizationId: string;
  parentId?: string;
  path?: string;
  depth: number;
  code: string;
  name: string;
  description?: string;
  type: EnvironmentType;
  address?: string;
  city?: string;
  postalCode?: string;
  country: string;
  latitude?: number;
  longitude?: number;
  surfaceArea?: number;
  volume?: number;
  height?: number;
  powerCapacity?: number;
  coolingCapacity?: number;
  networkCapacity?: number;
  status: EnvironmentStatus;
  healthScore: number;
  slaTier: 'CRITICAL' | 'HIGH' | 'STANDARD' | 'LOW';
  metadata: Record<string, unknown>;
  qrCode?: string;
  tags?: string[];
  photos?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CafmAsset {
  id: string;
  organizationId: string;
  environmentId: string;
  assetTag: string;
  serialNumber?: string;
  name: string;
  description?: string;
  type: CafmAssetType;
  category?: string;
  manufacturer?: string;
  model?: string;
  firmwareVersion?: string;
  installDate?: string;
  warrantyEndDate?: string;
  endOfLifeDate?: string;
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
  purchasePrice?: number;
  currentValue?: number;
  replacementCost?: number;
  specifications: Record<string, unknown>;
  status: AssetStatus;
  healthScore: number;
  ageMonths: number;
  location?: AssetLocation;
  iotDeviceId?: string;
  telemetryEnabled: boolean;
  lastTelemetryAt?: string;
  predictedFailureProbability?: number;
  aiRiskScore?: number;
  documents?: AssetDocument[];
  metadata: Record<string, unknown>;
  photos?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AssetLocation {
  floor?: number;
  room?: string;
  rack?: string;
  u_position?: string;
  x?: number;
  y?: number;
}

export interface AssetDocument {
  type: 'manual' | 'contract' | 'datasheet' | 'warranty' | 'report';
  url: string;
  name: string;
  uploadedAt: string;
}

export interface UserEnvironmentAssignment {
  id: string;
  organizationId: string;
  userId: string;
  environmentId: string;
  environmentRole: string;
  accessLevel: AccessLevel;
  permissions: Record<string, boolean>;
  validFrom?: string;
  validUntil?: string;
  isOnCall: boolean;
  onCallSchedule?: Record<string, string[]>;
  assignedById: string;
  assignedAt: string;
  isActive: boolean;
  createdAt: string;
}

export interface UserCafmAssignment {
  id: string;
  organizationId: string;
  userId: string;
  assetId: string;
  assignmentType: 'responsible_tech' | 'backup_tech' | 'supervisor' | 'inspector' | 'vendor_contact';
  isPrimary: boolean;
  canEdit: boolean;
  canCreateClaims: boolean;
  canResolveClaims: boolean;
  validFrom?: string;
  validUntil?: string;
  assignedById: string;
  assignedAt: string;
  isActive: boolean;
  createdAt: string;
}

export interface Claim {
  id: string;
  organizationId: string;
  environmentId: string;
  assetId?: string;
  title: string;
  description: string;
  category?: string;
  subcategory?: string;
  priority: ClaimPriority;
  impact?: 'low' | 'medium' | 'high' | 'critical';
  urgency?: 'low' | 'medium' | 'high' | 'critical';
  slaDueAt?: string;
  status: ClaimStatus;
  reportedById: string;
  reportedByName: string;
  reportedByEmail: string;
  reportedByRole: string;
  assignedTechId?: string;
  assignedTechName?: string;
  assignedAt?: string;
  validatedById?: string;
  validatedAt?: string;
  closedById?: string;
  closedAt?: string;
  source: ClaimSource;
  maintenanceType: MaintenanceType;
  firstResponseAt?: string;
  resolutionAt?: string;
  timeToResolveSec?: number;
  estimatedCost?: number;
  actualCost?: number;
  aiSuggested: boolean;
  aiConfidence?: number;
  aiRootCauseAnalysis?: string;
  aiRecommendedActions?: unknown[];
  attachments?: unknown[];
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AuditLogEntry {
  id: string;
  organizationId: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  action: string;
  resource: string;
  resourceId?: string;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  changes?: Record<string, unknown>;
  context?: {
    userAgent?: string;
    ipAddress?: string;
    location?: string;
    reason?: string;
  };
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  createdAt: string;
}

// UI helpers
export const ROLE_CONFIG: Record<UserRole, { label: string; color: string; icon: string; description: string }> = {
  SUPER_ADMIN:   { label: 'Super Admin',   color: 'bg-red-500/20 text-red-300 border-red-500/30',         icon: '👑', description: 'Tous les droits multi-tenant' },
  ORG_MANAGER:   { label: 'Org Manager',   color: 'bg-violet-500/20 text-violet-300 border-violet-500/30', icon: '👔', description: "Gère toute l'organisation" },
  SITE_ADMIN:    { label: 'Admin Site',    color: 'bg-purple-500/20 text-purple-300 border-purple-500/30', icon: '🏢', description: "Admin d'un ou plusieurs sites" },
  CAFM_MANAGER:  { label: 'Manager CAFM', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', icon: '🏗️', description: 'Gestion des actifs/équipements' },
  COLLABORATOR:  { label: 'Collaborateur', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30',       icon: '👤', description: 'Utilisateur métier' },
  TECHNICIAN:    { label: 'Technicien',    color: 'bg-orange-500/20 text-orange-300 border-orange-500/30', icon: '🔧', description: 'Intervention terrain' },
  AUDITOR:       { label: 'Auditeur',      color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',       icon: '📋', description: 'Lecture seule + rapports' },
  CLIENT_VIEWER: { label: 'Client',        color: 'bg-gray-500/20 text-gray-300 border-gray-500/30',       icon: '👁️', description: 'Accès externe limité' },
};

export const ASSET_STATUS_CONFIG: Record<AssetStatus, { label: string; color: string; icon: string }> = {
  OPERATIONAL: { label: 'Opérationnel', color: 'text-emerald-400', icon: '✅' },
  DEGRADED:    { label: 'Dégradé',      color: 'text-yellow-400',  icon: '⚠️' },
  BROKEN:      { label: 'En panne',     color: 'text-red-400',     icon: '❌' },
  MAINTENANCE: { label: 'Maintenance',  color: 'text-blue-400',    icon: '🔧' },
  RETIRED:     { label: 'Retraité',     color: 'text-gray-400',    icon: '📦' },
};

export const ENV_TYPE_LABELS: Record<EnvironmentType, string> = {
  BUILDING:        '🏢 Bâtiment',
  FLOOR:           '📐 Étage',
  ROOM:            '🚪 Salle',
  ZONE:            '🗺️ Zone',
  TECHNICAL_ROOM:  '⚙️ Local Technique',
  RACK:            '🖥️ Baie/Rack',
  OUTDOOR_SITE:    '🌳 Site Extérieur',
  INDUSTRIAL_SITE: '🏭 Site Industriel',
};
