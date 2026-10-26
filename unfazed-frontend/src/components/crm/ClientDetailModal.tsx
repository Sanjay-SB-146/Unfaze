import React, { useState, useEffect } from 'react';
import { Client, Session, SessionNote, Payment, ClientPackage } from '../../types';
import { apiRequest } from '../../api/client';
import { X, User, Calendar, Receipt, FileText, ShieldCheck, Lock, Eye, AlertCircle } from 'lucide-react';
import { InvoiceModal } from '../common/InvoiceModal';

interface ClientDetailModalProps {
  clientId: string;
  onClose: () => void;
}

export const ClientDetailModal: React.FC<ClientDetailModalProps> = ({ clientId, onClose }) => {
  const [data, setData] = useState<{
    client: Client;
    sessions: Session[];
    notes: SessionNote[];
    payments: Payment[];
    packages: ClientPackage[];
  } | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'sessions' | 'notes' | 'billing' | 'intake'>('overview');
  const [selectedInvoice, setSelectedInvoice] = useState<Payment | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setIsLoading(true);
        const res = await apiRequest<any>(`/clients/${clientId}`);
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetail();
  }, [clientId]);

  if (!data && isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <div className="bg-white p-8 rounded-xl shadow-xl text-center">
          <p className="text-xs text-slate-500 font-medium">Loading clinical file...</p>
        </div>
      </div>
    );
  }

  if (!data) return null;
  const { client, sessions, notes, payments, packages } = data;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 flex items-start justify-between shrink-0">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold tracking-tight text-white">{client.name}</h2>
              <span className={`px-2 py-0.5 rounded text-[11px] font-medium capitalize ${
                client.status === 'active' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-700 text-slate-300'
              }`}>
                {client.status.replace('_', ' ')}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Client ID: <span className="font-mono text-slate-400">#{client.id}</span> · Phone: {client.phone} · Email: {client.email}
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-2 flex items-center gap-2 text-xs">
          {[
            { id: 'overview', label: 'Overview & Caseload' },
            { id: 'notes', label: `Clinical Notes (${notes.length})` },
            { id: 'sessions', label: `Session History (${sessions.length})` },
            { id: 'billing', label: `Billing & GST (${payments.length})` },
            { id: 'intake', label: 'Intake & Consent Audit' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
                activeTab === tab.id ? 'bg-white text-slate-900 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 text-xs text-slate-700 space-y-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 text-[11px]">Total Sessions</span>
                  <p className="text-2xl font-bold font-mono text-slate-900 mt-1">{client.totalSessionsCount}</p>
                </div>
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 text-[11px]">Active Packages</span>
                  <p className="text-2xl font-bold font-mono text-slate-900 mt-1">
                    {packages.length > 0 ? `${packages[0].remainingSessions} sessions left` : 'None'}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 text-[11px]">Compliance Consent</span>
                  <p className="text-sm font-bold text-emerald-700 mt-2 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Audited & Signed</span>
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 mb-2">Clinical Focus Tags</h4>
                <div className="flex flex-wrap gap-1.5">
                  {client.tags.map((t, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded bg-teal-50 text-teal-800 border border-teal-200 font-medium">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {client.intakeData && (
                <div className="p-4 rounded-lg border border-slate-200 bg-slate-50 space-y-2">
                  <h4 className="font-bold text-slate-900 text-sm">Presenting Concerns & Goals</h4>
                  <p className="text-slate-800">
                    <strong>Primary Goal:</strong> {client.intakeData.primaryGoal}
                  </p>
                  <div>
                    <strong className="text-slate-800">Reported Symptoms:</strong>
                    <ul className="list-disc list-inside mt-1 text-slate-600 space-y-0.5">
                      {client.intakeData.presentingConcerns.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CLINICAL NOTES */}
          {activeTab === 'notes' && (
            <div className="space-y-4">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-xs flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-700 shrink-0" />
                <span>
                  <strong>Strict Privacy Split:</strong> Private notes with clinical reflections are viewable only by the therapist. Shared notes with homework are syndicated to the client portal.
                </span>
              </div>

              {notes.length === 0 ? (
                <p className="text-slate-400 text-center py-8">No clinical notes recorded yet.</p>
              ) : (
                notes.map((note) => (
                  <div key={note.id} className="p-5 rounded-lg border border-slate-200 bg-white space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                          note.type === 'private' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-teal-50 text-teal-700 border border-teal-200'
                        }`}>
                          {note.type === 'private' ? 'Confidential Private Note' : 'Shared Client Note'}
                        </span>
                        <span className="font-mono text-slate-400 text-[11px]">{note.sessionDate}</span>
                      </div>
                      <span className="text-[11px] font-mono text-slate-500 uppercase">{note.format} format</span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900">{note.title}</h4>

                    {note.soap && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs">
                        <div>
                          <strong className="text-slate-900 font-semibold block mb-0.5">Subjective (S):</strong>
                          <p className="text-slate-600">{note.soap.subjective}</p>
                        </div>
                        <div>
                          <strong className="text-slate-900 font-semibold block mb-0.5">Objective (O):</strong>
                          <p className="text-slate-600">{note.soap.objective}</p>
                        </div>
                        <div>
                          <strong className="text-slate-900 font-semibold block mb-0.5">Assessment (A):</strong>
                          <p className="text-slate-600">{note.soap.assessment}</p>
                        </div>
                        <div>
                          <strong className="text-slate-900 font-semibold block mb-0.5">Plan (P):</strong>
                          <p className="text-slate-600">{note.soap.plan}</p>
                        </div>
                      </div>
                    )}

                    {note.freeformContent && (
                      <div className="p-3 bg-slate-50 rounded-lg text-slate-700 whitespace-pre-line">
                        {note.freeformContent}
                      </div>
                    )}

                    {note.sharedHomework && (
                      <div className="p-3 bg-teal-50 border border-teal-100 rounded-lg text-teal-900">
                        <strong className="font-semibold block mb-1">Homework Assigned:</strong>
                        <p>{note.sharedHomework}</p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 3: SESSIONS */}
          {activeTab === 'sessions' && (
            <div className="space-y-3">
              {sessions.map((sess) => (
                <div key={sess.id} className="p-4 rounded-lg border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{sess.date}</span>
                      <span className="font-mono text-slate-500">at {sess.startTime}</span>
                      <span className="text-slate-400">·</span>
                      <span className="text-slate-700">{sess.serviceTitle}</span>
                    </div>
                    <p className="text-slate-500 text-[11px] mt-0.5 font-mono">
                      Status: {sess.status.toUpperCase()} · Mode: {sess.mode.toUpperCase()}
                    </p>
                  </div>
                  <span className="font-mono font-bold text-slate-900 tabular-nums">
                    ₹{sess.feeINR.toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* TAB 4: BILLING & GST INVOICES */}
          {activeTab === 'billing' && (
            <div className="space-y-3">
              {payments.map((pay) => (
                <div key={pay.id} className="p-4 rounded-lg border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900">{pay.invoiceNumber}</span>
                      <span className="text-slate-400">·</span>
                      <span className="text-slate-600 font-mono text-[11px]">{new Date(pay.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                      SAC: 999312 · GSTIN: {pay.gstDetails.therapistGSTIN} · Gateway Ref: {pay.gatewayTransactionId}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-slate-900 tabular-nums">
                      ₹{pay.amountINR.toLocaleString('en-IN')}
                    </span>
                    <button
                      onClick={() => setSelectedInvoice(pay)}
                      className="px-2.5 py-1 text-teal-800 bg-teal-50 hover:bg-teal-100 rounded font-medium text-xs transition-colors"
                    >
                      View GST Invoice
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 5: INTAKE & CONSENT AUDIT */}
          {activeTab === 'intake' && (
            <div className="space-y-6">
              {/* Consent Audit Box */}
              <div className="p-5 rounded-lg border border-slate-200 bg-slate-50 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    <span>Digital Consent & Compliance Audit Trail</span>
                  </h4>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[11px] font-semibold">
                    AUDITED RECORD
                  </span>
                </div>
                {client.consentRecord ? (
                  <div className="text-xs space-y-1.5 text-slate-600 bg-white p-4 rounded border border-slate-200 font-mono">
                    <p>Legal Signer: <strong className="text-slate-900">{client.consentRecord.signerName}</strong></p>
                    <p>Timestamp: {client.consentRecord.signedAt}</p>
                    <p>Signer IP Address: {client.consentRecord.ipAddress}</p>
                    <p>Policy Version: {client.consentRecord.version}</p>
                    <p>Accepted Clauses: {client.consentRecord.termsAccepted.join(', ')}</p>
                  </div>
                ) : (
                  <p className="text-amber-700">Digital consent record not yet logged.</p>
                )}
              </div>

              {/* Intake Details */}
              {client.intakeData ? (
                <div className="p-5 rounded-lg border border-slate-200 bg-white space-y-4">
                  <h4 className="font-bold text-slate-900 text-sm">Client Intake Questionnaire</h4>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-slate-500">Age & Gender:</span>
                      <p className="font-semibold text-slate-900">{client.intakeData.age} years · {client.intakeData.gender}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Occupation:</span>
                      <p className="font-semibold text-slate-900">{client.intakeData.occupation}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Emergency Contact:</span>
                      <p className="font-semibold text-slate-900">
                        {client.intakeData.emergencyContact.name} ({client.intakeData.emergencyContact.relationship}) - {client.intakeData.emergencyContact.phone}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-500">Medical History:</span>
                      <p className="font-semibold text-slate-900">{client.intakeData.medicalConditions || 'None reported'}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-slate-400">Intake questionnaire not completed yet.</p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 text-white rounded text-xs font-medium hover:bg-slate-800"
          >
            Close Profile
          </button>
        </div>
      </div>

      {/* Invoice Modal Trigger */}
      {selectedInvoice && (
        <InvoiceModal payment={selectedInvoice} onClose={() => setSelectedInvoice(null)} />
      )}
    </div>
  );
};
