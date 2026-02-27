"use client"

import Link from "next/link";
import Image from "next/image";
import { Facebook, Twitter, Instagram, Linkedin, ShieldCheck, Truck, Award, Headphones } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export function Footer() {
    const { t } = useLanguage();

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
                            <div className="relative w-44 h-10 brightness-0 invert opacity-80 group-hover:opacity-100 transition-all">
                                <Image
                                    src="/logo-v2.png"
                                    alt="Ghorbari Logo"
                                    fill
                                    className="object-contain object-left"
                                />
                            </div>
                        </Link>
                        <p className="text-[13px] leading-relaxed max-w-xs font-medium text-neutral-500">
                            {t.footer_about}
                        </p>
                        <div className="flex space-x-5 pt-4">
                            <Link href="#" className="w-9 h-9 rounded-full bg-neutral-900 flex items-center justify-center hover:bg-primary-600 transition-all"><Facebook className="w-4 h-4 text-white" /></Link>
                            <Link href="#" className="w-9 h-9 rounded-full bg-neutral-900 flex items-center justify-center hover:bg-primary-600 transition-all"><Twitter className="w-4 h-4 text-white" /></Link>
                            <Link href="#" className="w-9 h-9 rounded-full bg-neutral-900 flex items-center justify-center hover:bg-primary-600 transition-all"><Instagram className="w-4 h-4 text-white" /></Link>
                            <Link href="#" className="w-9 h-9 rounded-full bg-neutral-900 flex items-center justify-center hover:bg-primary-600 transition-all"><Linkedin className="w-4 h-4 text-white" /></Link>
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
                        </ul>
                    </div>

                    {/* Column 4: Trust / Payments */}
                    <div className="space-y-8">
                        <h4 className="text-white font-black text-xs uppercase tracking-[0.2em]">Partner Network</h4>
                        <div className="grid grid-cols-2 gap-3 opacity-40">
                            <div className="h-10 bg-neutral-900 rounded border border-neutral-800"></div>
                            <div className="h-10 bg-neutral-900 rounded border border-neutral-800"></div>
                            <div className="h-10 bg-neutral-900 rounded border border-neutral-800"></div>
                            <div className="h-10 bg-neutral-900 rounded border border-neutral-800"></div>
                        </div>
                        <p className="text-[11px] font-bold text-neutral-600 uppercase tracking-widest italic">Engineered for quality</p>
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

