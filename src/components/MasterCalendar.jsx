import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import PlatformBadge from './PlatformBadge';
import StatusBadge from './StatusBadge';
import { getTaskStatus, groupByDate, formatDeadline } from '@/lib/status';
import { dayHeaderFromKey } from '@/lib/datetime';

// dateStr is a 'YYYY-MM-DD' key in Bangladesh time (see groupByDate)
function dayHeader(dateStr) {
    return dayHeaderFromKey(dateStr);
}

export default function MasterCalendar({ tasks, user, isAdmin, onComplete, onDelete }) {
    const [filter, setFilter] = useState('all');

    const filtered = tasks.filter((t) => {
        if (filter === 'all') return true;
        if (filter === 'mine') return t.assigned_to_id === user?.id;
        return t.platform === filter;
    });

    const groups = groupByDate(filtered);

    return (
        <div className="rounded-[6px] border border-[#262626] bg-[#080808]">
            <div className="flex flex-wrap items-center gap-1.5 border-b border-[#262626] p-3">
                <FilterChip active={filter === 'all'} onClick={() => setFilter('all')}>All</FilterChip>
                {isAdmin && (
                    <FilterChip active={filter === 'mine'} onClick={() => setFilter('mine')}>Mine</FilterChip>
                )}
                {['youtube', 'spotify', 'instagram', 'snapchat', 'facebook'].map((p) => (
                    <FilterChip key={p} active={filter === p} onClick={() => setFilter(p)}>
                        {p}
                    </FilterChip>
                ))}
            </div>

            {groups.length === 0 ? (
                <div className="p-10 text-center">
                    <p className="text-[13px] text-[#8E8E93]">No tasks scheduled.</p>
                </div>
            ) : (
                <div className="divide-y divide-[#1a1a1a]">
                    {groups.map(([dateStr, dayTasks]) => {
                        const h = dayHeader(dateStr);
                        return (
                            <div key={dateStr} className="flex gap-4 p-4">
                                <div className="w-12 shrink-0 text-right">
                                    <p className={`font-display text-[11px] uppercase tracking-wide ${h.isToday ? 'text-[#FAFAFA]' : 'text-[#525252]'}`}>
                                        {h.day}
                                    </p>
                                    <p className={`font-display text-2xl font-semibold leading-none ${h.isToday ? 'text-[#FAFAFA]' : 'text-[#8E8E93]'}`}>
                                        {h.date}
                                    </p>
                                    <p className="text-[10px] text-[#525252]">{h.month}</p>
                                </div>
                                <div className="flex-1 space-y-2">
                                    {dayTasks.map((t) => {
                                        const status = getTaskStatus(t);
                                        return (
                                            <div
                                                key={t.id}
                                                className="flex items-center justify-between gap-3 rounded-[6px] border border-[#262626] bg-[#121212] px-3 py-2.5"
                                            >
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <PlatformBadge platform={t.platform} />
                                                    <div className="min-w-0">
                                                        <p className="truncate text-[13px] font-medium text-[#FAFAFA]">{t.title}</p>
                                                        <p className="text-[11px] text-[#8E8E93]">
                                                            {formatDeadline(t.deadline)} · {t.content_type}
                                                            {isAdmin && t.assigned_to_name ? ` · ${t.assigned_to_name}` : ''}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 shrink-0">
                                                    <StatusBadge status={status} />
                                                    {t.status !== 'completed' && (isAdmin || t.assigned_to_id === user?.id) && (
                                                        <button
                                                            onClick={() => onComplete(t)}
                                                            className="rounded-[6px] border border-[#FAFAFA] px-2.5 py-1 text-[11px] font-semibold text-[#FAFAFA] transition-colors hover:bg-[#FAFAFA] hover:text-[#080808]"
                                                        >
                                                            Done
                                                        </button>
                                                    )}
                                                    {isAdmin && onDelete && (
                                                        <button
                                                            onClick={() => onDelete(t)}
                                                            className="flex h-7 w-7 items-center justify-center rounded-[6px] border border-[#262626] text-[#8E8E93] transition-colors hover:border-[#ef4444] hover:text-[#ef4444]"
                                                            title="Delete task"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

function FilterChip({ active, onClick, children }) {
    return (
        <button
            onClick={onClick}
            className={`rounded-[6px] border px-2.5 py-1 text-[11px] font-medium capitalize transition-colors ${active
                    ? 'border-[#FAFAFA] bg-[#FAFAFA] text-[#080808]'
                    : 'border-[#262626] text-[#8E8E93] hover:border-[#3a3a3a] hover:text-[#FAFAFA]'
                }`}
        >
            {children}
        </button>
    );
}