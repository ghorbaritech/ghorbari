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

                        {/* Terms & Conditions */}
                        <div className="mb-12">
                            <h3 className="text-xl font-bold mb-6">Service Terms & Conditions</h3>
                            <div className="space-y-4">
                                <div className="flex gap-4 p-4 border border-neutral-100 rounded-xl bg-neutral-50">
                                    <div className="font-bold text-sm min-w-[120px]">Payment Terms</div>
                                    <div className="text-sm text-neutral-600">50% advance payment required to start work. Remaining 50% upon completion.</div>
                                </div>
                                <div className="flex gap-4 p-4 border border-neutral-100 rounded-xl bg-neutral-50">
                                    <div className="font-bold text-sm min-w-[120px]">Timeline</div>
                                    <div className="text-sm text-neutral-600">Project timeline may vary based on material availability and site conditions. Delays due to external factors are not penalized.</div>
                                </div>
                                <div className="flex gap-4 p-4 border border-neutral-100 rounded-xl bg-neutral-50">
                                    <div className="font-bold text-sm min-w-[120px]">Warranty</div>
                                    <div className="text-sm text-neutral-600">We provide a 6-month service warranty on all installations. Material warranty depends on the manufacturer.</div>
                                </div>
                            </div>
                        </div>

                        {/* Reviews Section */}
                        <div className="bg-neutral-50 rounded-xl p-8 mb-12">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-xl font-bold">Customer Reviews</h3>
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl font-bold">4.9</span>
                                    <div className="flex text-amber-500">
                                        <Star className="w-5 h-5 fill-current" />
                                        <Star className="w-5 h-5 fill-current" />
                                        <Star className="w-5 h-5 fill-current" />
                                        <Star className="w-5 h-5 fill-current" />
                                        <Star className="w-5 h-5 fill-current" />
                                    </div>
                                    <span className="text-neutral-500 text-sm">(120 Reviews)</span>
                                </div>
                            </div>

                            <div className="space-y-6">
                                {[
                                    { name: "Rahim Ahmed", rating: 5, date: "2 days ago", comment: "Excellent service provided by the team. The designs were modern and functional." },
                                    { name: "Sumaia Khan", rating: 5, date: "1 week ago", comment: "Very professional behavior. They completed the work on time and cleaned up afterwards." },
                                    { name: "Tanvir Hasan", rating: 4, date: "3 weeks ago", comment: "Good quality work but slightly expensive compared to market rate. Worth it for the hassle-free experience though." }
                                ].map((review, idx) => (
                                    <div key={idx} className="pb-6 border-b border-neutral-200 last:border-0 last:pb-0">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-bold">{review.name}</span>
                                            <span className="text-xs text-neutral-400">{review.date}</span>
                                        </div>
                                        <div className="flex text-amber-500 text-sm mb-2">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-current' : 'text-neutral-200 fill-neutral-200'}`} />
                                            ))}
                                        </div>
                                        <p className="text-neutral-600 text-sm">"{review.comment}"</p>
                                    </div>
                                ))}
                            </div>
                            <Button variant="outline" className="w-full mt-6 bg-white hover:bg-neutral-100">View All Reviews</Button>
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
