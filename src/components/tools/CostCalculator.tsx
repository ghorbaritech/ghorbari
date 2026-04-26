"use client";

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Calculator, 
    Home, 
    Layers, 
    Info, 
    Download, 
    Zap, 
    ShieldCheck, 
    HardHat,
    PieChart,
    Sparkles,
    ArrowRight,
    MapPin,
    Ruler,
    Building2,
    CheckCircle2
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from 'next/link';

const BASE_RATE = 2300; // Base cost per sqft for Standard in BDT

const QUALITY_OPTIONS = [
    { id: 'budget', value: 0.85, icon: Zap, color: 'bg-slate-100 text-slate-700' },
    { id: 'standard', value: 1.0, icon: Home, color: 'bg-blue-50 text-blue-700' },
    { id: 'premium', value: 1.3, icon: HardHat, color: 'bg-emerald-50 text-emerald-700' },
    { id: 'luxury', value: 1.7, icon: ShieldCheck, color: 'bg-amber-50 text-amber-700' },
] as const;

const UNIT_CONVERSION = {
    sqft: 1,
    katha: 720,
    decimal: 435.6
};

const MATERIAL_RATES = {
    cement: 540,
    steel: 93,
    bricks: 14,
    sand: 65,
    stone: 230,
    tiles: 150,
    paint: 650,
    fittings: 800,
    fixtures: 4500,
};

export default function CostCalculator() {
    const { t, language } = useLanguage();
    const isBN = language === 'BN';

    // Form State
    const [inputValue, setInputValue] = useState<number>(1200);
    const [unit, setUnit] = useState<'sqft' | 'katha' | 'decimal'>('sqft');
    const [floors, setFloors] = useState<number>(1);
    const [quality, setQuality] = useState<string>('standard');
    const [location, setLocation] = useState<'dhaka' | 'outside'>('dhaka');
    const [foundation, setFoundation] = useState<'shallow' | 'deep'>('shallow');

    // Calculation logic
    const results = useMemo(() => {
        const areaSqft = inputValue * UNIT_CONVERSION[unit];
        const qualityOption = QUALITY_OPTIONS.find(o => o.id === quality) || QUALITY_OPTIONS[1];
        
        const qualityMultiplier = qualityOption.value;
        const locationMultiplier = location === 'dhaka' ? 1.08 : 1.0; // 8% extra for Dhaka
        const floorMultiplier = floors > 5 ? 1 + (floors - 5) * 0.015 : 1.0; // 1.5% extra per floor above 5
        const foundationCostPerSqft = foundation === 'deep' ? 450 : 0; // Piling cost estimate

        const constructionCostPerSqft = BASE_RATE * qualityMultiplier * locationMultiplier * floorMultiplier;
        
        const totalConstruction = areaSqft * floors * constructionCostPerSqft;
        const totalFoundation = areaSqft * foundationCostPerSqft;
        
        const totalCost = totalConstruction + totalFoundation;
        const perSqft = totalCost / (areaSqft * floors);
        const totalArea = areaSqft * floors;

        // Material quantity estimations based on BD standards
        const materials = {
            cement: totalArea * 0.45 * (quality === 'luxury' ? 1.05 : 1),
            steel: totalArea * 4.8 * (quality === 'luxury' ? 1.1 : 1),
            bricks: totalArea * 22,
            sand: totalArea * 1.6,
            stone: totalArea * 1.3,
            tiles: totalArea * 1.15,
            paint: totalArea * 0.15,
            fittings: totalArea / 45,
            fixtures: totalArea / 150,
        };

        return {
            total: totalCost,
            perSqft: perSqft,
            areaSqft: areaSqft,
            totalArea: totalArea,
            materials,
            breakdown: {
                civil: totalCost * 0.42,
                finishing: totalCost * 0.33,
                mep: totalCost * 0.15,
                contingency: totalCost * 0.10
            }
        };
    }, [inputValue, unit, floors, quality, location, foundation]);

    const formatCurrency = (val: number) => {
        const formatted = new Intl.NumberFormat(isBN ? 'bn-BD' : 'en-BD', {
            maximumFractionDigits: 0
        }).format(val);
        return `${formatted}৳`; // Align with production style: symbol always at end
    };

    return (
        <div className="min-h-screen bg-[#fafafa] py-12 px-4 md:py-20 overflow-hidden relative">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-100/30 rounded-full blur-[120px] -z-10 animate-pulse-slow translate-x-1/3 -translate-y-1/3" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-100/20 rounded-full blur-[100px] -z-10 animate-pulse-slow -translate-x-1/3 translate-y-1/3" />

            <div className="max-w-7xl mx-auto">
                {/* Header section with enhanced typography */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16 space-y-6"
                >
                    <div className="inline-flex items-center px-4 py-2 rounded-2xl bg-white shadow-xl shadow-primary-900/5 border border-primary-50">
                        <Calculator className="w-4 h-4 mr-2 text-primary-600" />
                        <span className="text-[11px] font-black uppercase tracking-[0.2em] text-primary-950">Dalankotha Intelligence</span>
                    </div>
                    
                    <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-neutral-900 tracking-tight leading-[1.1]">
                        {isBN ? "ঘর তৈরির " : "Build Your "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-emerald-600">
                            {isBN ? "খরচ ক্যালকুলেটর" : "Dream with Certainty"}
                        </span>
                    </h1>
                    
                    <p className="text-lg md:text-xl text-neutral-500 max-w-3xl mx-auto font-medium leading-relaxed">
                        {t.calc_subtitle}
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                    {/* Left Column: Input Form */}
                    <motion.div 
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="lg:col-span-12 xl:col-span-5 space-y-8"
                    >
                        <Card className="border-none shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] rounded-[2.5rem] overflow-hidden bg-white/80 backdrop-blur-xl border border-white/20">
                            <CardContent className="p-8 space-y-6">
                                
                                {/* Location & Unit Group */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-8 border-b border-neutral-100">
                                    <div className="space-y-4">
                                        <label className="text-xs font-black uppercase tracking-widest text-neutral-400 flex items-center gap-2">
                                            <MapPin className="w-3.5 h-3.5 text-primary-600" />
                                            {t.calc_location}
                                        </label>
                                        <div className="flex p-1 bg-neutral-100 rounded-2xl">
                                            <button 
                                                onClick={() => setLocation('dhaka')}
                                                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${location === 'dhaka' ? 'bg-white text-primary-950 shadow-md' : 'text-neutral-500 hover:text-neutral-700'}`}
                                            >
                                                {t.opt_dhaka}
                                            </button>
                                            <button 
                                                onClick={() => setLocation('outside')}
                                                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${location === 'outside' ? 'bg-white text-primary-950 shadow-md' : 'text-neutral-500 hover:text-neutral-700'}`}
                                            >
                                                {t.opt_outside_dhaka}
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        <label className="text-xs font-black uppercase tracking-widest text-neutral-400 flex items-center gap-2">
                                            <Ruler className="w-3.5 h-3.5 text-primary-600" />
                                            {t.calc_land_unit}
                                        </label>
                                        <div className="flex p-1 bg-neutral-100 rounded-2xl">
                                            {(['sqft', 'katha', 'decimal'] as const).map((u) => (
                                                <button 
                                                    key={u}
                                                    onClick={() => setUnit(u)}
                                                    className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-tighter transition-all ${unit === u ? 'bg-white text-primary-950 shadow-md' : 'text-neutral-500 hover:text-neutral-700'}`}
                                                >
                                                    {u === 'sqft' ? t.lbl_sqft : u === 'katha' ? t.lbl_katha : t.lbl_decimal}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Land Size Input */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-black uppercase tracking-widest text-neutral-900">
                                            {t.calc_land_size}
                                        </label>
                                        <div className="flex items-center gap-2 text-primary-600 font-bold bg-primary-50 px-4 py-1.5 rounded-full text-xs">
                                            <Layers className="w-3.5 h-3.5" />
                                            {Math.round(results.areaSqft)} {t.lbl_sqft}
                                        </div>
                                    </div>
                                    <div className="relative group">
                                        <Input 
                                            type="number" 
                                            value={inputValue}
                                            onChange={(e) => setInputValue(Number(e.target.value))}
                                            className="h-16 rounded-2xl border-neutral-100 bg-neutral-50/50 text-2xl font-black focus:ring-primary-500/20 group-hover:border-primary-200 transition-all px-6"
                                            placeholder="0.00"
                                        />
                                        <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                            <span className="text-neutral-300 font-black text-xs uppercase tracking-widest">{unit}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Floors & Foundation */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <label className="text-xs font-black uppercase tracking-widest text-neutral-400 flex items-center gap-2">
                                            <Building2 className="w-3.5 h-3.5 text-primary-600" />
                                            {t.calc_floors}
                                        </label>
                                        <div className="flex items-center gap-3">
                                            <button 
                                                onClick={() => setFloors(Math.max(1, floors - 1))}
                                                className="w-12 h-12 rounded-xl bg-neutral-100 flex items-center justify-center text-xl font-bold hover:bg-neutral-200 transition-colors"
                                            >
                                                -
                                            </button>
                                            <div className="flex-1 h-12 rounded-xl bg-neutral-50 border border-neutral-100 flex items-center justify-center text-lg font-black">
                                                {floors}
                                            </div>
                                            <button 
                                                onClick={() => setFloors(Math.min(20, floors + 1))}
                                                className="w-12 h-12 rounded-xl bg-neutral-100 flex items-center justify-center text-xl font-bold hover:bg-neutral-200 transition-colors"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-xs font-black uppercase tracking-widest text-neutral-400 flex items-center gap-2">
                                            <ShieldCheck className="w-3.5 h-3.5 text-primary-600" />
                                            {t.calc_foundation}
                                        </label>
                                        <div className="grid grid-cols-2 p-1 bg-neutral-100 rounded-2xl h-12">
                                            <button 
                                                onClick={() => setFoundation('shallow')}
                                                className={`rounded-xl text-[10px] font-black uppercase transition-all ${foundation === 'shallow' ? 'bg-white text-primary-950 shadow-md' : 'text-neutral-500'}`}
                                            >
                                                {t.opt_shallow}
                                            </button>
                                            <button 
                                                onClick={() => setFoundation('deep')}
                                                className={`rounded-xl text-[10px] font-black uppercase transition-all ${foundation === 'deep' ? 'bg-white text-primary-950 shadow-md' : 'text-neutral-500'}`}
                                            >
                                                {t.opt_deep}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Material Quality - Grid Selector */}
                                <div className="space-y-5">
                                    <label className="text-xs font-black uppercase tracking-widest text-neutral-400 flex items-center gap-2">
                                        <Sparkles className="w-3.5 h-3.5 text-primary-600" />
                                        {t.calc_quality}
                                    </label>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                        {QUALITY_OPTIONS.map((opt) => (
                                            <button
                                                key={opt.id}
                                                onClick={() => setQuality(opt.id)}
                                                className={`p-4 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 relative overflow-hidden group ${
                                                    quality === opt.id 
                                                    ? 'border-primary-600 bg-primary-50/30' 
                                                    : 'border-neutral-50 hover:border-neutral-200 bg-neutral-50/30'
                                                }`}
                                            >
                                                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${opt.color} transition-transform group-hover:scale-110 shadow-sm`}>
                                                    <opt.icon className="w-5 h-5" />
                                                </div>
                                                <span className={`font-bold text-[10px] uppercase tracking-widest ${quality === opt.id ? 'text-primary-950' : 'text-neutral-500'}`}>
                                                    {opt.id === 'budget' ? t.calc_budget : 
                                                     opt.id === 'standard' ? t.calc_standard :
                                                     opt.id === 'premium' ? t.calc_premium :
                                                     t.calc_luxury}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Note card with more premium look */}
                        <div className="p-8 rounded-[2rem] bg-gradient-to-br from-amber-50 to-orange-50/30 border border-amber-100/50 flex gap-5 shadow-sm">
                            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center flex-shrink-0 shadow-md">
                                <Info className="w-6 h-6 text-amber-600" />
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-amber-800">Professional Advice</h4>
                                <p className="text-sm text-amber-900/70 leading-relaxed font-medium">
                                    {isBN 
                                        ? "এই অনুমানটি বর্তমান বাজারের গড় মূল্যের উপর ভিত্তি করে। প্রকৃত খরচ সয়েল টেস্ট, অবস্থান এবং মেমপ্লান অনুযায়ী পরিবর্তিত হবে।" 
                                        : "Estimates are project-wide averages. Local soil conditions, specific site access, and custom architectural details will impact the final budget."
                                    }
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right Column: Dynamic Results Display */}
                    <motion.div 
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="lg:col-span-12 xl:col-span-7 h-full"
                    >
                        <Card className="border-none shadow-[0_40px_80px_-15px_rgba(0,0,0,0.15)] rounded-[3rem] overflow-hidden text-white relative min-h-[700px] flex flex-col" style={{ backgroundColor: '#001F3F' }}>
                            {/* Animated background glow */}
                            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary-600/30 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 animate-pulse-slow" />
                            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-emerald-500/20 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2 animate-pulse-slow" />
                            
                            <CardContent className="p-10 md:p-16 space-y-12 relative z-10 flex-1 flex flex-col justify-between">
                                {/* Total Estimated Display */}
                                <div className="space-y-4 text-center">
                                    <div className="flex items-center justify-center gap-3 text-primary-400 font-black uppercase tracking-[0.3em] text-[10px]">
                                        <div className="w-8 h-px bg-primary-400/30" />
                                        {t.calc_total}
                                        <div className="w-8 h-px bg-primary-400/30" />
                                    </div>
                                    <AnimatePresence mode='wait'>
                                        <motion.h2 
                                            key={results.total}
                                            initial={{ scale: 0.95, opacity: 0, y: 10 }}
                                            animate={{ scale: 1, opacity: 1, y: 0 }}
                                            transition={{ type: "spring", stiffness: 100 }}
                                            className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter"
                                        >
                                            {formatCurrency(results.total).split('.')[0]}
                                        </motion.h2>
                                    </AnimatePresence>
                                    
                                    <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                                        <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl text-[10px] font-black text-primary-200 border border-white/5 flex items-center gap-2">
                                            <PieChart className="w-3.5 h-3.5" />
                                            {t.calc_per_sqft}: {formatCurrency(results.perSqft)}
                                        </div>
                                        <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl text-[10px] font-black text-emerald-200 border border-white/5 flex items-center gap-2">
                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                            Market Verified Rate
                                        </div>
                                    </div>
                                </div>

                                {/* Cost Breakdown - Interactive Grid */}
                                <div className="space-y-8">
                                    <div className="flex items-center justify-between border-b border-white/10 pb-5">
                                        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-primary-300">
                                            {t.calc_breakdown}
                                        </h3>
                                        <Badge className="bg-emerald-500/20 text-emerald-400 border-none px-3 py-1 font-bold text-[10px] uppercase">
                                            AI Distribution
                                        </Badge>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {[
                                            { 
                                                label: t.calc_civil, 
                                                amount: results.breakdown.civil, 
                                                color: 'bg-blue-400', 
                                                icon: HardHat, 
                                                percent: 42,
                                                items: [
                                                    { name: t.calc_mat_cement, val: results.materials.cement, unit: t.unit_bags, key: 'cement' },
                                                    { name: t.calc_mat_steel, val: results.materials.steel, unit: t.unit_kg, key: 'steel' },
                                                    { name: t.calc_mat_bricks, val: results.materials.bricks, unit: t.unit_pcs, key: 'bricks' },
                                                    { name: t.calc_mat_sand, val: results.materials.sand, unit: t.unit_cft, key: 'sand' },
                                                    { name: t.calc_mat_stone, val: results.materials.stone, unit: t.unit_cft, key: 'stone' },
                                                ]
                                            },
                                            { 
                                                label: t.calc_finishing, 
                                                amount: results.breakdown.finishing, 
                                                color: 'bg-emerald-400', 
                                                icon: Sparkles, 
                                                percent: 33,
                                                items: [
                                                    { name: t.calc_mat_tiles, val: results.materials.tiles, unit: t.unit_sqft, key: 'tiles' },
                                                    { name: t.calc_mat_paint, val: results.materials.paint, unit: t.unit_ltr, key: 'paint' },
                                                ]
                                            },
                                            { 
                                                label: t.calc_mep, 
                                                amount: results.breakdown.mep, 
                                                color: 'bg-purple-400', 
                                                icon: Zap, 
                                                percent: 15,
                                                items: [
                                                    { name: t.calc_mat_fittings, val: results.materials.fittings, unit: t.unit_points, key: 'fittings' },
                                                    { name: t.calc_mat_fixtures, val: results.materials.fixtures, unit: t.unit_pcs, key: 'fixtures' },
                                                ]
                                            },
                                            { 
                                                label: t.calc_contingency, 
                                                amount: results.breakdown.contingency, 
                                                color: 'bg-orange-400', 
                                                icon: ShieldCheck, 
                                                percent: 10,
                                                items: language === 'BN' ? [{ name: 'জরুরি তহবিল', val: 1, unit: 'সেট' }] : [{ name: 'Emergency Fund', val: 1, unit: 'Set' }]
                                            },
                                        ].map((item, idx) => (
                                            <motion.div 
                                                key={idx}
                                                whileHover={{ scale: 1.01, backgroundColor: 'rgba(255,255,255,0.08)' }}
                                                className="space-y-3 p-5 rounded-3xl bg-white/5 border border-white/5 transition-all"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <div className="p-2 rounded-xl bg-white/10 text-white">
                                                            <item.icon className="w-3 h-3" />
                                                        </div>
                                                        <span className="text-[10px] font-black text-neutral-300 uppercase tracking-widest">{item.label}</span>
                                                    </div>
                                                    <span className="text-sm font-black text-primary-400">{item.percent}%</span>
                                                </div>
                                                <div className="space-y-1.5 pt-1">
                                                    {item.items.map((sub, sIdx) => (
                                                        <div key={sIdx} className="flex justify-between items-center text-[11px] border-b border-white/5 pb-1 last:border-0 group/item">
                                                            <div className="flex flex-col">
                                                                <span className="text-neutral-400 font-medium">{sub.name}</span>
                                                                {sub.key && MATERIAL_RATES[sub.key as keyof typeof MATERIAL_RATES] && (
                                                                    <span className="text-[10px] text-primary-300 font-bold">
                                                                        @{formatCurrency(MATERIAL_RATES[sub.key as keyof typeof MATERIAL_RATES])}/{sub.unit}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <span className="font-bold text-white">
                                                                {Math.round(sub.val).toLocaleString(isBN ? 'bn-BD' : 'en-US')} {sub.unit}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                                <p className="text-white text-base font-black pt-1">
                                                    {formatCurrency(item.amount).split('.')[0]}
                                                </p>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>

                                {/* Call to Actions - Premium Buttons */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-8">
                                    <Link href="/services/design/book" className="flex-1">
                                        <Button className="w-full h-20 rounded-[1.5rem] bg-white text-primary-950 hover:bg-neutral-100 font-black text-xs uppercase tracking-[0.2em] group shadow-2xl transition-all hover:scale-[1.02] active:scale-[0.98]">
                                            {t.calc_book_consultation}
                                            <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-2 transition-transform" />
                                        </Button>
                                    </Link>
                                    <Button variant="outline" className="h-20 rounded-[1.5rem] border-white/20 bg-white/5 text-white hover:bg-white/10 font-black text-xs uppercase tracking-[0.2em] backdrop-blur-md transition-all">
                                        <Download className="w-5 h-5 mr-3" />
                                        {t.calc_download_report}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
