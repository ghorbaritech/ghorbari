"use client"

import { ProductCard } from "@/components/ui/ProductCard";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getProducts } from "@/services/productService";

interface CategoryShowcaseProps {
    title: string;
    category: string;
    bgClass?: string;
    link?: string;
}

// Dummy data for fallback if DB is empty
const DUMMY_PRODUCTS: Record<string, any[]> = {
    "Building Materials": [
        { id: "b1b1b1b1-b1b1-b1b1-b1b1-b1b1b1b1b1b1", cat_id: "c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1", title: "Portland Cement", base_price: 520, images: ["https://images.unsplash.com/photo-1574949955572-37e58c18bafb?w=600&h=400&fit=crop"], category: { name: "Building Materials" }, seller_id: "a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1", seller_name: "Seven Rings Ltd" },
        { id: "b3b3b3b3-b3b3-b3b3-b3b3-b3b3b3b3b3b3", cat_id: "c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3", title: "Auto Bricks", base_price: 12, images: ["https://images.unsplash.com/photo-1582564286939-400a311013a2?w=600&h=400&fit=crop"], category: { name: "Building Materials" }, seller_id: "a3a3a3a3-a3a3-a3a3-a3a3-a3a3a3a3a3a3", seller_name: "Standard Bricks" },
        { id: "building-0003", cat_id: "c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1", title: "Sylhet Sand", base_price: 15000, images: ["https://images.unsplash.com/photo-1518432031352-d6fc5c10da5a?w=600&h=400&fit=crop"], category: { name: "Building Materials" }, seller_id: "a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1", seller_name: "Seven Rings Ltd" },
        { id: "building-0004", cat_id: "c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1", title: "Stone Chips", base_price: 8500, images: ["https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=600&h=400&fit=crop"], category: { name: "Building Materials" }, seller_id: "a3a3a3a3-a3a3-a3a3-a3a3-a3a3a3a3a3a3", seller_name: "Standard Bricks" },
    ],
    "Steel": [
        { id: "b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2", cat_id: "c2c2c2c2-c2c2-c2c2-c2c2-c2c2c2c2c2c2", title: "BSRM 500W", base_price: 92000, images: ["https://images.unsplash.com/photo-1565610222536-ef125c59da2e?w=600&h=400&fit=crop"], category: { name: "Steel" }, seller_id: "a2a2a2a2-a2a2-a2a2-a2a2-a2a2a2a2a2a2", seller_name: "BSRM Official" },
        { id: "steel-0002", cat_id: "c2c2c2c2-c2c2-c2c2-c2c2-c2c2c2c2c2c2", title: "AKS Steel", base_price: 91500, images: ["https://images.unsplash.com/photo-1600950207944-1e0532f64377?w=600&h=400&fit=crop"], category: { name: "Steel" }, seller_id: "a2a2a2a2-a2a2-a2a2-a2a2-a2a2a2a2a2a2", seller_name: "BSRM Official" },
        { id: "steel-0003", cat_id: "c2c2c2c2-c2c2-c2c2-c2c2-c2c2c2c2c2c2", title: "KSRM Bar", base_price: 91000, images: ["https://images.unsplash.com/photo-1533106418989-88406c7cc8ca?w=600&h=400&fit=crop"], category: { name: "Steel" }, seller_id: "a2a2a2a2-a2a2-a2a2-a2a2-a2a2a2a2a2a2", seller_name: "BSRM Official" },
        { id: "steel-0004", cat_id: "c2c2c2c2-c2c2-c2c2-c2c2-c2c2c2c2c2c2", title: "Binding Wire", base_price: 120, images: ["https://images.unsplash.com/photo-1615811361523-6bd03d7748e7?w=600&h=400&fit=crop"], category: { name: "Steel" }, seller_id: "a2a2a2a2-a2a2-a2a2-a2a2-a2a2a2a2a2a2", seller_name: "BSRM Official" },
    ],
    "Plumbing": [
        { id: "plum-0001", cat_id: "c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1", title: "uPVC Pipe 4\"", base_price: 450, images: ["https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=600&h=400&fit=crop"], category: { name: "Plumbing" }, seller_id: "a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1", seller_name: "Seven Rings Ltd" },
        { id: "plum-0002", cat_id: "c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1", title: "Bib Cock", base_price: 350, images: ["https://images.unsplash.com/photo-1585421514738-01798e348b17?w=600&h=400&fit=crop"], category: { name: "Plumbing" }, seller_id: "a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1", seller_name: "Seven Rings Ltd" },
        { id: "plum-0003", cat_id: "c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1", title: "Basin Mixer", base_price: 2500, images: ["https://images.unsplash.com/photo-1620626011761-996317b8d101?w=600&h=400&fit=crop"], category: { name: "Plumbing" }, seller_id: "a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1", seller_name: "Seven Rings Ltd" },
        { id: "plum-0004", cat_id: "c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1", title: "Water Tank", base_price: 8000, images: ["https://images.unsplash.com/photo-1581557991964-8528ac2d2268?w=600&h=400&fit=crop"], category: { name: "Plumbing" }, seller_id: "a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1", seller_name: "Seven Rings Ltd" },
    ],
    "Finishing": [
        { id: "finish-0001", cat_id: "c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1", title: "Floor Tiles", base_price: 120, images: ["https://images.unsplash.com/photo-1615529182904-14819c35db37?w=600&h=400&fit=crop"], category: { name: "Finishing" }, seller_id: "a3a3a3a3-a3a3-a3a3-a3a3-a3a3a3a3a3a3", seller_name: "Standard Bricks" },
        { id: "finish-0002", cat_id: "c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1", title: "Wall Paint", base_price: 3500, images: ["https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=600&h=400&fit=crop"], category: { name: "Finishing" }, seller_id: "a3a3a3a3-a3a3-a3a3-a3a3-a3a3a3a3a3a3", seller_name: "Standard Bricks" },
        { id: "finish-0003", cat_id: "c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1", title: "Commode", base_price: 15000, images: ["https://images.unsplash.com/photo-1620626011761-996317b8d101?w=600&h=400&fit=crop"], category: { name: "Finishing" }, seller_id: "a3a3a3a3-a3a3-a3a3-a3a3-a3a3a3a3a3a3", seller_name: "Standard Bricks" },
        { id: "finish-0004", cat_id: "c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1", title: "LED Light", base_price: 350, images: ["https://images.unsplash.com/photo-1565610222536-ef125c59da2e?w=600&h=400&fit=crop"], category: { name: "Finishing" }, seller_id: "a3a3a3a3-a3a3-a3a3-a3a3-a3a3a3a3a3a3", seller_name: "Standard Bricks" },
    ]
};

export function CategoryShowcase({ title, category, bgClass = "bg-white", link = "/products" }: CategoryShowcaseProps) {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchProducts() {
            setLoading(true);
            try {
                // In a real app, we would fetch by category ID or name
                // const data = await getProducts({ categoryId: ... });

                // For now, we simulate fetching and return dummy data based on the category prop key
                // mimicking a DB delay
                await new Promise(r => setTimeout(r, 500));

                const dummyKey = Object.keys(DUMMY_PRODUCTS).find(k => category.includes(k) || k.includes(category)) || "Building Materials";
                setProducts(DUMMY_PRODUCTS[dummyKey] || []);

            } catch (error) {
                console.error("Failed to fetch category products", error);
                setProducts([]);
            }
            setLoading(false);
        }
        fetchProducts();
    }, [category]);

    return (
        <section className={`py-6 ${bgClass}`}>
            <div className="container mx-auto px-8">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-neutral-900 capitalize tracking-tight">
                            {title}
                        </h2>
                        <div className="h-1 w-20 bg-primary-600 mt-2 rounded-full" />
                    </div>
                    <Link href={link}>
                        <Button variant="ghost" className="text-neutral-500 hover:text-primary-600 font-bold uppercase tracking-widest text-xs">
                            View All <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                    </Link>
                </div>

                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-80 bg-neutral-100 rounded-[2rem] animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        {products.map((product) => (
                            <ProductCard
                                key={product.id}
                                id={product.id}
                                name={product.title}
                                price={product.base_price.toLocaleString()}
                                image={product.images?.[0] || ""}
                                rating={product.rating || 4.5}
                                category={product.category?.name || category}
                                categoryId={product.category?.id || product.cat_id}
                                sellerId={product.seller_id}
                                sellerName={product.seller_name}
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}

