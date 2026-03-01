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
    MessageSquare
} from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { CustomerSidebarHeader } from "@/components/dashboard/CustomerSidebarHeader";
import { LogoutButton } from "@/components/auth/LogoutButton";

export default async function CustomerDashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <p>Redirecting...</p>
                <script dangerouslySetInnerHTML={{ __html: `window.location.href = '/login'` }} />
            </div>
        )
    }

    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

    return (
        <div className="min-h-screen flex flex-col font-sans bg-neutral-50">
            <Navbar />

            <div className="flex-1 container mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
                {/* Dashboard Sidebar */}
                <aside className="w-full lg:w-64 flex-shrink-0">
                    <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden sticky top-24 flex flex-col max-h-[calc(100vh-120px)]">
                        <CustomerSidebarHeader profile={profile} email={user?.email} />

                        <nav className="p-4 space-y-1 overflow-y-auto custom-scrollbar flex-1">
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
                            <LogoutButton
                                className="w-full text-red-600 hover:bg-red-50"
                                redirectPath="/login"
                            />
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
