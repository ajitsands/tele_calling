import React, { useState } from 'react';
import { Users, UserCheck, X, Edit3, Check } from 'lucide-react';

export default function UserSwitcherModal({ 
  isOpen, 
  onClose, 
  users, 
  currentUser, 
  onSelectUser,
  onUpdateUserName 
}) {
  if (!isOpen) return null;

  const [customName, setCustomName] = useState(currentUser?.name || '');
  const [isEditing, setIsEditing] = useState(false);

  const handleSaveName = (e) => {
    e.preventDefault();
    if (!customName.trim()) return;
    onUpdateUserName(customName.trim());
    setIsEditing(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-brand-600 to-indigo-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            <h3 className="font-bold text-base">Telecaller Profile &amp; Login</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/20 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          
          {/* Section 1: Change Caller Name Directly */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Your Active Caller Name</span>
              <button
                type="button"
                onClick={() => setIsEditing(!isEditing)}
                className="text-xs text-brand-600 dark:text-brand-400 font-semibold flex items-center gap-1 hover:underline"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{isEditing ? 'Cancel' : 'Change Name'}</span>
              </button>
            </div>

            {isEditing ? (
              <form onSubmit={handleSaveName} className="flex gap-2 mt-2">
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="Enter your name (e.g. Ajit)"
                  className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  autoFocus
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs transition"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save</span>
                </button>
              </form>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">{currentUser?.name}</h4>
                  <p className="text-[11px] text-slate-500">{currentUser?.email || 'Logged-in Agent'}</p>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                  Current User
                </span>
              </div>
            )}
          </div>

          {/* Section 2: Switch Telecaller Account */}
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Or Switch to Another Telecaller Shift
            </span>
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
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
                      <div className="w-8 h-8 rounded-full bg-brand-600 text-white font-bold text-xs flex items-center justify-center">
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900 dark:text-white">
                          <span>{u.name}</span>
                          {isSelected && <span className="text-[10px] text-brand-600">(Active)</span>}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          <span>{u.role}</span>
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
    </div>
  );
}
