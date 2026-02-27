"use client"

import Link from "next/link";
import Image from "next/image";
import { Search, ShoppingCart, User, Menu, X, ArrowRight, LayoutDashboard, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useCart } from "@/context/CartContext";
import { CartDrawer } from "../cart/CartDrawer";
import { useLanguage } from "@/context/LanguageContext";
// Removed: import { getCategories, Category } from "@/services/categoryService"; as categories logic is removed

export function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { language, setLanguage, t } = useLanguage();
    const [searchQuery, setSearchQuery] = useState("");
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const { itemCount, isDrawerOpen, closeDrawer, openDrawer } = useCart();
    const router = useRouter();
    const supabase = createClient();

    // The categories state and its fetching logic are not used in the Navbar component's JSX.
    // If categories are needed for a dropdown or dynamic menu, they should be rendered here.
    // For now, it's removed as per the instruction to remove "duplicate categories"
    // if this was considered a duplicate or unused fetch within Navbar itself.
    // If this data is intended for a child component, it should be passed down.
    // const [categories, setCategories] = useState<Category[]>([]);

    useEffect(() => {
        async function fetchUser() {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();
                setProfile(profile);
            }
        }
        fetchUser();

        // Removed: fetchCategories logic as it was unused in Navbar
        // async function fetchCategories() {
        //     try {
        //         const data = await getCategories();
        //         setCategories(data);
        //     } catch (e) {
        //         console.error("Failed to fetch categories for menu:", e);
        //     }
        // }
        // fetchCategories();
    }, []);

    const handleSearch = () => {
        if (searchQuery.trim()) {
            router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleSearch();
        }
    };

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        window.location.reload();
    };

    return (
        <header className="w-full z-50 bg-white sticky top-0 border-b border-neutral-200">
            {/* Top Utility Bar */}
            <div className="bg-neutral-50 border-b hidden sm:block">
                <div className="section-container h-10 flex items-center justify-between text-[11px] font-medium text-neutral-500 uppercase tracking-wider">
                    <div className="flex items-center gap-6">
                        <Link href="/partner-login" className="hover:text-primary-600 transition-colors flex items-center gap-1.5">
                            <LayoutDashboard className="w-3 h-3" />
                            {t.nav_partner}
                        </Link>
                        <span className="w-px h-3 bg-neutral-200"></span>
                        <Link href="/help" className="hover:text-primary-600 transition-colors">
                            {t.nav_help}
                        </Link>
                    </div>
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => setLanguage(language === 'EN' ? 'BN' : 'EN')}
                            className="hover:text-primary-600 transition-colors flex items-center gap-1 font-bold"
                        >
                            <span className={language === 'EN' ? 'text-primary-600' : 'text-neutral-400'}>EN</span>
                            <span className="text-neutral-300">/</span>
                            <span className={language === 'BN' ? 'text-primary-600' : 'text-neutral-400'}>BN</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Header */}
            <div className="border-b">
                <div className="section-container h-20 flex items-center gap-8 lg:gap-12">
                    {/* Logo */}
                    <Link href="/" className="flex-shrink-0">
                        <div className="relative w-40 h-10">
                            <Image
                                src="/logo-v2.png"
                                alt="Ghorbari Logo"
                                fill
                                className="object-contain object-left"
                                priority
                            />
                        </div>
                    </Link>

                    {/* Prominent Search Bar */}
                    <div className="hidden md:flex flex-1 relative group">
                        <div className="w-full relative">
                            <Input
                                placeholder={t.nav_search_placeholder}
                                className="w-full pl-12 h-12 bg-neutral-100 border-none focus:bg-white focus:ring-2 focus:ring-primary-600 transition-all rounded-full font-medium text-neutral-900 pr-24"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={handleKeyDown}
                            />
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 group-focus-within:text-primary-600 transition-colors" />
                            <Button
                                onClick={handleSearch}
                                className="absolute right-1 top-1 bottom-1 px-6 rounded-full bg-primary-950 hover:bg-black text-white text-xs font-bold uppercase tracking-widest"
                            >
                                {t.search || "Search"}
                            </Button>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 lg:gap-6 ml-auto">
                        <div className="hidden lg:flex items-center">
                            {!user ? (
                                <Link href="/login" className="flex flex-col items-center gap-0.5 px-3 group">
                                    <div className="p-2 rounded-full group-hover:bg-neutral-100 transition-colors">
                                        <User className="w-6 h-6 text-neutral-700" />
                                    </div>
                                    <span className="text-[10px] font-bold text-neutral-500 group-hover:text-primary-600 uppercase tracking-tighter transition-colors">
                                        {t.nav_login}
                                    </span>
                                </Link>
                            ) : (
                                <Link href="/dashboard" className="flex flex-col items-center gap-0.5 px-3 group">
                                    <div className="p-2 rounded-full group-hover:bg-neutral-100 transition-colors">
                                        <User className="w-6 h-6 text-neutral-700" />
                                    </div>
                                    <span className="text-[10px] font-bold text-neutral-500 group-hover:text-primary-600 uppercase tracking-tighter transition-colors">
                                        {profile?.full_name?.split(' ')[0]}
                                    </span>
                                </Link>
                            )}
                        </div>

                        <button
                            onClick={() => openDrawer()}
                            className="flex flex-col items-center gap-0.5 px-3 group relative"
                        >
                            <div className="p-2 rounded-full group-hover:bg-neutral-100 transition-colors">
                                <ShoppingCart className="w-6 h-6 text-neutral-700" />
                            </div>
                            <span className="text-[10px] font-bold text-neutral-500 group-hover:text-primary-600 uppercase tracking-tighter transition-colors">
                                {t.cart || "Cart"}
                            </span>
                            {itemCount > 0 && (
                                <span className="absolute top-1 right-3 flex h-5 w-5 items-center justify-center rounded-full bg-accent-500 text-white text-[10px] font-bold border-2 border-white shadow-sm">
                                    {itemCount}
                                </span>
                            )}
                        </button>

                        <Button variant="ghost" size="icon" className="md:hidden text-neutral-700" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </Button>
                    </div>
                </div>
            </div>

            <CartDrawer isOpen={isDrawerOpen} onClose={() => closeDrawer()} />

            <div className="border-b hidden md:block overflow-x-auto no-scrollbar">
                <div className="section-container">
                    <nav className="flex items-center gap-10 h-12 text-[12px] font-bold text-neutral-700 uppercase tracking-wide whitespace-nowrap">
                        <Link
                            href="/categories"
                            className="flex items-center gap-2 py-3 border-b-2 border-transparent hover:text-primary-600 hover:border-primary-600 transition-all"
                        >
                            <Menu className="w-4 h-4" />
                            <span>{t.nav_all_categories}</span>
                        </Link>
                        <Link
                            href="/services/design/book"
                            className="hover:text-primary-600 transition-colors py-3 border-b-2 border-transparent hover:border-primary-600"
                        >
                            {t.nav_design_planning}
                        </Link>
                        <Link
                            href="/products"
                            className="hover:text-primary-600 transition-colors py-3 border-b-2 border-transparent hover:border-primary-600"
                        >
                            {t.nav_marketplace}
                        </Link>
                        <Link
                            href="/services"
                            className="hover:text-primary-600 transition-colors py-3 border-b-2 border-transparent hover:border-primary-600"
                        >
                            {t.nav_renovation}
                        </Link>
                    </nav>
                </div>
            </div>

            {/* Mobile Menu */}
            {
                isMenuOpen && (
                    <div className="md:hidden fixed inset-0 top-[80px] bg-white z-[60] flex flex-col p-6 animate-in slide-in-from-right duration-300">
                        <div className="relative mb-8">
                            <Input
                                placeholder={t.nav_search_placeholder}
                                className="w-full pl-12 h-14 bg-neutral-50 rounded-2xl border-none font-medium"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={handleKeyDown}
                            />
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-neutral-400" />
                        </div>

                        <nav className="flex flex-col gap-6 font-bold text-neutral-900 uppercase text-sm tracking-widest">
                            <Link href="/services/design/book" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-between py-2 border-b">
                                {t.nav_design_planning} <ArrowRight className="w-4 h-4 text-neutral-300" />
                            </Link>
                            <Link href="/products" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-between py-2 border-b">
                                {t.nav_marketplace} <ArrowRight className="w-4 h-4 text-neutral-300" />
                            </Link>
                            <Link href="/services" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-between py-2 border-b">
                                {t.nav_renovation} <ArrowRight className="w-4 h-4 text-neutral-300" />
                            </Link>
                        </nav>

                        <div className="mt-auto flex flex-col gap-4">
                            {!user ? (
                                <>
                                    <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                                        <Button variant="outline" className="w-full h-14 font-bold uppercase rounded-2xl">{t.nav_login}</Button>
                                    </Link>
                                    <Link href="/register" onClick={() => setIsMenuOpen(false)}>
                                        <Button className="w-full h-14 font-bold uppercase rounded-2xl bg-primary-950 text-white shadow-xl">{t.nav_create_account}</Button>
                                    </Link>
                                </>
                            ) : (
                                <Button
                                    onClick={handleSignOut}
                                    variant="outline"
                                    className="w-full h-14 font-bold uppercase text-rose-600 border-rose-100 rounded-2xl"
                                >
                                    {t.nav_logout}
                                </Button>
                            )}
                        </div>
                    </div>
                )
            }
        </header >
    );
}

