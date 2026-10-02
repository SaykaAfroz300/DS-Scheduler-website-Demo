import React from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { relativeTime } from '@/lib/status';

export default function NotificationsPanel({ notifications, onMarkAllRead }) {
    const unread = notifications.filter((n) => !n.read).length;

    return (
        <div>
            <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-[#FAFAFA]" />
                    <h2 className="font-display text-[13px] font-semibold uppercase tracking-wide text-[#FAFAFA]">
                        Notifications
                    </h2>
                    {unread > 0 && (
                        <span className="rounded-full bg-[#FAFAFA] px-2 py-0.5 text-[10px] font-semibold text-[#080808]">
                            {unread}
                        </span>
                    )}
                </div>
                {unread > 0 && (
                    <button onClick={onMarkAllRead} className="flex items-center gap-1.5 text-[12px] font-medium text-[#8E8E93] hover:text-[#FAFAFA]">
                        <CheckCheck className="w-3.5 h-3.5" />
                        Mark all read
                    </button>
                )}
            </div>

            {notifications.length === 0 ? (
                <div className="rounded-[6px] border border-[#262626] bg-[#121212] p-8 text-center">
                    <Bell className="mx-auto w-5 h-5 text-[#525252]" />
                    <p className="mt-2 text-[13px] text-[#8E8E93]">You're all caught up.</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {notifications.map((n) => (
                        <div
                            key={n.id}
                            className={`rounded-[6px] border px-4 py-3 ${n.read ? 'border-[#262626] bg-[#080808]' : 'border-[#3a3a3a] bg-[#121212]'
                                }`}
                        >
                            <div className="flex items-start gap-2.5">
                                {!n.read && <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#FAFAFA]" />}
                                <div className="min-w-0 flex-1">
                                    <p className={`text-[13px] ${n.read ? 'text-[#8E8E93]' : 'text-[#FAFAFA]'}`}>{n.message}</p>
                                    <p className="mt-0.5 text-[11px] text-[#525252]">{relativeTime(n.created_date)}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}