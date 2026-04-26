'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    LayoutDashboard,
    ShoppingBag,
    Users,
    Package,
    PlusCircle,
    Settings,
    LogOut,
    Menu,
    X,
    ShieldCheck,
    FileText,
    Flag,
    Tag,
    MessageSquare,
    LifeBuoy,
    Bot,
    Gavel
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { createClient } from '@/utils/supabase/client'
import { getBrandingSettings } from '@/services/brandingService'
import Image from 'next/image'

type Role = 'admin' | 'partner' | 'seller' | 'designer' | 'service_provider' | string

const NAV_ITEMS = [
    { label: 'Overview', icon: LayoutDashboard, href: '/admin', allowedRoles: ['admin'] },
    { label: 'Order Factory', icon: ShoppingBag, href: '/admin/orders', allowedRoles: ['admin', 'seller'] },
    { label: 'User Hub', icon: Users, href: '/admin/users', allowedRoles: ['admin'] },
    { label: 'CMS Manager', icon: FileText, href: '/admin/cms', allowedRoles: ['admin'] },
    { label: 'Milestones', icon: Flag, href: '/admin/milestones', allowedRoles: ['admin', 'designer', 'service_provider'] },
    { label: 'Categories', icon: Tag, href: '/admin/categories', allowedRoles: ['admin'] },
    { label: 'Factory', icon: Package, href: '/admin/factory', allowedRoles: ['admin', 'seller'] },
    { label: 'Place Order', icon: PlusCircle, href: '/admin/concierge', allowedRoles: ['admin'] },
    { label: 'Messages', icon: MessageSquare, href: '/admin/messages', allowedRoles: ['admin', 'partner', 'designer', 'seller', 'service_provider'] },
    { label: 'Support', icon: LifeBuoy, href: '/admin/support', allowedRoles: ['admin'] },
    { label: 'Settings', icon: Settings, href: '/admin/settings', allowedRoles: ['admin', 'partner', 'designer', 'seller', 'service_provider'] },
    { label: 'AI Training', icon: Bot, href: '/admin/ai-training', allowedRoles: ['admin'] },
    { label: 'LegalSign', icon: Gavel, href: '/admin/legal', allowedRoles: ['admin'] },
]

export function Sidebar() {
    const pathname = usePathname()
    // Default to expanded on desktop, collapsed on mobile
    const [isOpen, setIsOpen] = useState(true)
    const [userRole, setUserRole] = useState<Role>('admin')
    const [logoUrl, setLogoUrl] = useState<string>("/logo-dalankotha-white-bg.png");

    useEffect(() => {
        getBrandingSettings().then(settings => {
            if (settings?.logo_light_url) setLogoUrl(settings.logo_light_url);
        });
        // Collapse by default on mobile screens
        if (window.innerWidth < 1024) {
            setIsOpen(false)
        }

        const supabase = createClient()
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (!user) return
            supabase.from('profiles').select('role').eq('id', user.id).single().then(({ data }) => {
                if (data?.role) setUserRole(data.role)
            })
        })
    }, [])

    const visibleNavItems = NAV_ITEMS.filter(item => item.allowedRoles.includes(userRole))

    return (
        <>
            {/* Mobile Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-neutral-900 rounded-xl shadow-lg border border-neutral-800 text-neutral-300"
            >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Mobile overlay backdrop */}
            {isOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/60 z-30"
                    onClick={() => setIsOpen(false)}
                    aria-hidden="true"
                />
            )}

            {/* Sidebar Container */}
            {/* Desktop toggle button — collapses sidebar to icon-only rail */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
                className="hidden lg:flex fixed top-6 z-50 items-center justify-center w-7 h-7 rounded-full bg-neutral-800 border border-neutral-700 text-neutral-400 hover:text-white hover:bg-neutral-700 transition-all shadow-lg"
                style={{ left: isOpen ? '270px' : '66px' }}
            >
                {isOpen ? <X className="w-3.5 h-3.5" /> : <Menu className="w-3.5 h-3.5" />}
            </button>

            <aside className={cn(
                "fixed left-0 top-0 h-screen bg-neutral-950 border-r border-neutral-800 transition-all duration-300 z-40",
                isOpen ? "w-72" : "w-0 overflow-hidden lg:w-20 lg:overflow-visible"
            )}>
                <div className="flex flex-col h-full overflow-hidden">
                    {/* Brand */}
                    <div className="flex items-center gap-3 mb-8 px-6 pt-6 flex-shrink-0">
                        <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary-900/50 overflow-hidden">
                            <Image 
                                src={logoUrl} 
                                alt="Logo" 
                                width={40} 
                                height={40} 
                                className="object-contain"
                            />
                        </div>
                        {isOpen && (
                            <div className="animate-in fade-in slide-in-from-left-4 duration-500">
                                <h2 className="text-xl font-black tracking-tighter text-white leading-none uppercase">Dalankotha</h2>
                                <p className="text-[10px] font-black uppercase text-neutral-500 tracking-widest leading-none mt-1">Admin Console</p>
                            </div>
                        )}
                    </div>

                    {/* Navigation — role-filtered */}
                    <nav aria-label="Admin navigation" className={cn(
                        "flex-1 overflow-y-auto space-y-2 custom-scrollbar pb-6",
                        isOpen ? "px-6" : "px-3"
                    )}>
                        {visibleNavItems.map((item) => {
                            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
                            return (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    aria-current={isActive ? 'page' : undefined}
                                    className={cn(
                                        "flex items-center gap-4 p-4 rounded-2xl transition-all group relative",
                                        isActive
                                            ? "bg-neutral-900 text-blue-500 shadow-inner"
                                            : "text-neutral-400 hover:bg-neutral-900/50 hover:text-neutral-200"
                                    )}
                                >
                                    <item.icon className={cn(
                                        "w-6 h-6 transition-transform group-hover:scale-110",
                                        isActive ? "text-blue-500" : "text-neutral-500 group-hover:text-neutral-300"
                                    )} />
                                    {isOpen && (
                                        <span className="font-bold text-sm tracking-tight">{item.label}</span>
                                    )}
                                    {isActive && (
                                        <div className="absolute right-2 w-1.5 h-6 bg-blue-500 rounded-full animate-in fade-in slide-in-from-right-2 duration-300" />
                                    )}
                                </Link>
                            )
                        })}
                    </nav>

                    {/* Footer Actions */}
                    <div className="mt-auto px-6 py-6 border-t border-neutral-800 bg-neutral-950 flex-shrink-0">
                        <button
                            onClick={async () => {
                                const supabase = createClient()
                                await supabase.auth.signOut()
                                window.location.href = '/adminlogin'
                            }}
                            aria-label="Sign out of admin console"
                            className={cn(
                                "flex items-center gap-4 p-4 rounded-2xl transition-all group relative w-full text-neutral-400 hover:text-rose-500 hover:bg-rose-500/10",
                                !isOpen && "px-4"
                            )}
                        >
                            <LogOut className="w-6 h-6 transition-transform group-hover:scale-110" />
                            {isOpen && <span className="font-bold text-sm tracking-tight">Sign Out</span>}
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Spacer for Desktop */}
            <div className={cn(
                "hidden lg:block flex-shrink-0 transition-all duration-300",
                isOpen ? "w-72" : "w-20"
            )} />
        </>
    )
}
