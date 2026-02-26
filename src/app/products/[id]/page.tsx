import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Star, Truck, ShieldCheck, RefreshCw, Minus, Plus, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getProductById, getProducts } from "@/services/productService";
import { ProductCard } from "@/components/ui/ProductCard";
import { CategoryBadge } from "@/components/ui/CategoryBadge";
import { createClient } from "@/utils/supabase/client";
import { ReviewsSection } from "@/components/reviews/ReviewsSection";

interface Params {
    params: Promise<{ id: string }>;
}

export default async function ProductDetailPage({ params }: Params) {
    const { id } = await params;

    // Fetch data in parallel
    const product = await getProductById(id);

    // Fetch related products if product exists
    const relatedProducts = product ? await getProducts({
        categoryId: product.category_id,
        limit: 4
    }) : [];

    // Filter out current product from related
    const filteredRelated = relatedProducts.filter((p: any) => p.id !== id).slice(0, 4);

    // Fetch reviews
    const supabase = createClient();
    const { data: reviews } = await supabase
        .from('reviews')
        .select(`
            id,
            rating,
            comment,
            created_at,
            images,
            reviewer:profiles(full_name, avatar_url)
        `)
        .eq('target_id', id)
        .eq('target_type', 'product')
        .order('created_at', { ascending: false });

    const formattedReviews = reviews?.map((r: any) => ({
        ...r,
        reviewer: Array.isArray(r.reviewer) ? r.reviewer[0] : r.reviewer
    })) || [];

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
                    {/* Main Content (Left) */}
                    <div className="flex-1 min-w-0">
                        <div className="bg-white rounded-[32px] border border-neutral-100 shadow-sm p-6 md:p-8 mb-10">
                            {/* Gallery */}
                            <div className="space-y-4 mb-10">
                                <div className="relative aspect-video md:aspect-[16/9] bg-neutral-100 rounded-2xl overflow-hidden border border-neutral-200">
                                    <Image
                                        src={product.images?.[0] || "https://images.unsplash.com/photo-1560179707-f14e90ef3623?q=80&w=2073&auto=format&fit=crop"}
                                        alt={product.title}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <div className="grid grid-cols-5 gap-3">
                                    {(product.images || [1, 2, 3, 4]).slice(0, 5).map((img: string, i: number) => (
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

                            {/* Product Info Header */}
                            <div className="mb-8">
                                <CategoryBadge
                                    categoryId={product.category_id}
                                    name={product.category?.name || "Material"}
                                    nameBn={product.category?.name_bn}
                                />
                                <h1 className="text-2xl md:text-4xl font-black text-neutral-900 mb-4 leading-tight">{product.title}</h1>

                                <div className="flex items-center gap-4">
                                    <div className="flex text-amber-400">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className={`w-4 h-4 ${i < Math.floor(product.rating || 0) ? 'fill-current' : 'text-neutral-200 fill-neutral-200'}`} />
                                        ))}
                                    </div>
                                    <span className="text-neutral-400 text-xs font-bold uppercase tracking-widest">{(product.rating || 0).toFixed(1)} Rating</span>
                                    <span className="text-neutral-300">|</span>
                                    <span className="text-green-600 text-xs font-bold uppercase tracking-widest bg-green-50 px-3 py-1 rounded-full">In Stock</span>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="prose prose-neutral max-w-none mb-10">
                                <h3 className="text-lg font-black text-neutral-900 uppercase tracking-widest mb-4">Description</h3>
                                <p className="text-neutral-600 leading-relaxed text-sm">
                                    {product.description || "No description available for this product."}
                                </p>
                            </div>

                            {/* Specifications */}
                            <div className="mb-10">
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

                            {/* T&C and Reviews in tabs or stacked? Stacked for now as per previous design */}
                            <div className="grid grid-cols-1 gap-10">
                                {/* Terms & Conditions */}
                                <div>
                                    <h3 className="text-lg font-black text-neutral-900 uppercase tracking-widest mb-6">Terms & Conditions</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="bg-white border border-neutral-100 rounded-xl p-5 shadow-sm">
                                            <h4 className="font-bold text-sm text-neutral-900 mb-2">Delivery</h4>
                                            <p className="text-xs text-neutral-500 leading-relaxed">2-5 days within Dhaka.</p>
                                        </div>
                                        <div className="bg-white border border-neutral-100 rounded-xl p-5 shadow-sm">
                                            <h4 className="font-bold text-sm text-neutral-900 mb-2">Returns</h4>
                                            <p className="text-xs text-neutral-500 leading-relaxed">3 days easy return.</p>
                                        </div>
                                        <div className="bg-white border border-neutral-100 rounded-xl p-5 shadow-sm">
                                            <h4 className="font-bold text-sm text-neutral-900 mb-2">Warranty</h4>
                                            <p className="text-xs text-neutral-500 leading-relaxed">Manufacturer warranty.</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Reviews */}
                                {/* Reviews */}
                                <ReviewsSection productId={product.id} initialReviews={formattedReviews} />
                            </div>
                        </div>
                    </div>

                    {/* Right Sidebar (Sticky Actions) */}
                    <div className="w-full lg:w-[380px] flex-shrink-0">
                        <div className="sticky top-24 space-y-6">
                            {/* Price Card */}
                            <div className="bg-white p-6 md:p-8 rounded-[32px] border border-neutral-100 shadow-xl shadow-neutral-100/50">
                                <div className="mb-6 pb-6 border-b border-neutral-100">
                                    <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2">Total Price</p>
                                    <div className="flex items-end gap-2">
                                        <div className="text-4xl font-black text-neutral-900 tracking-tight">৳ {product.base_price.toLocaleString()}</div>
                                        <div className="text-sm font-bold text-neutral-400 mb-1.5 uppercase tracking-widest">/ {product.unit || 'unit'}</div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-black text-neutral-900 uppercase tracking-widest">Quantity</span>
                                        <div className="flex items-center bg-neutral-50 border border-neutral-200 rounded-xl px-1">
                                            <button className="w-10 h-10 flex items-center justify-center text-neutral-400 hover:text-primary-600 transition-colors"><Minus className="w-4 h-4" /></button>
                                            <input type="text" value="1" className="w-12 text-center font-bold border-none focus:ring-0 text-neutral-900 bg-transparent" readOnly />
                                            <button className="w-10 h-10 flex items-center justify-center text-neutral-400 hover:text-primary-600 transition-colors"><Plus className="w-4 h-4" /></button>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <Button size="lg" className="w-full h-14 text-sm font-bold uppercase tracking-widest bg-neutral-900 hover:bg-neutral-800 shadow-lg shadow-neutral-900/20 rounded-xl">
                                            <ShoppingCart className="w-4 h-4 mr-2" /> Buy Now
                                        </Button>
                                        <Button size="lg" variant="outline" className="w-full h-14 text-sm font-bold uppercase tracking-widest border-neutral-200 hover:bg-neutral-50 hover:text-neutral-900 rounded-xl">
                                            Add to Cart
                                        </Button>
                                    </div>
                                </div>

                                <div className="mt-8 pt-6 border-t border-neutral-100">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex items-center gap-2">
                                            <div className="p-2 bg-green-50 rounded-full text-green-600">
                                                <Truck className="w-4 h-4" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-bold text-neutral-900 uppercase tracking-widest">Fast</span>
                                                <span className="text-[10px] text-neutral-500">Delivery</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="p-2 bg-blue-50 rounded-full text-blue-600">
                                                <ShieldCheck className="w-4 h-4" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-bold text-neutral-900 uppercase tracking-widest">Secure</span>
                                                <span className="text-[10px] text-neutral-500">Payment</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Need Help Card */}
                            <div className="bg-neutral-900 p-8 rounded-[32px] text-white text-center relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                                <p className="text-xs font-bold opacity-70 mb-2 uppercase tracking-widest relative z-10">Have Questions?</p>
                                <p className="text-2xl font-black mb-6 relative z-10">01700-000000</p>
                                <Button size="sm" className="w-full bg-white text-neutral-900 hover:bg-neutral-100 font-bold rounded-xl relative z-10">
                                    Contact Support
                                </Button>
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
                                    categoryBn={p.category?.name_bn}
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

            <Footer />
        </main >
    );
}
