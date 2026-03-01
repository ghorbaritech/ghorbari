"use client"
import Link from "next/link";
import { LayoutDashboard, Briefcase, Settings, LogOut, FileText } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { LogoutButton } from "@/components/auth/LogoutButton";

export default function ProviderDashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen flex flex-col font-sans bg-neutral-50">
            <Navbar />
            <div className="flex-1 container mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
                <aside className="w-full lg:w-64 flex-shrink-0">
                    <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden sticky top-24">
                        <div className="p-6 border-b border-neutral-100 bg-blue-900 text-white">
                            <div className="font-bold">Provider Console</div>
                            <div className="text-xs opacity-70">Service Partner</div>
                        </div>
                        <nav className="p-4 space-y-1">
                            <Link href="/dashboard/service-provider" className="flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 rounded-lg text-neutral-600 font-medium">
                                <LayoutDashboard className="w-5 h-5" /> Overview
                            </Link>
                            <Link href="/dashboard/service-provider/services" className="flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 rounded-lg text-neutral-600 font-medium">
                                <Briefcase className="w-5 h-5" /> My Services
                            </Link>
                            <Link href="/dashboard/service-provider/requests" className="flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 rounded-lg text-neutral-600 font-medium">
                                <FileText className="w-5 h-5" /> Requests
                            </Link>
                            <div className="my-2 h-px bg-neutral-100"></div>
                            <Link href="/dashboard/service-provider/settings" className="flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 rounded-lg text-neutral-600 font-medium">
                                <Settings className="w-5 h-5" /> Settings
                            </Link>
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
