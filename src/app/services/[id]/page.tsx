import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Star, CheckCircle, Clock } from "lucide-react";
import Image from "next/image";

// Placeholder data generation based on ID
// In a real app, this would be fetched
interface Params {
    params: Promise<{ id: string }>;
}

export default async function ServiceDetailPage({ params }: Params) {
    // Awaiting params in Next.js 15+ 
    const { id } = await params;

    // Clean up ID for display title
    const title = id.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());

    return (
        <main className="min-h-screen flex flex-col font-sans bg-white">
            <Navbar />

            <div className="container mx-auto px-4 py-8">
                {/* Breadcrumb / Back Navigation can go here */}

                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Main Content */}
                    <div className="flex-1">
                        <div className="relative aspect-video w-full rounded-2xl overflow-hidden mb-8 bg-neutral-100">
                            <Image
                                src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2053&auto=format&fit=crop"
                                alt="Service Cover"
                                fill
                                className="object-cover"
                            />
                            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-sm font-bold text-neural-900">
                                Top Rated
                            </div>
                        </div>

                        <h1 className="heading-2 mb-4 text-neutral-900">{title} Services</h1>
                        <div className="flex items-center gap-4 text-neutral-500 mb-8 pb-8 border-b border-neutral-100">
                            <div className="flex items-center gap-1 text-yellow-500 font-bold">
                                <Star className="w-5 h-5 fill-current" /> 4.9 (120 Reviews)
                            </div>
                            <span className="w-1 h-1 bg-neutral-300 rounded-full"></span>
                            <div className="flex items-center gap-1">
                                <CheckCircle className="w-5 h-5 text-green-500" /> Verified Professionals
                            </div>
                            <span className="w-1 h-1 bg-neutral-300 rounded-full"></span>
                            <div className="flex items-center gap-1">
                                <Clock className="w-5 h-5" /> Takes 2-4 Weeks
                            </div>
                        </div>

                        <div className="prose prose-neutral max-w-none mb-12">
                            <h3 className="text-xl font-bold mb-4">About this Service</h3>
                            <p className="mb-4 text-neutral-600 leading-relaxed">
                                Get professional {title.toLowerCase()} solutions tailored to your specific needs.
                                Our vetted experts ensure high-quality delivery, adherence to safety standards, and innovative designs
                                that maximize your space's potential.
                            </p>
                            <h3 className="text-xl font-bold mb-4">What's Included</h3>
                            <ul className="space-y-2 mb-8">
                                {["Initial consultation and site visit", "Concept development and 2D layouts", "3D visualization and rendering", "Material selection guide", "Final construction drawings"].map(item => (
                                    <li key={item} className="flex items-start gap-3">
                                        <CheckCircle className="w-5 h-5 text-primary-500 mt-0.5" />
                                        <span className="text-neutral-700">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Reviews Section Placeholder */}
                        <div className="bg-neutral-50 rounded-xl p-8 mb-12">
                            <h3 className="text-xl font-bold mb-6">Customer Reviews</h3>
                            <div className="space-y-6">
                                <div className="pb-6 border-b border-neutral-200">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-bold">Rahim Ahmed</span>
                                        <div className="flex text-yellow-500 text-sm">★★★★★</div>
                                    </div>
                                    <p className="text-neutral-600 text-sm">"Excellent service provided by the team. The designs were modern and functional."</p>
                                </div>
                            </div>
                            <Button variant="link" className="px-0 mt-4">View All Reviews</Button>
                        </div>
                    </div>

                    {/* Booking Sidebar */}
                    <aside className="w-full lg:w-96 flex-shrink-0">
                        <div className="sticky top-24">
                            <Card className="shadow-lg border-neutral-200 overflow-hidden">
                                <div className="bg-neutral-900 p-6 text-white">
                                    <div className="text-sm opacity-80 mb-1">Starting price</div>
                                    <div className="text-3xl font-bold">৳ 5,000 <span className="text-base font-normal opacity-70">/ unit</span></div>
                                </div>
                                <CardContent className="p-6 space-y-6">
                                    <div className="space-y-4">
                                        <h4 className="font-bold text-neutral-900">Request a Quote</h4>
                                        <div className="space-y-3">
                                            <div>
                                                <label className="text-sm font-medium mb-1 block">Project Type</label>
                                                <select className="w-full h-10 rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none">
                                                    <option>Residential</option>
                                                    <option>Commercial</option>
                                                    <option>Renovation</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium mb-1 block">Location</label>
                                                <Input placeholder="e.g. Dhaka, Gulshan" />
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium mb-1 block">Approx. Area (sqft)</label>
                                                <Input type="number" placeholder="e.g. 1500" />
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium mb-1 block">Contact Number</label>
                                                <Input type="tel" placeholder="+8801..." />
                                            </div>
                                        </div>
                                    </div>

                                    <Button className="w-full h-12 text-base font-bold shadow-lg bg-primary-600 hover:bg-primary-700">
                                        Submit Request
                                    </Button>
                                    <p className="text-xs text-center text-neutral-500">
                                        We will connect you with top rated professionals within 24 hours.
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </aside>
                </div>
            </div>

            <Footer />
        </main>
    );
}
