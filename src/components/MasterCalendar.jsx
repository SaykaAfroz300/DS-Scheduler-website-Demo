import React, { useState } from 'react';
import { Trash2, ChevronLeft, ChevronRight, X, Calendar as CalendarIcon, List } from 'lucide-react';
import PlatformBadge from './PlatformBadge';
import StatusBadge from './StatusBadge';
import { getTaskStatus, groupByDate, formatDeadline, PLATFORMS } from '@/lib/status';
import { dayHeaderFromKey } from '@/lib/datetime';
import { 
    startOfMonth, endOfMonth, startOfWeek, endOfWeek, 
    eachDayOfInterval, format, isSameMonth, isToday, 
    addMonths, subMonths, addWeeks, subWeeks 
} from 'date-fns';

export default function MasterCalendar({ tasks, user, isAdmin, onComplete, onDelete }) {
    const [filter, setFilter] = useState('all');
    const [viewMode, setViewMode] = useState('month'); // 'month', 'week', 'agenda'
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedTask, setSelectedTask] = useState(null);

    const filtered = tasks.filter((t) => {
        if (filter === 'all') return true;
        if (filter === 'mine') return t.assigned_to_id === user?.id;
        return t.platform === filter;
    });

    // Calendar Grid Logic
    const startDate = viewMode === 'month' 
        ? startOfWeek(startOfMonth(currentDate), { weekStartsOn: 6 }) // Saturday start
        : startOfWeek(currentDate, { weekStartsOn: 6 });
        
    const endDate = viewMode === 'month'
        ? endOfWeek(endOfMonth(currentDate), { weekStartsOn: 6 })
        : endOfWeek(currentDate, { weekStartsOn: 6 });
        
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    
    const taskMap = {};
    filtered.forEach(t => {
        const d = new Date(t.deadline);
        const key = format(d, 'yyyy-MM-dd');
        if (!taskMap[key]) taskMap[key] = [];
        taskMap[key].push(t);
    });

    const handlePrev = () => setCurrentDate(prev => viewMode === 'month' ? subMonths(prev, 1) : subWeeks(prev, 1));
    const handleNext = () => setCurrentDate(prev => viewMode === 'month' ? addMonths(prev, 1) : addWeeks(prev, 1));
    const handleToday = () => setCurrentDate(new Date());

    // Agenda Logic
    const groups = groupByDate(filtered);

    return (
        <div className="rounded-[8px] border border-[#262626] bg-[#080808] flex flex-col h-[85vh] min-h-[600px] relative">
            {/* Top Filters & Stats */}
            <div className="border-b border-[#262626]">
                <div className="flex flex-wrap items-center gap-1.5 p-3 border-b border-[#1a1a1a]">
                    <FilterChip active={filter === 'all'} onClick={() => setFilter('all')}>All</FilterChip>
                    {isAdmin && (
                        <FilterChip active={filter === 'mine'} onClick={() => setFilter('mine')}>Mine</FilterChip>
                    )}
                    {PLATFORMS.map((p) => (
                        <FilterChip key={p.id} active={filter === p.id} onClick={() => setFilter(p.id)}>
                            {p.label}
                        </FilterChip>
                    ))}
                </div>
                <div className="bg-[#121212] p-3 flex flex-wrap items-center justify-between text-[11px] text-[#8E8E93]">
                    <div className="flex gap-4">
                        <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-[#FAFAFA]"></span>
                            <strong>{filtered.length}</strong> Total
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-[#F59E0B]"></span>
                            <strong>{filtered.filter(t => t.status !== 'completed').length}</strong> Pending
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-[#10B981]"></span>
                            <strong>{filtered.filter(t => t.status === 'completed').length}</strong> Completed
                        </div>
                    </div>
                </div>
            </div>

            {/* Calendar Controls */}
            <div className="flex items-center justify-between p-4 border-b border-[#262626]">
                <div className="flex items-center gap-4">
                    <h2 className="text-xl font-display font-bold text-[#FAFAFA] w-40">
                        {format(currentDate, viewMode === 'month' ? 'MMMM yyyy' : 'MMM yyyy')}
                    </h2>
                    <div className="flex items-center gap-1">
                        <button onClick={handlePrev} className="p-1.5 hover:bg-[#1a1a1a] rounded text-[#FAFAFA] transition-colors"><ChevronLeft className="w-4 h-4"/></button>
                        <button onClick={handleToday} className="px-3 py-1 text-xs font-medium hover:bg-[#1a1a1a] rounded border border-[#262626] text-[#FAFAFA] transition-colors">Today</button>
                        <button onClick={handleNext} className="p-1.5 hover:bg-[#1a1a1a] rounded text-[#FAFAFA] transition-colors"><ChevronRight className="w-4 h-4"/></button>
                    </div>
                </div>
                <div className="flex bg-[#121212] p-1 rounded-[6px] border border-[#262626]">
                    <button onClick={() => setViewMode('month')} className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-[4px] transition-colors ${viewMode === 'month' ? 'bg-[#262626] text-[#FAFAFA]' : 'text-[#8E8E93] hover:text-[#FAFAFA]'}`}><CalendarIcon className="w-3.5 h-3.5"/> Month</button>
                    <button onClick={() => setViewMode('week')} className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-[4px] transition-colors ${viewMode === 'week' ? 'bg-[#262626] text-[#FAFAFA]' : 'text-[#8E8E93] hover:text-[#FAFAFA]'}`}><CalendarIcon className="w-3.5 h-3.5"/> Week</button>
                    <button onClick={() => setViewMode('agenda')} className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-[4px] transition-colors ${viewMode === 'agenda' ? 'bg-[#262626] text-[#FAFAFA]' : 'text-[#8E8E93] hover:text-[#FAFAFA]'}`}><List className="w-3.5 h-3.5"/> Agenda</button>
                </div>
            </div>

            {/* View Content */}
            <div className="flex-1 overflow-hidden flex flex-col">
                {viewMode === 'agenda' ? (
                    <div className="flex-1 overflow-y-auto divide-y divide-[#1a1a1a]">
                        {groups.length === 0 ? (
                            <div className="p-10 text-center text-[13px] text-[#8E8E93]">No tasks scheduled.</div>
                        ) : (
                            groups.map(([dateStr, dayTasks]) => {
                                const h = dayHeaderFromKey(dateStr);
                                const completedCount = dayTasks.filter(t => t.status === 'completed').length;
                                const pendingCount = dayTasks.length - completedCount;
                                return (
                                    <div key={dateStr} className="flex gap-4 p-4">
                                        <div className="w-16 shrink-0 text-right">
                                            <p className={`font-display text-[11px] uppercase tracking-wide ${h.isToday ? 'text-[#FAFAFA]' : 'text-[#525252]'}`}>{h.day}</p>
                                            <p className={`font-display text-2xl font-semibold leading-none ${h.isToday ? 'text-[#FAFAFA]' : 'text-[#8E8E93]'}`}>{h.date}</p>
                                            <p className="text-[10px] text-[#525252] mb-3">{h.month}</p>
                                            <div className="flex flex-col items-end gap-1 text-[9px] uppercase tracking-wider font-semibold">
                                                <span className="bg-[#262626] text-[#FAFAFA] px-1.5 py-0.5 rounded-[4px]">{dayTasks.length} Total</span>
                                                {pendingCount > 0 && <span className="bg-[#1a1a1a] text-[#F59E0B] px-1.5 py-0.5 rounded-[4px] border border-[#262626]">{pendingCount} Pend</span>}
                                                {completedCount > 0 && <span className="bg-[#1a1a1a] text-[#10B981] px-1.5 py-0.5 rounded-[4px] border border-[#262626]">{completedCount} Done</span>}
                                            </div>
                                        </div>
                                        <div className="flex-1 space-y-2">
                                            {dayTasks.map((t) => (
                                                <AgendaTaskCard key={t.id} t={t} isAdmin={isAdmin} user={user} onComplete={onComplete} onDelete={onDelete} />
                                            ))}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col">
                        <div className="grid grid-cols-7 border-b border-[#262626] bg-[#0a0a0a]">
                            {['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map(day => (
                                <div key={day} className="py-2 text-center text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider border-r border-[#262626] last:border-r-0">
                                    {day}
                                </div>
                            ))}
                        </div>
                        <div className={`flex-1 grid grid-cols-7 overflow-y-auto ${viewMode === 'month' ? 'auto-rows-fr' : 'auto-rows-[1fr]'}`}>
                            {days.map((day, i) => {
                                const key = format(day, 'yyyy-MM-dd');
                                const dayTasks = taskMap[key] || [];
                                const isCurrMonth = isSameMonth(day, currentDate);
                                const isCurrDay = isToday(day);
                                
                                return (
                                    <div key={key} className={`border-b border-r border-[#262626] p-1.5 flex flex-col gap-1 min-h-[120px] ${!isCurrMonth ? 'bg-[#0a0a0a] opacity-60' : 'bg-[#080808]'} ${isCurrDay ? 'bg-[#121212]' : ''}`}>
                                        <div className="flex justify-between items-start px-1 mb-1">
                                            <span className={`text-[12px] font-medium w-6 h-6 flex items-center justify-center rounded-full ${isCurrDay ? 'bg-[#FAFAFA] text-[#080808]' : 'text-[#8E8E93]'}`}>{format(day, 'd')}</span>
                                            {dayTasks.length > 0 && <span className="text-[9px] font-medium text-[#525252] mt-1">{dayTasks.length} tasks</span>}
                                        </div>
                                        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1" style={{ scrollbarWidth: 'thin' }}>
                                            {dayTasks.map(t => {
                                                const statusColor = t.status === 'completed' ? 'border-[#10B981]/40 bg-[#10B981]/10 text-[#10B981]' : t.status === 'in_progress' ? 'border-[#3B82F6]/40 bg-[#3B82F6]/10 text-[#3B82F6]' : 'border-[#F59E0B]/40 bg-[#F59E0B]/10 text-[#F59E0B]';
                                                return (
                                                    <button 
                                                        key={t.id} 
                                                        onClick={() => setSelectedTask(t)}
                                                        className={`w-full text-left px-1.5 py-1 rounded-[4px] text-[10px] leading-tight border transition-colors hover:brightness-125 ${statusColor}`}
                                                    >
                                                        <span className="font-bold opacity-80">{t.platform.slice(0,2).toUpperCase()}</span>
                                                        <span className="ml-1 opacity-90 truncate block">{t.title}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Task Details Modal */}
            {selectedTask && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-md bg-[#121212] border border-[#262626] rounded-[12px] shadow-2xl overflow-hidden flex flex-col">
                        <div className="flex items-center justify-between border-b border-[#262626] p-4">
                            <h3 className="font-display font-semibold text-[#FAFAFA]">Task Details</h3>
                            <button onClick={() => setSelectedTask(null)} className="text-[#8E8E93] hover:text-[#FAFAFA]"><X className="w-5 h-5"/></button>
                        </div>
                        <div className="p-4 overflow-y-auto space-y-4">
                            <AgendaTaskCard t={selectedTask} isAdmin={isAdmin} user={user} onComplete={(t) => { onComplete(t); setSelectedTask(null); }} onDelete={(t) => { onDelete(t); setSelectedTask(null); }} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function AgendaTaskCard({ t, isAdmin, user, onComplete, onDelete }) {
    const status = getTaskStatus(t);
    return (
        <div className="flex items-center justify-between gap-3 rounded-[6px] border border-[#262626] bg-[#121212] px-3 py-2.5">
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