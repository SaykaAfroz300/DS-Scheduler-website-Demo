import React from 'react';
import { platformMeta } from '@/lib/status';

export default function PlatformBadge({ platform, size = 'sm' }) {
    const meta = platformMeta(platform);
    const dims = size === 'lg' ? 'w-10 h-10 text-sm' : 'w-7 h-7 text-[10px]';
    return (
        <div className="flex items-center gap-2">
            <div
                className={`${dims} flex items-center justify-center rounded-[6px] border border-[#262626] bg-[#1a1a1a] font-display font-semibold tracking-tight text-[#FAFAFA]`}
            >
                {meta.initial}
            </div>
            {size === 'lg' && (
                <span className="font-display text-sm font-medium text-[#FAFAFA]">{meta.label}</span>
            )}
        </div>
    );
}