
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export async function checkAdmin() {
    if (!supabaseUrl || !supabaseServiceKey) {
        console.error("Missing credentials")
        return
    }
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    console.log("Checking for admin user...")
    const { data: admin, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'admin')
        .limit(1)
        .single()

    if (error) {
        console.error("Error fetching admin:", error)
    } else {
        console.log("Admin found:", admin)
    }
}

if (require.main === module) {
    checkAdmin()
}
