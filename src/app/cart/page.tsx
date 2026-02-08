import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, Minus, Plus, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// Mock Cart Data
const cartItems = [
    {
        id: 1,
        name: "Premium Portland Cement",
        brand: "Shah Cement",
        price: 550,
        quantity: 20,
        image: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?q=80&w=2073&auto=format&fit=crop"
    },
    {
        id: 4,
        name: "Weather Coat Paint",
        brand: "Berger",
        price: 4500,
        quantity: 2,
        image: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?q=80&w=2131&auto=format&fit=crop"
    }
];

export default function CartPage() {
    const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const delivery = 2000;
    const total = subtotal + delivery;

    return (
        <main className="min-h-screen flex flex-col font-sans bg-neutral-50">
            <Navbar />

            <div className="container mx-auto px-4 py-8">
                <h1 className="heading-2 mb-8 text-neutral-900">Shopping Cart ({cartItems.length} items)</h1>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Cart Items List */}
                    <div className="flex-1 space-y-4">
                        {cartItems.map((item) => (
                            <Card key={item.id} className="border-neutral-200 shadow-sm">
                                <CardContent className="p-4 sm:p-6 flex gap-4 sm:gap-6 items-start sm:items-center">
                                    <div className="relative w-24 h-24 flex-shrink-0 bg-neutral-100 rounded-md overflow-hidden">
                                        <Image
                                            src={item.image}
                                            alt={item.name}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-bold text-neutral-900 text-lg mb-1">{item.name}</h3>
                                                <p className="text-sm text-neutral-500 mb-2">{item.brand}</p>
                                            </div>
                                            <div className="font-bold text-lg text-neutral-900">৳ {(item.price * item.quantity).toLocaleString()}</div>
                                        </div>

                                        <div className="flex justify-between items-center mt-4">
                                            <div className="flex items-center border border-neutral-200 rounded-md">
                                                <button className="w-8 h-8 flex items-center justify-center hover:bg-neutral-100 text-neutral-600"><Minus className="w-3 h-3" /></button>
                                                <div className="w-10 text-center text-sm font-bold">{item.quantity}</div>
                                                <button className="w-8 h-8 flex items-center justify-center hover:bg-neutral-100 text-neutral-600"><Plus className="w-3 h-3" /></button>
                                            </div>
                                            <button className="text-red-500 hover:text-red-600 p-2 flex items-center gap-1 text-sm font-medium">
                                                <Trash2 className="w-4 h-4" /> <span className="hidden sm:inline">Remove</span>
                                            </button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}

                        <div className="flex justify-between items-center mt-8">
                            <Link href="/products" className="text-primary-600 font-bold hover:underline">
                                ← Continue Shopping
                            </Link>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="w-full lg:w-96 flex-shrink-0">
                        <Card className="sticky top-24 border-neutral-200 shadow-sm">
                            <CardContent className="p-6">
                                <h3 className="font-bold text-xl mb-6 text-neutral-900">Order Summary</h3>

                                <div className="space-y-4 mb-6">
                                    <div className="flex justify-between text-neutral-600">
                                        <span>Subtotal</span>
                                        <span>৳ {subtotal.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-neutral-600">
                                        <span>Delivery Charge</span>
                                        <span>৳ {delivery.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-neutral-600">
                                        <span>Tax (Vat 5%)</span>
                                        <span>Included</span>
                                    </div>
                                    <div className="h-px bg-neutral-200 my-4"></div>
                                    <div className="flex justify-between text-lg font-bold text-neutral-900">
                                        <span>Total</span>
                                        <span>৳ {total.toLocaleString()}</span>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex gap-2">
                                        <Input placeholder="Promo Code" />
                                        <Button variant="outline">Apply</Button>
                                    </div>

                                    <Link href="/checkout" className="block w-full">
                                        <Button className="w-full h-12 text-base font-bold bg-primary-600 hover:bg-primary-700 shadow-lg">
                                            Proceed to Checkout <ArrowRight className="w-4 h-4 ml-2" />
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    );
}
