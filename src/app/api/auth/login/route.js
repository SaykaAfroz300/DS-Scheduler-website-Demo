import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import EmployeeAccess from '@/models/EmployeeAccess';
import { comparePassword, generateToken, seedAdmin } from '@/lib/auth';
import { sendOtpEmail } from '@/lib/email';

export async function POST(request) {
    try {
        await dbConnect();
        await seedAdmin();

        const { email, password, otp } = await request.json();

        if (!email || !password) {
            return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
        }

        const isValid = await comparePassword(password, user.password);
        if (!isValid) {
            return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
        }

        // If OTP is provided, verify it
        if (otp) {
            if (!user.otp_code || user.otp_code !== otp || user.otp_expires < new Date()) {
                return NextResponse.json({ error: 'Invalid or expired OTP code' }, { status: 401 });
            }
            
            // Clear OTP
            user.otp_code = null;
            user.otp_expires = null;
            await user.save();
            
            // Generate real token
            const token = generateToken(user);

            const response = NextResponse.json({
                token,
                user: {
                    id: user._id.toString(),
                    email: user.email,
                    full_name: user.full_name,
                    role: user.role,
                },
            });

            response.cookies.set('ds_token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 7 * 24 * 60 * 60,
                path: '/',
            });

            return response;
        }

        // If no OTP, generate one and send it
        const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
        user.otp_code = generatedOtp;
        user.otp_expires = new Date(Date.now() + 10 * 60000); // 10 minutes
        await user.save();

        await sendOtpEmail(user.email, generatedOtp);

        return NextResponse.json({ requiresOtp: true });
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
