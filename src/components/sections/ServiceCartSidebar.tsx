"use client";

import { useServiceCart } from "@/context/ServiceCartContext";
import { useLanguage } from "@/context/LanguageContext";
import { Button } from "@/components/ui/button";
import { X, ShoppingBag } from "lucide-react";
import Link from "next/link";

export function ServiceCartSidebar() {
    const { items, removeService, totalAmount, itemCount } = useServiceCart();
    const { language, t } = useLanguage();

    if (itemCount === 0) {
        return (
            <div className="bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-neutral-200 overflow-hidden sticky top-24">
                <div className="bg-[#f3fbfa] p-6 border-b border-neutral-200">
                    <h3 className="text-[18px] font-black text-neutral-900 tracking-tight leading-none mb-1">{t.cart_your_selection}</h3>
                    <p className="text-[11px] font-medium text-neutral-500">{t.cart_no_services}</p>
                </div>
                <div className="p-8 flex flex-col items-center text-center gap-3">
                    <div className="w-12 h-12 bg-neutral-50 rounded-full flex items-center justify-center border border-neutral-200">
                        <ShoppingBag className="w-5 h-5 text-neutral-300" />
                    </div>
                    <p className="text-sm font-medium text-neutral-500 leading-relaxed">
                        {t.cart_select_prompt}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-neutral-200 overflow-hidden flex flex-col sticky top-24 max-h-[calc(100vh-120px)]">

            {/* Header */}
            <div className="bg-[#f3fbfa] p-6 border-b border-neutral-200">
                <h3 className="text-[18px] font-black text-neutral-900 tracking-tight leading-none mb-1">{t.cart_your_selection}</h3>
                <p className="text-[11px] font-medium text-neutral-600 mb-4">
                    {t.cart_tentative_quote}
                </p>
                <div className="text-left mt-2">
                    <div className="flex items-center gap-1 font-black text-[28px] text-[#0a1b3d] leading-none">
                        <span className="text-[22px]">৳</span>{totalAmount.toLocaleString()}
                    </div>
                    <p className="text-[10px] font-black tracking-widest text-[#0a1b3d]/70 uppercase mt-1">{t.cart_starting_price}</p>
                </div>
            </div>

            {/* Body */}
            <div className="flex-grow overflow-y-auto p-6 space-y-5 bg-white">
                <h4 className="text-[11px] font-black text-neutral-400 uppercase tracking-widest">{t.cart_service_details}</h4>
                <div>
                    <p className="text-[12px] font-bold text-neutral-600 mb-2">{t.cart_selected_services}</p>
                    <div className="space-y-2">
                        {items.map((item) => (
                            <div
                                key={item.id}
                                className="flex items-center justify-between bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3"
                            >
                                <div className="flex-1 min-w-0 pr-2">
                                    <p className="text-[13px] font-bold text-neutral-900 truncate">
                                        {language === 'BN' ? item.name_bn : item.name}
                                    </p>
                                    <p className="text-[11px] font-bold text-primary-600">
                                        ৳{item.unit_price.toLocaleString()}
                                        <span className="text-neutral-400 font-medium"> / {item.unit_type}</span>
                                    </p>
                                </div>
                                <button
                                    onClick={() => removeService(item.id)}
                                    className="w-6 h-6 flex items-center justify-center rounded-full bg-white border border-neutral-200 text-neutral-400 hover:text-red-500 hover:border-red-200 transition-colors flex-shrink-0"
                                    title="Remove"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="p-6 pt-0 mt-auto bg-white border-t border-neutral-100/50">
                <Link href="/services/booking">
                    <Button className="w-full mt-4 bg-[#1e3a8a] py-6 rounded-xl hover:bg-[#1e3a8a]/90 text-white shadow-lg shadow-[#1e3a8a]/20 font-black text-[15px] relative overflow-hidden group">
                        <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                        <span className="relative z-10">{t.cart_continue_booking}</span>
                    </Button>
                </Link>
                <p className="text-center text-[10px] text-neutral-400 mt-3 font-bold tracking-wide uppercase">
                    {t.cart_no_upfront}
                </p>
            </div>
        </div>
    );
}
