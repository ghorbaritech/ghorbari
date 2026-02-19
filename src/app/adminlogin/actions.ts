'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function adminSignIn(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const { data: { user }, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        return { error: error.message }
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user?.id)
        .single()

    console.log('Admin Login Attempt:', { email, role: profile?.role });

    if (!profile || profile.role !== 'admin') {
        await supabase.auth.signOut()
        return { error: 'Unauthorized: Access restricted to Administrators only.' }
    }

    redirect('/admin')
}
