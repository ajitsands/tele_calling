import React from 'react';
import { 
  Smartphone, 
  Battery, 
  Wifi, 
  UserCheck, 
  ArrowRightLeft, 
  Plus, 
  CheckCircle, 
  AlertTriangle,
  Radio,
  Clock
} from 'lucide-react';

export default function DeviceShiftManager({ 
  devices, 
  users, 
  currentUser, 
  onAssignDevice, 
  onReleaseDevice 
}) {
  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Device Fleet &amp; Shift Management</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Each physical smartphone is mapped to a single active telecaller per shift. When a new shift begins, the next telecaller can take over the phone. At any time, strictly <strong>one user handles one mobile number</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
            <span>5 Terminals Active on Wi-Fi</span>
          </span>
        </div>
      </div>

      {/* Device Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {devices.map((device) => {
          const isCurrentUserMapped = device.active_user_id === currentUser?.id;

          return (
            <div 
              key={device.id}
              className={`rounded-2xl border p-5 shadow-xs transition flex flex-col justify-between ${
                isCurrentUserMapped
                  ? 'bg-gradient-to-b from-brand-50/70 to-white dark:from-brand-950/20 dark:to-slate-800 border-brand-500 ring-2 ring-brand-500/20'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
              }`}
            >
              <div>
                {/* Top Row: Device Name & Status Pill */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 font-bold text-xs">
                      <Smartphone className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">
                        {device.device_name}
                      </h3>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                        {device.android_version || 'Android 14'}
                      </span>
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    device.status === 'ONLINE' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                    device.status === 'BUSY' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 animate-pulse' :
                    'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                  }`}>
                    {device.status}
                  </span>
                </div>

                {/* SIM Number & Specs */}
                <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1.5 text-xs text-slate-600 dark:text-slate-300 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">SIM Phone Number:</span>
                    <strong className="text-slate-900 dark:text-white font-mono">{device.sim_number}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Wi-Fi IP Address:</span>
                    <span className="font-mono text-[11px]">{device.ip_address || '192.168.1.xxx'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Battery Level:</span>
                    <span className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                      <Battery className="w-3.5 h-3.5" />
                      {device.battery_level || 90}%
                    </span>
                  </div>
                </div>

                {/* Shift Assignment Status */}
                <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 mb-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Active Shift Caller
                  </span>
                  {device.active_user_name ? (
                    <div>
                      <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900 dark:text-white">
                        <UserCheck className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                        <span>{device.active_user_name}</span>
                        {isCurrentUserMapped && (
                          <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-300">
                            You
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{device.shift_name || 'General Shift'}</span>
                      </p>
                    </div>
                  ) : (
                    <div className="text-xs text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Unassigned / Ready for Takeover</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2">
                {isCurrentUserMapped ? (
                  <button
                    onClick={() => onReleaseDevice(device.id)}
                    className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-semibold transition"
                  >
                    Release This Phone (End Shift)
                  </button>
                ) : (
                  <button
                    onClick={() => onAssignDevice(device.id, device.active_user_name ? true : false)}
                    className="w-full py-2 px-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition"
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5" />
                    <span>{device.active_user_name ? 'Take Over Phone (New Shift)' : 'Map to My Login'}</span>
                  </button>
                )}
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}

