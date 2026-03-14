"use client"

import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay, EffectFade } from "swiper/modules";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { getL } from "@/utils/localization";
import { useLanguage } from "@/context/LanguageContext";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

interface WorkflowStep {
    id: string;
    title: string;
    titleBn?: string;
    description: string;
    descriptionBn?: string;
    image: string;
}

interface DesignWorkflowSliderProps {
    data: {
        title: string;
        titleBn?: string;
        steps: WorkflowStep[];
    };
}

export function DesignWorkflowSlider({ data }: DesignWorkflowSliderProps) {
    const { language } = useLanguage();
    const [activeIndex, setActiveIndex] = useState(0);
    const [swiperRef, setSwiperRef] = useState<any>(null);

    if (!data || !data.steps || data.steps.length === 0) return null;

    return (
        <section className="py-12 bg-neutral-50/50 overflow-hidden relative">
            <div className="container mx-auto px-6">
                <div className="text-center mb-10">
                    <h2 className="text-lg md:text-xl font-bold text-neutral-900 mb-2">
                        {getL(data.title, data.titleBn, language)}
                    </h2>
                </div>

                {/* Top Progress Bar */}
                <div className="max-w-3xl mx-auto mb-10 relative px-8">
                    <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-neutral-200 -translate-y-1/2 z-0 mx-8" />
                    <div className="relative z-10 flex justify-between items-center">
                        {data.steps.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => swiperRef?.slideTo(idx)}
                                className={`w-7 h-7 md:w-9 md:h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-500 ${idx <= activeIndex
                                    ? 'bg-red-600 text-white scale-110 shadow-lg shadow-red-500/30'
                                    : 'bg-neutral-200 text-neutral-400 hover:bg-neutral-300'
                                    }`}
                            >
                                {idx + 1}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="relative group px-2 md:px-10 max-w-5xl mx-auto">
                    {/* Navigation Arrows - Sides */}
                    <button
                        onClick={() => swiperRef?.slidePrev()}
                        className="absolute -left-2 lg:left-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center text-neutral-900 border border-neutral-100 hover:bg-neutral-900 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed group-hover:scale-110"
                        disabled={activeIndex === 0}
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>

                    <button
                        onClick={() => swiperRef?.slideNext()}
                        className="absolute -right-2 lg:right-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center text-neutral-900 border border-neutral-100 hover:bg-neutral-900 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed group-hover:scale-110"
                        disabled={activeIndex === data.steps.length - 1}
                    >
                        <ArrowRight className="w-5 h-5" />
                    </button>

                    <Swiper
                        modules={[Navigation, Autoplay, EffectFade]}
                        effect="fade"
                        speed={800}
                        autoplay={{ delay: 6000, disableOnInteraction: false }}
                        onSwiper={setSwiperRef}
                        onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
                        className="rounded-2xl"
                    >
                        {data.steps.map((step, idx) => (
                            <SwiperSlide key={step.id}>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 items-center bg-white p-6 lg:p-10 rounded-2xl border border-neutral-100 shadow-sm">
                                    {/* Content Column */}
                                    <div className="order-2 lg:order-1 flex flex-col justify-center">
                                        <h3 className="text-xl md:text-2xl font-bold text-neutral-900 mb-4 tracking-tight">
                                            {getL(step.title, step.titleBn, language)}
                                        </h3>
                                        <p className="text-sm md:text-base text-neutral-500 font-medium leading-relaxed mb-8 max-w-md">
                                            {getL(step.description, step.descriptionBn, language)}
                                        </p>

                                        <div className="mt-auto">
                                            <button className="bg-red-600 hover:bg-red-700 text-white font-bold text-[10px] uppercase tracking-widest px-6 py-3 rounded-lg transition-all shadow-md shadow-red-500/20 active:scale-95">
                                                {language === 'BN' ? 'ফ্রি ডিজাইন সেশন বুক করুন' : 'BOOK FREE DESIGN SESSION'}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Image Column */}
                                    <div className="order-1 lg:order-2 relative aspect-[16/10] rounded-xl overflow-hidden bg-neutral-50/50 flex items-center justify-center p-2 border border-neutral-100/50">
                                        <img
                                            src={step.image}
                                            alt={step.title}
                                            className="w-full h-full object-contain transition-opacity duration-300"
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                // Prevent infinite loop if fallback also fails
                                                if (target.src.includes('photo-1497366216548-37526070297c')) {
                                                    target.src = "https://placehold.co/1200x800?text=Design+Step"; // Absolute last resort
                                                    return;
                                                }
                                                console.error("Image failed to load:", step.image);
                                                target.src = "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80"; // Reliable office/design fallback
                                            }}
                                        />
                                    </div>
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>
            </div>
        </section>
    );
}
