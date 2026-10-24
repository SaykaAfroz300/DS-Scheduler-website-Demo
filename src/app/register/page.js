'use client';

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { authApi } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Mail, Lock, Loader2, User, Eye, EyeOff } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";

function RegisterForm() {
    const searchParams = useSearchParams();
    const [email, setEmail] = useState("");
    const [fullName, setFullName] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    useEffect(() => {
        const qEmail = searchParams.get("email");
        if (qEmail) setEmail(qEmail);
    }, [searchParams]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }
        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }
        setLoading(true);
        try {
            await authApi.register(email, password, fullName);
            window.location.href = "/login?registered=1";
        } catch (err) {
            setError(err.message || "Registration failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout
            icon={UserPlus}
            title="Employee Sign Up"
            subtitle="Create an employee account to view your assigned tasks"
            footer={
                <>
                    Already have an account?{" "}
                    <Link href="/login" className="text-[#FFFFFF] font-medium hover:underline">
                        Log in
                    </Link>
                </>
            }
        >
            {error && (
                <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm font-medium">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-[#C4C4C4]">Full Name</Label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A3A3A3]" aria-hidden="true" />
                        <Input
                            id="fullName"
                            type="text"
                            autoComplete="name"
                            autoFocus
                            placeholder="Your full name"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="pl-10 h-12 border-[#333333] bg-[#080808] text-[#FFFFFF] placeholder:text-[#A3A3A3] focus-visible:border-[#FFFFFF]"
                            required
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email" className="text-[#C4C4C4]">Email</Label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A3A3A3]" aria-hidden="true" />
                        <Input
                            id="email"
                            type="email"
                            autoComplete="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="pl-10 h-12 border-[#333333] bg-[#080808] text-[#FFFFFF] placeholder:text-[#A3A3A3] focus-visible:border-[#FFFFFF]"
                            required
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="password" className="text-[#C4C4C4]">Password</Label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A3A3A3]" aria-hidden="true" />
                        <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            autoComplete="new-password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="pl-10 pr-10 h-12 border-[#333333] bg-[#080808] text-[#FFFFFF] placeholder:text-[#A3A3A3] focus-visible:border-[#FFFFFF]"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword((v) => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A3A3A3] hover:text-[#FFFFFF] transition-colors"
                            aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="confirm" className="text-[#C4C4C4]">Confirm Password</Label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A3A3A3]" aria-hidden="true" />
                        <Input
                            id="confirm"
                            type={showConfirm ? "text" : "password"}
                            autoComplete="new-password"
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="pl-10 pr-10 h-12 border-[#333333] bg-[#080808] text-[#FFFFFF] placeholder:text-[#A3A3A3] focus-visible:border-[#FFFFFF]"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirm((v) => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A3A3A3] hover:text-[#FFFFFF] transition-colors"
                            aria-label={showConfirm ? "Hide password" : "Show password"}
                        >
                            {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                </div>
                <Button type="submit" className="w-full h-12 font-medium bg-[#FFFFFF] text-[#080808] hover:bg-[#FFFFFF]/90" disabled={loading}>
                    {loading ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Creating account...
                        </>
                    ) : (
                        "Create account"
                    )}
                </Button>
            </form>
        </AuthLayout>
    );
}

export default function RegisterPage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center bg-[#080808]"><Loader2 className="w-8 h-8 animate-spin text-[#FFFFFF]" /></div>}>
            <RegisterForm />
        </Suspense>
    );
}
