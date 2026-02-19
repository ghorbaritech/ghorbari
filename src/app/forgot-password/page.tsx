"use client"

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, CheckCircle, AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const supabase = createClient();

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/update-password`,
            });

            if (error) throw error;
            setSuccess(true);
        } catch (err: any) {
            setError(err.message || "Failed to send reset email");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-4">
            <div className="max-w-md w-full bg-white rounded-xl shadow-sm border p-8 space-y-6">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-neutral-900">Reset Password</h1>
                    <p className="text-neutral-500 mt-2">Enter your email to receive a reset link</p>
                </div>

                {success ? (
                    <div className="text-center space-y-4">
                        <div className="mx-auto w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-6 h-6" />
                        </div>
                        <div className="text-green-800 bg-green-50 p-4 rounded-lg text-sm">
                            We have sent a password reset link to <strong>{email}</strong>. Please check your inbox.
                        </div>
                        <Button asChild className="w-full" variant="outline">
                            <Link href="/login">Back to Login</Link>
                        </Button>
                    </div>
                ) : (
                    <form onSubmit={handleReset} className="space-y-4">
                        {error && (
                            <div className="p-3 bg-red-50 text-red-700 text-sm rounded flex items-center gap-2">
                                <AlertCircle className="w-4 h-4" /> {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 w-4 h-4 text-neutral-400" />
                                <Input
                                    type="email"
                                    required
                                    placeholder="you@example.com"
                                    className="pl-9"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <Button type="submit" className="w-full bg-primary-600 hover:bg-primary-700" disabled={loading}>
                            {loading ? "Sending Link..." : "Send Reset Link"}
                        </Button>

                        <div className="text-center">
                            <Link href="/login" className="text-sm text-neutral-500 hover:text-neutral-900 flex items-center justify-center gap-1">
                                <ArrowLeft className="w-3 h-3" /> Back to Login
                            </Link>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
