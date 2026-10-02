import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { hashPassword } from '@/lib/auth';
import crypto from 'crypto';

// In production you'd send an email. For now, we store reset tokens in memory.
// In a real app, use a proper email service.
if (!global.resetTokens) global.resetTokens = new Map();

export async function POST(request) {
    try {
        await dbConnect();
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json({ ok: true }); // Don't reveal if user exists
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (user) {
            const token = crypto.randomBytes(32).toString('hex');
            global.resetTokens.set(token, {
                userId: user._id.toString(),
                expiresAt: Date.now() + 3600000, // 1 hour
            });
            // In production, send an email with the reset link:
            // `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`
            console.log(`Password reset token for ${email}: ${token}`);
            console.log(`Reset link: ${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/reset-password?token=${token}`);
        }

        // Always return success (don't reveal user existence)
        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error('Forgot password error:', error);
        return NextResponse.json({ ok: true });
    }
}
