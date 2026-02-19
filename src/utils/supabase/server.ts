import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createMockClient } from './mock-client'

export async function createClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    // const url = 'https://nnrzszujwhutbgghtjwc.supabase.co'
    // const key = '...'

    // Validate URL format
    const isValidUrl = (urlString: string | undefined) => {
        try {
            return urlString && new URL(urlString);
        } catch (e) {
            return false;
        }
    };

    console.log('[DEBUG-SERVER] URL:', url, 'Key:', key ? 'EXISTS' : 'MISSING', 'Valid:', isValidUrl(url));

    if (!url || !key || !isValidUrl(url)) {
        if (!isValidUrl(url) && url) {
            console.error('Invalid Supabase URL provided on server:', url);
        } else {
            console.warn('Supabase credentials missing on server. URL:', !!url, 'Key:', !!key)
        }

        if (process.env.NODE_ENV === 'production' && (!url || !key)) {
            console.warn('Supabase credentials missing during build. Using mock client.')
        }
        console.log('[DEBUG-SERVER] Returning MOCK client');
        return createMockClient()
    }

    console.log('Initializing Real Supabase Server Client')

    const cookieStore = await cookies()

    return createServerClient(url || '', key || '', {
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
