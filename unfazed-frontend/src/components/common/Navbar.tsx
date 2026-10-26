import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserCheck, ExternalLink, Bell } from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenNotifications: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  onOpenNotifications
}) => {
  const { therapist, activeRole, setActiveRole, switchTherapist, triggerUpgradeModal } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Top Clinical Utility Bar */}
      <div className="bg-slate-900 text-slate-300 text-xs px-4 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-slate-400">Practitioner:</span>
          <select
            value={therapist?.id || ''}
            onChange={(e) => switchTherapist(e.target.value)}
            className="bg-slate-800 text-white rounded px-2.5 py-1 border border-slate-700 text-xs focus:outline-none focus:border-teal-500 font-medium"
          >
            <option value="therapist_ananya_sharma">Dr. Ananya Sharma (Pro Tier)</option>
            <option value="therapist_kabir_mehta">Dr. Kabir Mehta (Starter Tier)</option>
          </select>
          <span className="text-slate-400 text-[11px] hidden md:inline ml-2">
            Subscription: <strong className="text-white capitalize">{therapist?.currentTier || 'pro'}</strong>
          </span>
          {therapist?.currentTier === 'starter' && (
            <button
              onClick={() => triggerUpgradeModal('Explore Pro features')}
              className="text-amber-300 hover:text-amber-200 text-[11px] underline ml-1"
            >
              Upgrade to Pro
            </button>
          )}
        </div>

        {/* View Experience Switchers */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-800 rounded p-0.5 border border-slate-700">
            <button
              onClick={() => setActiveRole('therapist')}
              className={`px-3 py-1 rounded text-xs transition-colors ${
                activeRole === 'therapist' ? 'bg-teal-600 text-white font-medium' : 'text-slate-300 hover:text-white'
              }`}
            >
              Therapist Dashboard
            </button>
            <button
              onClick={() => setActiveRole('public_profile')}
              className={`px-3 py-1 rounded text-xs transition-colors flex items-center gap-1 ${
                activeRole === 'public_profile' ? 'bg-teal-600 text-white font-medium' : 'text-slate-300 hover:text-white'
              }`}
            >
              Client Booking Page
              <ExternalLink className="w-3 h-3" />
            </button>
            <button
              onClick={() => setActiveRole('client_portal')}
              className={`px-3 py-1 rounded text-xs transition-colors flex items-center gap-1 ${
                activeRole === 'client_portal' ? 'bg-teal-600 text-white font-medium' : 'text-slate-300 hover:text-white'
              }`}
            >
              Client Portal
              <UserCheck className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Primary Navigation complying with Top Bar Contract */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => {
              setActiveRole('therapist');
              setCurrentTab('dashboard');
            }}
            className="text-left group"
          >
            <span className="text-xl font-bold tracking-tight text-slate-900 font-sans group-hover:text-teal-700 transition-colors">
              Unfazed<span className="text-teal-600">.</span>
            </span>
            <span className="block text-[11px] text-slate-500 font-normal tracking-wide">
              Practice Management Platform
            </span>
          </button>
        </div>

        {/* Zone 2: Navigation Links */}
        {activeRole === 'therapist' ? (
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {[
              { id: 'dashboard', label: 'Overview' },
              { id: 'schedule', label: 'Schedule & Slots' },
              { id: 'clients', label: 'Client CRM' },
              { id: 'notes', label: 'Clinical Documentation' },
              { id: 'payments', label: 'Billing & GST' },
              { id: 'analytics', label: 'Aggregations' },
              { id: 'chat', label: 'Client Messaging' },
              { id: 'settings', label: 'Practice Settings' }
            ].map((link) => (
              <button
                key={link.id}
                onClick={() => setCurrentTab(link.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                  currentTab === link.id
                    ? 'bg-slate-100 text-slate-900 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>
        ) : (
          <div className="flex items-center text-xs text-slate-600 gap-2">
            {activeRole === 'public_profile' && (
              <span>Public Branded Booking Link: <strong className="text-teal-700">unfazed.in/{therapist?.slug}</strong></span>
            )}
            {activeRole === 'client_portal' && (
              <span>Authenticated Client Session: <strong className="text-teal-700">Priya Patel (Client ID #priya_patel)</strong></span>
            )}
          </div>
        )}

        {/* Zone 3: Single Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenNotifications}
            title="View WhatsApp & Notification Queue"
            className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-teal-500 rounded-full" />
          </button>

          {activeRole === 'therapist' && (
            <button
              onClick={() => setActiveRole('public_profile')}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg shadow-sm transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
            >
              <span>View Branded Link</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}
          {activeRole !== 'therapist' && (
            <button
              onClick={() => setActiveRole('therapist')}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-colors whitespace-nowrap shrink-0"
            >
              Back to Dashboard
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
