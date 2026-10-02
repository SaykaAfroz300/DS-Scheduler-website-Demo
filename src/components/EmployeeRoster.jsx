import React, { useState } from 'react';
import { Trash2, ChevronDown, ChevronUp, Check, X, Clock, ShieldOff, UserX } from 'lucide-react';
import PlatformBadge from './PlatformBadge';
import StatusBadge from './StatusBadge';
import { getTaskStatus, formatDeadline } from '@/lib/status';

const TABS = [
    { id: 'pending', label: 'Pending', icon: Clock },
    { id: 'approved', label: 'Employees', icon: Check },
    { id: 'denied', label: 'Denied', icon: ShieldOff },
    { id: 'removed', label: 'Removed', icon: UserX },
];

export default function EmployeeRoster({ records, tasks, onApprove, onDeny, onRemove }) {
    const [tab, setTab] = useState('pending');
    const [expanded, setExpanded] = useState(null);
    const [actioning, setActioning] = useState(null); // { id, type: 'deny'|'remove' }
    const [reason, setReason] = useState('');

    const byStatus = (s) => records.filter((r) => r.status === s);
    const current = byStatus(tab);

    const activeTasksFor = (userId) =>
        tasks
            .filter((t) => t.assigned_to_id === userId && t.status !== 'completed')
            .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());

    const cancelAction = () => {
        setActioning(null);
        setReason('');
    };

    const confirm = async () => {
        if (!actioning) return;
        const emp = current.find((e) => e.user_id === actioning.id);
        if (!emp) return cancelAction();
        if (actioning.type === 'deny') await onDeny(emp, reason);
        else if (actioning.type === 'remove') await onRemove(emp);
        cancelAction();
    };

    if (records.length === 0) {
        return (
            <div className="rounded-[6px] border border-[#262626] bg-[#121212] p-10 text-center">
                <p className="text-[13px] text-[#8E8E93]">
                    No employees yet. When someone signs in, their request will appear here for approval.
                </p>
            </div>
        );
    }

    return (
        <div>
            {/* Tabs */}
            <div className="mb-4 flex flex-wrap gap-1 rounded-[6px] border border-[#262626] bg-[#080808] p-1">
                {TABS.map((t) => {
                    const count = byStatus(t.id).length;
                    const active = tab === t.id;
                    return (
                        <button
                            key={t.id}
                            onClick={() => {
                                setTab(t.id);
                                setExpanded(null);
                                cancelAction();
                            }}
                            className={`flex items-center gap-2 rounded-[6px] px-3 py-2 text-[12px] font-medium transition-colors ${active ? 'bg-[#FAFAFA] text-[#080808]' : 'text-[#8E8E93] hover:text-[#FAFAFA]'
                                }`}
                        >
                            {t.label}
                            <span
                                className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${active ? 'bg-[#080808]/10 text-[#080808]' : 'bg-[#262626] text-[#FAFAFA]'
                                    }`}
                            >
                                {count}
                            </span>
                        </button>
                    );
                })}
            </div>

            {current.length === 0 ? (
                <div className="rounded-[6px] border border-[#262626] bg-[#121212] p-8 text-center">
                    <p className="text-[13px] text-[#8E8E93]">Nothing here.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {current.map((emp) => {
                        const isExpanded = expanded === emp.user_id;
                        const activeTasks = activeTasksFor(emp.user_id);
                        const isActioning = actioning && actioning.id === emp.user_id;

                        return (
                            <div key={emp.user_id} className="rounded-[6px] border border-[#262626] bg-[#121212]">
                                <div className="flex items-center justify-between gap-3 p-4">
                                    <button
                                        onClick={() => setExpanded(isExpanded ? null : emp.user_id)}
                                        className="flex flex-1 items-center gap-3 text-left"
                                    >
                                        <div className="flex h-9 w-9 items-center justify-center rounded-[6px] border border-[#262626] bg-[#1a1a1a] font-display text-[12px] font-semibold text-[#FAFAFA]">
                                            {(emp.full_name || emp.email || '?').slice(0, 1).toUpperCase()}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="truncate text-[14px] font-semibold text-[#FAFAFA]">
                                                {emp.full_name || emp.email || 'Unknown'}
                                            </p>
                                            <p className="truncate text-[11px] text-[#8E8E93]">{emp.email}</p>
                                        </div>
                                    </button>

                                    <div className="flex items-center gap-4">
                                        {tab === 'approved' && (
                                            <>
                                                <div className="hidden text-right sm:block">
                                                    <p className="font-display text-[15px] font-bold leading-none text-[#FAFAFA]">
                                                        {emp.tasks.pending}
                                                    </p>
                                                    <p className="mt-0.5 text-[10px] uppercase tracking-wide text-[#525252]">Active</p>
                                                </div>
                                                <div className="hidden text-right sm:block">
                                                    <p className="font-display text-[15px] font-bold leading-none text-[#10B981]">
                                                        {emp.tasks.completed}
                                                    </p>
                                                    <p className="mt-0.5 text-[10px] uppercase tracking-wide text-[#525252]">Done</p>
                                                </div>
                                            </>
                                        )}
                                        <button
                                            onClick={() => setExpanded(isExpanded ? null : emp.user_id)}
                                            className="text-[#8E8E93] hover:text-[#FAFAFA]"
                                        >
                                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                {isExpanded && (
                                    <div className="border-t border-[#262626] p-4">
                                        <div className="mb-3 grid grid-cols-2 gap-3 text-[11px] text-[#8E8E93] sm:grid-cols-3">
                                            <Meta label="Status" value={emp.status} />
                                            {emp.requested_at && <Meta label="Requested" value={fmt(emp.requested_at)} />}
                                            {emp.approved_at && <Meta label="Approved" value={fmt(emp.approved_at)} />}
                                            {emp.denied_at && <Meta label="Denied" value={fmt(emp.denied_at)} />}
                                            {emp.removed_at && <Meta label="Removed" value={fmt(emp.removed_at)} />}
                                            {emp.google_sub && <Meta label="Google ID" value={emp.google_sub} mono />}
                                        </div>
                                        {emp.denial_reason && (
                                            <p className="mb-3 rounded-[6px] border border-[#262626] bg-[#080808] px-3 py-2 text-[12px] text-[#F59E0B]">
                                                Reason: {emp.denial_reason}
                                            </p>
                                        )}

                                        {tab === 'approved' &&
                                            (activeTasks.length === 0 ? (
                                                <p className="text-[12px] text-[#8E8E93]">No active tasks.</p>
                                            ) : (
                                                <div className="space-y-2">
                                                    {activeTasks.map((t) => (
                                                        <div
                                                            key={t.id}
                                                            className="flex items-center justify-between gap-3 rounded-[6px] border border-[#262626] bg-[#080808] px-3 py-2"
                                                        >
                                                            <div className="flex items-center gap-2.5 min-w-0">
                                                                <PlatformBadge platform={t.platform} />
                                                                <div className="min-w-0">
                                                                    <p className="truncate text-[13px] text-[#FAFAFA]">{t.title}</p>
                                                                    <p className="text-[11px] text-[#8E8E93]">{formatDeadline(t.deadline)}</p>
                                                                </div>
                                                            </div>
                                                            <StatusBadge status={getTaskStatus(t)} />
                                                        </div>
                                                    ))}
                                                </div>
                                            ))}

                                        {/* Actions */}
                                        {tab === 'pending' && !isActioning && (
                                            <div className="mt-4 flex gap-2">
                                                <button
                                                    onClick={() => onApprove(emp)}
                                                    className="flex flex-1 items-center justify-center gap-1.5 rounded-[6px] bg-[#10B981] px-3 py-2 text-[12px] font-semibold text-white transition-opacity hover:opacity-90"
                                                >
                                                    <Check className="w-3.5 h-3.5" /> Approve
                                                </button>
                                                <button
                                                    onClick={() => setActioning({ id: emp.user_id, type: 'deny' })}
                                                    className="flex flex-1 items-center justify-center gap-1.5 rounded-[6px] border border-[#262626] px-3 py-2 text-[12px] font-semibold text-[#ef4444] hover:bg-[#1a1a1a]"
                                                >
                                                    <X className="w-3.5 h-3.5" /> Deny
                                                </button>
                                            </div>
                                        )}

                                        {tab === 'approved' && !isActioning && (
                                            <button
                                                onClick={() => setActioning({ id: emp.user_id, type: 'remove' })}
                                                className="mt-4 flex items-center gap-1.5 text-[12px] font-medium text-[#ef4444] hover:underline"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" /> Remove employee
                                            </button>
                                        )}

                                        {isActioning && (
                                            <div className="mt-4 rounded-[6px] border border-[#262626] bg-[#080808] p-3">
                                                {actioning.type === 'deny' && (
                                                    <input
                                                        value={reason}
                                                        onChange={(e) => setReason(e.target.value)}
                                                        placeholder="Reason (optional)"
                                                        className="mb-3 w-full rounded-[6px] border border-[#262626] bg-[#080808] px-3 py-2 text-[13px] text-[#FAFAFA] [color-scheme:dark]"
                                                    />
                                                )}
                                                <p className="mb-3 text-[12px] text-[#FAFAFA]">
                                                    {actioning.type === 'deny'
                                                        ? 'Deny this access request? They can request again later.'
                                                        : 'Remove this employee? Their tasks stay as-is and they will lose access immediately.'}
                                                </p>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={confirm}
                                                        className={`flex-1 rounded-[6px] px-3 py-2 text-[12px] font-semibold text-white transition-opacity hover:opacity-90 ${actioning.type === 'deny' ? 'bg-[#ef4444]' : 'bg-[#ef4444]'
                                                            }`}
                                                    >
                                                        {actioning.type === 'deny' ? 'Deny access' : 'Remove employee'}
                                                    </button>
                                                    <button
                                                        onClick={cancelAction}
                                                        className="rounded-[6px] border border-[#262626] px-3 py-2 text-[12px] font-medium text-[#8E8E93] hover:text-[#FAFAFA]"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

function Meta({ label, value, mono }) {
    return (
        <div className="min-w-0">
            <p className="uppercase tracking-wide text-[#525252]">{label}</p>
            <p className={`truncate text-[#FAFAFA] ${mono ? 'font-mono text-[11px]' : ''}`}>{value}</p>
        </div>
    );
}

function fmt(iso) {
    try {
        return new Date(iso).toLocaleString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    } catch (e) {
        return iso;
    }
}