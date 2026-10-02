import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { getAuthUser } from '@/lib/auth';
import EmployeeAccess from '@/models/EmployeeAccess';

export async function POST(request) {
    try {
        await dbConnect();
        const user = await getAuthUser(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Admin is always admin
        if (user.role === 'admin') {
            return NextResponse.json({ status: 'admin', isAdmin: true });
        }

        const body = await request.json().catch(() => ({}));

        let access = await EmployeeAccess.findOne({ user_id: user.id });

        if (body.request) {
            // Re-request access
            if (!access || access.status === 'denied' || access.status === 'removed') {
                if (access) {
                    access.status = 'pending';
                    access.requested_at = new Date();
                    await access.save();
                } else {
                    await EmployeeAccess.create({
                        user_id: user.id,
                        email: user.email,
                        full_name: user.full_name || '',
                        status: 'pending',
                        requested_at: new Date(),
                    });
                }
                return NextResponse.json({ status: 'pending' });
            }
            return NextResponse.json({ status: access.status });
        }

        if (!access) {
            // Auto-create pending on first visit
            await EmployeeAccess.create({
                user_id: user.id,
                email: user.email,
                full_name: user.full_name || '',
                status: 'pending',
                requested_at: new Date(),
            });
            return NextResponse.json({ status: 'pending' });
        }

        return NextResponse.json({ status: access.status });
    } catch (error) {
        console.error('Access status error:', error);
        return NextResponse.json(
            { error: error.message },
            { status: error.status || 500 }
        );
    }
}
