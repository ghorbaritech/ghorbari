"use client"

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useRef } from 'react';
import Link from 'next/link';
import 'swiper/css';
import 'swiper/css/navigation';

interface InfoItem {
    id: string | number;
    title: string;
    description?: string;
    image: string;
    link: string;
}

interface InfoCardSliderProps {
    title: string;
    items: InfoItem[];
}

export function InfoCardSlider({ title, items = [] }: InfoCardSliderProps) {
    const prevRef = useRef<HTMLButtonElement>(null);
    const nextRef = useRef<HTMLButtonElement>(null);

    if (!items || items.length === 0) return null;

    return (
        <section className="py-12 bg-neutral-50">
            <div className="section-container">
                <div className="flex justify-between items-end mb-8 relative">
                    <h2 className="text-2xl md:text-3xl font-black text-neutral-900 tracking-tight flex items-center gap-3">
                        <span className="w-2 h-8 bg-blue-600 rounded-full inline-block"></span>
                        {title}
                    </h2>

                    <div className="flex gap-2 relative z-10">
                        <button
                            ref={prevRef}
                            className="w-10 h-10 rounded-full bg-white border border-neutral-200 flex items-center justify-center text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </button>
                        <button
                            ref={nextRef}
                            className="w-10 h-10 rounded-full bg-white border border-neutral-200 flex items-center justify-center text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                        >
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div className="relative">
                    <Swiper
                        modules={[Navigation, Autoplay]}
                        spaceBetween={20}
                        slidesPerView={1.2}
                        navigation={{
                            prevEl: prevRef.current,
                            nextEl: nextRef.current,
                        }}
                        onInit={(swiper) => {
                            // @ts-ignore
                            swiper.params.navigation.prevEl = prevRef.current;
                            // @ts-ignore
                            swiper.params.navigation.nextEl = nextRef.current;
                            swiper.navigation.init();
                            swiper.navigation.update();
                        }}
                        breakpoints={{
                            640: { slidesPerView: 2.2, spaceBetween: 24 },
                            1024: { slidesPerView: 3.5, spaceBetween: 24 },
                            1280: { slidesPerView: 4, spaceBetween: 30 },
                        }}
                        autoplay={{ delay: 5000, disableOnInteraction: true }}
                        className="!pb-6 !px-1 -mx-1"
                    >
                        {items.map((item, index) => (
                            <SwiperSlide key={item.id || index} className="h-auto">
                                <Link
                                    href={item.link || '#'}
                                    className="group block relative w-full h-[500px] bg-[#111] rounded-[2rem] overflow-hidden border border-neutral-800 transition-all duration-300 hover:shadow-2xl hover:border-neutral-700"
                                >
                                    {item.image ? (
                                        <img
                                            src={item.image}
                                            alt={item.title || 'Slide Image'}
                                            className="w-full h-full object-contain group-hover:scale-[1.02] transition-transform duration-700"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-neutral-850 flex items-center justify-center text-neutral-500 font-bold uppercase tracking-widest text-xs">
                                            No Image
                                        </div>
                                    )}
                                </Link>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>
            </div>
        </section>
    );
}
