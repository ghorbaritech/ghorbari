"use client"

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, Minus, Plus, ArrowRight, ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

export default function CartPage() {
    const { items, updateQuantity, removeItem, totalAmount, grandTotal, platformCharges, vatAmount } = useCart();

    const delivery = items.length > 0 ? 2000 : 0;
    const finalTotal = grandTotal + delivery;

    if (items.length === 0) {
        return (
            <main className="min-h-screen flex flex-col font-sans bg-neutral-50">
                <Navbar />
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center gap-6">
                    <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center text-neutral-400">
                        <ShoppingBag className="w-10 h-10" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-900 mb-2">Your cart is empty</h1>
                        <p className="text-neutral-500 max-w-sm">Looks like you haven't added any construction materials yet. Start browsing to build your dream home!</p>
                    </div>
                    <Link href="/products">
                        <Button className="bg-primary-600 hover:bg-primary-700 h-12 px-8 font-bold rounded-xl">
                            Browse Materials
                        </Button>
                    </Link>
                </div>
                <Footer />
            </main>
        );
    }

    return (
        <main className="min-h-screen flex flex-col font-sans bg-neutral-50">
            <Navbar />

            <div className="container mx-auto px-4 py-8">
                <h1 className="heading-2 mb-8 text-neutral-900 italic font-black uppercase tracking-tight">Shopping Cart ({items.length} items)</h1>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Cart Items List */}
                    <div className="flex-1 space-y-4">
                        {items.map((item) => (
                            <Card key={item.id} className="border-neutral-200 shadow-sm rounded-2xl overflow-hidden transition-all hover:shadow-md">
                                <CardContent className="p-4 sm:p-6 flex gap-4 sm:gap-6 items-start sm:items-center">
                                    <div className="relative w-24 h-24 flex-shrink-0 bg-neutral-100 rounded-xl overflow-hidden border border-neutral-100">
                                        <Image
                                            src={item.image}
                                            alt={item.name}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start gap-4">
                                            <div>
                                                <h3 className="font-bold text-neutral-900 text-lg mb-1 line-clamp-1">{item.name}</h3>
                                                <p className="text-xs font-bold text-primary-600 uppercase tracking-widest mb-2">{item.sellerName}</p>
                                            </div>
                                            <div className="font-black text-xl text-neutral-900">৳ {(item.price * item.quantity).toLocaleString()}</div>
                                        </div>

                                        <div className="flex justify-between items-center mt-4">
                                            <div className="flex items-center border border-neutral-200 rounded-xl overflow-hidden bg-white">
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    className="w-10 h-10 flex items-center justify-center hover:bg-neutral-50 text-neutral-600 transition-colors"
                                                >
                                                    <Minus className="w-3 h-3" />
                                                </button>
                                                <div className="w-10 text-center text-sm font-black text-neutral-900">{item.quantity}</div>
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    className="w-10 h-10 flex items-center justify-center hover:bg-neutral-50 text-neutral-600 transition-colors"
                                                >
                                                    <Plus className="w-3 h-3" />
                                                </button>
                                            </div>
                                            <button
                                                onClick={() => removeItem(item.id)}
                                                className="text-error hover:bg-error/5 p-2 rounded-lg flex items-center gap-2 text-sm font-bold transition-all"
                                            >
                                                <Trash2 className="w-4 h-4" /> <span className="hidden sm:inline">Remove Item</span>
                                            </button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}

                        <div className="flex justify-between items-center mt-8 pt-4">
                            <Link href="/products" className="text-neutral-500 font-bold hover:text-primary-600 flex items-center gap-2 transition-colors">
                                ← Continue Shopping
                            </Link>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="w-full lg:w-[400px] flex-shrink-0">
                        <Card className="sticky top-24 border-neutral-200 shadow-xl shadow-neutral-200/50 rounded-[2rem] overflow-hidden">
                            <CardContent className="p-8">
                                <h3 className="font-black text-2xl mb-8 text-neutral-900 italic uppercase tracking-tight">Order Summary</h3>

                                <div className="space-y-4 mb-8">
                                    <div className="flex justify-between text-neutral-500 font-medium">
                                        <span>Items Subtotal</span>
                                        <span className="text-neutral-900 font-bold">৳ {totalAmount.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-neutral-500 font-medium">
                                        <span>Platform Charges</span>
                                        <span className="text-primary-600 font-bold">+ ৳ {platformCharges.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-neutral-500 font-medium">
                                        <span>VAT (Categorized)</span>
                                        <span className="text-primary-600 font-bold">+ ৳ {vatAmount.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-neutral-500 font-medium">
                                        <span>Estimate Delivery</span>
                                        <span className="text-neutral-900 font-bold">৳ {delivery.toLocaleString()}</span>
                                    </div>
                                    <div className="h-px bg-neutral-100 my-6"></div>
                                    <div className="flex justify-between items-end">
                                        <span className="text-sm font-black uppercase text-neutral-400">Grand Total</span>
                                        <span className="text-3xl font-black text-neutral-900 italic tracking-tighter">৳ {finalTotal.toLocaleString()}</span>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <Link href="/checkout" className="block w-full">
                                        <Button className="w-full h-14 text-base font-black uppercase tracking-widest bg-primary-600 hover:bg-primary-700 shadow-xl shadow-primary-600/20 rounded-2xl group">
                                            Checkout Now <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                                        </Button>
                                    </Link>
                                    <p className="text-[10px] text-center text-neutral-400 font-bold uppercase tracking-widest">
                                        Inclusive of all taxes and fees
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    );
}
