import React from 'react';
import { 
  PhoneCall, 
  Smartphone, 
  Users, 
  Clock, 
  CheckCircle, 
  PhoneMissed, 
  PhoneIncoming, 
  Radio, 
  Play, 
  Battery, 
  Wifi, 
  UserCheck 
} from 'lucide-react';

export default function LiveDesk({ 
  devices, 
  stats, 
  activeShift, 
  onSimulateCall, 
  onOpenShiftModal,
  recentCalls 
}) {
  return (
    <div className="space-y-6">
      
      {/* Top Banner: Shift & Telephony Status */}
      <div className="bg-gradient-to-r from-brand-600 via-indigo-600 to-brand-700 rounded-2xl p-6 text-white shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-xs font-semibold backdrop-blur">
                LAN Telephony Active
              </span>
              <span className="flex items-center gap-1 text-xs text-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Local Wi-Fi Gateway
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Telecaller Live Workstation</h1>
            <p className="text-sm text-brand-100 mt-1">
              {activeShift ? (
                <>Mapped to <strong className="text-white">{activeShift.device_name}</strong> ({activeShift.sim_number}) • Shift: {activeShift.shift_name}</>
              ) : (
                <>No phone mapped yet. Select a device below to start taking calls.</>
              )}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenShiftModal}
              className="px-4 py-2 rounded-xl bg-white text-brand-700 font-semibold text-xs shadow-sm hover:bg-brand-50 transition flex items-center gap-2"
            >
              <Smartphone className="w-4 h-4" />
              <span>Change / Handover Phone</span>
            </button>
            <button
              onClick={() => onSimulateCall()}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs shadow-sm transition flex items-center gap-2"
            >
              <Play className="w-4 h-4" />
              <span>Simulate Incoming Call</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Calls Today</span>
            <PhoneCall className="w-4 h-4 text-brand-600 dark:text-brand-400" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total_calls_today || 12}</p>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">+3 in last hour</span>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Answered Calls</span>
            <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.answered_today || 9}</p>
          <span className="text-[11px] text-slate-500 font-medium">Avg talk time: 3m 42s</span>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Missed Calls</span>
            <PhoneMissed className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.missed_today || 2}</p>
          <span className="text-[11px] text-rose-500 font-medium">Needs callback</span>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Terminals Online</span>
            <Smartphone className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{devices.length || 5}</p>
          <span className="text-[11px] text-slate-500 font-medium">All 5 Android Devices Active</span>
        </div>
      </div>

      {/* Grid: 5+ Connected Terminals Overview & Recent Calls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Android Terminals Fleet Status (7 Cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Mobile Fleet Terminals (5 Phones)</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Shared hardware mapped to current active telecallers
              </p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium">
              Same Wi-Fi Network
            </span>
          </div>

          <div className="space-y-3">
            {devices.map((dev) => (
              <div 
                key={dev.id}
                className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/70 hover:border-brand-500/50 bg-slate-50/50 dark:bg-slate-800/60 transition"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs ${
                    dev.status === 'BUSY' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 animate-pulse' :
                    dev.status === 'ONLINE' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' :
                    'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                  }`}>
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">{dev.device_name}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-mono">
                        {dev.android_version || 'Android'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      <span>SIM: <strong className="text-slate-700 dark:text-slate-300">{dev.sim_number}</strong></span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Battery className="w-3 h-3 text-emerald-500" />
                        {dev.battery_level || 90}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  {dev.active_user_name ? (
                    <div>
                      <div className="flex items-center gap-1.5 justify-end">
                        <UserCheck className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{dev.active_user_name}</span>
                      </div>
                      <span className="text-[11px] text-slate-400">{dev.shift_name}</span>
                    </div>
                  ) : (
                    <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold px-2 py-1 rounded bg-amber-50 dark:bg-amber-950/40">
                      Available (Unmapped)
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Simulator & Real-time Test Drawer (5 Cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Radio className="w-4 h-4 text-amber-500" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Quick Test Gateway</h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Trigger a test incoming call to verify real-time pop-up modal and customer history timeline without waiting for a physical telephone call.
            </p>

            <div className="space-y-2 mb-4">
              <button
                onClick={() => onSimulateCall({ caller_number: '+919876543210' })}
                className="w-full text-left p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition flex items-center justify-between"
              >
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Returning Customer (+91 98765 43210)</p>
                  <p className="text-[11px] text-slate-500">Rajesh Gupta • Gupta Global Traders (4 Past Calls)</p>
                </div>
                <Play className="w-4 h-4 text-brand-600 shrink-0" />
              </button>

              <button
                onClick={() => onSimulateCall({ caller_number: '+919823456789' })}
                className="w-full text-left p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition flex items-center justify-between"
              >
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Qualified Lead (+91 98234 56789)</p>
                  <p className="text-[11px] text-slate-500">Sunita Deshmukh • Apex Healthcare (Proposal Sent)</p>
                </div>
                <Play className="w-4 h-4 text-brand-600 shrink-0" />
              </button>

              <button
                onClick={() => onSimulateCall({ caller_number: '+919999888877' })}
                className="w-full text-left p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition flex items-center justify-between"
              >
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">First-Time Unknown Caller (+91 99998 88877)</p>
                  <p className="text-[11px] text-slate-500">Brand new inquiry • Auto-generates CRM lead</p>
                </div>
                <Play className="w-4 h-4 text-brand-600 shrink-0" />
              </button>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500">
            💡 <strong>Shift Tip:</strong> When a new shift begins, another telecaller simply logs into their account and claims the same terminal phone. The previous session is cleanly handed over.
          </div>
        </div>

      </div>

    </div>
  );
}

