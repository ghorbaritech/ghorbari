"use client"

import useEmblaCarousel from "embla-carousel-react"
import Autoplay from "embla-carousel-autoplay"
import { useEffect } from "react"
import Image from "next/image"

const BRANDS = [
    { name: "Bosch", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/Bosch-logo.svg/512px-Bosch-logo.svg.png" },
    { name: "Makita", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Makita_logo.svg/512px-Makita_logo.svg.png" },
    { name: "DeWalt", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/DeWalt_Logo.svg/512px-DeWalt_Logo.svg.png" },
    { name: "BSRM", logo: "https://www.bsrm.com/wp-content/uploads/2021/08/BSRM-Logo-Final.png" },
    { name: "Berger", logo: "https://upload.wikimedia.org/wikipedia/en/thumb/7/7b/Berger_Paints_India_Logo.svg/1200px-Berger_Paints_India_Logo.svg.png" },
    { name: "Seven Rings", logo: "https://sevenrings.com.bd/wp-content/uploads/2018/12/logo-1.png" },
    { name: "Grohe", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Grohe_Logo.svg/512px-Grohe_Logo.svg.png" },
]

export function BrandSlider() {
    const [emblaRef] = useEmblaCarousel({ loop: true, align: "start" }, [
        Autoplay({ delay: 3000, stopOnInteraction: false })
    ])

    return (
        <div className="bg-white p-6 md:p-8 rounded-[40px] border border-neutral-100 shadow-sm mb-16 overflow-hidden border-b-4 border-b-primary-600/10">
            <div className="overflow-hidden" ref={emblaRef}>
                <div className="flex items-center">
                    {BRANDS.map((brand, i) => (
                        <div key={i} className="flex-[0_0_33.33%] md:flex-[0_0_25%] lg:flex-[0_0_20%] min-w-0 px-6">
                            <div className="h-24 bg-white rounded-2xl flex items-center justify-center p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group border border-neutral-50 hover:border-primary-100/30">
                                <img
                                    src={brand.logo}
                                    alt={brand.name}
                                    className="max-h-full max-w-full object-contain grayscale group-hover:grayscale-0 transition-all duration-500 opacity-60 group-hover:opacity-100 scale-110 group-hover:scale-125"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
