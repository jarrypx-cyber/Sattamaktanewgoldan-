export interface Market {
  id: string;
  name: string;
  openTime: string; // HH:MM AM/PM
  closeTime: string; // HH:MM AM/PM
  openPana: string; // 3 digits, or "???" if not declared
  openSingle: string; // 1 digit, or "?"
  closeSingle: string; // 1 digit, or "?"
  closePana: string; // 3 digits, or "???"
  status: 'OPEN' | 'CLOSED' | 'ACTIVE_CLOSE'; // OPEN: waiting for open, ACTIVE_CLOSE: open is out, waiting for close, CLOSED: both are out
  lastUpdated: string;
}

export interface JodiRecord {
  id: string;
  date: string; // YYYY-MM-DD
  day: string; // Monday, Tuesday, etc.
  marketId: string;
  marketName: string;
  openPana: string;
  jodi: string; // 2 digits (e.g. "64")
  closePana: string;
}

export interface GuessResult {
  single: string;
  jodi: string;
  pana: string;
}

export interface MarketResult {
  id: string;
  name: string;
  openPana: string;
  openSingle: string;
  closeSingle: string;
  closePana: string;
  status: 'OPEN' | 'CLOSED' | 'ACTIVE_CLOSE';
  lastUpdated?: string;
}
