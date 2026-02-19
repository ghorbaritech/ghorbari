import { createClient } from '@supabase/supabase-js'
import { createMockClient } from './mock-client'

export function createAdminClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
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

    if (!url || !key || !isValidUrl(url)) {
        if (!isValidUrl(url) && url) {
            console.error('Invalid Supabase URL provided in admin utils:', url);
        } else {
            console.warn('Supabase Admin credentials missing. URL:', !!url, 'Key:', !!key)
        }

        if (process.env.NODE_ENV === 'production' && (!url || !key)) {
            console.warn('Supabase Admin credentials missing during build. Using mock client.')
        }
        return createMockClient()
    }

    return createClient(url, key, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    })
}
