"use client"

import Link from "next/link";
import Image from "next/image";
import { Search, ShoppingCart, User, Menu, X, ArrowRight, LayoutDashboard, LogOut, Home, Package, PencilRuler, Wrench, Phone, MapPin, Loader2 } from "lucide-react";
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
    const [contactPhone, setContactPhone] = useState<string | null>(null);
    const [locationName, setLocationName] = useState<string>("Set Location");
    const [isLocating, setIsLocating] = useState(false);

    // Search Autocomplete State
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);

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

        async function fetchContact() {
            const { data } = await supabase.from('home_content').select('content').eq('section_key', 'contact_info').single();
            if (data?.content?.phone) {
                setContactPhone(data.content.phone);
            }
        }
        fetchContact();
    }, []);

    useEffect(() => {
        const fetchSuggestions = async () => {
            if (searchQuery.trim().length < 2) {
                setSuggestions([]);
                return;
            }
            setIsSearching(true);
            try {
                const response = await fetch(`/api/search/suggest?q=${encodeURIComponent(searchQuery)}`);
                const data = await response.json();
                setSuggestions(data.results || []);
            } catch (error) {
                console.error("Error fetching suggestions:", error);
            } finally {
                setIsSearching(false);
            }
        };

        const timerId = setTimeout(() => {
            fetchSuggestions();
        }, 300);

        return () => clearTimeout(timerId);
    }, [searchQuery]);

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

    const requestLocation = () => {
        setIsLocating(true);
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    try {
                        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                        const data = await response.json();
                        const addr = data.address || {};
                        const localArea = addr.suburb || addr.neighbourhood || addr.road || addr.village || addr.town;
                        const mainCity = addr.city || addr.state_district || "Location Found";

                        const fullLocation = localArea && localArea !== mainCity
                            ? `${localArea}, ${mainCity}`
                            : mainCity;

                        setLocationName(fullLocation);
                    } catch (error) {
                        console.error("Error fetching location name:", error);
                        setLocationName("Location Error");
                    } finally {
                        setIsLocating(false);
                    }
                },
                (error) => {
                    console.error("Geolocation error:", error.message || "Unknown error occurred while fetching location.");
                    setLocationName("Access Denied");
                    setIsLocating(false);
                }
            );
        } else {
            setLocationName("Not Supported");
            setIsLocating(false);
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
                        {contactPhone && (
                            <>
                                <div className="flex items-center gap-1.5 text-neutral-600 hover:text-primary-600 transition-colors">
                                    <Phone className="w-3.5 h-3.5" />
                                    <a href={`tel:${contactPhone}`} className="font-semibold tracking-wider">{contactPhone}</a>
                                </div>
                                <span className="w-px h-3 bg-neutral-200"></span>
                            </>
                        )}
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

                    {/* Location Tracker */}
                    <div className="hidden md:flex items-center">
                        <button
                            onClick={requestLocation}
                            disabled={isLocating}
                            className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-neutral-100 transition-colors text-neutral-600 group"
                        >
                            {isLocating ? (
                                <Loader2 className="w-5 h-5 text-primary-600 animate-spin" />
                            ) : (
                                <MapPin className="w-5 h-5 group-hover:text-primary-600 transition-colors" />
                            )}
                            <div className="flex flex-col items-start gap-0.5 max-w-[120px]">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 leading-none">Delivering to</span>
                                <span className="text-sm font-semibold text-neutral-900 leading-none truncate w-full text-left">{locationName}</span>
                            </div>
                        </button>
                    </div>

                    {/* Prominent Search Bar */}
                    <div className="hidden md:flex flex-1 relative group max-w-2xl">
                        <div className="w-full relative">
                            <Input
                                placeholder={t.nav_search_placeholder}
                                className="w-full pl-12 h-12 bg-neutral-100 border-none focus:bg-white focus:ring-2 focus:ring-primary-600 transition-all rounded-full font-medium text-neutral-900 pr-24"
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setShowSuggestions(true);
                                }}
                                onFocus={() => setShowSuggestions(true)}
                                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                onKeyDown={handleKeyDown}
                            />
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 group-focus-within:text-primary-600 transition-colors" />
                            <Button
                                onClick={handleSearch}
                                className="absolute right-1 top-1 bottom-1 px-6 rounded-full bg-primary-950 hover:bg-black text-white text-xs font-bold uppercase tracking-widest"
                            >
                                {t.search || "Search"}
                            </Button>

                            {/* Suggestions Dropdown */}
                            {showSuggestions && (searchQuery.length >= 2) && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-neutral-100 overflow-hidden z-[100]">
                                    {isSearching ? (
                                        <div className="p-4 text-center text-neutral-500 text-sm">
                                            <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                                        </div>
                                    ) : suggestions.length > 0 ? (
                                        <ul className="max-h-80 overflow-y-auto w-full py-2">
                                            {suggestions.map((item) => (
                                                <li key={`${item.resultType}-${item.id}`}>
                                                    <Link
                                                        href={item.resultType === 'product' ? `/products/${item.id}` : `/categories/${item.id}`}
                                                        className="flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 transition-colors"
                                                        onClick={() => setShowSuggestions(false)}
                                                    >
                                                        <Search className="w-4 h-4 text-neutral-400 opacity-50" />
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-semibold text-neutral-900">{item.name}</span>
                                                            <span className="text-xs text-neutral-500 capitalize">{item.resultType}</span>
                                                        </div>
                                                    </Link>
                                                </li>
                                            ))}
                                            <li className="border-t border-neutral-100 mt-2">
                                                <button onClick={handleSearch} className="w-full text-center py-3 text-sm font-bold text-primary-600 hover:bg-primary-50 transition-colors">
                                                    {t.search || "See all results"}
                                                </button>
                                            </li>
                                        </ul>
                                    ) : (
                                        <div className="p-4 text-center text-neutral-500 text-sm font-medium">
                                            No matches found.
                                        </div>
                                    )}
                                </div>
                            )}
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
                                <div className="space-y-4">
                                    <Link href="/dashboard" onClick={() => setIsMenuOpen(false)}>
                                        <Button variant="outline" className="w-full h-14 font-bold uppercase rounded-2xl flex items-center justify-center gap-2">
                                            <LayoutDashboard className="w-5 h-5" /> {t.nav_dashboard || "Dashboard"}
                                        </Button>
                                    </Link>
                                    <Button
                                        onClick={handleSignOut}
                                        variant="ghost"
                                        className="w-full h-14 font-bold uppercase text-rose-600 hover:bg-rose-50 rounded-2xl flex items-center justify-center gap-2"
                                    >
                                        <LogOut className="w-5 h-5" /> {t.nav_logout || "Sign Out"}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                )
            }

            {/* Mobile Bottom Navigation Bar */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 z-[70] h-16 flex items-center justify-between px-2 pb-safe shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)]">
                <Link href="/" className="flex flex-col items-center justify-center flex-1 w-full h-full text-neutral-500 hover:text-primary-600 transition-colors gap-1">
                    <Home className="w-[22px] h-[22px]" strokeWidth={2.5} />
                    <span className="text-[9px] font-bold uppercase tracking-wider">Home</span>
                </Link>
                <Link href="/services/design" className="flex flex-col items-center justify-center flex-1 w-full h-full text-neutral-500 hover:text-primary-600 transition-colors gap-1">
                    <PencilRuler className="w-[22px] h-[22px]" strokeWidth={2.5} />
                    <span className="text-[9px] font-bold uppercase tracking-wider">Design</span>
                </Link>
                <Link href="/services" className="flex flex-col items-center justify-center flex-1 w-full h-full text-neutral-500 hover:text-primary-600 transition-colors gap-1">
                    <Wrench className="w-[22px] h-[22px]" strokeWidth={2.5} />
                    <span className="text-[9px] font-bold uppercase tracking-wider">Services</span>
                </Link>
                <Link href="/products" className="flex flex-col items-center justify-center flex-1 w-full h-full text-neutral-500 hover:text-primary-600 transition-colors gap-1">
                    <Package className="w-[22px] h-[22px]" strokeWidth={2.5} />
                    <span className="text-[9px] font-bold uppercase tracking-wider">Product</span>
                </Link>
                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="flex flex-col items-center justify-center flex-1 w-full h-full text-neutral-500 hover:text-primary-600 transition-colors gap-1">
                    {isMenuOpen ? <X className="w-[22px] h-[22px]" strokeWidth={2.5} /> : <Menu className="w-[22px] h-[22px]" strokeWidth={2.5} />}
                    <span className="text-[9px] font-bold uppercase tracking-wider">Menu</span>
                </button>
            </nav>
        </header >
    );
}

