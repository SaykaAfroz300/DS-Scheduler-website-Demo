import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { hashPassword } from '@/lib/auth';

export async function POST(request) {
    try {
        await dbConnect();
        const { token, newPassword } = await request.json();

        if (!token || !newPassword) {
            return NextResponse.json(
                { error: 'Token and new password are required' },
                { status: 400 }
            );
        }

        if (!global.resetTokens) global.resetTokens = new Map();

        const tokenData = global.resetTokens.get(token);
        if (!tokenData) {
            return NextResponse.json(
                { error: 'Invalid or expired reset token' },
                { status: 400 }
            );
        }

        if (Date.now() > tokenData.expiresAt) {
            global.resetTokens.delete(token);
            return NextResponse.json(
                { error: 'Reset token has expired' },
                { status: 400 }
            );
        }

        const hashed = await hashPassword(newPassword);
        await User.findByIdAndUpdate(tokenData.userId, { password: hashed });

        // Remove used token
        global.resetTokens.delete(token);

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error('Reset password error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
