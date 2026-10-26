import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, Client } from '../../types';
import { apiRequest } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { Send, CheckCheck, Clock, ShieldCheck, Sparkles, User, RefreshCw } from 'lucide-react';

export const ChatWindow: React.FC = () => {
  const { therapist } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>('client_priya_patel');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [senderRole, setSenderRole] = useState<'therapist' | 'client'>('therapist');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchChat = async () => {
    if (!therapist) return;
    try {
      const [cls, msgs] = await Promise.all([
        apiRequest<Client[]>(`/clients?therapistId=${therapist.id}`),
        apiRequest<ChatMessage[]>(`/chat/messages?therapistId=${therapist.id}&clientId=${selectedClientId}`)
      ]);
      setClients(cls);
      setMessages(msgs);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchChat();
    const interval = setInterval(fetchChat, 6000);
    return () => clearInterval(interval);
  }, [therapist, selectedClientId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !therapist) return;

    const currentClient = clients.find((c) => c.id === selectedClientId);
    const senderName = senderRole === 'therapist' ? therapist.name : currentClient?.name || 'Client';

    try {
      const newMsg = await apiRequest<ChatMessage>('/chat/messages', {
        method: 'POST',
        body: JSON.stringify({
          therapistId: therapist.id,
          clientId: selectedClientId,
          senderRole,
          senderName,
          text: inputText
        })
      });
      setMessages((prev) => [...prev, newMsg]);
      setInputText('');
    } catch (err) {
      console.error(err);
    }
  };

  const currentClient = clients.find((c) => c.id === selectedClientId);

  const quickTemplates = [
    'How did the 4-7-8 grounding exercise feel today?',
    'Remember to note down automatic thoughts in your journal.',
    'Here is the link for our upcoming session: https://meet.unfazed.in'
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col h-[700px]">
      {/* Header */}
      <div className="p-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-teal-800 flex items-center justify-center font-bold text-sm text-teal-200">
            {currentClient?.name?.slice(0, 2) || 'PP'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-white">{currentClient?.name || 'Priya Patel'}</h3>
              <span className="text-[10px] text-teal-300 bg-teal-950 px-2 py-0.5 rounded border border-teal-800">
                End-to-End Encrypted
              </span>
            </div>
            <p className="text-xs text-slate-300">
              {currentClient?.email} · Caseload Client
            </p>
          </div>
        </div>

        {/* Client Selector & Switcher */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 bg-slate-800 px-2.5 py-1 rounded border border-slate-700">
            <span className="text-slate-400">Replying As:</span>
            <select
              value={senderRole}
              onChange={(e) => setSenderRole(e.target.value as any)}
              className="bg-transparent text-white font-semibold focus:outline-none"
            >
              <option value="therapist" className="bg-slate-900">Dr. Sharma (Therapist)</option>
              <option value="client" className="bg-slate-900">Priya Patel (Client)</option>
            </select>
          </div>

          <select
            value={selectedClientId}
            onChange={(e) => setSelectedClientId(e.target.value)}
            className="bg-slate-800 text-white rounded px-2.5 py-1 border border-slate-700 text-xs focus:outline-none"
          >
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                Chat with {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/50">
        <div className="text-center my-2">
          <span className="text-[11px] text-slate-400 bg-white border border-slate-200 px-3 py-1 rounded-full">
            Clinical communication log compliant with Telehealth Guidelines
          </span>
        </div>

        {messages.map((msg) => {
          const isMe = msg.senderRole === senderRole;
          const isTherapist = msg.senderRole === 'therapist';

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-center gap-1.5 mb-1 px-1 text-[11px] text-slate-500">
                <span className="font-semibold text-slate-700">{msg.senderName}</span>
                <span>·</span>
                <span className="font-mono">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>

              <div
                className={`max-w-md p-3.5 rounded-2xl text-xs leading-relaxed ${
                  isMe
                    ? isTherapist
                      ? 'bg-teal-700 text-white rounded-br-xs shadow-sm'
                      : 'bg-slate-800 text-white rounded-br-xs shadow-sm'
                    : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs shadow-xs'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.text}</p>
                <div className={`mt-1 flex items-center justify-end gap-1 text-[10px] ${isMe ? 'text-teal-200' : 'text-slate-400'}`}>
                  <CheckCheck className="w-3 h-3" />
                  <span>Read</span>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick response chips */}
      {senderRole === 'therapist' && (
        <div className="p-2.5 bg-white border-t border-slate-100 flex items-center gap-2 overflow-x-auto text-[11px]">
          <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] shrink-0">
            Quick Prompts:
          </span>
          {quickTemplates.map((tpl, i) => (
            <button
              key={i}
              onClick={() => setInputText(tpl)}
              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md whitespace-nowrap transition-colors"
            >
              {tpl}
            </button>
          ))}
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-slate-200 flex items-center gap-2">
        <input
          type="text"
          placeholder={`Type message as ${senderRole === 'therapist' ? therapist?.name : currentClient?.name}...`}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-teal-600 focus:bg-white transition-colors"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="p-2 bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white rounded-lg transition-colors shadow-sm"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
