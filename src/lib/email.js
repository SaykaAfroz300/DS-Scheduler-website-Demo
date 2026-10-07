import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export async function sendInviteEmail(email, inviteLink) {
    if (!process.env.EMAIL_USER) {
        console.log(`[DEV EMAIL] Would send invite to ${email} with link: ${inviteLink}`);
        return;
    }

    await transporter.sendMail({
        from: `"DS Scheduler" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'You have been invited to DS Scheduler',
        html: `
            <div style="font-family: sans-serif; max-w-xl mx-auto p-4 border rounded shadow-sm">
                <h2 style="color: #333;">Welcome to DS Scheduler!</h2>
                <p>An administrator has invited you to join the workspace.</p>
                <p>Please click the link below to create your account. Your access will be automatically approved upon registration.</p>
                <div style="margin: 30px 0;">
                    <a href="${inviteLink}" style="background-color: #080808; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Accept Invite & Register</a>
                </div>
                <p style="color: #666; font-size: 12px;">If the button doesn't work, copy this link: ${inviteLink}</p>
            </div>
        `,
    });
}

export async function sendOtpEmail(email, otp) {
    if (!process.env.EMAIL_USER) {
        console.log(`[DEV EMAIL] OTP for ${email} is: ${otp}`);
        return;
    }

    await transporter.sendMail({
        from: `"DS Scheduler" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Your Login Verification Code',
        html: `
            <div style="font-family: sans-serif; max-w-xl mx-auto p-4 border rounded shadow-sm text-center">
                <h2 style="color: #333;">Login Verification</h2>
                <p>Use the following 6-digit code to complete your login:</p>
                <div style="margin: 30px 0; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #080808;">
                    ${otp}
                </div>
                <p style="color: #666; font-size: 12px;">This code will expire in 10 minutes. If you didn't request this, you can safely ignore this email.</p>
            </div>
        `,
    });
}
