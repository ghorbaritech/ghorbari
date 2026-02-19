import { Sidebar } from '@/components/admin/Sidebar'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()

    const { data: authData, error: authError } = await supabase.auth.getUser()
    const user = authData?.user

    if (authError || !user) {
        redirect('/adminlogin')
    }

    if (!user) {
        redirect('/adminlogin')
    }

    // Optional: Check if user is admin. 
    // This adds a second DB call but is safer. 
    // For now, let's at least ensure they are logged in.
    // Ideally we should check role too.

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()

    // Allow admin, partner, seller, designer, service_provider
    const allowedRoles = ['admin', 'partner', 'seller', 'designer', 'service_provider']

    console.log('Admin Layout Access Check:', { userId: user.id, role: profile?.role, allowed: allowedRoles.includes(profile?.role) });

    if (!profile || !allowedRoles.includes(profile.role)) {
        console.log('Admin Layout Denied. Redirecting to /');
        redirect('/') // Or some unauthorized page
    }

    return (
        <div className="flex min-h-screen bg-[#FDFDFD]">
            <Sidebar />
            <main className="flex-1 min-w-0">
                <div className="p-4 md:p-8 lg:p-12">
                    {children}
                </div>
            </main>
        </div>
    )
}
