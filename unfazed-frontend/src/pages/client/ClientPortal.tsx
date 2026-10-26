import React, { useState, useEffect } from 'react';
import { Session, Payment, ClientPackage } from '../../types';
import { apiRequest } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import {
  Calendar,
  Clock,
  Video,
  FileText,
  CreditCard,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { InvoiceModal } from '../../components/common/InvoiceModal';
import { ChatWindow } from '../../components/chat/ChatWindow';

export const ClientPortal: React.FC = () => {
  const { setActiveRole } = useAuth();
  const clientId = 'client_priya_patel';

  const [sessions, setSessions] = useState<Session[]>([]);
  const [sharedNotes, setSharedNotes] = useState<any[]>([]);
  const [packages, setPackages] = useState<ClientPackage[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Payment | null>(null);
  const [activeTab, setActiveTab] = useState<'appointments' | 'homework' | 'packages' | 'chat'>('appointments');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPortalData = async () => {
      try {
        setIsLoading(true);
        const [sess, notes, pkgs] = await Promise.all([
          apiRequest<Session[]>(`/client-portal/sessions/${clientId}`),
          apiRequest<any[]>(`/client-portal/notes/${clientId}`),
          apiRequest<ClientPackage[]>(`/client-portal/packages/${clientId}`)
        ]);
        setSessions(sess);
        setSharedNotes(notes);
        setPackages(pkgs);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPortalData();
  }, [clientId]);

  const upcomingSession = sessions.find((s) => s.status === 'scheduled');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white border-b border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs uppercase tracking-wider text-teal-400 font-semibold font-mono">
                  Client Health Portal
                </span>
                <span className="text-slate-500">·</span>
                <span className="text-xs text-slate-300">Dr. Ananya Sharma Practice</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-white">Welcome back, Priya</h1>
              <p className="text-xs text-slate-400 mt-1">
                Access your scheduled appointments, shared homework roadmaps, and secure GST receipts.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveRole('public_profile')}
                className="px-3 py-1.5 rounded-lg bg-teal-800 hover:bg-teal-700 text-white text-xs font-semibold transition-colors"
              >
                Book New Session
              </button>
              <button
                onClick={() => setActiveRole('therapist')}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
              >
                Therapist Dashboard
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 mt-6 border-b border-slate-800 text-xs">
            {[
              { id: 'appointments', label: 'My Sessions' },
              { id: 'homework', label: `Shared Homework & Notes (${sharedNotes.length})` },
              { id: 'packages', label: 'Therapy Packages' },
              { id: 'chat', label: 'Direct Chat' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-teal-400 text-teal-300 font-semibold'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 mt-8 space-y-6">
        {/* Next Session Spotlight */}
        {upcomingSession && (
          <div className="bg-white rounded-xl border border-teal-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-teal-800 uppercase tracking-wide">
                  Upcoming Appointment
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                {upcomingSession.serviceTitle}
              </h3>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 font-mono">
                <span className="flex items-center gap-1 font-semibold text-slate-900">
                  <Calendar className="w-4 h-4 text-teal-700" />
                  {upcomingSession.date} at {upcomingSession.startTime} IST
                </span>
                <span>50 minutes</span>
                <span>·</span>
                <span className="text-emerald-700 font-semibold">Advance Payment Verified</span>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {upcomingSession.meetingLink && (
                <a
                  href={upcomingSession.meetingLink}
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl font-bold text-xs shadow-sm transition-colors flex items-center gap-2"
                >
                  <Video className="w-4 h-4" />
                  <span>Join Secure Video Room</span>
                </a>
              )}
            </div>
          </div>
        )}

        {/* TAB 1: SESSIONS */}
        {activeTab === 'appointments' && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Session History & Upcoming</h3>
            <div className="divide-y divide-slate-100 text-xs">
              {sessions.map((s) => (
                <div key={s.id} className="py-3.5 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{s.date}</span>
                      <span className="font-mono text-slate-500">{s.startTime}</span>
                      <span className="text-slate-400">·</span>
                      <span className="text-slate-700">{s.serviceTitle}</span>
                    </div>
                    <span className="text-[11px] text-slate-500 font-mono">
                      Status: <strong className="capitalize">{s.status}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-mono font-semibold text-slate-900 tabular-nums">
                      ₹{s.feeINR.toLocaleString('en-IN')}
                    </span>
                    {s.meetingLink && s.status === 'scheduled' && (
                      <a
                        href={s.meetingLink}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1 bg-teal-50 hover:bg-teal-100 text-teal-800 font-semibold rounded text-[11px] border border-teal-200"
                      >
                        Join Room
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: SHARED HOMEWORK ONLY (Demonstrating security split) */}
        {activeTab === 'homework' && (
          <div className="space-y-4">
            {/* Security Guarantee Notice */}
            <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl flex items-start gap-3 text-xs text-teal-900">
              <ShieldCheck className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Role-Restricted Clinical Privacy Protection</p>
                <p className="text-teal-800 text-[11px] mt-0.5">
                  The API endpoint <code className="bg-teal-100 px-1 py-0.5 rounded font-mono">/api/client-portal/notes</code> strictly strips out all private clinician reflections and diagnostic codes at the serializer level. Only actionable homework and takeaways assigned for you are displayed below.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {sharedNotes.map((note) => (
                <div key={note.id} className="bg-white rounded-xl border border-slate-200 p-6 space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-900 text-sm">{note.title}</span>
                    <span className="font-mono text-slate-400">{note.sessionDate}</span>
                  </div>

                  <div className="p-4 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-700 leading-relaxed whitespace-pre-line font-sans">
                    {note.summary}
                  </div>

                  {note.sharedHomework && (
                    <div className="p-3 bg-teal-50/70 border border-teal-100 rounded-lg text-xs text-teal-900">
                      <strong className="block mb-0.5 font-semibold">Homework Assigned:</strong>
                      <p>{note.sharedHomework}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: PACKAGES */}
        {activeTab === 'packages' && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Your Active Therapy Packages</h3>
            {packages.map((cp) => (
              <div key={cp.id} className="p-5 rounded-xl border border-teal-200 bg-teal-50/40 space-y-3 text-xs">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{cp.title}</h4>
                    <p className="text-slate-500 font-mono text-[11px] mt-0.5">
                      Purchased on {new Date(cp.purchasedAt).toLocaleDateString()} · Valid until {new Date(cp.expiresAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-teal-100 text-teal-800 font-bold font-mono">
                    {cp.remainingSessions} SESSIONS LEFT
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-slate-600 font-medium">
                    <span>Package Progress</span>
                    <span className="font-mono">{cp.usedSessions} of {cp.totalSessions} sessions used</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-teal-700 h-2 rounded-full"
                      style={{ width: `${(cp.usedSessions / cp.totalSessions) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 4: CHAT */}
        {activeTab === 'chat' && (
          <div>
            <ChatWindow />
          </div>
        )}
      </div>

      {selectedInvoice && (
        <InvoiceModal payment={selectedInvoice} onClose={() => setSelectedInvoice(null)} />
      )}
    </div>
  );
};
