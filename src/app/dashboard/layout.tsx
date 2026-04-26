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
        return (
            <div className="flex min-h-screen items-center justify-center bg-neutral-950 text-white">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-sm font-bold uppercase tracking-widest animate-pulse">Redirecting to Authorization...</p>
                </div>
                <script dangerouslySetInnerHTML={{ __html: `
                    const isPartner = window.location.pathname.includes('/partner') || 
                                      window.location.pathname.includes('/designer') || 
                                      window.location.pathname.includes('/service-provider');
                    window.location.href = isPartner ? '/partner' : '/login';
                ` }} />
            </div>
        )
    }

    // Role-specific layouts (customer, seller, designer, etc.) are defined in their sub-directories.
    // The root layout simply renders the sub-layout for each role.
    return <>{children}</>;
}
