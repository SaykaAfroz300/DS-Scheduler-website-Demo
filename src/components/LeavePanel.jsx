import React, { useState } from 'react';
import { Check, X, CalendarPlus, Plane } from 'lucide-react';
import { formatDate } from '@/lib/status';
import DatePickerBD from './DatePickerBD';

const inputClass =
    'w-full rounded-[6px] border border-[#262626] bg-[#080808] px-3 py-2.5 text-[14px] text-[#FAFAFA] placeholder:text-[#525252] focus:border-[#FAFAFA] focus:outline-none';
const labelClass = 'block text-[11px] font-medium uppercase tracking-wide text-[#8E8E93] mb-1.5';

export default function LeavePanel({ isAdmin, leaveRequests, onSubmit, onRespond }) {
    return (
        <div className="grid gap-4 lg:grid-cols-[1fr_1.4fr]">
            {!isAdmin && <LeaveForm onSubmit={onSubmit} />}
            <div className={isAdmin ? 'lg:col-span-2' : ''}>
                <h2 className="mb-3 font-display text-[13px] font-semibold uppercase tracking-wide text-[#FAFAFA]">
                    {isAdmin ? 'All Leave Requests' : 'My Leave Requests'}
                </h2>
                {leaveRequests.length === 0 ? (
                    <div className="rounded-[6px] border border-[#262626] bg-[#121212] p-8 text-center">
                        <Plane className="mx-auto w-5 h-5 text-[#525252]" />
                        <p className="mt-2 text-[13px] text-[#8E8E93]">No leave requests.</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {leaveRequests.map((r) => (
                            <LeaveRow key={r.id} req={r} isAdmin={isAdmin} onRespond={onRespond} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function LeaveForm({ onSubmit }) {
    const [form, setForm] = useState({ start_date: '', end_date: '', reason: '' });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

    const submit = async (e) => {
        e.preventDefault();
        if (!form.start_date || !form.end_date || !form.reason) {
            setError('All fields are required.');
            return;
        }
        setSaving(true);
        setError('');
        try {
            await onSubmit(form);
            setForm({ start_date: '', end_date: '', reason: '' });
        } catch {
            setError('Could not submit request.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <form onSubmit={submit} className="rounded-[6px] border border-[#262626] bg-[#121212] p-4">
            <div className="flex items-center gap-2">
                <CalendarPlus className="w-4 h-4 text-[#FAFAFA]" />
                <h2 className="font-display text-[13px] font-semibold uppercase tracking-wide text-[#FAFAFA]">
                    Request Leave
                </h2>
            </div>
            <div className="mt-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label htmlFor="leave-start-date" className={labelClass}>From</label>
                        <DatePickerBD id="leave-start-date" value={form.start_date} onChange={(v) => set('start_date', v)} />
                    </div>
                    <div>
                        <label htmlFor="leave-end-date" className={labelClass}>To</label>
                        <DatePickerBD id="leave-end-date" value={form.end_date} onChange={(v) => set('end_date', v)} />
                    </div>
                </div>
                <div>
                    <label className={labelClass}>Reason</label>
                    <textarea className={`${inputClass} resize-none`} rows={2} value={form.reason} onChange={(e) => set('reason', e.target.value)} placeholder="Brief reason…" />
                </div>
            </div>
            {error && <p className="mt-3 text-[12px] text-[#ef4444]">{error}</p>}
            <button type="submit" disabled={saving} className="mt-4 w-full rounded-[6px] bg-[#FAFAFA] px-4 py-2.5 font-display text-[13px] font-semibold text-[#080808] transition-opacity hover:opacity-90 disabled:opacity-50">
                {saving ? 'Submitting…' : 'Submit Request'}
            </button>
        </form>
    );
}

function LeaveRow({ req, isAdmin, onRespond }) {
    const statusColor =
        req.status === 'approved' ? '#10B981' : req.status === 'rejected' ? '#ef4444' : '#F59E0B';
    return (
        <div className="flex flex-col gap-3 rounded-[6px] border border-[#262626] bg-[#121212] p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
                <div className="flex items-center gap-2">
                    <p className="font-display text-[14px] font-semibold text-[#FAFAFA]">
                        {isAdmin ? req.user_name : 'You'}
                    </p>
                    <span className="text-[11px] uppercase tracking-wide text-[#8E8E93]">
                        {formatDate(req.start_date)} → {formatDate(req.end_date)}
                    </span>
                </div>
                {req.reason && <p className="mt-1 text-[12px] text-[#8E8E93]">{req.reason}</p>}
            </div>
            <div className="flex items-center gap-2 shrink-0">
                <span className="inline-flex items-center gap-1.5 rounded-[6px] border border-[#262626] bg-[#080808] px-2 py-1 text-[11px] font-medium capitalize" style={{ color: statusColor }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: statusColor }} />
                    {req.status}
                </span>
                {isAdmin && req.status === 'pending' && (
                    <>
                        <button onClick={() => onRespond(req, 'approved')} className="flex h-8 w-8 items-center justify-center rounded-[6px] border border-[#262626] text-[#10B981] hover:border-[#10B981]">
                            <Check className="w-4 h-4" />
                        </button>
                        <button onClick={() => onRespond(req, 'rejected')} className="flex h-8 w-8 items-center justify-center rounded-[6px] border border-[#262626] text-[#ef4444] hover:border-[#ef4444]">
                            <X className="w-4 h-4" />
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}