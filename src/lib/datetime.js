// Bangladesh date/time helpers.
// Every date shown in the app is rendered as dd/mm/yyyy, 12-hour time,
// always in Bangladesh time (Asia/Dhaka, UTC+6) regardless of the viewer's location.

export const BD_TIMEZONE = 'Asia/Dhaka';
export const BD_OFFSET = '+06:00';
export const BD_WEEK_START = 6; // Saturday

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEKDAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const WEEKDAYS_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const partsFormatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: BD_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
});

const pad = (n) => String(n).padStart(2, '0');

function toDate(value) {
    if (value === null || value === undefined || value === '') return null;
    const d = value instanceof Date ? value : new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
}

/** Returns { year, month, day, hour, minute } as numbers, in Bangladesh time. */
export function dhakaParts(value) {
    const d = toDate(value);
    if (!d) return null;
    const out = {};
    partsFormatter.formatToParts(d).forEach((p) => {
        if (p.type !== 'literal') out[p.type] = Number(p.value);
    });
    if (out.hour === 24) out.hour = 0;
    return out;
}

/** 'YYYY-MM-DD' key of the Bangladesh calendar day (useful for grouping / comparing). */
export function dhakaDateKey(value = new Date()) {
    const p = dhakaParts(value);
    if (!p) return '';
    return `${p.year}-${pad(p.month)}-${pad(p.day)}`;
}

/** Weekday index (0 = Sunday) for a 'YYYY-MM-DD' key. */
function weekdayOfKey(key) {
    const [y, m, d] = key.split('-').map(Number);
    return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

/** dd/mm/yyyy */
export function formatDateBD(value) {
    const p = dhakaParts(value);
    if (!p) return '—';
    return `${pad(p.day)}/${pad(p.month)}/${p.year}`;
}

/** hh:mm AM/PM */
export function formatTimeBD(value) {
    const p = dhakaParts(value);
    if (!p) return '—';
    const h12 = p.hour % 12 === 0 ? 12 : p.hour % 12;
    return `${pad(h12)}:${pad(p.minute)} ${p.hour < 12 ? 'AM' : 'PM'}`;
}

/** dd/mm/yyyy, hh:mm AM/PM */
export function formatDateTimeBD(value) {
    if (!toDate(value)) return '—';
    return `${formatDateBD(value)}, ${formatTimeBD(value)}`;
}

/** e.g. "Wednesday, 07/10/2026" */
export function formatLongDateBD(value = new Date()) {
    const key = dhakaDateKey(value);
    if (!key) return '—';
    return `${WEEKDAYS_LONG[weekdayOfKey(key)]}, ${formatDateBD(value)}`;
}

/** Header info for a 'YYYY-MM-DD' key: { day: 'Wed', date: 7, month: 'Oct', isToday } */
export function dayHeaderFromKey(key) {
    const [y, m, d] = key.split('-').map(Number);
    return {
        day: WEEKDAYS_SHORT[weekdayOfKey(key)],
        date: d,
        month: MONTHS_SHORT[m - 1],
        year: y,
        isToday: key === dhakaDateKey(new Date()),
    };
}

/** Current hour (0-23) in Bangladesh. */
export function dhakaHour(value = new Date()) {
    return dhakaParts(value)?.hour ?? 0;
}

/**
 * Builds an ISO string pinned to Bangladesh time.
 * @param {string} dateKey 'YYYY-MM-DD'
 * @param {number} hour24 0-23
 * @param {number} minute 0-59
 */
export function toDhakaISO(dateKey, hour24 = 0, minute = 0) {
    if (!dateKey) return '';
    return `${dateKey}T${pad(hour24)}:${pad(minute)}:00${BD_OFFSET}`;
}

/** Converts a 'YYYY-MM-DD' key to a local Date at midnight (for calendar widgets). */
export function keyToLocalDate(key) {
    if (!key) return undefined;
    const [y, m, d] = key.split('-').map(Number);
    return new Date(y, m - 1, d);
}

/** Converts a local Date picked in a calendar widget to a 'YYYY-MM-DD' key. */
export function localDateToKey(date) {
    if (!date) return '';
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Formats a 'YYYY-MM-DD' key as dd/mm/yyyy without timezone shifting. */
export function formatKeyBD(key) {
    if (!key) return '';
    const [y, m, d] = key.split('-');
    return `${d}/${m}/${y}`;
}
