import React from 'react';
import { BarChart3, TrendingUp, CheckCircle, Clock, Smartphone, Users } from 'lucide-react';

export default function AnalyticsView({ stats, calls, devices, users }) {
  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Telephony Operations &amp; Performance</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Real-time metrics, telecaller call volumes, and conversion disposition summaries
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
            Total Calls Handled
          </span>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white">{stats.total_calls_today || 15}</p>
          <p className="text-xs text-emerald-600 font-semibold mt-1">Across 5 Mobile Terminals</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
            Answer Rate
          </span>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white">88%</p>
          <p className="text-xs text-slate-500 mt-1">Average wait time: 4.2s</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
            Interested / Closed Leads
          </span>
          <p className="text-3xl font-extrabold text-brand-600">62%</p>
          <p className="text-xs text-slate-500 mt-1">High conversion velocity</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
            Active Phone Fleet
          </span>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white">5 / 5</p>
          <p className="text-xs text-emerald-600 font-semibold mt-1">100% Wi-Fi Connectivity</p>
        </div>
      </div>

      {/* Leaderboard & Device Utilization */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Telecaller Performance (7 Cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">Telecaller Daily Activity</h3>
          <div className="space-y-3">
            {[
              { name: 'Priya Sharma', shift: 'Morning Shift', calls: 28, talkTime: '1h 45m', score: 94 },
              { name: 'Rahul Verma', shift: 'Morning Shift', calls: 24, talkTime: '1h 32m', score: 90 },
              { name: 'Ananya Patel', shift: 'Morning Shift', calls: 21, talkTime: '1h 18m', score: 86 },
              { name: 'Vikram Singh', shift: 'Morning Shift', calls: 19, talkTime: '1h 05m', score: 82 },
              { name: 'Sneha Roy', shift: 'Morning Shift', calls: 16, talkTime: '55m', score: 79 },
            ].map((agent, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand-600 text-white font-bold flex items-center justify-center">
                    {agent.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">{agent.name}</p>
                    <p className="text-slate-500 text-[11px]">{agent.shift}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <span className="font-bold text-slate-800 dark:text-slate-200">{agent.calls} Calls</span>
                    <p className="text-slate-400 text-[10px]">Talk: {agent.talkTime}</p>
                  </div>
                  <div className="w-16 bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${agent.score}%` }}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Disposition Breakdown (5 Cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">Disposition Breakdown</h3>
          <div className="space-y-3 text-xs">
            {[
              { label: 'Interested', pct: 45, color: 'bg-emerald-500' },
              { label: 'Callback Requested', pct: 25, color: 'bg-blue-500' },
              { label: 'Sale Closed', pct: 15, color: 'bg-purple-500' },
              { label: 'Not Interested', pct: 10, color: 'bg-slate-400' },
              { label: 'Busy / Missed', pct: 5, color: 'bg-rose-500' },
            ].map((d, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between font-semibold text-slate-700 dark:text-slate-300">
                  <span>{d.label}</span>
                  <span>{d.pct}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div className={`${d.color} h-full rounded-full`} style={{ width: `${d.pct}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}

