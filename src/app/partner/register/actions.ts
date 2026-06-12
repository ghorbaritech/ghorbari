'use server'

import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { redirect } from 'next/navigation'

export async function partnerSignUp(formData: FormData): Promise<{
    error?: string;
    success?: boolean;
    redirect?: boolean;
    requiresEmailVerification?: boolean;
}> {
    try {
        const email = formData.get('email') as string
        const password = formData.get('password') as string

        const adminClient = createAdminClient()
        const { data: adminData, error: adminError } = await adminClient.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: {
                onboarding_status: 'pending'
            }
        })

        if (adminError) {
            return { error: adminError.message }
        }

        const supabase = await createClient()
        if (!supabase || !supabase.auth) return { error: 'Auth system unavailable.' }

        const { error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (signInError) {
            return { error: signInError.message }
        }

        return { success: true, redirect: true }
    } catch (err) {
        console.error('Partner SignUp Error:', err)
        return { error: 'Unexpected error during registration' }
    }
}
