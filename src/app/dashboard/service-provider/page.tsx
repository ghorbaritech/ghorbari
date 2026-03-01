'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Card } from '@/components/ui/card'
import {
    Briefcase,
    FileText,
    Settings,
    TrendingUp,
    CheckCircle2,
    Clock,
    Star
} from 'lucide-react'

export default function ProviderDashboard() {
    const [provider, setProvider] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        async function fetchProvider() {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const { data: sp } = await supabase
                    .from('service_providers')
                    .select('*')
                    .eq('user_id', user.id)
                    .single()
                setProvider(sp)
            }
            setLoading(false)
        }
        fetchProvider()
    }, [])

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-black text-neutral-900 italic tracking-tight uppercase">
                    {provider?.business_name || 'Provider Console'}
                </h1>
                <div className="bg-blue-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                    Service Partner
                </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6 border-none bg-white rounded-3xl shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                            <Briefcase className="w-5 h-5" />
                        </div>
                        <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Active Services</p>
                    </div>
                    <p className="text-3xl font-black text-neutral-900">0</p>
                </Card>
                <Card className="p-6 border-none bg-white rounded-3xl shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-green-50 text-green-600 rounded-2xl">
                            <Clock className="w-5 h-5" />
                        </div>
                        <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Pending Requests</p>
                    </div>
                    <p className="text-3xl font-black text-neutral-900">0</p>
                </Card>
                <Card className="p-6 border-none bg-white rounded-3xl shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
                            <Star className="w-5 h-5" />
                        </div>
                        <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Average Rating</p>
                    </div>
                    <p className="text-3xl font-black text-neutral-900">--</p>
                </Card>
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="p-8 border-none bg-white rounded-[40px] shadow-sm">
                    <h2 className="text-xl font-black text-neutral-900 italic uppercase mb-6 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-blue-600" /> Recent Performance
                    </h2>
                    <div className="py-12 text-center text-neutral-400 font-bold uppercase text-xs tracking-widest italic">
                        No activity data available for this period.
                    </div>
                </Card>

                <Card className="p-8 border-none bg-white rounded-[40px] shadow-sm">
                    <h2 className="text-xl font-black text-neutral-900 italic uppercase mb-6 flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-600" /> Quick Tasks
                    </h2>
                    <div className="space-y-4">
                        <div className="p-4 bg-neutral-50 rounded-2xl flex items-center justify-between">
                            <span className="text-xs font-bold text-neutral-600">Update Service Portfolio</span>
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                        </div>
                        <div className="p-4 bg-neutral-50 rounded-2xl flex items-center justify-between">
                            <span className="text-xs font-bold text-neutral-600">Complete Profile Verification</span>
                            <div className="w-2 h-2 bg-amber-500 rounded-full" />
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    )
}
