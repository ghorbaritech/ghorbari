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
    Bot
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const NAV_ITEMS = [
    { label: 'Overview', icon: LayoutDashboard, href: '/admin' },
    { label: 'Order Factory', icon: ShoppingBag, href: '/admin/orders' },
    { label: 'User Hub', icon: Users, href: '/admin/users' },
    { label: 'CMS Manager', icon: FileText, href: '/admin/cms' },
    { label: 'Milestones', icon: Flag, href: '/admin/milestones' },
    { label: 'Categories', icon: Tag, href: '/admin/categories' },
    { label: 'Factory', icon: Package, href: '/admin/factory' },
    { label: 'Place Order', icon: PlusCircle, href: '/admin/concierge' },
    { label: 'Messages', icon: MessageSquare, href: '/admin/messages' },
    { label: 'Support', icon: LifeBuoy, href: '/admin/support' },
    { label: 'Settings', icon: Settings, href: '/admin/settings' },
    { label: 'AI Training', icon: Bot, href: '/admin/ai-training' },
]

export function Sidebar() {
    const pathname = usePathname()
    const [isOpen, setIsOpen] = useState(true)

    return (
        <>
            {/* Mobile Toggle */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-neutral-900 rounded-xl shadow-lg border border-neutral-800 text-neutral-300"
            >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Sidebar Container */}
            <aside className={cn(
                "fixed left-0 top-0 h-screen bg-neutral-950 border-r border-neutral-800 transition-all duration-300 z-40",
                isOpen ? "w-72" : "w-20 -left-20 lg:left-0 lg:w-20"
            )}>
                <div className="flex flex-col h-full overflow-hidden">
                    {/* Brand */}
                    <div className="flex items-center gap-3 mb-8 px-6 pt-6 flex-shrink-0">
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-900/50">
                            <ShieldCheck className="w-6 h-6 text-white" />
                        </div>
                        {isOpen && (
                            <div className="animate-in fade-in slide-in-from-left-4 duration-500">
                                <h2 className="text-xl font-black italic tracking-tighter text-white leading-none">ADMIN</h2>
                                <p className="text-[10px] font-black uppercase text-neutral-500 tracking-widest leading-none mt-1">Ghorbari Console</p>
                            </div>
                        )}
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 overflow-y-auto px-6 space-y-2 custom-scrollbar pb-6">
                        {NAV_ITEMS.map((item) => {
                            const isActive = pathname.startsWith(item.href)
                            return (
                                <Link
                                    key={item.label}
                                    href={item.href}
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
                                const supabase = (await import('@/utils/supabase/client')).createClient()
                                await supabase.auth.signOut()
                                window.location.href = '/adminlogin'
                            }}
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
                "hidden lg:block transition-all duration-300",
                isOpen ? "w-72" : "w-20"
            )} />
        </>
    )
}
