"use client"

import React from 'react';
import { ShoppingCart, X, Plus, Minus, Trash2, ArrowRight, ReceiptText, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import Image from "next/image";
import { useRouter } from "next/navigation";

export function CartDrawer({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
    const { items, updateQuantity, removeItem, clearCart, totalAmount, vatAmount, platformCharges, grandTotal, itemCount } = useCart();
    const router = useRouter();

    if (!isOpen) return null;

    const handleCheckoutRedirect = () => {
        onClose();
        router.push('/checkout');
    };

    return (
        <>
            <div className="fixed inset-0 z-[100] flex justify-end">
                {/* Overlay */}
                <div
                    className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
                    onClick={onClose}
                />

                {/* Drawer */}
                <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                    {/* Header */}
                    <div className="p-6 border-b flex items-center justify-between bg-neutral-50">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white">
                                <ShoppingCart className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-black text-neutral-900 tracking-tight">Your Cart</h2>
                                <p className="text-xs text-neutral-500 font-bold uppercase tracking-widest">{itemCount} Items Collected</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {items.length > 0 && (
                                <button
                                    onClick={clearCart}
                                    className="text-[10px] font-bold text-rose-500 hover:text-rose-600 uppercase tracking-widest mr-2 p-1"
                                >
                                    Clear All
                                </button>
                            )}
                            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-neutral-200">
                                <X className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>

                    {/* Items List */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {items.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                                <div className="w-20 h-20 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-300">
                                    <ShoppingCart className="w-10 h-10" />
                                </div>
                                <div>
                                    <p className="text-lg font-bold text-neutral-900">Cart is empty</p>
                                    <p className="text-sm text-neutral-500">Add materials to start your journey</p>
                                </div>
                                <Button onClick={onClose} variant="outline" className="rounded-xl px-10">Start Shopping</Button>
                            </div>
                        ) : (
                            items.map((item) => (
                                <div key={item.id} className="flex gap-4 group">
                                    <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-neutral-100 flex-shrink-0 border border-neutral-100">
                                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                                    </div>
                                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                                        <div>
                                            <h4 className="text-sm font-bold text-neutral-900 truncate tracking-tight">{item.name}</h4>
                                            <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider mb-1">Seller: {item.sellerName}</p>
                                            <p className="text-sm font-black text-primary-600">৳{item.price.toLocaleString()}</p>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center border border-neutral-200 rounded-lg p-1 bg-neutral-50">
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    className="p-1 hover:text-primary-600 transition-colors"
                                                >
                                                    <Minus className="w-3 h-3" />
                                                </button>
                                                <span className="w-8 text-center text-xs font-bold">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    className="p-1 hover:text-primary-600 transition-colors"
                                                >
                                                    <Plus className="w-3 h-3" />
                                                </button>
                                            </div>
                                            <button
                                                onClick={() => removeItem(item.id)}
                                                className="text-neutral-300 hover:text-rose-500 transition-colors p-1"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Summary */}
                    {items.length > 0 && (
                        <div className="p-6 bg-neutral-50 border-t space-y-4">
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm text-neutral-600 font-medium tracking-tight">
                                    <span>Subtotal</span>
                                    <span>৳{totalAmount.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm text-neutral-600 font-medium tracking-tight">
                                    <span>Platform Charges (2%)</span>
                                    <span>৳{platformCharges.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm text-neutral-600 font-medium tracking-tight">
                                    <span>VAT (7.5%)</span>
                                    <span>৳{vatAmount.toLocaleString()}</span>
                                </div>
                                <div className="pt-2 border-t flex justify-between text-lg font-black text-neutral-900 tracking-tighter">
                                    <span>Total Amount</span>
                                    <span>৳{grandTotal.toLocaleString()}</span>
                                </div>
                            </div>

                            <Button
                                className="w-full h-14 bg-neutral-900 hover:bg-primary-600 text-white font-black text-base rounded-2xl shadow-xl shadow-primary-100 flex items-center justify-center gap-3 group"
                                onClick={handleCheckoutRedirect}
                            >
                                Proceed to Checkout
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Button>

                            <div className="flex items-center justify-center gap-2 text-[10px] text-neutral-400 font-bold uppercase tracking-widest">
                                <ShieldCheck className="w-3 h-3 text-emerald-500" />
                                Secure Checkout by Ghorbari
                            </div>
                        </div>
                    )}
                </div>
            </div>

        </>
    );
}
