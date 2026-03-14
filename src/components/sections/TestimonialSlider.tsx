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
        <>
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
                            <div className="h-full bg-white border border-neutral-100 rounded-[2rem] p-8 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.08)] flex flex-col relative group hover:border-blue-100 transition-all duration-500">
                                {/* Quote Icon */}
                                <div className="absolute top-8 right-8 text-blue-100 group-hover:text-blue-200 transition-colors">
                                    <Quote size={54} strokeWidth={2.5} />
                                </div>

                                {/* User Header */}
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white shadow-sm ring-2 ring-neutral-50">
                                        <img
                                            src={item.image}
                                            alt={item.title}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-neutral-900 text-lg leading-tight mb-0.5">
                                            {item.title}
                                        </h4>
                                        <p className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
                                            {item.subtitle}
                                        </p>
                                    </div>
                                </div>

                                {/* Ratings */}
                                <div className="flex gap-1 mb-6">
                                    {[1, 2, 3, 4, 5].map((_, i) => (
                                        <Star key={i} size={14} fill="#FACC15" color="#FACC15" />
                                    ))}
                                </div>

                                {/* Description */}
                                <p className="text-neutral-500 leading-relaxed text-sm font-medium italic">
                                    "{item.description}"
                                </p>
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
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
        </>
    )
}

export default TestimonialSlider
