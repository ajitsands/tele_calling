import React, { useState } from 'react';
import { 
  PhoneCall, 
  Smartphone, 
  Users, 
  History, 
  BarChart3, 
  Volume2, 
  VolumeX, 
  Palette, 
  Radio, 
  PlayCircle,
  RefreshCw
} from 'lucide-react';

export default function HorizontalNavbar({ 
  currentTab, 
  setCurrentTab, 
  user, 
  activeShift, 
  theme, 
  setTheme, 
  soundEnabled, 
  setSoundEnabled, 
  onOpenSimulator, 
  onSwitchUser, 
  onOpenShiftModal 
}) {
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const navItems = [
    { id: 'desk', label: 'Live Desk', icon: Radio, count: null },
    { id: 'calls', label: 'Call Logs & Audio', icon: History, count: '14' },
    { id: 'crm', label: 'Customer Directory', icon: Users, count: '5' },
    { id: 'devices', label: 'Devices & Shifts', icon: Smartphone, count: '5' },
    { id: 'analytics', label: 'Analytics & Reports', icon: BarChart3, count: null },
  ];

  const themes = [
    { id: 'light', label: 'Crisp Light (Default)', color: 'bg-white border-slate-300' },
    { id: 'dark', label: 'Midnight Dark', color: 'bg-slate-900 border-slate-700' },
    { id: 'theme-blue', label: 'Royal Blue', color: 'bg-sky-600 border-sky-700' },
    { id: 'theme-emerald', label: 'Emerald Mint', color: 'bg-emerald-600 border-emerald-700' },
    { id: 'theme-purple', label: 'Executive Violet', color: 'bg-purple-600 border-purple-700' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white dark:bg-slate-900 shadow-xs border-b border-slate-200 dark:border-slate-800 select-none">
      
      {/* ========================================================
          TIER 1: Primary Header Bar (Full Width)
         ======================================================== */}
      <div className="w-full px-4 sm:px-6 lg:px-8 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center justify-between h-14 gap-4">
          
          {/* Left: Brand + Mapped Phone Pill */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
                <PhoneCall className="w-5 h-5" />
              </div>
              <div className="leading-tight">
                <span className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white">
                  TeleFlow<span className="text-brand-600 dark:text-brand-500">Pro</span>
                </span>
                <span className="hidden sm:inline-block ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                  LAN Gateway
                </span>
              </div>
            </div>

            {/* Active Mapped Phone Pill */}
            <div 
              onClick={onOpenShiftModal}
              className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-900/80 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs font-semibold cursor-pointer hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition shadow-2xs"
              title="Click to change or manage assigned terminal phone"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <Smartphone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              {activeShift ? (
                <span>
                  <strong>{activeShift.device_name}</strong> ({activeShift.sim_number})
                </span>
              ) : (
                <span className="text-amber-700 dark:text-amber-400">
                  ⚠️ No Phone Mapped • Click to Assign
                </span>
              )}
              <RefreshCw className="w-3 h-3 ml-0.5 opacity-60 hover:opacity-100" />
            </div>
          </div>

          {/* Right Tools: Simulator Trigger, Sound, Theme, User */}
          <div className="flex items-center gap-2.5">
            {/* Call Simulator Trigger Button */}
            <button
              onClick={onOpenSimulator}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-amber-500 hover:bg-amber-600 text-white shadow-sm transition"
              title="Simulate Incoming Call Pop-up"
            >
              <PlayCircle className="w-3.5 h-3.5" />
              <span>Simulate Call</span>
            </button>

            {/* Audio Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2 rounded-lg border text-sm transition ${
                soundEnabled 
                  ? 'border-slate-200 dark:border-slate-700 text-brand-600 dark:text-brand-400 hover:bg-slate-100 dark:hover:bg-slate-800' 
                  : 'border-slate-200 dark:border-slate-700 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title={soundEnabled ? 'Call Chime Sound Enabled' : 'Call Chime Sound Muted'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Theme Palette Switcher */}
            <div className="relative">
              <button
                onClick={() => setShowThemeMenu(!showThemeMenu)}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                title="Change UI Theme"
              >
                <Palette className="w-4 h-4" />
              </button>

              {showThemeMenu && (
                <div 
                  className="absolute right-0 mt-2 w-56 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl py-2 z-50 text-xs"
                  onMouseLeave={() => setShowThemeMenu(false)}
                >
                  <div className="px-3 py-1 font-semibold text-slate-400 uppercase tracking-wider text-[10px]">
                    Workspace Theme
                  </div>
                  {themes.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => {
                        setTheme(t.id);
                        setShowThemeMenu(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-700 transition ${
                        theme === t.id ? 'font-bold text-brand-600 dark:text-brand-400' : 'text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-3.5 h-3.5 rounded-full border ${t.color}`}></span>
                        <span>{t.label}</span>
                      </div>
                      {theme === t.id && <span>✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Telecaller Profile Pill */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 pl-1.5 pr-3 py-1 rounded-full border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <div className="w-7 h-7 rounded-full bg-brand-600 text-white font-bold text-xs flex items-center justify-center">
                  {user ? user.name.charAt(0) : 'U'}
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-none">
                    {user ? user.name.split(' ')[0] : 'User'}
                  </p>
                  <span className="text-[10px] text-slate-400 leading-none">{user?.role}</span>
                </div>
              </button>

              {showUserMenu && (
                <div 
                  className="absolute right-0 mt-2 w-56 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl py-2 z-50 text-xs"
                  onMouseLeave={() => setShowUserMenu(false)}
                >
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-700">
                    <p className="font-semibold text-slate-900 dark:text-white">{user?.name}</p>
                    <p className="text-slate-500 dark:text-slate-400 text-[11px] truncate">{user?.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      onSwitchUser();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-left text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                  >
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>Switch Telecaller Profile</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      onOpenShiftModal();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-left text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                  >
                    <Smartphone className="w-3.5 h-3.5 text-slate-400" />
                    <span>Manage Shift Phone</span>
                  </button>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>

      {/* ========================================================
          TIER 2: Horizontal Menu Bar (Bottom of Header, Full Width, Fixed/Not Scrolling)
         ======================================================== */}
      <div className="w-full px-4 sm:px-6 lg:px-8 bg-slate-50/70 dark:bg-slate-900/70">
        <nav className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto py-1.5 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all shrink-0 ${
                  isActive 
                    ? 'bg-brand-600 text-white shadow-xs' 
                    : 'text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white border border-transparent hover:border-slate-200 dark:hover:border-slate-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
                {item.count && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                    isActive 
                      ? 'bg-white/20 text-white' 
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}>
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

    </header>
  );
}
