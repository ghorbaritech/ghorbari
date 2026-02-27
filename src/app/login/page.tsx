'use client'

import { useState } from 'react'
import { signIn } from '@/app/auth/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { User } from 'lucide-react'

export default function LoginPage() {
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        setError(null)
        const result = await signIn(formData, 'customer')
        if (result?.error) {
            setError(result.error)
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA] py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-6 bg-white p-8 rounded-2xl shadow-sm border border-neutral-200">
                <div className="text-center">
                    <div className="flex justify-center mb-6">
                        <div className="p-3 bg-neutral-100 text-neutral-600 rounded-xl">
                            <User className="w-7 h-7" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-neutral-900">Sign In</h2>
                    <p className="mt-4 text-xs font-bold text-neutral-400 uppercase tracking-widest pl-1">Access your projects and orders</p>
                </div>
                <form className="mt-8 space-y-6" action={handleSubmit}>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-neutral-400 pl-1">Email Address</label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="h-14 bg-neutral-50 border-none rounded-2xl font-bold shadow-sm"
                                placeholder="name@example.com"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-neutral-400 pl-1">Password</label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                className="h-14 bg-neutral-50 border-none rounded-2xl font-bold shadow-sm"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="text-rose-500 text-[10px] font-black uppercase text-center bg-rose-50 py-3 rounded-xl border border-rose-100">
                            {error}
                        </div>
                    )}

                    <Button
                        type="submit"
                        className="w-full h-11 bg-neutral-900 hover:bg-black text-white font-bold rounded-xl transition-all"
                        disabled={loading}
                    >
                        {loading ? 'Entering...' : 'Sign In'}
                    </Button>
                </form>

                <div className="space-y-6 text-center pt-4">
                    <Link href="/register" className="block text-xs font-black text-orange-600 hover:text-orange-500 uppercase tracking-widest">
                        New to Ghorbari? Create Account
                    </Link>

                    <div className="pt-6 border-t border-neutral-100">
                        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-4">Are you a Business Partner?</p>
                        <Link href="/partner-login">
                            <Button variant="outline" className="h-12 border-2 rounded-2xl font-black uppercase text-[10px] tracking-widest px-8">Designer & Seller Portal</Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
