'use client'

import { useState } from 'react'
import { partnerSignIn } from '../partner-login/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Briefcase, Building2, TrendingUp, Shield, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { signInWithGoogle } from '@/app/auth/actions'

export default function PartnerLandingPage() {
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        setError(null)
        const result = await partnerSignIn(formData)

        if (result?.error) {
            setError(result.error)
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white selection:bg-blue-500/30 overflow-hidden relative">
            {/* Ambient Background Glows */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full" />

            <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 relative z-10 flex flex-col min-h-screen">
                {/* Header */}
                <nav className="flex justify-between items-center mb-16">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/40 group-hover:scale-110 transition-transform">
                            <Shield className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xl font-black italic tracking-tighter uppercase tracking-[0.1em]">Dalan<span className="text-blue-500">kotha</span></span>
                    </Link>
                    <Link href="/partner/register">
                        <Button variant="outline" className="h-10 px-6 border-neutral-800 bg-neutral-900/50 hover:bg-neutral-800 text-white rounded-full font-black uppercase text-[10px] tracking-widest">
                            Join as Partner
                        </Button>
                    </Link>
                </nav>

                <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-center">
                    {/* Left Column: Context */}
                    <div className="space-y-10">
                        <div className="space-y-4">
                            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-blue-500 pl-1">Partner Portal</h2>
                            <h1 className="text-5xl lg:text-7xl font-black tracking-tighter leading-[0.9] italic uppercase">
                                Scale Your <span className="text-blue-500">Studio</span> <br />
                                <span className="bg-gradient-to-r from-white to-neutral-500 bg-clip-text text-transparent">Professionally</span>
                            </h1>
                            <p className="text-lg text-neutral-400 font-medium max-w-lg leading-relaxed">
                                Enter your credentials to manage your store, monitor design orders, and service your clients across Bangladesh.
                            </p>
                        </div>

                        <div className="hidden md:flex flex-col gap-6">
                            {[
                                { icon: Building2, label: 'Real-time Analytics', sub: 'Monitor your sales and project growth.' },
                                { icon: TrendingUp, label: 'Advanced Tools', sub: 'Calculators and AI tools for engineering.' },
                            ].map((item, i) => (
                                <div key={i} className="flex items-start gap-4">
                                    <div className="p-3 bg-neutral-900/50 border border-neutral-800 rounded-2xl">
                                        <item.icon className="w-5 h-5 text-blue-500" />
                                    </div>
                                    <div>
                                        <div className="text-[11px] font-black uppercase tracking-widest text-white">{item.label}</div>
                                        <div className="text-xs font-medium text-neutral-500">{item.sub}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Column: Login Form */}
                    <div className="max-w-md w-full mx-auto lg:mx-0 lg:ml-auto space-y-6 animate-in fade-in slide-in-from-right-8 duration-700">
                        <div className="bg-neutral-900/60 backdrop-blur-3xl border border-white/5 p-8 lg:p-10 rounded-[3rem] shadow-2xl">
                            <form className="space-y-6" action={handleSubmit}>
                                <div className="space-y-5">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-neutral-500 pl-1 tracking-widest">Email Address</label>
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            required
                                            className="h-14 bg-neutral-950/50 border-neutral-800 rounded-2xl font-bold focus:ring-2 focus:ring-blue-600 text-white placeholder:text-neutral-700"
                                            placeholder="partner@dalankotha.com"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center pr-1">
                                            <label className="text-[10px] font-black uppercase text-neutral-500 pl-1 tracking-widest">Security Pin / Pasword</label>
                                            <Link href="/forgot-password" title="Coming soon" className="text-[9px] font-black uppercase text-blue-500/50 hover:text-blue-500 tracking-widest">Forgot?</Link>
                                        </div>
                                        <Input
                                            id="password"
                                            name="password"
                                            type="password"
                                            required
                                            className="h-14 bg-neutral-950/50 border-neutral-800 rounded-2xl font-bold focus:ring-2 focus:ring-blue-600 text-white placeholder:text-neutral-700"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>

                                {error && (
                                    <div className="p-4 bg-red-600/10 border border-red-500/20 rounded-2xl text-red-500 text-[10px] font-black uppercase text-center tracking-widest">
                                        {error}
                                    </div>
                                )}

                                <Button
                                    type="submit"
                                    className="w-full h-16 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest rounded-3xl transition-all active:scale-[0.98] shadow-xl shadow-blue-500/10 flex items-center justify-center gap-3"
                                    disabled={loading}
                                >
                                    {loading ? 'AUTHENTICATING...' : 'ENTER DASHBOARD'}
                                    {!loading && <ArrowRight className="w-4 h-4" />}
                                </Button>
                            </form>

                            {/* Divider */}
                            <div className="relative my-8">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-neutral-800" />
                                </div>
                                <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest">
                                    <span className="bg-[#050505] px-4 text-neutral-600">Or Login With</span>
                                </div>
                            </div>

                            {/* Google OAuth Login */}
                            <Button 
                                onClick={() => signInWithGoogle('/partner/onboarding')}
                                variant="outline"
                                className="w-full h-14 bg-neutral-900 border-neutral-800 hover:bg-neutral-800 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 transition-all active:scale-95"
                            >
                                <svg className="w-4 h-4" viewBox="0 0 24 24">
                                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                Continue with Google
                            </Button>

                            <div className="mt-8 text-center">
                                <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                                    New here?{' '}
                                    <Link href="/partner/register" className="text-blue-500 hover:text-blue-400 font-black decoration-2">
                                        Create Partner Account
                                    </Link>
                                </p>
                            </div>
                        </div>

                        <div className="p-6 bg-blue-600/5 border border-blue-500/10 rounded-3xl text-center">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500 mb-1">Technical Support</p>
                            <p className="text-[11px] text-neutral-400 font-medium italic">Contact our engineering team at support@dalankotha.com</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
