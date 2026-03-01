"use client"
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ShoppingBag, Settings, LogOut, DollarSign, Tag, Archive, MessageSquare, HelpCircle, User } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { LogoutButton } from "@/components/auth/LogoutButton";

function NavLink({ href, icon: Icon, label, exact = false }: { href: string; icon: any; label: string; exact?: boolean }) {
    const pathname = usePathname();
    const isActive = exact ? pathname === href : (pathname === href || pathname.startsWith(href + "/"));
    return (
        <Link
            href={href}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${isActive
                ? "bg-neutral-900 text-white"
                : "text-neutral-600 hover:bg-neutral-50"
                }`}
        >
            <Icon className="w-5 h-5" /> {label}
        </Link>
    );
}

export default function SellerDashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen flex flex-col font-sans bg-neutral-50">
            <Navbar />
            <div className="flex-1 container mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
                <aside className="w-full lg:w-64 flex-shrink-0">
                    <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden sticky top-24 flex flex-col max-h-[calc(100vh-120px)]">
                        <div className="p-6 border-b border-neutral-100 bg-neutral-900 text-white">
                            <div className="font-bold">Seller Console</div>
                            <div className="text-xs opacity-70">Retail Partner</div>
                        </div>
                        <nav className="p-4 space-y-1 overflow-y-auto custom-scrollbar flex-1">
                            <NavLink href="/dashboard/seller" icon={LayoutDashboard} label="Overview" exact />
                            <NavLink href="/dashboard/seller/products" icon={Archive} label="Inventory" />
                            <NavLink href="/dashboard/seller/orders" icon={ShoppingBag} label="Orders" />
                            <NavLink href="/dashboard/seller/finance" icon={DollarSign} label="Finance" />
                            <NavLink href="/dashboard/seller/campaigns" icon={Tag} label="Campaigns" />
                            <NavLink href="/dashboard/seller/messages" icon={MessageSquare} label="Messages" />
                            <NavLink href="/dashboard/seller/profile" icon={User} label="Profile" />
                            <NavLink href="/dashboard/seller/support" icon={HelpCircle} label="Support" />
                            <div className="my-2 h-px bg-neutral-100" />
                            <NavLink href="/dashboard/seller/settings" icon={Settings} label="Settings" />
                            <LogoutButton
                                className="w-full text-red-600 hover:bg-red-50"
                                redirectPath="/login"
                            />
                        </nav>
                    </div>
                </aside>
                <div className="flex-1">{children}</div>
            </div>
            <Footer />
        </div>
    );
}
