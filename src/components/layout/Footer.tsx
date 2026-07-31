"use client"

import Link from "next/link";
import Image from "next/image";
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useState, useEffect } from "react";
import { getBrandingSettings } from "@/services/brandingService";

export function Footer() {
    const { t } = useLanguage();
    const [logoUrl, setLogoUrl] = useState<string>("/logo-dalankotha-light.png");

    useEffect(() => {
        getBrandingSettings().then(settings => {
            if (settings?.logo_light_url) setLogoUrl(settings.logo_light_url);
        });
    }, []);

    return (
        <footer className="bg-neutral-950 text-neutral-400 pt-16 pb-10 border-t border-neutral-900">
            <div className="section-container">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
                    {/* Column 1: Brand */}
                    <div className="space-y-6">
                        <Link href="/" className="inline-block group">
                            <div className="relative w-48 h-12 opacity-80 group-hover:opacity-100 transition-all">
                                <Image
                                    src={logoUrl}
                                    alt="Dalankotha Logo"
                                    fill
                                    className="object-contain object-left"
                                />
                            </div>
                        </Link>
                        <p className="text-xs leading-relaxed max-w-xs font-medium text-neutral-500">
                            {t.footer_about}
                        </p>
                        <div className="flex space-x-4 pt-2">
                            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Follow Dalankotha on Facebook" className="w-8 h-8 rounded-full bg-neutral-900 flex items-center justify-center hover:bg-neutral-800 transition-all"><Facebook className="w-3.5 h-3.5 text-white" /></a>
                            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Follow Dalankotha on Twitter" className="w-8 h-8 rounded-full bg-neutral-900 flex items-center justify-center hover:bg-neutral-800 transition-all"><Twitter className="w-3.5 h-3.5 text-white" /></a>
                            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Follow Dalankotha on Instagram" className="w-8 h-8 rounded-full bg-neutral-900 flex items-center justify-center hover:bg-neutral-800 transition-all"><Instagram className="w-3.5 h-3.5 text-white" /></a>
                            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="Follow Dalankotha on LinkedIn" className="w-8 h-8 rounded-full bg-neutral-900 flex items-center justify-center hover:bg-neutral-800 transition-all"><Linkedin className="w-3.5 h-3.5 text-white" /></a>
                        </div>
                    </div>

                    {/* Column 2: Ecosystem */}
                    <div className="space-y-6 md:pl-10">
                        <h4 className="text-white font-black text-[10px] uppercase tracking-[0.25em]">{t.footer_ecosystem}</h4>
                        <ul className="space-y-3 text-xs font-bold uppercase tracking-wider">
                            <li><Link href="/services/design/book" className="text-neutral-500 hover:text-white transition-colors">{t.footer_design_studio}</Link></li>
                            <li><Link href="/products" className="text-neutral-500 hover:text-white transition-colors">{t.footer_material_store}</Link></li>
                            <li><Link href="/structural-health" className="text-neutral-500 hover:text-white transition-colors">{t.footer_health_check}</Link></li>
                            <li><Link href="/services" className="text-neutral-500 hover:text-white transition-colors">{t.footer_renovations}</Link></li>
                        </ul>
                    </div>

                    {/* Column 3: Company */}
                    <div className="space-y-6">
                        <h4 className="text-white font-black text-[10px] uppercase tracking-[0.25em]">{t.footer_company}</h4>
                        <ul className="space-y-3 text-xs font-bold uppercase tracking-wider">
                            <li><Link href="/help" className="text-neutral-500 hover:text-white transition-colors">{t.footer_help}</Link></li>
                            <li><Link href="/contact" className="text-neutral-500 hover:text-white transition-colors">{t.footer_contact}</Link></li>
                            <li><Link href="/faq" className="text-neutral-500 hover:text-white transition-colors">{t.footer_faqs}</Link></li>
                            <li><Link href="/terms" className="text-neutral-500 hover:text-white transition-colors">{t.footer_guidelines}</Link></li>
                            <li><Link href="/adminlogin" className="text-[9px] font-black uppercase tracking-[0.2em] text-neutral-600 hover:text-white transition-colors pt-2 block border-t border-neutral-900 mt-2">Admin Console</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-neutral-900 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-[9px] font-bold text-neutral-600 uppercase tracking-[0.2em]">
                        © {new Date().getFullYear()} {t.footer_rights}
                    </p>
                    <div className="flex gap-8 text-[9px] font-bold text-neutral-600 uppercase tracking-[0.2em]">
                        <Link href="/privacy" className="hover:text-white transition-colors">{t.footer_privacy}</Link>
                        <Link href="/cookies" className="hover:text-white transition-colors">{t.footer_cookies}</Link>
                        <Link href="/security" className="hover:text-white transition-colors">{t.footer_security}</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}

