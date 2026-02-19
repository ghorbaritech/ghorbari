"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface Product {
    id: string;
    name: string;
    price: number;
    image: string;
    category?: string;
    description?: string;
    specifications?: any;
    rating?: number;
}

interface CompareContextType {
    compareList: Product[];
    addToCompare: (product: Product) => void;
    removeFromCompare: (productId: string) => void;
    clearCompare: () => void;
    isInCompare: (productId: string) => boolean;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export function CompareProvider({ children }: { children: React.ReactNode }) {
    const [compareList, setCompareList] = useState<Product[]>([]);

    useEffect(() => {
        // Load from local storage on mount
        const saved = localStorage.getItem("compareList");
        if (saved) {
            try {
                setCompareList(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse compare list", e);
            }
        }
    }, []);

    useEffect(() => {
        // Save to local storage on change
        localStorage.setItem("compareList", JSON.stringify(compareList));
    }, [compareList]);

    const addToCompare = (product: Product) => {
        if (compareList.length >= 4) {
            alert("You can compare up to 4 products at a time.");
            return;
        }
        if (!compareList.find((p) => p.id === product.id)) {
            setCompareList([...compareList, product]);
        }
    };

    const removeFromCompare = (productId: string) => {
        setCompareList(compareList.filter((p) => p.id !== productId));
    };

    const clearCompare = () => {
        setCompareList([]);
    };

    const isInCompare = (productId: string) => {
        return compareList.some((p) => p.id === productId);
    };

    return (
        <CompareContext.Provider
            value={{
                compareList,
                addToCompare,
                removeFromCompare,
                clearCompare,
                isInCompare,
            }}
        >
            {children}
        </CompareContext.Provider>
    );
}

export function useCompare() {
    const context = useContext(CompareContext);
    if (context === undefined) {
        throw new Error("useCompare must be used within a CompareProvider");
    }
    return context;
}
