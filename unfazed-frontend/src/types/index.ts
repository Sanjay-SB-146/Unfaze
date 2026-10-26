export type SubscriptionTier = 'starter' | 'pro' | 'clinic';

export interface SubscriptionTierConfig {
  id: string;
  tier: SubscriptionTier;
  name: string;
  monthlyFeeINR: number;
  activeClientCap: number; // e.g. 5 for starter, 50 for pro, -1 for unlimited
  allowedNoteTemplates: ('freeform' | 'soap' | 'dap')[];
  analyticsDepthDays: number; // 7, 90, 365
  allowCustomDomain: boolean;
  allowWhatsAppAutomation: boolean;
  allowDynamicIntake: boolean;
  allowCsvExport: boolean;
  description: string;
}

export type EntitlementFeatureKey =
  | 'active_clients'
  | 'soap_dap_templates'
  | 'advanced_analytics'
  | 'whatsapp_automation'
  | 'custom_domain'
  | 'csv_export';

export interface ServiceOffering {
  id: string;
  title: string;
  durationMinutes: number;
  feeINR: number;
  description: string;
  mode: 'online' | 'in_person' | 'both';
}

export interface Therapist {
  id: string;
  email: string;
  name: string;
  slug: string;
  title: string;
  bio: string;
  specializations: string[];
  languages: string[];
  qualifications: string[];
  experienceYears: number;
  sessionFeeINR: number;
  avatarUrl: string;
  location: string;
  phone: string;
  gstin?: string;
  panNumber?: string;
  currentTier: SubscriptionTier;
  services: ServiceOffering[];
  createdAt: string;
}

export interface WeeklyAvailabilityDay {
  dayOfWeek: number; // 0 = Sunday, 1 = Monday ... 6 = Saturday
  enabled: boolean;
  startTime: string; // "09:00"
  endTime: string; // "18:00"
  breaks: { start: string; end: string }[];
}

export interface Availability {
  id: string;
  therapistId: string;
  weeklySchedule: WeeklyAvailabilityDay[];
  bufferMinutes: number; // 15
  sessionDurations: number[]; // [30, 45, 60, 90]
  blockedDates: string[]; // ["2026-11-01"]
  clientTimezones: string[];
}

export interface IntakeData {
  age: number;
  gender: string;
  occupation: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  presentingConcerns: string[];
  primaryGoal: string;
  previousTherapyExperience: string;
  medicalConditions: string;
  suicidalIdeationHistory: 'none' | 'past' | 'recent';
}

export interface ConsentRecord {
  signed: boolean;
  signedAt: string;
  signerName: string;
  ipAddress: string;
  version: string;
  termsAccepted: string[];
}

export interface Client {
  id: string;
  therapistId: string;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive' | 'on_hold' | 'completed';
  tags: string[];
  lastSessionDate?: string;
  totalSessionsCount: number;
  intakeCompleted: boolean;
  intakeData?: IntakeData;
  consentRecord?: ConsentRecord;
  createdAt: string;
}

export type SessionStatus = 'scheduled' | 'completed' | 'cancelled' | 'no_show';

export interface Session {
  id: string;
  therapistId: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  date: string; // "2026-10-28"
  startTime: string; // "14:00"
  endTime: string; // "14:50"
  durationMinutes: number;
  serviceTitle: string;
  status: SessionStatus;
  mode: 'online' | 'in_person';
  meetingLink?: string;
  location?: string;
  feeINR: number;
  paymentStatus: 'paid' | 'pending' | 'waived';
  paymentId?: string;
  clientTimezone?: string;
  createdAt: string;
}

export interface SessionNote {
  id: string;
  therapistId: string;
  clientId: string;
  sessionId?: string;
  sessionDate: string;
  type: 'private' | 'shared'; // Private notes must NEVER be exposed on client portal
  format: 'freeform' | 'soap' | 'dap';
  title: string;
  // Freeform content
  freeformContent?: string;
  // SOAP content
  soap?: {
    subjective: string;
    objective: string;
    assessment: string;
    plan: string;
  };
  // DAP content
  dap?: {
    data: string;
    assessment: string;
    plan: string;
  };
  sharedHomework?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  therapistId: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  sessionId?: string;
  packageId?: string;
  amountINR: number;
  currency: 'INR';
  gatewayTransactionId: string;
  platformFeeINR: number;
  netAmountINR: number;
  status: 'captured' | 'failed' | 'refunded' | 'pending';
  invoiceNumber: string;
  gstDetails: {
    sacCode: string;
    cgstINR: number;
    sgstINR: number;
    igstINR: number;
    therapistGSTIN: string;
  };
  createdAt: string;
}

export interface TherapyPackage {
  id: string;
  therapistId: string;
  title: string;
  sessionCount: number; // 3, 6, 12
  totalFeeINR: number;
  perSessionRateINR: number;
  savingsPercent: number;
  validityDays: number;
  description: string;
}

export interface ClientPackage {
  id: string;
  therapistId: string;
  clientId: string;
  packageId: string;
  title: string;
  totalSessions: number;
  usedSessions: number;
  remainingSessions: number;
  purchasedAt: string;
  expiresAt: string;
  status: 'active' | 'exhausted' | 'expired';
}

export interface NotificationEvent {
  id: string;
  type: 'BOOKING_CONFIRMED' | 'REMINDER_24HR' | 'POST_SESSION_FOLLOWUP' | 'PAYMENT_RECEIVED' | 'WAITLIST_ALERT';
  recipientType: 'client' | 'therapist';
  recipientName: string;
  recipientPhone: string;
  recipientEmail: string;
  channel: 'whatsapp' | 'email' | 'both';
  status: 'queued' | 'dispatched' | 'delivered';
  title: string;
  message: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface ChatMessage {
  id: string;
  therapistId: string;
  clientId: string;
  senderRole: 'therapist' | 'client';
  senderName: string;
  text: string;
  timestamp: string;
  read: boolean;
}

export interface WaitlistEntry {
  id: string;
  therapistId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  preferredDays: string[];
  preferredTimeSlot: string;
  notes: string;
  createdAt: string;
  status: 'waiting' | 'offered' | 'booked';
}

export interface AnalyticsSummary {
  periodDays: number;
  totalRevenueINR: number;
  previousPeriodRevenueINR: number;
  revenueGrowthPercent: number;
  activeClientsCount: number;
  activeClientsCap: number;
  totalSessionsCompleted: number;
  noShowCount: number;
  noShowRatePercent: number;
  monthlyRevenueSeries: { month: string; revenue: number; sessions: number }[];
  clientStatusDistribution: { status: string; count: number }[];
  popularSpecializations: { name: string; sessionCount: number }[];
  attendanceBreakdown: { completed: number; scheduled: number; cancelled: number; no_show: number };
}
