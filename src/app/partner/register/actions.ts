'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function partnerSignUp(formData: FormData) {
    try {
        const supabase = await createClient()
        if (!supabase || !supabase.auth) return { error: 'Auth system unavailable.' }

        const email = formData.get('email') as string
        const password = formData.get('password') as string

        const { data, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    onboarding_status: 'pending'
                },
                emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=/onboarding`
            },
        })

        if (signUpError) {
            return { error: signUpError.message }
        }

        if (data?.session) {
            return { success: true, redirect: true }
        }

        // Return success message and flags for email verification
        return { success: true, requiresEmailVerification: true }
    } catch (err) {
        console.error('Partner SignUp Error:', err)
        return { error: 'Unexpected error during registration' }
    }
}
