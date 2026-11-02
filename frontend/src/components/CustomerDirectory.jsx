import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Phone, 
  Building, 
  MapPin, 
  History, 
  Clock, 
  User, 
  Plus, 
  ArrowRight,
  FileText
} from 'lucide-react';

export default function CustomerDirectory({ customers, onSelectCustomer, onSimulateCall }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const filtered = customers.filter(c => 
    (c.phone_number || '').includes(searchTerm) ||
    (c.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.company_name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* Customer List (6 Cols) */}
      <div className="lg:col-span-6 space-y-4">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Customer Database &amp; Leads</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Total {customers.length} registered profiles</p>
          </div>
          
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 w-48"
            />
          </div>
        </div>

        <div className="space-y-2.5">
          {filtered.map(cust => (
            <div
              key={cust.id}
              onClick={() => setSelectedCustomer(cust)}
              className={`p-4 rounded-xl border cursor-pointer transition ${
                selectedCustomer?.id === cust.id 
                  ? 'border-brand-600 bg-brand-50/50 dark:bg-brand-950/20' 
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">{cust.full_name || 'Unregistered'}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      cust.lead_status === 'QUALIFIED' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                      cust.lead_status === 'PROPOSAL_SENT' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' :
                      cust.lead_status === 'CONVERTED' ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300' :
                      'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                    }`}>
                      {cust.lead_status || 'NEW'}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-3">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{cust.phone_number}</span>
                    {cust.company_name && <span>• {cust.company_name}</span>}
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSimulateCall({ caller_number: cust.phone_number });
                  }}
                  className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-semibold transition flex items-center gap-1 shadow-xs"
                  title="Simulate Call from this Customer"
                >
                  <Phone className="w-3 h-3" />
                  <span>Call</span>
                </button>
              </div>

              {cust.tags && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {cust.tags.split(',').map((t, idx) => (
                    <span key={idx} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium">
                      {t.trim()}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Selected Customer Timeline & Complete History (6 Cols) */}
      <div className="lg:col-span-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-xs flex flex-col">
        {selectedCustomer ? (
          <div className="space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{selectedCustomer.full_name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{selectedCustomer.phone_number} • {selectedCustomer.company_name || 'No Company'}</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                {selectedCustomer.lead_status}
              </span>
            </div>

            <div className="text-xs space-y-1 text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
              <p><strong>Email:</strong> {selectedCustomer.email || 'N/A'}</p>
              <p><strong>City:</strong> {selectedCustomer.city || 'N/A'}</p>
              <p><strong>Alternate Phone:</strong> {selectedCustomer.alternate_phone || 'None'}</p>
            </div>

            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <FileText className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Shared Interaction History
                </h4>
              </div>
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 text-xs text-slate-600 dark:text-slate-300">
                <p>When this customer calls any assigned telecaller in any shift, their complete call log and historical remarks will immediately popup on the telecaller's screen.</p>
              </div>
            </div>

            <button
              onClick={() => onSimulateCall({ caller_number: selectedCustomer.phone_number })}
              className="w-full py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition"
            >
              <Phone className="w-4 h-4" />
              <span>Simulate Inbound Call from {selectedCustomer.full_name}</span>
            </button>
          </div>
        ) : (
          <div className="m-auto text-center py-16 text-slate-400">
            <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm font-semibold">Select a Customer</p>
            <p className="text-xs mt-1">Click any customer on the left to inspect past call notes and timeline.</p>
          </div>
        )}
      </div>

    </div>
  );
}

