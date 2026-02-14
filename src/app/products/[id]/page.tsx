import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Star, Truck, ShieldCheck, RefreshCw, Minus, Plus, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getProductById, getCategories, getProducts } from "@/services/productService";
import { ProductCard } from "@/components/ui/ProductCard";

interface Params {
    params: Promise<{ id: string }>;
}

export default async function ProductDetailPage({ params }: Params) {
    const { id } = await params;

    // Fetch data in parallel
    const product = await getProductById(id);
    const categories = await getCategories('product');

    // Fetch related products if product exists
    const relatedProducts = product ? await getProducts({
        categoryId: product.category_id,
        limit: 4
    }) : [];

    // Filter out current product from related
    const filteredRelated = relatedProducts.filter(p => p.id !== id).slice(0, 4);

    if (!product) {
        return (
            <main className="min-h-screen flex flex-col font-sans bg-neutral-50/50">
                <Navbar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-neutral-900">Product Not Found</h1>
                        <Link href="/products">
                            <Button className="mt-4">Back to Marketplace</Button>
                        </Link>
                    </div>
                </div>
                <Footer />
            </main>
        );
    }

    return (
        <main className="min-h-screen flex flex-col font-sans bg-neutral-50/50">
            <Navbar />

            <div className="container mx-auto px-4 py-8 md:py-12">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-xs text-neutral-500 mb-8 font-medium">
                    <Link href="/" className="hover:text-primary-600">Home</Link>
                    <ChevronRight className="w-3 h-3" />
                    <Link href="/products" className="hover:text-primary-600">Marketplace</Link>
                    <ChevronRight className="w-3 h-3" />
                    <span className="text-neutral-900 font-bold">{product.title}</span>
                </div>

                <div className="flex flex-col lg:flex-row gap-10">
                    {/* Sidebar */}
                    <aside className="w-full lg:w-72 flex-shrink-0 hidden lg:block">
                        <div className="bg-white p-6 rounded-[32px] border border-neutral-100 shadow-sm sticky top-24">
                            <h3 className="font-bold mb-6 text-neutral-900 uppercase tracking-tighter text-sm italic">Categories</h3>
                            <div className="space-y-1">
                                {categories.map((c: any) => (
                                    <Link
                                        key={c.id}
                                        href={`/products?category=${c.id}`}
                                        className={`block px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors ${product.category_id === c.id
                                                ? 'bg-primary-50 text-primary-700'
                                                : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900'
                                            }`}
                                    >
                                        {c.name}
                                    </Link>
                                ))}
                            </div>

                            <div className="mt-8 p-6 bg-neutral-900 rounded-2xl text-white text-center">
                                <p className="text-xs font-bold opacity-70 mb-2 uppercase tracking-widest">Need Help?</p>
                                <p className="text-lg font-black mb-4">01700-000000</p>
                                <Button size="sm" className="w-full bg-white text-neutral-900 hover:bg-neutral-100 font-bold">
                                    Contact Support
                                </Button>
                            </div>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <div className="flex-1 min-w-0">
                        <div className="bg-white rounded-[32px] border border-neutral-100 shadow-sm p-6 md:p-8 mb-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                {/* Gallery */}
                                <div className="space-y-4">
                                    <div className="relative aspect-square bg-neutral-100 rounded-2xl overflow-hidden border border-neutral-200">
                                        <Image
                                            src={product.images?.[0] || "https://images.unsplash.com/photo-1560179707-f14e90ef3623?q=80&w=2073&auto=format&fit=crop"}
                                            alt={product.title}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <div className="grid grid-cols-4 gap-4">
                                        {(product.images || [1, 2, 3, 4]).slice(0, 4).map((img: string, i: number) => (
                                            <div key={i} className={`relative aspect-square rounded-lg border-2 overflow-hidden cursor-pointer ${i === 0 ? 'border-primary-500 box-content' : 'border-transparent'}`}>
                                                <Image
                                                    src={typeof img === 'string' ? img : "https://images.unsplash.com/photo-1560179707-f14e90ef3623?q=80&w=2073&auto=format&fit=crop"}
                                                    alt={`Thumbnail ${i}`}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="flex flex-col">
                                    <div className="mb-6">
                                        <div className="text-xs font-black text-primary-600 mb-2 uppercase tracking-widest bg-primary-50 inline-block px-3 py-1 rounded-full">
                                            {product.category?.name || "Material"}
                                        </div>
                                        <h1 className="text-2xl md:text-3xl font-black text-neutral-900 mb-4 leading-tight">{product.title}</h1>

                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="flex text-amber-400">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} className={`w-4 h-4 ${i < Math.floor(product.rating || 0) ? 'fill-current' : 'text-neutral-200 fill-neutral-200'}`} />
                                                ))}
                                            </div>
                                            <span className="text-neutral-400 text-xs font-bold uppercase tracking-widest">{(product.rating || 0).toFixed(1)} Rating</span>
                                            <span className="text-neutral-300">|</span>
                                            <span className="text-green-600 text-xs font-bold uppercase tracking-widest bg-green-50 px-3 py-1 rounded-full">In Stock</span>
                                        </div>

                                        <div className="flex items-end gap-3 pb-6 border-b border-neutral-100">
                                            <div className="text-4xl font-black text-neutral-900 tracking-tight">৳ {product.base_price.toLocaleString()}</div>
                                            <div className="text-sm font-bold text-neutral-400 mb-1.5 uppercase tracking-widest">/ {product.unit || 'unit'}</div>
                                        </div>
                                    </div>

                                    <div className="space-y-8 flex-grow">
                                        <p className="text-neutral-600 leading-relaxed text-sm">
                                            {product.description || "No description available for this product."}
                                        </p>

                                        {/* Action Card */}
                                        <div className="p-6 bg-neutral-50 rounded-2xl border border-neutral-100 space-y-6">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-black text-neutral-900 uppercase tracking-widest">Quantity</span>
                                                <div className="flex items-center bg-white border border-neutral-200 rounded-xl px-1">
                                                    <button className="w-10 h-10 flex items-center justify-center text-neutral-400 hover:text-primary-600 transition-colors"><Minus className="w-4 h-4" /></button>
                                                    <input type="text" value="1" className="w-12 text-center font-bold border-none focus:ring-0 text-neutral-900 bg-transparent" readOnly />
                                                    <button className="w-10 h-10 flex items-center justify-center text-neutral-400 hover:text-primary-600 transition-colors"><Plus className="w-4 h-4" /></button>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3">
                                                <Button size="lg" className="h-12 text-sm font-bold uppercase tracking-widest bg-neutral-900 hover:bg-neutral-800 shadow-lg shadow-neutral-900/20 rounded-xl">
                                                    <ShoppingCart className="w-4 h-4 mr-2" /> Buy Now
                                                </Button>
                                                <Button size="lg" variant="outline" className="h-12 text-sm font-bold uppercase tracking-widest border-neutral-200 hover:bg-neutral-50 hover:text-neutral-900 rounded-xl">
                                                    Request Quote
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Features */}
                                        <div className="grid grid-cols-3 gap-3">
                                            <div className="flex flex-col items-center text-center gap-2 p-3 rounded-xl border border-neutral-100 bg-white shadow-sm">
                                                <Truck className="w-5 h-5 text-primary-600" />
                                                <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Fast Delivery</span>
                                            </div>
                                            <div className="flex flex-col items-center text-center gap-2 p-3 rounded-xl border border-neutral-100 bg-white shadow-sm">
                                                <ShieldCheck className="w-5 h-5 text-primary-600" />
                                                <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Verified</span>
                                            </div>
                                            <div className="flex flex-col items-center text-center gap-2 p-3 rounded-xl border border-neutral-100 bg-white shadow-sm">
                                                <RefreshCw className="w-5 h-5 text-primary-600" />
                                                <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Returns</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Specifications */}
                            <div className="mt-16 border-t border-neutral-100 pt-10">
                                <h3 className="text-lg font-black text-neutral-900 uppercase tracking-widest mb-6">Specifications</h3>
                                <div className="bg-neutral-50 rounded-2xl p-6 border border-neutral-100">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {product.specifications && Object.entries(product.specifications).map(([key, value]: [string, any]) => (
                                            <div key={key} className="flex justify-between py-3 border-b border-neutral-200 last:border-0 border-dashed">
                                                <span className="text-xs font-bold text-neutral-500 uppercase tracking-widest">{key.replace(/_/g, ' ')}</span>
                                                <span className="text-sm font-bold text-neutral-900">{String(value)}</span>
                                            </div>
                                        ))}
                                        {!product.specifications && (
                                            <p className="text-neutral-400 text-sm italic">No specific specifications listed.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Related Products Section */}
                        <section className="mb-12">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-black text-neutral-900 uppercase tracking-tight">Related Products</h2>
                                <Link href={`/products?category=${product.category_id}`} className="text-primary-600 text-xs font-bold uppercase tracking-widest hover:underline">
                                    View All
                                </Link>
                            </div>

                            {filteredRelated.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {filteredRelated.map((p: any) => (
                                        <ProductCard
                                            key={p.id}
                                            id={p.id}
                                            name={p.title}
                                            price={p.base_price.toLocaleString()}
                                            image={p.images?.[0] || ""}
                                            rating={p.rating || 0}
                                            category={p.category?.name}
                                            categoryId={p.category_id}
                                            sellerId={p.seller_id}
                                            sellerName={p.seller?.business_name}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-10 bg-white rounded-[32px] border border-dashed border-neutral-200">
                                    <p className="text-neutral-400 text-xs font-bold uppercase tracking-widest">No related products found</p>
                                </div>
                            )}
                        </section>
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    );
}
