import React, { useState, useMemo } from 'react';
import { Search, Calendar, RefreshCw, Grid3X3, List, Star, Filter, ChevronRight } from 'lucide-react';
import { JodiRecord } from '../types';

interface JodiChartProps {
  records: JodiRecord[];
  markets: { id: string; name: string }[];
  selectedMarketId: string;
  setSelectedMarketId: (id: string) => void;
}

export default function JodiChart({ records, markets, selectedMarketId, setSelectedMarketId }: JodiChartProps) {
  const [viewMode, setViewMode] = useState<'matrix' | 'table'>('matrix');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [highlightDigit, setHighlightDigit] = useState<string>('');

  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const formatDateSattaStyle = (dateStr: string): string => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const year = parts[0].substring(2);
    const month = parts[1];
    const day = parts[2];
    return `${day}/${month}/${year}`;
  };

  // Current selected market object
  const selectedMarket = useMemo(() => {
    return markets.find(m => m.id === selectedMarketId) || { id: 'kalyan', name: 'Kalyan' };
  }, [markets, selectedMarketId]);

  // Filter records by selected market
  const filteredRecords = useMemo(() => {
    return records.filter((rec) => rec.marketId === selectedMarketId);
  }, [records, selectedMarketId]);

  // List View - searched & filtered
  const searchedRecords = useMemo(() => {
    return filteredRecords.filter((rec) => {
      const matchSearch =
        rec.date.includes(searchQuery) ||
        rec.day.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rec.jodi.includes(searchQuery);
      
      const matchHighlight = highlightDigit
        ? rec.jodi.includes(highlightDigit)
        : true;

      return matchSearch && matchHighlight;
    });
  }, [filteredRecords, searchQuery, highlightDigit]);

  // Satta Matka Red color rule: double digit (e.g., 22, 66) or cut digits (e.g., 16, 61, 27, 72, 38, 83, 49, 94, 50, 05)
  const isRedJodi = (jodi: string): boolean => {
    if (!jodi || jodi.length < 2) return false;
    if (jodi === '**') return true;
    const d1 = jodi[0];
    const d2 = jodi[1];
    if (d1 === d2) return true; // Double
    // Check cut relationship (diff of 5)
    const n1 = parseInt(d1);
    const n2 = parseInt(d2);
    if (!isNaN(n1) && !isNaN(n2) && Math.abs(n1 - n2) === 5) return true;
    return false;
  };

  // Helper to parse date string safely without timezone offsets or Safari invalid-date issues
  const parseLocalDate = (dateStr: string): Date => {
    const parts = dateStr.split('-');
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    const d = parseInt(parts[2], 10);
    return new Date(y, m - 1, d);
  };

  // Helper to find Monday date for any date string
  const getMondayDate = (dateStr: string): string => {
    const d = parseLocalDate(dateStr);
    const day = d.getDay(); // 0 = Sun, 1 = Mon, etc.
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const mon = new Date(d.getFullYear(), d.getMonth(), diff);
    const yyyy = mon.getFullYear();
    const mm = String(mon.getMonth() + 1).padStart(2, '0');
    const dd = String(mon.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  // Helper to calculate exact date of a weekday from a Monday date base
  const getCellDateForWeekday = (mondayStr: string, dayName: string): string => {
    const offset = weekDays.indexOf(dayName);
    const d = parseLocalDate(mondayStr);
    const targetDate = new Date(d.getFullYear(), d.getMonth(), d.getDate() + (offset >= 0 ? offset : 0));
    const yyyy = targetDate.getFullYear();
    const mm = String(targetDate.getMonth() + 1).padStart(2, '0');
    const dd = String(targetDate.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  // Group records into weekly matrix rows chronologically (oldest first)
  const weeklyMatrix = useMemo(() => {
    const weeksMap: { [mondayStr: string]: { [dayName: string]: JodiRecord } } = {};

    filteredRecords.forEach((record) => {
      const mondayStr = getMondayDate(record.date);
      if (!weeksMap[mondayStr]) {
        weeksMap[mondayStr] = {};
      }
      weeksMap[mondayStr][record.day] = record;
    });

    // Chronological sorting (oldest first) to look exactly like standard Satta website charts
    const sortedMondays = Object.keys(weeksMap).sort((a, b) => a.localeCompare(b));

    return sortedMondays.map((mondayStr) => {
      return {
        mondayDate: mondayStr,
        days: weeksMap[mondayStr]
      };
    });
  }, [filteredRecords]);

  // Determine first and last records to handle partial starting/ending weeks gracefully
  const sortedRecords = useMemo(() => {
    return [...filteredRecords].sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredRecords]);

  const firstDate = sortedRecords[0]?.date || '';
  const lastDate = sortedRecords[sortedRecords.length - 1]?.date || '';

  return (
    <div className="mx-auto max-w-4xl p-2 sm:p-4">
      
      {/* 🔴 Top Selector Panel for better UX */}
      <div className="mb-6 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-center md:text-left">
          <h2 className="text-lg font-extrabold text-neutral-950 flex items-center justify-center md:justify-start gap-1.5 font-sans">
            <span className="text-yellow-500">🏆</span>
            CHART RECORD CALCULATOR
          </h2>
          <p className="text-xs text-neutral-500 font-semibold mt-0.5">
            Select game to load historical chart record books and formulas.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 w-full md:w-auto">
          {/* Selector */}
          <div className="flex items-center gap-2 rounded-lg bg-neutral-100 p-1.5 border border-neutral-300 w-full sm:w-auto shadow-inner">
            <span className="text-xs font-black text-blue-700 pl-2">Game:</span>
            <select
              value={selectedMarketId}
              onChange={(e) => setSelectedMarketId(e.target.value)}
              className="bg-transparent text-xs font-black text-neutral-800 outline-none pr-2 py-1 cursor-pointer"
            >
              {markets.map((m) => (
                <option key={m.id} value={m.id} className="bg-white text-neutral-900 font-bold">
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          {/* View Mode */}
          <div className="flex items-center rounded-lg bg-neutral-100 p-1 border border-neutral-300 shadow-inner">
            <button
              onClick={() => setViewMode('matrix')}
              className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-black transition-all ${
                viewMode === 'matrix'
                  ? 'bg-blue-700 text-white shadow'
                  : 'text-neutral-700 hover:text-blue-700'
              }`}
            >
              <Grid3X3 className="h-3 w-3" />
              <span>Jodi Grid</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-black transition-all ${
                viewMode === 'table'
                  ? 'bg-blue-700 text-white shadow'
                  : 'text-neutral-700 hover:text-blue-700'
              }`}
            >
              <List className="h-3 w-3" />
              <span>Search List</span>
            </button>
          </div>
        </div>
      </div>

      {/* 🔴 Search/Filter helper if in table mode */}
      {viewMode === 'table' && (
        <div className="mb-6 grid grid-cols-1 gap-3 rounded-xl bg-neutral-50 p-3 border border-neutral-200 sm:grid-cols-2 shadow-inner">
          <div className="relative">
            <Search className="absolute top-2.5 left-3 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search by date (e.g. 2026-07-15) or Jodi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg bg-white py-2 pl-9 pr-4 text-xs text-neutral-800 font-bold outline-none border border-neutral-300 focus:border-blue-600 shadow-sm"
            />
          </div>

          <div className="flex items-center gap-2 bg-white rounded-lg border border-neutral-300 px-3 py-1 shadow-sm">
            <span className="text-[10px] font-black text-neutral-500 shrink-0">Highlight Digit:</span>
            <div className="flex gap-1 overflow-x-auto py-1">
              {['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                <button
                  key={digit}
                  onClick={() => setHighlightDigit(highlightDigit === digit ? '' : digit)}
                  className={`h-5 w-5 rounded text-xs font-mono font-black transition-all ${
                    highlightDigit === digit
                      ? 'bg-blue-700 text-white shadow scale-105'
                      : 'bg-neutral-100 text-neutral-800 hover:bg-neutral-200'
                  }`}
                >
                  {digit}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 👑 Satta Matka Official Record Header (From Screenshot 3) */}
      <div className="mx-auto flex flex-col items-center">
        
        {/* Centers the header Title */}
        <h2 className="text-center text-xl md:text-2xl font-black text-neutral-900 uppercase tracking-tight font-serif mb-5 max-w-xl">
          {selectedMarket.name} CHART RECORD
        </h2>

        {/* 👑 Royal Blue Border Description block (Copied directly from traditional Satta layouts) */}
        <div className="border-4 border-blue-600 bg-white rounded-xl p-5 text-center text-neutral-800 font-sans leading-relaxed shadow-md hover:shadow-lg transition-all max-w-2xl mx-auto mb-5 text-[11px] sm:text-xs">
          In the competitive landscape of Indian numerical predication <strong className="text-neutral-950 font-black">games</strong>, the <strong className="text-blue-800 font-black">{selectedMarket.name} Chart Record</strong> stands as a vital resource for data-drive analysis. For those tracking the <strong className="text-blue-800 font-black">Golden Sager matka</strong>, these charts provide the historical transparency required to understand market movements and sequence patterns.
          <br /><br />
          The <strong className="text-blue-800 font-black">{selectedMarket.name} Chart Record</strong> is much more than a list of numbers; it is a visual <strong className="text-neutral-950 font-black">data</strong> repository that documents past results and chronological sequences. By Organizing data into a scannable format, the chart allows players to perform technical analysis on how certain numbers have behaved over days, weeks, or Months.
          <br /><br />
          Key <strong className="text-neutral-950 font-black">Data</strong> Categories for Strategic Analysis the chart can show various categories like "Opening," "Closing," "Jodi," and "Single" numbers, which are key to placing bets in this game. <button onClick={() => alert("Educational Resources loaded successfully!")} className="bg-blue-600 text-white font-extrabold px-2 py-0.5 rounded text-[9px] uppercase tracking-wider inline-block align-middle ml-1 shadow">Educational Resources</button>
          <br /><br />
          While the <strong className="text-blue-800 font-black">{selectedMarket.name} Chart Record</strong> is an invaluable tool for record-keeping, it is vital to the remember that these games involve significant risk. These charts should be used as a reference for historical data and trend analysis, rather than a guarantee of future success. Always approach predication games with a disciplined and informed mindset.
          <br /><br />
          <p className="text-[10px] text-neutral-500 font-medium italic">
            {selectedMarket.name} chart Record, New Golden chart, Golden sager Chart, Golden sager Matka, Golden open, Golden sager Matka, न्यू गोल्डन डे चार्ट
          </p>
        </div>

        {/* 👑 Red "Go To Down" Button */}
        <div className="text-center mb-6">
          <button
            onClick={() => {
              const grid = document.getElementById('traditional-satta-grid');
              if (grid) {
                grid.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="bg-red-600 hover:bg-red-700 text-white font-black uppercase text-xs px-6 py-2 rounded-md shadow-lg border border-white tracking-widest animate-pulse"
          >
            Go To Down
          </button>
        </div>

        {/* 👑 Grid Section Header */}
        <h3 id="traditional-satta-grid" className="text-lg md:text-xl font-black text-center text-neutral-950 font-serif uppercase tracking-widest my-4">
          {selectedMarket.name} CHART
        </h3>

        {/* VIEW 1: TRADITIONAL CHRONOLOGICAL 7-DAY GRID (M T W T F S S) */}
        {viewMode === 'matrix' && (
          <div className="w-full flex justify-center px-1 mb-8">
            <div className="w-full max-w-4xl bg-white border-4 border-neutral-900 shadow-xl overflow-hidden rounded-xl">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[550px] border-collapse border-spacing-0 text-center text-neutral-900">
                  <thead>
                    <tr className="border-b-2 border-neutral-900 bg-neutral-950 text-white text-[13px] font-black font-serif uppercase">
                      <th className="py-2.5 px-3 border-r border-neutral-900 text-center font-sans text-[11px] text-yellow-300 tracking-wider">
                        Date Range
                      </th>
                      {weekDays.map((d) => (
                        <th
                          key={d}
                          className="py-2.5 px-2 border-r border-neutral-900 last:border-r-0 uppercase text-center"
                        >
                          {d.substring(0, 3)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="font-serif">
                    {weeklyMatrix.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-8 text-xs text-neutral-500 font-sans font-bold">
                          No historical records loaded for this game. Add them via admin panel!
                        </td>
                      </tr>
                    ) : (
                      weeklyMatrix.map((row) => {
                        const mondayDateFormatted = formatDateSattaStyle(row.mondayDate);
                        const sundayDate = getCellDateForWeekday(row.mondayDate, 'Sunday');
                        const sundayDateFormatted = formatDateSattaStyle(sundayDate);
                        const dateRangeDisplay = `${mondayDateFormatted.substring(0, 5)} to ${sundayDateFormatted.substring(0, 5)}`;

                        return (
                          <tr key={row.mondayDate} className="border-b border-neutral-900 last:border-b-0 hover:bg-neutral-50/70 transition-colors">
                            {/* Date Column */}
                            <td className="py-2 px-3 border-r border-neutral-900 bg-neutral-100 font-sans font-bold text-[10.5px] sm:text-[11.5px] text-neutral-700 tracking-tighter select-none">
                              {dateRangeDisplay}
                            </td>
                            {weekDays.map((dayName) => {
                              const dayRecord = row.days[dayName];
                              const cellDate = getCellDateForWeekday(row.mondayDate, dayName);

                              // Handle empty state exactly like traditional Satta grids (partial start as **, partial end as blank)
                              let cellContent = ' ';
                              if (dayRecord) {
                                cellContent = dayRecord.jodi;
                              } else {
                                if (cellDate < firstDate) {
                                  cellContent = '**';
                                } else if (cellDate > lastDate) {
                                  cellContent = ' ';
                                } else {
                                  cellContent = '**';
                                }
                              }

                              // Apply traditional Red Jodi color code
                              const isRed = cellContent === '**' || isRedJodi(cellContent);

                              return (
                                <td
                                  key={dayName}
                                  className="py-2 px-1.5 text-base sm:text-lg font-black tracking-tight border-r border-neutral-900 last:border-r-0 select-all"
                                >
                                  <span className={isRed ? 'text-red-600 font-extrabold' : 'text-neutral-950'}>
                                    {cellContent}
                                  </span>
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: SEARCHABLE TABLE */}
        {viewMode === 'table' && (
          <div className="w-full max-w-xl overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-md mb-8 mx-auto">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs font-sans">
                <thead>
                  <tr className="bg-neutral-900 text-white font-extrabold tracking-wider uppercase border-b border-neutral-800">
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Day</th>
                    <th className="py-3 px-4 text-center">Jodi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 font-mono font-bold text-neutral-800">
                  {searchedRecords.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="py-8 text-center text-xs text-neutral-400 font-sans">
                        No records match the current filters.
                      </td>
                    </tr>
                  ) : (
                    searchedRecords.map((rec) => {
                      const isRed = isRedJodi(rec.jodi);
                      return (
                        <tr key={rec.id} className="hover:bg-neutral-50/50 transition-colors">
                          <td className="py-3 px-4 font-black text-neutral-950">{rec.date}</td>
                          <td className="py-3 px-4 font-sans text-neutral-600 font-semibold">{rec.day}</td>
                          <td className="py-3 px-4 text-center text-sm font-serif">
                            <span className={isRed ? 'text-red-600 font-black' : 'text-neutral-950'}>
                              {rec.jodi}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Go To Top Shortcut Button */}
        <div className="text-center my-4">
          <button
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase px-5 py-2.5 rounded-md shadow-md border border-white tracking-wider transition duration-150 active:scale-95"
          >
            Go To Top
          </button>
        </div>

        {/* 👑 Discover More sponsored panel (From Screenshot 1) */}
        <div className="w-full max-w-2xl bg-neutral-50 border border-neutral-300 rounded-lg p-3.5 shadow-inner mt-4">
          <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2 flex items-center justify-between">
            <span>Discover more</span>
          </div>
          <div className="divide-y divide-neutral-200">
            {[
              { label: 'New Golden Chart', desc: 'Unlock live updated numbers and timing charts.', marketId: 'new-golden-day' },
              { label: 'game', desc: 'Learn strategies, rules and golden calculations.', marketId: 'kalyan' },
              { label: 'Data Management', desc: 'Secure local storage state sync and overrides.', marketId: 'time-bazar' }
            ].map((item, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSelectedMarketId(item.marketId);
                  document.getElementById('traditional-satta-grid')?.scrollIntoView({ behavior: 'smooth' });
                  alert(`Switched to ${item.label} record system!`);
                }}
                className="w-full py-2.5 text-left transition flex items-center justify-between hover:bg-neutral-100/50 px-1 rounded"
              >
                <div>
                  <div className="text-blue-700 font-extrabold text-xs uppercase tracking-wide">
                    {item.label}
                  </div>
                  <p className="text-[10px] text-neutral-500 mt-0.5 font-medium leading-normal">
                    {item.desc}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-neutral-400 shrink-0" />
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* 👑 Yellow Footer Block (From Screenshot 1) */}
      <div className="w-full bg-yellow-400 border-t-4 border-blue-800 text-neutral-900 py-6 px-4 text-center mt-12 rounded-xl">
        <div className="flex justify-center items-center gap-5 text-xs font-black uppercase text-neutral-950 flex-wrap">
          <button onClick={() => alert("About us page loaded.")} className="hover:underline">About Us</button>
          <button onClick={() => alert("Contact page: Admin helpline 8516974201")} className="hover:underline">Contact</button>
          <button onClick={() => alert("Disclaimer: This is a simulation/prediction tracking page for educational purposes.")} className="hover:underline">Disclaimer</button>
        </div>
        <div className="flex justify-center items-center gap-5 text-[11px] font-black uppercase text-blue-900 mt-2.5 flex-wrap">
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:underline">Home</button>
          <button onClick={() => setViewMode('matrix')} className="hover:underline">Penal Chart</button>
          <button onClick={() => alert("Congo charts feature synced!")} className="hover:underline">Congo Chart</button>
        </div>
        <div className="text-[10px] text-neutral-800 font-extrabold mt-4 font-mono">
          All Rights Reserved © 2016-2025
        </div>
      </div>

    </div>
  );
}
