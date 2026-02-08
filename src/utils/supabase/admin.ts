import { createClient } from '@supabase/supabase-js'
import { createMockClient } from './mock-client'

export function createAdminClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!url || !key) {
        if (process.env.NODE_ENV === 'production') {
            console.warn('Supabase Admin credentials missing during build. Using mock client.')
        }
        return createMockClient()
    }

    return createClient(url!, key!, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    })
}
