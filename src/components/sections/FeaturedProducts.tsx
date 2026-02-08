import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Star, ShoppingCart } from "lucide-react";

const products = [
    {
        name: "Premium Portland Cement",
        brand: "Shah Cement",
        price: "৳ 550",
        rating: 4.8,
        reviews: 124,
        image: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?q=80&w=2073&auto=format&fit=crop",
        discount: "Sale"
    },
    {
        name: "Teak Wood Floor Tiles",
        brand: "Akij Ceramics",
        price: "৳ 120 / sqft",
        rating: 4.6,
        reviews: 89,
        image: "https://images.unsplash.com/photo-1516455590571-18256e5bb9ff?q=80&w=2084&auto=format&fit=crop",
        discount: null
    },
    {
        name: "Industrial Steel Rods (BSRM)",
        brand: "BSRM",
        price: "৳ 92,000 / ton",
        rating: 4.9,
        reviews: 210,
        image: "https://images.unsplash.com/photo-1535732759880-9470d2b4fb3b?q=80&w=2000&auto=format&fit=crop",
        discount: "Bulk Deal"
    },
    {
        name: "Weather Proof Exterior Paint",
        brand: "Berger",
        price: "৳ 4,500 / 5L",
        rating: 4.7,
        reviews: 56,
        image: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?q=80&w=2131&auto=format&fit=crop",
        discount: null
    }
];

export function FeaturedProducts() {
    return (
        <section className="py-20 bg-neutral-50">
            <div className="container mx-auto px-8">
                <div className="flex justify-between items-center mb-12">
                    <h2 className="heading-2 text-neutral-900">Featured Construction Materials</h2>
                    <Link href="/products" className="text-primary-600 font-semibold hover:underline hidden md:block">
                        View All Products
                    </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {products.map((product, index) => (
                        <Card key={index} className="group border-none shadow-md hover:shadow-xl transition-all duration-300">
                            <div className="relative h-[220px] bg-white p-4 flex items-center justify-center overflow-hidden rounded-t-lg">
                                {product.discount && (
                                    <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                                        {product.discount}
                                    </span>
                                )}
                                <Image
                                    src={product.image}
                                    alt={product.name}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                                />

                                {/* Quick Action Overlay */}
                                <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                                    <Button className="w-full shadow-lg" size="sm">
                                        <ShoppingCart className="w-4 h-4 mr-2" /> Add to Cart
                                    </Button>
                                </div>
                            </div>
                            <CardContent className="p-4 bg-white">
                                <div className="text-sm text-neutral-500 mb-1">{product.brand}</div>
                                <h3 className="font-bold text-neutral-900 text-lg mb-2 line-clamp-2 min-h-[56px]">{product.name}</h3>
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="flex text-yellow-400">
                                        <Star className="w-4 h-4 fill-current" />
                                        <Star className="w-4 h-4 fill-current" />
                                        <Star className="w-4 h-4 fill-current" />
                                        <Star className="w-4 h-4 fill-current" />
                                        <Star className="w-4 h-4 fill-current text-neutral-300" />
                                    </div>
                                    <span className="text-xs text-neutral-400">({product.reviews})</span>
                                </div>
                                <div className="font-bold text-xl text-primary-600">
                                    {product.price}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="mt-8 text-center md:hidden">
                    <Button variant="outline">View All Products</Button>
                </div>
            </div>
        </section>
    );
}

