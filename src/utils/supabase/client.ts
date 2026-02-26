import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
    // Hardcoded credentials to bypass environment variable issues
    const url = 'https://nnrzszujwhutbgghtjwc.supabase.co'
    const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ucnpzenVqd2h1dGJnZ2h0andjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxNTM0MDYsImV4cCI6MjA4NDcyOTQwNn0.Wm5Rt80-9_WyDCIxQVbreNSn9BTlqfgN8HmORGZcsO4'

    return createBrowserClient(url, key)
}
