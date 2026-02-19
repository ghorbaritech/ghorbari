'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function adminSignIn(formData: FormData) {
    try {
        const supabase = await createClient()

        const email = formData.get('email') as string
        const password = formData.get('password') as string

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            console.error('Admin Login Error:', error.message)
            return { error: error.message }
        }

        const user = data.user;

        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user?.id)
            .single()

        if (profileError) {
            console.error('Profile Fetch Error:', profileError)
            return { error: 'Failed to verify admin privileges.' }
        }

        console.log('Admin Login Attempt:', { email, role: profile?.role });

        if (!profile || profile.role !== 'admin') {
            await supabase.auth.signOut()
            return { error: 'Unauthorized: Access restricted to Administrators only.' }
        }
    } catch (err: any) {
        console.error('Unexpected Admin Login Error:', err)
        console.error('Error Details:', JSON.stringify(err, Object.getOwnPropertyNames(err)))
        return { error: `An unexpected error occurred: ${err.message || 'Unknown error'}` }
    }

    return { success: true }
}
