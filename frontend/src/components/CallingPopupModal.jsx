import React, { useState, useEffect } from 'react';
import { 
  PhoneIncoming, 
  PhoneOff, 
  PhoneForwarded, 
  User, 
  Building, 
  MapPin, 
  Mail,
  Clock, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Tag, 
  Save, 
  X,
  Volume2,
  Sparkles,
  Edit3,
  History
} from 'lucide-react';

export default function CallingPopupModal({ 
  callEvent, 
  onClose, 
  onSaveDisposition, 
  onSimulateAnswer, 
  onSimulateEnd,
  onRejectCall,
  onDismissCall,
  onAnswerCall
}) {
  if (!callEvent) return null;

  const [callState, setCallState] = useState(callEvent.event || 'RINGING'); // RINGING, ANSWERED, ENDED
  const [callDuration, setCallDuration] = useState(0);
  const [disposition, setDisposition] = useState('INTERESTED');
  const [notes, setNotes] = useState('');
  const [nextFollowup, setNextFollowup] = useState('');
  const [leadStatus, setLeadStatus] = useState(callEvent.customer?.lead_status || 'QUALIFIED');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const customer = callEvent.customer || {};
  const isNewCaller = !customer.id || customer.full_name === 'New Prospective Client' || customer.full_name === 'New Caller' || !customer.full_name;

  // Real-time editable caller and company details
  const [callerName, setCallerName] = useState(
    customer.full_name && customer.full_name !== 'New Prospective Client' && customer.full_name !== 'New Caller'
      ? customer.full_name
      : ''
  );
  const [companyName, setCompanyName] = useState(
    customer.company_name && customer.company_name !== 'Unknown Company'
      ? customer.company_name
      : ''
  );
  const [city, setCity] = useState(customer.city && customer.city !== 'Local Region' ? customer.city : '');
  const [email, setEmail] = useState(customer.email || '');

  // Sync state if callEvent changes or phone answers/disconnects
  useEffect(() => {
    if (callEvent.event) {
      setCallState(callEvent.event);
    }
    const cust = callEvent.customer || {};
    if (cust.full_name && cust.full_name !== 'New Prospective Client' && cust.full_name !== 'New Caller') {
      setCallerName(cust.full_name);
    }
    if (cust.company_name && cust.company_name !== 'Unknown Company') {
      setCompanyName(cust.company_name);
    }
    if (cust.city && cust.city !== 'Local Region') {
      setCity(cust.city);
    }
    if (cust.email) {
      setEmail(cust.email);
    }
  }, [callEvent]);

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
      customer_id: customer.id,
      customer_number: callEvent.caller_number,
      full_name: callerName.trim() || 'New Caller',
      company_name: companyName.trim() || 'Company Not Specified',
      city: city.trim(),
      email: email.trim(),
      call_duration: callDuration,
      disposition,
      disposition_notes: notes,
      lead_status: leadStatus,
      next_followup_date: nextFollowup || null
    });
    setIsSubmitting(false);
    onClose();
  };

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
                  {callState === 'RINGING' ? 'Incoming Call Alert' : callState === 'ANSWERED' || callState === 'IN_PROGRESS' ? 'Call In Progress' : 'Call Ended / Disconnected'}
                </span>
                <span className="text-xs opacity-90 font-medium">
                  via {callEvent.device_name || 'Terminal Phone'} ({callEvent.sim_number || ''})
                </span>
              </div>
              <h2 className="text-xl font-bold tracking-tight">
                {callEvent.caller_number} {callerName ? `• ${callerName}` : ''} {companyName ? `(${companyName})` : ''}
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
            {callState === 'ENDED' && (
              <div className="flex items-center gap-2 bg-black/20 px-3 py-1.5 rounded-lg font-mono text-xs font-semibold text-slate-200">
                <Clock className="w-3.5 h-3.5 text-slate-300" />
                <span>Duration: {formatTimer(callDuration)}</span>
              </div>
            )}
            <button 
              onClick={() => {
                onClose();
                if (callState === 'RINGING' && onDismissCall) {
                  onDismissCall(callEvent.call_log_id);
                }
              }}
              className="p-1 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition"
              title="Close / Dismiss Call Window"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Split into Customer Info (Left) + Previous Interactions & Outcome Form (Right) */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Left Column: Editable Customer Profile & Call Control (5 Cols) */}
          <div className="md:col-span-5 space-y-4">
            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Edit3 className="w-3.5 h-3.5 text-brand-600" />
                  <span>Caller Identity &amp; Profile</span>
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isNewCaller ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                }`}>
                  {isNewCaller ? 'NEW CALLER' : 'EXISTING CRM CONTACT'}
                </span>
              </div>

              {/* Editable Fields for Caller Name & Company Name */}
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-brand-500" />
                    <span>Caller Full Name</span>
                  </label>
                  <input
                    type="text"
                    value={callerName}
                    onChange={(e) => setCallerName(e.target.value)}
                    placeholder="Enter Caller Name..."
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">
                    <Building className="w-3.5 h-3.5 text-brand-500" />
                    <span>Company / Business Name</span>
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Enter Company Name..."
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-brand-500" />
                      <span>City / Area</span>
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Manama"
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-brand-500" />
                      <span>Email (Optional)</span>
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email..."
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5 text-brand-500" />
                    <span>Lead Status</span>
                  </label>
                  <select
                    value={leadStatus}
                    onChange={(e) => setLeadStatus(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  >
                    <option value="NEW">New Lead / Inquiry</option>
                    <option value="QUALIFIED">Qualified Prospect</option>
                    <option value="PROPOSAL_SENT">Proposal / Quotation Sent</option>
                    <option value="CONVERTED">Converted Client</option>
                    <option value="LOST">Lost / Not Applicable</option>
                  </select>
                </div>
              </div>
            </div>

            {/* In-Call Fast Actions */}
            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-xs">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-3">Call Control</span>
              
              {callState === 'RINGING' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setCallState('ANSWERED');
                      if (onAnswerCall) onAnswerCall(callEvent.call_log_id);
                      if (onSimulateAnswer) onSimulateAnswer();
                    }}
                    className="flex-1 py-2.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition"
                  >
                    <PhoneIncoming className="w-4 h-4" />
                    <span>Answer Call</span>
                  </button>
                  <button
                    onClick={() => {
                      onClose();
                      if (onRejectCall) {
                        onRejectCall(callEvent.call_log_id);
                      }
                    }}
                    className="py-2.5 px-3 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm transition"
                    title="Reject / Decline Call"
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
                  <span>End Call &amp; Save Details</span>
                </button>
              )}

              {callState === 'ENDED' && (
                <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Call finished! Review details &amp; save outcome.</span>
                </div>
              )}
            </div>

            {/* Quick Shift Tips */}
            <div className="p-3 rounded-xl bg-brand-50/60 dark:bg-brand-950/20 border border-brand-100 dark:border-brand-900/40 text-[11px] text-brand-800 dark:text-brand-300 flex items-center justify-between">
              <span>Shift Concurrency Active: Linked to {callEvent.device_name || 'Terminal Phone'}</span>
              <span className="font-semibold">Shift: Morning</span>
            </div>
          </div>

          {/* Right Column: Previous Interactions + Call Outcome & Notes Form (7 Cols) */}
          <div className="md:col-span-7 space-y-4 flex flex-col justify-between">
            
            {/* 1. PREVIOUS INTERACTIONS (PLACED ON RIGHT SIDE) */}
            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-xs">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200 dark:border-slate-700">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5 text-brand-600" />
                  <span>Previous Interactions</span>
                </span>
                <span className="text-[11px] font-semibold text-brand-700 dark:text-brand-300 bg-brand-100 dark:bg-brand-950 px-2 py-0.5 rounded-full">
                  {history.length} Past Calls
                </span>
              </div>

              {history.length === 0 ? (
                <div className="py-4 text-center text-slate-400 text-xs">
                  <AlertCircle className="w-6 h-6 mx-auto mb-1 opacity-40 text-slate-400" />
                  <p className="font-medium">No previous call history found for this number.</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">This caller is being logged as a new contact.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                  {history.map((h, i) => (
                    <div key={i} className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs shadow-2xs hover:border-brand-300 transition">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200 text-[11px]">
                          <span>{h.start_time}</span>
                          <span className="text-slate-400">•</span>
                          <span className="text-slate-500 font-normal">by {h.agent_name || 'Agent'}</span>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          h.disposition === 'INTERESTED' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                          h.disposition === 'SALE_CLOSED' ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300' :
                          h.disposition === 'CALLBACK_REQUESTED' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' :
                          h.disposition === 'NOT_INTERESTED' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' :
                          'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                        }`}>
                          {h.disposition || 'COMPLETED'}
                        </span>
                      </div>
                      {h.disposition_notes && (
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 italic bg-slate-50 dark:bg-slate-800/60 p-1.5 rounded border border-slate-100 dark:border-slate-800">
                          "{h.disposition_notes}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Customer Notes Insight Feed if present */}
              {customerNotes.length > 0 && (
                <div className="pt-2 mt-2 border-t border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Agent Notes &amp; Insights</span>
                  <div className="space-y-1 max-h-20 overflow-y-auto">
                    {customerNotes.map((n, i) => (
                      <div key={i} className="text-[11px] p-1.5 rounded bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30 text-amber-900 dark:text-amber-200">
                        <span className="font-semibold mr-1">{n.agent_name || 'Agent'}:</span>
                        <span>{n.note}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 2. CURRENT CALL OUTCOME & NOTES FORM */}
            <form onSubmit={handleSave} className="space-y-3 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-xs flex-1 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Call Outcome / Disposition *
                    </label>
                    <select
                      value={disposition}
                      onChange={(e) => setDisposition(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none font-medium"
                    >
                      <option value="INTERESTED">Interested (High Potential)</option>
                      <option value="CALLBACK_REQUESTED">Call Back Requested</option>
                      <option value="PROPOSAL_SENT">Proposal / Quotation Sent</option>
                      <option value="SALE_CLOSED">Sale / Deal Closed 🎉</option>
                      <option value="NOT_INTERESTED">Not Interested</option>
                      <option value="BUSY">Line Busy / Call Again</option>
                      <option value="WRONG_NUMBER">Wrong Number</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-brand-500" />
                      <span>Next Follow-up Date (Optional)</span>
                    </label>
                    <input
                      type="date"
                      value={nextFollowup}
                      onChange={(e) => setNextFollowup(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                    <span>Call Interaction Notes</span>
                    <span className="text-[10px] text-slate-400 font-normal">Details discussed with client</span>
                  </label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Enter call notes, requirements, customer feedback, and action points..."
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none resize-none"
                  />
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Cancel / Close
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 text-xs font-bold rounded-lg bg-brand-600 hover:bg-brand-700 text-white flex items-center gap-2 shadow-sm transition disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSubmitting ? 'Saving...' : 'Save Caller Details & Disposition'}</span>
                </button>
              </div>
            </form>

          </div>

        </div>

      </div>
    </div>
  );
}
