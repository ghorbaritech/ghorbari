"use client";

import { useDesignCart } from './DesignCartProvider';
import { Check } from 'lucide-react';

interface BookNowButtonProps {
    packageId: string;
}

export function BookNowButton({ packageId }: BookNowButtonProps) {
    const { selectedPackageIds, togglePackage } = useDesignCart();

    const isSelected = selectedPackageIds.includes(packageId);

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        togglePackage(packageId);

        // If we just added it, scroll to the cart smoothly on mobile
        if (!isSelected && window.innerWidth < 1280) { // xl breakpoint
            const cartElement = document.getElementById('booking-cart');
            if (cartElement) {
                cartElement.scrollIntoView({ behavior: 'smooth' });
            }
        }
    };

    return (
        <button
            onClick={handleClick}
            className={`px-5 py-2.5 rounded-xl text-[13px] font-bold transition-all inline-block text-center flex items-center justify-center gap-2 ${isSelected
                    ? 'bg-[#00a651] hover:bg-[#009045] text-white shadow-lg shadow-[#00a651]/20'
                    : 'bg-[#0f172a] hover:bg-[#1e293b] text-white hover:shadow-lg hover:shadow-neutral-900/20 active:scale-95'
                }`}
        >
            {isSelected ? (
                <>
                    <Check className="w-4 h-4" />
                    ADDED TO CART
                </>
            ) : (
                'BOOK NOW'
            )}
        </button>
    );
}
