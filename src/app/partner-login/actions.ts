'use server'

import { createClient } from '@/utils/supabase/server'

export async function partnerSignIn(formData: FormData) {
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
            return { error: error.message }
        }

        if (!data?.user) {
            return { error: 'Login succeeded but user data is missing.' }
        }

        const user = data.user;

        // Verify role
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (profileError || !profile) {
            console.error('Profile Fetch Error:', profileError)
            await supabase.auth.signOut()
            return { error: 'Account profile not found. Please contact support.' }
        }

        console.log('Partner Login Attempt:', { email, role: profile.role });

        // Check if role is designer or seller
        if (profile.role !== 'designer' && profile.role !== 'seller') {
            await supabase.auth.signOut()
            return { error: 'Unauthorized: This portal is for Designers and Sellers only.' }
        }

        return { success: true }
    } catch (err: any) {
        console.error('Unexpected Partner Login Error:', err)
        return { error: `An unexpected error occurred: ${err.message || 'Unknown error'}` }
    }
}
