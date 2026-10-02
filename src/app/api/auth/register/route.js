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

        // Check if user already exists
        const existing = await User.findOne({ email: email.toLowerCase() });
        if (existing) {
            return NextResponse.json(
                { error: 'An account with this email already exists' },
                { status: 409 }
            );
        }

        // Create user
        const hashed = await hashPassword(password);
        const user = await User.create({
            email: email.toLowerCase(),
            password: hashed,
            full_name: full_name || email.split('@')[0],
            role: 'user',
        });

        // Auto-create a pending EmployeeAccess record
        await EmployeeAccess.create({
            user_id: user._id,
            email: user.email,
            full_name: user.full_name,
            status: 'pending',
            requested_at: new Date(),
        });

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
    } catch (error) {
        console.error('Register error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
