import { SubscriptionTier, SubscriptionTierConfig, EntitlementFeatureKey, Therapist } from '../types';

export const SUBSCRIPTION_TIER_CONFIGS: Record<SubscriptionTier, SubscriptionTierConfig> = {
  starter: {
    id: 'tier_starter',
    tier: 'starter',
    name: 'Starter Practice',
    monthlyFeeINR: 0,
    activeClientCap: 5,
    allowedNoteTemplates: ['freeform'],
    analyticsDepthDays: 7,
    allowCustomDomain: false,
    allowWhatsAppAutomation: false,
    allowDynamicIntake: false,
    allowCsvExport: false,
    description: 'Essential toolkit for starting out with up to 5 clients.'
  },
  pro: {
    id: 'tier_pro',
    tier: 'pro',
    name: 'Professional',
    monthlyFeeINR: 1499,
    activeClientCap: 50,
    allowedNoteTemplates: ['freeform', 'soap', 'dap'],
    analyticsDepthDays: 90,
    allowCustomDomain: false,
    allowWhatsAppAutomation: true,
    allowDynamicIntake: true,
    allowCsvExport: true,
    description: 'Designed for independent practitioners with thriving caseloads.'
  },
  clinic: {
    id: 'tier_clinic',
    tier: 'clinic',
    name: 'Clinic / Group Practice',
    monthlyFeeINR: 3999,
    activeClientCap: -1, // Unlimited
    allowedNoteTemplates: ['freeform', 'soap', 'dap'],
    analyticsDepthDays: 365,
    allowCustomDomain: true,
    allowWhatsAppAutomation: true,
    allowDynamicIntake: true,
    allowCsvExport: true,
    description: 'Full-featured enterprise suite with unlimited caseload and deep cohort analytics.'
  }
};

export interface EntitlementCheckResult {
  allowed: boolean;
  featureKey: EntitlementFeatureKey;
  currentTier: SubscriptionTier;
  requiredTier?: SubscriptionTier;
  currentUsage?: number;
  limit?: number;
  reason?: string;
}

/**
 * The single source of truth for all feature access checks across Unfazed.
 * NEVER check tier strings directly in routes or components.
 */
export function checkFeatureAccess(
  therapist: Therapist | { currentTier: SubscriptionTier },
  featureKey: EntitlementFeatureKey,
  context?: { currentActiveClients?: number; requestedTemplate?: 'freeform' | 'soap' | 'dap' }
): EntitlementCheckResult {
  const currentTier = therapist.currentTier || 'starter';
  const config = SUBSCRIPTION_TIER_CONFIGS[currentTier];

  switch (featureKey) {
    case 'active_clients': {
      const currentCount = context?.currentActiveClients ?? 0;
      if (config.activeClientCap === -1) {
        return { allowed: true, featureKey, currentTier, currentUsage: currentCount, limit: Infinity };
      }
      const allowed = currentCount < config.activeClientCap;
      return {
        allowed,
        featureKey,
        currentTier,
        requiredTier: allowed ? undefined : 'pro',
        currentUsage: currentCount,
        limit: config.activeClientCap,
        reason: allowed
          ? undefined
          : `You have reached the ${config.activeClientCap} active clients limit on the ${config.name} plan. Upgrade to Professional to add up to 50 clients.`
      };
    }

    case 'soap_dap_templates': {
      const requested = context?.requestedTemplate || 'soap';
      if (requested === 'freeform') {
        return { allowed: true, featureKey, currentTier };
      }
      const allowed = config.allowedNoteTemplates.includes(requested);
      return {
        allowed,
        featureKey,
        currentTier,
        requiredTier: allowed ? undefined : 'pro',
        reason: allowed
          ? undefined
          : `Clinical SOAP & DAP documentation templates require the Professional plan. Starter is limited to freeform notes.`
      };
    }

    case 'advanced_analytics': {
      const allowed = config.analyticsDepthDays > 7;
      return {
        allowed,
        featureKey,
        currentTier,
        requiredTier: allowed ? undefined : 'pro',
        reason: allowed
          ? undefined
          : `90-day deep analytics, revenue trends, and no-show pipeline metrics require the Professional plan.`
      };
    }

    case 'whatsapp_automation': {
      const allowed = config.allowWhatsAppAutomation;
      return {
        allowed,
        featureKey,
        currentTier,
        requiredTier: allowed ? undefined : 'pro',
        reason: allowed
          ? undefined
          : `Automated WhatsApp appointment confirmations and 24h reminders are enabled on Professional and Clinic plans.`
      };
    }

    case 'custom_domain': {
      const allowed = config.allowCustomDomain;
      return {
        allowed,
        featureKey,
        currentTier,
        requiredTier: allowed ? undefined : 'clinic',
        reason: allowed
          ? undefined
          : `Custom branded domain (e.g., yourclinic.com) requires the Clinic / Group Practice plan.`
      };
    }

    case 'csv_export': {
      const allowed = config.allowCsvExport;
      return {
        allowed,
        featureKey,
        currentTier,
        requiredTier: allowed ? undefined : 'pro',
        reason: allowed
          ? undefined
          : `Exporting clinical client lists and GST invoice records requires the Professional plan.`
      };
    }

    default:
      return { allowed: true, featureKey, currentTier };
  }
}
