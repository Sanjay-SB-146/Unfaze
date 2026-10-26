export const SUBSCRIPTION_TIERS = {
  starter: {
    name: 'Starter Practice',
    activeClientCap: 5,
    allowedNoteTemplates: ['freeform'],
    analyticsDepthDays: 7,
    allowWhatsAppAutomation: false
  },
  pro: {
    name: 'Professional',
    activeClientCap: 50,
    allowedNoteTemplates: ['freeform', 'soap', 'dap'],
    analyticsDepthDays: 90,
    allowWhatsAppAutomation: true
  },
  clinic: {
    name: 'Clinic / Group',
    activeClientCap: -1,
    allowedNoteTemplates: ['freeform', 'soap', 'dap'],
    analyticsDepthDays: 365,
    allowWhatsAppAutomation: true
  }
};

export const canAccess = (therapist, featureKey, context = {}) => {
  const tier = therapist.currentTier || 'starter';
  const config = SUBSCRIPTION_TIERS[tier];

  if (featureKey === 'active_clients') {
    const count = context.currentActiveClients || 0;
    if (config.activeClientCap === -1) return { allowed: true };
    return {
      allowed: count < config.activeClientCap,
      limit: config.activeClientCap,
      reason: `Client limit reached on ${config.name} plan.`
    };
  }

  if (featureKey === 'soap_dap_templates') {
    const requested = context.requestedTemplate || 'soap';
    const allowed = config.allowedNoteTemplates.includes(requested);
    return {
      allowed,
      reason: 'SOAP & DAP templates require Professional tier.'
    };
  }

  return { allowed: true };
};
