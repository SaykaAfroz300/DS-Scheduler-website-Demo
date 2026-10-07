'use client';

import React from 'react';
import { CalendarDays, ListTodo, Palmtree, Bell, LogOut, Users, MessageCircle } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';

const NAV = [
    { id: 'calendar', label: 'Calendar', icon: CalendarDays },
    { id: 'tasks', label: 'Tasks', icon: ListTodo },
    { id: 'team', label: 'Team', icon: Users, adminOnly: true },
    { id: 'leave', label: 'Leave', icon: Palmtree },
    { id: 'messages', label: 'Messages', icon: MessageCircle },
    { id: 'notifications', label: 'Alerts', icon: Bell },
];

export default function Layout({ view, setView, unreadCount, chatUnreadCount, isAdmin, children }) {
    const isMobile = useIsMobile();
    const { user, logout } = useAuth();
    const nav = isAdmin ? NAV : NAV.filter((n) => !n.adminOnly);

    if (isMobile) {
        return (
            <div className="flex min-h-screen flex-col bg-[#080808]">
                <header className="flex items-center justify-between border-b border-[#262626] px-4 py-3">
                    <div className="flex items-center gap-3">
                        <img src="/logo.jpeg" alt="Dhaka Sessions Logo" className="h-10 w-auto object-contain" />
                        <h1 className="font-display text-[13px] font-bold tracking-[0.2em] text-[#FAFAFA]">DHAKA SESSIONS</h1>
                    </div>
                    <button
                        onClick={() => logout()}
                        className="flex items-center gap-1.5 text-[#8E8E93] hover:text-[#FAFAFA]"
                        title="Sign out"
                    >
                        <LogOut className="w-4 h-4" />
                    </button>
                </header>
                <main className="flex-1 overflow-y-auto pb-20">{children}</main>
                <nav className="fixed bottom-0 left-0 right-0 z-30 flex border-t border-[#262626] bg-[#080808]/95 backdrop-blur">
                    {nav.map((item) => {
                        const Icon = item.icon;
                        const active = view === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => setView(item.id)}
                                className={`relative flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-colors ${active ? 'text-[#FAFAFA]' : 'text-[#525252]'
                                    }`}
                            >
                                <Icon className="w-5 h-5" />
                                {item.label}
                                {item.id === 'notifications' && unreadCount > 0 && (
                                    <span className="absolute right-[22%] top-1.5 h-1.5 w-1.5 rounded-full bg-[#F59E0B]" />
                                )}
                                {item.id === 'messages' && chatUnreadCount > 0 && (
                                    <span className="absolute right-[22%] top-1.5 h-1.5 w-1.5 rounded-full bg-[#ef4444]" />
                                )}
                                {active && <span className="absolute inset-x-0 top-0 h-0.5 bg-[#FAFAFA]" />}
                            </button>
                        );
                    })}
                </nav>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-[#080808]">
            <aside className="sticky top-0 flex h-screen w-60 shrink-0 flex-col border-r border-[#262626]">
                <div className="px-5 py-6">
                    <div className="flex flex-col gap-4">
                        <img src="/logo.jpeg" alt="Dhaka Sessions Logo" className="h-20 w-auto object-contain self-start" />
                        <div>
                            <h1 className="font-display text-[15px] font-bold tracking-[0.2em] text-[#FAFAFA]">DHAKA SESSIONS</h1>
                            <p className="mt-0.5 text-[10px] uppercase tracking-[0.25em] text-[#525252]">Scheduler</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 space-y-1 px-3">
                    {nav.map((item) => {
                        const Icon = item.icon;
                        const active = view === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => setView(item.id)}
                                className={`flex w-full items-center gap-3 rounded-[6px] px-3 py-2.5 text-[13px] font-medium transition-colors ${active ? 'bg-[#121212] text-[#FAFAFA]' : 'text-[#8E8E93] hover:bg-[#121212] hover:text-[#FAFAFA]'
                                    }`}
                            >
                                <Icon className="w-4 h-4" />
                                {item.label}
                                {item.id === 'notifications' && unreadCount > 0 && (
                                    <span className="ml-auto rounded-full bg-[#FAFAFA] px-1.5 py-0.5 text-[10px] font-semibold text-[#080808]">
                                        {unreadCount}
                                    </span>
                                )}
                                {item.id === 'messages' && chatUnreadCount > 0 && (
                                    <span className="ml-auto rounded-full bg-[#ef4444] px-1.5 py-0.5 text-[10px] font-bold text-white">
                                        {chatUnreadCount}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </nav>

                <div className="border-t border-[#262626] p-4">
                    <div className="mb-3 min-w-0">
                        <p className="truncate text-[13px] font-medium text-[#FAFAFA]">{user?.full_name || user?.email || 'User'}</p>
                        <p className="text-[11px] uppercase tracking-wide text-[#525252]">{user?.role || 'user'}</p>
                    </div>
                    <button
                        onClick={() => logout()}
                        className="flex w-full items-center gap-2 rounded-[6px] border border-[#262626] px-3 py-2 text-[12px] font-medium text-[#8E8E93] transition-colors hover:border-[#3a3a3a] hover:text-[#FAFAFA]"
                    >
                        <LogOut className="w-3.5 h-3.5" />
                        Sign out
                    </button>
                </div>
            </aside>

            <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
    );
}