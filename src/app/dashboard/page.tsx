import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    console.log(`[DashboardEntry] User: ${user?.email || 'None'}`)

    if (!user) {
        console.log('[DashboardEntry] No user found, redirecting to /login')
        redirect('/login')
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    console.log(`[DashboardEntry] Profile Role: ${profile?.role || 'None'}`)

    if (profile?.role) {
        if (profile.role === 'admin') {
            redirect('/admin')
        }
        // Handle all roles including designers and sellers
        redirect(`/dashboard/${profile.role}`)
    }

    console.log('[DashboardEntry] No role found in profile, redirecting to home')
    redirect('/')
}
