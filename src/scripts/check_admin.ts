
import { createClient } from '@/utils/supabase/server'

export async function checkAdmin() {
    const supabase = createClient()

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
