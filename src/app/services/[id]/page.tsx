import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Star, CheckCircle, Clock, ChevronRight, MapPin, ShieldCheck, Info } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getDesignPackageById } from "@/services/packageService";
import { getSellerProfile } from "@/services/sellerService";
import { DesignCartProvider } from "@/components/design/DesignCartProvider";
import { ProfileCheckoutCart } from "@/components/design/ProfileCheckoutCart";
import { BookNowButton } from "@/components/design/BookNowButton";
import { createClient } from "@/utils/supabase/server";
import { getServiceItemById } from "@/services/serviceItemService";

interface Params {
    params: Promise<{ id: string }>;
}

export default async function ServiceDetailPage({ params }: Params) {
    const { id } = await params;

    const supabase = await createClient();
    
    // 1. Try fetching as a Design Package first
    let pkg = await getDesignPackageById(id, supabase);
    let item: any = null;
    let seller: any = null;

    if (pkg) {
        seller = await getSellerProfile(pkg.designer_id);
    } else {
        // 2. Try fetching as a Service Item if Design Package fails
        item = await getServiceItemById(id, supabase);
    }
    
    // Final fallback: Not found
    if (!pkg && !item) {
        return (
            <main className="min-h-screen flex flex-col font-sans bg-neutral-50/50">
                <Navbar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-neutral-900">Service Not Found</h1>
                        <p className="text-neutral-500 mt-2">The requested service ID could not be identified.</p>
                        <Link href="/services">
                            <Button className="mt-4">Back to Services</Button>
                        </Link>
                    </div>
                </div>
                <Footer />
            </main>
        );
    }

    // Unify the data for display
    const displayTitle = pkg?.title || item?.name;
    const displayImage = pkg?.images?.[0] || item?.image_url;
    const displayCategory = pkg?.category?.name || item?.category?.name;
    const displayDescription = pkg?.description || item?.description;
    const displayPrice = pkg?.price || item?.unit_price;

    return (
        <DesignCartProvider initialPackageIds={pkg ? [pkg.id] : []}>
            <main className="min-h-screen flex flex-col font-sans bg-neutral-50/50">
                <Navbar />

                <div className="container mx-auto px-4 py-8 md:py-12">
                    {/* Breadcrumb */}
                    <div className="flex items-center gap-2 text-xs text-neutral-500 mb-8 font-medium">
                        <Link href="/" className="hover:text-primary-600">Home</Link>
                        <ChevronRight className="w-3 h-3" />
                        <Link href="/services" className="hover:text-primary-600">Services</Link>
                        <ChevronRight className="w-3 h-3" />
                        <span className="text-neutral-900 font-bold">{displayTitle}</span>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-10">
                        {/* Main Content (Left) */}
                        <div className="flex-1 min-w-0">
                            <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-5 md:p-6 mb-8">
                                {/* Gallery / Cover */}
                                <div className="relative aspect-video md:aspect-[21/9] bg-neutral-100 rounded-2xl overflow-hidden border border-neutral-200 mb-8">
                                    <Image
                                        src={displayImage || "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2053&auto=format&fit=crop"}
                                        alt={displayTitle}
                                        fill
                                        className="object-cover"
                                    />
                                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-4 py-1.5 rounded-full text-xs font-black text-neutral-900 uppercase tracking-widest shadow-sm">
                                        Verified Service
                                    </div>
                                </div>

                                {/* Header */}
                                <div className="mb-8 pb-8 border-b border-neutral-100">
                                    <div className="flex items-center gap-2 mb-4">
                                        <span className="px-3 py-1 bg-primary-50 text-primary-600 text-[10px] font-black uppercase tracking-widest rounded-full">
                                            {displayCategory || "Expert Solution"}
                                        </span>
                                    </div>
                                    <h1 className="text-2xl md:text-4xl font-black text-neutral-900 mb-4 leading-tight">{displayTitle}</h1>
                                    
                                    <div className="flex flex-wrap items-center gap-6">
                                        <div className="flex items-center gap-2">
                                            <div className="flex text-amber-400">
                                                <Star className="w-4 h-4 fill-current" />
                                            </div>
                                            <span className="text-neutral-900 text-sm font-bold">4.9</span>
                                            <span className="text-neutral-400 text-xs font-medium">(120 Reviews)</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-neutral-500">
                                            <Clock className="w-4 h-4" />
                                            <span className="text-xs font-bold uppercase tracking-widest">Takes {pkg?.duration || '2-4 weeks'}</span>
                                        </div>
                                        {seller && (
                                            <div className="flex items-center gap-2 text-neutral-500">
                                                <MapPin className="w-4 h-4" />
                                                <span className="text-xs font-bold uppercase tracking-widest">{seller?.location || 'Dhaka'}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="prose prose-neutral max-w-none mb-10">
                                    <h3 className="text-lg font-black text-neutral-900 uppercase tracking-widest mb-4">About this Service</h3>
                                    <p className="text-neutral-600 leading-relaxed">
                                        {displayDescription || "Get professional solutions tailored to your specific needs. Our vetted experts ensure high-quality delivery, adherence to safety standards, and innovative designs that maximize your space's potential."}
                                    </p>
                                </div>

                                {/* Features / What's Included */}
                                <div className="mb-10">
                                    <h3 className="text-lg font-black text-neutral-900 uppercase tracking-widest mb-6">What's Included</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {(pkg?.features || [
                                            "Initial consultation and site visit",
                                            "Concept development and 2D layouts",
                                            "3D visualization and rendering",
                                            "Material selection guide",
                                            "Final construction drawings",
                                            "Site supervision (Optional)"
                                        ]).map((item: string, i: number) => (
                                            <div key={i} className="flex items-start gap-3 p-4 bg-neutral-50 rounded-xl border border-neutral-100">
                                                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                                                <span className="text-sm font-bold text-neutral-700">{item}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Provider Info (Only if Design Package) */}
                                {seller && (
                                    <div className="bg-neutral-900 rounded-2xl p-6 md:p-8 text-white relative overflow-hidden mb-10">
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                                        <div className="relative z-10">
                                            <div className="flex items-center gap-4 mb-6">
                                                <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                                                    <Image 
                                                        src={seller?.shopPhotoUrl || "https://images.unsplash.com/photo-1560179707-f14e90ef3623?q=80&w=2073&auto=format&fit=crop"} 
                                                        alt={seller?.businessName}
                                                        width={64}
                                                        height={64}
                                                        className="rounded-full object-cover"
                                                    />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-primary-400 mb-1">Service Provider</p>
                                                    <h4 className="text-xl font-bold">{seller?.businessName}</h4>
                                                </div>
                                            </div>
                                            <p className="text-neutral-400 text-sm leading-relaxed mb-6 line-clamp-2 italic">
                                                "{seller?.bio || 'Verified partner on Ghorbari platform providing professional services.'}"
                                            </p>
                                            <Link href={`/partner/${pkg.designer_id}`}>
                                                <Button variant="outline" className="border-white/20 text-white hover:bg-white hover:text-neutral-900 font-black text-xs uppercase tracking-widest rounded-xl">
                                                    View Partner Profile
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                )}

                                {/* Terms */}
                                <div>
                                    <h3 className="text-lg font-black text-neutral-900 uppercase tracking-widest mb-6">Service Terms</h3>
                                    <div className="space-y-4">
                                        <div className="flex flex-col md:flex-row md:items-center gap-4 p-5 border border-neutral-100 rounded-2xl bg-neutral-50">
                                            <div className="flex items-center gap-2 min-w-[150px]">
                                                <ShieldCheck className="w-4 h-4 text-primary-600" />
                                                <span className="font-black text-[11px] uppercase tracking-widest text-neutral-900">Payment</span>
                                            </div>
                                            <p className="text-xs font-bold text-neutral-500">50% advance required to start work. Remaining 50% upon completion.</p>
                                        </div>
                                        <div className="flex flex-col md:flex-row md:items-center gap-4 p-5 border border-neutral-100 rounded-2xl bg-neutral-50">
                                            <div className="flex items-center gap-2 min-w-[150px]">
                                                <Info className="w-4 h-4 text-primary-600" />
                                                <span className="font-black text-[11px] uppercase tracking-widest text-neutral-900">Warranty</span>
                                            </div>
                                            <p className="text-xs font-bold text-neutral-500">We provide a 6-month service warranty on all installations.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Sidebar */}
                        <div className="w-full lg:w-[380px] flex-shrink-0">
                            <div className="sticky top-24 space-y-6">
                                {/* Direct Checkout Cart (Only for Design Packages) or Basic CTA for General Items */}
                                {pkg ? (
                                    <ProfileCheckoutCart
                                        designerId={pkg.designer_id}
                                        providerName={seller?.businessName || 'Verified Partner'}
                                        packages={seller?.designPackages || [pkg]}
                                    />
                                ) : (
                                    <div className="bg-white p-6 rounded-[24px] border border-neutral-200 shadow-sm">
                                        <div className="mb-6 pb-6 border-b border-neutral-100">
                                            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2">Service Fee</p>
                                            <div className="flex items-end gap-2 text-[#0a1b3d]">
                                                <span className="text-3xl font-black">৳{displayPrice?.toLocaleString()}</span>
                                                <span className="text-[10px] font-bold uppercase tracking-widest mb-1.5 opacity-60">/{item?.unit_type || 'service'}</span>
                                            </div>
                                        </div>
                                        <Link href="/services">
                                            <Button className="w-full bg-[#1e3a8a] py-6 rounded-xl hover:bg-[#1e3a8a]/90 text-white font-black text-xs uppercase tracking-widest">
                                                Add to Service Cart
                                            </Button>
                                        </Link>
                                    </div>
                                )}

                                {/* Support Card */}
                                <div className="bg-white p-6 rounded-[24px] border border-neutral-200 shadow-sm text-center">
                                    <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2">Need Expert Advice?</p>
                                    <p className="text-xl font-black text-neutral-900 mb-6">Talk to our Consultants</p>
                                    <Button className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-black text-xs uppercase tracking-widest py-6 rounded-xl">
                                        Schedule a Call
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <Footer />
            </main>
        </DesignCartProvider>
    );
}


