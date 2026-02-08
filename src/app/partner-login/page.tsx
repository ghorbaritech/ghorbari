'use client'

import { useState } from 'react'
import { signIn } from '@/app/auth/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Briefcase, Building2, TrendingUp } from 'lucide-react'
import Link from 'next/link'

export default function PartnerLoginPage() {
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        setError(null)
        const result = await signIn(formData, 'partner') // Role check handles both designer and seller
        if (result?.error) {
            setError(result.error)
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
            {/* Left Side: Marketing/Visual */}
            <div className="hidden lg:flex flex-col justify-center p-20 bg-primary-600 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-48 -mt-48" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary-700/50 rounded-full blur-3xl -ml-48 -mb-48" />

                <div className="relative z-10 max-w-lg">
                    <h1 className="text-6xl font-black italic tracking-tighter leading-none mb-8">BUILD THE <br />FUTURE<br />TOGETHER.</h1>
                    <p className="text-xl font-medium text-primary-100 mb-12">Empowering architects, designers, and material suppliers to scale their business across the nation.</p>

                    <div className="space-y-8">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-white/20 rounded-2xl">
                                <Building2 className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-black text-lg">Wider Reach</h3>
                                <p className="text-primary-100 text-sm">Connect with thousands of serious property developers and homeowners.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-white/20 rounded-2xl">
                                <TrendingUp className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-black text-lg">Sales Management</h3>
                                <p className="text-primary-100 text-sm">Professional tools to monitor stock, orders, and service requests.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side: Login Form */}
            <div className="flex items-center justify-center p-8 bg-white">
                <div className="max-w-md w-full space-y-10">
                    <div className="text-center lg:text-left">
                        <h2 className="text-4xl font-black text-neutral-900 italic tracking-tighter uppercase">Partner Portal</h2>
                        <p className="mt-4 text-xs font-bold text-neutral-400 uppercase tracking-widest pl-1">Sign in to manage your professional studio or shop</p>
                    </div>

                    <form className="space-y-6" action={handleSubmit}>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-neutral-400 pl-1">Professional Email</label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    className="h-14 bg-neutral-50 border-none rounded-2xl font-bold shadow-sm focus:ring-2 focus:ring-primary-600"
                                    placeholder="studio@example.com"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-neutral-400 pl-1">Password</label>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    className="h-14 bg-neutral-50 border-none rounded-2xl font-bold shadow-sm focus:ring-2 focus:ring-primary-600"
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
                            className="w-full h-16 bg-neutral-900 hover:bg-neutral-800 text-white font-black uppercase tracking-widest rounded-3xl shadow-xl shadow-neutral-200 transition-all active:scale-[0.98]"
                            disabled={loading}
                        >
                            {loading ? 'OPENING DASHBOARD...' : 'ENTER PARTNER SPACE'}
                        </Button>
                    </form>

                    <div className="text-center lg:text-left space-y-4">
                        <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider pl-1">Are you a customer?</p>
                        <Link href="/login">
                            <Button variant="outline" className="h-12 border-2 rounded-2xl font-black uppercase text-[10px] tracking-widest px-8">Switch to Customer Login</Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
