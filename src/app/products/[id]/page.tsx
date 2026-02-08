import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingCart, Star, Truck, ShieldCheck, RefreshCw, Minus, Plus } from "lucide-react";
import Image from "next/image";

// Placeholder data generation based on ID
// In a real app, this would be fetched
interface Params {
    params: Promise<{ id: string }>;
}

export default async function ProductDetailPage({ params }: Params) {
    const { id } = await params;

    return (
        <main className="min-h-screen flex flex-col font-sans bg-white">
            <Navbar />

            <div className="container mx-auto px-4 py-8 md:py-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Product Gallery */}
                    <div className="space-y-4">
                        <div className="relative aspect-square bg-neutral-100 rounded-2xl overflow-hidden border border-neutral-200">
                            <Image
                                src="https://images.unsplash.com/photo-1560179707-f14e90ef3623?q=80&w=2073&auto=format&fit=crop"
                                alt="Product Main"
                                fill
                                className="object-cover"
                            />
                        </div>
                        <div className="grid grid-cols-4 gap-4">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className={`relative aspect-square rounded-lg border-2 overflow-hidden cursor-pointer ${i === 1 ? 'border-primary-500 box-content' : 'border-transparent'}`}>
                                    <Image
                                        src="https://images.unsplash.com/photo-1560179707-f14e90ef3623?q=80&w=2073&auto=format&fit=crop"
                                        alt={`Thumbnail ${i}`}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Product Info */}
                    <div className="flex flex-col">
                        <div className="mb-6">
                            <div className="text-sm font-bold text-primary-600 mb-2 uppercase tracking-wide">Shah Cement</div>
                            <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4 leading-tight">Premium Portland Composite Cement (PCC)</h1>

                            <div className="flex items-center gap-4 mb-4">
                                <div className="flex text-yellow-500">
                                    <Star className="w-5 h-5 fill-current" />
                                    <Star className="w-5 h-5 fill-current" />
                                    <Star className="w-5 h-5 fill-current" />
                                    <Star className="w-5 h-5 fill-current" />
                                    <Star className="w-5 h-5 fill-current text-neutral-200" />
                                </div>
                                <span className="text-neutral-500 text-sm font-medium">124 Reviews</span>
                                <span className="text-neutral-300">|</span>
                                <span className="text-green-600 text-sm font-bold">In Stock</span>
                            </div>

                            <div className="flex items-end gap-3 pb-6 border-b border-neutral-100">
                                <div className="text-4xl font-bold text-neutral-900">৳ 550</div>
                                <div className="text-lg text-neutral-500 mb-1">/ bag (50kg)</div>
                            </div>
                        </div>

                        <div className="space-y-6 flex-grow">
                            <p className="text-neutral-600 leading-relaxed">
                                Engineered for high-performance construction, this PCC cement offers superior strength and durability.
                                Ideal for reinforced concrete structures, brick masonry, and plastering works.
                                Ensures long-term protection against harsh weather conditions.
                            </p>

                            {/* Quantity & Actions */}
                            <div className="p-6 bg-neutral-50 rounded-xl space-y-6">
                                <div className="flex items-center gap-6">
                                    <span className="font-bold text-neutral-900">Quantity</span>
                                    <div className="flex items-center bg-white border border-neutral-200 rounded-lg">
                                        <button className="w-10 h-10 flex items-center justify-center text-neutral-500 hover:text-primary-600"><Minus className="w-4 h-4" /></button>
                                        <input type="text" value="50" className="w-12 text-center font-bold border-none focus:ring-0 text-neutral-900" readOnly />
                                        <button className="w-10 h-10 flex items-center justify-center text-neutral-500 hover:text-primary-600"><Plus className="w-4 h-4" /></button>
                                    </div>
                                    <span className="text-sm text-neutral-500">Minimum 20 bags for delivery</span>
                                </div>

                                <div className="flex gap-4">
                                    <Button size="lg" className="flex-1 h-14 text-lg bg-primary-600 hover:bg-primary-700 shadow-lg shadow-primary-500/20">
                                        <ShoppingCart className="w-5 h-5 mr-2" /> Add to Cart
                                    </Button>
                                    <Button size="lg" variant="outline" className="flex-1 h-14 text-lg border-neutral-300">
                                        Request Quote
                                    </Button>
                                </div>
                            </div>

                            {/* Features */}
                            <div className="grid grid-cols-3 gap-4 py-4">
                                <div className="flex flex-col items-center text-center gap-2 p-4 rounded-lg border border-neutral-100 bg-white">
                                    <Truck className="w-6 h-6 text-primary-500" />
                                    <span className="text-xs font-bold text-neutral-600">Fast Delivery</span>
                                </div>
                                <div className="flex flex-col items-center text-center gap-2 p-4 rounded-lg border border-neutral-100 bg-white">
                                    <ShieldCheck className="w-6 h-6 text-primary-500" />
                                    <span className="text-xs font-bold text-neutral-600">Quality Assured</span>
                                </div>
                                <div className="flex flex-col items-center text-center gap-2 p-4 rounded-lg border border-neutral-100 bg-white">
                                    <RefreshCw className="w-6 h-6 text-primary-500" />
                                    <span className="text-xs font-bold text-neutral-600">Easy Returns</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Product Details Tabs (Simplified) */}
                <div className="mt-16">
                    <div className="border-b border-neutral-200 mb-8">
                        <div className="flex gap-8">
                            <button className="pb-4 border-b-2 border-primary-500 font-bold text-primary-600">Specifications</button>
                            <button className="pb-4 border-b-2 border-transparent font-medium text-neutral-500 hover:text-neutral-900">Description</button>
                            <button className="pb-4 border-b-2 border-transparent font-medium text-neutral-500 hover:text-neutral-900">Reviews (124)</button>
                        </div>
                    </div>

                    <div className="max-w-3xl">
                        <table className="w-full text-left border-collapse">
                            <tbody>
                                <tr className="border-b border-neutral-100">
                                    <th className="py-3 w-1/3 text-neutral-500 font-normal">Brand</th>
                                    <td className="py-3 font-medium text-neutral-900">Shah Cement</td>
                                </tr>
                                <tr className="border-b border-neutral-100">
                                    <th className="py-3 w-1/3 text-neutral-500 font-normal">Type</th>
                                    <td className="py-3 font-medium text-neutral-900">Portland Composite Cement (PCC)</td>
                                </tr>
                                <tr className="border-b border-neutral-100">
                                    <th className="py-3 w-1/3 text-neutral-500 font-normal">Weight</th>
                                    <td className="py-3 font-medium text-neutral-900">50 KG</td>
                                </tr>
                                <tr className="border-b border-neutral-100">
                                    <th className="py-3 w-1/3 text-neutral-500 font-normal">Composition</th>
                                    <td className="py-3 font-medium text-neutral-900">Clinker, Gypsum, Fly Ash, Limestone</td>
                                </tr>
                                <tr className="border-b border-neutral-100">
                                    <th className="py-3 w-1/3 text-neutral-500 font-normal">Strength Class</th>
                                    <td className="py-3 font-medium text-neutral-900">42.5 N</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    );
}
