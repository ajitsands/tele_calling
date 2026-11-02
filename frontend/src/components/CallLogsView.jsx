import React, { useState } from 'react';
import { 
  PhoneIncoming, 
  PhoneOutgoing, 
  PhoneMissed, 
  Search, 
  Play, 
  Pause, 
  Filter, 
  Volume2, 
  Calendar, 
  User, 
  Smartphone,
  CheckCircle,
  Clock
} from 'lucide-react';

export default function CallLogsView({ calls, onSelectCustomer }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [filterDisposition, setFilterDisposition] = useState('ALL');
  const [playingAudioId, setPlayingAudioId] = useState(null);

  const filteredCalls = calls.filter((call) => {
    const matchesSearch = 
      (call.customer_number || '').includes(searchTerm) ||
      (call.customer_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (call.company_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'ALL' || call.call_type === filterType;
    const matchesDisp = filterDisposition === 'ALL' || call.disposition === filterDisposition;

    return matchesSearch && matchesType && matchesDisp;
  });

  const toggleAudio = (callId) => {
    if (playingAudioId === callId) {
      setPlayingAudioId(null);
    } else {
      setPlayingAudioId(callId);
    }
  };

  return (
    <div className="space-y-4">
      
      {/* Header & Filter Controls */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Call Logs &amp; Recordings</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Chronological call records across all terminals with audio playback
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search phone, name, company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 w-56"
            />
          </div>

          {/* Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none"
          >
            <option value="ALL">All Call Types</option>
            <option value="INCOMING">Incoming</option>
            <option value="OUTGOING">Outgoing</option>
            <option value="MISSED">Missed</option>
          </select>

          {/* Disposition Filter */}
          <select
            value={filterDisposition}
            onChange={(e) => setFilterDisposition(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none"
          >
            <option value="ALL">All Dispositions</option>
            <option value="INTERESTED">Interested</option>
            <option value="CALLBACK_REQUESTED">Callback Requested</option>
            <option value="SALE_CLOSED">Sale Closed</option>
            <option value="NOT_INTERESTED">Not Interested</option>
            <option value="BUSY">Busy</option>
          </select>
        </div>
      </div>

      {/* Call Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-3 px-4">Caller / Customer</th>
                <th className="py-3 px-4">Type &amp; Status</th>
                <th className="py-3 px-4">Device &amp; Telecaller</th>
                <th className="py-3 px-4">Date &amp; Duration</th>
                <th className="py-3 px-4">Disposition &amp; Notes</th>
                <th className="py-3 px-4 text-center">Audio Recording</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {filteredCalls.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-400">
                    No call logs matching your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredCalls.map((call) => (
                  <tr key={call.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition">
                    
                    {/* Customer */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">{call.customer_number}</div>
                      <div className="text-slate-600 dark:text-slate-300 font-medium">
                        {call.customer_name || 'Unregistered Lead'}
                        {call.company_name ? ` (${call.company_name})` : ''}
                      </div>
                    </td>

                    {/* Type & Status */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        {call.call_type === 'INCOMING' ? (
                          <span className="p-1 rounded-md bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300">
                            <PhoneIncoming className="w-3.5 h-3.5" />
                          </span>
                        ) : call.call_type === 'OUTGOING' ? (
                          <span className="p-1 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                            <PhoneOutgoing className="w-3.5 h-3.5" />
                          </span>
                        ) : (
                          <span className="p-1 rounded-md bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
                            <PhoneMissed className="w-3.5 h-3.5" />
                          </span>
                        )}
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {call.call_type}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400">{call.call_status}</span>
                    </td>

                    {/* Device & Agent */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                        <User className="w-3 h-3 text-brand-600" />
                        <span>{call.agent_name || 'Agent'}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Smartphone className="w-3 h-3" />
                        <span>{call.device_name || 'Terminal Phone'}</span>
                      </div>
                    </td>

                    {/* Date & Duration */}
                    <td className="py-3 px-4">
                      <div className="text-slate-700 dark:text-slate-300 font-medium">{call.start_time}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{call.duration_seconds ? `${Math.floor(call.duration_seconds / 60)}m ${call.duration_seconds % 60}s` : '0s'}</span>
                      </div>
                    </td>

                    {/* Disposition & Notes */}
                    <td className="py-3 px-4 max-w-xs">
                      {call.disposition ? (
                        <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mb-1 ${
                          call.disposition === 'INTERESTED' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                          call.disposition === 'CALLBACK_REQUESTED' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' :
                          call.disposition === 'SALE_CLOSED' ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300' :
                          'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                        }`}>
                          {call.disposition}
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">No disposition recorded</span>
                      )}
                      {call.disposition_notes && (
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 truncate">
                          "{call.disposition_notes}"
                        </p>
                      )}
                    </td>

                    {/* Recording Audio Player */}
                    <td className="py-3 px-4 text-center">
                      {call.recording_file_path ? (
                        <div className="flex flex-col items-center gap-1">
                          <button
                            onClick={() => toggleAudio(call.id)}
                            className="p-2 rounded-full bg-brand-50 hover:bg-brand-100 dark:bg-brand-950/60 dark:hover:bg-brand-900/60 text-brand-600 dark:text-brand-400 transition"
                            title="Play Call Recording"
                          >
                            {playingAudioId === call.id ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                          </button>
                          <span className="text-[10px] text-slate-400">
                            {call.recording_duration ? `${call.recording_duration}s` : 'Audio'}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400">No Audio</span>
                      )}
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

