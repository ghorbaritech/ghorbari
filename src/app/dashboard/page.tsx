import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    console.log(`[DashboardEntry] User: ${user?.email || 'None'}`)

    if (!user) {
        console.log('[DashboardEntry] No user found, redirecting to /login')
        redirect('/login')
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role, onboarding_step')
        .eq('id', user.id)
        .single()

    console.log(`[DashboardEntry] Profile Role: ${profile?.role || 'None'}, Step: ${profile?.onboarding_step}`)

    if (profile?.role) {
        if (profile.role === 'admin') {
            redirect('/admin')
        }
        
        // Partner roles check
        const isPartner = ['designer', 'seller', 'service_provider', 'partner'].includes(profile.role) || profile.onboarding_step >= 4
        
        const isAllowedDirectly = profile.onboarding_step >= 4

        if (isPartner && !isAllowedDirectly) {
            console.log(`[DashboardEntry] Partner onboarding incomplete, redirecting to /partner/onboarding`)
            redirect('/partner/onboarding')
        }

        // If they have completed onboarding, they should go to a partner-specific dashboard
        if (isAllowedDirectly) {
            if (profile.role === 'designer') {
                redirect('/dashboard/designer')
            } else if (profile.role === 'service_provider') {
                redirect('/dashboard/service-provider')
            } else {
                // Default partner dashboard for 'partner', 'seller', or 'customer' (if they finished onboarding)
                redirect('/dashboard/partner')
            }
        }
        
        // Fallback for real customers (no onboarding finished, role is customer)
        redirect(`/dashboard/${profile.role}`)
    }

    // fallback: if step >= 4 but role is missing, they are likely a partner in-transit
    if (profile?.onboarding_step >= 4) {
        console.log('[DashboardEntry] Role missing but onboarding complete, forcing /dashboard/partner as fallback')
        redirect('/dashboard/partner')
    }

    console.log('[DashboardEntry] No partner status or role found in profile, redirecting to home')
    redirect('/')
}
