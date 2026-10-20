import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import EmployeeAccess from '@/models/EmployeeAccess';
import { hashPassword, generateToken } from '@/lib/auth';

export async function POST(request) {
    try {
        await dbConnect();

        const { email, password, full_name } = await request.json();

        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            );
        }

        const emailLower = email.toLowerCase();
        const existing = await User.findOne({ email: emailLower });
        const hashed = await hashPassword(password);
        let user = existing;

        if (existing) {
            // Only an employee whose access was removed by the admin may sign up again.
            const existingAccessRec = await EmployeeAccess.findOne({ email: emailLower });
            const canReRegister =
                existing.role !== 'admin' && existingAccessRec &&
                (existingAccessRec.status === 'removed' || existingAccessRec.status === 'denied');
            if (!canReRegister) {
                return NextResponse.json(
                    { error: 'This email is already registered. Please log in instead (or use Forgot Password).' },
                    { status: 409 }
                );
            }
            existing.password = hashed;
            existing.full_name = full_name || existing.full_name || email.split('@')[0];
            existing.otp_code = null;
            existing.otp_expires = null;
            await existing.save();
        } else {
            user = await User.create({
                email: emailLower,
                password: hashed,
                full_name: full_name || email.split('@')[0],
                role: 'user',
            });
        }

        // Auto-create or link EmployeeAccess record
        const existingAccess = await EmployeeAccess.findOne({ email: emailLower });
        if (existingAccess) {
            existingAccess.user_id = user._id;
            existingAccess.full_name = user.full_name;
            if (existingAccess.status === 'removed' || existingAccess.status === 'denied') {
                // Needs a fresh admin approval.
                existingAccess.status = 'pending';
                existingAccess.requested_at = new Date();
            }
            await existingAccess.save();
        } else {
            await EmployeeAccess.create({
                user_id: user._id,
                email: user.email,
                full_name: user.full_name,
                status: 'pending',
                requested_at: new Date(),
            });
        }

        // No token/cookie here: the user must sign in and pass the email OTP step.
        return NextResponse.json({
            success: true,
            user: {
                id: user._id.toString(),
                email: user.email,
                full_name: user.full_name,
                role: user.role,
            },
        });
    } catch (error) {
        console.error('Register error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
