import React from 'react';
import { AlertTriangle } from 'lucide-react';
import PlatformBadge from './PlatformBadge';
import { getTaskStatus, formatDeadline, relativeTime, statusMeta } from '@/lib/status';

export default function UrgentDeadlinesStack({ tasks }) {
    const urgent = tasks
        .filter((t) => t.status !== 'completed')
        .map((t) => ({ ...t, _status: getTaskStatus(t) }))
        .filter((t) => t._status === 'approaching' || t._status === 'overdue')
        .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());

    return (
        <div className="rounded-[6px] border border-[#262626] bg-[#121212] p-4">
            <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[#F59E0B]" />
                <h2 className="font-display text-[13px] font-semibold uppercase tracking-wide text-[#FAFAFA]">
                    Urgent Deadlines
                </h2>
            </div>

            {urgent.length === 0 ? (
                <p className="mt-3 text-[12px] text-[#8E8E93]">Nothing due in the next 48 hours.</p>
            ) : (
                <div className="mt-3 space-y-2">
                    {urgent.map((t) => {
                        const meta = statusMeta(t._status);
                        return (
                            <div
                                key={t.id}
                                className="flex items-center justify-between gap-3 rounded-[6px] border border-[#262626] bg-[#080808] px-3 py-2.5"
                            >
                                <div className="flex items-center gap-2.5 min-w-0">
                                    <PlatformBadge platform={t.platform} />
                                    <div className="min-w-0">
                                        <p className="truncate text-[13px] font-medium text-[#FAFAFA]">{t.title}</p>
                                        <p className="text-[11px] text-[#8E8E93]">
                                            {t.assigned_to_name} · {formatDeadline(t.deadline)}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right shrink-0">
                                    <p className="text-[11px] font-semibold" style={{ color: meta.text }}>
                                        {meta.label}
                                    </p>
                                    <p className="text-[10px] text-[#8E8E93]">{relativeTime(t.deadline)}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}