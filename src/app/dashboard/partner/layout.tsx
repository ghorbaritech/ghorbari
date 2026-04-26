"use client"
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ShoppingBag, Settings, LogOut, DollarSign, Tag, Archive, MessageSquare, HelpCircle, User, FileCheck } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { LogoutButton } from "@/components/auth/LogoutButton";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

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
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        async function fetchStatus() {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data } = await supabase.from('profiles').select('full_name, onboarding_status, role').eq('id', user.id).single();
                setProfile(data);
                
                // Also check role-specific status if needed
                const { data: seller } = await supabase.from('sellers').select('verification_status, business_name').eq('user_id', user.id).maybeSingle();
                const { data: designer } = await supabase.from('designers').select('verification_status, company_name').eq('user_id', user.id).maybeSingle();
                const { data: service } = await supabase.from('service_providers').select('verification_status, business_name').eq('user_id', user.id).maybeSingle();
                
                const vStatus = seller?.verification_status || designer?.verification_status || service?.verification_status || 'pending';
                const bName = seller?.business_name || designer?.company_name || service?.business_name || data?.full_name || 'Partner Account';
                
                setProfile((prev: any) => ({ ...prev, verification_status: vStatus, business_name: bName }));
            }
            setLoading(false);
        }
        fetchStatus();
    }, []);

    const getStatusInfo = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'verified': return { icon: FileCheck, color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'Verified' };
            case 'in_review': return { icon: ShoppingBag, color: 'text-amber-400', bg: 'bg-amber-500/10', label: 'In Review' };
            case 'pending': return { icon: LayoutDashboard, color: 'text-blue-400', bg: 'bg-blue-500/10', label: 'Pending' };
            case 'suspended': return { icon: LogOut, color: 'text-red-400', bg: 'bg-red-500/10', label: 'Suspended' };
            default: return { icon: HelpCircle, color: 'text-neutral-400', bg: 'bg-neutral-500/10', label: 'Unverified' };
        }
    };

    // Correcting icon reference
    const StatusIcon = profile?.verification_status === 'verified' ? FileCheck : 
                     profile?.verification_status === 'in_review' ? ShoppingBag : 
                     HelpCircle;

    return (
        <div className="min-h-screen flex flex-col font-sans bg-neutral-50">
            <Navbar />
            <div className="flex-1 container mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
                <aside className="w-full lg:w-64 flex-shrink-0">
                    <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden sticky top-24 flex flex-col max-h-[calc(100vh-120px)]">
                        <div className="p-6 border-b border-neutral-100 bg-neutral-900 text-white relative overflow-hidden">
                            {/* Accent blur */}
                            <div className="absolute -top-4 -right-4 w-16 h-16 bg-blue-500/20 blur-2xl rounded-full" />
                            
                            <div className="relative z-10">
                                <div className="text-xs font-black uppercase tracking-[0.2em] text-neutral-500 mb-1">Navigation</div>
                                <div className="text-lg font-black italic uppercase leading-none mb-3">Partner Dashboard</div>
                                
                                {loading ? (
                                    <div className="animate-pulse flex items-center gap-2">
                                        <div className="w-16 h-3 bg-white/10 rounded" />
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-2">
                                        <div className="text-xs font-bold truncate opacity-80">{profile?.business_name}</div>
                                        <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                            profile?.verification_status === 'verified' ? 'bg-emerald-500/10 text-emerald-400' :
                                            profile?.verification_status === 'in_review' ? 'bg-amber-500/10 text-amber-400' :
                                            'bg-neutral-500/10 text-neutral-400'
                                        }`}>
                                            <StatusIcon className="w-2.5 h-2.5" />
                                            {profile?.verification_status?.replace('_', ' ') || 'Pending'}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        <nav className="p-4 space-y-1 overflow-y-auto custom-scrollbar flex-1">
                            <NavLink href="/dashboard/partner" icon={LayoutDashboard} label="Overview" exact />
                            <NavLink href="/dashboard/partner/products" icon={Archive} label="Inventory" />
                            <NavLink href="/dashboard/partner/orders" icon={ShoppingBag} label="Orders" />
                            <NavLink href="/dashboard/partner/finance" icon={DollarSign} label="Finance" />
                            <NavLink href="/dashboard/partner/campaigns" icon={Tag} label="Campaigns" />
                            <NavLink href="/dashboard/partner/messages" icon={MessageSquare} label="Messages" />
                            <NavLink href="/dashboard/partner/profile" icon={User} label="Profile" />
                            <NavLink href="/dashboard/partner/legal" icon={FileCheck} label="Contracts" />
                            <NavLink href="/dashboard/partner/support" icon={HelpCircle} label="Support" />
                            <div className="my-2 h-px bg-neutral-100" />
                            <NavLink href="/dashboard/partner/settings" icon={Settings} label="Settings" />
                            <LogoutButton
                                className="w-full text-red-600 hover:bg-red-50"
                                redirectPath="/partner"
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
