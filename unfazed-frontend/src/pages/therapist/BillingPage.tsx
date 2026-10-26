import React, { useState, useEffect } from 'react';
import { Payment, TherapyPackage } from '../../types';
import { apiRequest } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { Receipt, CreditCard, Download, CheckCircle2, ShieldCheck, Plus, Sparkles } from 'lucide-react';
import { InvoiceModal } from '../../components/common/InvoiceModal';

export const BillingPage: React.FC = () => {
  const { therapist, triggerUpgradeModal } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [packages, setPackages] = useState<TherapyPackage[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Payment | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBilling = async () => {
    if (!therapist) return;
    try {
      setIsLoading(true);
      const [pays, pkgs] = await Promise.all([
        apiRequest<Payment[]>(`/payments?therapistId=${therapist.id}`),
        apiRequest<TherapyPackage[]>(`/packages?therapistId=${therapist.id}`)
      ]);
      setPayments(pays);
      setPackages(pkgs);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBilling();
  }, [therapist]);

  const totalCaptured = payments.reduce((acc, p) => acc + (p.status === 'captured' ? p.amountINR : 0), 0);
  const totalTax = Math.round(totalCaptured - totalCaptured / 1.18);

  const handleExportCSV = () => {
    if (therapist?.currentTier === 'starter') {
      triggerUpgradeModal('Full GST CSV ledger export requires the Professional tier.');
      return;
    }
    // Generate clean CSV download
    const headers = 'InvoiceNumber,Date,ClientName,ClientEmail,AmountINR,SAC,GSTIN,GatewayRef,Status\n';
    const rows = payments.map((p) =>
      `"${p.invoiceNumber}","${p.createdAt}","${p.clientName}","${p.clientEmail}",${p.amountINR},"${p.gstDetails.sacCode}","${p.gstDetails.therapistGSTIN}","${p.gatewayTransactionId}","${p.status}"`
    ).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `unfazed-gst-ledger-${therapist?.slug}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header & GST Stats */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Billing, Razorpay & GST Invoicing</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Compliant SAC Code 999312 · GSTIN: <strong className="font-mono text-slate-700">{therapist?.gstin || '27AABCT3521Q1Z8'}</strong>
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export GST Audit Ledger</span>
        </button>
      </div>

      {/* Financial Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <span className="text-xs text-slate-500 uppercase font-semibold">Total Consultations Invoiced</span>
          <p className="text-2xl font-bold font-mono text-slate-900 mt-1 tabular-nums">
            ₹{totalCaptured.toLocaleString('en-IN')}
          </p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <span className="text-xs text-slate-500 uppercase font-semibold">GST Liability (18%)</span>
          <p className="text-2xl font-bold font-mono text-teal-800 mt-1 tabular-nums">
            ₹{totalTax.toLocaleString('en-IN')}
          </p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <span className="text-xs text-slate-500 uppercase font-semibold">Razorpay Gateway Status</span>
          <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold mt-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Test Mode Active (2% fee)</span>
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 font-bold text-slate-900">
            <Receipt className="w-4 h-4 text-teal-700" />
            <span>Tax Invoices Generated ({payments.length})</span>
          </div>
          <span className="text-slate-500 font-mono">SAC 999312</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-white border-b border-slate-200 text-slate-600 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Client</th>
                <th className="py-3 px-4">Transaction Ref</th>
                <th className="py-3 px-4 text-right">Amount (INR)</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Invoice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                    {p.invoiceNumber}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-600">
                    {new Date(p.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-slate-900 block">{p.clientName}</span>
                    <span className="text-[11px] text-slate-500">{p.clientEmail}</span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-500 text-[11px]">
                    {p.gatewayTransactionId}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 tabular-nums">
                    ₹{p.amountINR.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold uppercase">
                      {p.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => setSelectedInvoice(p)}
                      className="px-2.5 py-1 text-teal-800 bg-teal-50 hover:bg-teal-100 rounded font-semibold text-xs transition-colors"
                    >
                      View GST Invoice
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedInvoice && (
        <InvoiceModal payment={selectedInvoice} onClose={() => setSelectedInvoice(null)} />
      )}
    </div>
  );
};
