"use client"

import React, { createContext, useContext, useState, useEffect } from 'react';
import { ServiceItem } from '@/services/serviceItemService';

export interface ServiceCartItem extends ServiceItem {
    quantity: number;
}

interface ServiceCartContextType {
    items: ServiceCartItem[];
    addService: (service: ServiceItem) => void;
    removeService: (id: string) => void;
    clearCart: () => void;
    totalAmount: number;
    itemCount: number;
}

const ServiceCartContext = createContext<ServiceCartContextType | undefined>(undefined);

export function ServiceCartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<ServiceCartItem[]>([]);

    useEffect(() => {
        const saved = localStorage.getItem('ghorbari_service_cart');
        if (saved) {
            try {
                setItems(JSON.parse(saved));
            } catch (e) {
                console.error('Failed to parse service cart', e);
            }
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('ghorbari_service_cart', JSON.stringify(items));
    }, [items]);

    const addService = (service: ServiceItem) => {
        setItems(prev => {
            const existing = prev.find(i => i.id === service.id);
            if (existing) return prev; // Don't add duplicate for now, or maybe increment quantity? Usually services are per job.
            return [...prev, { ...service, quantity: 1 }];
        });
    };

    const removeService = (id: string) => {
        setItems(prev => prev.filter(i => i.id !== id));
    };

    const clearCart = () => setItems([]);

    const totalAmount = items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
    const itemCount = items.length;

    return (
        <ServiceCartContext.Provider value={{
            items,
            addService,
            removeService,
            clearCart,
            totalAmount,
            itemCount
        }}>
            {children}
        </ServiceCartContext.Provider>
    );
}

export function useServiceCart() {
    const context = useContext(ServiceCartContext);
    if (!context) throw new Error('useServiceCart must be used within a ServiceCartProvider');
    return context;
}
