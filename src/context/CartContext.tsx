"use client"

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getPlatformConfigs, PlatformConfig } from "@/services/settingsService";

export interface CartItem {
    id: string;
    name: string;
    price: number;
    image: string;
    quantity: number;
    sellerId: string;
    sellerName: string;
    categoryId?: string;
    category?: string;
    vatAmount?: number;
    platformFee?: number;
}

interface CartContextType {
    items: CartItem[];
    addItem: (item: Omit<CartItem, 'quantity'>) => void;
    removeItem: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    clearCart: () => void;
    totalAmount: number;
    vatAmount: number;
    platformCharges: number;
    grandTotal: number;
    advancePayment: number;
    itemCount: number;
    isDrawerOpen: boolean;
    openDrawer: () => void;
    closeDrawer: () => void;
    configs: PlatformConfig[];
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [configs, setConfigs] = useState<PlatformConfig[]>([]);

    const openDrawer = () => setIsDrawerOpen(true);
    const closeDrawer = () => setIsDrawerOpen(false);

    // Initial load: Cart + Configs
    useEffect(() => {
        const savedCart = localStorage.getItem('ghorbari_cart');
        if (savedCart) {
            try {
                const parsed = JSON.parse(savedCart);
                setTimeout(() => setItems(parsed), 0);
            } catch (e) {
                console.error('Failed to parse cart', e);
            }
        }

        async function loadConfigs() {
            const data = await getPlatformConfigs();
            setConfigs(data);
        }
        loadConfigs();
    }, []);

    // Save cart to localStorage on change
    useEffect(() => {
        localStorage.setItem('ghorbari_cart', JSON.stringify(items));
    }, [items]);

    const addItem = (newItem: Omit<CartItem, 'quantity'>) => {
        setItems(prev => {
            const existing = prev.find(item => item.id === newItem.id);
            if (existing) {
                return prev.map(item =>
                    item.id === newItem.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prev, { ...newItem, quantity: 1 }];
        });
        openDrawer();
    };

    const removeItem = (id: string) => {
        setItems(prev => prev.filter(item => item.id !== id));
    };

    const updateQuantity = (id: string, quantity: number) => {
        if (quantity < 1) return;
        setItems(prev => prev.map(item =>
            item.id === id ? { ...item, quantity } : item
        ));
    };

    const clearCart = () => {
        setItems([]);
        localStorage.removeItem('ghorbari_cart');
    };

    // Helper to get rates for an item
    const getItemRates = (categoryId?: string) => {
        const global = configs.find(c => !c.category_id);
        const specific = categoryId ? configs.find(c => c.category_id === categoryId) : null;

        return {
            vat: (specific?.vat_rate ?? global?.vat_rate ?? 7.50) / 100,
            fee: (specific?.platform_fee_rate ?? global?.platform_fee_rate ?? 2.00) / 100,
            advance: (specific?.advance_payment_rate ?? global?.advance_payment_rate ?? 10.00) / 100
        };
    };

    // Calculate totals dynamically
    const calculations = items.reduce((acc, item) => {
        const rates = getItemRates(item.categoryId);
        const itemTotal = item.price * item.quantity;
        const itemFee = itemTotal * rates.fee;
        const itemVat = itemFee * rates.vat;

        acc.totalAmount += itemTotal;
        acc.vatAmount += itemVat;
        acc.platformCharges += itemFee;

        // Attach to item for other components (like checkout) to use
        item.vatAmount = itemVat;
        item.platformFee = itemFee;

        const itemGrandTotal = itemTotal + itemVat + itemFee;
        acc.advancePayment += itemGrandTotal * rates.advance;

        return acc;
    }, { totalAmount: 0, vatAmount: 0, platformCharges: 0, advancePayment: 0 });

    const totalAmount = calculations.totalAmount;
    const vatAmount = calculations.vatAmount;
    const platformCharges = calculations.platformCharges;
    const grandTotal = totalAmount + vatAmount + platformCharges;
    const advancePayment = calculations.advancePayment;
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <CartContext.Provider value={{
            items,
            addItem,
            removeItem,
            updateQuantity,
            clearCart,
            totalAmount,
            vatAmount,
            platformCharges,
            grandTotal,
            advancePayment,
            itemCount,
            isDrawerOpen,
            openDrawer,
            closeDrawer,
            configs
        }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
