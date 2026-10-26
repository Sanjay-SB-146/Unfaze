import React, { useState, useEffect } from 'react';
import { Client } from '../../types';
import { apiRequest } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { Search, Plus, Filter, UserCheck, ShieldAlert, FileText, CheckCircle2 } from 'lucide-react';
import { ClientDetailModal } from './ClientDetailModal';
import { IntakeFormModal } from './IntakeFormModal';

export const ClientTable: React.FC = () => {
  const { therapist, triggerUpgradeModal } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedTag, setSelectedTag] = useState('all');
  const [activeClientForDetail, setActiveClientForDetail] = useState<Client | null>(null);
  const [activeClientForIntake, setActiveClientForIntake] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchClients = async () => {
    if (!therapist) return;
    try {
      setIsLoading(true);
      const params = new URLSearchParams({ therapistId: therapist.id });
      if (search) params.append('search', search);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (selectedTag !== 'all') params.append('tag', selectedTag);

      const data = await apiRequest<Client[]>(`/clients?${params.toString()}`);
      setClients(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [therapist, statusFilter, selectedTag]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchClients();
  };

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      await apiRequest<Client>('/clients', {
        method: 'POST',
        body: JSON.stringify({
          therapistId: therapist?.id,
          name: newClientName,
          email: newClientEmail,
          phone: newClientPhone,
          tags: ['Private Practice']
        })
      });
      setShowAddModal(false);
      setNewClientName('');
      setNewClientEmail('');
      setNewClientPhone('');
      fetchClients();
    } catch (err: any) {
      if (err.status === 403) {
        setShowAddModal(false);
        triggerUpgradeModal(err.message);
      } else {
        setErrorMsg(err.message || 'Failed to create client');
      }
    }
  };

  const allTags = Array.from(new Set(clients.flatMap((c) => c.tags)));

  return (
    <div className="space-y-6">
      {/* Top Filter and Search Bar */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Client CRM & Caseload Directory</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Active clients: <strong className="text-slate-800">{clients.filter((c) => c.status === 'active').length}</strong> · Tier Capacity: <strong className="text-slate-800">{therapist?.currentTier === 'starter' ? '5 (Starter)' : '50 (Pro)'}</strong>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Client</span>
            </button>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by client name, email or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-teal-600 focus:bg-white"
            />
          </form>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
              {['all', 'active', 'on_hold', 'completed'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded capitalize transition-colors ${
                    statusFilter === st ? 'bg-white text-slate-900 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {st.replace('_', ' ')}
                </button>
              ))}
            </div>

            {allTags.length > 0 && (
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-teal-600"
              >
                <option value="all">All Clinical Tags</option>
                {allTags.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
      </div>

      {/* Clients Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4 font-semibold">Client Name</th>
                <th className="py-3 px-4 font-semibold">Clinical Tags</th>
                <th className="py-3 px-4 font-semibold">Intake & Consent</th>
                <th className="py-3 px-4 font-semibold">Last Session</th>
                <th className="py-3 px-4 font-semibold text-center">Total Sessions</th>
                <th className="py-3 px-4 font-semibold text-center">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {clients.map((client) => (
                <tr key={client.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4">
                    <button
                      onClick={() => setActiveClientForDetail(client)}
                      className="font-bold text-slate-900 hover:text-teal-700 transition-colors text-left"
                    >
                      {client.name}
                    </button>
                    <p className="text-[11px] text-slate-500 font-mono">{client.phone} · {client.email}</p>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="flex flex-wrap gap-1">
                      {client.tags.map((tag, idx) => (
                        <span key={idx} className="text-slate-600 text-[11px]">
                          {tag}{idx < client.tags.length - 1 ? ' · ' : ''}
                        </span>
                      ))}
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${client.intakeCompleted ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                        <span className="text-slate-700 font-medium text-[11px]">
                          {client.intakeCompleted ? 'Intake Submitted' : 'Intake Pending'}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {client.consentRecord?.signed ? (
                          <span className="text-teal-800">Consent Audited ({client.consentRecord.version})</span>
                        ) : (
                          <span className="text-amber-700">Consent Awaiting Signature</span>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 font-mono text-slate-700 text-xs">
                    {client.lastSessionDate || 'Upcoming'}
                  </td>

                  <td className="py-3.5 px-4 font-mono text-center font-semibold text-slate-900 tabular-nums">
                    {client.totalSessionsCount}
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium capitalize ${
                        client.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : client.status === 'on_hold'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {client.status.replace('_', ' ')}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right space-x-2">
                    <button
                      onClick={() => setActiveClientForIntake(client)}
                      className="px-2.5 py-1 text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded font-medium text-[11px] transition-colors"
                    >
                      Intake Form
                    </button>
                    <button
                      onClick={() => setActiveClientForDetail(client)}
                      className="px-2.5 py-1 text-teal-800 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 rounded font-semibold text-[11px] transition-colors"
                    >
                      View Profile
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Client Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6">
            <h3 className="text-base font-bold text-slate-900 mb-1">Add New Private Client</h3>
            <p className="text-xs text-slate-500 mb-4">
              Enforces active caseload limit per your {therapist?.currentTier.toUpperCase()} tier entitlement.
            </p>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleCreateClient} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Client Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Siddharth Rao"
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-teal-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="siddharth.rao@example.com"
                  value={newClientEmail}
                  onChange={(e) => setNewClientEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-teal-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Phone Number (with WhatsApp)</label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98000 00000"
                  value={newClientPhone}
                  onChange={(e) => setNewClientPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-teal-600"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-teal-700 text-white rounded-lg font-semibold hover:bg-teal-800"
                >
                  Save Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Profile Detail Modal */}
      {activeClientForDetail && (
        <ClientDetailModal
          clientId={activeClientForDetail.id}
          onClose={() => setActiveClientForDetail(null)}
        />
      )}

      {/* Intake & Consent Form Modal */}
      {activeClientForIntake && (
        <IntakeFormModal
          client={activeClientForIntake}
          onClose={() => setActiveClientForIntake(null)}
          onSuccess={() => {
            fetchClients();
            setActiveClientForIntake(null);
          }}
        />
      )}
    </div>
  );
};
