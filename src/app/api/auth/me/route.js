import { NextResponse } from 'next/server';
import { getAuthUser, seedAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    try {
        // Seed admin on first check
        await seedAdmin();

        const user = await getAuthUser(request);
        if (!user) {
            return NextResponse.json(
                { error: 'Not authenticated' },
                { status: 401 }
            );
        }

        return NextResponse.json({ user });
    } catch (error) {
        console.error('Auth me error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
