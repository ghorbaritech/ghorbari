"use client";

import { useServiceCart } from "@/context/ServiceCartContext";
import { useLanguage } from "@/context/LanguageContext";
import { Button } from "@/components/ui/button";
import { X, ShoppingBag, ArrowRight } from "lucide-react";
import Link from "next/link";

export function ServiceCartSidebar() {
    const { items, removeService, totalAmount, itemCount } = useServiceCart();
    const { t, language } = useLanguage();

    if (itemCount === 0) {
        return (
            <div className="bg-white rounded-[32px] p-8 border border-neutral-200 shadow-sm text-center sticky top-24">
                <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShoppingBag className="w-8 h-8 text-neutral-200" />
                </div>
                <h3 className="text-lg font-black text-neutral-900 mb-2">Cart is Empty</h3>
                <p className="text-sm text-neutral-400 font-bold uppercase tracking-widest leading-relaxed">
                    Select services from the list to start your booking
                </p>
            </div>
        );
    }

    return (
        <div id="sidebar-cart" className="bg-white rounded-[32px] border border-neutral-200 shadow-xl overflow-hidden sticky top-24 flex flex-col max-h-[calc(100vh-120px)]">
            {/* Header */}
            <div className="bg-neutral-900 p-6 text-white">
                <div className="flex items-center justify-between mb-1">
                    <h3 className="text-lg font-black tracking-tight">Your Selection</h3>
                    <span className="bg-primary-600 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                        {itemCount} {itemCount === 1 ? 'Service' : 'Services'}
                    </span>
                </div>
                <p className="text-neutral-400 text-[10px] font-bold uppercase tracking-widest">
                    Tentative Quote
                </p>
            </div>

            {/* Items List */}
            <div className="flex-grow overflow-y-auto p-4 space-y-3">
                {items.map((item) => (
                    <div
                        key={item.id}
                        className="group bg-neutral-50 border border-neutral-100 rounded-2xl p-4 flex items-start gap-3 relative transition-all hover:bg-white hover:shadow-md hover:border-neutral-200"
                    >
                        <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-neutral-200">
                            <img
                                src={item.image_url || 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?q=80&w=100'}
                                alt={item.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="flex-grow min-w-0">
                            <h4 className="text-sm font-black text-neutral-900 truncate pr-6">
                                {language === 'BN' ? item.name_bn : item.name}
                            </h4>
                            <div className="flex items-center gap-1 mt-1">
                                <span className="text-xs font-black text-primary-600">
                                    ৳{item.unit_price.toLocaleString()}
                                </span>
                                <span className="text-[10px] font-bold text-neutral-400 uppercase">
                                    / {item.unit_type}
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={() => removeService(item.id)}
                            className="absolute top-3 right-3 p-1 rounded-lg text-neutral-300 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>

            {/* Footer */}
            <div className="p-6 bg-neutral-50 border-t border-neutral-100 mt-auto">
                <div className="flex items-end justify-between mb-6">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Total Estimate</span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-black text-neutral-900">৳{totalAmount.toLocaleString()}</span>
                            <span className="text-[10px] font-bold text-neutral-400 uppercase">*Starting</span>
                        </div>
                    </div>
                </div>

                <Link href="/services/booking">
                    <Button className="w-full h-14 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-black uppercase tracking-widest text-xs group shadow-lg shadow-primary-600/20">
                        Proceed to Booking
                        <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                </Link>
                <p className="text-center text-[9px] font-bold text-neutral-400 uppercase tracking-tighter mt-4">
                    Admin will verify scope before final pricing
                </p>
            </div>
        </div>
    );
}
