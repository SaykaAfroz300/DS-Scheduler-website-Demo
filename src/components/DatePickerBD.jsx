import React, { useState } from 'react';
import { CalendarDays } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { BD_WEEK_START, formatKeyBD, keyToLocalDate, localDateToKey, dhakaDateKey } from '@/lib/datetime';

const triggerClass =
    'flex w-full items-center justify-between gap-2 rounded-[6px] border border-[#262626] bg-[#080808] px-3 py-2.5 text-left text-[14px] text-[#FAFAFA] focus:border-[#FAFAFA] focus:outline-none data-[state=open]:border-[#FAFAFA]';

const calendarClassNames = {
    caption_label: 'text-[13px] font-semibold text-[#FAFAFA]',
    nav_button:
        'inline-flex h-7 w-7 items-center justify-center rounded-[6px] border border-[#262626] bg-transparent text-[#8E8E93] hover:border-[#3a3a3a] hover:text-[#FAFAFA]',
    head_cell: 'w-9 text-[11px] font-medium uppercase text-[#8E8E93]',
    cell: 'relative h-9 w-9 p-0 text-center text-[13px]',
    day: 'h-9 w-9 rounded-[6px] p-0 font-normal text-[#E5E5E5] transition-colors hover:bg-[#1f1f1f]',
    day_selected: '!bg-[#FAFAFA] !text-[#080808] font-semibold hover:!bg-[#FAFAFA]',
    day_today: 'border border-[#525252] text-[#FAFAFA]',
    day_outside: 'text-[#3f3f3f]',
    day_disabled: 'text-[#3f3f3f] opacity-50',
};

/**
 * Date picker that always displays dd/mm/yyyy with weeks starting on Saturday.
 * value / onChange use a 'YYYY-MM-DD' string.
 */
export default function DatePickerBD({ id, value, onChange, placeholder = 'dd/mm/yyyy', fromDate }) {
    const [open, setOpen] = useState(false);
    const selected = keyToLocalDate(value);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button type="button" id={id} className={triggerClass}>
                    <span className={value ? 'text-[#FAFAFA]' : 'text-[#525252]'}>
                        {value ? formatKeyBD(value) : placeholder}
                    </span>
                    <CalendarDays className="h-4 w-4 shrink-0 text-[#8E8E93]" />
                </button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-auto border-[#262626] bg-[#121212] p-0">
                <Calendar
                    mode="single"
                    weekStartsOn={BD_WEEK_START}
                    selected={selected}
                    defaultMonth={selected || keyToLocalDate(dhakaDateKey())}
                    fromDate={fromDate}
                    onSelect={(d) => {
                        onChange(localDateToKey(d));
                        if (d) setOpen(false);
                    }}
                    classNames={calendarClassNames}
                    initialFocus
                />
            </PopoverContent>
        </Popover>
    );
}
