'use client'

import { useState } from 'react'
import PartnerOnboardingForm from '@/components/forms/PartnerOnboardingForm'
import { Card } from '@/components/ui/card'
import { Landmark, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function PartnerRegistrationPage() {
    return (
        <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent">
            {/* Header / Branding */}
            <div className="w-full max-w-4xl mb-12 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center transition-transform group-hover:scale-110">
                        <Landmark className="w-6 h-6 text-black" />
                    </div>
                    <div>
                        <div className="text-xl font-black uppercase tracking-tighter text-white">DALANKOTHA</div>
                        <div className="text-[9px] font-black uppercase tracking-[0.3em] text-blue-500">Partner Program</div>
                    </div>
                </Link>

                <div className="hidden md:flex items-center gap-6">
                    <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Already a partner?</span>
                    <Link href="/auth/login" className="px-6 h-10 border border-neutral-800 rounded-xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white hover:border-blue-500 transition-all">
                        Login
                        <ArrowRight className="w-3 h-3" />
                    </Link>
                </div>
            </div>

            {/* Main Content */}
            <div className="w-full max-w-4xl">
                <div className="mb-12 space-y-4">
                    <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter leading-tight italic">
                        BUILD THE <br/>
                        <span className="text-blue-500">FUTURE</span> WITH US.
                    </h1>
                    <p className="text-lg text-neutral-400 font-medium max-w-2xl leading-relaxed">
                        Join Bangladesh's most transparent construction ecosystem. Provision your merchant account in minutes and reach thousands of homeowners.
                    </p>
                </div>

                <div className="bg-neutral-900/50 backdrop-blur-xl border border-neutral-800 rounded-[3rem] p-4 md:p-1">
                    <PartnerOnboardingForm 
                        onCancel={() => window.location.href = '/'}
                    />
                </div>

                <div className="mt-12 text-center text-[10px] text-neutral-600 font-bold uppercase tracking-[0.3em]">
                    SECURE SELF-ONBOARDING • POWERED BY GEMINI OCR
                </div>
            </div>
        </div>
    )
}
