import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, CheckCircle2, Phone, Mail, Globe, Hammer, PenTool, Package } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPartnerById } from "@/services/partnerService";

interface Params {
    params: Promise<{ id: string }>;
}

export default async function PartnerProfilePage({ params }: Params) {
    const { id } = await params;

    const partner = await getPartnerById(id);
    if (!partner) return notFound();

    return (
        <main className="min-h-screen flex flex-col font-sans bg-neutral-50/50">
            <Navbar />

            {/* Header Banner */}
            <div className="h-64 bg-neutral-900 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-neutral-900 to-transparent z-10" />
                <Image
                    src="https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1200"
                    alt="Cover"
                    fill
                    className="object-cover opacity-50"
                />
            </div>

            <div className="container mx-auto px-4 -mt-20 relative z-20 mb-12">
                <div className="bg-white rounded-[32px] shadow-xl border border-neutral-100 p-8 flex flex-col md:flex-row gap-8 items-start">
                    {/* Brand Logo */}
                    <div className="w-32 h-32 rounded-2xl bg-white p-2 shadow-lg border border-neutral-100 flex-shrink-0">
                        <div className="w-full h-full relative rounded-xl overflow-hidden bg-neutral-50">
                            <Image
                                src="https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=300"
                                alt="Logo"
                                fill
                                className="object-cover"
                            />
                        </div>
                    </div>

                    {/* Basic Info */}
                    <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                            {partner.roles.includes('seller') && <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200">Product Supplier</Badge>}
                            {partner.roles.includes('designer') && <Badge className="bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-200">Design Partner</Badge>}
                            {partner.roles.includes('service_provider') && <Badge className="bg-orange-50 text-orange-700 hover:bg-orange-100 border-orange-200">Service Pro</Badge>}
                        </div>

                        <h1 className="text-3xl md:text-4xl font-black text-neutral-900 mb-2">{partner.name}</h1>

                        <div className="flex items-center gap-4 text-sm text-neutral-500 mb-6">
                            <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {partner.location}</span>
                            <span className="flex items-center gap-1 text-yellow-500 font-bold"><Star className="w-4 h-4 fill-current" /> {partner.rating} ({partner.reviews} Reviews)</span>
                            <span className="flex items-center gap-1 text-green-600 font-bold"><CheckCircle2 className="w-4 h-4" /> Verified Partner</span>
                        </div>

                        <p className="text-neutral-600 max-w-2xl leading-relaxed mb-6">{partner.bio}</p>

                        <div className="flex flex-wrap gap-3">
                            <Button className="bg-neutral-900 rounded-xl font-bold">Contact Partner</Button>
                            <Button variant="outline" className="rounded-xl border-neutral-200">Request Quote</Button>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="flex md:flex-col gap-6 p-6 bg-neutral-50 rounded-2xl border border-neutral-100 min-w-[200px]">
                        <div className="text-center md:text-left">
                            <div className="text-2xl font-black text-neutral-900">{partner.stats.projects}</div>
                            <div className="text-xs uppercase tracking-widest text-neutral-500 font-bold">Projects Done</div>
                        </div>
                        <div className="text-center md:text-left">
                            <div className="text-2xl font-black text-neutral-900">{partner.stats.products}</div>
                            <div className="text-xs uppercase tracking-widest text-neutral-500 font-bold">Products Listed</div>
                        </div>
                        <div className="text-center md:text-left">
                            <div className="text-2xl font-black text-neutral-900">{partner.stats.happyClients}</div>
                            <div className="text-xs uppercase tracking-widest text-neutral-500 font-bold">Happy Clients</div>
                        </div>
                    </div>
                </div>

                {/* Main Content Tabs */}
                <div className="mt-12 grid grid-cols-1 lg:grid-cols-4 gap-10">
                    <aside className="lg:col-span-1 space-y-8">
                        {/* Contact Info */}
                        <div className="bg-white p-6 rounded-[32px] border border-neutral-100 shadow-sm">
                            <h3 className="font-bold mb-6 text-neutral-900 uppercase tracking-tighter text-sm italic">Contact Details</h3>
                            <div className="space-y-4 text-sm">
                                <div className="flex items-center gap-3 text-neutral-600">
                                    <Phone className="w-4 h-4 text-primary-500" />
                                    <span>+880 1700 000000</span>
                                </div>
                                <div className="flex items-center gap-3 text-neutral-600">
                                    <Mail className="w-4 h-4 text-primary-500" />
                                    <span>contact@ecobuild.com</span>
                                </div>
                                <div className="flex items-center gap-3 text-neutral-600">
                                    <Globe className="w-4 h-4 text-primary-500" />
                                    <span>www.ecobuild.com</span>
                                </div>
                            </div>
                        </div>

                        {/* Specializations */}
                        <div className="bg-white p-6 rounded-[32px] border border-neutral-100 shadow-sm">
                            <h3 className="font-bold mb-6 text-neutral-900 uppercase tracking-tighter text-sm italic">Expertise</h3>
                            <div className="flex flex-wrap gap-2">
                                {partner.tags.map(tag => (
                                    <span key={tag} className="px-3 py-1 bg-neutral-100 text-neutral-600 text-xs font-bold rounded-lg uppercase tracking-wide">{tag}</span>
                                ))}
                            </div>
                        </div>
                    </aside>

                    <div className="lg:col-span-3 space-y-12">
                        {/* 1. Design Portfolio Section */}
                        {partner.roles.includes('designer') && (
                            <section>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-purple-100 text-purple-600 rounded-xl">
                                        <PenTool className="w-6 h-6" />
                                    </div>
                                    <h2 className="text-2xl font-black text-neutral-900">Design Portfolio</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* TODO: Add real portfolio data structure. For now using placeholder array if empty */}
                                    {(partner.details.designer?.portfolio_items?.length ? partner.details.designer.portfolio_items : [1, 2]).map((item: any, i: number) => (
                                        <div key={i} className="group cursor-pointer">
                                            <div className="relative aspect-video rounded-2xl overflow-hidden mb-3 bg-neutral-100">
                                                <Image
                                                    src={item?.image || `https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80`}
                                                    alt="Project"
                                                    fill
                                                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                                                />
                                            </div>
                                            <h3 className="font-bold text-lg text-neutral-900 group-hover:text-primary-600 transition-colors">
                                                {item?.title || "Modern Residential Project"}
                                            </h3>
                                            <p className="text-sm text-neutral-500">
                                                {partner.location} • {item?.type || "Architectural Design"}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* 2. Products Section */}
                        {partner.roles.includes('seller') && (
                            <section>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
                                        <Package className="w-6 h-6" />
                                    </div>
                                    <h2 className="text-2xl font-black text-neutral-900">Featured Products</h2>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                    {/* Mocking products for now as we need a separate fetchProductsBySeller call */}
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="border border-neutral-100 rounded-2xl p-4 bg-white hover:shadow-lg transition-shadow">
                                            <div className="relative aspect-square rounded-xl overflow-hidden mb-3 bg-neutral-50 mb-4">
                                                <Image
                                                    src={`https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400`}
                                                    alt="Product"
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                            <div className="font-bold text-neutral-900 mb-1">Premium Material {i}</div>
                                            <div className="text-primary-600 font-black text-lg">৳ 550</div>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-6 text-center">
                                    <Link href={`/products?seller=${partner.id}`}>
                                        <Button variant="outline" className="rounded-xl">View All Products</Button>
                                    </Link>
                                </div>
                            </section>
                        )}

                        {/* 3. Services Section */}
                        {partner.roles.includes('service_provider') && (
                            <section>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-orange-100 text-orange-600 rounded-xl">
                                        <Hammer className="w-6 h-6" />
                                    </div>
                                    <h2 className="text-2xl font-black text-neutral-900">Construction Services</h2>
                                </div>
                                <div className="space-y-4">
                                    {(partner.details.serviceProvider?.service_types || ['General Contracting']).map((service: string, i: number) => (
                                        <div key={i} className="flex gap-6 p-6 border border-neutral-100 rounded-2xl bg-white items-center">
                                            <div className="relative w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-neutral-100">
                                                <Image
                                                    src={`https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=200`}
                                                    alt="Service"
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg text-neutral-900">{service}</h3>
                                                <p className="text-sm text-neutral-500 mb-2">Professional {service} services with {partner.details.serviceProvider?.experience_years || 5}+ years of experience.</p>
                                                <div className="text-xs font-bold uppercase tracking-widest text-primary-600">Starting at ৳ 120/sqft</div>
                                                <Button size="sm" variant="outline" className="h-8 text-xs mt-3">Request Quote</Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* 4. Reviews Section (Mocked for now as requested) */}
                        <section className="pt-12 border-t border-neutral-100">
                            <h2 className="text-2xl font-black text-neutral-900 mb-8">Client Reviews</h2>
                            <div className="bg-neutral-50 rounded-[32px] p-8 text-center border border-neutral-100">
                                <div className="flex justify-center mb-4">
                                    <div className="flex text-yellow-500">
                                        {[1, 2, 3, 4, 5].map(s => <Star key={s} className="w-6 h-6 fill-current" />)}
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-neutral-900 mb-2">Excellent Service!</h3>
                                <p className="text-neutral-600 max-w-lg mx-auto italic">"We hired them for both architectural design and material supply. The coordination was seamless and the quality of materials was top notch."</p>
                                <div className="mt-6 flex items-center justify-center gap-3">
                                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold">JD</div>
                                    <div className="text-left">
                                        <div className="font-bold text-neutral-900 text-sm">Jamal Din</div>
                                        <div className="text-xs text-neutral-500">Gulshan, Dhaka</div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    );
}
