import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import PartnerOnboardingForm from '@/components/forms/PartnerOnboardingForm'
import { getCategories } from '@/app/admin/onboarding/actions'
import { Shield, Clock, AlertCircle } from 'lucide-react'

export default async function OnboardingPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/partner')
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    // Redirect if onboarding is already complete (step 4 entails review phase)
    if (profile?.onboarding_step >= 4) {
        redirect('/dashboard')
    }

    // Role check - ensure they have a partner-relevant role or metadata
    const isPartner = profile?.role === 'designer' || profile?.role === 'seller' || profile?.role === 'partner'
    if (!isPartner) {
        // If they just signed up via Google, they might not have a profile role yet.
        // We'll let them stay but the form will handle role initialization.
    }

    const { data: sellerData } = await supabase.from('sellers').select('*').eq('user_id', user.id).maybeSingle()
    const { data: designerData } = await supabase.from('designers').select('*').eq('user_id', user.id).maybeSingle()
    const { data: serviceData } = await supabase.from('service_providers').select('*').eq('user_id', user.id).maybeSingle()

    const initialData = {
        profile,
        user,
        roles: {
            seller: !!sellerData,
            designer: !!designerData,
            service_provider: !!serviceData
        },
        seller_data: sellerData,
        designer_data: designerData,
        service_data: serviceData,
        businessName: sellerData?.business_name || designerData?.company_name || serviceData?.business_name || profile?.full_name
    }

    const categories = await getCategories()

    return (
        <div className="min-h-screen bg-[#050505] text-white selection:bg-blue-500/30 overflow-hidden relative">
            {/* Ambient Background Glows */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full" />

            <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 relative z-10 flex flex-col min-h-screen">
                {/* Header */}
                <nav className="flex justify-between items-center mb-16">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/40">
                            <Shield className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xl font-black italic tracking-tighter uppercase tracking-[0.1em]">Dalan<span className="text-blue-500">kotha</span></span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex flex-col items-end">
                            <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Authenticated As</span>
                            <span className="text-xs font-bold text-blue-400">{user.email}</span>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center">
                            <Clock className="w-4 h-4 text-neutral-500" />
                        </div>
                    </div>
                </nav>

                <main className="flex-1 max-w-5xl mx-auto w-full">
                    <div className="mb-12 space-y-4">
                        <h2 className="text-xs font-black uppercase tracking-[0.3em] text-blue-500 pl-1">Onboarding Journey</h2>
                        <h1 className="text-4xl lg:text-6xl font-black tracking-tighter leading-[0.9] italic uppercase">
                            Setup Your <span className="text-blue-500">Merchant</span> <br />
                            <span className="bg-gradient-to-r from-white to-neutral-500 bg-clip-text text-transparent">Identity</span>
                        </h1>
                        <p className="text-sm text-neutral-400 font-medium max-w-lg leading-relaxed">
                            Welcome to the Dalankotha Partner platform. Please complete the four-step verification process to activate your marketplace listing.
                        </p>
                    </div>

                    <div className="bg-neutral-900/50 backdrop-blur-3xl border border-white/5 p-8 lg:p-12 rounded-[3.5rem] shadow-2xl relative">
                        <PartnerOnboardingForm 
                            availableCategories={categories || []} 
                            initialData={initialData}
                            userId={user.id}
                        />
                    </div>

                    {/* Footer Info */}
                    <div className="mt-12 flex flex-col md:flex-row justify-between items-center gap-6 opacity-40">
                        <div className="flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-blue-500" />
                            <span className="text-[9px] font-black uppercase tracking-widest">Requires valid Trade License & NID</span>
                        </div>
                        <div className="text-[9px] font-black uppercase tracking-widest text-neutral-500">
                            &copy; 2026 Dalankotha Engineering Solutions Ltd.
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}
