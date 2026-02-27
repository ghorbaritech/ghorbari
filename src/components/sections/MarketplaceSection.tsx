"use client"

import { ShoppingBag, ArrowRight, Drill, Hammer, PaintBucket, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ProductCard } from "@/components/ui/ProductCard";
import { useEffect, useState } from "react";
import { getProducts } from "@/services/productService";

const DUMMY_PRODUCTS = [
    {
        id: "b1b1b1b1-b1b1-b1b1-b1b1-b1b1b1b1b1b1",
        cat_id: "c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1",
        title: "Portland Composite Cement (50kg)",
        base_price: 520,
        discount_price: 480,
        images: ["https://placehold.co/600x400/e2e8f0/1e293b?text=Cement+Bag"],
        rating: 4.8,
        category: { name: "Building Materials" },
        seller_id: "a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1",
        seller_name: "Seven Rings Ltd"
    },
    {
        id: "b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2",
        cat_id: "c2c2c2c2-c2c2-c2c2-c2c2-c2c2c2c2c2c2",
        title: "BSRM Xtreme 500W Steel Rebar",
        base_price: 92000,
        images: ["https://placehold.co/600x400/cbd5e1/1e293b?text=Steel+Rebar"],
        rating: 4.9,
        category: { name: "Steel" },
        seller_id: "a2a2a2a2-a2a2-a2a2-a2a2-a2a2a2a2a2a2",
        seller_name: "BSRM Official"
    },
    {
        id: "b3b3b3b3-b3b3-b3b3-b3b3-b3b3b3b3b3b3",
        cat_id: "c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3",
        title: "Auto Bricks (1st Class)",
        base_price: 12,
        images: ["https://placehold.co/600x400/ef4444/fee2e2?text=Red+Bricks"],
        rating: 4.5,
        category: { name: "Bricks" },
        seller_id: "a3a3a3a3-a3a3-a3a3-a3a3-a3a3a3a3a3a3",
        seller_name: "Standard Bricks Official"
    },
    {
        id: "market-0004",
        cat_id: "c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1",
        title: "Sylhet Sand (Truck Load)",
        base_price: 15000,
        images: ["https://placehold.co/600x400/fcd34d/78350f?text=Sylhet+Sand"],
        rating: 4.7,
        category: { name: "Sand" },
        seller_id: "a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1",
        seller_name: "Seven Rings Cement"
    },
    {
        id: "market-0005",
        cat_id: "c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1",
        title: "Berger Plastic Emulsion Paint",
        base_price: 3500,
        discount_price: 3200,
        images: ["https://placehold.co/600x400/a855f7/f3e8ff?text=Interior+Paint"],
        rating: 4.6,
        category: { name: "Paints" },
        seller_id: "a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1",
        seller_name: "Seven Rings Ltd"
    },
    {
        id: "market-0006",
        cat_id: "c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1",
        title: "Ceramic Floor Tiles (24x24)",
        base_price: 120,
        images: ["https://placehold.co/600x400/f1f5f9/0f172a?text=Floor+Tiles"],
        rating: 4.4,
        category: { name: "Flooring" },
        seller_id: "a3a3a3a3-a3a3-a3a3-a3a3-a3a3a3a3a3a3",
        seller_name: "Standard Bricks"
    },
    {
        id: "market-0007",
        cat_id: "c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1",
        title: "uPVC Pipe 4 inch",
        base_price: 450,
        images: ["https://placehold.co/600x400/22c55e/ecfdf5?text=uPVC+Pipe"],
        rating: 4.3,
        category: { name: "Plumbing" },
        seller_id: "a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1",
        seller_name: "Seven Rings Ltd"
    },
    {
        id: "market-0008",
        cat_id: "c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1",
        title: "Bosch Professional Drill",
        base_price: 8500,
        discount_price: 7500,
        images: ["https://placehold.co/600x400/3b82f6/eff6ff?text=Power+Drill"],
        rating: 4.9,
        category: { name: "Tools" },
        seller_id: "a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1",
        seller_name: "Seven Rings Ltd"
    }
];

import { useLanguage } from "@/context/LanguageContext";

export function MarketplaceSection() {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { t } = useLanguage();

    useEffect(() => {
        async function fetchProducts() {
            try {
                const data = await getProducts({ limit: 8 });
                if (data && data.length > 0) {
                    setProducts(data);
                } else {
                    // Fallback to dummy data if DB is empty
                    setProducts(DUMMY_PRODUCTS);
                }
            } catch (error) {
                console.error("Failed to fetch products, using dummy data", error);
                setProducts(DUMMY_PRODUCTS);
            }
            setLoading(false);
        }
        fetchProducts();
    }, []);

    if (loading) {
        return (
            <section className="py-24 bg-neutral-50/30">
                <div className="container mx-auto px-8">
                    <div className="h-64 flex items-center justify-center bg-white rounded-3xl border border-dashed border-neutral-200">
                        <div className="flex flex-col items-center gap-4 text-neutral-400">
                            <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
                            <span className="text-[10px] font-black uppercase tracking-widest">{t.market_loading}</span>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="py-24 bg-neutral-50/30">
            <div className="container mx-auto px-8">
                <div className="flex flex-col md:flex-row justify-between items-end gap-12 mb-16">
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 text-primary-600 font-bold uppercase tracking-widest text-xs">
                            <ShoppingBag className="w-4 h-4" />
                            {t.market_label}
                        </div>
                        <h2 className="text-3xl lg:text-5xl font-extrabold text-neutral-900 tracking-tight uppercase italic">
                            {t.market_title}
                        </h2>
                        <p className="text-base text-neutral-500 max-w-2xl font-medium leading-relaxed">
                            {t.market_desc}
                        </p>
                    </div>
                    <Link href="/products">
                        <Button variant="outline" className="rounded-xl px-8 h-12 font-bold group border-neutral-200 hover:border-primary-600 hover:text-primary-600 text-xs tracking-widest">
                            {t.market_view_all} <ArrowRight className="ml-3 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </Link>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
                    {products.length > 0 ? (
                        products.map((product) => (
                            <ProductCard
                                key={product.id}
                                id={product.id}
                                name={product.title}
                                price={product.discount_price || product.base_price}
                                oldPrice={product.discount_price ? product.base_price : null}
                                image={product.images?.[0] || ""}
                                rating={product.rating || 0}
                                category={product.category?.name || "Materials"}
                                categoryId={product.category?.id || product.cat_id}
                                sellerId={product.seller_id}
                                sellerName={product.seller_name}
                            />
                        ))
                    ) : (
                        <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-neutral-200">
                            <p className="text-neutral-400 font-bold uppercase tracking-widest text-xs">{t.market_no_products}</p>
                        </div>
                    )}
                </div>

                {/* Categories Shortcut */}
                <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
                    {[
                        { icon: Drill, name: t.cat_power_tools, color: "bg-blue-50 text-blue-600" },
                        { icon: PaintBucket, name: t.cat_wall_paints, color: "bg-purple-50 text-purple-600" },
                        { icon: Hammer, name: t.cat_hand_tools, color: "bg-amber-50 text-amber-600" },
                        { icon: Wrench, name: t.cat_plumbing, color: "bg-emerald-50 text-emerald-600" },
                    ].map((cat, i) => (
                        <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-neutral-100 hover:border-primary-100 hover:shadow-lg transition-all cursor-pointer group">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${cat.color} group-hover:scale-110 transition-transform`}>
                                <cat.icon className="w-6 h-6" />
                            </div>
                            <span className="font-bold text-neutral-800 uppercase tracking-tight text-sm">{cat.name}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

