import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getPlatformConfigs, PlatformConfig } from "@/services/settingsService";
import { ServiceItem } from '@/services/serviceItemService';

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

export interface ServiceCartItem extends ServiceItem {
    quantity: number;
}

interface CartStoreState {
    // Shared state
    configs: PlatformConfig[];
    fetchConfigs: () => Promise<void>;
    
    // E-Commerce Cart
    items: CartItem[];
    isDrawerOpen: boolean;
    openDrawer: () => void;
    closeDrawer: () => void;
    addItem: (item: Omit<CartItem, 'quantity'>) => void;
    removeItem: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    clearCart: () => void;
    
    // E-Commerce Computed (Getters)
    getCartTotals: () => {
        totalAmount: number;
        vatAmount: number;
        platformCharges: number;
        grandTotal: number;
        advancePayment: number;
        itemCount: number;
    };

    // Service Cart
    serviceItems: ServiceCartItem[];
    addService: (service: ServiceItem) => void;
    removeService: (id: string) => void;
    clearServiceCart: () => void;
    
    // Service Computed (Getters)
    getServiceTotals: () => {
        totalAmount: number;
        itemCount: number;
    };
}

export const useUnifiedCartStore = create<CartStoreState>()(
    persist(
        (set, get) => ({
            // Configuration
            configs: [],
            fetchConfigs: async () => {
                try {
                    const data = await getPlatformConfigs();
                    set({ configs: data });
                } catch (err) {
                    console.error('Failed to load platform configs in cart store:', err);
                }
            },

            // E-Commerce Elements
            items: [],
            isDrawerOpen: false,
            openDrawer: () => set({ isDrawerOpen: true }),
            closeDrawer: () => set({ isDrawerOpen: false }),

            addItem: (newItem) => {
                set((state) => {
                    const existing = state.items.find(item => item.id === newItem.id);
                    if (existing) {
                        return {
                            items: state.items.map(item =>
                                item.id === newItem.id
                                    ? { ...item, quantity: item.quantity + 1 }
                                    : item
                            ),
                            isDrawerOpen: true
                        };
                    }
                    return { items: [...state.items, { ...newItem, quantity: 1 }], isDrawerOpen: true };
                });
            },

            removeItem: (id) => set((state) => ({ items: state.items.filter(item => item.id !== id) })),

            updateQuantity: (id, quantity) => {
                if (quantity < 1) return;
                set((state) => ({
                    items: state.items.map(item =>
                        item.id === id ? { ...item, quantity } : item
                    )
                }));
            },

            clearCart: () => set({ items: [] }),

            getCartTotals: () => {
                const { items, configs } = get();
                
                const getItemRates = (categoryId?: string) => {
                    const global = configs.find(c => !c.category_id);
                    const specific = categoryId ? configs.find(c => c.category_id === categoryId) : null;
                    return {
                        vat: (specific?.vat_rate ?? global?.vat_rate ?? 7.50) / 100,
                        fee: (specific?.platform_fee_rate ?? global?.platform_fee_rate ?? 2.00) / 100,
                        advance: (specific?.advance_payment_rate ?? global?.advance_payment_rate ?? 10.00) / 100
                    };
                };

                const calculations = items.reduce((acc, item) => {
                    const rates = getItemRates(item.categoryId);
                    const itemTotal = item.price * item.quantity;
                    const itemFee = itemTotal * rates.fee;
                    const itemVat = itemFee * rates.vat;

                    acc.totalAmount += itemTotal;
                    acc.vatAmount += itemVat;
                    acc.platformCharges += itemFee;

                    item.vatAmount = itemVat;
                    item.platformFee = itemFee;

                    const itemGrandTotal = itemTotal + itemVat + itemFee;
                    acc.advancePayment += itemGrandTotal * rates.advance;

                    return acc;
                }, { totalAmount: 0, vatAmount: 0, platformCharges: 0, advancePayment: 0 });

                return {
                    totalAmount: calculations.totalAmount,
                    vatAmount: calculations.vatAmount,
                    platformCharges: calculations.platformCharges,
                    grandTotal: calculations.totalAmount + calculations.vatAmount + calculations.platformCharges,
                    advancePayment: calculations.advancePayment,
                    itemCount: items.reduce((sum, item) => sum + item.quantity, 0)
                };
            },

            // Service Elements
            serviceItems: [],
            
            addService: (service) => set((state) => {
                const existing = state.serviceItems.find(i => i.id === service.id);
                if (existing) return state; 
                return { serviceItems: [...state.serviceItems, { ...service, quantity: 1 }] };
            }),

            removeService: (id) => set((state) => ({ serviceItems: state.serviceItems.filter(i => i.id !== id) })),

            clearServiceCart: () => set({ serviceItems: [] }),

            getServiceTotals: () => {
                const { serviceItems } = get();
                return {
                    totalAmount: serviceItems.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0),
                    itemCount: serviceItems.length
                };
            }
        }),
        {
            name: 'dalankotha_unified_cart',
            partialize: (state) => ({ items: state.items, serviceItems: state.serviceItems }), // Only persist cart items
        }
    )
);
// Backwards compatibility wrappers
export function useCart() {
    const store = useUnifiedCartStore();
    const totals = store.getCartTotals();
    return {
        items: store.items,
        addItem: store.addItem,
        removeItem: store.removeItem,
        updateQuantity: store.updateQuantity,
        clearCart: store.clearCart,
        isDrawerOpen: store.isDrawerOpen,
        openDrawer: store.openDrawer,
        closeDrawer: store.closeDrawer,
        configs: store.configs,
        ...totals
    };
}

export function useServiceCart() {
    const store = useUnifiedCartStore();
    const totals = store.getServiceTotals();
    return {
        items: store.serviceItems,
        addService: store.addService,
        removeService: store.removeService,
        clearCart: store.clearServiceCart,
        ...totals
    };
}
