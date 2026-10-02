export const PLATFORMS = [
    { id: 'youtube', label: 'YouTube', initial: 'YT' },
    { id: 'spotify', label: 'Spotify', initial: 'SP' },
    { id: 'instagram', label: 'Instagram', initial: 'IG' },
    { id: 'snapchat', label: 'Snapchat', initial: 'SC' },
    { id: 'facebook', label: 'Facebook', initial: 'FB' },
];

export const platformMeta = (id) =>
    PLATFORMS.find((p) => p.id === id) || { id, label: id, initial: (id || '?').slice(0, 2).toUpperCase() };

export function getTaskStatus(task, now = new Date()) {
    if (task.status === 'completed') return 'completed';
    if (!task.deadline) return 'pending';
    const deadline = new Date(task.deadline);
    if (deadline < now) return 'overdue';
    const diff = deadline.getTime() - now.getTime();
    if (diff <= 48 * 3600 * 1000) return 'approaching';
    return 'pending';
}

export const STATUS_META = {
    pending: { label: 'Pending', dot: '#525252', text: '#8E8E93' },
    approaching: { label: 'Due Soon', dot: '#F59E0B', text: '#F59E0B' },
    overdue: { label: 'Overdue', dot: '#ef4444', text: '#ef4444' },
    completed: { label: 'Completed', dot: '#10B981', text: '#10B981' },
};

export function statusMeta(status) {
    return STATUS_META[status] || STATUS_META.pending;
}

export function formatDeadline(deadline) {
    if (!deadline) return '—';
    const d = new Date(deadline);
    return d.toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
}

export function formatDate(date) {
    if (!date) return '—';
    return new Date(date).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

export function relativeTime(date) {
    if (!date) return '';
    const d = new Date(date);
    const diff = d.getTime() - Date.now();
    const abs = Math.abs(diff);
    const day = 86400000;
    const hr = 3600000;
    const min = 60000;
    let str;
    if (abs >= day) str = `${Math.round(abs / day)}d`;
    else if (abs >= hr) str = `${Math.round(abs / hr)}h`;
    else str = `${Math.round(abs / min)}m`;
    return diff < 0 ? `${str} ago` : `in ${str}`;
}

export function groupByDate(tasks) {
    const groups = {};
    tasks.forEach((t) => {
        const key = new Date(t.deadline).toDateString();
        if (!groups[key]) groups[key] = [];
        groups[key].push(t);
    });
    return Object.entries(groups).sort(
        (a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime()
    );
}