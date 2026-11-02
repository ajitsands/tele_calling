import React, { useState } from 'react';
import { Smartphone, Plus, X, QrCode, Wifi, CheckCircle2 } from 'lucide-react';

export default function RegisterDeviceModal({ isOpen, onClose, onRegisterDevice }) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState('manual'); // 'manual' or 'app'
  const [deviceName, setDeviceName] = useState('');
  const [simNumber, setSimNumber] = useState('');
  const [androidVersion, setAndroidVersion] = useState('Android 16');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!deviceName || !simNumber) return;

    setIsSubmitting(true);
    onRegisterDevice({
      device_name: deviceName,
      sim_number: simNumber,
      android_version: androidVersion
    });
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-brand-600 to-indigo-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            <h3 className="font-bold text-base">Register Mobile Phone</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/20 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Toggle: Manual Web Form vs Android APK Instructions */}
        <div className="flex border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('manual')}
            className={`flex-1 py-3 text-center border-b-2 transition ${
              activeTab === 'manual' 
                ? 'border-brand-600 text-brand-600 dark:text-brand-400 bg-white dark:bg-slate-800' 
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Instant Web Registration
          </button>
          <button
            onClick={() => setActiveTab('app')}
            className={`flex-1 py-3 text-center border-b-2 transition ${
              activeTab === 'app' 
                ? 'border-brand-600 text-brand-600 dark:text-brand-400 bg-white dark:bg-slate-800' 
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Android APK Wi-Fi Setup
          </button>
        </div>

        {activeTab === 'manual' ? (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Add your smartphone to the system right now. You can assign it to your telecaller login immediately and start tracking calls.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Phone Name / Model *
              </label>
              <input
                type="text"
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
                placeholder="e.g. My Samsung S23 (Terminal-6) or OnePlus 11"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Active SIM Phone Number *
              </label>
              <input
                type="text"
                value={simNumber}
                onChange={(e) => setSimNumber(e.target.value)}
                placeholder="e.g. +91 98765 12345"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Android Version
              </label>
              <div className="flex gap-2">
                <select
                  value={androidVersion}
                  onChange={(e) => setAndroidVersion(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                >
                  <option value="Android 16">Android 16 (Latest)</option>
                  <option value="Android 15">Android 15</option>
                  <option value="Android 14">Android 14</option>
                  <option value="Android 13">Android 13</option>
                  <option value="Android 12">Android 12</option>
                  <option value="Android 11">Android 11</option>
                  <option value="Android 10">Android 10</option>
                  <option value="Android 9">Android 9</option>
                  <option value="Custom">Custom Version...</option>
                </select>

                {androidVersion === 'Custom' && (
                  <input
                    type="text"
                    placeholder="e.g. Android 16.1"
                    onChange={(e) => setAndroidVersion(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    autoFocus
                  />
                )}
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                <span>Register Phone to System</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="p-6 space-y-4 text-xs text-slate-600 dark:text-slate-300">
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <Wifi className="w-4 h-4 text-emerald-600" />
                Same Wi-Fi Network Connection
              </p>
              <p className="text-[11px]">
                Your Android smartphone and this computer must be connected to the same Wi-Fi router.
              </p>
            </div>

            <ol className="list-decimal pl-4 space-y-2 text-slate-700 dark:text-slate-200">
              <li>
                Open the <strong><code>android/</code></strong> project folder in <strong>Android Studio</strong>.
              </li>
              <li>
                Click <strong>Build &gt; Build Bundle(s) / APK(s) &gt; Build APK(s)</strong> (or connect your phone via USB and click Run).
              </li>
              <li>
                Install the APK on your phone and open <strong>TeleCalling Gateway</strong>.
              </li>
              <li>
                Enter your PC's IP address (e.g. <code>http://192.168.1.xxx:8000</code>) and tap <strong>"Connect &amp; Start Service"</strong>.
              </li>
              <li>
                Your smartphone will automatically register with its hardware ID and SIM number!
              </li>
            </ol>
          </div>
        )}

      </div>
    </div>
  );
}

