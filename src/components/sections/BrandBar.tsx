"use client"

import { LayoutGrid } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

const BRANDS = [
    { name: "Bosch", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/Bosch-logo.svg/512px-Bosch-logo.svg.png" },
    { name: "Makita", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Makita_logo.svg/512px-Makita_logo.svg.png" },
    { name: "DeWalt", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/DeWalt_Logo.svg/512px-DeWalt_Logo.svg.png" },
    { name: "BSRM", logo: "https://www.bsrm.com/wp-content/uploads/2021/08/BSRM-Logo-Final.png" },
    { name: "Berger", logo: "https://upload.wikimedia.org/wikipedia/en/thumb/7/7b/Berger_Paints_India_Logo.svg/1200px-Berger_Paints_India_Logo.svg.png" },
    { name: "Seven Rings", nameBn: "সেভেন রিংস", logo: "https://sevenrings.com.bd/wp-content/uploads/2018/12/logo-1.png" },
    { name: "Grohe", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Grohe_Logo.svg/512px-Grohe_Logo.svg.png" },
    { name: "All Brands", logo: null, isAll: true },
];

export function BrandBar() {
    const { t, language } = useLanguage();

    return (
        <section className="py-8 bg-white border-b border-neutral-100 overflow-x-auto no-scrollbar">
            <div className="container mx-auto px-8">
                <div className="flex justify-between items-start gap-5 min-w-max lg:min-w-0 px-16 lg:px-0">
                    {BRANDS.map((brand, idx) => (
                        <div key={idx} className="flex flex-col items-center gap-3 group cursor-pointer min-w-[120px]">
                            <div className="w-24 h-16 rounded-2xl bg-white flex items-center justify-center text-neutral-400 group-hover:bg-primary-50 group-hover:text-primary-600 transition-all border border-neutral-100 shadow-sm overflow-hidden p-4">
                                {brand.isAll ? (
                                    <LayoutGrid className="w-6 h-6" />
                                ) : (
                                    <img
                                        src={brand.logo!}
                                        alt={brand.name}
                                        className="max-h-full max-w-full object-contain grayscale group-hover:grayscale-0 transition-all duration-300 opacity-70 group-hover:opacity-100"
                                    />
                                )}
                            </div>
                            <div className="text-center">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.1em] text-neutral-500 group-hover:text-primary-600 transition-colors">
                                    {brand.isAll ? t.brand_all : (brand.nameBn && language === 'BN' ? brand.nameBn : brand.name)}
                                </h4>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
