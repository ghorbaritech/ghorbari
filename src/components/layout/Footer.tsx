"use client"

import Link from "next/link";
import Image from "next/image";
import { Facebook, Twitter, Instagram, Linkedin, ShieldCheck, Truck, Award, Headphones } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useState, useEffect } from "react";
import { getBrandingSettings } from "@/services/brandingService";

export function Footer() {
    const { t } = useLanguage();
    const [logoUrl, setLogoUrl] = useState<string>("/logo-dalankotha-white-bg.png");

    useEffect(() => {
        getBrandingSettings().then(settings => {
            if (settings?.logo_light_url) setLogoUrl(settings.logo_light_url);
        });
    }, []);

    return (
        <footer className="bg-neutral-950 text-neutral-400 pt-20 pb-10 border-t border-neutral-800">
            {/* Trust Bar / Features */}
            <div className="section-container border-b border-neutral-800 pb-16 mb-16">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    <div className="flex items-center gap-4 group cursor-default">
                        <div className="w-12 h-12 rounded-full bg-neutral-900 flex items-center justify-center border border-neutral-800 group-hover:border-accent-500 transition-colors">
                            <ShieldCheck className="w-6 h-6 text-neutral-500 group-hover:text-accent-500 transition-colors" />
                        </div>
                        <div>
                            <h5 className="text-white font-black text-xs uppercase tracking-widest mb-1 transition-colors group-hover:text-accent-500">Verified Pros</h5>
                            <p className="text-[10px] font-medium leading-tight">Engineered for Excellence</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 group cursor-default">
                        <div className="w-12 h-12 rounded-full bg-neutral-900 flex items-center justify-center border border-neutral-800 group-hover:border-accent-500 transition-colors">
                            <Truck className="w-6 h-6 text-neutral-500 group-hover:text-accent-500 transition-colors" />
                        </div>
                        <div>
                            <h5 className="text-white font-black text-xs uppercase tracking-widest mb-1 transition-colors group-hover:text-accent-500">Secure Delivery</h5>
                            <p className="text-[10px] font-medium leading-tight">Straight to your site</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 group cursor-default">
                        <div className="w-12 h-12 rounded-full bg-neutral-900 flex items-center justify-center border border-neutral-800 group-hover:border-accent-500 transition-colors">
                            <Award className="w-6 h-6 text-neutral-500 group-hover:text-accent-500 transition-colors" />
                        </div>
                        <div>
                            <h5 className="text-white font-black text-xs uppercase tracking-widest mb-1 transition-colors group-hover:text-accent-500">Quality Guaranteed</h5>
                            <p className="text-[10px] font-medium leading-tight">Only the best materials</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 group cursor-default">
                        <div className="w-12 h-12 rounded-full bg-neutral-900 flex items-center justify-center border border-neutral-800 group-hover:border-accent-500 transition-colors">
                            <Headphones className="w-6 h-6 text-neutral-500 group-hover:text-accent-500 transition-colors" />
                        </div>
                        <div>
                            <h5 className="text-white font-black text-xs uppercase tracking-widest mb-1 transition-colors group-hover:text-accent-500">24/7 Support</h5>
                            <p className="text-[10px] font-medium leading-tight">Always here to help</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="section-container">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16">
                    {/* Column 1: Brand */}
                    <div className="space-y-8">
                        <Link href="/" className="inline-block group">
                            <div className="relative w-56 h-14 brightness-0 invert opacity-80 group-hover:opacity-100 transition-all">
                                <Image
                                    src={logoUrl}
                                    alt="Dalankotha Logo"
                                    fill
                                    className="object-contain object-left"
                                />
                            </div>
                        </Link>
                        <p className="text-[13px] leading-relaxed max-w-xs font-medium text-neutral-500">
                            {t.footer_about}
                        </p>
                        <div className="flex space-x-5 pt-4">
                            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Follow Dalankotha on Facebook" className="w-9 h-9 rounded-full bg-neutral-900 flex items-center justify-center hover:bg-primary-600 transition-all"><Facebook className="w-4 h-4 text-white" /></a>
                            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Follow Dalankotha on Twitter" className="w-9 h-9 rounded-full bg-neutral-900 flex items-center justify-center hover:bg-primary-600 transition-all"><Twitter className="w-4 h-4 text-white" /></a>
                            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Follow Dalankotha on Instagram" className="w-9 h-9 rounded-full bg-neutral-900 flex items-center justify-center hover:bg-primary-600 transition-all"><Instagram className="w-4 h-4 text-white" /></a>
                            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="Follow Dalankotha on LinkedIn" className="w-9 h-9 rounded-full bg-neutral-900 flex items-center justify-center hover:bg-primary-600 transition-all"><Linkedin className="w-4 h-4 text-white" /></a>
                        </div>
                    </div>

                    {/* Column 2: Ecosystem */}
                    <div className="space-y-8">
                        <h4 className="text-white font-black text-xs uppercase tracking-[0.2em]">{t.footer_ecosystem}</h4>
                        <ul className="space-y-4 text-sm font-bold uppercase tracking-tight">
                            <li><Link href="/services/design/book" className="text-neutral-500 hover:text-white transition-colors">{t.footer_design_studio}</Link></li>
                            <li><Link href="/products" className="text-neutral-500 hover:text-white transition-colors">{t.footer_material_store}</Link></li>
                            <li><Link href="/structural-health" className="text-neutral-500 hover:text-white transition-colors">{t.footer_health_check}</Link></li>
                            <li><Link href="/services" className="text-neutral-500 hover:text-white transition-colors">{t.footer_renovations}</Link></li>
                        </ul>
                    </div>

                    {/* Column 3: Company */}
                    <div className="space-y-8">
                        <h4 className="text-white font-black text-xs uppercase tracking-[0.2em]">{t.footer_company}</h4>
                        <ul className="space-y-4 text-sm font-bold uppercase tracking-tight">
                            <li><Link href="/help" className="text-neutral-500 hover:text-white transition-colors">{t.footer_help}</Link></li>
                            <li><Link href="/contact" className="text-neutral-500 hover:text-white transition-colors">{t.footer_contact}</Link></li>
                            <li><Link href="/faq" className="text-neutral-500 hover:text-white transition-colors">{t.footer_faqs}</Link></li>
                            <li><Link href="/terms" className="text-neutral-500 hover:text-white transition-colors">{t.footer_guidelines}</Link></li>
                            <li><Link href="/adminlogin" className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-700 hover:text-primary-600 transition-colors pt-4 block border-t border-neutral-900 mt-4">Admin Console</Link></li>
                        </ul>
                    </div>

                    {/* Column 4: Trust Signals */}
                    <div className="space-y-8">
                        <h4 className="text-white font-black text-xs uppercase tracking-[0.2em]">Trust & Standards</h4>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 p-3 bg-neutral-900 rounded-xl border border-neutral-800">
                                <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                                </div>
                                <div>
                                    <p className="text-white text-[11px] font-black uppercase tracking-wide">RAJUK Compliant</p>
                                    <p className="text-neutral-500 text-[10px] font-medium">Dhaka Building Authority</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-neutral-900 rounded-xl border border-neutral-800">
                                <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Award className="w-4 h-4 text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-white text-[11px] font-black uppercase tracking-wide">ISO 9001 Partners</p>
                                    <p className="text-neutral-500 text-[10px] font-medium">Quality Management Certified</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-neutral-900 rounded-xl border border-neutral-800">
                                <div className="w-8 h-8 bg-amber-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Headphones className="w-4 h-4 text-amber-400" />
                                </div>
                                <div>
                                    <p className="text-white text-[11px] font-black uppercase tracking-wide">Verified Network</p>
                                    <p className="text-neutral-500 text-[10px] font-medium">500+ Screened Professionals</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-neutral-900 mt-20 pt-10 flex flex-col md:flex-row justify-between items-center gap-8">
                    <p className="text-[10px] font-bold text-neutral-600 uppercase tracking-[0.2em]">
                        © {new Date().getFullYear()} {t.footer_rights}
                    </p>
                    <div className="flex gap-10 text-[10px] font-bold text-neutral-600 uppercase tracking-[0.2em]">
                        <Link href="/privacy" className="hover:text-white transition-colors">{t.footer_privacy}</Link>
                        <Link href="/cookies" className="hover:text-white transition-colors">{t.footer_cookies}</Link>
                        <Link href="/security" className="hover:text-white transition-colors">{t.footer_security}</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}

