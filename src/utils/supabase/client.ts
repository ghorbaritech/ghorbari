import { createBrowserClient } from '@supabase/ssr'
import { createMockClient } from './mock-client'

export function createClient() {
    // Hardcoded credentials to bypass environment variable issues
    const url = 'https://nnrzszujwhutbgghtjwc.supabase.co'
    const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ucnpzenVqd2h1dGJnZ2h0andjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxNTM0MDYsImV4cCI6MjA4NDcyOTQwNn0.Wm5Rt80-9_WyDCIxQVbreNSn9BTlqfgN8HmORGZcsO4'
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
