'use client'

// import { useState } from 'react'
// import { adminSignIn } from './actions'
// import { Button } from '@/components/ui/button'
// import { Input } from '@/components/ui/input'
// import { ShieldCheck } from 'lucide-react'

export default function AdminLoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-neutral-800 p-12 rounded-[40px] shadow-2xl border border-neutral-700">
                <div className="text-center">
                    <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">Admin Console</h2>
                    <p className="mt-4 text-xs font-bold text-neutral-500 uppercase tracking-[0.3em]">Restricted Access Area</p>
                </div>
                {/* 
                <div className="text-center py-10 text-white">
                    Debug Mode: Form temporarily disabled for isolation.
                </div> 
                */}
            </div>
        </div>
    )
}
