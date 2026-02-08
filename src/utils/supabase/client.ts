import { createBrowserClient } from '@supabase/ssr'
import { createMockClient } from './mock-client'

export function createClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!url || !key) {
        if (process.env.NODE_ENV === 'production') {
            console.warn('Supabase credentials missing during build. Using mock client.')
        }
        return createMockClient()
    }

    return createBrowserClient(url, key)
}
