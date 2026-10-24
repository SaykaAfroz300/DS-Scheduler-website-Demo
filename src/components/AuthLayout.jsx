import React from "react";

export default function AuthLayout({ icon: Icon, title, subtitle, footer, children }) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#080808] px-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="mb-6 flex justify-center">
                        <img src="/logo.jpeg" alt="Dhaka Sessions Logo" className="h-24 w-auto object-contain" />
                    </div>
                    <h1 className="text-3xl font-display font-bold tracking-tight text-[#FFFFFF]">{title}</h1>
                    {subtitle && <p className="text-[13px] text-[#C4C4C4] mt-2">{subtitle}</p>}
                </div>
                <div className="bg-[#141414] rounded-2xl shadow-xl border border-[#333333] p-8">
                    {children}
                </div>
                {footer && (
                    <p className="text-center text-sm text-[#A3A3A3] mt-6">{footer}</p>
                )}
            </div>
        </div>
    );
}
