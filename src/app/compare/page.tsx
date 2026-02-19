"use client";

import { useCompare } from "@/context/CompareContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { ShoppingCart, X, Check, Minus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

export default function ComparePage() {
    const { compareList, removeFromCompare } = useCompare();
    const { addItem } = useCart();

    const handleAddToCart = (product: any) => {
        addItem({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            sellerId: product.sellerId || "", // Assuming we preserve this info
            sellerName: product.sellerName || "",
            category: product.category,
        });
    };

    if (compareList.length === 0) {
        return (
            <div className="min-h-screen flex flex-col font-sans bg-neutral-50">
                <Navbar />
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                    <h1 className="text-2xl font-black text-neutral-900 mb-4">No Items to Compare</h1>
                    <p className="text-neutral-500 mb-8">Add products from the marketplace to compare them side-by-side.</p>
                    <Link href="/products">
                        <Button className="font-bold uppercase tracking-widest">Browse Marketplace</Button>
                    </Link>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col font-sans bg-white">
            <Navbar />

            <main className="flex-1 container mx-auto px-4 py-12">
                <h1 className="text-3xl font-black text-neutral-900 italic tracking-tight uppercase mb-12">Product Comparison</h1>

                <div className="overflow-x-auto pb-12">
                    <table className="w-full min-w-[800px] border-collapse">
                        <thead>
                            <tr>
                                <th className="p-4 w-[200px] bg-white sticky left-0 z-10"></th>
                                {compareList.map((product) => (
                                    <th key={product.id} className="p-4 w-[300px] align-top text-left border-l border-neutral-100 bg-neutral-50/30">
                                        <div className="relative">
                                            <button
                                                onClick={() => removeFromCompare(product.id)}
                                                className="absolute -top-2 -right-2 p-1 bg-neutral-200 hover:bg-rose-500 hover:text-white rounded-full transition-colors"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                            <div className="relative aspect-video rounded-xl overflow-hidden mb-4 bg-white border border-neutral-200">
                                                <Image src={product.image} alt={product.name} fill className="object-cover" />
                                            </div>
                                            <Link href={`/products/${product.id}`} className="block">
                                                <h3 className="font-bold text-neutral-900 hover:text-primary-600 transition-colors mb-2 line-clamp-2 min-h-[40px]">
                                                    {product.name}
                                                </h3>
                                            </Link>
                                            <div className="text-xl font-black text-neutral-900 mb-4">৳{product.price.toLocaleString()}</div>
                                            <Button
                                                onClick={() => handleAddToCart(product)}
                                                className="w-full bg-neutral-900 text-white font-bold text-xs uppercase tracking-widest h-10 rounded-xl"
                                            >
                                                <ShoppingCart className="w-3 h-3 mr-2" /> Add to Cart
                                            </Button>
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {[
                                { label: 'Category', key: 'category' },
                                { label: 'Rating', key: 'rating', render: (v: any) => v ? <span className="flex items-center gap-1 font-bold text-amber-500"><span className="text-neutral-900">{v}</span>/5</span> : '-' },
                                { label: 'Description', key: 'description', render: (v: any) => <span className="line-clamp-4 text-xs text-neutral-500 leading-relaxed">{v}</span> },
                                // Add more dynamic keys if available in 'specifications'
                            ].map((row) => (
                                <tr key={row.label} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">
                                    <td className="p-6 font-bold text-neutral-400 uppercase tracking-widest text-xs sticky left-0 bg-white z-10 border-r border-neutral-100 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
                                        {row.label}
                                    </td>
                                    {compareList.map((product) => (
                                        <td key={product.id} className="p-6 border-l border-neutral-100 text-neutral-700 font-medium">
                                            {row.render ? row.render((product as any)[row.key]) : ((product as any)[row.key] || <Minus className="w-4 h-4 text-neutral-300" />)}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                            {/* Dynamic Specifications Row - Simplified for demo */}
                            {compareList.some(p => p.specifications) && (
                                <tr className="bg-neutral-50/50">
                                    <td className="p-6 font-black text-neutral-900 uppercase tracking-widest text-xs sticky left-0 bg-neutral-50 shadow-[4px_0_24px_rgba(0,0,0,0.02)]" colSpan={compareList.length + 1}>
                                        Specifications
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </main>
            <Footer />
        </div>
    );
}
