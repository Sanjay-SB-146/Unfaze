import React, { useState, useEffect } from 'react';
import { NotificationEvent } from '../../types';
import { apiRequest } from '../../api/client';
import { X, MessageSquare, Mail, RefreshCw, Send, CheckCircle, Clock } from 'lucide-react';

interface WhatsAppQueueModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WhatsAppQueueModal: React.FC<WhatsAppQueueModalProps> = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState<NotificationEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'whatsapp' | 'email'>('all');

  const fetchQueue = async () => {
    try {
      setIsLoading(true);
      const data = await apiRequest<NotificationEvent[]>('/notifications/queue');
      setNotifications(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchQueue();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filtered = notifications.filter((n) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'whatsapp') return n.channel === 'whatsapp' || n.channel === 'both';
    if (activeTab === 'email') return n.channel === 'email' || n.channel === 'both';
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <h2 className="text-base font-bold text-white tracking-tight">
                Event-Driven Notification Service & WhatsApp Queue
              </h2>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Architecture Stub: Dispatches on domain events (Booking Confirmed, 24h Reminder, Post-Session Follow-Up).
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter bar */}
        <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1 rounded font-medium transition-colors ${
                activeTab === 'all' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Events ({notifications.length})
            </button>
            <button
              onClick={() => setActiveTab('whatsapp')}
              className={`px-3 py-1 rounded font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === 'whatsapp' ? 'bg-emerald-700 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              WhatsApp Queue
            </button>
            <button
              onClick={() => setActiveTab('email')}
              className={`px-3 py-1 rounded font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === 'email' ? 'bg-indigo-700 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              Email Dispatch
            </button>
          </div>

          <button
            onClick={fetchQueue}
            disabled={isLoading}
            className="flex items-center gap-1 text-slate-600 hover:text-slate-900 text-xs font-medium"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Event List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              No notification events logged yet.
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-lg border border-slate-200 bg-white hover:border-slate-300 transition-colors"
              >
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="flex items-center gap-2">
                    {item.channel === 'whatsapp' || item.channel === 'both' ? (
                      <span className="p-1.5 rounded bg-emerald-50 text-emerald-700">
                        <MessageSquare className="w-4 h-4" />
                      </span>
                    ) : (
                      <span className="p-1.5 rounded bg-indigo-50 text-indigo-700">
                        <Mail className="w-4 h-4" />
                      </span>
                    )}
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{item.title}</h4>
                      <p className="text-[11px] text-slate-500">
                        To: {item.recipientName} ({item.recipientPhone || item.recipientEmail})
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded ${
                        item.status === 'delivered'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {item.status === 'delivered' ? (
                        <>
                          <CheckCircle className="w-3 h-3" />
                          <span>Delivered</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-3 h-3" />
                          <span>Queued (Scheduled)</span>
                        </>
                      )}
                    </span>
                    <p className="text-[10px] text-slate-400 mt-1 font-mono">
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>

                {/* Message preview snippet */}
                <div className="mt-2 p-2.5 rounded bg-slate-50 border border-slate-100 text-xs text-slate-700 font-sans leading-relaxed">
                  {item.message}
                </div>

                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="font-mono">Event: {item.type}</span>
                  <span>Channel: {item.channel.toUpperCase()}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500">
          <span>Enterprise event pipeline · WhatsApp Business API webhook connector</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 text-white rounded text-xs font-medium hover:bg-slate-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
