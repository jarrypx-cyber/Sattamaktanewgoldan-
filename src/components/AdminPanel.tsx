import React, { useState, useEffect } from 'react';
import { ShieldAlert, Save, Plus, RotateCcw, CheckCircle2, Sliders, Calendar } from 'lucide-react';
import { Market, JodiRecord } from '../types';

interface AdminPanelProps {
  markets: Market[];
  onUpdateMarkets: (updated: Market[]) => void;
  onAddJodiRecord: (record: JodiRecord) => void;
  onResetData: () => void;
  googleVerification: string;
  onUpdateGoogleVerification: (val: string) => void;
}

export default function AdminPanel({
  markets,
  onUpdateMarkets,
  onAddJodiRecord,
  onResetData,
  googleVerification,
  onUpdateGoogleVerification,
}: AdminPanelProps) {
  // Market Edit Form State
  const [selectedMarketId, setSelectedMarketId] = useState<string>(markets[0]?.id || '');
  const [status, setStatus] = useState<'OPEN' | 'ACTIVE_CLOSE' | 'CLOSED'>('OPEN');
  const [openPana, setOpenPana] = useState<string>('');
  const [openSingle, setOpenSingle] = useState<string>('');
  const [closeSingle, setCloseSingle] = useState<string>('');
  const [closePana, setClosePana] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');

  // Historical Record Form State
  const [historyDate, setHistoryDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [historyDay, setHistoryDay] = useState<string>('Monday');
  const [historyMarketId, setHistoryMarketId] = useState<string>(markets[0]?.id || '');
  const [historyOpenPana, setHistoryOpenPana] = useState<string>('');
  const [historyJodi, setHistoryJodi] = useState<string>('');
  const [historyClosePana, setHistoryClosePana] = useState<string>('');
  const [historySuccessMsg, setHistorySuccessMsg] = useState<string>('');
  const [historyErrorMsg, setHistoryErrorMsg] = useState<string>('');

  // Passcode Settings States
  const [currentPasscode, setCurrentPasscode] = useState<string>('');
  const [newPasscode, setNewPasscode] = useState<string>('');
  const [confirmPasscode, setConfirmPasscode] = useState<string>('');
  const [passcodeSettingsSuccessMsg, setPasscodeSettingsSuccessMsg] = useState<string>('');
  const [passcodeSettingsErrorMsg, setPasscodeSettingsErrorMsg] = useState<string>('');

  // Google Site Verification States
  const [googleVerifyInput, setGoogleVerifyInput] = useState<string>(googleVerification);
  const [googleVerifySuccessMsg, setGoogleVerifySuccessMsg] = useState<string>('');

  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Auto-calculate single digit from 3-digit pana (sum mod 10)
  const calculateSingleFromPana = (pana: string): string => {
    const clean = pana.trim();
    if (clean.length !== 3 || isNaN(Number(clean))) return '?';
    const sum = clean.split('').map(Number).reduce((a, b) => a + b, 0);
    return (sum % 10).toString();
  };

  // Sync edit form with selected market
  useEffect(() => {
    const target = markets.find((m) => m.id === selectedMarketId);
    if (target) {
      setStatus(target.status);
      setOpenPana(target.openPana === '???' ? '' : target.openPana);
      setOpenSingle(target.openSingle === '?' ? '' : target.openSingle);
      setCloseSingle(target.closeSingle === '?' ? '' : target.closeSingle);
      setClosePana(target.closePana === '???' ? '' : target.closePana);
    }
  }, [selectedMarketId, markets]);

  // Handle auto-calculating singles when admin types panas
  const handleOpenPanaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setOpenPana(val);
    if (val.length === 3) {
      setOpenSingle(calculateSingleFromPana(val));
    }
  };

  const handleClosePanaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setClosePana(val);
    if (val.length === 3) {
      setCloseSingle(calculateSingleFromPana(val));
    }
  };

  // Auto update weekday when historyDate changes
  useEffect(() => {
    if (historyDate) {
      const d = new Date(historyDate);
      if (!isNaN(d.getTime())) {
        setHistoryDay(weekdays[d.getDay()]);
      }
    }
  }, [historyDate]);

  // Save current market updates
  const handleSaveMarket = (e: React.FormEvent) => {
    e.preventDefault();

    const updated = markets.map((m) => {
      if (m.id === selectedMarketId) {
        // format current time for stamp
        const now = new Date();
        const stamp = `Today, ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}`;

        return {
          ...m,
          status,
          openPana: openPana.trim() || '???',
          openSingle: openSingle.trim() || '?',
          closeSingle: closeSingle.trim() || '?',
          closePana: closePana.trim() || '???',
          lastUpdated: stamp,
        };
      }
      return m;
    });

    onUpdateMarkets(updated);
    
    // Dispatch custom event for real-time sound & visual notifications
    const selectedMarket = markets.find((m) => m.id === selectedMarketId);
    if (selectedMarket) {
      const event = new CustomEvent('satta-result-updated', {
        detail: {
          marketName: selectedMarket.name,
          openPana: openPana.trim() || '???',
          openSingle: openSingle.trim() || '?',
          closeSingle: closeSingle.trim() || '?',
          closePana: closePana.trim() || '???',
          status: status,
        }
      });
      window.dispatchEvent(event);
    }

    setSuccessMsg('Market details updated successfully! Live board updated.');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  // Add new history row
  const handleAddHistory = (e: React.FormEvent) => {
    e.preventDefault();

    const targetMarket = markets.find((m) => m.id === historyMarketId);
    if (!targetMarket) return;

    if (!historyOpenPana || historyJodi.length !== 2 || !historyClosePana) {
      setHistoryErrorMsg('Kripya Open Pana, 2-Digit Jodi, aur Close Pana sahi se fill karein!');
      setHistorySuccessMsg('');
      setTimeout(() => setHistoryErrorMsg(''), 4000);
      return;
    }

    const newRecord: JodiRecord = {
      id: `${historyMarketId}-${historyDate}`,
      date: historyDate,
      day: historyDay,
      marketId: historyMarketId,
      marketName: targetMarket.name,
      openPana: historyOpenPana,
      jodi: historyJodi,
      closePana: historyClosePana,
    };

    onAddJodiRecord(newRecord);
    setHistorySuccessMsg('Jodi Record added to old chart!');
    setHistoryErrorMsg('');
    
    // reset history inputs
    setHistoryOpenPana('');
    setHistoryJodi('');
    setHistoryClosePana('');

    setTimeout(() => setHistorySuccessMsg(''), 4000);
  };

  const handleChangePasscode = (e: React.FormEvent) => {
    e.preventDefault();
    const correctPasscode = localStorage.getItem('satta_admin_passcode') || 'jbgr786';
    if (currentPasscode !== correctPasscode) {
      setPasscodeSettingsErrorMsg('Pehle ka (current) passcode galat hai!');
      setPasscodeSettingsSuccessMsg('');
      return;
    }
    if (newPasscode.trim().length < 4) {
      setPasscodeSettingsErrorMsg('Naya passcode kam se kam 4 character ka hona chahiye!');
      setPasscodeSettingsSuccessMsg('');
      return;
    }
    if (newPasscode !== confirmPasscode) {
      setPasscodeSettingsErrorMsg('Naya passcode aur Confirm passcode match nahi kar rahe!');
      setPasscodeSettingsSuccessMsg('');
      return;
    }

    localStorage.setItem('satta_admin_passcode', newPasscode.trim());
    setPasscodeSettingsSuccessMsg('Passcode safaltapoorvak badal diya gaya hai!');
    setPasscodeSettingsErrorMsg('');
    setCurrentPasscode('');
    setNewPasscode('');
    setConfirmPasscode('');
    setTimeout(() => setPasscodeSettingsSuccessMsg(''), 4000);
  };

  const handleSaveGoogleVerification = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateGoogleVerification(googleVerifyInput.trim());
    setGoogleVerifySuccessMsg('Google Site Verification code safaltapoorvak update ho gaya hai!');
    setTimeout(() => setGoogleVerifySuccessMsg(''), 4000);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 md:px-0">
      
      {/* Disclaimer and Warning */}
      <div className="flex items-start gap-3 rounded-xl border-2 border-yellow-500 bg-[#0c142c] p-4 text-white shadow-xl">
        <ShieldAlert className="h-5 w-5 shrink-0 mt-0.5 text-yellow-400 animate-pulse" />
        <div>
          <h3 className="text-sm font-black uppercase tracking-wider text-yellow-400">ADMIN CONTROL CENTER</h3>
          <p className="mt-1 text-xs text-slate-300 leading-relaxed font-semibold">
            Yeh simulation aur administration panel hai. Aap jo bhi updates karenge vo direct results panel aur purani jodi chart par live dikhai denge. Sabhi data local storage me save hota hai.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

        {/* Form 1: Edit Live Open & Close */}
        <div className="rounded-2xl border-2 border-yellow-500 bg-[#0a142c] p-5 shadow-2xl">
          <div className="mb-4 flex items-center gap-2 border-b border-slate-800 pb-3">
            <Sliders className="h-4 w-4 text-[#ffd700]" />
            <h3 className="text-sm font-black uppercase tracking-wider text-[#ffd700]">
              Live Open & Close Update
            </h3>
          </div>

          <form onSubmit={handleSaveMarket} className="space-y-4 text-xs font-semibold">
            {/* Market Selection */}
            <div>
              <label className="block font-black text-slate-300 mb-1.5">Select Market to Edit:</label>
              <select
                value={selectedMarketId}
                onChange={(e) => setSelectedMarketId(e.target.value)}
                className="w-full rounded-lg bg-slate-950 border border-slate-800 text-white font-bold px-3 py-2 cursor-pointer outline-none focus:border-yellow-500 shadow-inner"
              >
                {markets.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.openTime} - {m.closeTime})
                  </option>
                ))}
              </select>
            </div>

            {/* Status Selection */}
            <div>
              <label className="block font-black text-slate-300 mb-1.5">Market Status:</label>
              <div className="grid grid-cols-3 gap-2">
                {(['OPEN', 'ACTIVE_CLOSE', 'CLOSED'] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatus(st)}
                    className={`rounded-lg py-2 border font-black uppercase tracking-wider transition-all shadow-md ${
                      status === st
                        ? 'bg-red-600 border-red-600 text-white shadow-lg shadow-red-950'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-yellow-500'
                    }`}
                  >
                    {st === 'OPEN' ? 'OPENING' : st === 'ACTIVE_CLOSE' ? 'OPEN DECLARED' : 'CLOSED'}
                  </button>
                ))}
              </div>
            </div>

            {/* Pana and Single inputs */}
            <div className="grid grid-cols-2 gap-4">
              {/* Open Group */}
              <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-950/40 p-3">
                <span className="block font-black text-[#ffd700] uppercase text-[10px]">OPEN INPUTS</span>
                <div>
                  <label className="block text-slate-300 mb-1">Open Pana (3-digit):</label>
                  <input
                    type="text"
                    maxLength={3}
                    placeholder="e.g. 139"
                    value={openPana}
                    onChange={handleOpenPanaChange}
                    className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-1.5 font-mono text-white font-bold outline-none shadow-inner focus:border-yellow-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Open Single (Auto-calc):</label>
                  <input
                    type="text"
                    maxLength={1}
                    placeholder="Auto"
                    value={openSingle}
                    onChange={(e) => setOpenSingle(e.target.value)}
                    className="w-full rounded-lg bg-slate-900 border border-slate-800 px-3 py-1.5 font-mono text-[#ffd700] font-black outline-none shadow-inner"
                  />
                </div>
              </div>

              {/* Close Group */}
              <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-950/40 p-3">
                <span className="block font-black text-[#ffd700] uppercase text-[10px]">CLOSE INPUTS</span>
                <div>
                  <label className="block text-slate-300 mb-1">Close Pana (3-digit):</label>
                  <input
                    type="text"
                    maxLength={3}
                    placeholder="e.g. 280"
                    value={closePana}
                    onChange={handleClosePanaChange}
                    className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-1.5 font-mono text-white font-bold outline-none shadow-inner focus:border-yellow-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Close Single (Auto-calc):</label>
                  <input
                    type="text"
                    maxLength={1}
                    placeholder="Auto"
                    value={closeSingle}
                    onChange={(e) => setCloseSingle(e.target.value)}
                    className="w-full rounded-lg bg-slate-900 border border-slate-800 px-3 py-1.5 font-mono text-[#ffd700] font-black outline-none shadow-inner"
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-red-600 hover:bg-red-700 py-2.5 text-xs font-black uppercase tracking-widest text-white shadow-lg transition-all border border-red-500"
            >
              <Save className="h-4 w-4" />
              Save Live Result
            </button>

            {successMsg && (
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold bg-[#0a2322] border border-emerald-950 rounded-lg p-2.5 shadow-md">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                <span>{successMsg}</span>
              </div>
            )}
          </form>
        </div>

        {/* Form 2: Add Jodi to Historical Chart */}
        <div className="rounded-2xl border-2 border-yellow-500 bg-[#0a142c] p-5 shadow-2xl">
          <div className="mb-4 flex items-center gap-2 border-b border-slate-800 pb-3">
            <Plus className="h-4 w-4 text-[#ffd700]" />
            <h3 className="text-sm font-black uppercase tracking-wider text-[#ffd700]">
              Add Record to History (Purani Jodi)
            </h3>
          </div>

          <form onSubmit={handleAddHistory} className="space-y-3.5 text-xs font-semibold">
            {/* Select History Market */}
            <div>
              <label className="block font-black text-slate-300 mb-1">Market Name:</label>
              <select
                value={historyMarketId}
                onChange={(e) => setHistoryMarketId(e.target.value)}
                className="w-full rounded-lg bg-slate-950 border border-slate-800 text-white font-bold px-3 py-2 outline-none focus:border-yellow-500 shadow-inner"
              >
                {markets.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Picker */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-black text-slate-300 mb-1 flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-yellow-400" />
                  Date Selection:
                </label>
                <input
                  type="date"
                  value={historyDate}
                  onChange={(e) => setHistoryDate(e.target.value)}
                  className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-1.5 text-white font-bold outline-none font-mono focus:border-yellow-500 shadow-inner"
                />
              </div>
              <div>
                <label className="block font-black text-slate-300 mb-1">Weekday (Auto):</label>
                <input
                  type="text"
                  disabled
                  value={historyDay}
                  className="w-full rounded-lg bg-slate-900 border border-slate-800 px-3 py-1.5 text-slate-400 font-bold outline-none"
                />
              </div>
            </div>

            {/* Pana & Jodi inputs */}
            <div className="grid grid-cols-3 gap-3 rounded-lg border border-slate-800 bg-slate-950/40 p-3">
              <div>
                <label className="block text-[10px] font-black text-slate-300 mb-1">Open Pana:</label>
                <input
                  type="text"
                  maxLength={3}
                  placeholder="e.g. 139"
                  value={historyOpenPana}
                  onChange={(e) => setHistoryOpenPana(e.target.value)}
                  className="w-full rounded-lg bg-slate-950 border border-slate-800 px-2.5 py-1.5 font-mono text-white font-bold outline-none focus:border-yellow-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-300 mb-1">Jodi (2-digit):</label>
                <input
                  type="text"
                  maxLength={2}
                  placeholder="e.g. 38"
                  value={historyJodi}
                  onChange={(e) => setHistoryJodi(e.target.value)}
                  className="w-full rounded-lg bg-slate-950 border border-slate-800 px-2.5 py-1.5 font-mono text-white font-bold outline-none focus:border-yellow-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-300 mb-1">Close Pana:</label>
                <input
                  type="text"
                  maxLength={3}
                  placeholder="e.g. 280"
                  value={historyClosePana}
                  onChange={(e) => setHistoryClosePana(e.target.value)}
                  className="w-full rounded-lg bg-slate-950 border border-slate-800 px-2.5 py-1.5 font-mono text-white font-bold outline-none focus:border-yellow-500"
                />
              </div>
            </div>

            {/* Add Button */}
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-red-600 hover:bg-red-700 py-2.5 text-xs font-black uppercase tracking-widest text-white shadow-lg transition-all border border-red-500"
            >
              <Plus className="h-4 w-4" />
              Add To Historical Chart
            </button>

            {historySuccessMsg && (
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold bg-[#0a2322] border border-emerald-950 rounded-lg p-2 shadow-md">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                <span>{historySuccessMsg}</span>
              </div>
            )}

            {historyErrorMsg && (
              <div className="flex items-center gap-1.5 text-rose-400 font-bold bg-[#2e0b12] border border-red-950 rounded-lg p-2 shadow-md">
                <ShieldAlert className="h-4 w-4 shrink-0 text-rose-500 animate-pulse" />
                <span>{historyErrorMsg}</span>
              </div>
            )}
          </form>
        </div>

      </div>

      {/* Form 3: Change Admin Passcode / Security settings */}
      <div className="rounded-2xl border-2 border-yellow-500 bg-[#0a142c] p-5 shadow-2xl">
        <div className="mb-4 flex items-center gap-2 border-b border-slate-800 pb-3">
          <ShieldAlert className="h-4 w-4 text-red-500 animate-pulse" />
          <h3 className="text-sm font-black uppercase tracking-wider text-[#ffd700]">
            🔑 Security Settings: Admin Passcode Badlein
          </h3>
        </div>

        <form onSubmit={handleChangePasscode} className="grid grid-cols-1 gap-4 sm:grid-cols-3 items-end text-xs font-semibold">
          <div>
            <label className="block text-[11px] font-black text-slate-300 mb-1.5 uppercase">Current Passcode:</label>
            <input
              type="password"
              required
              placeholder="Purana passcode..."
              value={currentPasscode}
              onChange={(e) => setCurrentPasscode(e.target.value)}
              className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-white font-bold outline-none focus:border-yellow-500 shadow-inner"
            />
          </div>
          <div>
            <label className="block text-[11px] font-black text-slate-300 mb-1.5 uppercase">New Passcode:</label>
            <input
              type="password"
              required
              placeholder="Naya passcode (min 4 chars)..."
              value={newPasscode}
              onChange={(e) => setNewPasscode(e.target.value)}
              className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-white font-bold outline-none focus:border-yellow-500 shadow-inner"
            />
          </div>
          <div>
            <label className="block text-[11px] font-black text-slate-300 mb-1.5 uppercase">Confirm New Passcode:</label>
            <input
              type="password"
              required
              placeholder="Confirm naya passcode..."
              value={confirmPasscode}
              onChange={(e) => setConfirmPasscode(e.target.value)}
              className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-white font-bold outline-none focus:border-yellow-500 shadow-inner"
            />
          </div>

          <div className="sm:col-span-3 flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <div className="w-full">
              {passcodeSettingsSuccessMsg && (
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold bg-[#0a2322] border border-emerald-950 rounded-lg p-2.5 shadow-md">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                  <span>{passcodeSettingsSuccessMsg}</span>
                </div>
              )}
              {passcodeSettingsErrorMsg && (
                <div className="flex items-center gap-1.5 text-rose-400 font-bold bg-[#2e0b12] border border-red-950 rounded-lg p-2.5 shadow-md">
                  <ShieldAlert className="h-4 w-4 shrink-0 text-rose-500" />
                  <span>{passcodeSettingsErrorMsg}</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="flex w-full sm:w-auto items-center justify-center gap-1.5 rounded-lg bg-red-600 hover:bg-red-700 px-6 py-2.5 text-xs font-black uppercase tracking-widest text-white shadow-lg transition-all border border-red-500 shrink-0"
            >
              <Save className="h-4 w-4" />
              Update Passcode
            </button>
          </div>
        </form>
      </div>

      {/* Form 4: Google Search Console Domain Verification */}
      <div className="rounded-2xl border-2 border-yellow-500 bg-[#0a142c] p-5 shadow-2xl">
        <div className="mb-4 flex items-center gap-2 border-b border-slate-800 pb-3">
          <Sliders className="h-4 w-4 text-yellow-400" />
          <h3 className="text-sm font-black uppercase tracking-wider text-[#ffd700]">
            🔍 Google Search Console Owner Verification
          </h3>
        </div>

        <p className="mb-4 text-xs font-semibold text-slate-300 leading-relaxed">
          Google Search Console me site verify karne ke liye HTML tag verification code (jaise: <code className="bg-slate-950 px-1.5 py-0.5 border border-slate-800 text-yellow-400 font-mono font-bold rounded">google33ea89d196b678b8</code>) yahan enter karein. Yeh meta tag aapki live site par set ho jayega aur Google aapko single-click me verify kar lega!
        </p>

        <form onSubmit={handleSaveGoogleVerification} className="flex flex-col sm:flex-row gap-4 items-end text-xs font-semibold">
          <div className="flex-1 w-full">
            <label className="block text-[11px] font-black text-slate-300 mb-1.5 uppercase">Google Site Verification Code:</label>
            <input
              type="text"
              required
              placeholder="E.g. google33ea89d196b678b8..."
              value={googleVerifyInput}
              onChange={(e) => setGoogleVerifyInput(e.target.value)}
              className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-white font-mono font-bold outline-none focus:border-yellow-500 shadow-inner"
            />
          </div>

          <button
            type="submit"
            className="flex w-full sm:w-auto items-center justify-center gap-1.5 rounded-lg bg-red-600 hover:bg-red-700 px-6 py-2.5 text-xs font-black uppercase tracking-widest text-white shadow-lg transition-all border border-red-500 shrink-0 h-[38px]"
          >
            <Save className="h-4 w-4" />
            Save Verification
          </button>
        </form>

        {googleVerifySuccessMsg && (
          <div className="mt-3 flex items-center gap-1.5 text-emerald-400 font-bold bg-[#0a2322] border border-emerald-950 rounded-lg p-2.5 shadow-md">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            <span>{googleVerifySuccessMsg}</span>
          </div>
        )}
      </div>

      {/* Global database control */}
      <div className="rounded-xl border-2 border-red-600 bg-red-950/20 p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div>
          <h4 className="text-xs font-black uppercase tracking-wider text-red-400">
            Restore Defaults / Clear Memory
          </h4>
          <p className="text-[11px] text-slate-300 mt-0.5 font-semibold">
            Reset default markets and default historical seed charts. This will wipe out your local custom records.
          </p>
        </div>
        <button
          onClick={() => {
            if (confirm('Kya aap sach me app memory ko reset karke original pre-seeded results load karna chahte hain?')) {
              onResetData();
            }
          }}
          className="flex items-center gap-2 rounded-lg border border-red-500 bg-slate-950 px-4 py-2 text-xs font-black text-red-400 hover:bg-slate-900 transition-colors shrink-0 shadow-md"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          RESET TO DEFAULT SEED
        </button>
      </div>

    </div>
  );
}
