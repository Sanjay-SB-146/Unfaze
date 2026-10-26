import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { SUBSCRIPTION_TIER_CONFIGS } from '../../services/entitlementService';
import { Check, X, Sparkles, Shield, ArrowRight } from 'lucide-react';

export const UpgradeModal: React.FC = () => {
  const { therapist, upgradeModalOpen, upgradeModalReason, closeUpgradeModal, upgradeTier } = useAuth();

  if (!upgradeModalOpen) return null;

  const currentTier = therapist?.currentTier || 'starter';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 relative">
          <button
            onClick={closeUpgradeModal}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-teal-400" />
            <span className="text-xs uppercase tracking-wider font-semibold text-teal-400">
              Entitlement Protection Gate
            </span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white">
            Upgrade Your Practice Tier
          </h2>
          <p className="text-sm text-slate-300 mt-1 max-w-lg">
            {upgradeModalReason || 'Unlock advanced clinical documentation, high-capacity client CRM, and real aggregation analytics.'}
          </p>
        </div>

        {/* Tier Comparison */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 border-b border-slate-200">
          {/* Pro Plan */}
          <div className={`p-5 rounded-lg border bg-white transition-all ${currentTier === 'pro' ? 'border-teal-600 ring-2 ring-teal-500/20' : 'border-slate-300'}`}>
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Professional</h3>
                <p className="text-xs text-slate-500">For thriving private practitioners</p>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200">
                Most Popular
              </span>
            </div>
            <div className="mb-4">
              <span className="text-2xl font-bold font-mono text-slate-900">₹1,499</span>
              <span className="text-xs text-slate-500"> / month</span>
            </div>
            <ul className="space-y-2 text-xs text-slate-600 mb-5">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-teal-600 shrink-0" />
                <span>Up to <strong>50 active clients</strong></span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-teal-600 shrink-0" />
                <span><strong>SOAP & DAP</strong> structured notes</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-teal-600 shrink-0" />
                <span><strong>90-day</strong> revenue & no-show trends</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-teal-600 shrink-0" />
                <span>Automated <strong>WhatsApp reminders</strong></span>
              </li>
            </ul>
            {currentTier === 'pro' ? (
              <button
                disabled
                className="w-full py-2 px-3 text-xs font-medium text-slate-500 bg-slate-100 rounded-lg text-center"
              >
                Current Active Plan
              </button>
            ) : (
              <button
                onClick={async () => {
                  await upgradeTier('pro');
                  closeUpgradeModal();
                }}
                className="w-full py-2 px-3 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg text-center shadow-sm transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Select Professional Tier</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Clinic Plan */}
          <div className={`p-5 rounded-lg border bg-white transition-all ${currentTier === 'clinic' ? 'border-teal-600 ring-2 ring-teal-500/20' : 'border-slate-300'}`}>
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Clinic / Group</h3>
                <p className="text-xs text-slate-500">For multi-therapist setups</p>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                Enterprise
              </span>
            </div>
            <div className="mb-4">
              <span className="text-2xl font-bold font-mono text-slate-900">₹3,999</span>
              <span className="text-xs text-slate-500"> / month</span>
            </div>
            <ul className="space-y-2 text-xs text-slate-600 mb-5">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-teal-600 shrink-0" />
                <span><strong>Unlimited</strong> active clients</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-teal-600 shrink-0" />
                <span>Custom domain (e.g. <strong>drsharma.in</strong>)</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-teal-600 shrink-0" />
                <span>365-day cohort retention analytics</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-teal-600 shrink-0" />
                <span>Full CSV export for GST auditors</span>
              </li>
            </ul>
            {currentTier === 'clinic' ? (
              <button
                disabled
                className="w-full py-2 px-3 text-xs font-medium text-slate-500 bg-slate-100 rounded-lg text-center"
              >
                Current Active Plan
              </button>
            ) : (
              <button
                onClick={async () => {
                  await upgradeTier('clinic');
                  closeUpgradeModal();
                }}
                className="w-full py-2 px-3 text-xs font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg text-center transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Select Clinic Tier</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Footer info */}
        <div className="p-4 bg-white flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-slate-400" />
            <span>Cancel anytime · Config-driven Entitlement Engine (No hardcoded values)</span>
          </div>
          <button
            onClick={closeUpgradeModal}
            className="text-slate-600 hover:text-slate-900 font-medium"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};
