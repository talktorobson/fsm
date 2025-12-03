/**
 * Yellow Grid Mobile - Service Order Types
 * Aligned with the platform API v2.1
 */

export interface ServiceOrder {
  id: string;
  externalId: string;
  projectId?: string;
  countryCode: string;
  businessUnit?: string;
  buCode?: string;

  // Status & Type
  status: ServiceOrderStatus;
  state: ServiceOrderState;
  serviceType: ServiceType;
  urgency: Urgency;

  // Scheduling
  scheduledDate?: string;
  scheduledTimeSlot?: TimeWindow;
  estimatedDuration?: number; // minutes

  // Customer & Location
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  customerAddress?: string;
  customerInfo?: CustomerInfo;
  serviceAddress?: ServiceAddress;
  contacts?: Contact[];

  // Order contents
  lineItems?: LineItem[];
  totalAmountCustomer?: number;
  totalAmountCustomerExclTax?: number;
  totalTaxCustomer?: number;
  totalAmountProvider?: number;
  totalMargin?: number;
  marginPercent?: number;
  currency?: string;

  // Sales Context
  salesOrderId?: string;
  salesOrderNumber?: string;
  salesSystemSource?: string;
  salesChannel?: 'IN_STORE' | 'ONLINE' | 'PHONE' | 'FIELD_SALES';
  orderDate?: string;
  store?: Store;
  salesSystem?: SalesSystem;

  // Delivery Status
  productDeliveryStatusEnum?: 'PENDING' | 'IN_TRANSIT' | 'DELIVERED';
  allProductsDelivered?: boolean;
  earliestDeliveryDate?: string;
  latestDeliveryDate?: string;
  deliveryBlocksExecution?: boolean;

  // Payment
  paymentStatus?: 'PENDING' | 'PARTIAL' | 'PAID' | 'REFUNDED';
  paymentMethod?: string;
  paidAmount?: number;
  paymentReference?: string;
  paidAt?: string;

  // Go Execution Status
  goExecStatus?: 'OK' | 'NOK' | 'DEROGATION';
  goExecBlockReason?: string;
  goExecBlockedAt?: string;
  goExecOverriddenAt?: string;
  goExecOverriddenBy?: string;

  // AI Assessments
  riskLevel?: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  riskScore?: number;
  riskFactors?: Record<string, unknown>;
  riskAssessedAt?: string;
  riskAcknowledgedAt?: string;
  salesPotential?: 'LOW' | 'MEDIUM' | 'HIGH';
  salesPotentialScore?: number;
  salesPreEstimationValue?: number;
  salesPotentialUpdatedAt?: string;
  salesmanNotes?: string;

  // Technical Visit Outcome (for TV type)
  tvOutcome?: 'YES' | 'YES_BUT' | 'NO';
  tvFindings?: string;
  tvIssues?: string;
  tvRequiredActions?: string;
  tvScopeChanges?: string;
  tvEstimatedValue?: number;
  tvRecordedAt?: string;

  // Assignment
  assignedProviderId?: string;
  assignedProviderName?: string;
  assignedWorkTeamId?: string;
  assignedTechnicianId?: string;
  assignedTechnicianName?: string;

  // Execution
  checkInId?: string;
  checkInTime?: string;
  checkOutId?: string;
  checkOutTime?: string;
  executionStatus?: ExecutionStatus;

  // Checklists
  checklists?: ChecklistSummary[];
  hasIncompleteChecklists?: boolean;

  // Media & Documents
  attachmentsCount?: number;
  photosCount?: number;
  notesCount?: number;

  // WCF
  wcfId?: string;
  wcfStatus?: 'PENDING' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';

  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export enum ServiceOrderStatus {
  CREATED = 'CREATED',
  SCHEDULED = 'SCHEDULED',
  ASSIGNED = 'ASSIGNED',
  ACCEPTED = 'ACCEPTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  VALIDATED = 'VALIDATED',
  CLOSED = 'CLOSED',
  CANCELLED = 'CANCELLED',
}

export enum ServiceOrderState {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  BLOCKED = 'BLOCKED',
  ON_HOLD = 'ON_HOLD',
  FINISHED = 'FINISHED',
}

export enum ServiceType {
  TECHNICAL_VISIT = 'TECHNICAL_VISIT',
  INSTALLATION = 'INSTALLATION',
  MAINTENANCE = 'MAINTENANCE',
  REPAIR = 'REPAIR',
  DIAGNOSTIC = 'DIAGNOSTIC',
  REMOVAL = 'REMOVAL',
}

export enum Urgency {
  URGENT = 'URGENT',     // 24-48h response
  STANDARD = 'STANDARD', // 3-7 days
  LOW = 'LOW',           // flexible
}

export enum ExecutionStatus {
  NOT_STARTED = 'NOT_STARTED',
  CHECKED_IN = 'CHECKED_IN',
  IN_PROGRESS = 'IN_PROGRESS',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  CHECKED_OUT = 'CHECKED_OUT',
}

export interface TimeWindow {
  start: string;
  end: string;
  timezone?: string;
}

export interface CustomerInfo {
  id?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  preferredContactMethod?: 'EMAIL' | 'PHONE' | 'SMS' | 'WHATSAPP';
  address?: {
    street?: string;
    city?: string;
    postalCode?: string;
    country?: string;
  };
}

export interface ServiceAddress {
  street: string;
  streetNumber?: string;
  apartment?: string;
  floor?: string;
  building?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  lat?: number;
  lng?: number;
  accessInstructions?: string;
  accessCode?: string;
  parkingInfo?: string;
}

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  title?: string;
  phone?: string;
  mobile?: string;
  email?: string;
  whatsapp?: string;
  contactType: 'CUSTOMER' | 'SITE_CONTACT' | 'BILLING' | 'EMERGENCY';
  isPrimary: boolean;
  preferredMethod?: string;
  availabilityNotes?: string;
}

export interface LineItem {
  id: string;
  lineNumber: number;
  lineType: 'PRODUCT' | 'SERVICE';
  sku: string;
  name: string;
  description?: string;
  productBrand?: string;
  productModel?: string;
  quantity: number;
  unitOfMeasure: string;
  unitPriceCustomer: number;
  lineTotalCustomer: number;
  taxRateCustomer: number;
  deliveryStatus?: 'PENDING' | 'IN_TRANSIT' | 'DELIVERED';
  executionStatus?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
}

export interface Store {
  id: string;
  code: string;
  name: string;
  buCode: string;
}

export interface SalesSystem {
  code: string;
  name: string;
}

export interface ChecklistSummary {
  id: string;
  name: string;
  totalItems: number;
  completedItems: number;
  isCompleted: boolean;
  isMandatory: boolean;
}

// Execution related types
export interface CheckIn {
  id: string;
  serviceOrderId: string;
  technicianId: string;
  checkInTime: string;
  location?: GeoLocation;
  locationVerified: boolean;
  customerPresent: boolean;
  customerSignature?: string;
  arrivalPhotos: Photo[];
  safetyHazards: SafetyHazard[];
  siteAccessNotes?: string;
  syncedAt?: string;
}

export interface CheckOut {
  id: string;
  serviceOrderId: string;
  checkInId: string;
  technicianId: string;
  checkOutTime: string;
  completionStatus: CompletionStatus;
  workPerformed: WorkSummary;
  materialsUsed: MaterialUsage[];
  timeOnSite: number; // minutes
  departurePhotos: Photo[];
  customerSignature?: string;
  customerFeedback?: CustomerFeedback;
  nextSteps: NextStep[];
  syncedAt?: string;
}

export enum CompletionStatus {
  COMPLETED = 'COMPLETED',
  PARTIALLY_COMPLETED = 'PARTIALLY_COMPLETED',
  INCOMPLETE = 'INCOMPLETE',
  CANCELLED = 'CANCELLED',
  REQUIRES_FOLLOWUP = 'REQUIRES_FOLLOWUP',
}

export interface WorkSummary {
  description: string;
  tasksCompleted: string[];
  tasksIncomplete: string[];
  issuesEncountered: string[];
  resolutionNotes?: string;
  workDuration: number; // minutes
  breakDuration: number; // minutes
}

export interface MaterialUsage {
  materialId?: string;
  materialName: string;
  quantity: number;
  unit: string;
  serialNumbers?: string[];
  installed: boolean;
  removed: boolean;
}

export interface CustomerFeedback {
  rating: number; // 1-5
  satisfactionLevel: 'VERY_SATISFIED' | 'SATISFIED' | 'NEUTRAL' | 'DISSATISFIED' | 'VERY_DISSATISFIED';
  comments?: string;
  concerns?: string[];
}

export interface NextStep {
  action: string;
  type: 'FOLLOWUP' | 'INSPECTION' | 'REPAIR' | 'QUOTE' | 'CALLBACK';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  dueDate?: string;
  assignee?: string;
}

export interface GeoLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude?: number;
  timestamp: string;
}

export interface Photo {
  id: string;
  uri: string;
  type: 'ARRIVAL' | 'WORK' | 'COMPLETION' | 'BEFORE' | 'AFTER' | 'ISSUE' | 'EQUIPMENT';
  caption?: string;
  timestamp: string;
  location?: GeoLocation;
  uploaded: boolean;
  uploadUrl?: string;
}

export interface SafetyHazard {
  type: string;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  mitigationActions?: string[];
  reportedAt: string;
}

// Notes
export interface Note {
  id: string;
  serviceOrderId: string;
  content: string;
  type: 'TEXT' | 'VOICE';
  voiceUrl?: string;
  voiceDuration?: number;
  createdAt: string;
  createdBy: string;
  syncedAt?: string;
}

// Checklist types
export interface Checklist {
  id: string;
  name: string;
  version: string;
  serviceType: ServiceType;
  sections: ChecklistSection[];
  mandatory: boolean;
  estimatedDuration?: number;
}

export interface ChecklistSection {
  id: string;
  name: string;
  order: number;
  items: ChecklistItem[];
  mandatory: boolean;
}

export interface ChecklistItem {
  id: string;
  order: number;
  question: string;
  description?: string;
  responseType: 'BOOLEAN' | 'CHOICE' | 'TEXT' | 'NUMERIC' | 'PHOTO' | 'SIGNATURE';
  options?: string[];
  mandatory: boolean;
  photosRequired: boolean;
  minPhotos?: number;
  helpText?: string;
}

export interface ChecklistResponse {
  itemId: string;
  response: unknown;
  photos?: Photo[];
  notes?: string;
  completedAt: string;
}
