"use client";

import React, { createContext, useContext, useState } from 'react';

interface Selection {
    id: string;
    quantity: number;
}

interface DesignCartContextType {
    selectedPackages: Selection[];
    addPackage: (id: string, quantity?: number) => void;
    removePackage: (id: string) => void;
    togglePackage: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    clearCart: () => void;
    selectedPackageIds: string[];
}

const DesignCartContext = createContext<DesignCartContextType | undefined>(undefined);

export function DesignCartProvider({ children, initialPackageIds = [] }: { children: React.ReactNode, initialPackageIds?: string[] }) {
    const [selectedPackages, setSelectedPackages] = useState<Selection[]>(
        initialPackageIds.map(id => ({ id, quantity: 1 }))
    );

    const addPackage = (id: string, quantity = 1) => {
        setSelectedPackages(prev => {
            const existing = prev.find(p => p.id === id);
            if (existing) {
                return prev.map(p => p.id === id ? { ...p, quantity: p.quantity + quantity } : p);
            }
            return [...prev, { id, quantity }];
        });
    };

    const removePackage = (id: string) => {
        setSelectedPackages(prev => prev.filter(p => p.id !== id));
    };

    const togglePackage = (id: string) => {
        setSelectedPackages(prev =>
            prev.find(p => p.id === id) ? prev.filter(p => p.id !== id) : [...prev, { id, quantity: 1 }]
        );
    };

    const updateQuantity = (id: string, quantity: number) => {
        if (quantity < 1) return;
        setSelectedPackages(prev => prev.map(p => p.id === id ? { ...p, quantity } : p));
    };

    const clearCart = () => {
        setSelectedPackages([]);
    }

    const selectedPackageIds = selectedPackages.map(p => p.id);

    return (
        <DesignCartContext.Provider value={{ 
            selectedPackages, 
            addPackage, 
            removePackage, 
            togglePackage, 
            updateQuantity,
            clearCart,
            selectedPackageIds
        }}>
            {children}
        </DesignCartContext.Provider>
    );
}

export function useDesignCart() {
    const context = useContext(DesignCartContext);
    if (!context) {
        throw new Error('useDesignCart must be used within a DesignCartProvider');
    }
    return context;
}
