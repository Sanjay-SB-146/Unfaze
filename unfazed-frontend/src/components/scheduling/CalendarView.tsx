import React, { useState, useEffect } from 'react';
import { Session, Availability } from '../../types';
import { apiRequest } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { Calendar as CalendarIcon, Clock, Video, MapPin, User, ChevronLeft, ChevronRight, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

export const CalendarView: React.FC = () => {
  const { therapist } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [availability, setAvailability] = useState<Availability | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState('2026-10-28');
  const [statusFilter, setStatusFilter] = useState<'all' | 'scheduled' | 'completed' | 'no_show'>('all');

  const fetchScheduleData = async () => {
    if (!therapist) return;
    try {
      setIsLoading(true);
      const [allClientsData, availData] = await Promise.all([
        apiRequest<{ sessions: Session[] }>(`/clients/${therapist.id === 'therapist_ananya_sharma' ? 'client_priya_patel' : 'client_rohan_sengupta'}`),
        apiRequest<Availability>(`/scheduling/availability/${therapist.id}`)
      ]);
      setAvailability(availData);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchScheduleData();
  }, [therapist]);

  // Demo days for week view
  const weekDays = [
    { date: '2026-10-26', day: 'Mon', count: 2 },
    { date: '2026-10-27', day: 'Tue', count: 3 },
    { date: '2026-10-28', day: 'Wed', count: 4, active: true },
    { date: '2026-10-29', day: 'Thu', count: 2 },
    { date: '2026-10-30', day: 'Fri', count: 3 },
    { date: '2026-10-31', day: 'Sat', count: 1 },
    { date: '2026-11-01', day: 'Sun', count: 0, off: true }
  ];

  // Daily sessions for Oct 28
  const dailySessions: Session[] = [
    {
      id: 'sess_101',
      therapistId: therapist?.id || '',
      clientId: 'client_priya_patel',
      clientName: 'Priya Patel',
      clientEmail: 'priya.patel@gmail.com',
      clientPhone: '+91 98212 90145',
      date: '2026-10-28',
      startTime: '11:00',
      endTime: '11:50',
      durationMinutes: 50,
      serviceTitle: 'Individual Therapy (Video Consultation)',
      status: 'scheduled',
      mode: 'online',
      meetingLink: 'https://meet.unfazed.in/room/sharma-patel-8472',
      feeINR: 2200,
      paymentStatus: 'paid',
      createdAt: '2026-10-24'
    },
    {
      id: 'sess_102',
      therapistId: therapist?.id || '',
      clientId: 'client_rohan_sengupta',
      clientName: 'Rohan Sengupta',
      clientEmail: 'rohan.sengupta@outlook.com',
      clientPhone: '+91 97110 44321',
      date: '2026-10-28',
      startTime: '14:00',
      endTime: '14:50',
      durationMinutes: 50,
      serviceTitle: 'Individual Therapy (Video Consultation)',
      status: 'scheduled',
      mode: 'online',
      meetingLink: 'https://meet.unfazed.in/room/sharma-rohan-9102',
      feeINR: 2200,
      paymentStatus: 'paid',
      createdAt: '2026-10-25'
    },
    {
      id: 'sess_103',
      therapistId: therapist?.id || '',
      clientId: 'client_aanya_kulkarni',
      clientName: 'Aanya Kulkarni',
      clientEmail: 'aanya.k@startup.co',
      clientPhone: '+91 98205 33211',
      date: '2026-10-28',
      startTime: '15:30',
      endTime: '16:20',
      durationMinutes: 50,
      serviceTitle: 'In-Clinic Consultation (Bandra West)',
      status: 'scheduled',
      mode: 'in_person',
      location: 'Bandra West Clinic, Room 302',
      feeINR: 2800,
      paymentStatus: 'paid',
      createdAt: '2026-10-25'
    },
    {
      id: 'sess_104',
      therapistId: therapist?.id || '',
      clientId: 'client_vikram_verma',
      clientName: 'Vikram Verma',
      clientEmail: 'vikram.v@consulting.in',
      clientPhone: '+91 98114 77210',
      date: '2026-10-28',
      startTime: '17:00',
      endTime: '17:50',
      durationMinutes: 50,
      serviceTitle: 'Individual Therapy (Video Consultation)',
      status: 'completed',
      mode: 'online',
      meetingLink: 'https://meet.unfazed.in/room/sharma-vikram-1120',
      feeINR: 2200,
      paymentStatus: 'paid',
      createdAt: '2026-10-22'
    }
  ];

  const filteredSessions = dailySessions.filter((s) => {
    if (statusFilter === 'all') return true;
    return s.status === statusFilter;
  });

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Clinical Schedule & Availability</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Buffer Time: <strong className="text-slate-800">15 min</strong> · Session Durations: <strong className="text-slate-800">30, 50, 75 min</strong> · Timezone: <strong className="text-slate-800">Asia/Kolkata (IST)</strong>
          </p>
        </div>

        {/* Status Filter Tabs complying with frontend-design */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs">
          {(['all', 'scheduled', 'completed', 'no_show'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 font-medium rounded-md capitalize transition-colors ${
                statusFilter === st ? 'bg-white text-slate-900 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Week Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
        {weekDays.map((w) => (
          <button
            key={w.date}
            onClick={() => setSelectedDate(w.date)}
            className={`p-3 rounded-lg border text-left transition-all ${
              selectedDate === w.date
                ? 'bg-teal-50 border-teal-600 ring-2 ring-teal-500/20'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-900">{w.day}</span>
              <span className="text-slate-400 font-mono text-[11px]">{w.date.slice(-2)}</span>
            </div>
            <div className="mt-2 text-xs">
              {w.off ? (
                <span className="text-slate-400">Off</span>
              ) : (
                <span className="font-mono text-teal-800 font-medium">{w.count} sessions</span>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Time Slots Agenda for Selected Date */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 font-semibold text-slate-900">
            <CalendarIcon className="w-4 h-4 text-teal-600" />
            <span>Wednesday, October 28, 2026</span>
            <span className="text-slate-400">·</span>
            <span className="text-slate-600 font-normal">{filteredSessions.length} appointments booked</span>
          </div>
          <span className="text-slate-500">Double-Booking Guard: Active</span>
        </div>

        <div className="divide-y divide-slate-100 p-2">
          {filteredSessions.map((session) => (
            <div
              key={session.id}
              className="p-4 hover:bg-slate-50/80 rounded-lg transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3.5">
                <div className="w-20 shrink-0 text-left">
                  <span className="font-mono font-bold text-slate-900 text-sm">{session.startTime}</span>
                  <span className="block text-[11px] text-slate-400 font-mono">50 min</span>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-sm">{session.clientName}</h3>
                    <span className="text-xs text-slate-400">·</span>
                    <span className="text-xs text-slate-600">{session.serviceTitle}</span>
                  </div>

                  <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>{session.clientPhone}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      {session.mode === 'online' ? (
                        <>
                          <Video className="w-3.5 h-3.5 text-teal-600" />
                          <span className="text-teal-700">Telehealth Video Room</span>
                        </>
                      ) : (
                        <>
                          <MapPin className="w-3.5 h-3.5 text-amber-600" />
                          <span>{session.location}</span>
                        </>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status & Actions */}
              <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                <span className="font-mono text-xs font-semibold text-slate-900 tabular-nums">
                  ₹{session.feeINR.toLocaleString('en-IN')}
                </span>

                <span
                  className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                    session.status === 'scheduled'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : session.status === 'completed'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}
                >
                  {session.status === 'scheduled' ? 'Confirmed' : session.status}
                </span>

                {session.meetingLink && (
                  <a
                    href={session.meetingLink}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded text-xs font-medium transition-colors shadow-sm"
                  >
                    Join Room
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
