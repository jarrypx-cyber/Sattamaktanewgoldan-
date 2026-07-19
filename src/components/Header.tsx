import React, { useState, useEffect } from 'react';
import { Crown, Clock, Calendar, ShieldCheck, Flame, Bell, BellOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import AdminPanel from './AdminPanel';
import { Market, JodiRecord } from '../types';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isAdmin: boolean;
  setIsAdmin: (isAdmin: boolean) => void;
  markets: Market[];
  onUpdateMarkets: (updated: Market[]) => void;
  onAddJodiRecord: (record: JodiRecord) => void;
  onResetData: () => void;
  googleVerification: string;
  onUpdateGoogleVerification: (val: string) => void;
}

export default function Header({
  activeTab,
  setActiveTab,
  isAdmin,
  setIsAdmin,
  markets,
  onUpdateMarkets,
  onAddJodiRecord,
  onResetData,
  googleVerification,
  onUpdateGoogleVerification,
}: HeaderProps) {
  const [time, setTime] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(() => {
    return localStorage.getItem('satta_notifications') === 'enabled';
  });
  const [toast, setToast] = useState<{ id: number; text: string; icon: string } | null>(null);

  // Admin Passcode States
  const [isPasscodeModalOpen, setIsPasscodeModalOpen] = useState<boolean>(false);
  const [passcodeInput, setPasscodeInput] = useState<string>('');
  const [passcodeError, setPasscodeError] = useState<string>('');
  const [showPasscode, setShowPasscode] = useState<boolean>(false);

  const handleAdminClick = () => {
    if (isAdmin) {
      // Toggle modal open to view settings
      setIsPasscodeModalOpen(true);
    } else {
      // Open verification modal
      setPasscodeInput('');
      setPasscodeError('');
      setIsPasscodeModalOpen(true);
    }
  };

  const handleVerifyPasscode = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanInput = passcodeInput.trim();
    
    // Immediate client-side direct bypass for correct passcode
    if (cleanInput === 'jbgr785' || cleanInput === 'jbgr786') {
      setIsAdmin(true);
      localStorage.setItem('satta_admin_logged_in', 'true');
      setIsPasscodeModalOpen(false);
      setPasscodeInput('');
      setPasscodeError('');
      return;
    }

    try {
      const response = await fetch("/api/verify-passcode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode: cleanInput }),
      });
      if (response.ok) {
        setIsAdmin(true);
        localStorage.setItem('satta_admin_logged_in', 'true');
        setIsPasscodeModalOpen(false);
        setPasscodeInput('');
        setPasscodeError('');
      } else {
        const errorData = await response.json();
        setPasscodeError(errorData.error || 'Galat Passcode! Please try again.');
      }
    } catch (err) {
      // Direct frontend fallback for exact correct code in case fetch fails due to server sync status
      if (cleanInput === 'jbgr785' || cleanInput === 'jbgr786') {
        setIsAdmin(true);
        localStorage.setItem('satta_admin_logged_in', 'true');
        setIsPasscodeModalOpen(false);
        setPasscodeInput('');
        setPasscodeError('');
      } else {
        setPasscodeError('Server is currently syncing. Try again in a few seconds!');
      }
    }
  };

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Format Indian Time style or standard HH:MM:SS AM/PM
      setTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }));
      setDate(now.toLocaleDateString('en-US', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' }));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Sync / listen to update events
  useEffect(() => {
    const handleResultUpdate = (e: Event) => {
      if (!notificationsEnabled) return;
      const customEvent = e as CustomEvent;
      const { marketName, openPana, openSingle, closeSingle, closePana, status } = customEvent.detail || {};
      if (!marketName) return;

      let message = `${marketName} is now ${status}. `;
      if (status === 'OPEN') {
        message += `Open result declared: ${openPana}-${openSingle}`;
      } else {
        message += `Result declared: ${openPana}-${openSingle}${closeSingle}-${closePana}`;
      }

      setToast({
        id: Date.now(),
        text: message,
        icon: '📢'
      });

      // Interactive beep sound
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
        gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
        osc.start();
        osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.12); // E5
        osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.24); // A5
        osc.stop(audioCtx.currentTime + 0.4);
      } catch (err) {
        // audio block
      }
    };

    window.addEventListener('satta-result-updated', handleResultUpdate);
    return () => {
      window.removeEventListener('satta-result-updated', handleResultUpdate);
    };
  }, [notificationsEnabled]);

  const toggleNotifications = () => {
    const nextState = !notificationsEnabled;
    setNotificationsEnabled(nextState);
    localStorage.setItem('satta_notifications', nextState ? 'enabled' : 'disabled');

    if (nextState) {
      setToast({
        id: Date.now(),
        text: '🔔 Satta Alerts Active! Live result updates & sound chime are now turned ON.',
        icon: '🔔'
      });
      // Small prompt audio
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.15);
      } catch (err) {}
    } else {
      setToast({
        id: Date.now(),
        text: '🔕 Satta Alerts Disabled. Sound and live alerts are turned OFF.',
        icon: '🔕'
      });
    }
  };

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      setToast(null);
    }, 4500);
    return () => clearTimeout(timer);
  }, [toast]);

  const tabs = [
    { id: 'live', label: '🔴 लाइव रिजल्ट्स', subtitle: 'Live Results' },
    { id: 'chart', label: '📊 पुरानी जोड़ी चार्ट', subtitle: 'Old Jodi Chart' },
  ];

  return (
    <header className="relative w-full px-4 pt-6 pb-2 md:px-8">
      {/* Upper classic maroon/golden stripe */}
      <div className="absolute top-0 left-0 h-[5px] w-full bg-gradient-to-r from-[#800000] via-[#ffd700] to-[#800000] shadow-sm" />

      <div className="mx-auto flex max-w-4xl flex-col items-center gap-5">
        
        {/* DPBOSS / MATKAONE inspired Logo & Brand Block (Cream / Classic Light Dpboss Style) */}
        <div className="w-full bg-[#ffeedb] text-[#800000] p-6 text-center border-4 border-[#800000] rounded-xl shadow-lg flex flex-col items-center justify-center gap-2 hover:border-[#000080] transition-all">
          <div className="text-[#800000] text-4xl md:text-6xl font-black tracking-wider uppercase drop-shadow-sm" style={{ fontFamily: 'Georgia, serif', textShadow: '1px 1px 2px rgba(0,0,0,0.1)' }}>
            MATKAONE
          </div>
          <div className="text-[#000080] text-lg md:text-2xl font-black tracking-wide uppercase font-sans">
            KALYAN RESULT | NEW GOLDEN DAY
          </div>
          <div className="text-[#800000] text-sm md:text-lg font-black tracking-widest uppercase">
            👑 Golden Sagar Matka Results 👑
          </div>
          <div className="text-green-800 text-xs md:text-sm font-extrabold tracking-widest uppercase bg-green-50 px-3 py-1 rounded border border-green-600/40">
            FASTEST LIVE UPDATE • 100% SECONDS-LEVEL SYNC
          </div>
          <div className="bg-red-600 text-white text-xs md:text-sm font-black uppercase px-4 py-1.5 rounded-md border-2 border-[#800000] shadow-md animate-pulse mt-1">
            🔥 SATTAMATKA AUTOMATIC LIVE SYSTEM BOARD 🔥
          </div>
          <div className="text-[#000080] text-xs md:text-sm font-black uppercase mt-1 flex items-center gap-2 flex-wrap justify-center">
            <span className="flex items-center gap-1.5 text-[#800000]">
              <span className="h-2 w-2 rounded-full bg-green-600 animate-ping"></span>
              👤 Helpline Operator :
            </span>
            <span className="text-[#000080] font-mono bg-white px-3 py-1 rounded border border-[#000080]/30 select-all tracking-wider font-black">8516974201</span>
          </div>
        </div>

        {/* Live Clock, Calendar & Toggles bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 w-full bg-[#ffeedb] border-2 border-[#800000] rounded-xl p-3.5 shadow-md text-[#800000]">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-[#000080] animate-spin-slow" />
            <span className="text-xs font-black tracking-wider font-mono text-[#000080] uppercase">{time}</span>
          </div>
          
          <div className="flex items-center gap-2.5">
            {/* Simulated Push Notification Toggle */}
            <button
              onClick={toggleNotifications}
              className={`flex items-center gap-1.5 rounded border-2 px-3 py-1 text-xs font-black transition-all duration-300 ${
                notificationsEnabled
                  ? 'border-red-600 bg-red-50 text-red-700 hover:bg-red-100'
                  : 'border-neutral-300 bg-neutral-50 text-neutral-600 hover:bg-neutral-100'
              }`}
              title={notificationsEnabled ? "Notifications enabled" : "Turn on result notifications"}
            >
              {notificationsEnabled ? (
                <>
                  <Bell className="h-3.5 w-3.5 text-red-600 animate-bounce" />
                  <span className="tracking-wide">NOTIFY: ON</span>
                </>
              ) : (
                <>
                  <BellOff className="h-3.5 w-3.5 text-neutral-500" />
                  <span className="tracking-wide">NOTIFY: OFF</span>
                </>
              )}
            </button>
            
            <button
              onClick={handleAdminClick}
              className={`flex items-center gap-1.5 rounded border-2 px-3 py-1 text-xs font-bold transition-all ${
                isAdmin
                  ? 'border-red-600 bg-red-50 text-red-700 font-black'
                  : 'border-[#000080] bg-white text-[#000080] hover:bg-[#ffeedb]'
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5 text-red-600" />
              {isAdmin ? 'ADMIN ACTIVE' : 'ADMIN PANEL'}
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="mx-auto mt-5 max-w-4xl">
        <div className="grid grid-cols-2 gap-2 rounded-xl bg-[#ffeedb] p-1.5 border-2 border-[#800000] shadow-md">
          {tabs.map((tab) => {
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`group relative flex flex-col items-center justify-center rounded-lg py-2.5 transition-all duration-300 ${
                  isSelected
                    ? 'bg-[#800000] text-white shadow-md font-black border border-[#800000]'
                    : 'bg-white text-[#800000] hover:bg-white/85 border border-transparent font-extrabold shadow-sm'
                }`}
              >
                <span className="text-xs font-black tracking-wider">{tab.label}</span>
                <span
                  className={`text-[9px] uppercase tracking-widest ${
                    isSelected ? 'text-yellow-300 font-black' : 'text-neutral-500'
                  }`}
                >
                  {tab.subtitle}
                </span>
                {isSelected && (
                  <span className="absolute -bottom-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rotate-45 bg-[#800000]" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Marquee Ticker */}
      <div className="mt-4 overflow-hidden rounded-lg bg-white py-2.5 border-2 border-[#800000] shadow-sm">
        <div className="animate-marquee whitespace-nowrap text-center text-xs font-black uppercase tracking-wider text-[#800000]">
          <span className="inline-block px-4">⚡ Matkaone.com Par Aapka Swagat Hai! ⚡</span>
          <span className="inline-block px-4 text-[#000080]">•</span>
          <span className="inline-block px-4 text-[#000080]">Sabse Tez, Sahi Aur Sateek Live Open Aur Close Results Sirf Yahi Milenge!</span>
          <span className="inline-block px-4 text-[#000080]">•</span>
          <span className="inline-block px-4">Niche Diye Purane Jodi Chart Me Pichle Weeks Ki Sabhi Jodia Upalabdh Hain!</span>
          <span className="inline-block px-4 text-[#000080]">•</span>
          <span className="inline-block px-4">Apna Result Time Par Update Karne Ke Liye Admin Panel Ka Upyog Karen!</span>
        </div>
      </div>
      {/* Custom Floating Toast Alert */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed bottom-6 right-6 z-50 flex max-w-sm items-center gap-3.5 rounded-xl border border-amber-500/30 bg-white p-4 text-sm text-slate-800 shadow-xl shadow-amber-500/10 backdrop-blur-md"
          >
            <span className="text-xl">{toast.icon}</span>
            <div className="flex-1">
              <p className="font-extrabold text-amber-600 text-xs uppercase tracking-wider">Live Result Alert</p>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">{toast.text}</p>
            </div>
            <button
              onClick={() => setToast(null)}
              className="text-slate-400 hover:text-slate-600 text-lg font-bold leading-none px-1"
            >
              &times;
            </button>
          </motion.div>
        )}

        {isPasscodeModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className={`relative w-full rounded-2xl border-4 p-6 shadow-2xl transition-all duration-300 ${
                isAdmin 
                  ? 'max-w-4xl max-h-[90vh] overflow-y-auto bg-[#fffdfa] border-[#800000] text-neutral-900' 
                  : 'max-w-md bg-white border-red-600 text-neutral-900'
              }`}
            >
              {isAdmin ? (
                <div className="text-left">
                  <div className="flex items-center justify-between border-b-2 border-neutral-200 pb-4 mb-6">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-3.5 w-3.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-600 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-green-500"></span>
                      </span>
                      <h3 className="text-lg font-black text-[#800000] uppercase tracking-wider">
                        👑 OWNER ADMIN PANEL
                      </h3>
                    </div>
                    <div className="flex gap-2.5">
                      <button
                        onClick={() => {
                          setIsAdmin(false);
                          localStorage.removeItem('satta_admin_logged_in');
                          setIsPasscodeModalOpen(false);
                        }}
                        className="rounded border border-red-500 bg-red-50 px-3.5 py-1.5 text-xs font-black uppercase text-red-600 hover:bg-red-100 active:scale-95 transition"
                      >
                        Log Out
                      </button>
                      <button
                        onClick={() => setIsPasscodeModalOpen(false)}
                        className="rounded border border-neutral-300 bg-neutral-100 px-3.5 py-1.5 text-xs font-black uppercase text-neutral-700 hover:bg-neutral-200 active:scale-95 transition"
                      >
                        Close
                      </button>
                    </div>
                  </div>

                  <AdminPanel
                    markets={markets}
                    onUpdateMarkets={onUpdateMarkets}
                    onAddJodiRecord={onAddJodiRecord}
                    onResetData={onResetData}
                    googleVerification={googleVerification}
                    onUpdateGoogleVerification={onUpdateGoogleVerification}
                  />
                </div>
              ) : (
                <>
                  <div className="text-center">
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 mb-3">
                      <ShieldCheck className="h-6 w-6" />
                    </span>
                    <h3 className="text-xl font-black text-neutral-900 uppercase tracking-tight">
                      🔑 Owner Admin Verification
                    </h3>
                    <p className="mt-1 text-xs text-neutral-500 font-bold leading-relaxed">
                      Apna secret passcode daal kar open-close results aur charts ko manage karein.
                    </p>
                  </div>

                  <form onSubmit={handleVerifyPasscode} className="mt-6 space-y-4">
                    <div>
                      <label className="block text-xs font-black text-neutral-700 uppercase mb-1.5">
                        Enter Secret Passcode:
                      </label>
                      <div className="relative">
                        <input
                          type={showPasscode ? "text" : "password"}
                          required
                          placeholder="Enter passcode..."
                          value={passcodeInput}
                          onChange={(e) => setPasscodeInput(e.target.value)}
                          className="w-full rounded border-2 border-red-600 bg-yellow-50 px-3 py-2.5 pr-10 text-center font-mono text-base font-bold text-neutral-900 shadow-inner outline-none focus:bg-white focus:border-blue-600"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasscode(!showPasscode)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 text-xs font-black uppercase"
                        >
                          {showPasscode ? "Hide" : "Show"}
                        </button>
                      </div>
                    </div>

                    {passcodeError && (
                      <p className="text-center text-xs font-black text-red-600 bg-red-50 py-2 px-3 rounded border border-red-200">
                        ⚠️ {passcodeError}
                      </p>
                    )}

                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setIsPasscodeModalOpen(false);
                          setPasscodeInput('');
                          setPasscodeError('');
                        }}
                        className="flex-1 rounded border-2 border-neutral-300 bg-neutral-100 py-2.5 text-xs font-black uppercase text-neutral-700 hover:bg-neutral-200 active:scale-95 transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 rounded border-2 border-white bg-red-600 py-2.5 text-xs font-black uppercase text-white shadow hover:bg-red-700 active:scale-95 transition-all"
                      >
                        Verify & Unlock
                      </button>
                    </div>
                  </form>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
