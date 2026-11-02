import React from 'react';
import { HelpCircle, ShieldCheck, ExternalLink, Cpu } from 'lucide-react';

export default function Footer({ onOpenHelpModal }) {
  return (
    <footer className="w-full bg-white/95 dark:bg-slate-900/95 border-t border-slate-200 dark:border-slate-800 py-3.5 px-4 sm:px-6 lg:px-8 transition-colors select-none mt-auto">
      <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        
        {/* Left: System Status */}
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-semibold text-slate-700 dark:text-slate-300">TeleFlow Pro</span>
          <span>•</span>
          <span className="text-[11px]">LAN Gateway Active</span>
        </div>

        {/* Center: Branding Request */}
        <div className="text-center">
          <p className="text-slate-600 dark:text-slate-400 font-medium">
            Powered and Engineered by{' '}
            <strong className="text-brand-600 dark:text-brand-400 font-bold tracking-tight">
              SaNDS Lab Middle East W.L.L
            </strong>
          </p>
        </div>

        {/* Right: Help & Procedures Guide Trigger */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenHelpModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-brand-200 dark:border-brand-800 bg-brand-50 hover:bg-brand-100 dark:bg-brand-950/60 dark:hover:bg-brand-900/60 text-brand-700 dark:text-brand-300 font-semibold text-xs transition shadow-2xs group"
            title="Open Call Recording & Procedures Guide"
          >
            <HelpCircle className="w-4 h-4 text-brand-600 dark:text-brand-400 group-hover:rotate-12 transition-transform" />
            <span>Help &amp; Recording Guide</span>
          </button>
        </div>

      </div>
    </footer>
  );
}
