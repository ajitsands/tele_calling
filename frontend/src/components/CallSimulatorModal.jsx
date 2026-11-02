import React, { useState } from 'react';
import { 
  Play, 
  Smartphone, 
  PhoneIncoming, 
  PhoneOutgoing, 
  User, 
  X,
  AlertCircle
} from 'lucide-react';

export default function CallSimulatorModal({ 
  isOpen, 
  onClose, 
  devices, 
  onTriggerEvent 
}) {
  if (!isOpen) return null;

  const [selectedDeviceId, setSelectedDeviceId] = useState(devices[0]?.id || 1);
  const [callerNumber, setCallerNumber] = useState('+919876543210');
  const [eventType, setEventType] = useState('RINGING');
  const [callType, setCallType] = useState('INCOMING');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    await onTriggerEvent({
      device_id: selectedDeviceId,
      caller_number: callerNumber,
      event: eventType,
      call_type: callType
    });
    setIsSubmitting(false);
    onClose();
  };

  const sampleNumbers = [
    { label: 'Rajesh Gupta (Existing Customer)', number: '+919876543210' },
    { label: 'Sunita Deshmukh (Pharma Lead)', number: '+919823456789' },
    { label: 'Manish Agarwal (B2B Lead)', number: '+919711223344' },
    { label: 'Brand New Unknown Lead', number: '+919911224466' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Play className="w-5 h-5" />
            <h3 className="font-bold text-base">Telephony Gateway Simulator</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/20 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Simulates the exact HTTP/LAN webhook that the Android companion app sends when a physical phone rings or places a call.
          </p>

          {/* Select Target Device */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Select Receiving Smartphone Terminal *
            </label>
            <select
              value={selectedDeviceId}
              onChange={(e) => setSelectedDeviceId(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
            >
              {devices.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.device_name} — {d.sim_number} {d.active_user_name ? `(${d.active_user_name})` : '(Unassigned)'}
                </option>
              ))}
            </select>
          </div>

          {/* Caller Phone Number */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Customer / Caller Phone Number *
            </label>
            <input
              type="text"
              value={callerNumber}
              onChange={(e) => setCallerNumber(e.target.value)}
              placeholder="+919876543210"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none font-mono"
              required
            />
            {/* Quick Picker Chips */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {sampleNumbers.map((sn, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setCallerNumber(sn.number)}
                  className="text-[10px] px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-amber-500 transition"
                >
                  {sn.label}
                </button>
              ))}
            </div>
          </div>

          {/* Event & Call Type */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Event State
              </label>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
              >
                <option value="RINGING">RINGING (Triggers Screen Pop-up)</option>
                <option value="ANSWERED">ANSWERED / OFFHOOK</option>
                <option value="ENDED">ENDED / IDLE</option>
                <option value="MISSED">MISSED CALL</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Call Direction
              </label>
              <select
                value={callType}
                onChange={(e) => setCallType(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
              >
                <option value="INCOMING">INCOMING</option>
                <option value="OUTGOING">OUTGOING</option>
              </select>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition disabled:opacity-50"
            >
              <Play className="w-4 h-4" />
              <span>{isSubmitting ? 'Simulating...' : 'Dispatch Live Call Event'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}

