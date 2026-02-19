import { createBrowserClient } from '@supabase/ssr'
import { createMockClient } from './mock-client'

export function createClient() {
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

    console.log('[DEBUG-CLIENT] URL:', url, 'Key:', key ? 'EXISTS' : 'MISSING', 'Valid:', isValidUrl(url));

    if (!url || !key || !isValidUrl(url)) {
        if (process.env.NODE_ENV !== 'production' && (!url || !key)) {
            console.warn('Supabase credentials missing or invalid. URL:', url, 'Key exists:', !!key);
        } else if (!isValidUrl(url)) {
            console.error('Invalid Supabase URL provided:', url);
        }

        // Return mock client if credentials are missing or invalid to prevent crash
        console.log('[DEBUG-CLIENT] Returning MOCK client');
        return createMockClient()
    }

    return createBrowserClient(url, key)
}
