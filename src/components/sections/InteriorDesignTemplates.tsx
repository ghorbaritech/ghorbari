"use client"

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Home, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { getProducts } from "@/services/productService";

export function InteriorDesignTemplates() {
    const [templates, setTemplates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchTemplates() {
            // Fetch products that might be interior templates
            const data = await getProducts({ limit: 4 });
            setTemplates(data);
            setLoading(false);
        }
        fetchTemplates();
    }, []);

    if (loading) return null;
    if (templates.length === 0) return null;

    return (
        <section className="py-24 bg-neutral-900 text-white">
            <div className="container mx-auto px-8">
                <div className="flex flex-col items-center text-center space-y-6 mb-16">
                    <div className="flex items-center gap-3 text-primary-400 font-bold uppercase tracking-widest text-xs">
                        <Home className="w-5 h-5" />
                        Interior Solutions
                    </div>
                    <h2 className="text-3xl lg:text-5xl font-extrabold tracking-tight uppercase italic text-white">Ready-to-Use Interior Templates</h2>
                    <p className="text-neutral-400 text-base font-medium max-w-2xl mx-auto leading-relaxed">
                        High-quality, customizable design packages to transform your room instantly.
                        Download the blueprints and material list today.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {templates.map((template, index) => (
                        <div key={template.id} className="group relative rounded-xl overflow-hidden aspect-[3/4]">
                            <Image
                                src={template.images?.[0] || "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?q=80&w=2070&auto=format&fit=crop"}
                                alt={template.title}
                                fill
                                className="object-cover transition-transform duration-500 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>

                            <div className="absolute bottom-0 left-0 w-full p-6 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                                <div className="text-[10px] font-black text-primary-400 uppercase tracking-widest mb-1">
                                    {template.category?.name || "Interior"}
                                </div>
                                <h3 className="text-2xl font-bold mb-2 uppercase tracking-tighter truncate">{template.title}</h3>
                                <div className="flex items-center justify-between mt-4">
                                    <span className="text-white font-black text-lg tracking-tighter">৳{template.base_price.toLocaleString()}</span>
                                    <Link href={`/products/${template.sku}`}>
                                        <Button size="sm" className="bg-white text-black hover:bg-neutral-200 font-bold uppercase tracking-widest text-[10px]">
                                            View Package
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-12 text-center">
                    <Link href="/products" className="text-white hover:text-primary-400 border-b border-white hover:border-primary-400 pb-1 transition-all font-bold uppercase tracking-widest text-xs">
                        Explore All Templates
                    </Link>
                </div>
            </div>
        </section>
    );
}

