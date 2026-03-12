"use client"

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import Link from 'next/link';
import 'swiper/css';

interface IconItem {
    id: string | number;
    title: string;
    image: string;
    link: string;
}

interface MovingIconSliderProps {
    title: string;
    items: IconItem[];
}

export function MovingIconSlider({ title, items = [] }: MovingIconSliderProps) {
    if (!items || items.length === 0) return null;

    return (
        <section className="py-12 bg-white">
            <div className="section-container overflow-hidden">
                <div className="mb-8 text-center">
                    <h2 className="text-3xl font-black text-neutral-900 tracking-tight">
                        {title}
                    </h2>
                    <div className="w-16 h-1.5 bg-blue-600 mx-auto mt-4 rounded-full"></div>
                </div>

                {/* Using a linear continuous movement by setting speed equal to delay and linear easing in CSS */}
                <div className="relative -mx-4 px-4 moving-icon-slider-container">
                    <Swiper
                        modules={[Autoplay]}
                        spaceBetween={32}
                        slidesPerView={'auto'}
                        loop={true}
                        speed={5000}
                        autoplay={{ delay: 0, disableOnInteraction: false }}
                        breakpoints={{
                            480: { spaceBetween: 40 },
                            768: { spaceBetween: 56 },
                            1024: { spaceBetween: 72 },
                            1280: { spaceBetween: 84 },
                        }}
                        className="!pb-4 !pt-4"
                        style={{
                            transitionTimingFunction: "linear",
                        } as any}
                    >
                        {items.map((item, index) => (
                            <SwiperSlide key={item.id + '-' + index} className="!w-auto" style={{ transitionTimingFunction: "linear" }}>
                                <Link
                                    href={item.link || '#'}
                                    className="group flex flex-col items-center gap-4 w-[120px] md:w-[140px]"
                                >
                                    <div className="w-full aspect-square rounded-full bg-[#f9fafb] shadow-sm border border-neutral-100 flex items-center justify-center p-6 group-hover:scale-110 group-hover:shadow-lg group-hover:bg-white group-hover:border-blue-100 transition-all duration-300 relative overflow-hidden">
                                        {item.image ? (
                                            <img
                                                src={item.image}
                                                alt={item.title}
                                                className="w-full h-full object-contain drop-shadow-sm group-hover:scale-110 transition-transform duration-500 relative z-10"
                                            />
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-neutral-200"></div>
                                        )}
                                        {/* Hover glow effect */}
                                        <div className="absolute inset-0 bg-blue-500/0 group-hover:bg-blue-500/5 rounded-full transition-colors z-0"></div>
                                    </div>
                                    <span className="text-[11px] md:text-xs font-bold text-neutral-600 text-center uppercase tracking-wider group-hover:text-blue-600 transition-colors line-clamp-2">
                                        {item.title}
                                    </span>
                                </Link>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                    {/* Add linear style to swiper wrapper globally if inline doesn't work */}
                    <style jsx global>{`
                        .moving-icon-slider-container .swiper-wrapper {
                            transition-timing-function: linear !important;
                        }
                    `}</style>
                </div>
            </div>
        </section>
    );
}
