import Link from "next/link";
import { ArrowRight, Ruler, Paintbrush, Hammer, Wrench } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const categories = [
    {
        icon: Ruler,
        title: "Structural Design",
        description: "Expert engineering & architectural plans for residential and commercial buildings.",
        href: "/services/structural-design",
        color: "bg-blue-50 text-blue-600",
    },
    {
        icon: Paintbrush,
        title: "Interior Design",
        description: "Transform your spaces with custom interior themes and ready-made templates.",
        href: "/services/interior-design",
        color: "bg-purple-50 text-purple-600",
    },
    {
        icon: Hammer,
        title: "Construction Materials",
        description: "Shop high-quality cement, steel, bricks, and finishing materials at best prices.",
        href: "/products",
        color: "bg-orange-50 text-orange-600",
    },
    {
        icon: Wrench,
        title: "Repair & Renovation",
        description: "Book trusted professionals for plumbing, electrical, and home improvement.",
        href: "/services/renovation",
        color: "bg-green-50 text-green-600",
    },
];

export function CategoryGrid() {
    return (
        <section className="py-20 bg-neutral-50">
            <div className="container mx-auto px-8">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h2 className="heading-2 mb-4 text-neutral-900">Everything You Need to Build</h2>
                    <p className="text-lg text-neutral-500">
                        From the first blueprint to the final coat of paint, we connect you with the best professionals and products.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {categories.map((category, index) => (
                        <Link key={index} href={category.href} className="group block h-full">
                            <Card className="h-full hover:shadow-xl transition-all duration-300 border-none shadow-md overflow-hidden group-hover:-translate-y-1">
                                <CardContent className="p-8 flex flex-col items-start h-full">
                                    <div className={`w-14 h-14 rounded-xl ${category.color} flex items-center justify-center mb-6 transition-transform group-hover:scale-110`}>
                                        <category.icon className="w-7 h-7" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-3 text-neutral-900">{category.title}</h3>
                                    <p className="text-neutral-500 leading-relaxed mb-6 flex-grow">
                                        {category.description}
                                    </p>
                                    <div className="flex items-center text-primary-600 font-semibold group-hover:gap-2 transition-all">
                                        Explore <ArrowRight className="w-4 h-4 ml-1" />
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}

