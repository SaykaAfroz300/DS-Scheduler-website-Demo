'use client';

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authApi } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn, Mail, Lock, Loader2, Shield, User } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";

export default function LoginPage() {
    const router = useRouter();
    const [mode, setMode] = useState("employee");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            await authApi.login(email, password);
            window.location.href = "/";
        } catch (err) {
            setError(err.message || "Invalid email or password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout
            icon={LogIn}
            title="Dhaka Sessions"
            subtitle="Sign in to your account"
        >
            {/* Path selector */}
            <div className="mb-6 grid grid-cols-2 gap-1 rounded-[6px] border border-[#262626] bg-[#080808] p-1">
                <PathButton
                    active={mode === "employee"}
                    onClick={() => setMode("employee")}
                    icon={User}
                    label="Employee"
                />
                <PathButton
                    active={mode === "admin"}
                    onClick={() => setMode("admin")}
                    icon={Shield}
                    label="Admin"
                />
            </div>

            {error && (
                <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
                        <Input
                            id="email"
                            type="email"
                            autoComplete="email"
                            autoFocus
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="pl-10 h-12"
                            required
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="password">Password</Label>
                        <Link href="/forgot-password" className="text-xs text-primary hover:underline">
                            Forgot password?
                        </Link>
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
                        <Input
                            id="password"
                            type="password"
                            autoComplete="current-password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="pl-10 h-12"
                            required
                        />
                    </div>
                </div>
                <Button type="submit" className="w-full h-12 font-medium" disabled={loading}>
                    {loading ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Signing in...
                        </>
                    ) : (
                        mode === "admin" ? "Admin sign in" : "Employee sign in"
                    )}
                </Button>
            </form>

            {mode === "employee" ? (
                <p className="text-center text-sm text-muted-foreground mt-6">
                    New here?{" "}
                    <Link href="/register" className="text-primary font-medium hover:underline">
                        Create an employee account
                    </Link>
                </p>
            ) : (
                <p className="text-center text-xs text-muted-foreground mt-6">
                    Admin access is granted to the configured admin email only. Sign in with your admin credentials above.
                </p>
            )}
        </AuthLayout>
    );
}

function PathButton({ active, onClick, icon: Icon, label }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`flex items-center justify-center gap-2 rounded-[6px] px-3 py-2.5 text-[13px] font-medium transition-colors ${active
                    ? "bg-[#FAFAFA] text-[#080808]"
                    : "text-[#8E8E93] hover:text-[#FAFAFA]"
                }`}
        >
            <Icon className="w-4 h-4" />
            {label}
        </button>
    );
}
