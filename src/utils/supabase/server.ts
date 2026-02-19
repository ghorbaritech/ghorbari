'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createMockClient } from './mock-client'

export async function createClient() {
    // Hardcoded credentials to bypass environment variable issues
    const url = 'https://nnrzszujwhutbgghtjwc.supabase.co'
    const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ucnpzenVqd2h1dGJnZ2h0andjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxNTM0MDYsImV4cCI6MjA4NDcyOTQwNn0.Wm5Rt80-9_WyDCIxQVbreNSn9BTlqfgN8HmORGZcsO4'

    // Validate URL format
    const isValidUrl = (urlString: string | undefined) => {
        try {
            return urlString && new URL(urlString);
        } catch (e) {
            return false;
        }
    };

    if (!url || !key || !isValidUrl(url)) {
        if (process.env.NODE_ENV === 'production') {
            console.warn('Supabase credentials missing during execution. Using mock client.')
        }
        return createMockClient()
    }

    const cookieStore = await cookies()

    return createServerClient(url, key, {
        cookies: {
            getAll() {
                return cookieStore.getAll()
            },
            setAll(cookiesToSet) {
                try {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        cookieStore.set(name, value, options)
                    )
                } catch {
                    // This can be ignored if you have middleware refreshing user sessions.
                }
            },
        },
    })
}
