'use client'

import { useState } from 'react'
import { signInWithGoogle } from '@/app/auth/actions'
import { partnerSignUp } from './actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Shield, CheckCircle2, Store, Wrench, PencilRuler, ArrowRight, Mail, Lock, User, Building, Loader2, Eye, EyeOff } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export default function PartnerRegisterPage() {
    const [mode, setMode] = useState<'google' | 'email'>('google')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    async function handleEmailSignUp(formData: FormData) {
        const password = formData.get('password') as string
        const confirmPassword = formData.get('confirmPassword') as string
        
        if (password !== confirmPassword) {
            setError("Passwords do not match.")
            return
        }

        setLoading(true)
        setError(null)
        
        const result = await partnerSignUp(formData)
        
        if (result?.error) {
            setError(result.error)
            setLoading(false)
        } else if (result?.redirect) {
            window.location.href = '/partner/onboarding'
        } else if (result?.requiresEmailVerification) {
            setSuccess(true)
            setLoading(false)
        }
    }
    return (
        <div className="min-h-screen bg-[#050505] text-white selection:bg-blue-500/30 overflow-hidden relative">
            {/* Ambient Background Glows */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full" />

            <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 relative z-10">
                {/* Header */}
                <nav className="flex justify-between items-center mb-16 animate-in fade-in slide-in-from-top-4 duration-700">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/40 group-hover:scale-110 transition-transform">
                            <Shield className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xl font-black italic tracking-tighter uppercase tracking-[0.1em]">Dalan<span className="text-blue-500">kotha</span></span>
                    </Link>
                    <div className="flex items-center gap-6">
                        <span className="text-xs font-black uppercase tracking-widest text-neutral-500 hidden md:block">Already a partner?</span>
                        <Link href="/partner">
                            <Button variant="outline" className="h-10 px-6 border-neutral-800 bg-neutral-900/50 hover:bg-neutral-800 text-neutral-300 rounded-full font-black uppercase text-[10px] tracking-widest">
                                Sign In
                            </Button>
                        </Link>
                    </div>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                    {/* Left Column: Hero Content */}
                    <div className="space-y-10 animate-in fade-in slide-in-from-left-8 duration-1000">
                        <div className="space-y-4">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                                </span>
                                <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">Partner Enrollment Open</span>
                            </div>
                            <h1 className="text-5xl lg:text-7xl font-black tracking-tighter leading-[0.9] italic uppercase">
                                Build Your <span className="text-blue-500">Digital</span> <br />
                                <span className="bg-gradient-to-r from-white to-neutral-500 bg-clip-text text-transparent">Empire</span>
                            </h1>
                            <p className="text-lg text-neutral-400 font-medium max-w-lg leading-relaxed">
                                Join Bangladesh's most advanced engineering & construction marketplace. Scale your business with AI-powered leads.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[
                                { icon: Store, label: 'Suppliers', sub: 'Materials & Decor' },
                                { icon: PencilRuler, label: 'Designers', sub: 'Architects & Interiors' },
                                { icon: Wrench, label: 'Services', sub: 'Workforce & Tech' },
                            ].map((item, i) => (
                                <div key={i} className="p-4 bg-neutral-900/40 border border-neutral-800/50 rounded-2xl backdrop-blur-sm">
                                    <item.icon className="w-5 h-5 text-blue-500 mb-2" />
                                    <div className="text-[10px] font-black uppercase tracking-widest text-white">{item.label}</div>
                                    <div className="text-[9px] font-medium text-neutral-500 uppercase">{item.sub}</div>
                                </div>
                            ))}
                        </div>

                        {/* Mode Switcher */}
                        <div className="flex p-1 bg-neutral-900 border border-neutral-800 rounded-2xl w-fit">
                            <button 
                                onClick={() => setMode('google')}
                                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'google' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'text-neutral-500 hover:text-neutral-300'}`}
                            >
                                Google Auth
                            </button>
                            <button 
                                onClick={() => setMode('email')}
                                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'email' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'text-neutral-500 hover:text-neutral-300'}`}
                            >
                                Email Registration
                            </button>
                        </div>
                    </div>

                    {/* Right Column: Registration Card */}
                    <div className="relative animate-in fade-in zoom-in duration-1000 delay-300">
                        <div className="bg-neutral-900/60 backdrop-blur-3xl border border-white/5 p-8 lg:p-12 rounded-[3.5rem] shadow-2xl relative">
                            {success ? (
                                <div className="space-y-6 py-10 text-center animate-in fade-in zoom-in">
                                    <div className="w-20 h-20 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <Mail className="w-10 h-10 text-green-500" />
                                    </div>
                                    <h3 className="text-3xl font-black italic uppercase tracking-tighter">Check Your <span className="text-green-500">Inbox</span></h3>
                                    <p className="text-neutral-400 font-medium max-w-sm mx-auto leading-relaxed">
                                        We've sent a verification link to your email. Please verify your address to log in and continue your onboarding journey.
                                    </p>
                                    <Button onClick={() => window.location.href = '/partner'} className="mt-8 h-12 bg-neutral-800 hover:bg-neutral-700 text-white rounded-full font-black uppercase tracking-widest px-8">
                                        Return to Login
                                    </Button>
                                </div>
                            ) : mode === 'google' ? (
                                <div className="space-y-8 py-10">
                                    <div className="text-center space-y-2">
                                        <h3 className="text-2xl font-black italic uppercase tracking-tighter">One-Tap <span className="text-blue-500">Registration</span></h3>
                                        <p className="text-xs text-neutral-500 font-medium">Use your existing Google account to join as a partner.</p>
                                    </div>
                                    
                                    <Button 
                                        onClick={() => signInWithGoogle('/partner/onboarding')}
                                        className="w-full h-16 bg-white hover:bg-neutral-200 text-black rounded-3xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-4 transition-all active:scale-95 group shadow-xl"
                                    >
                                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                                            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                        </svg>
                                        Launch with Gmail
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </Button>

                                    <div className="p-6 bg-blue-600/5 rounded-3xl border border-blue-500/10 text-center">
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500 mb-2">Notice</p>
                                        <p className="text-[11px] text-neutral-400 font-medium italic">If Google login fails, please use the <strong>Email Registration</strong> option to bypass configuration issues.</p>
                                    </div>
                                </div>
                            ) : (
                                <form action={handleEmailSignUp} className="space-y-6">
                                    <div className="text-center space-y-2 mb-4">
                                        <h3 className="text-2xl font-black italic uppercase tracking-tighter">Secure <span className="text-blue-500">Sign Up</span></h3>
                                        <p className="text-xs text-neutral-500 font-medium">Create a dedicated partner profile with your email.</p>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
                                            <Input name="email" type="email" required placeholder="Email Address" className="h-14 pl-12 bg-neutral-950/50 border-neutral-800 rounded-2xl font-bold focus:ring-2 focus:ring-blue-600 text-white placeholder:text-neutral-700" />
                                        </div>
                                        <div className="relative">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
                                            <Input name="password" type={showPassword ? "text" : "password"} required placeholder="Secure Password" className="h-14 pl-12 pr-12 bg-neutral-950/50 border-neutral-800 rounded-2xl font-bold focus:ring-2 focus:ring-blue-600 text-white placeholder:text-neutral-700" />
                                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors">
                                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                        <div className="relative">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
                                            <Input name="confirmPassword" type={showConfirmPassword ? "text" : "password"} required placeholder="Confirm Password" className="h-14 pl-12 pr-12 bg-neutral-950/50 border-neutral-800 rounded-2xl font-bold focus:ring-2 focus:ring-blue-600 text-white placeholder:text-neutral-700" />
                                            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors">
                                                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>

                                    {error && (
                                        <div className="p-4 bg-red-600/10 border border-red-500/20 rounded-2xl text-red-500 text-[10px] font-black uppercase text-center tracking-widest">
                                            {error}
                                        </div>
                                    )}

                                    <Button disabled={loading} className="w-full h-16 bg-blue-600 hover:bg-blue-500 text-white rounded-3xl font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-600/20 transition-all active:scale-95 flex items-center justify-center gap-3">
                                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Account & Continue'}
                                        {!loading && <ArrowRight className="w-4 h-4" />}
                                    </Button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>

                {/* Info Bar */}
                <div className="mt-24 flex flex-wrap gap-8 justify-center opacity-50">
                    <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-blue-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest font-mono">End-to-end Encryption</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest font-mono">Bilateral SLAs</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
