import React from "react";

export default function AuthLayout({ icon: Icon, title, subtitle, footer, children }) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-10">
                    <div className="mb-4 flex justify-center">
                        {/* UPDATE YOUR LOGO HERE: Change src="/logo.png" to the name of the file you place in your public/ folder */}
                        <img src="/logo.png" alt="Dhaka Sessions Logo" className="h-16 w-auto object-contain" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">{title}</h1>
                    {subtitle && <p className="text-muted-foreground mt-2">{subtitle}</p>}
                </div>
                <div className="bg-card rounded-2xl shadow-sm border border-border p-8">
                    {children}
                </div>
                {footer && (
                    <p className="text-center text-sm text-muted-foreground mt-6">{footer}</p>
                )}
            </div>
        </div>
    );
}
