import React, { useState, useEffect, useRef } from 'react';
import HorizontalNavbar from './components/HorizontalNavbar';
import CallingPopupModal from './components/CallingPopupModal';
import LiveDesk from './components/LiveDesk';
import CallLogsView from './components/CallLogsView';
import CustomerDirectory from './components/CustomerDirectory';
import DeviceShiftManager from './components/DeviceShiftManager';
import AnalyticsView from './components/AnalyticsView';
import CallSimulatorModal from './components/CallSimulatorModal';
import ShiftAssignmentModal from './components/ShiftAssignmentModal';
import UserSwitcherModal from './components/UserSwitcherModal';
import RegisterDeviceModal from './components/RegisterDeviceModal';

export default function App() {
  // Theme & Sound state
  const [theme, setTheme] = useState(() => localStorage.getItem('tele_theme') || 'light');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Active User & Shift mapping
  const [currentUser, setCurrentUser] = useState({
    id: 2,
    name: 'Priya Sharma',
    email: 'priya@telecalling.lan',
    role: 'TELECALLER'
  });

  const [activeShift, setActiveShift] = useState({
    id: 1,
    device_id: 1,
    device_name: 'Samsung Galaxy S21 (Terminal-1)',
    sim_number: '+91 98100 11001',
    shift_name: 'Morning Shift (09:00 - 17:00)',
    status: 'ACTIVE'
  });

  // Navigation tab
  const [currentTab, setCurrentTab] = useState('desk');

  // Modals state
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [isUserSwitcherOpen, setIsUserSwitcherOpen] = useState(false);
  const [isRegisterDeviceOpen, setIsRegisterDeviceOpen] = useState(false);

  // Incoming Call Event State (Triggers CallingPopupModal)
  const [activeCallEvent, setActiveCallEvent] = useState(null);

  // Data collections
  const [devices, setDevices] = useState([
    { id: 1, device_uuid: 'dev-samsung-s21-01', device_name: 'Samsung Galaxy S21 (Terminal-1)', sim_number: '+91 98100 11001', android_version: 'Android 14', battery_level: 92, status: 'ONLINE', active_user_id: 2, active_user_name: 'Priya Sharma', shift_name: 'Morning Shift' },
    { id: 2, device_uuid: 'dev-redmi-note12-02', device_name: 'Redmi Note 12 5G (Terminal-2)', sim_number: '+91 98100 22002', android_version: 'Android 13', battery_level: 78, status: 'ONLINE', active_user_id: 3, active_user_name: 'Rahul Verma', shift_name: 'Morning Shift' },
    { id: 3, device_uuid: 'dev-oneplus-nord-03', device_name: 'OnePlus Nord CE 3 (Terminal-3)', sim_number: '+91 98100 33003', android_version: 'Android 14', battery_level: 85, status: 'ONLINE', active_user_id: 4, active_user_name: 'Ananya Patel', shift_name: 'Morning Shift' },
    { id: 4, device_uuid: 'dev-vivo-v29-04', device_name: 'Vivo V29 Pro (Terminal-4)', sim_number: '+91 98100 44004', android_version: 'Android 13', battery_level: 64, status: 'ONLINE', active_user_id: 5, active_user_name: 'Vikram Singh', shift_name: 'Morning Shift' },
    { id: 5, device_uuid: 'dev-realme-11-05', device_name: 'Realme 11 Pro+ (Terminal-5)', sim_number: '+91 98100 55005', android_version: 'Android 12', battery_level: 90, status: 'ONLINE', active_user_id: 6, active_user_name: 'Sneha Roy', shift_name: 'Morning Shift' }
  ]);

  const [users, setUsers] = useState([
    { id: 1, name: 'System Administrator', email: 'admin@telecalling.lan', role: 'ADMIN' },
    { id: 2, name: 'Priya Sharma', email: 'priya@telecalling.lan', role: 'TELECALLER', device_name: 'Samsung Galaxy S21' },
    { id: 3, name: 'Rahul Verma', email: 'rahul@telecalling.lan', role: 'TELECALLER', device_name: 'Redmi Note 12' },
    { id: 4, name: 'Ananya Patel', email: 'ananya@telecalling.lan', role: 'TELECALLER', device_name: 'OnePlus Nord' },
    { id: 5, name: 'Vikram Singh', email: 'vikram@telecalling.lan', role: 'TELECALLER', device_name: 'Vivo V29' },
    { id: 6, name: 'Sneha Roy', email: 'sneha@telecalling.lan', role: 'TELECALLER', device_name: 'Realme 11' },
    { id: 7, name: 'Amit Kumar (Evening Shift)', email: 'amit@telecalling.lan', role: 'TELECALLER' },
  ]);

  const [customers, setCustomers] = useState([
    { id: 1, phone_number: '+919876543210', full_name: 'Rajesh Gupta', company_name: 'Gupta Global Traders', city: 'Mumbai', lead_status: 'QUALIFIED', tags: 'Wholesale, High Value' },
    { id: 2, phone_number: '+919823456789', full_name: 'Sunita Deshmukh', company_name: 'Apex Healthcare Pvt Ltd', city: 'Pune', lead_status: 'PROPOSAL_SENT', tags: 'Pharma, Decision Maker' },
    { id: 3, phone_number: '+919711223344', full_name: 'Manish Agarwal', company_name: 'Agarwal Infrastructure', city: 'Delhi NCR', lead_status: 'CONTACTED', tags: 'B2B, Urgent' },
    { id: 4, phone_number: '+919988776655', full_name: 'Kavita Nair', company_name: 'GreenTech Solutions', city: 'Bengaluru', lead_status: 'CONVERTED', tags: 'Enterprise, Tech' },
    { id: 5, phone_number: '+919845012345', full_name: 'Rohan Mehta', company_name: 'Mehta Textiles', city: 'Surat', lead_status: 'NEW', tags: 'Retail' }
  ]);

  const [calls, setCalls] = useState([
    { id: 1, customer_number: '+919876543210', customer_name: 'Rajesh Gupta', company_name: 'Gupta Global Traders', call_type: 'INCOMING', call_status: 'COMPLETED', agent_name: 'Priya Sharma', device_name: 'Samsung Galaxy S21', start_time: '2026-11-02 14:30', duration_seconds: 240, disposition: 'INTERESTED', disposition_notes: 'Inquired about enterprise pricing. Requested email quote.', recording_file_path: 'storage/recordings/sample_call_1.mp3', recording_duration: 240 },
    { id: 2, customer_number: '+919876543210', customer_name: 'Rajesh Gupta', company_name: 'Gupta Global Traders', call_type: 'OUTGOING', call_status: 'COMPLETED', agent_name: 'Priya Sharma', device_name: 'Samsung Galaxy S21', start_time: '2026-11-01 11:15', duration_seconds: 185, disposition: 'CALLBACK_REQUESTED', disposition_notes: 'Asked to call back today afternoon.', recording_file_path: 'storage/recordings/sample_call_2.mp3', recording_duration: 185 },
    { id: 3, customer_number: '+919823456789', customer_name: 'Sunita Deshmukh', company_name: 'Apex Healthcare', call_type: 'OUTGOING', call_status: 'COMPLETED', agent_name: 'Rahul Verma', device_name: 'Redmi Note 12', start_time: '2026-10-31 16:40', duration_seconds: 410, disposition: 'INTERESTED', disposition_notes: 'Demo provided. Client satisfied.', recording_file_path: 'storage/recordings/sample_call_3.mp3', recording_duration: 410 },
    { id: 4, customer_number: '+919711223344', customer_name: 'Manish Agarwal', company_name: 'Agarwal Infrastructure', call_type: 'INCOMING', call_status: 'MISSED', agent_name: 'Ananya Patel', device_name: 'OnePlus Nord', start_time: '2026-11-02 12:20', duration_seconds: 0, disposition: null, disposition_notes: 'Missed during break' },
  ]);

  const [stats, setStats] = useState({
    total_calls_today: 14,
    answered_today: 11,
    missed_today: 3,
    active_devices: 5
  });

  // Apply Theme CSS Classes
  useEffect(() => {
    localStorage.setItem('tele_theme', theme);
    const root = document.documentElement;
    root.classList.remove('dark', 'theme-blue', 'theme-emerald', 'theme-purple');

    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme.startsWith('theme-')) {
      root.classList.add(theme);
    }
  }, [theme]);

  // Audio Chime Generator using Web Audio API
  const playRingChime = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.6);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.6);
    } catch (e) {
      console.warn('Audio chime blocked or unsupported', e);
    }
  };

  // Real-time Event Receiver (SSE or Simulated Event Dispatcher)
  const triggerCallEvent = (payload) => {
    const isTargetUser = !activeShift || payload.device_id === activeShift.device_id;
    
    // Find customer history
    const cleanNum = payload.caller_number;
    const matchedCustomer = customers.find(c => c.phone_number === cleanNum) || {
      id: 99,
      phone_number: cleanNum,
      full_name: 'New Prospective Client',
      company_name: 'Unknown Company',
      city: 'Local Region',
      lead_status: 'NEW',
      tags: 'Inbound'
    };

    const customerHistory = calls.filter(c => c.customer_number === cleanNum);

    const fullEvent = {
      event: payload.event || 'RINGING',
      call_log_id: Math.floor(Math.random() * 9000) + 1000,
      device_name: devices.find(d => d.id === payload.device_id)?.device_name || 'Terminal-1',
      sim_number: devices.find(d => d.id === payload.device_id)?.sim_number || '+91 98100 11001',
      caller_number: cleanNum,
      customer: matchedCustomer,
      history: customerHistory,
      notes: [
        { agent_name: 'Priya Sharma', note: 'Customer prefers calls in afternoon hours.', created_at: '2 days ago' }
      ]
    };

    if (fullEvent.event === 'RINGING') {
      playRingChime();
    }

    setActiveCallEvent(fullEvent);
  };

  // Handle Save Disposition
  const handleSaveDisposition = (data) => {
    // Add to call logs
    const newLog = {
      id: data.call_id || Date.now(),
      customer_number: activeCallEvent?.caller_number,
      customer_name: activeCallEvent?.customer?.full_name,
      company_name: activeCallEvent?.customer?.company_name,
      call_type: 'INCOMING',
      call_status: 'COMPLETED',
      agent_name: currentUser.name,
      device_name: activeShift?.device_name || 'Terminal Phone',
      start_time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      duration_seconds: 145,
      disposition: data.disposition,
      disposition_notes: data.disposition_notes,
      recording_file_path: 'storage/recordings/sample_call_1.mp3',
      recording_duration: 145
    };

    setCalls(prev => [newLog, ...prev]);
    setStats(prev => ({ ...prev, total_calls_today: prev.total_calls_today + 1, answered_today: prev.answered_today + 1 }));
    setActiveCallEvent(null);
  };

  // Assign Device & Shift
  const handleAssignDevice = (deviceId, forceTakeover = false, shiftName = 'Morning Shift') => {
    const targetDev = devices.find(d => d.id === deviceId);
    if (!targetDev) return;

    // Update devices list
    setDevices(prev => prev.map(d => {
      if (d.id === deviceId) {
        return {
          ...d,
          active_user_id: currentUser.id,
          active_user_name: currentUser.name,
          shift_name: shiftName
        };
      }
      // If user had another device, unmap it
      if (d.active_user_id === currentUser.id) {
        return { ...d, active_user_id: null, active_user_name: null, shift_name: null };
      }
      return d;
    }));

    setActiveShift({
      id: Date.now(),
      device_id: targetDev.id,
      device_name: targetDev.device_name,
      sim_number: targetDev.sim_number,
      shift_name: shiftName,
      status: 'ACTIVE'
    });
  };

  // Release Device
  const handleReleaseDevice = (deviceId) => {
    setDevices(prev => prev.map(d => {
      if (d.id === deviceId) {
        return { ...d, active_user_id: null, active_user_name: null, shift_name: null };
      }
      return d;
    }));
    setActiveShift(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      
      {/* 1. Horizontal Top Navigation Bar */}
      <HorizontalNavbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        user={currentUser}
        activeShift={activeShift}
        theme={theme}
        setTheme={setTheme}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        onOpenSimulator={() => setIsSimulatorOpen(true)}
        onSwitchUser={() => setIsUserSwitcherOpen(true)}
        onOpenShiftModal={() => setIsShiftModalOpen(true)}
      />

      {/* 2. Main Content Area (Full Width Workspace) */}
      <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-5">
        {currentTab === 'desk' && (
          <LiveDesk
            devices={devices}
            stats={stats}
            activeShift={activeShift}
            onSimulateCall={(params) => triggerCallEvent({ device_id: activeShift?.device_id || 1, caller_number: params?.caller_number || '+919876543210', event: 'RINGING' })}
            onOpenShiftModal={() => setIsShiftModalOpen(true)}
            recentCalls={calls.slice(0, 5)}
          />
        )}

        {currentTab === 'calls' && (
          <CallLogsView
            calls={calls}
            onSelectCustomer={(cust) => setCurrentTab('crm')}
          />
        )}

        {currentTab === 'crm' && (
          <CustomerDirectory
            customers={customers}
            onSimulateCall={(params) => triggerCallEvent({ device_id: activeShift?.device_id || 1, caller_number: params.caller_number, event: 'RINGING' })}
          />
        )}

        {currentTab === 'devices' && (
          <DeviceShiftManager
            devices={devices}
            users={users}
            currentUser={currentUser}
            onAssignDevice={(devId, force) => handleAssignDevice(devId, force)}
            onReleaseDevice={handleReleaseDevice}
            onOpenRegisterModal={() => setIsRegisterDeviceOpen(true)}
          />
        )}

        {currentTab === 'analytics' && (
          <AnalyticsView
            stats={stats}
            calls={calls}
            devices={devices}
            users={users}
          />
        )}
      </main>

      {/* 3. Hero Component: Calling Popup Modal with Customer History */}
      {activeCallEvent && (
        <CallingPopupModal
          callEvent={activeCallEvent}
          onClose={() => setActiveCallEvent(null)}
          onSaveDisposition={handleSaveDisposition}
          onSimulateAnswer={() => setActiveCallEvent(prev => ({ ...prev, event: 'ANSWERED' }))}
          onSimulateEnd={() => setActiveCallEvent(prev => ({ ...prev, event: 'ENDED' }))}
        />
      )}

      {/* 4. Telephony Simulator Modal */}
      <CallSimulatorModal
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        devices={devices}
        onTriggerEvent={triggerCallEvent}
      />

      {/* 5. Shift & Device Handover Modal */}
      <ShiftAssignmentModal
        isOpen={isShiftModalOpen}
        onClose={() => setIsShiftModalOpen(false)}
        devices={devices}
        currentUser={currentUser}
        onAssignDevice={handleAssignDevice}
      />

      {/* 6. User Login Switcher Modal */}
      <UserSwitcherModal
        isOpen={isUserSwitcherOpen}
        onClose={() => setIsUserSwitcherOpen(false)}
        users={users}
        currentUser={currentUser}
        onSelectUser={(newUser) => {
          setCurrentUser(newUser);
          // Look up device mapped to this user
          const dev = devices.find(d => d.active_user_id === newUser.id);
          if (dev) {
            setActiveShift({
              id: Date.now(),
              device_id: dev.id,
              device_name: dev.device_name,
              sim_number: dev.sim_number,
              shift_name: dev.shift_name || 'General Shift',
              status: 'ACTIVE'
            });
          } else {
            setActiveShift(null);
          }
        }}
      />

      {/* 7. Register New Phone Modal */}
      <RegisterDeviceModal
        isOpen={isRegisterDeviceOpen}
        onClose={() => setIsRegisterDeviceOpen(false)}
        onRegisterDevice={(newDev) => {
          const registered = {
            id: devices.length + 1,
            device_uuid: 'dev-' + Math.random().toString(36).substr(2, 9),
            device_name: newDev.device_name,
            sim_number: newDev.sim_number,
            android_version: newDev.android_version,
            battery_level: 95,
            status: 'ONLINE',
            active_user_id: null,
            active_user_name: null,
            shift_name: null
          };
          setDevices(prev => [...prev, registered]);
        }}
      />

    </div>
  );
}

