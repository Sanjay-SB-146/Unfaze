import React, { useState, useEffect } from 'react';
import { SessionNote, Client } from '../../types';
import { apiRequest } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { Lock, Eye, Check, AlertCircle, FileText, Sparkles, BookOpen } from 'lucide-react';

export const NoteEditor: React.FC = () => {
  const { therapist, triggerUpgradeModal } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>('client_priya_patel');
  const [existingNotes, setExistingNotes] = useState<SessionNote[]>([]);
  const [noteType, setNoteType] = useState<'private' | 'shared'>('private');
  const [format, setFormat] = useState<'freeform' | 'soap' | 'dap'>('soap');
  const [title, setTitle] = useState('Session Progress & Case Conceptualization');
  const [sessionDate, setSessionDate] = useState('2026-10-28');
  const [tags, setTags] = useState('CBT, Anxiety, Homework');
  const [sharedHomework, setSharedHomework] = useState('Practice 4-7-8 breathing twice daily and record catastrophic thought triggers in reflection journal.');

  // Freeform content
  const [freeformContent, setFreeformContent] = useState('');

  // SOAP fields
  const [subjective, setSubjective] = useState('Client reported feeling palpitations before executive board review.');
  const [objective, setObjective] = useState('Maintained good eye contact, verbal fluency improved after somatic pacing.');
  const [assessment, setAssessment] = useState('Generalized anxiety exacerbated by performance anxiety and cognitive distortions.');
  const [plan, setPlan] = useState('Continue 3-column thought record. Next appointment in 7 days.');

  // DAP fields
  const [dapData, setDapData] = useState('Client presented with 3 panic episodes this week.');
  const [dapAssessment, setDapAssessment] = useState('Client responding well to grounding exercises; needs reinforcement.');
  const [dapPlan, setDapPlan] = useState('Maintain weekly cadence. Evaluate medication review if insomnia persists.');

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchNotes = async () => {
    if (!therapist) return;
    try {
      const [cls, notes] = await Promise.all([
        apiRequest<Client[]>(`/clients?therapistId=${therapist.id}`),
        apiRequest<SessionNote[]>(`/notes?therapistId=${therapist.id}&clientId=${selectedClientId}`)
      ]);
      setClients(cls);
      setExistingNotes(notes);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [therapist, selectedClientId]);

  // Handle template selection with Entitlement check!
  const handleSelectFormat = (newFormat: 'freeform' | 'soap' | 'dap') => {
    if (newFormat !== 'freeform' && therapist?.currentTier === 'starter') {
      triggerUpgradeModal(`Structured clinical ${newFormat.toUpperCase()} templates require the Professional tier.`);
      return;
    }
    setFormat(newFormat);
  };

  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSaveSuccess(false);
    setIsSaving(true);

    try {
      const payload: Partial<SessionNote> = {
        therapistId: therapist?.id,
        clientId: selectedClientId,
        sessionDate,
        type: noteType,
        format,
        title,
        sharedHomework,
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean)
      };

      if (format === 'freeform') {
        payload.freeformContent = freeformContent;
      } else if (format === 'soap') {
        payload.soap = { subjective, objective, assessment, plan };
      } else if (format === 'dap') {
        payload.dap = { data: dapData, assessment: dapAssessment, plan: dapPlan };
      }

      await apiRequest<SessionNote>('/notes', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      setSaveSuccess(true);
      fetchNotes();
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      if (err.status === 403) {
        triggerUpgradeModal(err.message);
      } else {
        setErrorMsg(err.message || 'Failed to save note');
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Privacy Architecture Notice */}
      <div className="bg-white p-5 rounded-xl border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Clinical Documentation & Notes Engine</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Role-restricted data access: Private reflections are permanently filtered out at the API serializer level for clients.
            </p>
          </div>

          {/* Client Selector */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-600 font-medium">Select Client:</span>
            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 font-semibold text-slate-800 focus:outline-none focus:border-teal-600"
            >
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Note Creation Editor (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 space-y-5">
          <form onSubmit={handleSaveNote} className="space-y-4 text-xs">
            {/* Note Type & Format Selection */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
              {/* Type Toggle: Private vs Shared */}
              <div>
                <span className="block text-[11px] font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">
                  Access Level & Privacy
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setNoteType('private')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-semibold transition-colors ${
                      noteType === 'private'
                        ? 'bg-rose-100 text-rose-800 border border-rose-300 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
                    }`}
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Confidential Private Note</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNoteType('shared')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-semibold transition-colors ${
                      noteType === 'shared'
                        ? 'bg-teal-100 text-teal-800 border border-teal-300 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Shared Client Note</span>
                  </button>
                </div>
              </div>

              {/* Format Selector: Freeform vs SOAP vs DAP */}
              <div>
                <span className="block text-[11px] font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">
                  Documentation Structure
                </span>
                <div className="flex items-center gap-1">
                  {(['freeform', 'soap', 'dap'] as const).map((fmt) => (
                    <button
                      key={fmt}
                      type="button"
                      onClick={() => handleSelectFormat(fmt)}
                      className={`px-3 py-1.5 rounded uppercase font-semibold text-[11px] transition-colors ${
                        format === fmt
                          ? 'bg-slate-900 text-white'
                          : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {fmt}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800">
                {errorMsg}
              </div>
            )}

            {saveSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Clinical note saved successfully!</span>
              </div>
            )}

            {/* Note Metadata */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Session Note Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:border-teal-600 font-medium"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Session Date</label>
                <input
                  type="date"
                  value={sessionDate}
                  onChange={(e) => setSessionDate(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:border-teal-600 font-mono"
                />
              </div>
            </div>

            {/* Template Specific Form */}
            {format === 'soap' && (
              <div className="space-y-3 p-4 bg-slate-50/70 rounded-xl border border-slate-200">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Subjective (S) <span className="font-normal text-slate-500">— Client reports & emotional state</span>
                  </label>
                  <textarea
                    rows={2}
                    value={subjective}
                    onChange={(e) => setSubjective(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Objective (O) <span className="font-normal text-slate-500">— Clinician observation & affect</span>
                  </label>
                  <textarea
                    rows={2}
                    value={objective}
                    onChange={(e) => setObjective(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Assessment (A) <span className="font-normal text-slate-500">— Diagnostic conceptualization</span>
                  </label>
                  <textarea
                    rows={2}
                    value={assessment}
                    onChange={(e) => setAssessment(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Plan (P) <span className="font-normal text-slate-500">— Interventions & homework</span>
                  </label>
                  <textarea
                    rows={2}
                    value={plan}
                    onChange={(e) => setPlan(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
                  />
                </div>
              </div>
            )}

            {format === 'dap' && (
              <div className="space-y-3 p-4 bg-slate-50/70 rounded-xl border border-slate-200">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Data (D) <span className="font-normal text-slate-500">— Factual session observations & events</span>
                  </label>
                  <textarea
                    rows={3}
                    value={dapData}
                    onChange={(e) => setDapData(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Assessment (A) <span className="font-normal text-slate-500">— Clinical progress evaluation</span>
                  </label>
                  <textarea
                    rows={3}
                    value={dapAssessment}
                    onChange={(e) => setDapAssessment(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Plan (P) <span className="font-normal text-slate-500">— Treatment adjustments</span>
                  </label>
                  <textarea
                    rows={2}
                    value={dapPlan}
                    onChange={(e) => setDapPlan(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
                  />
                </div>
              </div>
            )}

            {format === 'freeform' && (
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Freeform Clinical Narrative
                </label>
                <textarea
                  rows={8}
                  placeholder="Enter detailed narrative progress notes, interventions utilized, and client response..."
                  value={freeformContent}
                  onChange={(e) => setFreeformContent(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-teal-600 leading-relaxed font-sans"
                />
              </div>
            )}

            {/* Shared Homework / Client Takeaway */}
            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Client Takeaway & Assigned Exercises (Shared to Client Portal)
              </label>
              <textarea
                rows={2}
                value={sharedHomework}
                onChange={(e) => setSharedHomework(e.target.value)}
                className="w-full px-3 py-1.5 border border-teal-200 bg-teal-50/50 rounded-lg focus:outline-none focus:border-teal-600"
              />
            </div>

            <div className="pt-2 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                Encrypted & HIPAA / DISHA compliance ready
              </span>
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white font-semibold rounded-lg shadow-sm transition-colors"
              >
                {isSaving ? 'Encrypting & Saving...' : 'Save Clinical Record'}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Case File History for Client */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm">Past Clinical Notes</h3>
            <span className="text-xs font-mono text-slate-500">{existingNotes.length} recorded</span>
          </div>

          <div className="space-y-3 overflow-y-auto max-h-[500px] pr-1 text-xs">
            {existingNotes.length === 0 ? (
              <p className="text-slate-400 py-6 text-center">No past notes for this client.</p>
            ) : (
              existingNotes.map((note) => (
                <div key={note.id} className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                      note.type === 'private' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-teal-50 text-teal-700 border border-teal-200'
                    }`}>
                      {note.type}
                    </span>
                    <span className="font-mono text-slate-400 text-[11px]">{note.sessionDate}</span>
                  </div>

                  <h4 className="font-bold text-slate-900 text-xs">{note.title}</h4>

                  {note.soap && (
                    <p className="text-slate-600 text-[11px] line-clamp-2">
                      <strong>Assessment:</strong> {note.soap.assessment}
                    </p>
                  )}

                  {note.freeformContent && (
                    <p className="text-slate-600 text-[11px] line-clamp-2">
                      {note.freeformContent}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
