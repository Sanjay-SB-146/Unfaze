import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../api/client';
import { Save, Check, Globe, Clock, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { therapist, refreshTherapist } = useAuth();

  const [name, setName] = useState(therapist?.name || '');
  const [slug, setSlug] = useState(therapist?.slug || '');
  const [title, setTitle] = useState(therapist?.title || '');
  const [bio, setBio] = useState(therapist?.bio || '');
  const [sessionFeeINR, setSessionFeeINR] = useState(therapist?.sessionFeeINR || 2200);
  const [phone, setPhone] = useState(therapist?.phone || '');
  const [location, setLocation] = useState(therapist?.location || '');
  const [gstin, setGstin] = useState(therapist?.gstin || '');
  const [languages, setLanguages] = useState(therapist?.languages?.join(', ') || 'English, Hindi, Marathi');
  const [specializations, setSpecializations] = useState(
    therapist?.specializations?.join(', ') || 'Anxiety, Trauma, CBT, Couples'
  );

  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!therapist) return;
    setIsSaving(true);
    setErrorMsg('');
    setSavedSuccess(false);

    try {
      await apiRequest(`/therapist/profile/${therapist.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name,
          slug: slug.toLowerCase().replace(/[^a-z0-9-]/g, ''),
          title,
          bio,
          sessionFeeINR: Number(sessionFeeINR),
          phone,
          location,
          gstin,
          languages: languages.split(',').map((l) => l.trim()).filter(Boolean),
          specializations: specializations.split(',').map((s) => s.trim()).filter(Boolean)
        })
      });

      setSavedSuccess(true);
      await refreshTherapist();
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update profile settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-xl border border-slate-200">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">Practice Profile & Custom URL Settings</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Controls how your practice displays on your branded public page (unfazed.in/{slug}).
        </p>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-xl border border-slate-200 p-6 space-y-6 text-xs text-slate-700">
        {savedSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Practice settings successfully updated and live!</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800">
            {errorMsg}
          </div>
        )}

        {/* Branded Slug */}
        <div className="p-4 bg-teal-50/60 rounded-xl border border-teal-200 space-y-2">
          <label className="block font-bold text-slate-900">Custom Branded Link (Slug)</label>
          <div className="flex items-center gap-2 max-w-md">
            <span className="text-slate-500 font-mono">unfazed.in/</span>
            <input
              type="text"
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="flex-1 px-3 py-1.5 border border-teal-300 rounded-lg bg-white font-mono font-bold text-teal-800 focus:outline-none focus:border-teal-600"
            />
          </div>
          <p className="text-[11px] text-teal-800">
            Clients visit this unique address to view your bio, select available appointment slots, and pay via Razorpay.
          </p>
        </div>

        {/* Core Profile Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-slate-800 mb-1">Therapist Name & Credentials</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-teal-600"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-800 mb-1">Professional Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-teal-600"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-800 mb-1">Standard Session Fee (INR)</label>
            <input
              type="number"
              required
              value={sessionFeeINR}
              onChange={(e) => setSessionFeeINR(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-teal-600 font-mono"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-800 mb-1">GSTIN Number (for Tax Invoices)</label>
            <input
              type="text"
              value={gstin}
              onChange={(e) => setGstin(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-teal-600 font-mono"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-800 mb-1">Clinic Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-teal-600"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-800 mb-1">WhatsApp Business Phone</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-teal-600"
            />
          </div>
        </div>

        <div>
          <label className="block font-semibold text-slate-800 mb-1">Clinical Philosophy & Bio</label>
          <textarea
            rows={4}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-teal-600 leading-relaxed"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-slate-800 mb-1">Languages Spoken (comma separated)</label>
            <input
              type="text"
              value={languages}
              onChange={(e) => setLanguages(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-teal-600"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-800 mb-1">Clinical Specializations (comma separated)</label>
            <input
              type="text"
              value={specializations}
              onChange={(e) => setSpecializations(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-teal-600"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-200 flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Updating...' : 'Save Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
