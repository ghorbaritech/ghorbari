'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function adminSignIn(formData: FormData) {
    try {
        const supabase = await createClient()

        const email = formData.get('email') as string
        const password = formData.get('password') as string

        console.log('Admin SignIn Action - Start');
        console.log('Supabase Client:', !!supabase);
        console.log('Supabase Auth:', !!supabase?.auth);
        console.log('SignInWithPassword Function:', typeof supabase?.auth?.signInWithPassword);

        if (!supabase || !supabase.auth || typeof supabase.auth.signInWithPassword !== 'function') {
            console.error('CRITICAL: Supabase client or auth definition failing', {
                hasClient: !!supabase,
                hasAuth: !!supabase?.auth,
                authType: typeof supabase?.auth,
                signInType: typeof supabase?.auth?.signInWithPassword
            });
        }

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
