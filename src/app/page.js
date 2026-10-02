'use client';

import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClientInstance } from '@/lib/query-client';
import { Toaster } from '@/components/ui/toaster';
import Home from '@/components/pages/Home';

function AuthenticatedApp() {
    const { isLoadingAuth, isAuthenticated, authChecked, navigateToLogin } = useAuth();

    if (isLoadingAuth || !authChecked) {
        return (
            <div className="fixed inset-0 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        if (typeof window !== 'undefined') {
            window.location.href = '/login';
        }
        return null;
    }

    return <Home />;
}

export default function Page() {
    return (
        <AuthProvider>
            <QueryClientProvider client={queryClientInstance}>
                <AuthenticatedApp />
                <Toaster />
            </QueryClientProvider>
        </AuthProvider>
    );
}
