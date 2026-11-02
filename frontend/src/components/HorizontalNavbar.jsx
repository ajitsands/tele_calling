import React, { useState } from 'react';
import { 
  PhoneCall, 
  Smartphone, 
  Users, 
  History, 
  BarChart3, 
  Volume2, 
  VolumeX, 
  Sun, 
  Moon, 
  Palette, 
  LogOut, 
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
    { id: 'desk', label: 'Live Desk', icon: Radio },
    { id: 'calls', label: 'Call Logs & Audio', icon: History },
    { id: 'crm', label: 'Customer Directory', icon: Users },
    { id: 'devices', label: 'Devices & Shifts', icon: Smartphone },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  const themes = [
    { id: 'light', label: 'Crisp Light (Default)', color: 'bg-white border-slate-300' },
    { id: 'dark', label: 'Midnight Dark', color: 'bg-slate-900 border-slate-700' },
    { id: 'theme-blue', label: 'Royal Blue', color: 'bg-sky-600 border-sky-700' },
    { id: 'theme-emerald', label: 'Emerald Mint', color: 'bg-emerald-600 border-emerald-700' },
    { id: 'theme-purple', label: 'Executive Violet', color: 'bg-purple-600 border-purple-700' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800 transition-colors shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                TeleFlow<span className="text-brand-600 dark:text-brand-500">Pro</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                LAN Telephony
              </span>
            </div>
          </div>

          {/* Active Mapped Phone & Shift Status Pill */}
          <div 
            onClick={onOpenShiftModal}
            className="hidden md:flex items-center gap-2.5 px-3 py-1.5 rounded-full border border-emerald-200 dark:border-emerald-900 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs font-medium cursor-pointer hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-all shadow-xs"
            title="Click to change or manage assigned terminal phone"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <Smartphone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            {activeShift ? (
              <span>
                <strong>{activeShift.device_name}</strong> ({activeShift.sim_number}) • <span className="opacity-80">{activeShift.shift_name}</span>
              </span>
            ) : (
              <span className="text-amber-700 dark:text-amber-400 font-medium">
                ⚠️ No Phone Mapped • Click to Assign Device
              </span>
            )}
            <RefreshCw className="w-3 h-3 ml-1 opacity-70" />
          </div>

          {/* Horizontal Navigation Menu */}
          <nav className="flex items-center space-x-1 overflow-x-auto py-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all shrink-0 ${
                    isActive 
                      ? 'bg-brand-600 text-white shadow-sm' 
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Tools */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Call Simulator Trigger Button */}
            <button
              onClick={onOpenSimulator}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-500 hover:bg-amber-600 text-white shadow-sm transition"
              title="Test Incoming Call Pop-up instantly"
            >
              <PlayCircle className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Simulate Call</span>
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
                title="Change UI Theme & Colors"
              >
                <Palette className="w-4 h-4" />
              </button>

              {showThemeMenu && (
                <div 
                  className="absolute right-0 mt-2 w-56 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl py-2 z-50 text-xs"
                  onMouseLeave={() => setShowThemeMenu(false)}
                >
                  <div className="px-3 py-1 font-semibold text-slate-400 uppercase tracking-wider text-[10px]">
                    Select Workspace Theme
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

            {/* User Profile & Switcher */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-full border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <div className="w-7 h-7 rounded-full bg-brand-600 text-white font-bold text-xs flex items-center justify-center">
                  {user ? user.name.charAt(0) : 'U'}
                </div>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 hidden sm:inline">
                  {user ? user.name.split(' ')[0] : 'User'}
                </span>
              </button>

              {showUserMenu && (
                <div 
                  className="absolute right-0 mt-2 w-56 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl py-2 z-50 text-xs"
                  onMouseLeave={() => setShowUserMenu(false)}
                >
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-700">
                    <p className="font-semibold text-slate-900 dark:text-white">{user?.name}</p>
                    <p className="text-slate-500 dark:text-slate-400 text-[11px] truncate">{user?.email}</p>
                    <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] bg-brand-100 text-brand-700 dark:bg-brand-900/50 dark:text-brand-300">
                      {user?.role}
                    </span>
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
    </header>
  );
}

