"use client"

import { ProductCard } from "@/components/ui/ProductCard";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { getProducts } from "@/services/productService";

import { useLanguage } from "@/context/LanguageContext";

interface CategoryShowcaseProps {
    title: string;
    category: string;
    bgClass?: string;
    link?: string;
}

// Dummy data for fallback if DB is empty
const DUMMY_PRODUCTS: Record<string, any[]> = {
    "Building Materials": [
        { id: "b1b1b1b1-b1b1-b1b1-b1b1-b1b1b1b1b1b1", cat_id: "c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1", title: "Portland Cement", title_bn: "পোর্টল্যান্ড সিমেন্ট", base_price: 520, images: ["https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&h=400&fit=crop"], category: { name: "Building Materials", name_bn: "নির্মাণ সামগ্রী" }, seller_id: "a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1", seller_name: "Seven Rings Ltd", seller_name_bn: "সেভেন রিংস লিমিটেড" },
        { id: "b3b3b3b3-b3b3-b3b3-b3b3-b3b3b3b3b3b3", cat_id: "c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3", title: "Auto Bricks", title_bn: "অটো ব্রিকস", base_price: 12, images: ["https://images.unsplash.com/photo-1590069261209-f8e9b8642343?w=600&h=400&fit=crop"], category: { name: "Building Materials", name_bn: "নির্মাণ সামগ্রী" }, seller_id: "a3a3a3a3-a3a3-a3a3-a3a3-a3a3a3a3a3a3", seller_name: "Standard Bricks", seller_name_bn: "স্ট্যান্ডার্ড ব্রিকস" },
        { id: "building-0003", cat_id: "c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1", title: "Sylhet Sand", title_bn: "সিলেট বালু", base_price: 15000, images: ["https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=600&h=400&fit=crop"], category: { name: "Building Materials", name_bn: "নির্মাণ সামগ্রী" }, seller_id: "a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1", seller_name: "Seven Rings Ltd", seller_name_bn: "সেভেন রিংস লিমিটেড" },
        { id: "building-0004", cat_id: "c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1", title: "Stone Chips", title_bn: "পাথর কুচি", base_price: 8500, images: ["https://images.unsplash.com/photo-1525869916826-972885c91c1e?w=600&h=400&fit=crop"], category: { name: "Building Materials", name_bn: "নির্মাণ সামগ্রী" }, seller_id: "a3a3a3a3-a3a3-a3a3-a3a3-a3a3a3a3a3a3", seller_name: "Standard Bricks", seller_name_bn: "স্ট্যান্ডার্ড ব্রিকস" },
    ],
    "Steel": [
        { id: "b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2", cat_id: "c2c2c2c2-c2c2-c2c2-c2c2-c2c2c2c2c2c2", title: "BSRM 500W", title_bn: "বিএসআরএম ৫০০ডাব্লিউ", base_price: 92000, images: ["https://images.unsplash.com/photo-1535732759880-bbd5c7265e3f?w=600&h=400&fit=crop"], category: { name: "Steel", name_bn: "স্টিল" }, seller_id: "a2a2a2a2-a2a2-a2a2-a2a2-a2a2a2a2a2a2", seller_name: "BSRM Official", seller_name_bn: "বিএসআরএম অফিশিয়াল" },
        { id: "steel-0002", cat_id: "c2c2c2c2-c2c2-c2c2-c2c2-c2c2c2c2c2c2", title: "AKS Steel", title_bn: "একেএস স্টিল", base_price: 91500, images: ["https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=600&h=400&fit=crop"], category: { name: "Steel", name_bn: "স্টিল" }, seller_id: "a2a2a2a2-a2a2-a2a2-a2a2-a2a2a2a2a2a2", seller_name: "BSRM Official", seller_name_bn: "বিএসআরএম অফিশিয়াল" },
        { id: "steel-0003", cat_id: "c2c2c2c2-c2c2-c2c2-c2c2-c2c2c2c2c2c2", title: "KSRM Bar", title_bn: "কেএসআরএম বার", base_price: 91000, images: ["https://plus.unsplash.com/premium_photo-1664303894360-145466d7ad55?w=600&h=400&fit=crop"], category: { name: "Steel", name_bn: "স্টিল" }, seller_id: "a2a2a2a2-a2a2-a2a2-a2a2-a2a2a2a2a2a2", seller_name: "BSRM Official", seller_name_bn: "বিএসআরএম অফিশিয়াল" },
        { id: "steel-0004", cat_id: "c2c2c2c2-c2c2-c2c2-c2c2-c2c2c2c2c2c2", title: "Binding Wire", title_bn: "বাইন্ডিং ওয়্যার", base_price: 120, images: ["https://images.unsplash.com/photo-1558611997-0950a4722ac1?w=600&h=400&fit=crop"], category: { name: "Steel", name_bn: "স্টিল" }, seller_id: "a2a2a2a2-a2a2-a2a2-a2a2-a2a2a2a2a2a2", seller_name: "BSRM Official", seller_name_bn: "বিএসআরএম অফিশিয়াল" },
    ],
    "Plumbing": [
        { id: "plum-0001", cat_id: "c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1", title: "uPVC Pipe 4\"", title_bn: "ইউপিভিসি পাইপ ৪\"", base_price: 450, images: ["https://images.unsplash.com/photo-1542013936693-884638332954?w=600&h=400&fit=crop"], category: { name: "Plumbing", name_bn: "প্লাম্বিং" }, seller_id: "a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1", seller_name: "Seven Rings Ltd", seller_name_bn: "সেভেন রিংস লিমিটেড" },
        { id: "plum-0002", cat_id: "c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1", title: "Bib Cock", title_bn: "বিব কক", base_price: 350, images: ["https://images.unsplash.com/photo-1584622050111-993a426fbf0a?w=600&h=400&fit=crop"], category: { name: "Plumbing", name_bn: "প্লাম্বিং" }, seller_id: "a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1", seller_name: "Seven Rings Ltd", seller_name_bn: "সেভেন রিংস লিমিটেড" },
        { id: "plum-0003", cat_id: "c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1", title: "Basin Mixer", title_bn: "বেসিন মিক্সার", base_price: 2500, images: ["https://images.unsplash.com/photo-1616486029423-aaa478965c97?w=600&h=400&fit=crop"], category: { name: "Plumbing", name_bn: "প্লাম্বিং" }, seller_id: "a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1", seller_name: "Seven Rings Ltd", seller_name_bn: "সেভেন রিংস লিমিটেড" },
        { id: "plum-0004", cat_id: "c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1", title: "Water Tank", title_bn: "পানির ট্যাংক", base_price: 8000, images: ["https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=600&h=400&fit=crop"], category: { name: "Plumbing", name_bn: "প্লাম্বিং" }, seller_id: "a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1", seller_name: "Seven Rings Ltd", seller_name_bn: "সেভেন রিংস লিমিটেড" },
    ],
    "Finishing": [
        { id: "finish-0001", cat_id: "c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1", title: "Floor Tiles", title_bn: "ফ্লোর টাইলস", base_price: 120, images: ["https://images.unsplash.com/photo-1615529182904-14819c35db37?w=600&h=400&fit=crop"], category: { name: "Finishing", name_bn: "ফিনিশিং" }, seller_id: "a3a3a3a3-a3a3-a3a3-a3a3-a3a3a3a3a3a3", seller_name: "Standard Bricks", seller_name_bn: "স্ট্যান্ডার্ড ব্রিকস" },
        { id: "finish-0002", cat_id: "c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1", title: "Wall Paint", title_bn: "দেয়ালের রং", base_price: 3500, images: ["https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600&h=400&fit=crop"], category: { name: "Finishing", name_bn: "ফিনিশিং" }, seller_id: "a3a3a3a3-a3a3-a3a3-a3a3-a3a3a3a3a3a3", seller_name: "Standard Bricks", seller_name_bn: "স্ট্যান্ডার্ড ব্রিকস" },
        { id: "finish-0003", cat_id: "c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1", title: "Commode", title_bn: "কমোড", base_price: 15000, images: ["https://images.unsplash.com/photo-1584622050111-993a426fbf0a?w=600&h=400&fit=crop"], category: { name: "Finishing", name_bn: "ফিনিশিং" }, seller_id: "a3a3a3a3-a3a3-a3a3-a3a3-a3a3a3a3a3a3", seller_name: "Standard Bricks", seller_name_bn: "স্ট্যান্ডার্ড ব্রিকস" },
        { id: "finish-0004", cat_id: "c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1", title: "LED Light", title_bn: "এলইডি লাইট", base_price: 350, images: ["https://images.unsplash.com/photo-1550989460-0adf9ea622e2?w=600&h=400&fit=crop"], category: { name: "Finishing", name_bn: "ফিনিশিং" }, seller_id: "a3a3a3a3-a3a3-a3a3-a3a3-a3a3a3a3a3a3", seller_name: "Standard Bricks", seller_name_bn: "স্ট্যান্ডার্ড ব্রিকস" },
    ]
};

export function CategoryShowcase({ title, category, bgClass = "bg-white", link = "/products" }: CategoryShowcaseProps) {
    const { t, language } = useLanguage();
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchProducts() {
            setLoading(true);
            try {
                // Determine if category is UUID or Name
                const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(category);

                let data;
                if (isUUID) {
                    data = await getProducts({ categoryId: category });
                } else {
                    data = await getProducts({ categoryName: category });
                }

                if (data && data.length > 0) {
                    setProducts(data);
                } else {
                    // Fallback to dummy data if no real products found
                    const dummyKey = (category && Object.keys(DUMMY_PRODUCTS).find(k => category.includes(k) || k.includes(category))) || "Building Materials";
                    console.log(`No products found for ${category}, utilizing dummy data key: ${dummyKey}`);
                    setProducts(DUMMY_PRODUCTS[dummyKey] || []);
                }

            } catch (error) {
                console.error("Failed to fetch category products", error);
                // Fallback on error too
                const dummyKey = (category && Object.keys(DUMMY_PRODUCTS).find(k => category.includes(k) || k.includes(category))) || "Building Materials";
                setProducts(DUMMY_PRODUCTS[dummyKey] || []);
            }
            setLoading(false);
        }
        fetchProducts();
    }, [category]);

    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const scrollAmount = 300;
            scrollContainerRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    return (
        <section className={`py-6 ${bgClass} relative`}>
            <div className="container mx-auto px-8">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-neutral-900 capitalize tracking-tight">
                            {title}
                        </h2>
                        <div className="h-1 w-20 bg-primary-600 mt-2 rounded-full" />
                    </div>

                    <div className="flex gap-2 items-center">
                        <div className="flex gap-2 lg:hidden">
                            <Button onClick={() => scroll('left')} variant="outline" size="icon" className="rounded-full border-neutral-200 hover:bg-neutral-100 hover:text-black">
                                <ChevronLeft className="h-5 w-5" />
                            </Button>
                            <Button onClick={() => scroll('right')} variant="outline" size="icon" className="rounded-full border-neutral-200 hover:bg-neutral-100 hover:text-black">
                                <ChevronRight className="h-5 w-5" />
                            </Button>
                        </div>

                        <Link href={link} className="hidden md:block">
                            <Button variant="ghost" className="text-neutral-500 hover:text-primary-600 font-bold uppercase tracking-widest text-xs">
                                {t.market_view_all} <ArrowRight className="ml-2 w-4 h-4" />
                            </Button>
                        </Link>
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-80 bg-neutral-100 rounded-[2rem] animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <div
                        ref={scrollContainerRef}
                        className="flex lg:grid lg:grid-cols-5 gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        {products.map((product) => (
                            <div key={product.id} className="min-w-[260px] lg:min-w-0 snap-center h-full">
                                <ProductCard
                                    id={product.id}
                                    name={product.title}
                                    price={product.base_price.toLocaleString()}
                                    image={product.images?.[0] || ""}
                                    rating={product.rating || 4.5}
                                    category={product.category?.name || category}
                                    categoryBn={product.category?.name_bn}
                                    categoryId={product.category?.id || product.cat_id}
                                    subcategory={product.sub_category || undefined}
                                    sellerId={product.seller_id}
                                    sellerName={product.seller?.business_name}
                                    compact={true}
                                />
                            </div>
                        ))}
                    </div>
                )}

                <div className="mt-6 md:hidden text-center">
                    <Link href={link}>
                        <Button variant="outline" className="w-full rounded-xl font-bold uppercase tracking-widest text-xs">
                            {t.market_view_all}
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    );
}
