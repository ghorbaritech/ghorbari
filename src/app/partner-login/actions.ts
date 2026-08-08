'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function partnerSignIn(formData: FormData) {
    let redirectPath = '/dashboard'

    try {
        const supabase = await createClient()

        const email = formData.get('email') as string
        const password = formData.get('password') as string

        // Safety Check for client initialization
        if (!supabase || !supabase.auth) {
            console.error('CRITICAL: Supabase auth not initialized in partnerSignIn')
            return { error: 'System configuration error. Please contact support.' }
        }

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            console.error('Partner Login Error:', error.message)
            const errorMessage = error.message === 'Invalid login credentials' 
                ? 'Invalid credentials. If you just registered, please verify your email before logging in.'
                : error.message;
            return { error: errorMessage }
        }

        if (!data?.user) {
            return { error: 'Login succeeded but user data is missing.' }
        }

        const user = data.user;

        // Verify role
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role, onboarding_step')
            .eq('id', user.id)
            .single()
 
        if (profileError || !profile) {
            console.error('Profile Fetch Error:', profileError)
            await supabase.auth.signOut()
            return { error: 'Account profile not found. Please contact support.' }
        }
 
        console.log('Partner Login Attempt:', { email, role: (profile as any).role });
        
        // Fetch designer/seller/provider status to bypass onboarding_step if they are already verified!
        let isVerified = false;
        if (profile.role === 'designer') {
            const { data: d } = await supabase.from('designers').select('verification_status').eq('user_id', user.id).maybeSingle();
            if (d?.verification_status === 'verified') isVerified = true;
        } else if (profile.role === 'service_provider') {
            const { data: sp } = await supabase.from('service_providers').select('verification_status').eq('user_id', user.id).maybeSingle();
            if (sp?.verification_status === 'verified') isVerified = true;
        } else if (profile.role === 'seller') {
            const { data: s } = await supabase.from('sellers').select('verification_status').eq('user_id', user.id).maybeSingle();
            if (s?.verification_status === 'verified') isVerified = true;
        }

        // Finalize redirect path based on status or verification
        if (profile.onboarding_step >= 4 || isVerified) {
             if (profile.role === 'designer') {
                redirectPath = '/dashboard/designer'
            } else if (profile.role === 'service_provider') {
                redirectPath = '/dashboard/service-provider'
            } else {
                // Default to partner dashboard for 'partner', 'seller', or 'customer' (with finished onboarding)
                redirectPath = '/dashboard/partner'
            }
        } else {
            redirectPath = '/partner/onboarding'
        }
    } catch (err: any) {
        if (err.message === 'NEXT_REDIRECT') throw err
        console.error('Unexpected Partner Login Error:', err)
        return { error: `An unexpected error occurred: ${err.message || 'Unknown error'}` }
    }

    // Call redirect outside try-catch so Next.js NEXT_REDIRECT error isn't swallowed
    redirect(redirectPath)
}
