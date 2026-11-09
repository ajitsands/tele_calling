import React, { useState, useRef, useEffect } from 'react';
import { 
  PhoneIncoming, 
  PhoneOutgoing, 
  PhoneMissed, 
  Search, 
  Play, 
  Pause, 
  Filter, 
  Volume2, 
  VolumeX,
  Calendar, 
  User, 
  Smartphone, 
  CheckCircle, 
  Clock,
  Download,
  X,
  Music,
  AlertCircle
} from 'lucide-react';

export default function CallLogsView({ calls, onSelectCustomer }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [filterDisposition, setFilterDisposition] = useState('ALL');

  // Real Audio Player State
  const audioRef = useRef(null);
  const [activeAudioCall, setActiveAudioCall] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1.0);
  const [isMuted, setIsMuted] = useState(false);
  const [audioError, setAudioError] = useState(null);

  const filteredCalls = calls.filter((call) => {
    const matchesSearch = 
      (call.customer_number || '').includes(searchTerm) ||
      (call.customer_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (call.company_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'ALL' || call.call_type === filterType;
    const matchesDisp = filterDisposition === 'ALL' || call.disposition === filterDisposition;

    return matchesSearch && matchesType && matchesDisp;
  });

  const getAudioUrl = (call) => {
    if (!call) return '';
    if (call.recording_id) {
      return `/api/recordings/${call.recording_id}/stream`;
    }
    if (call.recording_file_path) {
      return `/api/recordings/stream-file?path=${encodeURIComponent(call.recording_file_path)}`;
    }
    return `/api/recordings/call/${call.id}/stream`;
  };

  const handleTogglePlay = (call) => {
    setAudioError(null);
    if (activeAudioCall?.id === call.id) {
      if (isPlaying) {
        audioRef.current?.pause();
        setIsPlaying(false);
      } else {
        audioRef.current?.play().then(() => setIsPlaying(true)).catch((err) => {
          setAudioError('Failed to resume audio: ' + err.message);
        });
      }
    } else {
      setActiveAudioCall(call);
      setCurrentTime(0);
      const url = getAudioUrl(call);
      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.load();
        audioRef.current.play()
          .then(() => setIsPlaying(true))
          .catch((err) => {
            console.warn('Playback error', err);
            setAudioError('Audio is loading or being uploaded from mobile phone...');
          });
      }
    }
  };

  const handleSeek = (e) => {
    const seekTime = parseFloat(e.target.value);
    setCurrentTime(seekTime);
    if (audioRef.current) {
      audioRef.current.currentTime = seekTime;
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (audioRef.current) {
      audioRef.current.volume = val;
      audioRef.current.muted = val === 0;
      setIsMuted(val === 0);
    }
  };

  const formatTime = (secs) => {
    if (isNaN(secs) || secs < 0) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      
      {/* Hidden Native Audio Element */}
      <audio
        ref={audioRef}
        onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
        onEnded={() => {
          setIsPlaying(false);
          setCurrentTime(0);
        }}
        onError={() => setAudioError('Audio stream unavailable or still syncing from mobile.')}
      />

      {/* Header & Filter Controls */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Call Logs &amp; Audio Recordings</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300 font-semibold">
              {filteredCalls.length} Records
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Recorded call history with server-side playback, real-time audio streaming &amp; customer profiles
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
            <option value="REJECTED">Rejected</option>
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
            <option value="PROPOSAL_SENT">Proposal Sent</option>
            <option value="SALE_CLOSED">Sale Closed</option>
            <option value="NOT_INTERESTED">Not Interested</option>
            <option value="BUSY">Busy</option>
          </select>
        </div>
      </div>

      {/* Call Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xs relative">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-3 px-4">Customer / Caller</th>
                <th className="py-3 px-4">Type &amp; Status</th>
                <th className="py-3 px-4">Telecaller / Terminal</th>
                <th className="py-3 px-4">Call Time &amp; Duration</th>
                <th className="py-3 px-4">Outcome &amp; Notes</th>
                <th className="py-3 px-4 text-center">Audio Player</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {filteredCalls.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-400 text-xs">
                    No call logs match the selected filter criteria.
                  </td>
                </tr>
              ) : (
                filteredCalls.map((call) => {
                  const isCurrentAudio = activeAudioCall?.id === call.id;
                  const isAudioActive = isCurrentAudio && isPlaying;
                  const hasRecording = !!(call.recording_file_path || call.recording_id || call.duration_seconds > 0);

                  return (
                    <tr 
                      key={call.id} 
                      className={`hover:bg-slate-50/70 dark:hover:bg-slate-700/30 transition ${
                        isCurrentAudio ? 'bg-brand-50/40 dark:bg-brand-950/20' : ''
                      }`}
                    >
                      {/* Customer Info */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 dark:text-white text-xs">
                          {call.customer_name || 'Caller'}
                        </div>
                        <div className="text-[11px] text-brand-600 dark:text-brand-400 font-mono">
                          {call.customer_number}
                        </div>
                        {call.company_name && (
                          <div className="text-[10px] text-slate-400">
                            {call.company_name}
                          </div>
                        )}
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
                        <span className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
                          call.call_status === 'COMPLETED' ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50' :
                          call.call_status === 'REJECTED' ? 'text-rose-600 bg-rose-50 dark:bg-rose-950/50' :
                          call.call_status === 'MISSED' ? 'text-amber-600 bg-amber-50 dark:bg-amber-950/50' :
                          'text-slate-400'
                        }`}>
                          {call.call_status}
                        </span>
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
                            call.disposition === 'NOT_INTERESTED' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' :
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

                      {/* Audio Player Button */}
                      <td className="py-3 px-4 text-center">
                        {hasRecording ? (
                          <div className="flex flex-col items-center gap-1">
                            <button
                              onClick={() => handleTogglePlay(call)}
                              className={`p-2 rounded-full transition shadow-xs flex items-center justify-center ${
                                isAudioActive
                                  ? 'bg-rose-600 text-white animate-pulse'
                                  : 'bg-brand-50 hover:bg-brand-100 dark:bg-brand-950/60 dark:hover:bg-brand-900/60 text-brand-600 dark:text-brand-400'
                              }`}
                              title={isAudioActive ? 'Pause Audio' : 'Play Voice Recording'}
                            >
                              {isAudioActive ? (
                                <Pause className="w-4 h-4" />
                              ) : (
                                <Play className="w-4 h-4 ml-0.5" />
                              )}
                            </button>
                            <span className="text-[10px] font-mono text-slate-400">
                              {call.recording_duration ? `${call.recording_duration}s` : 'Audio'}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400">No Audio</span>
                        )}
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Real-time Floating Bottom Audio Player Bar */}
        {activeAudioCall && (
          <div className="sticky bottom-0 left-0 right-0 p-3 bg-slate-900/95 backdrop-blur text-white border-t border-slate-700 flex flex-col md:flex-row items-center justify-between gap-3 shadow-2xl z-20">
            {/* Call / Customer Track Info */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="w-9 h-9 rounded-full bg-brand-600 flex items-center justify-center text-white shrink-0 shadow-sm">
                <Music className="w-4 h-4" />
              </div>
              <div className="truncate">
                <div className="text-xs font-bold truncate">
                  {activeAudioCall.customer_name || 'Caller'} ({activeAudioCall.customer_number})
                </div>
                <div className="text-[10px] text-slate-400 flex items-center gap-2">
                  <span>Agent: {activeAudioCall.agent_name || 'Telecaller'}</span>
                  <span>•</span>
                  <span>{activeAudioCall.start_time}</span>
                </div>
              </div>
            </div>

            {/* Main Playback Scrub Bar & Controls */}
            <div className="flex-1 w-full max-w-xl flex items-center gap-3">
              <button
                onClick={() => handleTogglePlay(activeAudioCall)}
                className="p-2 rounded-full bg-brand-500 hover:bg-brand-600 text-white transition shadow-sm shrink-0"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
              </button>

              <span className="text-[11px] font-mono text-slate-300 shrink-0 w-10 text-right">
                {formatTime(currentTime)}
              </span>

              {/* Progress Slider */}
              <input
                type="range"
                min="0"
                max={duration > 0 ? duration : (activeAudioCall.recording_duration || 60)}
                step="0.1"
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-500"
              />

              <span className="text-[11px] font-mono text-slate-400 shrink-0 w-10">
                {formatTime(duration > 0 ? duration : (activeAudioCall.recording_duration || 60))}
              </span>
            </div>

            {/* Volume & Action Controls */}
            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
              <div className="flex items-center gap-1.5">
                <button 
                  onClick={toggleMute} 
                  className="p-1 rounded text-slate-400 hover:text-white"
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-16 h-1 bg-slate-700 rounded appearance-none cursor-pointer accent-brand-500"
                />
              </div>

              {/* Download Audio File */}
              <a
                href={getAudioUrl(activeAudioCall)}
                download={`Recording_${activeAudioCall.customer_number}.mp3`}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition flex items-center gap-1 text-[11px] px-2.5"
                title="Download Audio to Server"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Save</span>
              </a>

              {/* Close Audio Player */}
              <button
                onClick={() => {
                  audioRef.current?.pause();
                  setActiveAudioCall(null);
                  setIsPlaying(false);
                }}
                className="p-1 rounded text-slate-400 hover:text-white"
                title="Close Player"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Audio Error Alert if any */}
        {audioError && (
          <div className="p-2.5 bg-amber-500/10 border-t border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs flex items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{audioError}</span>
            </div>
            <button onClick={() => setAudioError(null)} className="p-0.5 hover:opacity-80">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

      </div>

    </div>
  );
}
