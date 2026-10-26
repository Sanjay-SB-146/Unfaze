import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../api/client';
import { Session, Client, Payment, AnalyticsSummary } from '../../types';
import {
  Calendar,
  Users,
  CreditCard,
  FileText,
  Clock,
  Video,
  ArrowUpRight,
  TrendingUp,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Plus
} from 'lucide-react';
import { InvoiceModal } from '../../components/common/InvoiceModal';

interface DashboardProps {
  onNavigateTab: (tab: string) => void;
  onOpenNotifications: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigateTab, onOpenNotifications }) => {
  const { therapist, setActiveRole, triggerUpgradeModal } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Payment | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!therapist) return;
    const loadOverview = async () => {
      try {
        setIsLoading(true);
        const data = await apiRequest<AnalyticsSummary>(`/analytics?therapistId=${therapist.id}&periodDays=90`);
        setAnalytics(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    loadOverview();
  }, [therapist]);

  return (
    <div className="space-y-6">
      {/* Welcome & Practice Branded Link Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider text-teal-400 font-semibold font-mono">
                Practice Management Hub
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-xs text-slate-300">Unfazed Cloud</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {therapist?.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              {therapist?.title} · Your custom branded booking link is live and accepting appointments across timezones.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3 text-xs">
              <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700 font-mono">
                <span className="text-slate-400">Public Link:</span>
                <span className="text-teal-300 font-bold">unfazed.in/{therapist?.slug}</span>
              </div>
              <button
                onClick={() => setActiveRole('public_profile')}
                className="flex items-center gap-1.5 bg-teal-700 hover:bg-teal-600 text-white px-3.5 py-1.5 rounded-lg font-semibold transition-colors shadow-sm"
              >
                <span>Preview Client Page</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Tier Status Card */}
          <div className="bg-slate-800/90 border border-slate-700 rounded-xl p-4 sm:p-5 text-xs space-y-3 shrink-0 min-w-[260px]">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Current Entitlement:</span>
              <span className="px-2 py-0.5 rounded font-bold uppercase tracking-wider text-[11px] bg-teal-500/20 text-teal-300 border border-teal-500/30">
                {therapist?.currentTier} Tier
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-slate-300">
                <span>Active Clients</span>
                <span className="font-mono">{analytics?.activeClientsCount || 4} / {therapist?.currentTier === 'starter' ? '5' : '50'}</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-teal-400 h-1.5 rounded-full"
                  style={{
                    width: `${Math.min(
                      100,
                      ((analytics?.activeClientsCount || 4) / (therapist?.currentTier === 'starter' ? 5 : 50)) * 100
                    )}%`
                  }}
                />
              </div>
            </div>

            <div className="pt-1 flex items-center justify-between text-[11px]">
              <span className="text-slate-400">SOAP/DAP Templates:</span>
              <span className={`font-semibold ${therapist?.currentTier === 'starter' ? 'text-amber-400' : 'text-emerald-400'}`}>
                {therapist?.currentTier === 'starter' ? 'Locked (Freeform only)' : 'Unlocked'}
              </span>
            </div>

            {therapist?.currentTier === 'starter' && (
              <button
                onClick={() => triggerUpgradeModal('Unlock 50 clients and SOAP/DAP clinical documentation.')}
                className="w-full py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold rounded-lg text-center transition-all shadow-sm"
              >
                Upgrade to Professional
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Quick Action Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => onNavigateTab('schedule')}
          className="p-3.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-left transition-colors flex items-center justify-between"
        >
          <div>
            <span className="text-[11px] text-slate-500 block">Manage Slots</span>
            <span className="font-bold text-xs text-slate-900">Schedule & Calendar</span>
          </div>
          <Calendar className="w-4 h-4 text-teal-700" />
        </button>

        <button
          onClick={() => onNavigateTab('clients')}
          className="p-3.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-left transition-colors flex items-center justify-between"
        >
          <div>
            <span className="text-[11px] text-slate-500 block">Caseload CRM</span>
            <span className="font-bold text-xs text-slate-900">Client Directory</span>
          </div>
          <Users className="w-4 h-4 text-teal-700" />
        </button>

        <button
          onClick={() => onNavigateTab('notes')}
          className="p-3.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-left transition-colors flex items-center justify-between"
        >
          <div>
            <span className="text-[11px] text-slate-500 block">Documentation</span>
            <span className="font-bold text-xs text-slate-900">Write SOAP Note</span>
          </div>
          <FileText className="w-4 h-4 text-teal-700" />
        </button>

        <button
          onClick={() => onNavigateTab('analytics')}
          className="p-3.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-left transition-colors flex items-center justify-between"
        >
          <div>
            <span className="text-[11px] text-slate-500 block">Practice Metrics</span>
            <span className="font-bold text-xs text-slate-900">Aggregations</span>
          </div>
          <TrendingUp className="w-4 h-4 text-teal-700" />
        </button>
      </div>

      {/* Today's Clinical Schedule */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-teal-700" />
            <h2 className="font-bold text-slate-900 text-sm">Today's Scheduled Consultations (Wednesday, Oct 28)</h2>
          </div>
          <button
            onClick={() => onNavigateTab('schedule')}
            className="text-xs font-semibold text-teal-800 hover:text-teal-900"
          >
            View Full Calendar →
          </button>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors">
            <div className="flex items-center gap-3">
              <span className="font-mono font-bold text-slate-900 text-sm w-16">11:00 AM</span>
              <div>
                <h4 className="font-bold text-slate-900">Priya Patel</h4>
                <p className="text-[11px] text-slate-500">
                  Individual Therapy · Telehealth Video Link Active · Advance Paid
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-center">
              <a
                href="https://meet.unfazed.in/room/sharma-patel-8472"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-lg font-semibold text-xs shadow-xs"
              >
                Start Telehealth Room
              </a>
              <button
                onClick={() => onNavigateTab('notes')}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium text-xs"
              >
                Open SOAP Note
              </button>
            </div>
          </div>

          <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors">
            <div className="flex items-center gap-3">
              <span className="font-mono font-bold text-slate-900 text-sm w-16">02:00 PM</span>
              <div>
                <h4 className="font-bold text-slate-900">Rohan Sengupta</h4>
                <p className="text-[11px] text-slate-500">
                  Workplace Burnout & Executive Stress · Online Consultation
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-center">
              <button
                onClick={() => onNavigateTab('notes')}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium text-xs"
              >
                Prepare Notes
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications Queue Preview */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            WA
          </div>
          <div>
            <h3 className="font-bold text-xs text-slate-900">Event-Driven Notifications Queue</h3>
            <p className="text-[11px] text-slate-500">
              Automated WhatsApp reminders and booking receipts dispatched in real-time.
            </p>
          </div>
        </div>

        <button
          onClick={onOpenNotifications}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs"
        >
          Inspect Notification Queue & Logs
        </button>
      </div>

      {selectedInvoice && (
        <InvoiceModal payment={selectedInvoice} onClose={() => setSelectedInvoice(null)} />
      )}
    </div>
  );
};
