import React, { useState, useEffect } from 'react';
import { 
  PhoneIncoming, 
  PhoneOff, 
  PhoneForwarded, 
  User, 
  Building, 
  MapPin, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Tag, 
  Save, 
  X,
  Volume2
} from 'lucide-react';

export default function CallingPopupModal({ 
  callEvent, 
  onClose, 
  onSaveDisposition, 
  onSimulateAnswer, 
  onSimulateEnd 
}) {
  if (!callEvent) return null;

  const [callState, setCallState] = useState(callEvent.event || 'RINGING'); // RINGING, ANSWERED, ENDED
  const [callDuration, setCallDuration] = useState(0);
  const [disposition, setDisposition] = useState('INTERESTED');
  const [notes, setNotes] = useState('');
  const [nextFollowup, setNextFollowup] = useState('');
  const [leadStatus, setLeadStatus] = useState(callEvent.customer?.lead_status || 'QUALIFIED');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync state if callEvent changes
  useEffect(() => {
    if (callEvent.event) {
      setCallState(callEvent.event);
    }
  }, [callEvent.event]);

  // Call timer when ANSWERED / IN_PROGRESS
  useEffect(() => {
    let timer;
    if (callState === 'ANSWERED' || callState === 'IN_PROGRESS') {
      timer = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [callState]);

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    await onSaveDisposition({
      call_id: callEvent.call_log_id,
      disposition,
      disposition_notes: notes,
      lead_status: leadStatus,
      next_followup_date: nextFollowup || null
    });
    setIsSubmitting(false);
    onClose();
  };

  const customer = callEvent.customer || {};
  const history = callEvent.history || [];
  const customerNotes = callEvent.notes || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Dynamic Top Alert Banner based on Call State */}
        <div className={`px-6 py-4 flex items-center justify-between text-white transition-all ${
          callState === 'RINGING' 
            ? 'bg-gradient-to-r from-amber-500 via-rose-500 to-amber-600 animate-pulse-fast' 
            : callState === 'ANSWERED' || callState === 'IN_PROGRESS'
            ? 'bg-gradient-to-r from-emerald-600 to-teal-700'
            : 'bg-gradient-to-r from-slate-700 to-slate-800'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-white">
              {callState === 'RINGING' ? (
                <PhoneIncoming className="w-6 h-6 animate-bounce" />
              ) : callState === 'ANSWERED' || callState === 'IN_PROGRESS' ? (
                <PhoneForwarded className="w-6 h-6" />
              ) : (
                <PhoneOff className="w-6 h-6" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-full bg-white/20">
                  {callState === 'RINGING' ? 'Incoming Call Alert' : callState === 'ANSWERED' || callState === 'IN_PROGRESS' ? 'Call In Progress' : 'Call Ended'}
                </span>
                <span className="text-xs opacity-90 font-medium">
                  via {callEvent.device_name || 'Terminal Phone'} ({callEvent.sim_number || ''})
                </span>
              </div>
              <h2 className="text-xl font-bold tracking-tight">
                {callEvent.caller_number} {customer.full_name ? `• ${customer.full_name}` : ''}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {(callState === 'ANSWERED' || callState === 'IN_PROGRESS') && (
              <div className="flex items-center gap-2 bg-black/20 px-3 py-1.5 rounded-lg font-mono text-base font-bold">
                <Clock className="w-4 h-4 text-emerald-300" />
                <span>{formatTimer(callDuration)}</span>
              </div>
            )}
            <button 
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Split into Customer Info + Past History + Disposition Form */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Left Column: Customer Profile Snapshot (5 Cols) */}
          <div className="md:col-span-5 space-y-4">
            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700/60">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Customer Profile</span>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                  customer.lead_status === 'QUALIFIED' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                  customer.lead_status === 'PROPOSAL_SENT' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' :
                  customer.lead_status === 'CONVERTED' ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300' :
                  'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                }`}>
                  {customer.lead_status || 'NEW LEAD'}
                </span>
              </div>

              <div className="space-y-2.5 text-sm">
                <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
                  <User className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="font-semibold">{customer.full_name || 'Unregistered Lead'}</span>
                </div>

                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <Building className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{customer.company_name || 'Company Not Specified'}</span>
                </div>

                {customer.city && (
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>{customer.city}</span>
                  </div>
                )}

                {customer.tags && (
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 pt-1">
                    <Tag className="w-4 h-4 text-slate-400 shrink-0" />
                    <div className="flex flex-wrap gap-1">
                      {customer.tags.split(',').map((tag, idx) => (
                        <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-medium">
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* In-Call Fast Actions */}
            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700/60">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-3">Call Control</span>
              
              {callState === 'RINGING' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setCallState('ANSWERED');
                      if (onSimulateAnswer) onSimulateAnswer();
                    }}
                    className="flex-1 py-2.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition"
                  >
                    <PhoneIncoming className="w-4 h-4" />
                    <span>Answer Call</span>
                  </button>
                  <button
                    onClick={() => {
                      setCallState('ENDED');
                      if (onSimulateEnd) onSimulateEnd();
                    }}
                    className="py-2.5 px-3 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm transition"
                  >
                    <PhoneOff className="w-4 h-4" />
                    <span>Decline</span>
                  </button>
                </div>
              )}

              {(callState === 'ANSWERED' || callState === 'IN_PROGRESS') && (
                <button
                  onClick={() => {
                    setCallState('ENDED');
                    if (onSimulateEnd) onSimulateEnd();
                  }}
                  className="w-full py-2.5 px-3 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition"
                >
                  <PhoneOff className="w-4 h-4" />
                  <span>End Call &amp; Log Disposition</span>
                </button>
              )}

              {callState === 'ENDED' && (
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Call finished. Please record disposition below.</span>
                </div>
              )}
            </div>

            {/* Post-Call Outcome & Notes Form */}
            <form onSubmit={handleSave} className="space-y-3 pt-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Call Outcome / Disposition *
                </label>
                <select
                  value={disposition}
                  onChange={(e) => setDisposition(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                >
                  <option value="INTERESTED">Interested (High Potential)</option>
                  <option value="CALLBACK_REQUESTED">Call Back Requested</option>
                  <option value="PROPOSAL_SENT">Proposal / Quotation Sent</option>
                  <option value="SALE_CLOSED">Sale / Deal Closed 🎉</option>
                  <option value="NOT_INTERESTED">Not Interested</option>
                  <option value="BUSY">Line Busy / Call Again</option>
                  <option value="WRONG_NUMBER">Wrong Number</option>
                  <option value="OTHER">Other Outcome</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Customer Notes &amp; Conversation Remarks
                </label>
                <textarea
                  rows="3"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Summarize key points, requirements, prices quoted, customer objections..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none placeholder:text-slate-400"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Next Follow-up
                  </label>
                  <input
                    type="datetime-local"
                    value={nextFollowup}
                    onChange={(e) => setNextFollowup(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Update Lead Stage
                  </label>
                  <select
                    value={leadStatus}
                    onChange={(e) => setLeadStatus(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  >
                    <option value="NEW">New</option>
                    <option value="CONTACTED">Contacted</option>
                    <option value="QUALIFIED">Qualified</option>
                    <option value="PROPOSAL_SENT">Proposal Sent</option>
                    <option value="CONVERTED">Converted</option>
                    <option value="LOST">Lost</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-2.5 px-4 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSubmitting ? 'Saving...' : 'Save Disposition & Close'}</span>
              </button>
            </form>
          </div>

          {/* Right Column: Customer History & Prior Conversations (7 Cols) */}
          <div className="md:col-span-7 flex flex-col h-full space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Previous Conversation History ({history.length} Calls)
                </h3>
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Shared across all shifts &amp; telecallers
              </span>
            </div>

            {/* History Feed */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[460px]">
              {history.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">
                  <User className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm font-semibold">First-Time Caller</p>
                  <p className="text-xs mt-1">No previous call logs found for this phone number.</p>
                </div>
              ) : (
                history.map((item, idx) => (
                  <div 
                    key={idx} 
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800 shadow-xs hover:border-brand-500/50 transition"
                  >
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                          item.call_type === 'INCOMING' ? 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300' :
                          'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}>
                          {item.call_type}
                        </span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {item.agent_name || 'Telecaller'}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        {item.start_time} • {item.duration_seconds ? `${Math.floor(item.duration_seconds / 60)}m ${item.duration_seconds % 60}s` : '0s'}
                      </span>
                    </div>

                    {item.disposition && (
                      <div className="mb-1.5">
                        <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                          Outcome: {item.disposition}
                        </span>
                      </div>
                    )}

                    {item.disposition_notes && (
                      <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800/80">
                        "{item.disposition_notes}"
                      </p>
                    )}
                  </div>
                ))
              )}

              {/* Customer Notes Feed */}
              {customerNotes.length > 0 && (
                <div className="pt-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Agent Notes</h4>
                  <div className="space-y-2">
                    {customerNotes.map((n, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 text-xs">
                        <div className="flex justify-between text-[11px] font-semibold text-amber-900 dark:text-amber-300 mb-1">
                          <span>{n.agent_name}</span>
                          <span className="opacity-70">{n.created_at}</span>
                        </div>
                        <p className="text-slate-700 dark:text-slate-300">{n.note}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

