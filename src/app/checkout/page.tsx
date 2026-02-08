"use client"

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Truck, CheckCircle2, Loader2, User, Phone, Mail, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { createClient } from "@/utils/supabase/client";
import { createOrder } from "@/services/orderService";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
    const { items, totalAmount, vatAmount, platformCharges, grandTotal, advancePayment, clearCart } = useCart();
    const [loading, setLoading] = useState(false);
    const [orderStep, setOrderStep] = useState(1); // 1: Details, 2: Checkout Success
    const router = useRouter();

    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);

    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        postalCode: ""
    });

    useEffect(() => {
        async function loadUser() {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUser(user);
                const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single();
                if (prof) {
                    setProfile(prof);
                    setFormData({
                        fullName: prof.full_name || "",
                        email: prof.email || "",
                        phone: prof.phone_number || "",
                        address: prof.address || "",
                        city: "",
                        postalCode: ""
                    });
                }
            }
        }
        loadUser();
    }, []);

    const handleConfirmOrder = async () => {
        if (!formData.phone || !formData.address || !formData.fullName) {
            alert("Please fill in all required fields.");
            return;
        }

        setLoading(true);
        try {
            // Split orders by seller
            const sellers = Array.from(new Set(items.map(item => item.sellerId)));

            for (const sellerId of sellers) {
                const sellerName = items.find(i => i.sellerId === sellerId)?.sellerName || "Retailer";
                const sellerItems = items.filter(item => item.sellerId === sellerId);

                // Calculate seller-specific totals
                const sellerSubtotal = sellerItems.reduce((sum, i) => sum + (i.price * i.quantity), 0);

                // For simplicity, we split VAT and Advance proportionally or just use the seller's portion
                // Here we calculate based on the specific items in this seller's order
                const sellerVat = sellerItems.reduce((sum, i) => sum + (i.vatAmount || 0), 0);
                const sellerPlatformFee = sellerItems.reduce((sum, i) => sum + (i.platformFee || 0), 0);
                const sellerTotal = sellerSubtotal + sellerVat + sellerPlatformFee;

                // Use a default 10% advance rate if not explicitly handled per item
                const sellerAdvance = sellerTotal * 0.1;
                const sellerRemaining = sellerTotal - sellerAdvance;

                const orderData = {
                    seller_id: sellerId,
                    order_number: `GB-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                    items: sellerItems,
                    total_amount: sellerTotal,
                    advance_amount: sellerAdvance,
                    remaining_amount: sellerRemaining,
                    vat_amount: sellerVat,
                    platform_fee: sellerPlatformFee,
                    customer_id: user?.id || null,
                };

                const customerDetails = {
                    name: formData.fullName,
                    email: formData.email,
                    phone: formData.phone,
                    address: `${formData.address}, ${formData.city}, ${formData.postalCode}`
                };

                await createOrder(orderData, customerDetails, !user);
            }

            setOrderStep(2);
            clearCart();
        } catch (error: any) {
            console.error("Order failed (VERBOSE):", error);
            console.error("Error Message:", error?.message);
            console.error("Error Code:", error?.code);
            alert(`Failed to place order: ${error?.message || "Please check console for details."}`);
        } finally {
            setLoading(false);
        }
    };

    if (orderStep === 2) {
        return (
            <main className="min-h-screen flex flex-col font-sans bg-white">
                <Navbar />
                <div className="flex-1 flex items-center justify-center p-8 text-center">
                    <div className="max-w-md space-y-8 animate-in fade-in zoom-in duration-500">
                        <div className="w-24 h-24 bg-primary-50 rounded-full flex items-center justify-center mx-auto text-primary-600 ring-8 ring-primary-50/50">
                            <CheckCircle2 className="w-12 h-12" />
                        </div>
                        <div className="space-y-4">
                            <h2 className="text-4xl font-black text-neutral-900 tracking-tight uppercase italic">Order Placed!</h2>
                            <p className="text-neutral-500 font-medium leading-relaxed">
                                Your construction materials have been requested. Our admin will call you at <span className="font-bold text-neutral-900">{formData.phone}</span> shortly for confirmation.
                            </p>
                        </div>
                        <div className="p-6 bg-neutral-50 rounded-2xl border border-neutral-100 flex items-start gap-4 text-left">
                            <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center flex-shrink-0">
                                <Phone className="w-5 h-5 text-primary-600" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-black uppercase tracking-widest text-neutral-400">Next Step</p>
                                <p className="text-sm font-bold text-neutral-900">Wait for Admin Call</p>
                                <p className="text-xs text-neutral-500">Upon your confirmation over phone, the order will be sent to the retailers.</p>
                            </div>
                        </div>
                        <Link href="/">
                            <Button className="w-full h-14 bg-neutral-900 hover:bg-neutral-800 text-white rounded-2xl font-black uppercase tracking-widest mt-8">
                                Back to Home
                            </Button>
                        </Link>
                    </div>
                </div>
                <Footer />
            </main>
        );
    }

    if (items.length === 0 && orderStep === 1) {
        return (
            <main className="min-h-screen flex flex-col font-sans bg-neutral-50">
                <Navbar />
                <div className="flex-1 flex flex-col items-center justify-center p-8 gap-6">
                    <div className="w-16 h-16 bg-neutral-100 rounded-2xl flex items-center justify-center text-neutral-400">
                        <Truck className="w-8 h-8" />
                    </div>
                    <div className="text-center">
                        <h2 className="text-xl font-bold text-neutral-900">Your cart is empty</h2>
                        <p className="text-neutral-500">Add some materials to start your project!</p>
                    </div>
                    <Link href="/products">
                        <Button className="bg-primary-600 hover:bg-primary-700 font-bold px-8 rounded-xl h-12 tracking-wide">
                            Browse Materials
                        </Button>
                    </Link>
                </div>
                <Footer />
            </main>
        );
    }

    return (
        <main className="min-h-screen flex flex-col font-sans bg-neutral-50/50">
            <Navbar />

            <div className="container mx-auto px-4 py-12">
                <div className="flex flex-col lg:flex-row gap-12 max-w-7xl mx-auto">
                    {/* Left: Checkout Form */}
                    <div className="flex-1 space-y-8">
                        <div className="space-y-2">
                            <h1 className="text-4xl font-black text-neutral-900 tracking-tight uppercase italic underline decoration-primary-600 decoration-8 underline-offset-8">Checkout</h1>
                            <p className="text-neutral-500 font-medium">Verify your details and place your order request.</p>
                        </div>

                        {/* Customer Information */}
                        <div className="bg-white rounded-[2rem] border border-neutral-100 shadow-xl shadow-neutral-200/50 overflow-hidden">
                            <div className="p-8 border-b border-neutral-50 bg-neutral-50/30 flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-primary-600 text-white flex items-center justify-center font-black">
                                    <User className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-neutral-900 text-lg">Contact Information</h3>
                                    {user && <p className="text-xs text-primary-600 font-bold">Logged in: {user.email}</p>}
                                </div>
                            </div>
                            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Full Name</label>
                                    <div className="relative">
                                        <Input
                                            value={formData.fullName}
                                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                            className="h-12 pl-4 rounded-xl border-neutral-200 focus:ring-primary-600 bg-neutral-50/30"
                                            placeholder="Full Name"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Email Address</label>
                                    <div className="relative">
                                        <Input
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="h-12 pl-4 rounded-xl border-neutral-200 focus:ring-primary-600 bg-neutral-50/30"
                                            placeholder="Email for confirmation link"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Phone Number (Required for Admin Call)</label>
                                    <div className="relative">
                                        <Input
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="h-12 pl-4 rounded-xl border-neutral-200 focus:ring-primary-600 bg-neutral-50/30 font-bold"
                                            placeholder="+8801XXXXXXXXX"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Delivery Address */}
                        <div className="bg-white rounded-[2rem] border border-neutral-100 shadow-xl shadow-neutral-200/50 overflow-hidden text-[#5a5652]">
                            <div className="p-8 border-b border-neutral-50 bg-neutral-50/30 flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-neutral-900 text-white flex items-center justify-center font-black">
                                    <MapPin className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-neutral-900 text-lg">Delivery Details</h3>
                                    <p className="text-xs text-neutral-500 font-medium">Where should we deliver your materials?</p>
                                </div>
                            </div>
                            <div className="p-8 space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Detailed Address (House, Road, Area)</label>
                                    <Input
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        className="h-12 pl-4 rounded-xl border-neutral-200 focus:ring-primary-600 bg-neutral-50/30"
                                        placeholder="Detailed Address"
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">City</label>
                                        <Input
                                            value={formData.city}
                                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                            className="h-12 pl-4 rounded-xl border-neutral-200 focus:ring-primary-600 bg-neutral-50/30"
                                            placeholder="Dhaka"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Postal Code</label>
                                        <Input
                                            value={formData.postalCode}
                                            onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                                            className="h-12 pl-4 rounded-xl border-neutral-200 focus:ring-primary-600 bg-neutral-50/30"
                                            placeholder="1212"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Summary */}
                    <div className="w-full lg:w-[450px] flex-shrink-0">
                        <div className="sticky top-24 space-y-6">
                            <div className="bg-neutral-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
                                {/* Decorative elements */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-600/20 blur-3xl -mr-16 -mt-16" />

                                <h3 className="text-2xl font-black uppercase tracking-tight italic mb-8 border-b border-white/10 pb-4">Invoice Summary</h3>

                                <div className="space-y-4 mb-8">
                                    <div className="flex justify-between items-center text-sm font-medium">
                                        <span className="text-neutral-400">Order Subtotal</span>
                                        <span className="font-bold">৳{totalAmount.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm font-medium">
                                        <span className="text-neutral-400">VAT (Categorized)</span>
                                        <span className="font-bold text-primary-400">৳{vatAmount.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm font-medium">
                                        <span className="text-neutral-400">Platform Charges</span>
                                        <span className="font-bold text-primary-400">৳{platformCharges.toLocaleString()}</span>
                                    </div>
                                    <div className="h-px bg-white/10 my-6" />
                                    <div className="flex justify-between items-end">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-primary-500">Total Bill</p>
                                            <p className="text-3xl font-black italic tracking-tighter">৳{grandTotal.toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white/5 rounded-2xl p-6 border border-white/10 space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-bold text-neutral-300 italic uppercase">Advance Required (10%)</span>
                                        <span className="text-xl font-black text-primary-500">৳{advancePayment.toLocaleString()}</span>
                                    </div>
                                    <p className="text-[10px] text-neutral-400 leading-relaxed font-medium">
                                        Payment instructions will be provided after the confirmation call from our admin.
                                    </p>
                                </div>

                                <Button
                                    onClick={handleConfirmOrder}
                                    disabled={loading}
                                    className="w-full h-16 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-black uppercase tracking-widest mt-8 shadow-xl shadow-primary-600/20 active:scale-95 transition-all text-sm"
                                >
                                    {loading ? (
                                        <div className="flex items-center gap-2">
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Processing Request...
                                        </div>
                                    ) : (
                                        "Confirm Order Request"
                                    )}
                                </Button>
                            </div>

                            <div className="bg-white rounded-3xl p-6 border border-neutral-100 flex items-start gap-4">
                                <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <Truck className="w-6 h-6 text-neutral-900" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-neutral-900 text-sm">Free Delivery Service</h4>
                                    <p className="text-xs text-neutral-500 leading-relaxed font-medium mt-1">
                                        Special offer! We provide site delivery for all confirmed orders within 3-5 days.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    );
}

