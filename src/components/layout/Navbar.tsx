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
import { MegaMenu } from "./MegaMenu";
import { getCategories, Category } from "@/services/categoryService";

export function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { language, setLanguage, t } = useLanguage();
    const [searchQuery, setSearchQuery] = useState("");
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const { itemCount, isDrawerOpen, closeDrawer, openDrawer } = useCart();
    const router = useRouter();
    const supabase = createClient();

    const [categories, setCategories] = useState<Category[]>([]);
    const [activeSection, setActiveSection] = useState<'all' | 'design' | 'product' | 'service' | null>(null);
    const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
    const megaMenuTimeout = useRef<NodeJS.Timeout | null>(null);

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

        async function fetchCategories() {
            try {
                const data = await getCategories();
                setCategories(data);
            } catch (e) {
                console.error("Failed to fetch categories for menu:", e);
            }
        }
        fetchCategories();
    }, []);

    const handleMouseEnter = (section: 'all' | 'design' | 'product' | 'service') => {
        if (megaMenuTimeout.current) clearTimeout(megaMenuTimeout.current);
        setActiveSection(section);
        setIsMegaMenuOpen(true);
    };

    const handleMouseLeave = () => {
        megaMenuTimeout.current = setTimeout(() => {
            setIsMegaMenuOpen(false);
            setActiveSection(null);
        }, 150);
    };

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
        <header className="w-full z-50 bg-white">
            <div className="bg-primary-600 border-b border-primary-700">
                <div className="container mx-auto px-8 h-16 flex items-center justify-between gap-8">
                    <Link href="/" className="flex-shrink-0">
                        <div className="relative w-36 h-10">
                            <Image
                                src="/full-logo-white.svg"
                                alt="Ghorbari Logo"
                                fill
                                className="object-contain object-left"
                                priority
                            />
                        </div>
                    </Link>

                    <div className="hidden md:flex flex-1 max-w-xl relative">
                        <Input
                            placeholder={t.nav_search_placeholder}
                            className="w-full pl-12 h-10 bg-white border-white/20 focus:bg-white focus:border-white rounded-xl font-medium text-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="hidden lg:flex items-center gap-3 text-xs font-bold text-white uppercase tracking-tight">
                            <Link href="/partner-login" className="hover:text-white/80 transition-colors">
                                {t.nav_partner}
                            </Link>
                            <span className="w-px h-3 bg-white/30"></span>
                            {!user ? (
                                <>
                                    <Link href="/login" className="hover:text-white/80 transition-colors">
                                        {t.nav_login}
                                    </Link>
                                    <span className="w-px h-3 bg-white/30"></span>
                                    <Link href="/register" className="hover:text-white/80 transition-colors">
                                        {t.nav_signup}
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <span className="text-white/80">HI, {profile?.full_name?.split(' ')[0]}</span>
                                    <span className="w-px h-3 bg-white/30"></span>
                                    <Link href="/dashboard" className="hover:text-white/80 transition-colors flex items-center gap-2">
                                        <LayoutDashboard className="w-3 h-3" />
                                        DASHBOARD
                                    </Link>
                                    <Button
                                        variant="ghost"
                                        onClick={handleSignOut}
                                        className="font-bold text-white hover:text-white/80 uppercase text-xs p-0 h-auto ml-2"
                                    >
                                        <LogOut className="w-4 h-4" />
                                    </Button>
                                </>
                            )}
                            <span className="w-px h-3 bg-white/30"></span>
                            <Link href="/help" className="hover:text-white/80 transition-colors">
                                {t.nav_help}
                            </Link>
                            <span className="w-px h-3 bg-white/30"></span>
                            <button
                                onClick={() => setLanguage(language === 'EN' ? 'BN' : 'EN')}
                                className="hover:text-white/80 transition-colors flex items-center gap-1"
                            >
                                <span className={language === 'EN' ? 'text-white' : 'text-white/60'}>EN</span>
                                <span className="text-white/60">/</span>
                                <span className={language === 'BN' ? 'text-white' : 'text-white/60'}>BN</span>
                            </button>
                        </div>

                        <div className="flex items-center gap-4">
                            <Link href={user ? "/dashboard" : "/login"} className="text-white hover:text-white/80 transition-colors p-1">
                                <User className="w-5 h-5" />
                            </Link>

                            <button
                                onClick={() => openDrawer()}
                                className="relative text-white hover:text-white/80 transition-colors p-1 flex items-center justify-center h-10 w-10"
                            >
                                <ShoppingCart className="w-5 h-5" />
                                {itemCount > 0 && (
                                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-white text-primary-600 text-[10px] font-black border-2 border-primary-600 shadow-lg animate-in zoom-in duration-300">
                                        {itemCount}
                                    </span>
                                )}
                            </button>

                            <Button variant="ghost" size="icon" className="md:hidden text-white hover:text-white/80 h-8 w-8" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <CartDrawer isOpen={isDrawerOpen} onClose={() => closeDrawer()} />

            <div className="border-b hidden md:block overflow-x-auto no-scrollbar">
                <div className="container mx-auto px-8" onMouseLeave={handleMouseLeave}>
                    <nav className="flex items-center gap-10 h-12 text-[12px] font-bold text-neutral-600 uppercase tracking-tight whitespace-nowrap">
                        <div
                            className="flex items-center gap-2 py-4 border-b-2 border-transparent"
                        >
                            <Menu className="w-4 h-4" />
                            <span>{t.nav_all_categories}</span>
                        </div>
                        <Link
                            href="/services/design/book"
                            className="hover:text-primary-600 transition-colors py-4 border-b-2 border-transparent hover:border-primary-600"
                        >
                            {t.nav_design_planning}
                        </Link>
                        <Link
                            href="/products"
                            className="hover:text-primary-600 transition-colors py-4 border-b-2 border-transparent hover:border-primary-600"
                        >
                            {t.nav_marketplace}
                        </Link>
                        <Link
                            href="/services"
                            className="hover:text-primary-600 transition-colors py-4 border-b-2 border-transparent hover:border-primary-600"
                        >
                            {t.nav_renovation}
                        </Link>
                    </nav>
                </div>
            </div>

            {/* MegaMenu temporarily disabled
            <div className="relative" onMouseEnter={() => { if (megaMenuTimeout.current) clearTimeout(megaMenuTimeout.current); }}>
                <MegaMenu
                    isOpen={isMegaMenuOpen}
                    activeSection={activeSection}
                    categories={categories}
                    onClose={() => {
                        setIsMegaMenuOpen(false);
                        setActiveSection(null);
                    }}
                    onMouseLeave={handleMouseLeave}
                />
            </div>
            */}

            {
                isMenuOpen && (
                    <div className="md:hidden p-6 bg-white border-b absolute w-full shadow-2xl z-50 flex flex-col gap-8">
                        <div className="relative">
                            <Input
                                placeholder={t.nav_search_placeholder}
                                className="w-full pl-12 h-12 bg-neutral-50 rounded-xl"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={handleKeyDown}
                            />
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                        </div>

                        <nav className="flex flex-col gap-6 font-bold text-neutral-800 uppercase text-sm tracking-tight">
                            <Link href="/services/design/book" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-between">
                                {t.nav_design_planning} <ArrowRight className="w-4 h-4 text-neutral-300" />
                            </Link>
                            <Link href="/products" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-between">
                                {t.nav_marketplace} <ArrowRight className="w-4 h-4 text-neutral-300" />
                            </Link>
                            <Link href="/services" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-between">
                                {t.nav_renovation} <ArrowRight className="w-4 h-4 text-neutral-300" />
                            </Link>
                        </nav>

                        <div className="h-px bg-neutral-100"></div>

                        <div className="flex flex-col gap-4">
                            {!user ? (
                                <>
                                    <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                                        <Button variant="outline" className="w-full h-12 font-bold uppercase tracking-tight rounded-xl">{t.nav_login}</Button>
                                    </Link>
                                    <Link href="/register" onClick={() => setIsMenuOpen(false)}>
                                        <Button className="w-full h-12 font-bold uppercase tracking-tight rounded-xl shadow-lg shadow-primary-200">{t.nav_create_account}</Button>
                                    </Link>
                                </>
                            ) : (
                                <Button
                                    onClick={handleSignOut}
                                    variant="outline"
                                    className="w-full h-12 font-bold uppercase tracking-tight text-rose-600 border-rose-200 rounded-xl"
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

