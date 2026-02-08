"use client"

import Link from "next/link";
import Image from "next/image";
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export function Footer() {
    const { t } = useLanguage();

    return (
        <footer className="bg-neutral-900 text-neutral-400">
            <div className="container mx-auto px-8 py-20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16">
                    {/* Column 1: About */}
                    <div className="space-y-8">
                        <Link href="/" className="inline-block">
                            <div className="relative w-48 h-12 brightness-0 invert opacity-90">
                                <Image
                                    src="/full-logo.svg"
                                    alt="Ghorbari Logo"
                                    fill
                                    className="object-contain object-left"
                                />
                            </div>
                        </Link>
                        <p className="text-sm leading-relaxed max-w-xs font-medium">
                            {t.footer_about}
                        </p>
                        <div className="flex space-x-6 pt-4">
                            <Link href="#" className="hover:text-primary-400 transition-colors"><Facebook className="w-5 h-5" /></Link>
                            <Link href="#" className="hover:text-primary-400 transition-colors"><Twitter className="w-5 h-5" /></Link>
                            <Link href="#" className="hover:text-primary-400 transition-colors"><Instagram className="w-5 h-5" /></Link>
                            <Link href="#" className="hover:text-primary-400 transition-colors"><Linkedin className="w-5 h-5" /></Link>
                        </div>
                    </div>

                    {/* Column 2: Ecosystem */}
                    <div className="space-y-6">
                        <h4 className="text-white font-bold text-xs uppercase tracking-widest italic">{t.footer_ecosystem}</h4>
                        <ul className="space-y-3 text-sm font-bold uppercase tracking-tight">
                            <li><Link href="/services" className="hover:text-primary-400 transition-colors">{t.footer_design_studio}</Link></li>
                            <li><Link href="/products" className="hover:text-primary-400 transition-colors">{t.footer_material_store}</Link></li>
                            <li><Link href="/structural-health" className="hover:text-primary-400 transition-colors">{t.footer_health_check}</Link></li>
                            <li><Link href="/renovation" className="hover:text-primary-400 transition-colors">{t.footer_renovations}</Link></li>
                        </ul>
                    </div>

                    {/* Column 3: Company */}
                    <div className="space-y-6">
                        <h4 className="text-white font-bold text-xs uppercase tracking-widest italic">{t.footer_company}</h4>
                        <ul className="space-y-3 text-sm font-bold uppercase tracking-tight">
                            <li><Link href="/help" className="hover:text-primary-400 transition-colors">{t.footer_help}</Link></li>
                            <li><Link href="/contact" className="hover:text-primary-400 transition-colors">{t.footer_contact}</Link></li>
                            <li><Link href="/faq" className="hover:text-primary-400 transition-colors">{t.footer_faqs}</Link></li>
                            <li><Link href="/terms" className="hover:text-primary-400 transition-colors">{t.footer_guidelines}</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-neutral-800 mt-20 pt-10 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                        © {new Date().getFullYear()} {t.footer_rights}
                    </p>
                    <div className="flex gap-8 text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                        <Link href="/privacy" className="hover:text-white transition-colors">{t.footer_privacy}</Link>
                        <Link href="/cookies" className="hover:text-white transition-colors">{t.footer_cookies}</Link>
                        <Link href="/security" className="hover:text-white transition-colors">{t.footer_security}</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}

