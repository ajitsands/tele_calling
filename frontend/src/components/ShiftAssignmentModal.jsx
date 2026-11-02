import React, { useState } from 'react';
import { 
  Smartphone, 
  UserCheck, 
  Clock, 
  X, 
  ArrowRightLeft,
  AlertTriangle 
} from 'lucide-react';

export default function ShiftAssignmentModal({ 
  isOpen, 
  onClose, 
  devices, 
  currentUser, 
  onAssignDevice 
}) {
  if (!isOpen) return null;

  const [selectedDeviceId, setSelectedDeviceId] = useState(devices[0]?.id || 1);
  const [shiftName, setShiftName] = useState('Morning Shift (09:00 - 17:00)');
  const [forceTakeover, setForceTakeover] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedDevice = devices.find(d => d.id === selectedDeviceId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    await onAssignDevice(selectedDeviceId, forceTakeover, shiftName);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-brand-600 to-indigo-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            <h3 className="font-bold text-base">Assign / Take Over Phone Terminal</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/20 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Select the mobile number you are operating in this shift. Only one telecaller can control a phone at a time.
          </p>

          {/* Select Device */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Select Mobile Terminal *
            </label>
            <select
              value={selectedDeviceId}
              onChange={(e) => {
                setSelectedDeviceId(Number(e.target.value));
                setForceTakeover(false);
              }}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
            >
              {devices.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.device_name} — {d.sim_number} {d.active_user_name ? `(In use by ${d.active_user_name})` : '(Available)'}
                </option>
              ))}
            </select>
          </div>

          {/* Shift Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Shift Name
            </label>
            <select
              value={shiftName}
              onChange={(e) => setShiftName(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
            >
              <option value="Morning Shift (09:00 - 17:00)">Morning Shift (09:00 - 17:00)</option>
              <option value="Evening Shift (14:00 - 22:00)">Evening Shift (14:00 - 22:00)</option>
              <option value="Night Shift (21:00 - 05:00)">Night Shift (21:00 - 05:00)</option>
              <option value="General Shift">General Shift</option>
            </select>
          </div>

          {/* Warning if device currently used by someone else */}
          {selectedDevice && selectedDevice.active_user_name && selectedDevice.active_user_id !== currentUser?.id && (
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Shift Handover Notice</span>
              </div>
              <p>
                This phone is currently active with <strong>{selectedDevice.active_user_name}</strong>. Assigning it will conclude their shift session and transfer all incoming calls to your workstation.
              </p>
              <label className="flex items-center gap-2 pt-1 cursor-pointer font-semibold">
                <input
                  type="checkbox"
                  checked={forceTakeover}
                  onChange={(e) => setForceTakeover(e.target.checked)}
                  className="rounded border-amber-400 text-brand-600 focus:ring-brand-500"
                />
                <span>Confirm Shift Handover &amp; Take Over Phone</span>
              </label>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || (selectedDevice?.active_user_name && selectedDevice.active_user_id !== currentUser?.id && !forceTakeover)}
              className="w-full py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition disabled:opacity-50"
            >
              <ArrowRightLeft className="w-4 h-4" />
              <span>{isSubmitting ? 'Updating...' : 'Assign Device to My Session'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}

