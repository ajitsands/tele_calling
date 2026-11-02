import React from 'react';
import { Users, UserCheck, X, Shield, Smartphone } from 'lucide-react';

export default function UserSwitcherModal({ 
  isOpen, 
  onClose, 
  users, 
  currentUser, 
  onSelectUser 
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-800 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            <h3 className="font-bold text-base">Switch Telecaller Login</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/20 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Switch between different telecaller profiles to test multi-user shift handovers, call routing, and concurrent terminal management.
          </p>

          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {users.map((u) => {
              const isSelected = u.id === currentUser?.id;
              return (
                <div
                  key={u.id}
                  onClick={() => {
                    onSelectUser(u);
                    onClose();
                  }}
                  className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                    isSelected 
                      ? 'border-brand-600 bg-brand-50/60 dark:bg-brand-950/30' 
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-brand-600 text-white font-bold text-xs flex items-center justify-center">
                      {u.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900 dark:text-white">
                        <span>{u.name}</span>
                        {isSelected && <span className="text-[10px] text-brand-600">(Active)</span>}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-2">
                        <span>{u.role}</span>
                        {u.device_name && (
                          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                            • <Smartphone className="w-3 h-3" /> {u.device_name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {isSelected && <UserCheck className="w-4 h-4 text-brand-600" />}
                </div>
              );
            })}
          </div>

        </div>

      </div>
    </div>
  );
}

