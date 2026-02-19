"use client"
import Link from "next/link";
import { LayoutDashboard, ShoppingBag, Settings, LogOut, DollarSign, Tag, Archive, MessageSquare, HelpCircle } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function SellerDashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen flex flex-col font-sans bg-neutral-50">
            <Navbar />
            <div className="flex-1 container mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
                <aside className="w-full lg:w-64 flex-shrink-0">
                    <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden sticky top-24">
                        <div className="p-6 border-b border-neutral-100 bg-neutral-900 text-white">
                            <div className="font-bold">Seller Console</div>
                            <div className="text-xs opacity-70">Retail Partner</div>
                        </div>
                        <nav className="p-4 space-y-1">
                            <Link href="/dashboard/seller" className="flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 rounded-lg text-neutral-600 font-medium">
                                <LayoutDashboard className="w-5 h-5" /> Overview
                            </Link>
                            <Link href="/dashboard/seller/products" className="flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 rounded-lg text-neutral-600 font-medium">
                                <Archive className="w-5 h-5" /> Products
                            </Link>
                            <Link href="/dashboard/seller/orders" className="flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 rounded-lg text-neutral-600 font-medium">
                                <ShoppingBag className="w-5 h-5" /> Orders
                            </Link>
                            <Link href="/dashboard/seller/finance" className="flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 rounded-lg text-neutral-600 font-medium">
                                <DollarSign className="w-5 h-5" /> Finance
                            </Link>
                            <Link href="/dashboard/seller/campaigns" className="flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 rounded-lg text-neutral-600 font-medium">
                                <Tag className="w-5 h-5" /> Campaigns
                            </Link>
                            <Link href="/dashboard/seller/messages" className="flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 rounded-lg text-neutral-600 font-medium">
                                <MessageSquare className="w-5 h-5" /> Messages
                            </Link>
                            <Link href="/dashboard/seller/support" className="flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 rounded-lg text-neutral-600 font-medium">
                                <HelpCircle className="w-5 h-5" /> Support
                            </Link>
                            <div className="my-2 h-px bg-neutral-100"></div>
                            <Link href="/dashboard/seller/settings" className="flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 rounded-lg text-neutral-600 font-medium">
                                <Settings className="w-5 h-5" /> Settings
                            </Link>
                            <button className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium">
                                <LogOut className="w-5 h-5" /> Sign Out
                            </button>
                        </nav>
                    </div>
                </aside>
                <div className="flex-1">{children}</div>
            </div>
            <Footer />
        </div>
    );
}
