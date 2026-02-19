'use client'

import { useState } from 'react'
import { adminSignIn } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ShieldCheck } from 'lucide-react'

export default function AdminLoginPage() {
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        setError(null)
        const result = await adminSignIn(formData)
        if (result?.error) {
            setError(result.error)
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-neutral-800 p-12 rounded-[40px] shadow-2xl border border-neutral-700">
                <div className="text-center">
                    <div className="flex justify-center mb-6">
                        <div className="p-4 bg-orange-600 rounded-3xl shadow-lg shadow-orange-900/50">
                            <ShieldCheck className="w-10 h-10 text-white" />
                        </div>
                    </div>
                    <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">Admin Console</h2>
                    <p className="mt-4 text-xs font-bold text-neutral-500 uppercase tracking-[0.3em]">Restricted Access Area</p>
                </div>
                <form className="mt-8 space-y-6" action={handleSubmit}>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-neutral-400 pl-1">Admin Identity</label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                required
                                className="h-14 bg-neutral-700 border-none text-white rounded-2xl font-bold placeholder:text-neutral-500 focus:ring-2 focus:ring-orange-600 shadow-inner"
                                placeholder="name@ghorbari.com"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-neutral-400 pl-1">Security Key</label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="h-14 bg-neutral-700 border-none text-white rounded-2xl font-bold placeholder:text-neutral-500 focus:ring-2 focus:ring-orange-600 shadow-inner"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="text-orange-500 text-[10px] font-black uppercase text-center bg-orange-500/10 py-3 rounded-xl border border-orange-500/20">
                            {error}
                        </div>
                    )}

                    <Button
                        type="submit"
                        className="w-full h-16 bg-white hover:bg-neutral-200 text-neutral-900 font-black uppercase tracking-widest rounded-3xl shadow-xl transition-all active:scale-[0.98]"
                        disabled={loading}
                    >
                        {loading ? 'AUTHENTICATING...' : 'SECURE SIGN IN'}
                    </Button>
                </form>
                <p className="text-center text-[10px] font-bold text-neutral-600 uppercase tracking-widest">
                    Authorized Personnel Only
                </p>
            </div>
        </div>
    )
}
