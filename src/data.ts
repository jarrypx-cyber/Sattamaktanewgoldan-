import { Market, JodiRecord } from './types';

// Helper to get deterministic random numbers based on a string seed (marketId + dateStr)
export function seedRandom(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

// Satta panas are 3 ascending digits. This is a collection of standard valid Satta panas.
export const VALID_PANAS = [
  "120", "123", "124", "125", "126", "127", "128", "129", "130", "134", "135", "136", "137", "138", "139", "140", "145", "146", "147", "148", "149", "150", "156", "157", "158", "159", "160", "167", "168", "169", "170", "178", "179", "180", "189", "190",
  "230", "234", "235", "236", "237", "238", "239", "240", "245", "246", "247", "248", "249", "250", "256", "257", "258", "259", "260", "267", "268", "269", "270", "278", "279", "280", "289", "290",
  "340", "345", "346", "347", "348", "349", "350", "356", "357", "358", "359", "360", "367", "368", "369", "370", "378", "379", "380", "389", "390",
  "450", "456", "457", "458", "459", "460", "467", "468", "469", "470", "478", "479", "480", "489", "490",
  "560", "567", "568", "569", "570", "578", "579", "580", "589", "590",
  "670", "678", "679", "680", "689", "690",
  "780", "789", "790",
  "890"
];

// Helper to generate a single digit and three-digit pana based on a string seed
export function generatePanaAndSingle(seedStr: string): { pana: string; single: string } {
  const seed = seedRandom(seedStr);
  const pana = VALID_PANAS[seed % VALID_PANAS.length];
  // Calculate sum of digits modulo 10
  const sum = (parseInt(pana[0]) + parseInt(pana[1]) + parseInt(pana[2])) % 10;
  return { pana, single: sum.toString() };
}

// Convert local browser time to active clock time for live simulation
export function getCurrentIST(): Date {
  return new Date();
}

// Convert a Date object into a YYYY-MM-DD date string in IST timezone
export function getISTDateString(dateObj: Date): string {
  const yyyy = dateObj.getFullYear();
  const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
  const dd = String(dateObj.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

// Helper to parse "HH:MM AM/PM" into minutes from start of day (0 to 1439)
export function parseTimeToMinutes(timeStr: string): number {
  const [time, modifier] = timeStr.split(' ');
  let [hours, minutes] = time.split(':').map(Number);
  if (modifier === 'PM' && hours < 12) hours += 12;
  if (modifier === 'AM' && hours === 12) hours = 0;
  return hours * 60 + minutes;
}

// Full set of traditional markets from Satta Matka result websites (as shown in screenshots)
export const defaultMarkets: Market[] = [
  {
    id: 'morning-syndicate',
    name: 'MORNING SYNDICATE',
    openTime: '11:15 AM',
    closeTime: '12:15 PM',
    openPana: '145',
    openSingle: '0',
    closeSingle: '5',
    closePana: '230',
    status: 'CLOSED',
    lastUpdated: 'Today, 12:16 PM'
  },
  {
    id: 'tsunami-day',
    name: 'TSUNAMI DAY',
    openTime: '12:30 PM',
    closeTime: '01:30 PM',
    openPana: '128',
    openSingle: '1',
    closeSingle: '4',
    closePana: '167',
    status: 'CLOSED',
    lastUpdated: 'Today, 01:31 PM'
  },
  {
    id: 'time-bazar',
    name: 'TIME BAZAR',
    openTime: '01:00 PM',
    closeTime: '02:00 PM',
    openPana: '235',
    openSingle: '0',
    closeSingle: '9',
    closePana: '388',
    status: 'CLOSED',
    lastUpdated: 'Today, 02:01 PM'
  },
  {
    id: 'hum-day',
    name: 'HUM DAY',
    openTime: '02:00 PM',
    closeTime: '03:30 PM',
    openPana: '138',
    openSingle: '2',
    closeSingle: '5',
    closePana: '348',
    status: 'CLOSED',
    lastUpdated: 'Today, 03:31 PM'
  },
  {
    id: 'new-golden-day',
    name: 'NEW GOLDEN DAY',
    openTime: '02:30 PM',
    closeTime: '03:30 PM',
    openPana: '149',
    openSingle: '4',
    closeSingle: '8',
    closePana: '279',
    status: 'CLOSED',
    lastUpdated: 'Today, 03:31 PM'
  },
  {
    id: 'pnb-day',
    name: 'PNB DAY',
    openTime: '03:00 PM',
    closeTime: '04:00 PM',
    openPana: '159',
    openSingle: '5',
    closeSingle: '8',
    closePana: '288',
    status: 'CLOSED',
    lastUpdated: 'Today, 04:01 PM'
  },
  {
    id: 'milan-day',
    name: 'MILAN DAY',
    openTime: '03:00 PM',
    closeTime: '05:00 PM',
    openPana: '349',
    openSingle: '6',
    closeSingle: '1',
    closePana: '128',
    status: 'CLOSED',
    lastUpdated: 'Today, 05:01 PM'
  },
  {
    id: 'rajdhani-day',
    name: 'RAJDHANI DAY',
    openTime: '03:00 PM',
    closeTime: '05:00 PM',
    openPana: '239',
    openSingle: '4',
    closeSingle: '1',
    closePana: '236',
    status: 'CLOSED',
    lastUpdated: 'Today, 05:01 PM'
  },
  {
    id: 'gold-kalyan',
    name: 'GOLD KALYAN',
    openTime: '03:15 PM',
    closeTime: '05:15 PM',
    openPana: '250',
    openSingle: '7',
    closeSingle: '3',
    closePana: '157',
    status: 'CLOSED',
    lastUpdated: 'Today, 05:16 PM'
  },
  {
    id: 'new-golden-sagar',
    name: 'NEW GOLDEN SAGAR',
    openTime: '03:30 PM',
    closeTime: '04:30 PM',
    openPana: '123',
    openSingle: '6',
    closeSingle: '4',
    closePana: '239',
    status: 'CLOSED',
    lastUpdated: 'Today, 04:31 PM'
  },
  {
    id: 'kalyan',
    name: 'KALYAN',
    openTime: '03:45 PM',
    closeTime: '05:45 PM',
    openPana: '234',
    openSingle: '5',
    closeSingle: '9',
    closePana: '990',
    status: 'CLOSED',
    lastUpdated: 'Today, 05:46 PM'
  },
  {
    id: 'new-bombey-day',
    name: 'NEW BOMBEY DAY',
    openTime: '04:15 PM',
    closeTime: '05:15 PM',
    openPana: '249',
    openSingle: '5',
    closeSingle: '7',
    closePana: '368',
    status: 'CLOSED',
    lastUpdated: 'Today, 05:16 PM'
  },
  {
    id: 'hum-night',
    name: 'HUM NIGHT',
    openTime: '07:30 PM',
    closeTime: '09:00 PM',
    openPana: '148',
    openSingle: '3',
    closeSingle: '1',
    closePana: '489',
    status: 'CLOSED',
    lastUpdated: 'Today, 09:01 PM'
  },
  {
    id: 'rajdhani-night',
    name: 'RAJDHANI NIGHT',
    openTime: '09:30 PM',
    closeTime: '11:45 PM',
    openPana: '228',
    openSingle: '2',
    closeSingle: '6',
    closePana: '367',
    status: 'CLOSED',
    lastUpdated: 'Today, 11:46 PM'
  }
];

// Resolves a market's current values in real-time based on India Time (IST)
// If manual overrides exist for today, they take precedence.
export function getLiveMarketResult(market: Market, todayStr: string, currentMinutes: number): Market {
  // Check if there is an explicit admin override saved in localStorage
  const savedOverride = localStorage.getItem(`satta_override_${market.id}_${todayStr}`);
  if (savedOverride) {
    try {
      const parsed = JSON.parse(savedOverride);
      return {
        ...market,
        ...parsed,
        lastUpdated: 'Synced via Cloud Admin'
      };
    } catch (e) {
      // fallback to auto if invalid JSON
    }
  }

  // No time restriction or "???" generation!
  // Always display full hardcoded results.
  return {
    ...market,
    status: 'CLOSED',
    lastUpdated: 'Final results updated'
  };
}

// Helper to generate a valid pana whose digits sum to the target single digit (mod 10)
export function generatePanaForSingle(singleDigit: string, seedStr: string): string {
  if (singleDigit === '?') return '???';
  const target = parseInt(singleDigit);
  if (isNaN(target)) return '???';
  
  const matchingPanas = VALID_PANAS.filter(pana => {
    const sum = (parseInt(pana[0]) + parseInt(pana[1]) + parseInt(pana[2])) % 10;
    return sum === target;
  });
  
  if (matchingPanas.length === 0) return "123"; // fallback
  const seed = seedRandom(seedStr);
  return matchingPanas[seed % matchingPanas.length];
}

// Seed some realistic historical data for ALL markets
// Incorporating exact historical Jodi values from user screenshots for Kalyan & New Golden Day
export const generateSeedJodiChart = (): JodiRecord[] => {
  const records: JodiRecord[] = [];
  const weekDayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Kalyan Chart Jodis (25 weeks from top/oldest to bottom/newest)
  const kalyanJodis = [
    ['**', '39', '67', '24', '22', '44'],
    ['86', '44', '47', '99', '17', '61'],
    ['55', '84', '80', '98', '95', '17'],
    ['30', '15', '17', '31', '53', '40'],
    ['95', '49', '90', '16', '67', '65'],
    ['86', '19', '**', '74', '29', '68'],
    ['24', '86', '23', '60', '75', '63'],
    ['23', '34', '89', '95', '89', '79'],
    ['28', '76', '32', '41', '11', '40'],
    ['75', '29', '40', '22', '80', '76'],
    ['75', '96', '96', '78', '**', '92'],
    ['34', '07', '87', '70', '29', '30'],
    ['38', '79', '43', '06', '46', '23'],
    ['46', '43', '21', '49', '60', '67'],
    ['00', '60', '44', '90', '47', '85'],
    ['49', '60', '63', '71', '60', '37'],
    ['19', '50', '67', '65', '29', '20'],
    ['24', '94', '96', '67', '17', '89'],
    ['29', '79', '99', '47', '44', '72'],
    ['86', '38', '95', '63', '33', '81'],
    ['96', '20', '62', '59', '91', '17'],
    ['03', '52', '52', '53', '25', '87'],
    ['58', '15', '18', '86', '00', '00'],
    ['38', '18', '12', '46', '29', '21'],
    ['63', '35', '51']
  ];

  // New Golden Day Jodis (9 weeks from top/oldest to bottom/newest)
  const newGoldenDayJodis = [
    ['42', '68', '24', '36', '32', '15'],
    ['32', '64', '91', '38', '78', '61'],
    ['70', '69', '77', '67', '43', '31'],
    ['48', '11', '41', '50', '87', '98'],
    ['15', '01', '21', '02', '19', '62'],
    ['46', '36', '76', '49', '76', '25'],
    ['82', '33', '01', '43', '54', '10'],
    ['43', '21', '01', '54', '24', '19'],
    ['78', '08', '01', '56', '96', '98']
  ];

  // Determine current week's Monday in India Time (IST)
  const todayVal = getCurrentIST();
  const todayStr = getISTDateString(todayVal);
  const dayOfWeek = todayVal.getDay();
  const diffToMon = todayVal.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);

  const totalWeeks = 53; // Generates 53 weeks of historical entries (covers a full year)

  // Loop week by week from oldest (52 weeks ago) to newest (current week)
  for (let w = totalWeeks - 1; w >= 0; w--) {
    // Calculate Monday for this week
    const monYear = todayVal.getFullYear();
    const monMonth = todayVal.getMonth();
    const monDay = diffToMon - (w * 7);
    const monDate = new Date(monYear, monMonth, monDay);

    for (let d = 0; d < 7; d++) { // Monday to Sunday
      const currentDate = new Date(monDate.getFullYear(), monDate.getMonth(), monDate.getDate() + d);
      const dateStr = getISTDateString(currentDate);

      // Skip future dates
      if (dateStr > todayStr) {
        continue;
      }

      const dayName = weekDayNames[d];

      defaultMarkets.forEach((market) => {
        let jodi = '';

        // Match exact historical Kalyan Jodis from screenshots if within range (and not Sunday)
        if (market.id === 'kalyan' && d < 6) {
          const targetWeekIndex = (totalWeeks - 1 - w) - (totalWeeks - kalyanJodis.length);
          if (targetWeekIndex >= 0 && targetWeekIndex < kalyanJodis.length) {
            jodi = kalyanJodis[targetWeekIndex][d] || '**';
          }
        }
        // Match exact historical New Golden Day Jodis from screenshots if within range (and not Sunday)
        else if (market.id === 'new-golden-day' && d < 6) {
          const targetWeekIndex = (totalWeeks - 1 - w) - (totalWeeks - newGoldenDayJodis.length);
          if (targetWeekIndex >= 0 && targetWeekIndex < newGoldenDayJodis.length) {
            jodi = newGoldenDayJodis[targetWeekIndex][d] || '**';
          }
        }

        // If not Kalyan/New Golden Day, or out of range, generate a deterministic Satta Jodi
        if (!jodi) {
          const seedVal = seedRandom(`${market.id}-${dateStr}`);
          const d1 = seedVal % 10;
          const d2 = (seedVal >> 3) % 10;
          jodi = `${d1}${d2}`;
        }

        // Generate matching open/close panas that mathematically sum to the single digit values
        let openPana = '???';
        let closePana = '???';
        if (jodi !== '**') {
          openPana = generatePanaForSingle(jodi[0], `${market.id}-${dateStr}-open`);
          closePana = generatePanaForSingle(jodi[1], `${market.id}-${dateStr}-close`);
        }

        records.push({
          id: `${market.id}-${dateStr}`,
          date: dateStr,
          day: dayName,
          marketId: market.id,
          marketName: market.name,
          openPana: openPana,
          jodi: jodi,
          closePana: closePana,
        });
      });
    }
  }

  return records;
};
