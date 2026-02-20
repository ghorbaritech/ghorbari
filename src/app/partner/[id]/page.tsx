import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Star, MapPin, CheckCircle2, Phone, Mail, Globe,
    Package, ShoppingBag, TrendingUp, Award, ChevronDown, ChevronUp,
    Calendar, MessageSquare, Image as ImageIcon
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSellerProfile } from "@/services/sellerService";

interface Params {
    params: Promise<{ id: string }>;
}

function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "lg" }) {
    const cls = size === "lg" ? "w-6 h-6" : "w-3.5 h-3.5";
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map(s => (
                <Star key={s} className={`${cls} ${s <= Math.round(rating) ? "fill-amber-400 text-amber-400" : "text-neutral-200"}`} />
            ))}
        </div>
    );
}

export default async function SellerProfilePage({ params }: Params) {
    const { id } = await params;
    const seller = await getSellerProfile(id);

    if (!seller) return notFound();

    const formatCurrency = (n: number) =>
        n >= 10000000 ? `৳${(n / 10000000).toFixed(1)}Cr`
            : n >= 100000 ? `৳${(n / 100000).toFixed(1)}L`
                : `৳${n.toLocaleString()}`;

    const maxReviewCount = Math.max(...seller.ratingBreakdown.map((r: any) => r.count), 1);

    return (
        <main className="min-h-screen flex flex-col font-sans bg-neutral-50">
            <Navbar />

            {/* ── HERO BANNER ── */}
            <div className="relative h-72 md:h-96 bg-neutral-900 overflow-hidden">
                <Image
                    src={seller.shopPhotoUrl}
                    alt={`${seller.businessName} shop`}
                    fill
                    className="object-cover opacity-60"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8">
                    <div className="container mx-auto">
                        {seller.verificationStatus === 'verified' && (
                            <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-2">
                                <CheckCircle2 className="w-4 h-4" /> Verified Partner
                            </div>
                        )}
                        <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">{seller.businessName}</h1>
                        <div className="flex flex-wrap items-center gap-4 mt-2 text-neutral-300 text-sm">
                            {seller.location && <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {seller.location}</span>}
                            {seller.foundedYear && <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> Est. {seller.foundedYear}</span>}
                            {seller.stats.avgRating > 0 && (
                                <span className="flex items-center gap-1.5">
                                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                                    <span className="text-white font-bold">{seller.stats.avgRating}</span>
                                    <span>({seller.reviews.length} reviews)</span>
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-10">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

                    {/* ── LEFT SIDEBAR ── */}
                    <aside className="lg:col-span-1 space-y-5">

                        {/* Contact Card */}
                        <div className="bg-white rounded-3xl p-6 border border-neutral-100 shadow-sm space-y-4">
                            <h3 className="font-black text-sm uppercase tracking-widest text-neutral-400">Contact</h3>
                            {seller.phone && (
                                <a href={`tel:${seller.phone}`} className="flex items-center gap-3 text-neutral-700 hover:text-primary-600 transition-colors text-sm">
                                    <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <Phone className="w-4 h-4 text-blue-600" />
                                    </div>
                                    {seller.phone}
                                </a>
                            )}
                            {seller.email && (
                                <a href={`mailto:${seller.email}`} className="flex items-center gap-3 text-neutral-700 hover:text-primary-600 transition-colors text-sm">
                                    <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <Mail className="w-4 h-4 text-purple-600" />
                                    </div>
                                    <span className="truncate">{seller.email}</span>
                                </a>
                            )}
                            {seller.website && (
                                <a href={seller.website} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-neutral-700 hover:text-primary-600 transition-colors text-sm">
                                    <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <Globe className="w-4 h-4 text-green-600" />
                                    </div>
                                    <span className="truncate">{seller.website.replace(/^https?:\/\//, '')}</span>
                                </a>
                            )}
                            {!seller.phone && !seller.email && !seller.website && (
                                <p className="text-sm text-neutral-400 italic">Contact details not provided.</p>
                            )}
                            <Link href={`/products?seller=${seller.id}`} className="block">
                                <Button className="w-full bg-neutral-900 hover:bg-black text-white rounded-xl font-bold mt-2">
                                    Request Quote
                                </Button>
                            </Link>
                        </div>

                        {/* Categories */}
                        {seller.primaryCategories.length > 0 && (
                            <div className="bg-white rounded-3xl p-6 border border-neutral-100 shadow-sm">
                                <h3 className="font-black text-sm uppercase tracking-widest text-neutral-400 mb-4">Supplies</h3>
                                <div className="flex flex-wrap gap-2">
                                    {seller.primaryCategories.map((cat: string) => (
                                        <span key={cat} className="px-3 py-1 bg-neutral-100 text-neutral-700 text-xs font-bold rounded-lg uppercase tracking-wide">{cat}</span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Stats */}
                        <div className="bg-white rounded-3xl p-6 border border-neutral-100 shadow-sm space-y-5">
                            <h3 className="font-black text-sm uppercase tracking-widest text-neutral-400">Performance</h3>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <ShoppingBag className="w-5 h-5 text-emerald-600" />
                                </div>
                                <div>
                                    <div className="font-black text-xl text-neutral-900">{seller.stats.totalOrders.toLocaleString()}</div>
                                    <div className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Orders Served</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <TrendingUp className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <div className="font-black text-xl text-neutral-900">{formatCurrency(seller.stats.totalOrderValue)}</div>
                                    <div className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Total Value</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <Package className="w-5 h-5 text-amber-600" />
                                </div>
                                <div>
                                    <div className="font-black text-xl text-neutral-900">{seller.stats.productsListed}</div>
                                    <div className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Products Listed</div>
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* ── MAIN CONTENT ── */}
                    <div className="lg:col-span-3 space-y-10">

                        {/* ── PRODUCTS ── */}
                        <section>
                            <div className="flex items-center justify-between mb-5">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center">
                                        <Package className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <h2 className="text-xl font-black text-neutral-900">Products</h2>
                                </div>
                                <Link href={`/products?seller=${seller.id}`}>
                                    <Button variant="ghost" size="sm" className="text-neutral-500 font-bold text-xs uppercase tracking-widest">View All →</Button>
                                </Link>
                            </div>

                            {seller.products.length > 0 ? (
                                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                                    {seller.products.map((product: any) => (
                                        <Link key={product.id} href={`/products/${product.id}`}>
                                            <div className="group bg-white border border-neutral-100 rounded-2xl overflow-hidden hover:shadow-lg hover:border-neutral-200 transition-all duration-300">
                                                <div className="relative aspect-square bg-neutral-50 overflow-hidden">
                                                    <Image
                                                        src={product.images?.[0] || 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400'}
                                                        alt={product.title}
                                                        fill
                                                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                    />
                                                </div>
                                                <div className="p-3">
                                                    <p className="font-bold text-neutral-900 text-sm leading-tight line-clamp-2 mb-1">{product.title}</p>
                                                    <p className="font-black text-neutral-900 text-base">৳{parseFloat(product.base_price).toLocaleString()}</p>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-white border border-neutral-100 rounded-2xl p-12 text-center">
                                    <Package className="w-12 h-12 text-neutral-200 mx-auto mb-3" />
                                    <p className="text-neutral-400 font-bold">No products listed yet</p>
                                </div>
                            )}
                        </section>

                        {/* ── REVIEWS ── */}
                        <section className="bg-white rounded-3xl border border-neutral-100 shadow-sm p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-9 h-9 bg-amber-100 rounded-xl flex items-center justify-center">
                                    <Star className="w-5 h-5 text-amber-600" />
                                </div>
                                <h2 className="text-xl font-black text-neutral-900">Reviews & Ratings</h2>
                            </div>

                            {seller.reviews.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                                    {/* Average Score */}
                                    <div className="flex flex-col items-center justify-center text-center p-6 bg-neutral-50 rounded-2xl">
                                        <div className="text-6xl font-black text-neutral-900 mb-2">{seller.stats.avgRating}</div>
                                        <StarRating rating={seller.stats.avgRating} size="lg" />
                                        <div className="text-sm text-neutral-400 font-bold mt-2">{seller.reviews.length} Reviews</div>
                                    </div>
                                    {/* Star Breakdown */}
                                    <div className="md:col-span-2 space-y-2 justify-center flex flex-col">
                                        {seller.ratingBreakdown.map((row: any) => (
                                            <div key={row.star} className="flex items-center gap-3">
                                                <span className="text-xs font-bold text-neutral-500 w-6 text-right">{row.star}</span>
                                                <Star className="w-3 h-3 fill-amber-400 text-amber-400 flex-shrink-0" />
                                                <div className="flex-1 h-2 bg-neutral-100 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-amber-400 rounded-full transition-all"
                                                        style={{ width: `${(row.count / maxReviewCount) * 100}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs font-bold text-neutral-400 w-4">{row.count}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8 mb-6">
                                    <MessageSquare className="w-10 h-10 text-neutral-200 mx-auto mb-2" />
                                    <p className="text-neutral-400 font-bold text-sm">No reviews yet — be the first!</p>
                                </div>
                            )}

                            {/* Review Cards */}
                            {seller.reviews.length > 0 && (
                                <div className="space-y-4 mt-2">
                                    {seller.reviews.slice(0, 5).map((review: any) => (
                                        <div key={review.id} className="p-5 bg-neutral-50 rounded-2xl border border-neutral-100">
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-black text-sm">
                                                        {(review.reviewer?.full_name || 'A')[0].toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-neutral-900 text-sm">{review.reviewer?.full_name || 'Anonymous'}</div>
                                                        <div className="text-xs text-neutral-400">{new Date(review.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                                                    </div>
                                                </div>
                                                <StarRating rating={review.rating} />
                                            </div>
                                            {review.comment && <p className="text-sm text-neutral-600 leading-relaxed">{review.comment}</p>}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>

                        {/* ── GALLERY ── */}
                        {seller.galleryUrls.length > 0 && (
                            <section>
                                <div className="flex items-center gap-3 mb-5">
                                    <div className="w-9 h-9 bg-pink-100 rounded-xl flex items-center justify-center">
                                        <ImageIcon className="w-5 h-5 text-pink-600" />
                                    </div>
                                    <h2 className="text-xl font-black text-neutral-900">Delivery Gallery</h2>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {seller.galleryUrls.slice(0, 6).map((url: string, i: number) => (
                                        <div key={i} className={`relative rounded-2xl overflow-hidden bg-neutral-100 ${i === 0 ? 'row-span-2 aspect-[3/4]' : 'aspect-square'}`}>
                                            <Image src={url} alt={`Gallery ${i + 1}`} fill className="object-cover hover:scale-105 transition-transform duration-500" />
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* ── ABOUT / BIO ── */}
                        {seller.bio && (
                            <section className="bg-white rounded-3xl border border-neutral-100 shadow-sm p-8">
                                <div className="flex items-center gap-3 mb-5">
                                    <div className="w-9 h-9 bg-indigo-100 rounded-xl flex items-center justify-center">
                                        <Award className="w-5 h-5 text-indigo-600" />
                                    </div>
                                    <h2 className="text-xl font-black text-neutral-900">About the Business</h2>
                                </div>
                                <p className="text-neutral-600 leading-relaxed whitespace-pre-wrap">{seller.bio}</p>
                            </section>
                        )}

                        {/* ── TERMS & CONDITIONS ── */}
                        {seller.termsAndConditions && (
                            <section className="bg-white rounded-3xl border border-neutral-100 shadow-sm overflow-hidden">
                                <details className="group">
                                    <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center">
                                                <CheckCircle2 className="w-5 h-5 text-gray-600" />
                                            </div>
                                            <h2 className="text-xl font-black text-neutral-900">Terms &amp; Conditions</h2>
                                        </div>
                                        <ChevronDown className="w-5 h-5 text-neutral-400 group-open:rotate-180 transition-transform" />
                                    </summary>
                                    <div className="px-8 pb-8 pt-2">
                                        <div className="h-px bg-neutral-100 mb-6" />
                                        <p className="text-neutral-600 leading-relaxed text-sm whitespace-pre-wrap">{seller.termsAndConditions}</p>
                                    </div>
                                </details>
                            </section>
                        )}
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    );
}
