import React, { useState } from 'react';
import { PLATFORMS } from '@/lib/status';
import { toDhakaISO } from '@/lib/datetime';
import DatePickerBD from './DatePickerBD';
import TimePickerBD from './TimePickerBD';

const inputClass =
    'w-full rounded-[6px] border border-[#262626] bg-[#080808] px-3 py-2.5 text-[14px] text-[#FAFAFA] placeholder:text-[#525252] focus:border-[#FAFAFA] focus:outline-none';
const labelClass = 'block text-[11px] font-medium uppercase tracking-wide text-[#8E8E93] mb-1.5';

const DEFAULT_TIME = { hour: 10, minute: 0 }; // 10:00 AM

const emptyForm = () => ({
    title: '',
    platform: 'youtube',
    content_type: 'video',
    deadline_date: '', // 'YYYY-MM-DD' (Bangladesh calendar day)
    deadline_time: { ...DEFAULT_TIME },
    assigned_to_id: '',
    google_drive_link: '',
    notes: '',
});

export default function CreateTaskForm({ users, onCreate }) {
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

    const submit = async (e) => {
        e.preventDefault();
        if (!form.title || !form.platform || !form.deadline_date || !form.assigned_to_id) {
            setError('Title, platform, deadline and assignee are required.');
            return;
        }
        setSaving(true);
        setError('');
        try {
            const { deadline_date, deadline_time, ...rest } = form;
            await onCreate({
                ...rest,
                // e.g. 2026-10-07T15:30:00+06:00 — always Bangladesh time
                deadline: toDhakaISO(deadline_date, deadline_time.hour, deadline_time.minute),
            });
            setForm(emptyForm());
        } catch (err) {
            setError('Could not create task. Try again.');
        } finally {
            setSaving(false);
        }
    };

    const employees = users.filter((u) => u.role !== 'admin');

    return (
        <form onSubmit={submit} className="rounded-[6px] border border-[#262626] bg-[#121212] p-4">
            <h2 className="font-display text-[13px] font-semibold uppercase tracking-wide text-[#FAFAFA]">
                Create Upload Task
            </h2>

            <div className="mt-4 space-y-3">
                <div>
                    <label className={labelClass}>Title</label>
                    <input
                        className={inputClass}
                        value={form.title}
                        onChange={(e) => set('title', e.target.value)}
                        placeholder="e.g. Drop the new single visualizer"
                    />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className={labelClass}>Platform</label>
                        <select className={inputClass} value={form.platform} onChange={(e) => set('platform', e.target.value)}>
                            {PLATFORMS.map((p) => (
                                <option key={p.id} value={p.id} className="bg-[#080808]">
                                    {p.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className={labelClass}>Content</label>
                        <select className={inputClass} value={form.content_type} onChange={(e) => set('content_type', e.target.value)}>
                            <option value="video" className="bg-[#080808]">Video</option>
                            <option value="static" className="bg-[#080808]">Static</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label htmlFor="task-deadline-date" className={labelClass}>Deadline (dd/mm/yyyy)</label>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1.2fr]">
                        <DatePickerBD
                            id="task-deadline-date"
                            value={form.deadline_date}
                            onChange={(v) => set('deadline_date', v)}
                        />
                        <TimePickerBD
                            idPrefix="task-deadline"
                            value={form.deadline_time}
                            onChange={(v) => set('deadline_time', v)}
                        />
                    </div>
                </div>

                <div>
                    <label className={labelClass}>Assign To</label>
                    <select className={inputClass} value={form.assigned_to_id} onChange={(e) => set('assigned_to_id', e.target.value)}>
                        <option value="" className="bg-[#080808]">Select employee</option>
                        {employees.map((u) => (
                            <option key={u.id} value={u.id} className="bg-[#080808]">
                                {u.full_name || u.email}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className={labelClass}>Drive Link (optional)</label>
                    <input
                        className={inputClass}
                        value={form.google_drive_link}
                        onChange={(e) => set('google_drive_link', e.target.value)}
                        placeholder="https://drive.google.com/..."
                    />
                </div>

                <div>
                    <label className={labelClass}>Notes (optional)</label>
                    <textarea
                        className={`${inputClass} resize-none`}
                        rows={2}
                        value={form.notes}
                        onChange={(e) => set('notes', e.target.value)}
                        placeholder="Captions, hashtags, timing…"
                    />
                </div>
            </div>

            {error && <p className="mt-3 text-[12px] text-[#ef4444]">{error}</p>}

            <button
                type="submit"
                disabled={saving}
                className="mt-4 w-full rounded-[6px] bg-[#FAFAFA] px-4 py-2.5 font-display text-[13px] font-semibold text-[#080808] transition-opacity hover:opacity-90 disabled:opacity-50"
            >
                {saving ? 'Creating…' : 'Assign Task'}
            </button>
        </form>
    );
}