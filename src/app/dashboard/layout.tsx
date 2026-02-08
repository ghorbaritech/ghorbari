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

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex flex-col font-sans bg-neutral-50">
            <Navbar />

            <div className="flex-1 container mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
                {/* Dashboard Sidebar */}
                <aside className="w-full lg:w-64 flex-shrink-0">
                    <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden sticky top-24">
                        <div className="p-6 border-b border-neutral-100 bg-neutral-900 text-white">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center font-bold text-lg">
                                    M
                                </div>
                                <div>
                                    <div className="font-bold">MD. Rahim</div>
                                    <div className="text-xs opacity-70">Customer Account</div>
                                </div>
                            </div>
                        </div>

                        <nav className="p-4 space-y-1">
                            <Link href="/dashboard/customer" className="flex items-center gap-3 px-4 py-3 bg-primary-50 text-primary-700 rounded-lg font-medium">
                                <LayoutDashboard className="w-5 h-5" /> Dashboard
                            </Link>
                            <Link href="#" className="flex items-center gap-3 px-4 py-3 text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 rounded-lg transition-colors">
                                <ShoppingBag className="w-5 h-5" /> My Orders
                            </Link>
                            <Link href="#" className="flex items-center gap-3 px-4 py-3 text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 rounded-lg transition-colors">
                                <FileText className="w-5 h-5" /> Service Requests
                            </Link>
                            <Link href="#" className="flex items-center gap-3 px-4 py-3 text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 rounded-lg transition-colors">
                                <MessageSquare className="w-5 h-5" /> Messages
                            </Link>
                            <Link href="#" className="flex items-center gap-3 px-4 py-3 text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 rounded-lg transition-colors">
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
