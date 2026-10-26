import React, { useState } from 'react';
import { Client, IntakeData } from '../../types';
import { apiRequest } from '../../api/client';
import { X, Check, ShieldCheck, AlertCircle } from 'lucide-react';

interface IntakeFormModalProps {
  client: Client;
  onClose: () => void;
  onSuccess: () => void;
}

export const IntakeFormModal: React.FC<IntakeFormModalProps> = ({ client, onClose, onSuccess }) => {
  const [age, setAge] = useState(client.intakeData?.age || 28);
  const [gender, setGender] = useState(client.intakeData?.gender || 'Female');
  const [occupation, setOccupation] = useState(client.intakeData?.occupation || 'Product Manager');
  const [emergencyName, setEmergencyName] = useState(client.intakeData?.emergencyContact.name || 'Rajesh Patel');
  const [emergencyRel, setEmergencyRel] = useState(client.intakeData?.emergencyContact.relationship || 'Brother');
  const [emergencyPhone, setEmergencyPhone] = useState(client.intakeData?.emergencyContact.phone || '+91 98212 90999');
  const [primaryGoal, setPrimaryGoal] = useState(client.intakeData?.primaryGoal || 'Manage acute anxiety and insomnia.');
  const [medicalConditions, setMedicalConditions] = useState(client.intakeData?.medicalConditions || 'None');
  const [consentChecked, setConsentChecked] = useState<boolean>(client.consentRecord?.signed ?? true);
  const [signerName, setSignerName] = useState(client.consentRecord?.signerName || client.name);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const intakePayload: IntakeData = {
        age: Number(age),
        gender,
        occupation,
        emergencyContact: {
          name: emergencyName,
          relationship: emergencyRel,
          phone: emergencyPhone
        },
        presentingConcerns: ['Workplace burnout', 'Sleep disturbance', 'Imposter feelings'],
        primaryGoal,
        previousTherapyExperience: 'Previous supportive counseling in 2021',
        medicalConditions,
        suicidalIdeationHistory: 'none'
      };

      await apiRequest(`/clients/${client.id}/intake`, {
        method: 'PUT',
        body: JSON.stringify(intakePayload)
      });

      if (consentChecked) {
        await apiRequest(`/clients/${client.id}/consent`, {
          method: 'POST',
          body: JSON.stringify({
            signerName,
            termsAccepted: [
              'telehealth_consent',
              'confidentiality_and_exceptions',
              'cancellation_policy_24hr',
              'emergency_protocol'
            ]
          })
        });
      }

      onSuccess();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-base font-bold text-white">Client Intake & Compliance Consent</h2>
            <p className="text-xs text-slate-300">
              Auditable clinical record for {client.name}
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 text-xs text-slate-700 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-800 mb-1">Age</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:border-teal-600"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-800 mb-1">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:border-teal-600"
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Non-Binary">Non-Binary</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-800 mb-1">Occupation</label>
              <input
                type="text"
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:border-teal-600"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-800 mb-1">Primary Therapy Goal</label>
            <textarea
              rows={2}
              value={primaryGoal}
              onChange={(e) => setPrimaryGoal(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:border-teal-600"
            />
          </div>

          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-3">
            <h4 className="font-bold text-slate-900 text-xs">Emergency Contact Details (Mandatory Compliance)</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-600 text-[11px] mb-1">Name</label>
                <input
                  type="text"
                  value={emergencyName}
                  onChange={(e) => setEmergencyName(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white text-xs"
                />
              </div>
              <div>
                <label className="block text-slate-600 text-[11px] mb-1">Relationship</label>
                <input
                  type="text"
                  value={emergencyRel}
                  onChange={(e) => setEmergencyRel(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white text-xs"
                />
              </div>
              <div>
                <label className="block text-slate-600 text-[11px] mb-1">Phone</label>
                <input
                  type="text"
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white text-xs"
                />
              </div>
            </div>
          </div>

          {/* Digital Consent Capture Section */}
          <div className="p-4 rounded-lg bg-emerald-50/70 border border-emerald-200 space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-700" />
              <h4 className="font-bold text-emerald-900 text-xs">Digital Consent & Telehealth Agreement (Audit Record)</h4>
            </div>
            <p className="text-[11px] text-emerald-800 leading-relaxed">
              By checking below, the client agrees to the 24-hour cancellation policy, limits of telehealth confidentiality (except emergency risk of harm), and fee schedule. An immutable audit record with timestamp and IP address is generated.
            </p>

            <label className="flex items-start gap-2.5 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={consentChecked}
                onChange={(e) => setConsentChecked(e.target.checked)}
                className="mt-0.5 rounded text-teal-600 focus:ring-teal-500"
              />
              <span className="text-xs text-slate-800 font-medium">
                I hereby acknowledge and sign the informed clinical consent and telehealth terms of service.
              </span>
            </label>

            <div>
              <label className="block text-slate-700 text-[11px] font-semibold mb-1">Digital Signature (Legal Name)</label>
              <input
                type="text"
                value={signerName}
                onChange={(e) => setSignerName(e.target.value)}
                className="w-full max-w-sm px-3 py-1.5 border border-emerald-300 rounded bg-white font-serif text-sm"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:text-slate-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-teal-700 text-white font-semibold rounded-lg hover:bg-teal-800 transition-colors"
            >
              {isSubmitting ? 'Saving...' : 'Record Intake & Consent'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
