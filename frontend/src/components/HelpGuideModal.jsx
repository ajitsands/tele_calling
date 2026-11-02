import React, { useState } from 'react';
import { 
  HelpCircle, 
  X, 
  Smartphone, 
  HardDrive, 
  Trash2, 
  CheckCircle2, 
  ExternalLink,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

export default function HelpGuideModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const [activeBrand, setActiveBrand] = useState('oppo');

  const brandGuides = {
    oppo: {
      name: 'OPPO & OnePlus',
      badge: 'Your Connected Model',
      steps: [
        'Open the default Phone / Dialer app on your mobile.',
        'Tap the 3 dots ⋮ (Settings) in the top-right corner.',
        'Select Call Recording.',
        'Turn ON 👉 "Automatically record unknown numbers".',
        'Tap "Automatically record these numbers" and turn ON "Always record selected numbers".'
      ]
    },
    samsung: {
      name: 'Samsung Galaxy',
      badge: 'One UI',
      steps: [
        'Open the Phone app on your Samsung Galaxy.',
        'Tap 3 dots ⋮ > Settings.',
        'Select Record calls.',
        'Turn ON 👉 "Auto record calls" (Select "All calls").'
      ]
    },
    xiaomi: {
      name: 'Xiaomi / Redmi / POCO',
      badge: 'MIUI / HyperOS',
      steps: [
        'Open the default Phone / Dialer app.',
        'Tap the Gear icon ⚙️ (Settings).',
        'Select Call recording.',
        'Turn ON 👉 "Record calls automatically" (Select "All numbers").'
      ]
    },
    vivo: {
      name: 'Vivo / iQOO',
      badge: 'Funtouch OS',
      steps: [
        'Go to Settings > Phone > Call settings.',
        'Tap Record settings.',
        'Select 👉 "Record all calls automatically".'
      ]
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-brand-600 via-indigo-600 to-brand-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center text-white">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-tight">Telephony System Procedures Guide</h3>
              <p className="text-xs text-brand-100">Central Server storage &amp; mobile recording setup</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-xl hover:bg-white/20 text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Key Principle Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60">
              <div className="flex items-center gap-2 font-bold text-xs text-blue-900 dark:text-blue-300 mb-1">
                <HardDrive className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>All Recordings Saved on Server</span>
              </div>
              <p className="text-xs text-blue-800/80 dark:text-blue-300/80 leading-relaxed">
                The centralized Server stores all audio files from all 5+ smartphones directly at the specified storage folder:
                <code className="block mt-1 bg-white/80 dark:bg-slate-900/80 px-2 py-0.5 rounded font-mono text-[10px]">
                  backend/storage/recordings/
                </code>
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60">
              <div className="flex items-center gap-2 font-bold text-xs text-emerald-900 dark:text-emerald-300 mb-1">
                <Trash2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Auto-Purge Mobile Phone Storage</span>
              </div>
              <p className="text-xs text-emerald-800/80 dark:text-emerald-300/80 leading-relaxed">
                As soon as the Server confirms receipt of the audio file (HTTP 200), the companion app <strong>automatically deletes the local audio from the mobile</strong> to keep phone memory 100% free!
              </p>
            </div>

          </div>

          {/* Brand-Specific Instructions */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              How to Enable Auto-Recording by Phone Model
            </h4>

            {/* Brand Tabs */}
            <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
              {Object.keys(brandGuides).map((brandKey) => {
                const b = brandGuides[brandKey];
                const isActive = activeBrand === brandKey;
                return (
                  <button
                    key={brandKey}
                    onClick={() => setActiveBrand(brandKey)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 ${
                      isActive 
                        ? 'bg-brand-600 text-white shadow-xs' 
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {b.name}
                  </button>
                );
              })}
            </div>

            {/* Active Brand Step List */}
            <div className="mt-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold text-sm text-slate-900 dark:text-white">
                  {brandGuides[activeBrand].name} Setup Steps
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                  {brandGuides[activeBrand].badge}
                </span>
              </div>

              <ol className="space-y-2 text-xs text-slate-700 dark:text-slate-200">
                {brandGuides[activeBrand].steps.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-brand-100 dark:bg-brand-900 text-brand-700 dark:text-brand-300 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* Quick External Guide Link */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-xs">
            <span className="text-slate-600 dark:text-slate-400">
              Want the standalone documentation to print or share with telecallers?
            </span>
            <a
              href="/recording_guide.html"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 font-semibold border border-slate-200 dark:border-slate-700 hover:bg-brand-50 flex items-center gap-1 transition shadow-2xs"
            >
              <span>Open Full HTML Guide</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

        </div>

        {/* Footer Info */}
        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
          <span>TeleFlow Pro • LAN Telephony Operations</span>
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            Powered by SaNDS Lab Middle East W.L.L
          </span>
        </div>

      </div>
    </div>
  );
}

