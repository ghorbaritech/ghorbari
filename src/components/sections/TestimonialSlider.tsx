"use client"

import React from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination, Navigation } from 'swiper/modules'
import { Quote, Star } from 'lucide-react'

import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/navigation'

interface TestimonialItem {
    id: number | string
    title: string // User Name
    subtitle: string // User Designation/Location
    description: string // Review Text
    image: string // User Avatar
}

interface TestimonialSliderProps {
    title?: string
    items: TestimonialItem[]
}

const TestimonialSlider = ({ title, items }: TestimonialSliderProps) => {
    if (!items || items.length === 0) return null

    return (
        <section className="py-20 bg-white overflow-hidden">
            <div className="section-container">
                <div className="flex flex-col items-center mb-12 text-center">
                    <h2 className="text-3xl md:text-5xl font-black text-neutral-900 mb-4 tracking-tight">
                        {title || 'ক্লায়েন্টদের গল্প'}
                    </h2>
                    <div className="w-20 h-1.5 bg-blue-600 rounded-full" />
                </div>

                <div className="relative px-4">
                    <Swiper
                        modules={[Autoplay, Pagination, Navigation]}
                        spaceBetween={30}
                        slidesPerView={1}
                        loop={true}
                        autoplay={{
                            delay: 5000,
                            disableOnInteraction: false,
                        }}
                        pagination={{
                            clickable: true,
                            bulletClass: 'testimonial-bullet',
                            bulletActiveClass: 'testimonial-bullet-active',
                        }}
                        breakpoints={{
                            768: { slidesPerView: 2 },
                            1280: { slidesPerView: 3 },
                        }}
                        className="!pb-16"
                    >
                        {items.map((item, index) => (
                            <SwiperSlide key={item.id || index} className="h-auto">
                                <div className="h-full bg-white border border-neutral-100 rounded-[2.5rem] p-8 md:p-10 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] flex flex-col relative group hover:border-blue-100 transition-all duration-300">
                                    <div className="absolute top-8 right-8 text-blue-100 group-hover:text-blue-200 transition-colors">
                                        <Quote size={60} strokeWidth={2.5} />
                                    </div>

                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-md">
                                            <img
                                                src={item.image}
                                                alt={item.title}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-neutral-900 text-xl leading-tight">
                                                {item.title}
                                            </h4>
                                            <p className="text-sm font-bold text-blue-600 uppercase tracking-widest mt-1">
                                                {item.subtitle}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex gap-1 mb-6">
                                        {[1, 2, 3, 4, 5].map((_, i) => (
                                            <Star key={i} size={16} fill="#FACC15" color="#FACC15" />
                                        ))}
                                    </div>

                                    <p className="text-neutral-600 leading-relaxed text-lg font-medium italic">
                                        "{item.description}"
                                    </p>
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>
            </div>

            <style jsx global>{`
                .testimonial-bullet {
                    width: 10px;
                    height: 10px;
                    display: inline-block;
                    border-radius: 50%;
                    background: #E5E7EB;
                    margin: 0 6px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                .testimonial-bullet-active {
                    background: #2563EB;
                    width: 30px;
                    border-radius: 10px;
                }
            `}</style>
        </section>
    )
}

export default TestimonialSlider
