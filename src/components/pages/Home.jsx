'use client';

import React, { useMemo, useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useStudioData } from '@/hooks/useStudioData';
import Layout from '@/components/Layout';
import AccessGate from '@/components/AccessGate';
import MasterCalendar from '@/components/MasterCalendar';
import CreateTaskForm from '@/components/CreateTaskForm';
import UrgentDeadlinesStack from '@/components/UrgentDeadlinesStack';
import TaskCard from '@/components/TaskCard';
import LeavePanel from '@/components/LeavePanel';
import EmployeeRoster from '@/components/EmployeeRoster';
import NotificationsPanel from '@/components/NotificationsPanel';

export default function Home() {
    const { user, logout } = useAuth();
    const {
        tasks,
        users,
        notifications,
        leaveRequests,
        loading,
        isAdmin,
        accessStatus,
        accessRecords,
        createTask,
        completeTask,
        submitLeave,
        respondLeave,
        markAllRead,
        deleteTask,
        removeEmployee,
        approveEmployee,
        denyEmployee,
        requestAccess,
    } = useStudioData(user);

    const [view, setView] = useState('calendar');

    const myTasks = useMemo(
        () => tasks.filter((t) => t.assigned_to_id === user?.id),
        [tasks, user]
    );
    const unreadCount = notifications.filter((n) => !n.read).length;
    const pendingCount = tasks.filter((t) => t.status !== 'completed').length;

    const visibleTasks = isAdmin ? tasks : myTasks;

    const greeting = (() => {
        const h = new Date().getHours();
        if (h < 12) return 'Good morning';
        if (h < 18) return 'Good afternoon';
        return 'Good evening';
    })();

    // Still resolving approval status
    if (!accessStatus) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#080808]">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#262626] border-t-[#FAFAFA]" />
            </div>
        );
    }

    // Pending / denied / removed employees never reach protected data.
    if (accessStatus !== 'admin' && accessStatus !== 'approved') {
        return <AccessGate status={accessStatus} onRequest={requestAccess} onLogout={() => logout()} />;
    }

    return (
        <Layout view={view} setView={setView} unreadCount={unreadCount} isAdmin={isAdmin}>
            <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-8 sm:py-10">
                {/* Hero header */}
                <header className="mb-8">
                    <p className="text-[11px] uppercase tracking-[0.25em] text-[#525252]">
                        {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                    </p>
                    <h1 className="header-clamp font-display font-bold text-[#FAFAFA]">
                        {greeting}
                    </h1>
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                        <Stat label="Pending tasks" value={pendingCount} />
                        <Stat label={isAdmin ? 'Total assigned' : 'My tasks'} value={visibleTasks.length} />
                        <Stat label="Unread alerts" value={unreadCount} accent={unreadCount > 0} />
                    </div>
                </header>

                {loading ? (
                    <div className="flex h-64 items-center justify-center">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#262626] border-t-[#FAFAFA]" />
                    </div>
                ) : view === 'calendar' ? (
                    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
                        <div>
                            <SectionTitle>Master Calendar</SectionTitle>
                            <MasterCalendar tasks={visibleTasks} user={user} isAdmin={isAdmin} onComplete={completeTask} onDelete={deleteTask} />
                        </div>
                        <div className="space-y-4">
                            {isAdmin && <CreateTaskForm users={users} onCreate={createTask} />}
                            <UrgentDeadlinesStack tasks={visibleTasks} />
                        </div>
                    </div>
                ) : view === 'tasks' ? (
                    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
                        <div>
                            <SectionTitle>{isAdmin ? 'All Tasks' : 'My Tasks'}</SectionTitle>
                            {visibleTasks.length === 0 ? (
                                <EmptyState message="No tasks assigned to you yet." />
                            ) : (
                                <div className="grid gap-3 sm:grid-cols-2">
                                    {visibleTasks
                                        .slice()
                                        .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
                                        .map((t) => (
                                            <TaskCard key={t.id} task={t} user={user} isAdmin={isAdmin} onComplete={completeTask} onDelete={deleteTask} />
                                        ))}
                                </div>
                            )}
                        </div>
                        <div className="space-y-4">
                            <UrgentDeadlinesStack tasks={visibleTasks} />
                        </div>
                    </div>
                ) : view === 'team' ? (
                    isAdmin ? (
                        <div>
                            <SectionTitle>Team & Access</SectionTitle>
                            <EmployeeRoster
                                records={accessRecords}
                                tasks={tasks}
                                onApprove={approveEmployee}
                                onDeny={denyEmployee}
                                onRemove={removeEmployee}
                            />
                        </div>
                    ) : (
                        <EmptyState message="Admins only." />
                    )
                ) : view === 'leave' ? (
                    <LeavePanel isAdmin={isAdmin} leaveRequests={leaveRequests} onSubmit={submitLeave} onRespond={respondLeave} />
                ) : (
                    <NotificationsPanel notifications={notifications} onMarkAllRead={markAllRead} />
                )}
            </div>
        </Layout>
    );
}

function Stat({ label, value, accent }) {
    return (
        <div className="rounded-[6px] border border-[#262626] bg-[#121212] px-4 py-2.5">
            <p className="font-display text-2xl font-bold leading-none text-[#FAFAFA]" style={accent ? { color: '#F59E0B' } : undefined}>
                {value}
            </p>
            <p className="mt-1 text-[11px] uppercase tracking-wide text-[#525252]">{label}</p>
        </div>
    );
}

function SectionTitle({ children }) {
    return (
        <h2 className="mb-4 font-display text-[13px] font-semibold uppercase tracking-[0.15em] text-[#8E8E93]">
            {children}
        </h2>
    );
}

function EmptyState({ message }) {
    return (
        <div className="rounded-[6px] border border-[#262626] bg-[#121212] p-10 text-center">
            <p className="text-[13px] text-[#8E8E93]">{message}</p>
        </div>
    );
}
