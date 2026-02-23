"use client";

import React, { createContext, useContext, useState } from 'react';

interface DesignCartContextType {
    selectedPackageIds: string[];
    addPackage: (id: string) => void;
    removePackage: (id: string) => void;
    togglePackage: (id: string) => void;
    clearCart: () => void;
}

const DesignCartContext = createContext<DesignCartContextType | undefined>(undefined);

export function DesignCartProvider({ children, initialPackageIds = [] }: { children: React.ReactNode, initialPackageIds?: string[] }) {
    const [selectedPackageIds, setSelectedPackageIds] = useState<string[]>(initialPackageIds);

    const addPackage = (id: string) => {
        setSelectedPackageIds(prev => prev.includes(id) ? prev : [...prev, id]);
    };

    const removePackage = (id: string) => {
        setSelectedPackageIds(prev => prev.filter(pId => pId !== id));
    };

    const togglePackage = (id: string) => {
        setSelectedPackageIds(prev =>
            prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
        );
    };

    const clearCart = () => {
        setSelectedPackageIds([]);
    }

    return (
        <DesignCartContext.Provider value={{ selectedPackageIds, addPackage, removePackage, togglePackage, clearCart }}>
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
