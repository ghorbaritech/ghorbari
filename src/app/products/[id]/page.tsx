import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Star, ShieldCheck, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getProductById, getProducts } from "@/services/productService";
import { ProductCard } from "@/components/ui/ProductCard";
import { CategoryBadge } from "@/components/ui/CategoryBadge";
import { createClient } from "@/utils/supabase/client";
import { ReviewsSection } from "@/components/reviews/ReviewsSection";
import { getSellerProfile } from "@/services/sellerService";
import { DesignCartProvider } from "@/components/design/DesignCartProvider";
import { ProfileCheckoutCart } from "@/components/design/ProfileCheckoutCart";

interface Params {
    params: Promise<{ id: string }>;
}

export default async function ProductDetailPage({ params }: Params) {
    const { id } = await params;

    // Fetch data in parallel
    // Fetch related products and seller profile in parallel
    const [product, seller] = await Promise.all([
        getProductById(id),
        getProductById(id).then(p => p ? getSellerProfile(p.seller_id) : null)
    ]);

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
        <DesignCartProvider initialPackageIds={[product.id]}>
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
                        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-5 md:p-6 mb-8">
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
                                <h3 className="text-base font-bold text-neutral-900 mb-3">Description</h3>
                                <p className="text-neutral-600 leading-relaxed text-sm">
                                    {product.description || "No description available for this product."}
                                </p>
                            </div>

                            {/* Specifications */}
                            <div className="mb-10">
                                <h3 className="text-base font-bold text-neutral-900 mb-4">Specifications</h3>
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
                            {/* Product Checkout Sidebar (Unified Flow) */}
                            <ProfileCheckoutCart
                                designerId={seller?.designerDetails?.id || product.seller_id}
                                providerName={seller?.businessName || 'Verified Seller'}
                                showDocuments={false}
                                packages={[
                                    {
                                        id: product.id,
                                        title: product.title,
                                        price: product.base_price,
                                        category: product.category,
                                        unit: product.unit,
                                        images: product.images,
                                        category_id: product.category_id
                                    },
                                    ...(seller?.designPackages || [])
                                ]}
                            />

                            {/* Need Help Card */}
                            <div className="bg-neutral-900 p-6 rounded-2xl text-white text-center relative overflow-hidden">
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
                                    price={p.base_price}
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
                        <div className="text-center py-8 bg-white rounded-xl border border-dashed border-neutral-200">
                            <p className="text-neutral-400 text-xs font-bold uppercase tracking-widest">No related products found</p>
                        </div>
                    )}
                </section>

            </div>

            <Footer />
            </main>
        </DesignCartProvider>
    );
}

