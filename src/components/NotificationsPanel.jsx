import React from 'react';
import { Bell, CheckCheck, Clock, Check, X, UserCheck } from 'lucide-react';
import { relativeTime } from '@/lib/status';
import { formatDateTimeBD } from '@/lib/datetime';

export default function NotificationsPanel({
    notifications = [],
    onMarkAllRead,
    isAdmin = false,
    accessRecords = [],
    onApprove,
    onDeny,
    onGoToTeam,
}) {
    const unread = notifications.filter((n) => !n.read).length;
    const pendingEmployees = isAdmin ? (accessRecords || []).filter((r) => r.status === 'pending') : [];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <Bell className="w-4 h-4 text-[#FFFFFF]" />
                    <h2 className="font-display text-[14px] font-semibold uppercase tracking-wider text-[#FFFFFF]">
                        Alerts & Notifications
                    </h2>
                    {(unread > 0 || pendingEmployees.length > 0) && (
                        <span className="rounded-full bg-[#FFFFFF] px-2 py-0.5 text-[10px] font-bold text-[#080808]">
                            {unread + pendingEmployees.length}
                        </span>
                    )}
                </div>
                {unread > 0 && (
                    <button
                        onClick={onMarkAllRead}
                        className="flex items-center gap-1.5 text-[12px] font-medium text-[#C4C4C4] transition-colors hover:text-[#FFFFFF]"
                    >
                        <CheckCheck className="w-3.5 h-3.5" />
                        Mark all read
                    </button>
                )}
            </div>

            {/* Pending Employee Requests Section for Admin */}
            {isAdmin && pendingEmployees.length > 0 && (
                <div className="rounded-[8px] border border-[#F59E0B]/50 bg-[#141414] p-4 shadow-sm">
                    <div className="mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-[#F59E0B]" />
                            <h3 className="font-display text-[13px] font-semibold uppercase tracking-wide text-[#FFFFFF]">
                                Employee Approval Requests ({pendingEmployees.length})
                            </h3>
                        </div>
                        {onGoToTeam && (
                            <button
                                onClick={onGoToTeam}
                                className="text-[11px] font-medium text-[#C4C4C4] underline underline-offset-4 hover:text-[#FFFFFF]"
                            >
                                View in Team Roster →
                            </button>
                        )}
                    </div>
                    <p className="mb-3 text-[12px] text-[#C4C4C4]">
                        The following employees signed up and are waiting for your approval to access the scheduler:
                    </p>
                    <div className="space-y-2.5">
                        {pendingEmployees.map((emp) => {
                            const empId = emp.user_id || emp.id;
                            return (
                                <div
                                    key={empId}
                                    className="flex flex-col gap-3 rounded-[6px] border border-[#333333] bg-[#080808] p-3 sm:flex-row sm:items-center sm:justify-between"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[6px] border border-[#333333] bg-[#141414] text-[12px] font-bold text-[#FFFFFF]">
                                            {(emp.full_name || emp.email || '?').slice(0, 1).toUpperCase()}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="truncate text-[13px] font-semibold text-[#FFFFFF]">
                                                {emp.full_name || 'New Employee'}
                                            </p>
                                            <p className="truncate text-[12px] text-[#C4C4C4]">
                                                {emp.email}
                                            </p>
                                            <p className="text-[10px] text-[#A3A3A3]">
                                                Requested: {emp.requested_at ? formatDateTimeBD(emp.requested_at) : 'Pending'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        {onApprove && (
                                            <button
                                                onClick={() => onApprove(emp)}
                                                className="flex items-center gap-1.5 rounded-[6px] bg-[#10B981] px-3 py-1.5 text-[11px] font-semibold text-white transition-opacity hover:opacity-90"
                                            >
                                                <Check className="w-3.5 h-3.5" />
                                                Approve
                                            </button>
                                        )}
                                        {onDeny && (
                                            <button
                                                onClick={() => onDeny(emp, 'Denied by administrator')}
                                                className="flex items-center gap-1.5 rounded-[6px] border border-[#333333] px-3 py-1.5 text-[11px] font-semibold text-[#ef4444] transition-colors hover:border-[#ef4444] hover:bg-[#1F1F1F]"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                                Deny
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Notification List */}
            {notifications.length === 0 ? (
                <div className="rounded-[6px] border border-[#333333] bg-[#141414] p-10 text-center">
                    <Bell className="mx-auto w-5 h-5 text-[#A3A3A3]" />
                    <p className="mt-2 text-[13px] text-[#C4C4C4]">You're all caught up.</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {notifications.map((n) => {
                        const isAccessReq = n.type === 'access_requested';
                        return (
                            <div
                                key={n.id}
                                className={`rounded-[6px] border px-4 py-3 transition-colors ${
                                    n.read
                                        ? 'border-[#333333] bg-[#080808]'
                                        : 'border-[#484848] bg-[#141414]'
                                }`}
                            >
                                <div className="flex items-start gap-3">
                                    {!n.read && (
                                        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#FFFFFF]" />
                                    )}
                                    <div className="min-w-0 flex-1">
                                        {isAccessReq && (
                                            <span className="mb-1 inline-flex items-center gap-1 rounded bg-[#F59E0B]/20 px-1.5 py-0.5 text-[10px] font-semibold text-[#F59E0B]">
                                                <UserCheck className="w-3 h-3" />
                                                Access Request
                                            </span>
                                        )}
                                        <p
                                            className={`text-[13px] leading-snug ${
                                                n.read ? 'text-[#C4C4C4]' : 'text-[#FFFFFF] font-medium'
                                            }`}
                                        >
                                            {n.message}
                                        </p>
                                        <p className="mt-1 text-[11px] text-[#A3A3A3]">
                                            {relativeTime(n.created_date)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}