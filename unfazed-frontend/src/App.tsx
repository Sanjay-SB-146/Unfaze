import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/common/Navbar';
import { UpgradeModal } from './components/common/UpgradeModal';
import { WhatsAppQueueModal } from './components/common/WhatsAppQueueModal';

import { Dashboard } from './pages/therapist/Dashboard';
import { CalendarView } from './components/scheduling/CalendarView';
import { ClientTable } from './components/crm/ClientTable';
import { NoteEditor } from './components/notes/NoteEditor';
import { BillingPage } from './pages/therapist/BillingPage';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { ChatWindow } from './components/chat/ChatWindow';
import { SettingsPage } from './pages/therapist/SettingsPage';

import { BrandedPublicProfile } from './pages/client/BrandedPublicProfile';
import { ClientPortal } from './pages/client/ClientPortal';

function AppContent() {
  const { activeRole, isLoading } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [whatsappModalOpen, setWhatsappModalOpen] = useState<boolean>(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-slate-300 font-mono text-xs">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p>Initializing Unfazed SaaS Platform...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans">
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenNotifications={() => setWhatsappModalOpen(true)}
      />

      <main className="flex-1">
        {activeRole === 'public_profile' ? (
          <BrandedPublicProfile />
        ) : activeRole === 'client_portal' ? (
          <ClientPortal />
        ) : (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
            {currentTab === 'dashboard' && (
              <Dashboard
                onNavigateTab={(tab) => setCurrentTab(tab)}
                onOpenNotifications={() => setWhatsappModalOpen(true)}
              />
            )}
            {currentTab === 'schedule' && <CalendarView />}
            {currentTab === 'clients' && <ClientTable />}
            {currentTab === 'notes' && <NoteEditor />}
            {currentTab === 'payments' && <BillingPage />}
            {currentTab === 'analytics' && <AnalyticsView />}
            {currentTab === 'chat' && <ChatWindow />}
            {currentTab === 'settings' && <SettingsPage />}
          </div>
        )}
      </main>

      {/* Global Clinical & System Modals */}
      <UpgradeModal />
      <WhatsAppQueueModal isOpen={whatsappModalOpen} onClose={() => setWhatsappModalOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
