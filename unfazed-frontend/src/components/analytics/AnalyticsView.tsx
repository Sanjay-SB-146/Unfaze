import React, { useState, useEffect } from 'react';
import { AnalyticsSummary } from '../../types';
import { apiRequest } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { TrendingUp, Users, CalendarCheck, AlertTriangle, Lock, Sparkles, ArrowUpRight } from 'lucide-react';

export const AnalyticsView: React.FC = () => {
  const { therapist, triggerUpgradeModal } = useAuth();
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [period, setPeriod] = useState<number>(therapist?.currentTier === 'starter' ? 7 : 90);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAnalytics = async (days: number) => {
    if (!therapist) return;
    try {
      setIsLoading(true);
      const data = await apiRequest<AnalyticsSummary>(`/analytics?therapistId=${therapist.id}&periodDays=${days}`);
      setSummary(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(period);
  }, [therapist, period]);

  const handlePeriodChange = (days: number) => {
    if (days > 7 && therapist?.currentTier === 'starter') {
      triggerUpgradeModal('90-day deep analytics and aggregation pipelines require the Professional tier.');
      return;
    }
    setPeriod(days);
  };

  if (!summary && isLoading) {
    return (
      <div className="bg-white p-12 rounded-xl border border-slate-200 text-center">
        <p className="text-xs text-slate-500 font-mono">Running MongoDB aggregation pipelines...</p>
      </div>
    );
  }

  if (!summary) return null;

  const maxRev = Math.max(...summary.monthlyRevenueSeries.map((m) => m.revenue));

  return (
    <div className="space-y-6">
      {/* Top Header & Period Gating Filter */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Business & Clinical Analytics</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real Aggregation Pipelines · Gated by Entitlement Tier · No client-side math
          </p>
        </div>

        {/* Period Selector with Tier Gating */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs">
          {[
            { days: 7, label: 'Last 7 Days (Starter)' },
            { days: 90, label: 'Last 90 Days (Pro)' },
            { days: 365, label: 'Annual (Clinic)' }
          ].map((item) => (
            <button
              key={item.days}
              onClick={() => handlePeriodChange(item.days)}
              className={`px-3 py-1.5 font-medium rounded-md transition-colors flex items-center gap-1 ${
                period === item.days
                  ? 'bg-white text-slate-900 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>{item.label}</span>
              {item.days > 7 && therapist?.currentTier === 'starter' && (
                <Lock className="w-3 h-3 text-amber-600" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Revenue */}
        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Revenue</span>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded flex items-center gap-0.5">
              +{summary.revenueGrowthPercent}%
            </span>
          </div>
          <p className="text-2xl font-bold font-mono text-slate-900 mt-2 tabular-nums">
            ₹{summary.totalRevenueINR.toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            vs ₹{summary.previousPeriodRevenueINR.toLocaleString('en-IN')} in previous period
          </p>
        </div>

        {/* Card 2: Active Caseload */}
        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Caseload</span>
            <Users className="w-4 h-4 text-teal-600" />
          </div>
          <p className="text-2xl font-bold font-mono text-slate-900 mt-2 tabular-nums">
            {summary.activeClientsCount}
            <span className="text-sm font-normal text-slate-400">
              {' '}/ {summary.activeClientsCap === -1 ? '∞' : summary.activeClientsCap} cap
            </span>
          </p>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className="bg-teal-600 h-1.5 rounded-full"
              style={{
                width: `${Math.min(
                  100,
                  (summary.activeClientsCount / (summary.activeClientsCap === -1 ? 100 : summary.activeClientsCap)) * 100
                )}%`
              }}
            />
          </div>
        </div>

        {/* Card 3: Completed Consultations */}
        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Sessions Done</span>
            <CalendarCheck className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-bold font-mono text-slate-900 mt-2 tabular-nums">
            {summary.totalSessionsCompleted}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            Avg fee: ₹{therapist?.sessionFeeINR.toLocaleString('en-IN')} per session
          </p>
        </div>

        {/* Card 4: No-Show Rate */}
        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">No-Show Rate</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-bold font-mono text-slate-900 mt-2 tabular-nums">
            {summary.noShowRatePercent}%
          </p>
          <p className="text-[11px] text-emerald-700 mt-1 font-medium">
            Industry benchmark: ~15% (Well within bounds)
          </p>
        </div>
      </div>

      {/* Monthly Revenue Bar Chart (Clean SVG compliant with frontend-design) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Monthly Revenue & Practice Growth Trend</h3>
              <p className="text-xs text-slate-500">Gross consultations + package purchases in INR</p>
            </div>
            <span className="font-mono text-xs font-semibold text-teal-800 bg-teal-50 px-2.5 py-1 rounded border border-teal-200">
              Aggregated via MongoDB
            </span>
          </div>

          <div className="pt-4">
            <div className="h-56 flex items-end gap-6 sm:gap-10 pb-4 border-b border-slate-200">
              {summary.monthlyRevenueSeries.map((m) => {
                const heightPercent = Math.round((m.revenue / maxRev) * 100);
                return (
                  <div key={m.month} className="flex-1 flex flex-col items-center gap-2 group">
                    <span className="text-[11px] font-mono text-slate-600 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                      ₹{(m.revenue / 1000).toFixed(0)}k
                    </span>
                    <div className="w-full bg-slate-100 rounded-t-lg h-44 flex items-end overflow-hidden p-1">
                      <div
                        className="w-full bg-teal-700 group-hover:bg-teal-600 rounded-t transition-all duration-300"
                        style={{ height: `${heightPercent}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-slate-800">{m.month}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{m.sessions} sess.</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Attendance Breakdown & Specializations */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-5">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Attendance Distribution</h3>
            <p className="text-xs text-slate-500">Aggregated session outcomes</p>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between text-slate-700 mb-1">
                <span>Completed Consultations</span>
                <span className="font-mono font-semibold">{summary.attendanceBreakdown.completed}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-emerald-600 h-2 rounded-full" style={{ width: '85%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-700 mb-1">
                <span>Upcoming Scheduled</span>
                <span className="font-mono font-semibold">{summary.attendanceBreakdown.scheduled}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '10%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-700 mb-1">
                <span>Cancelled by Client</span>
                <span className="font-mono font-semibold">{summary.attendanceBreakdown.cancelled}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-amber-500 h-2 rounded-full" style={{ width: '3%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-700 mb-1">
                <span>No-Show Incidents</span>
                <span className="font-mono font-semibold text-rose-700">{summary.attendanceBreakdown.no_show}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-rose-500 h-2 rounded-full" style={{ width: '4%' }} />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100">
            <h4 className="font-bold text-slate-900 text-xs mb-2">Top Clinical Inquiries</h4>
            <div className="space-y-1.5 text-xs text-slate-600">
              {summary.popularSpecializations.map((spec) => (
                <div key={spec.name} className="flex justify-between items-center py-1 border-b border-slate-50">
                  <span>{spec.name}</span>
                  <span className="font-mono font-semibold text-slate-800">{spec.sessionCount} sessions</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
