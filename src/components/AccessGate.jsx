import React, { useState } from 'react';
import { Loader2, LogOut, Clock, ShieldOff, UserX, RotateCcw } from 'lucide-react';

// Full-screen gate for non-approved accounts. Shown instead of the app.
export default function AccessGate({ status, onRequest, onLogout }) {
    const [submitting, setSubmitting] = useState(false);

    const handleRequest = async () => {
        setSubmitting(true);
        try {
            await onRequest();
        } finally {
            setSubmitting(false);
        }
    };

    if (status === 'pending') {
        return (
            <Shell icon={Clock} title="Waiting for approval">
                <p className="text-[13px] leading-relaxed text-[#8E8E93]">
                    Your access request has been sent. You'll be able to use DS Scheduler once an
                    administrator approves it.
                </p>
                <p className="mt-2 text-[13px] text-[#8E8E93]">
                    You can sign out and check back later — your request stays in the queue.
                </p>
                <SignOutButton onLogout={onLogout} />
            </Shell>
        );
    }

    if (status === 'denied') {
        return (
            <Shell icon={ShieldOff} title="Access denied">
                <p className="text-[13px] leading-relaxed text-[#8E8E93]">
                    An administrator has not approved your access. If you believe this is a mistake, you can
                    submit a new request.
                </p>
                <div className="mt-6 flex flex-col gap-2">
                    <button
                        onClick={handleRequest}
                        disabled={submitting}
                        className="flex w-full items-center justify-center gap-2 rounded-[6px] bg-[#FAFAFA] px-4 py-2.5 text-[13px] font-semibold text-[#080808] transition-opacity hover:opacity-90 disabled:opacity-50"
                    >
                        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
                        Request access again
                    </button>
                    <SignOutButton onLogout={onLogout} />
                </div>
            </Shell>
        );
    }

    // removed
    return (
        <Shell icon={UserX} title="Your access has been removed">
            <p className="text-[13px] leading-relaxed text-[#8E8E93]">
                Your employee access was revoked by an administrator. You can request access again to be
                reviewed by an admin.
            </p>
            <div className="mt-6 flex flex-col gap-2">
                <button
                    onClick={handleRequest}
                    disabled={submitting}
                    className="flex w-full items-center justify-center gap-2 rounded-[6px] bg-[#FAFAFA] px-4 py-2.5 text-[13px] font-semibold text-[#080808] transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
                    Request access again
                </button>
                <SignOutButton onLogout={onLogout} />
            </div>
        </Shell>
    );
}

function Shell({ icon: Icon, title, children }) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-[#080808] px-4">
            <div className="w-full max-w-md text-center">
                <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-[6px] border border-[#262626] bg-[#121212]">
                    <Icon className="h-6 w-6 text-[#8E8E93]" />
                </div>
                <h1 className="font-display text-[20px] font-bold tracking-tight text-[#FAFAFA]">{title}</h1>
                <div className="mt-4 text-left">{children}</div>
            </div>
        </div>
    );
}

function SignOutButton({ onLogout }) {
    return (
        <button
            onClick={onLogout}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-[6px] border border-[#262626] px-4 py-2.5 text-[13px] font-medium text-[#8E8E93] transition-colors hover:border-[#3a3a3a] hover:text-[#FAFAFA]"
        >
            <LogOut className="w-4 h-4" />
            Sign out
        </button>
    );
}