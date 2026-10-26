import React, { useState, useEffect } from 'react';
import { Therapist, TherapyPackage, Payment } from '../../types';
import { apiRequest } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import {
  Calendar,
  Clock,
  Video,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  Globe,
  Sparkles,
  Lock,
  ChevronRight,
  CreditCard,
  Check,
  Award,
  BookOpen
} from 'lucide-react';
import { InvoiceModal } from '../../components/common/InvoiceModal';

export const BrandedPublicProfile: React.FC = () => {
  const { activeClientSlug, setActiveRole } = useAuth();
  const [therapist, setTherapist] = useState<Therapist | null>(null);
  const [packages, setPackages] = useState<TherapyPackage[]>([]);
  const [selectedService, setSelectedService] = useState<string>('Individual Therapy (Video Consultation)');
  const [selectedDate, setSelectedDate] = useState<string>('2026-10-28');
  const [clientTimezone, setClientTimezone] = useState<string>('Asia/Kolkata');
  const [openSlots, setOpenSlots] = useState<{ time: string; available: boolean; label: string }[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [isLoadingSlots, setIsLoadingSlots] = useState<boolean>(false);

  // Booking Form State
  const [clientName, setClientName] = useState('Priya Patel');
  const [clientEmail, setClientEmail] = useState('priya.patel@gmail.com');
  const [clientPhone, setClientPhone] = useState('+91 98212 90145');
  const [bookingInProgress, setBookingInProgress] = useState(false);
  const [bookingSuccessData, setBookingSuccessData] = useState<{ session: any; invoiceNumber: string; payment: Payment } | null>(null);
  const [bookingError, setBookingError] = useState('');
  const [viewInvoice, setViewInvoice] = useState<Payment | null>(null);

  // Waitlist State
  const [showWaitlistModal, setShowWaitlistModal] = useState(false);
  const [waitlistSuccess, setWaitlistSuccess] = useState(false);

  // Fetch therapist by slug
  useEffect(() => {
    const fetchTherapistData = async () => {
      try {
        const data = await apiRequest<Therapist>(`/therapist/by-slug/${activeClientSlug}`);
        setTherapist(data);
        const pkgs = await apiRequest<TherapyPackage[]>(`/packages?therapistId=${data.id}`);
        setPackages(pkgs);
      } catch (err) {
        console.error(err);
      }
    };
    fetchTherapistData();
  }, [activeClientSlug]);

  // Fetch open slots for selected date & timezone
  useEffect(() => {
    if (!therapist) return;
    const fetchSlots = async () => {
      try {
        setIsLoadingSlots(true);
        const res = await apiRequest<{ openSlots: any[] }>(
          `/scheduling/slots/${therapist.slug}?date=${selectedDate}&timezone=${encodeURIComponent(clientTimezone)}`
        );
        setOpenSlots(res.openSlots || []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoadingSlots(false);
      }
    };
    fetchSlots();
  }, [therapist, selectedDate, clientTimezone]);

  if (!therapist) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-xs font-mono text-slate-500">Loading branded practice portal...</p>
      </div>
    );
  }

  const handleBookSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) return;
    setBookingInProgress(true);
    setBookingError('');

    try {
      const res = await apiRequest<{ success: boolean; session: any; invoiceNumber: string; payment: Payment }>(
        '/scheduling/book',
        {
          method: 'POST',
          body: JSON.stringify({
            therapistSlug: therapist.slug,
            clientName,
            clientEmail,
            clientPhone,
            date: selectedDate,
            startTime: selectedSlot,
            durationMinutes: 50,
            serviceTitle: selectedService,
            clientTimezone,
            mode: 'online'
          })
        }
      );

      setBookingSuccessData(res);
    } catch (err: any) {
      if (err.message && err.message.includes('Slot collision')) {
        setBookingError('Slot just taken by another client! Double-booking prevention stopped the collision. Please choose another slot.');
      } else {
        setBookingError(err.message || 'Booking failed');
      }
    } finally {
      setBookingInProgress(false);
    }
  };

  const handleJoinWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest('/scheduling/waitlist', {
        method: 'POST',
        body: JSON.stringify({
          therapistId: therapist.id,
          clientName,
          clientEmail,
          clientPhone,
          preferredDays: ['Wednesday', 'Thursday'],
          preferredTimeSlot: 'Morning (10 AM - 1 PM)'
        })
      });
      setWaitlistSuccess(true);
      setTimeout(() => {
        setWaitlistSuccess(false);
        setShowWaitlistModal(false);
      }, 2500);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafaf9] text-slate-900 font-sans pb-16">
      {/* Clinic Space Atmosphere Banner */}
      <div className="relative h-64 md:h-80 w-full overflow-hidden bg-slate-900">
        <img
          src="/src/assets/images/therapy_consultation_space_1792991873574.jpg"
          alt="Clinic Consultation Space"
          className="w-full h-full object-cover opacity-75"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent" />
        
        {/* Top Floating URL bar reminder */}
        <div className="absolute top-4 left-4 right-4 max-w-5xl mx-auto flex items-center justify-between text-xs text-white/90">
          <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 font-mono">
            <Globe className="w-3.5 h-3.5 text-teal-400" />
            <span>unfazed.in/{therapist.slug}</span>
          </div>

          <button
            onClick={() => setActiveRole('client_portal')}
            className="bg-white/15 hover:bg-white/25 backdrop-blur-md text-white px-3.5 py-1.5 rounded-full border border-white/20 transition-colors font-medium flex items-center gap-1.5"
          >
            <span>Existing Client Portal</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-24 relative z-10 space-y-8">
        {/* Therapist Hero Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8 flex flex-col md:flex-row gap-8 items-start">
          <div className="shrink-0 relative">
            <img
              src={therapist.avatarUrl}
              alt={therapist.name}
              className="w-32 h-32 md:w-36 md:h-36 rounded-2xl object-cover shadow-md border-2 border-white ring-1 ring-slate-200"
              referrerPolicy="no-referrer"
            />
            <span className="absolute -bottom-2 -right-2 bg-teal-800 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full border border-white shadow-xs">
              RCI Verified
            </span>
          </div>

          <div className="flex-1 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                {therapist.name}
              </h1>
              <div className="text-right">
                <span className="font-mono text-2xl font-bold text-slate-900">
                  ₹{therapist.sessionFeeINR.toLocaleString('en-IN')}
                </span>
                <span className="text-xs text-slate-500 block">per 50-min consultation</span>
              </div>
            </div>

            <p className="text-teal-800 font-semibold text-sm">
              {therapist.title}
            </p>

            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed max-w-2xl">
              {therapist.bio}
            </p>

            {/* Clean metadata strip without pill sandwich (conforming to frontend-design) */}
            <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-slate-100 text-xs text-slate-600">
              <div className="flex items-center gap-1.5">
                <Award className="w-4 h-4 text-teal-700" />
                <span>{therapist.experienceYears}+ Years Clinical Experience</span>
              </div>
              <span className="text-slate-300">·</span>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-slate-500" />
                <span>{therapist.location}</span>
              </div>
              <span className="text-slate-300">·</span>
              <div className="flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-slate-500" />
                <span>Speaks: {therapist.languages.join(', ')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Two-Column Booking & Services Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Services, Packages & Clinical Focus (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Consultation Offerings */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
              <h3 className="font-bold text-slate-900 text-base">Consultation Formats</h3>
              <div className="space-y-3">
                {therapist.services.map((srv) => (
                  <label
                    key={srv.id}
                    onClick={() => setSelectedService(srv.title)}
                    className={`block p-4 rounded-xl border transition-all cursor-pointer ${
                      selectedService === srv.title
                        ? 'border-teal-700 bg-teal-50/50 ring-2 ring-teal-600/10'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-bold text-xs text-slate-900">{srv.title}</span>
                      <span className="font-mono text-xs font-bold text-slate-900">
                        ₹{srv.feeINR.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed mb-2">
                      {srv.description}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                      <span>{srv.durationMinutes} mins</span>
                      <span>·</span>
                      <span>{srv.mode === 'online' ? 'Encrypted Video' : 'In-Clinic'}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Discounted Session Packages */}
            {packages.length > 0 && (
              <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-base">Long-Term Packages</h3>
                  <span className="text-[11px] font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                    Save up to 20%
                  </span>
                </div>
                <div className="space-y-3">
                  {packages.map((pkg) => (
                    <div key={pkg.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-xs text-slate-900">{pkg.title}</span>
                        <div className="text-right">
                          <span className="font-mono font-bold text-slate-900 text-xs">
                            ₹{pkg.totalFeeINR.toLocaleString('en-IN')}
                          </span>
                          <span className="block text-[10px] text-emerald-700 font-medium">
                            {pkg.savingsPercent}% off
                          </span>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        {pkg.description}
                      </p>
                      <div className="flex justify-between items-center text-[10px] text-slate-600 font-mono pt-1 border-t border-slate-200/60">
                        <span>Rate: ₹{pkg.perSessionRateINR}/sess.</span>
                        <span>Valid for {pkg.validityDays} days</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Clinical Specializations */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-3">
              <h3 className="font-bold text-slate-900 text-sm">Specialization Areas</h3>
              <div className="flex flex-wrap gap-1.5 text-xs">
                {therapist.specializations.map((spec, idx) => (
                  <span key={idx} className="px-2.5 py-1 rounded bg-slate-100 text-slate-700 font-medium">
                    {spec}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Booking Engine (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
            {bookingSuccessData ? (
              <div className="text-center py-8 space-y-5 animate-in fade-in duration-300">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Appointment Confirmed!</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Your session with {therapist.name} has been scheduled.
                  </p>
                </div>

                <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 max-w-md mx-auto text-left text-xs space-y-2">
                  <div className="flex justify-between text-slate-600">
                    <span>Date & Time:</span>
                    <strong className="text-slate-900 font-mono">{bookingSuccessData.session.date} at {bookingSuccessData.session.startTime} IST</strong>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Format:</span>
                    <span className="text-slate-900">{bookingSuccessData.session.serviceTitle}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>GST Invoice #:</span>
                    <strong className="font-mono text-teal-800">{bookingSuccessData.invoiceNumber}</strong>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Video Consultation:</span>
                    <a
                      href={bookingSuccessData.session.meetingLink}
                      target="_blank"
                      rel="noreferrer"
                      className="text-teal-700 underline font-medium truncate max-w-[200px]"
                    >
                      {bookingSuccessData.session.meetingLink}
                    </a>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => setViewInvoice(bookingSuccessData.payment)}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
                  >
                    View Official GST Tax Invoice
                  </button>
                  <button
                    onClick={() => setActiveRole('client_portal')}
                    className="px-4 py-2 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-lg text-xs font-semibold border border-teal-200 transition-colors"
                  >
                    Go to My Client Portal
                  </button>
                  <button
                    onClick={() => setBookingSuccessData(null)}
                    className="px-4 py-2 text-slate-600 hover:text-slate-900 text-xs"
                  >
                    Book Another Slot
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleBookSession} className="space-y-6">
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">Select Date & Time</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Live availability synced with double-booking prevention engine.
                  </p>
                </div>

                {/* Timezone Switcher */}
                <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <Globe className="w-4 h-4 text-teal-700" />
                    <span>Your Timezone:</span>
                  </div>
                  <select
                    value={clientTimezone}
                    onChange={(e) => setClientTimezone(e.target.value)}
                    className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-800 focus:outline-none focus:border-teal-600 font-mono"
                  >
                    <option value="Asia/Kolkata">Asia/Kolkata (IST, UTC+5:30)</option>
                    <option value="America/New_York">America/New York (EDT, UTC-4:00)</option>
                    <option value="Europe/London">Europe/London (BST, UTC+1:00)</option>
                    <option value="Asia/Dubai">Asia/Dubai (GST, UTC+4:00)</option>
                    <option value="Australia/Sydney">Australia/Sydney (AEST, UTC+10:00)</option>
                  </select>
                </div>

                {/* Date Picker Strip */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-2">Available Consultation Dates</label>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-xs">
                    {[
                      { date: '2026-10-27', label: 'Tue, 27' },
                      { date: '2026-10-28', label: 'Wed, 28' },
                      { date: '2026-10-29', label: 'Thu, 29' },
                      { date: '2026-10-30', label: 'Fri, 30' },
                      { date: '2026-10-31', label: 'Sat, 31' },
                      { date: '2026-11-02', label: 'Mon, 02' }
                    ].map((d) => (
                      <button
                        type="button"
                        key={d.date}
                        onClick={() => {
                          setSelectedDate(d.date);
                          setSelectedSlot(null);
                        }}
                        className={`py-2 px-1 text-center rounded-lg border font-mono transition-all ${
                          selectedDate === d.date
                            ? 'bg-teal-700 text-white font-bold border-teal-700 shadow-sm'
                            : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                        }`}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Slot Picker */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold text-slate-800">
                      Open Slots for {selectedDate} ({clientTimezone.split('/')[1]} time)
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowWaitlistModal(true)}
                      className="text-teal-700 hover:underline text-[11px] font-semibold"
                    >
                      Can't find a time? Join Waitlist
                    </button>
                  </div>

                  {isLoadingSlots ? (
                    <div className="py-8 text-center text-xs text-slate-400 font-mono">
                      Checking therapist calendar in real-time...
                    </div>
                  ) : openSlots.length === 0 ? (
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500 space-y-2">
                      <p>No open slots available on this date.</p>
                      <button
                        type="button"
                        onClick={() => setShowWaitlistModal(true)}
                        className="text-teal-800 font-bold underline"
                      >
                        Click here to join the priority waitlist
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {openSlots.map((slot) => (
                        <button
                          key={slot.time}
                          type="button"
                          disabled={!slot.available}
                          onClick={() => setSelectedSlot(slot.time)}
                          className={`py-2.5 px-2 rounded-lg border font-mono text-xs transition-all ${
                            !slot.available
                              ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed line-through'
                              : selectedSlot === slot.time
                              ? 'bg-teal-700 text-white font-bold border-teal-700 shadow-sm'
                              : 'bg-white border-slate-200 hover:border-teal-600 text-slate-800'
                          }`}
                        >
                          {slot.time}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {bookingError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs">
                    {bookingError}
                  </div>
                )}

                {/* Client Contact Info */}
                <div className="pt-4 border-t border-slate-100 space-y-3 text-xs">
                  <h4 className="font-bold text-slate-900">Your Contact Details for Telehealth Link</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-600 mb-1">Your Full Name</label>
                      <input
                        type="text"
                        required
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:border-teal-600"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 mb-1">Email Address</label>
                      <input
                        type="email"
                        required
                        value={clientEmail}
                        onChange={(e) => setClientEmail(e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:border-teal-600"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 mb-1">WhatsApp Phone</label>
                      <input
                        type="tel"
                        required
                        value={clientPhone}
                        onChange={(e) => setClientPhone(e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:border-teal-600"
                      />
                    </div>
                  </div>
                </div>

                {/* Payment Checkout CTA with Razorpay simulation */}
                <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-left">
                    <span className="text-slate-500 text-xs">Total Advance Payment:</span>
                    <p className="text-xl font-bold font-mono text-slate-900">
                      ₹{therapist.sessionFeeINR.toLocaleString('en-IN')} <span className="text-xs font-normal text-slate-500">(incl. 18% GST)</span>
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={!selectedSlot || bookingInProgress}
                    className="w-full sm:w-auto px-6 py-3 bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>{bookingInProgress ? 'Processing via Razorpay...' : 'Confirm & Pay with Razorpay'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Waitlist Modal */}
      {showWaitlistModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6 text-xs text-slate-700">
            <h3 className="font-bold text-slate-900 text-sm mb-1">Join Priority Waitlist</h3>
            <p className="text-slate-500 mb-4">
              Get notified immediately via WhatsApp when a slot opens with {therapist.name}.
            </p>

            {waitlistSuccess ? (
              <div className="p-4 bg-emerald-50 text-emerald-800 rounded-lg text-center space-y-1">
                <CheckCircle2 className="w-6 h-6 mx-auto text-emerald-600" />
                <p className="font-bold">You are on the priority waitlist!</p>
                <p className="text-[11px]">We will notify your WhatsApp if a cancellation occurs.</p>
              </div>
            ) : (
              <form onSubmit={handleJoinWaitlist} className="space-y-3">
                <div>
                  <label className="block font-semibold mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Phone (WhatsApp)</label>
                  <input
                    type="tel"
                    required
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                  />
                </div>
                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowWaitlistModal(false)}
                    className="px-3 py-1.5 text-slate-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-teal-700 text-white font-semibold rounded-lg"
                  >
                    Join Waitlist
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Invoice Modal Trigger */}
      {viewInvoice && (
        <InvoiceModal payment={viewInvoice} onClose={() => setViewInvoice(null)} />
      )}
    </div>
  );
};
