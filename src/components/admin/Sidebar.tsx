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
    ShieldCheck
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const NAV_ITEMS = [
    { label: 'Order Factory', icon: LayoutDashboard, href: '/admin/orders' },
    { label: 'User Hub', icon: Users, href: '/admin/users' },
    { label: 'Product Factory', icon: Package, href: '/admin/products' },
    { label: 'Place Order', icon: PlusCircle, href: '/admin/concierge' },
    { label: 'Settings', icon: Settings, href: '/admin/settings' },
]

export function Sidebar() {
    const pathname = usePathname()
    const [isOpen, setIsOpen] = useState(true)

    return (
        <>
            {/* Mobile Toggle */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-xl shadow-lg border border-neutral-100"
            >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Sidebar Container */}
            <aside className={cn(
                "fixed left-0 top-0 h-screen bg-white border-r border-neutral-100 transition-all duration-300 z-40",
                isOpen ? "w-72" : "w-20 -left-20 lg:left-0 lg:w-20"
            )}>
                <div className="flex flex-col h-full p-6">
                    {/* Brand */}
                    <div className="flex items-center gap-3 mb-12 px-2">
                        <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary-200">
                            <ShieldCheck className="w-6 h-6 text-white" />
                        </div>
                        {isOpen && (
                            <div className="animate-in fade-in slide-in-from-left-4 duration-500">
                                <h2 className="text-xl font-black italic tracking-tighter text-neutral-900 leading-none">ADMIN</h2>
                                <p className="text-[10px] font-black uppercase text-neutral-400 tracking-widest leading-none mt-1">Ghorbari Console</p>
                            </div>
                        )}
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 space-y-2">
                        {NAV_ITEMS.map((item) => {
                            const isActive = pathname.startsWith(item.href)
                            return (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-4 p-4 rounded-2xl transition-all group relative",
                                        isActive
                                            ? "bg-primary-50 text-primary-600 shadow-inner"
                                            : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900"
                                    )}
                                >
                                    <item.icon className={cn(
                                        "w-6 h-6 transition-transform group-hover:scale-110",
                                        isActive ? "text-primary-600" : "text-neutral-400 group-hover:text-neutral-900"
                                    )} />
                                    {isOpen && (
                                        <span className="font-bold text-sm tracking-tight">{item.label}</span>
                                    )}
                                    {isActive && (
                                        <div className="absolute right-2 w-1.5 h-6 bg-primary-600 rounded-full animate-in fade-in slide-in-from-right-2 duration-300" />
                                    )}
                                </Link>
                            )
                        })}
                    </nav>

                    {/* Footer Actions */}
                    <div className="mt-auto pt-6 border-t border-neutral-50">
                        <Button
                            variant="ghost"
                            className={cn(
                                "w-full justify-start gap-4 p-4 h-auto rounded-2xl text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition-colors",
                                !isOpen && "px-4"
                            )}
                        >
                            <LogOut className="w-6 h-6" />
                            {isOpen && <span className="font-bold text-sm">Sign Out</span>}
                        </Button>
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
