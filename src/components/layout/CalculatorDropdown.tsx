"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { ChevronDown, Construction, Armchair } from "lucide-react";

interface CalculatorDropdownProps {
    language: "EN" | "BN";
    t: any;
}

export function CalculatorDropdown({ language, t }: CalculatorDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleMouseEnter = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setIsOpen(true);
    };

    const handleMouseLeave = () => {
        timeoutRef.current = setTimeout(() => setIsOpen(false), 200);
    };

    return (
        <div 
            className="relative"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <button
                className={`flex items-center gap-1 hover:text-primary-600 transition-colors py-3 border-b-2 tracking-wide ${
                    isOpen ? "text-primary-600 border-primary-600" : "text-neutral-700 border-transparent hover:border-primary-600"
                }`}
            >
                {t.nav_cost_calculator}
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 w-64 bg-white border border-neutral-100 shadow-xl rounded-b-2xl py-2 z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
                    <Link
                        href="/tools/cost-calculator"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 group transition-colors"
                    >
                        <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center shrink-0 group-hover:bg-primary-100">
                            <Construction className="w-5 h-5 text-primary-600" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-neutral-900 leading-tight">
                                {language === "BN" ? "ভবন নির্মাণ ক্যালকুলেটর" : "Building Construction"}
                            </span>
                            <span className="text-[10px] text-neutral-500 font-medium">
                                {language === "BN" ? "নির্মাণ ব্যয়ের সঠিক হিসাব" : "Accurate building estimates"}
                            </span>
                        </div>
                    </Link>

                    <Link
                        href="/tools/interior-calculator"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 group transition-colors"
                    >
                        <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0 group-hover:bg-emerald-100">
                            <Armchair className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-neutral-900 leading-tight">
                                {t.calc_int_title}
                            </span>
                            <span className="text-[10px] text-neutral-500 font-medium">
                                {t.calc_int_subtitle}
                            </span>
                        </div>
                    </Link>
                </div>
            )}
        </div>
    );
}
