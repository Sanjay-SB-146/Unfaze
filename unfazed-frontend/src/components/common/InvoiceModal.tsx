import React from 'react';
import { Payment } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { X, Printer, Download, CheckCircle2 } from 'lucide-react';

interface InvoiceModalProps {
  payment: Payment | null;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ payment, onClose }) => {
  const { therapist } = useAuth();

  if (!payment) return null;

  const handlePrint = () => {
    window.print();
  };

  const baseAmount = Math.round(payment.amountINR / 1.18);
  const totalTax = payment.amountINR - baseAmount;
  const cgst = Math.round((totalTax / 2) * 100) / 100;
  const sgst = Math.round((totalTax / 2) * 100) / 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Actions Bar */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span className="text-sm font-semibold">Official GST Tax Invoice</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium rounded transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Document */}
        <div className="p-8 text-slate-800" id="gst-invoice-content">
          {/* Header */}
          <div className="flex justify-between items-start border-b border-slate-200 pb-6 mb-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">TAX INVOICE</h1>
              <p className="text-xs text-slate-500 mt-1">Rule 46 of CGST Rules, 2017</p>
              <div className="mt-4 text-xs space-y-1">
                <p className="font-semibold text-slate-900">{therapist?.name || 'Dr. Ananya Sharma, Ph.D.'}</p>
                <p className="text-slate-600">{therapist?.title || 'Licensed Clinical Psychologist'}</p>
                <p className="text-slate-600">{therapist?.location || 'Bandra West, Mumbai - 400050'}</p>
                <p className="text-slate-600">GSTIN: <span className="font-mono">{payment.gstDetails.therapistGSTIN || '27AABCT3521Q1Z8'}</span></p>
                <p className="text-slate-600">State Code: 27 (Maharashtra)</p>
              </div>
            </div>

            <div className="text-right text-xs space-y-1">
              <div className="bg-slate-50 border border-slate-200 rounded p-3 mb-2 text-left">
                <p className="text-slate-500">Invoice Number:</p>
                <p className="font-mono font-bold text-slate-900 text-sm">{payment.invoiceNumber}</p>
                <p className="text-slate-500 mt-1">Invoice Date:</p>
                <p className="font-medium text-slate-900">{new Date(payment.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                <p className="text-slate-500 mt-1">Transaction Ref:</p>
                <p className="font-mono text-slate-700 text-[11px] truncate max-w-[150px]">{payment.gatewayTransactionId}</p>
              </div>
            </div>
          </div>

          {/* Billed To */}
          <div className="mb-6 p-4 rounded bg-slate-50 border border-slate-200 text-xs">
            <p className="text-slate-500 uppercase tracking-wider text-[10px] font-semibold mb-1">Billed To (Client)</p>
            <p className="font-bold text-slate-900 text-sm">{payment.clientName}</p>
            <p className="text-slate-600">{payment.clientEmail}</p>
            <p className="text-slate-500 mt-1">Place of Supply: Maharashtra (State Code 27)</p>
          </div>

          {/* Items Table */}
          <table className="w-full text-xs text-left mb-6 border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-300 text-slate-600 uppercase text-[10px] tracking-wider">
                <th className="py-2.5">Description of Service</th>
                <th className="py-2.5 text-center">HSN/SAC</th>
                <th className="py-2.5 text-right">Taxable Value</th>
                <th className="py-2.5 text-right">CGST (9%)</th>
                <th className="py-2.5 text-right">SGST (9%)</th>
                <th className="py-2.5 text-right">Total (INR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              <tr>
                <td className="py-3 pr-2">
                  <p className="font-semibold text-slate-900">Psychological & Mental Health Consultation</p>
                  <p className="text-slate-500 text-[11px]">Individual Cognitive Behavioral Therapy Session (50 min)</p>
                </td>
                <td className="py-3 text-center font-mono">999312</td>
                <td className="py-3 text-right font-mono tabular-nums">₹{baseAmount.toLocaleString('en-IN')}</td>
                <td className="py-3 text-right font-mono tabular-nums">₹{cgst.toLocaleString('en-IN')}</td>
                <td className="py-3 text-right font-mono tabular-nums">₹{sgst.toLocaleString('en-IN')}</td>
                <td className="py-3 text-right font-mono tabular-nums font-bold text-slate-900">
                  ₹{payment.amountINR.toLocaleString('en-IN')}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Summary */}
          <div className="flex justify-end mb-8">
            <div className="w-64 space-y-2 text-xs border-t border-slate-200 pt-3">
              <div className="flex justify-between text-slate-600">
                <span>Taxable Subtotal:</span>
                <span className="font-mono tabular-nums">₹{baseAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Central GST (9%):</span>
                <span className="font-mono tabular-nums">₹{cgst.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>State GST (9%):</span>
                <span className="font-mono tabular-nums">₹{sgst.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-900 text-sm border-t border-slate-300 pt-2">
                <span>Grand Total (INR):</span>
                <span className="font-mono tabular-nums">₹{payment.amountINR.toLocaleString('en-IN')}</span>
              </div>
              <div className="pt-2 text-[11px] text-emerald-700 font-medium text-right flex items-center justify-end gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Paid via Razorpay Secure Gateway</span>
              </div>
            </div>
          </div>

          {/* Footer declaration */}
          <div className="border-t border-slate-200 pt-4 text-[11px] text-slate-500 text-center">
            <p className="font-medium text-slate-700">Declaration:</p>
            <p>This is a computer-generated invoice issued in accordance with GST Rules, requiring no physical signature.</p>
            <p className="mt-1">Powered by Unfazed SaaS Platform for Mental Health Practitioners.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
