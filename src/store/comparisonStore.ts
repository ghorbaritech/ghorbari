"use client"

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ComparableProduct {
    id: string;
    title: string;
    price: number;
    image: string;
    category: string;
    rating?: number;
}

interface ComparisonStore {
    items: ComparableProduct[];
    addItem: (product: ComparableProduct) => void;
    removeItem: (id: string) => void;
    clear: () => void;
    isInComparison: (id: string) => boolean;
}

export const useComparisonStore = create<ComparisonStore>()(
    persist(
        (set, get) => ({
            items: [],
            addItem: (product) => {
                const { items } = get();
                if (items.length >= 4) {
                    alert("You can compare up to 4 items.");
                    return;
                }
                if (items.some(i => i.id === product.id)) return;
                set({ items: [...items, product] });
            },
            removeItem: (id) => set({ items: get().items.filter(i => i.id !== id) }),
            clear: () => set({ items: [] }),
            isInComparison: (id) => get().items.some(i => i.id === id)
        }),
        {
            name: 'comparison-storage',
        }
    )
);
