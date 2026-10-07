import React from 'react';

const selectClass =
    'w-full appearance-none rounded-[6px] border border-[#262626] bg-[#080808] px-2 py-2.5 text-center text-[14px] text-[#FAFAFA] focus:border-[#FAFAFA] focus:outline-none';

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1); // 1..12
const MINUTES = Array.from({ length: 12 }, (_, i) => i * 5); // 0,5,...,55
const pad = (n) => String(n).padStart(2, '0');

/**
 * 12-hour time picker. value / onChange use { hour: 0-23, minute: 0-59 }.
 */
export default function TimePickerBD({ idPrefix = 'time', value, onChange }) {
    const hour24 = value?.hour ?? 10;
    const minute = value?.minute ?? 0;
    const isPM = hour24 >= 12;
    const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;

    const update = (h12, m, pm) => {
        const h = (h12 % 12) + (pm ? 12 : 0);
        onChange({ hour: h, minute: m });
    };

    return (
        <div className="grid grid-cols-3 gap-2">
            <select
                id={`${idPrefix}-hour`}
                aria-label="Hour"
                className={selectClass}
                value={hour12}
                onChange={(e) => update(Number(e.target.value), minute, isPM)}
            >
                {HOURS.map((h) => (
                    <option key={h} value={h} className="bg-[#080808]">
                        {pad(h)}
                    </option>
                ))}
            </select>
            <select
                id={`${idPrefix}-minute`}
                aria-label="Minute"
                className={selectClass}
                value={minute}
                onChange={(e) => update(hour12, Number(e.target.value), isPM)}
            >
                {/* keep an existing non-5-minute value selectable */}
                {!MINUTES.includes(minute) && (
                    <option value={minute} className="bg-[#080808]">
                        {pad(minute)}
                    </option>
                )}
                {MINUTES.map((m) => (
                    <option key={m} value={m} className="bg-[#080808]">
                        {pad(m)}
                    </option>
                ))}
            </select>
            <select
                id={`${idPrefix}-ampm`}
                aria-label="AM or PM"
                className={selectClass}
                value={isPM ? 'PM' : 'AM'}
                onChange={(e) => update(hour12, minute, e.target.value === 'PM')}
            >
                <option value="AM" className="bg-[#080808]">AM</option>
                <option value="PM" className="bg-[#080808]">PM</option>
            </select>
        </div>
    );
}
