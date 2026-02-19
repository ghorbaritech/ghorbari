'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function signUp(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const fullName = formData.get('fullName') as string
    const phoneNumber = formData.get('phoneNumber') as string
    const address = formData.get('address') as string

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName,
                phone_number: phoneNumber,
                address: address,
                role: 'customer',
            },
        },
    })

    if (error) {
        return { error: error.message }
    }

    // Profile is created via DB trigger

    redirect('/dashboard')
}

export async function signIn(formData: FormData, requiredRole?: string) {
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

    console.log('Login Attempt:', { email, role: profile?.role, requiredRole });

    if (requiredRole && user) {
        if (profile) {
            if (profile.role !== requiredRole && !(requiredRole === 'partner' && (profile?.role === 'designer' || profile?.role === 'seller'))) {
                console.log('Login Unauthorized: Role Mismatch', { actual: profile.role, required: requiredRole });
                await supabase.auth.signOut()
                return { error: `Unauthorized: This portal is for ${requiredRole}s only.` }
            }
        } else if (requiredRole !== 'customer') {
            await supabase.auth.signOut()
            return { error: `Unauthorized: Profile not found. Please contact support.` }
        }
    }

    if (profile?.role === 'admin') {
        console.log('Login Redirecting to /admin');
        redirect('/admin')
    }

    console.log('Login Redirecting to /dashboard');
    redirect('/dashboard')
}

export async function signOut() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/')
}
