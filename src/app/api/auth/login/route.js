import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { comparePassword, generateToken, seedAdmin } from '@/lib/auth';

export async function POST(request) {
    try {
        await dbConnect();
        // Seed admin on first login attempt
        await seedAdmin();

        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            );
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return NextResponse.json(
                { error: 'Invalid email or password' },
                { status: 401 }
            );
        }

        const isValid = await comparePassword(password, user.password);
        if (!isValid) {
            return NextResponse.json(
                { error: 'Invalid email or password' },
                { status: 401 }
            );
        }

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

        // Set cookie for convenience
        response.cookies.set('ds_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60, // 7 days
            path: '/',
        });

        return response;
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
