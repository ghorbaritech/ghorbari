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
            <div className="flex min-h-screen items-center justify-center">
                <p>Redirecting...</p>
                <script dangerouslySetInnerHTML={{ __html: `window.location.href = '/login'` }} />
            </div>
        )
    }

    // Role-specific layouts (customer, seller, designer, etc.) are defined in their sub-directories.
    // The root layout simply renders the sub-layout for each role.
    return <>{children}</>;
}
