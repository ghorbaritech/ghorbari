'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function signUp(formData: FormData) {
    try {
        const supabase = await createClient()
        if (!supabase || !supabase.auth) return { error: 'Auth system unavailable. Please contact support.' }

        const email = formData.get('email') as string
        const password = formData.get('password') as string
        const fullName = formData.get('fullName') as string
        const phoneNumber = formData.get('phoneNumber') as string
        const address = formData.get('address') as string

        const { error } = await supabase.auth.signUp({
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
    } catch (err) {
        console.error('SignUp Error:', err)
        return { error: 'Unexpected error during sign up' }
    }

    redirect('/dashboard')
}

export async function signIn(formData: FormData, requiredRole?: string) {
    let redirectPath = '/dashboard'

    try {
        const supabase = await createClient()
        if (!supabase || !supabase.auth) return { error: 'System configuration error.' }

        const email = formData.get('email') as string
        const password = formData.get('password') as string

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            return { error: error.message }
        }

        const user = data?.user
        if (!user) return { error: 'Login verification failed.' }

        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        console.log('Login Attempt:', { email, role: profile?.role, requiredRole });

        if (requiredRole) {
            const userRole = profile?.role
            if (userRole) {
                // Allow partners to login if requiredRole matches
                const isPartner = userRole === 'designer' || userRole === 'seller'
                const isRequiredPartner = requiredRole === 'partner'

                if (userRole !== requiredRole && !(isRequiredPartner && isPartner)) {
                    console.log('Role Mismatch:', { actual: userRole, required: requiredRole });
                    await supabase.auth.signOut()
                    return { error: `Unauthorized: This portal is for ${requiredRole}s only.` }
                }
            } else if (requiredRole !== 'customer') {
                await supabase.auth.signOut()
                return { error: `Unauthorized: Profile not found.` }
            }
        }

        if (profile?.role === 'admin') {
            redirectPath = '/admin'
        }
    } catch (err: any) {
        console.error('SignIn Error:', err)
        return { error: 'An unexpected error occurred during login.' }
    }

    redirect(redirectPath)
}

export async function signOut() {
    const supabase = await createClient()
    if (supabase?.auth) await supabase.auth.signOut()
    redirect('/')
}
