import React from 'react';
import { statusMeta } from '@/lib/status';

export default function StatusBadge({ status }) {
    const meta = statusMeta(status);
    return (
        <span className="inline-flex items-center gap-1.5 rounded-[6px] border border-[#262626] bg-[#121212] px-2 py-1 text-[11px] font-medium" style={{ color: meta.text }}>
            <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ backgroundColor: meta.dot }} />
            {meta.label}
        </span>
    );
}