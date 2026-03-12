"use client"

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import { ArrowLeft, ArrowRight, Calendar, Clock } from 'lucide-react';
import { useRef } from 'react';
import Link from 'next/link';
import 'swiper/css';
import 'swiper/css/navigation';

interface BlogItem {
    id: string | number;
    title: string;
    description?: string;
    image: string;
    link: string;
    subtitle?: string; // Optional Date or reading time
}

interface BlogSliderProps {
    title: string;
    items: BlogItem[];
}

export function BlogSlider({ title, items = [] }: BlogSliderProps) {
    const prevRef = useRef<HTMLButtonElement>(null);
    const nextRef = useRef<HTMLButtonElement>(null);

    if (!items || items.length === 0) return null;

    return (
        <section className="py-16 bg-white border-t border-neutral-100">
            <div className="section-container">
                <div className="flex justify-between items-end mb-10 relative">
                    <div>
                        <span className="text-blue-600 font-black uppercase tracking-widest text-xs mb-2 block">Latest Updates</span>
                        <h2 className="text-3xl md:text-4xl font-black text-neutral-900 tracking-tighter">
                            {title}
                        </h2>
                    </div>

                    <div className="flex gap-2 relative z-10">
                        <button
                            ref={prevRef}
                            className="w-12 h-12 rounded-full bg-neutral-50 border border-neutral-200 flex items-center justify-center text-neutral-600 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <button
                            ref={nextRef}
                            className="w-12 h-12 rounded-full bg-neutral-50 border border-neutral-200 flex items-center justify-center text-neutral-600 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                        >
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="relative">
                    <Swiper
                        modules={[Navigation]}
                        spaceBetween={24}
                        slidesPerView={1.1}
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
                            640: { slidesPerView: 2, spaceBetween: 24 },
                            1024: { slidesPerView: 3, spaceBetween: 24 },
                            1280: { slidesPerView: 4, spaceBetween: 24 },
                        }}
                        className="!pb-6"
                    >
                        {items.map((item, index) => (
                            <SwiperSlide key={item.id || index} className="h-auto">
                                <Link
                                    href={item.link || '#'}
                                    className="group flex flex-col h-full bg-transparent transition-all duration-300"
                                >
                                    <div className="relative aspect-[16/10] overflow-hidden rounded-3xl mb-6 shadow-md border border-neutral-100">
                                        {item.image ? (
                                            <img
                                                src={item.image}
                                                alt={item.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-neutral-100 flex items-center justify-center text-neutral-400 font-bold uppercase tracking-widest text-xs">
                                                Blog Cover
                                            </div>
                                        )}
                                        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/20 shadow-sm flex items-center gap-1.5">
                                            <Calendar className="w-3 h-3 text-blue-600" />
                                            <span className="text-[10px] font-bold text-neutral-800 uppercase tracking-wider">{item.subtitle || 'Recent Post'}</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col flex-1 px-2">
                                        <h3 className="font-bold text-neutral-900 text-lg md:text-xl leading-tight mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                                            {item.title}
                                        </h3>
                                        {item.description && (
                                            <p className="text-neutral-500 line-clamp-2 md:line-clamp-3 leading-relaxed mb-4 text-sm font-medium">
                                                {item.description}
                                            </p>
                                        )}
                                        <div className="mt-auto flex items-center gap-2 text-blue-600 font-black uppercase text-xs tracking-widest group-hover:gap-4 transition-all">
                                            Read Article <ArrowRight className="w-4 h-4" />
                                        </div>
                                    </div>
                                </Link>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>
            </div>
        </section>
    );
}
