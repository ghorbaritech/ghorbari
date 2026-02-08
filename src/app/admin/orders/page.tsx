"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getAdminOrders, confirmOrder } from "@/services/orderService";
import {
    Phone,
    Mail,
    CheckCircle2,
    Clock,
    Truck,
    User as UserIcon,
    Search,
    Filter,
    CreditCard,
    ArrowRightLeft,
    ChevronRight,
    Loader2,
    ShoppingBag,
    Package
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        setLoading(true);
        const data = await getAdminOrders();
        setOrders(data);
        setLoading(false);
    };

    const handleConfirm = async (orderId: string) => {
        if (!confirm("Confirm order routing? This will alert the retailer.")) return;
        try {
            await confirmOrder(orderId, "system_admin");
            loadOrders();
        } catch (error) {
            alert("Failed to confirm order.");
        }
    };

    const filteredOrders = orders.filter(o =>
        o.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.customer_phone?.includes(searchTerm)
    );

    const getOrdersByStatus = (status: string | string[]) => {
        if (Array.isArray(status)) {
            return filteredOrders.filter(o => status.includes(o.status));
        }
        return filteredOrders.filter(o => o.status === status);
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 text-primary-600 text-[10px] font-black uppercase tracking-widest">
                        <ShoppingBag className="w-3 h-3" />
                        Platform Operations
                    </div>
                    <h1 className="text-5xl font-black text-neutral-900 tracking-tighter uppercase italic">
                        Order <span className="text-primary-600">Factory</span>
                    </h1>
                    <p className="text-neutral-500 font-medium">Verify, route, and manage transaction lifecycle.</p>
                </div>

                <div className="relative w-full md:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <Input
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by order #, name, or phone..."
                        className="h-14 pl-12 rounded-2xl border-neutral-100 bg-white shadow-sm focus:ring-primary-600"
                    />
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Waiting/Pending', count: getOrdersByStatus('pending').length, color: 'text-amber-600', bg: 'bg-amber-50' },
                    { label: 'Routed/Active', count: getOrdersByStatus(['confirmed', 'processing', 'shipped']).length, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Completed', count: getOrdersByStatus('delivered').length, color: 'text-green-600', bg: 'bg-green-50' },
                    { label: 'Total Volume', count: filteredOrders.length, color: 'text-neutral-600', bg: 'bg-neutral-100' },
                ].map((stat, i) => (
                    <Card key={i} className="border-none shadow-sm rounded-[2rem] p-8 bg-white group hover:shadow-xl transition-all duration-500">
                        <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-2">{stat.label}</p>
                        <p className={cn("text-4xl font-black italic tracking-tighter", stat.color)}>{stat.count}</p>
                    </Card>
                ))}
            </div>

            {/* Tabs for Organization */}
            <Tabs defaultValue="waiting" className="space-y-8">
                <TabsList className="bg-neutral-100/50 p-1.5 rounded-[2rem] border border-neutral-100 inline-flex flex-wrap h-auto">
                    <TabsTrigger value="waiting" className="px-8 py-3 rounded-[1.5rem] font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-neutral-900 data-[state=active]:text-white transition-all">Waiting Confirmation</TabsTrigger>
                    <TabsTrigger value="routed" className="px-8 py-3 rounded-[1.5rem] font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-neutral-900 data-[state=active]:text-white transition-all">Routed to Retailers</TabsTrigger>
                    <TabsTrigger value="completed" className="px-8 py-3 rounded-[1.5rem] font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-neutral-900 data-[state=active]:text-white transition-all">Completed</TabsTrigger>
                    <TabsTrigger value="all" className="px-8 py-3 rounded-[1.5rem] font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-neutral-900 data-[state=active]:text-white transition-all">All History</TabsTrigger>
                </TabsList>

                <div className="grid grid-cols-1 gap-6">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-32 text-neutral-300 gap-4">
                            <Loader2 className="w-12 h-12 animate-spin text-primary-200" />
                            <p className="font-black uppercase tracking-widest text-xs">Syncing with server...</p>
                        </div>
                    ) : (
                        <>
                            <TabsContent value="waiting" className="m-0 space-y-6">
                                {getOrdersByStatus('pending').length === 0 ? <EmptyState /> :
                                    getOrdersByStatus('pending').map(order => <EnhancedOrderCard key={order.id} order={order} onConfirm={handleConfirm} />)}
                            </TabsContent>
                            <TabsContent value="routed" className="m-0 space-y-6">
                                {getOrdersByStatus(['confirmed', 'processing', 'shipped']).map(order => <EnhancedOrderCard key={order.id} order={order} readOnly />)}
                            </TabsContent>
                            <TabsContent value="completed" className="m-0 space-y-6">
                                {getOrdersByStatus('delivered').map(order => <EnhancedOrderCard key={order.id} order={order} readOnly />)}
                            </TabsContent>
                            <TabsContent value="all" className="m-0 space-y-6">
                                {filteredOrders.map(order => <EnhancedOrderCard key={order.id} order={order} readOnly />)}
                            </TabsContent>
                        </>
                    )}
                </div>
            </Tabs>
        </div>
    );
}

function EnhancedOrderCard({ order, onConfirm, readOnly = false }: { order: any, onConfirm?: (id: string) => void, readOnly?: boolean }) {
    const isPending = order.status === 'pending';

    return (
        <Card className="bg-white border-neutral-100 rounded-[2.5rem] shadow-xl shadow-neutral-200/30 overflow-hidden group hover:border-primary-200 transition-all duration-500">
            <div className="p-0 flex flex-col lg:flex-row">
                {/* Left side: Information (2/3 width) */}
                <div className="p-10 lg:w-[70%] border-r border-neutral-50">
                    <div className="flex flex-wrap items-center justify-between gap-6 mb-10">
                        <div className="flex items-center gap-5">
                            <div className="w-16 h-16 bg-neutral-900 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-neutral-900/20">
                                <UserIcon className="w-7 h-7" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Order #{order.order_number}</p>
                                <h3 className="text-2xl font-black text-neutral-900 tracking-tight italic uppercase">{order.customer_name || 'Guest User'}</h3>
                            </div>
                        </div>
                        <Badge className={cn(
                            "px-6 py-2 rounded-full font-black uppercase text-[10px] tracking-widest",
                            isPending ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"
                        )}>
                            {isPending ? "Waiting Call" : order.status}
                        </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-4">
                            <div className="bg-neutral-50/50 p-6 rounded-3xl space-y-3 border border-neutral-50">
                                <div className="flex items-center gap-3 text-sm font-bold text-neutral-600">
                                    <Phone className="w-4 h-4 text-primary-600" />
                                    {order.customer_phone}
                                </div>
                                <div className="flex items-center gap-3 text-sm font-bold text-neutral-600">
                                    <Mail className="w-4 h-4 text-primary-600" />
                                    <span className="truncate">{order.customer_email}</span>
                                </div>
                                <div className="flex items-start gap-3 text-xs font-bold text-neutral-500 leading-relaxed">
                                    <Truck className="w-4 h-4 text-primary-600 mt-1 flex-shrink-0" />
                                    {order.shipping_address}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Retailer Destination</p>
                            <div className="flex items-center gap-4 bg-primary-50 px-6 py-4 rounded-3xl border border-primary-100/50">
                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-primary-600 shadow-sm font-black">
                                    <ArrowRightLeft className="w-5 h-5" />
                                </div>
                                <p className="text-sm font-black text-primary-900 uppercase italic truncate">{order.seller?.business_name || 'Generic Retailer'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Order Items Preview */}
                    <div className="mt-10 pt-10 border-t border-neutral-50">
                        <div className="flex items-center gap-2 mb-6">
                            <Package className="w-4 h-4 text-neutral-400" />
                            <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Order Items ({order.items?.length || 0})</p>
                        </div>
                        <div className="flex -space-x-4 overflow-hidden">
                            {order.items?.slice(0, 5).map((item: any, idx: number) => (
                                <div key={idx} className="w-14 h-14 rounded-2xl border-4 border-white bg-neutral-100 overflow-hidden shadow-lg transition-transform hover:-translate-y-2 hover:z-10 cursor-pointer">
                                    <img src={item.image} alt="" className="w-full h-full object-cover" />
                                </div>
                            ))}
                            {order.items?.length > 5 && (
                                <div className="w-14 h-14 rounded-2xl border-4 border-white bg-neutral-900 text-white flex items-center justify-center text-xs font-black shadow-lg">
                                    +{order.items.length - 5}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right side: Payment Summary (1/3 width) */}
                <div className="bg-neutral-50/50 lg:w-[30%] p-10 flex flex-col justify-between">
                    <div className="space-y-8">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-6 flex items-center gap-2">
                                <CreditCard className="w-3 h-3" />
                                Financial Breakdown
                            </p>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center bg-white p-5 rounded-3xl shadow-sm">
                                    <span className="text-[10px] font-black uppercase text-neutral-400">Total Bill</span>
                                    <span className="text-xl font-black italic tracking-tighter text-neutral-900">৳{order.total_amount?.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 px-5">
                                    <span className="text-[10px] font-black uppercase text-neutral-400">Advance Paid</span>
                                    <span className="text-sm font-black text-green-600">৳{(order.advance_amount || 0).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 px-5 border-t border-neutral-200/50">
                                    <span className="text-[10px] font-black uppercase text-neutral-900">Remaining</span>
                                    <span className="text-sm font-black text-rose-600">৳{(order.remaining_amount || (order.total_amount - (order.advance_amount || 0))).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/60 p-5 rounded-3xl border border-white space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-black uppercase text-neutral-400">Payment Status</span>
                                <Badge className={cn(
                                    "px-3 py-1 rounded-lg text-[9px] font-black uppercase",
                                    order.payment_status === 'paid' ? "bg-green-100 text-green-700" : "bg-neutral-200 text-neutral-600"
                                )}>
                                    {order.payment_status || 'Unpaid'}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    {!readOnly && (
                        <Button
                            onClick={() => onConfirm?.(order.id)}
                            className="w-full h-16 bg-neutral-900 hover:bg-primary-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest shadow-xl shadow-neutral-900/10 mt-10 active:scale-95 transition-all text-xs flex items-center justify-center gap-2"
                        >
                            Confirm & Route
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    )}
                </div>
            </div>
        </Card>
    );
}

function EmptyState() {
    return (
        <div className="bg-white border border-dashed border-neutral-200 rounded-[3rem] p-24 text-center">
            <div className="w-20 h-20 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock className="w-8 h-8 text-neutral-300" />
            </div>
            <h3 className="text-lg font-black text-neutral-900 uppercase italic mb-2 tracking-tighter">No Action Required</h3>
            <p className="text-neutral-400 font-medium max-w-xs mx-auto text-sm">All set! There are currently no orders waiting for confirmation under this category.</p>
        </div>
    );
}
