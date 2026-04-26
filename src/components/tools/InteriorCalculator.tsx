"use client";

import { useState, useMemo } from "react";
import { 
    Armchair, 
    ChefHat, 
    Layout, 
    Star, 
    CheckCircle2, 
    Info, 
    ChevronRight, 
    Palette, 
    Layers, 
    ShieldCheck, 
    PlusCircle, 
    MinusCircle 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";

const BDT_SYMBOL = "৳";

type Tier = 'essential' | 'classic' | 'premium';
type BHKType = '1bhk' | '2bhk' | '3bhk' | '4bhk';

const RATES = {
    base_sqft: {
        essential: 850,
        classic: 1550,
        premium: 2450
    },
    components: {
        modular_kitchen: { essential: 120000, classic: 185000, premium: 320000 },
        wardrobe_unit: { essential: 45000, classic: 75000, premium: 135000 },
        tv_unit: { essential: 15000, classic: 28000, premium: 55000 },
        false_ceiling_sqft: { essential: 90, classic: 140, premium: 260 }
    }
};

const BKH_SIZES = {
    '1bhk': 650,
    '2bhk': 1050,
    '3bhk': 1550,
    '4bhk': 2250
};

export function InteriorCalculator() {
    const { language, t } = useLanguage();
    const isBN = language === "BN";
    const [bhk, setBhk] = useState<BHKType>('2bhk');
    const [tier, setTier] = useState<Tier>('classic');
    const [includeCeiling, setIncludeCeiling] = useState(true);
    const [includeKitchen, setIncludeKitchen] = useState(true);

    const toBNDigits = (str: string | number) => {
        const digits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
        return str.toString().replace(/\d/g, d => digits[parseInt(d)]);
    };

    const formatCurrency = (val: number) => {
        const formatted = new Intl.NumberFormat('en-BD', {
            maximumFractionDigits: 0
        }).format(val);
        const result = isBN ? toBNDigits(formatted) : formatted;
        return `${result}${BDT_SYMBOL}`;
    };

    const results = useMemo(() => {
        const size = BKH_SIZES[bhk];
        const baseRate = RATES.base_sqft[tier];
        
        // Logical counts based on BHK
        const roomCount = bhk === '1bhk' ? 1 : bhk === '2bhk' ? 2 : bhk === '3bhk' ? 3 : 4;
        
        let total = size * baseRate;
        
        const breakdown = [
            { 
                name: t.calc_int_item_kitchen, 
                val: includeKitchen ? RATES.components.modular_kitchen[tier] : 0, 
                desc: t.calc_int_item_kitchen_desc,
                icon: ChefHat 
            },
            { 
                name: t.calc_int_item_wardrobes, 
                val: RATES.components.wardrobe_unit[tier] * roomCount, 
                desc: `${isBN ? toBNDigits(roomCount) : roomCount} ${isBN ? 'টি রুম' : 'Units'}`,
                icon: Layout 
            },
            { 
                name: t.calc_int_item_ceiling, 
                val: includeCeiling ? RATES.components.false_ceiling_sqft[tier] * size : 0,
                desc: `${isBN ? toBNDigits(size) : size} ${isBN ? 'বর্গফুট' : 'sqft'}`,
                icon: Layers 
            },
            { 
                name: t.calc_int_item_decor, 
                val: (size * (baseRate * 0.3)), // 30% of base is for miscellaneous
                desc: t.calc_int_item_decor_desc,
                icon: Palette 
            }
        ];

        const finalTotal = breakdown.reduce((acc, item) => acc + item.val, 0);

        return {
            total: finalTotal,
            breakdown,
            size
        };
    }, [bhk, tier, includeCeiling, includeKitchen, language]);

    return (
        <div className="w-full max-w-6xl mx-auto p-4 md:p-8 space-y-12">
            {/* Header */}
            <div className="text-center space-y-4">
                <h1 className="text-4xl md:text-5xl font-black text-primary-950 tracking-tight">
                    {t.calc_int_title}
                </h1>
                <p className="text-neutral-500 max-w-2xl mx-auto font-medium">
                    {t.calc_int_subtitle}
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left: Configuration */}
                <div className="lg:col-span-7 space-y-10">
                    
                    {/* Step 1: BHK */}
                    <div className="space-y-4">
                        <label className="text-sm font-black uppercase tracking-widest text-primary-600 flex items-center gap-2">
                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary-100 text-[10px]">1</span>
                            {t.calc_int_bhk}
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {(['1bhk', '2bhk', '3bhk', '4bhk'] as BHKType[]).map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setBhk(type)}
                                    className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                                        bhk === type 
                                        ? "border-primary-600 bg-primary-50 ring-4 ring-primary-50" 
                                        : "border-neutral-100 bg-white hover:border-primary-200"
                                    }`}
                                >
                                    <span className={`text-lg font-black ${bhk === type ? "text-primary-600" : "text-neutral-900"}`}>
                                        {type.toUpperCase()}
                                    </span>
                                    <span className="text-[10px] uppercase font-bold text-neutral-400">
                                        ~{isBN ? BKH_SIZES[type].toLocaleString('bn-BD') : BKH_SIZES[type]} {t.lbl_sqft || "Sqft"}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Step 2: Quality Tier */}
                    <div className="space-y-4">
                        <label className="text-sm font-black uppercase tracking-widest text-primary-600 flex items-center gap-2">
                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary-100 text-[10px]">2</span>
                            {t.calc_int_tier}
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Essential */}
                            <button
                                onClick={() => setTier('essential')}
                                className={`p-6 rounded-3xl border-2 transition-all text-left relative overflow-hidden group ${
                                    tier === 'essential' 
                                    ? "border-amber-500 bg-amber-50/30" 
                                    : "border-neutral-100 bg-white hover:border-amber-200"
                                }`}
                            >
                                <div className="space-y-1 relative z-10">
                                    <span className="text-xs font-black uppercase tracking-widest text-amber-600 opacity-60">{t.calc_int_tier_budget}</span>
                                    <h3 className="text-xl font-black text-neutral-900">{t.calc_int_essential}</h3>
                                    <p className="text-[11px] text-neutral-500 leading-relaxed">
                                        {t.calc_int_essential_desc}
                                    </p>
                                </div>
                                {tier === 'essential' && <CheckCircle2 className="absolute top-4 right-4 w-6 h-6 text-amber-500" />}
                            </button>

                            {/* Classic */}
                            <button
                                onClick={() => setTier('classic')}
                                className={`p-6 rounded-3xl border-2 transition-all text-left relative overflow-hidden group ${
                                    tier === 'classic' 
                                    ? "border-primary-600 bg-primary-50/30" 
                                    : "border-neutral-100 bg-white hover:border-primary-200"
                                }`}
                            >
                                <div className="space-y-1 relative z-10">
                                    <span className="text-xs font-black uppercase tracking-widest text-primary-600 opacity-60">{t.calc_int_tier_popular}</span>
                                    <h3 className="text-xl font-black text-neutral-900">{t.calc_int_classic}</h3>
                                    <p className="text-[11px] text-neutral-500 leading-relaxed">
                                        {t.calc_int_classic_desc}
                                    </p>
                                </div>
                                {tier === 'classic' && <CheckCircle2 className="absolute top-4 right-4 w-6 h-6 text-primary-600" />}
                            </button>

                            {/* Premium */}
                            <button
                                onClick={() => setTier('premium')}
                                className={`p-6 rounded-3xl border-2 transition-all text-left relative overflow-hidden group ${
                                    tier === 'premium' 
                                    ? "border-emerald-600 bg-emerald-50/30" 
                                    : "border-neutral-100 bg-white hover:border-emerald-200"
                                }`}
                            >
                                <div className="space-y-1 relative z-10">
                                    <span className="text-xs font-black uppercase tracking-widest text-emerald-600 opacity-60">{t.calc_int_tier_elite}</span>
                                    <h3 className="text-xl font-black text-neutral-900">{t.calc_int_premium}</h3>
                                    <p className="text-[11px] text-neutral-500 leading-relaxed">
                                        {t.calc_int_premium_desc}
                                    </p>
                                </div>
                                {tier === 'premium' && <CheckCircle2 className="absolute top-4 right-4 w-6 h-6 text-emerald-600" />}
                            </button>
                        </div>
                    </div>

                    {/* Additional Options */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <button 
                            onClick={() => setIncludeKitchen(!includeKitchen)}
                            className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all ${
                                includeKitchen ? "border-primary-600 bg-primary-50/10" : "border-neutral-100 bg-neutral-50"
                            }`}
                        >
                            <ChefHat className={`w-6 h-6 ${includeKitchen ? "text-primary-600" : "text-neutral-400"}`} />
                            <div className="text-left flex-1 font-bold">
                                {t.calc_int_kitchen}
                            </div>
                            {includeKitchen ? <MinusCircle className="w-5 h-5 text-rose-500" /> : <PlusCircle className="w-5 h-5 text-emerald-500" />}
                        </button>
                        
                        <button 
                            onClick={() => setIncludeCeiling(!includeCeiling)}
                            className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all ${
                                includeCeiling ? "border-primary-600 bg-primary-50/10" : "border-neutral-100 bg-neutral-50"
                            }`}
                        >
                            <Layers className={`w-6 h-6 ${includeCeiling ? "text-primary-600" : "text-neutral-400"}`} />
                            <div className="text-left flex-1 font-bold">
                                {t.calc_int_ceiling}
                            </div>
                            {includeCeiling ? <MinusCircle className="w-5 h-5 text-rose-500" /> : <PlusCircle className="w-5 h-5 text-emerald-500" />}
                        </button>
                    </div>

                </div>

                {/* Right: Results Summary */}
                <div className="lg:col-span-12 xl:col-span-5 space-y-8">
                    <div className="rounded-[40px] p-8 md:p-10 shadow-2xl relative overflow-hidden group" style={{ backgroundColor: '#001F3F' }}>
                        
                        {/* Background Decor */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-800/20 rounded-full blur-3xl -mr-32 -mt-32 group-hover:bg-primary-600/30 transition-all duration-700" />
                        
                        <div className="relative z-10 space-y-8">
                            <div className="flex items-center justify-between">
                                <span className="text-primary-400/80 text-xs font-black uppercase tracking-[0.2em]">{t.calc_int_total_header}</span>
                                <ShieldCheck className="text-emerald-500 w-5 h-5" />
                            </div>

                            <div className="space-y-1">
                                <div className="text-5xl md:text-6xl font-black text-white flex items-baseline gap-2">
                                    {formatCurrency(results.total)}
                                </div>
                                <p className="text-primary-400/60 text-[11px] font-medium tracking-wide">
                                    {t.calc_int_disclaimer}
                                </p>
                            </div>

                            <div className="h-px bg-white/10" />

                            <div className="space-y-6">
                                {results.breakdown.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-start group/item">
                                        <div className="flex gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 group-hover/item:bg-white/10 transition-colors">
                                                <item.icon className="w-5 h-5 text-primary-300" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-white text-sm font-bold">{item.name}</span>
                                                <span className="text-primary-400/40 text-[10px] uppercase font-black tracking-widest">{item.desc}</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-primary-200 text-sm font-black">{formatCurrency(item.val)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <Button className="w-full h-16 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black uppercase tracking-widest text-sm shadow-xl hover:shadow-emerald-500/20 transition-all">
                                {t.calc_int_consult}
                                <ChevronRight className="w-5 h-5 ml-2" />
                            </Button>
                        </div>
                    </div>

                    {/* Quality Insights */}
                    <div className="bg-neutral-50 rounded-3xl p-8 border border-neutral-100 flex gap-6 items-start">
                        <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shrink-0 shadow-sm">
                            <Star className="w-6 h-6 text-amber-500 fill-amber-500" />
                        </div>
                        <div className="space-y-2">
                            <h4 className="text-sm font-black uppercase tracking-wide text-neutral-900">
                                {t.calc_int_quality_tag}
                            </h4>
                            <p className="text-[12px] text-neutral-500 leading-relaxed font-medium">
                                {t.calc_int_quality_desc}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
