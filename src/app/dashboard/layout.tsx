import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import Link from "next/link";
import {
    LayoutDashboard,
    ShoppingBag,
    Settings,
    LogOut,
    User,
    FileText,
    MessageSquare,
    Package
} from "lucide-react";
import { createClient } from "@/utils/supabase/server";

import { CustomerSidebarHeader } from "@/components/dashboard/CustomerSidebarHeader";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        // Redirect to login if accessing dashboard without session
        // This prevents the "double layout" issue when logging out
        return (
            <div className="flex min-h-screen items-center justify-center">
                <p>Redirecting...</p>
                <script dangerouslySetInnerHTML={{ __html: `window.location.href = '/login'` }} />
            </div>
        )
    }

    // Check role to determine if we should show the Customer Sidebar
    let isPartner = false
    let profile = null;
    if (user) {
        const { data: userProfile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
        profile = userProfile;
        if (profile && ['seller', 'designer', 'service_provider', 'admin', 'partner'].includes(profile.role)) {
            isPartner = true
        }
    }

    // If it's a partner, they have their own layout (Navbar, Footer, Sidebar) defined in their sub-directory.
    // So we just render children to avoid duplication ("console within console").
    if (isPartner) {
        return <>{children}</>
    }

    // Default: Customer Layout
    return (
        <div className="min-h-screen flex flex-col font-sans bg-neutral-50">
            <Navbar />

            <div className="flex-1 container mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
                {/* Dashboard Sidebar */}
                <aside className="w-full lg:w-64 flex-shrink-0">
                    <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden sticky top-24">
                        <CustomerSidebarHeader profile={profile} email={user.email} />

                        <nav className="p-4 space-y-1">
                            <Link href="/dashboard/customer" className="flex items-center gap-3 px-4 py-3 bg-primary-50 text-primary-700 rounded-lg font-medium">
                                <LayoutDashboard className="w-5 h-5" /> Dashboard
                            </Link>
                            <Link href="/dashboard/customer/orders" className="flex items-center gap-3 px-4 py-3 text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 rounded-lg transition-colors">
                                <ShoppingBag className="w-5 h-5" /> My Orders
                            </Link>
                            <Link href="/dashboard/customer/requests" className="flex items-center gap-3 px-4 py-3 text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 rounded-lg transition-colors">
                                <FileText className="w-5 h-5" /> Service Requests
                            </Link>
                            <Link href="/dashboard/customer/messages" className="flex items-center gap-3 px-4 py-3 text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 rounded-lg transition-colors">
                                <MessageSquare className="w-5 h-5" /> Messages
                            </Link>
                            <Link href="/dashboard/customer/profile" className="flex items-center gap-3 px-4 py-3 text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 rounded-lg transition-colors">
                                <User className="w-5 h-5" /> Profile Settings
                            </Link>
                            <div className="my-2 h-px bg-neutral-100"></div>
                            <button className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium">
                                <LogOut className="w-5 h-5" /> Sign Out
                            </button>
                        </nav>
                    </div>
                </aside>

                {/* Dashboard Content */}
                <div className="flex-1">
                    {children}
                </div>
            </div>

            <Footer />
        </div>
    );
}
