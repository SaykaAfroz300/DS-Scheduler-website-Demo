import React from 'react';
import { Check, Link as LinkIcon, Clock, Trash2 } from 'lucide-react';
import PlatformBadge from './PlatformBadge';
import StatusBadge from './StatusBadge';
import { getTaskStatus, formatDeadline, relativeTime } from '@/lib/status';

export default function TaskCard({ task, user, isAdmin, onComplete, onDelete }) {
    const status = getTaskStatus(task);
    const canComplete = task.status !== 'completed' && (isAdmin || task.assigned_to_id === user?.id);
    const completed = status === 'completed';

    return (
        <div className="rounded-[6px] border border-[#262626] bg-[#121212] p-4 transition-colors hover:border-[#3a3a3a]">
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                    <PlatformBadge platform={task.platform} />
                    <div>
                        <h3 className="font-display text-[15px] font-semibold leading-tight text-[#FAFAFA]">{task.title}</h3>
                        <div className="mt-1 flex items-center gap-2 text-[11px] uppercase tracking-wide text-[#8E8E93]">
                            <span>{task.content_type}</span>
                            <span className="text-[#3a3a3a]">/</span>
                            <span>{task.assigned_to_name || 'Unassigned'}</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <StatusBadge status={status} />
                    {isAdmin && onDelete && (
                        <button
                            onClick={() => onDelete(task)}
                            className="flex h-7 w-7 items-center justify-center rounded-[6px] border border-[#262626] text-[#8E8E93] transition-colors hover:border-[#ef4444] hover:text-[#ef4444]"
                            title="Delete task"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>
            </div>

            <div className="mt-3 flex items-center gap-2 text-[12px] text-[#8E8E93]">
                <Clock className="w-3.5 h-3.5" />
                <span>{formatDeadline(task.deadline)}</span>
                {!completed && (
                    <span className="text-[#3a3a3a]">·</span>
                )}
                {!completed && <span className="text-[#8E8E93]">{relativeTime(task.deadline)}</span>}
            </div>

            {task.notes && (
                <p className="mt-3 text-[13px] leading-relaxed text-[#8E8E93]">{task.notes}</p>
            )}

            {task.google_drive_link && (
                <a
                    href={task.google_drive_link}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex items-center gap-1.5 text-[12px] font-medium text-[#FAFAFA] underline decoration-[#3a3a3a] underline-offset-4 hover:decoration-[#FAFAFA]"
                >
                    <LinkIcon className="w-3.5 h-3.5" />
                    Google Drive folder
                </a>
            )}

            {canComplete && (
                <button
                    onClick={() => onComplete(task)}
                    className="mt-4 w-full rounded-[6px] border border-[#FAFAFA] bg-[#FAFAFA] px-4 py-2.5 font-display text-[13px] font-semibold text-[#080808] transition-opacity hover:opacity-90"
                >
                    Mark as Done
                </button>
            )}
            {completed && (
                <div className="mt-4 flex items-center gap-2 text-[12px] font-medium text-[#10B981]">
                    <Check className="w-4 h-4" />
                    Completed
                </div>
            )}
        </div>
    );
}