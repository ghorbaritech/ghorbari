"use client"

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
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
    Package,
    PenTool,
    Ruler,
    Sofa,
    Info
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Link as RouterLink } from "next/link"; // Renamed to avoid confusion if used
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// Define a unified interface for display
interface UnifiedOrder {
    id: string;
    type: 'product' | 'design';
    order_number: string;
    customer_name: string;
    customer_phone: string;
    customer_email: string;
    shipping_address?: string; // Product only
    status: string;
    created_at: string;
    total_amount: number | string;
    advance_amount?: number;
    remaining_amount?: number;
    payment_status?: string;
    seller?: { business_name: string }; // Product only
    items?: any[]; // Product only
    service_type?: string; // Design only
    details?: any; // Design only
}

export default function AdminOrdersPage() {
    const [allOrders, setAllOrders] = useState<UnifiedOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [typeFilter, setTypeFilter] = useState<'all' | 'product' | 'design'>('all');

    // Derived state
    const [filteredOrders, setFilteredOrders] = useState<UnifiedOrder[]>([]);

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        filterData();
    }, [allOrders, searchTerm, typeFilter]);

    const loadData = async () => {
        setLoading(true);
        const supabase = createClient();

        try {
            // 1. Fetch Product Orders
            const productOrdersData = await getAdminOrders();
            const normalizedProductOrders: UnifiedOrder[] = (productOrdersData || []).map((o: any) => ({
                ...o,
                type: 'product',
                total_amount: o.total_amount, // Keep as number
            }));

            // 2. Fetch Design Bookings
            const { data: bookings, error: bookingsError } = await supabase
                .from('design_bookings')
                .select('*')
                .order('created_at', { ascending: false });

            if (bookingsError) throw bookingsError;

            // 3. Fetch Profiles for Bookings (Manual Join)
            let normalizedDesignBookings: UnifiedOrder[] = [];
            if (bookings && bookings.length > 0) {
                const userIds = Array.from(new Set(bookings.map((b: any) => b.user_id)));
                const { data: profiles } = await supabase
                    .from('profiles')
                    .select('id, full_name, phone_number, email')
                    .in('id', userIds);

                normalizedDesignBookings = bookings.map((b: any) => {
                    const profile = profiles?.find((p: any) => p.id === b.user_id);
                    return {
                        id: b.id,
                        type: 'design',
                        order_number: `DSGN-${b.id.slice(0, 6).toUpperCase()}`,
                        customer_name: profile?.full_name || 'Guest User',
                        customer_phone: profile?.phone_number || 'N/A',
                        customer_email: profile?.email || 'N/A',
                        status: b.status,
                        created_at: b.created_at,
                        total_amount: 'Quotation Pending',
                        service_type: b.service_type,
                        details: b.details
                    };
                });
            }

            // 4. Merge and Sort
            const merged = [...normalizedProductOrders, ...normalizedDesignBookings].sort(
                (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );

            setAllOrders(merged);

        } catch (error) {
            console.error("Error loading unified data:", error);
        } finally {
            setLoading(false);
        }
    };

    const filterData = () => {
        let filtered = allOrders;

        // Type Filter
        if (typeFilter !== 'all') {
            filtered = filtered.filter(o => o.type === typeFilter);
        }

        // Search Filter
        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            filtered = filtered.filter(o =>
                o.order_number.toLowerCase().includes(lowerTerm) ||
                o.customer_name.toLowerCase().includes(lowerTerm) ||
                o.customer_phone.includes(lowerTerm)
            );
        }

        setFilteredOrders(filtered);
    };

    const handleConfirmProductOrder = async (orderId: string) => {
        if (!confirm("Confirm order routing? This will alert the retailer.")) return;
        try {
            await confirmOrder(orderId, "system_admin"); // simplistic admin id
            loadData(); // Reload to refresh status
        } catch (error) {
            alert("Failed to confirm order.");
        }
    };

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

                <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                    {/* Type Filter Dropdown or Buttons */}
                    <div className="bg-white p-1.5 rounded-2xl border border-neutral-100 shadow-sm inline-flex">
                        {(['all', 'product', 'design'] as const).map((type) => (
                            <button
                                key={type}
                                onClick={() => setTypeFilter(type)}
                                className={cn(
                                    "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                    typeFilter === type
                                        ? "bg-neutral-900 text-white shadow-md"
                                        : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900"
                                )}
                            >
                                {type === 'all' ? 'All Orders' : type + 's'}
                            </button>
                        ))}
                    </div>

                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                        <Input
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search orders..."
                            className="h-full min-h-[44px] pl-10 rounded-2xl border-neutral-100 bg-white shadow-sm focus:ring-primary-600 text-xs font-bold"
                        />
                    </div>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Action Required', count: getOrdersByStatus(['pending', 'submitted']).length, color: 'text-amber-600', bg: 'bg-amber-50' },
                    { label: 'In Progress', count: getOrdersByStatus(['confirmed', 'processing', 'shipped', 'verified', 'assigned', 'in_progress']).length, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Completed', count: getOrdersByStatus(['delivered', 'completed']).length, color: 'text-green-600', bg: 'bg-green-50' },
                    { label: 'Total Volume', count: filteredOrders.length, color: 'text-neutral-600', bg: 'bg-neutral-100' },
                ].map((stat, i) => (
                    <Card key={i} className="border-none shadow-sm rounded-[2rem] p-8 bg-white group hover:shadow-xl transition-all duration-500">
                        <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-2">{stat.label}</p>
                        <p className={cn("text-4xl font-black italic tracking-tighter", stat.color)}>{stat.count}</p>
                    </Card>
                ))}
            </div>

            {/* Status Tabs */}
            <Tabs defaultValue="waiting" className="space-y-8">
                <TabsList className="bg-neutral-100/50 p-1.5 rounded-[2rem] border border-neutral-100 inline-flex flex-wrap h-auto">
                    <TabsTrigger value="waiting" className="px-8 py-3 rounded-[1.5rem] font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-neutral-900 data-[state=active]:text-white transition-all">Action Required</TabsTrigger>
                    <TabsTrigger value="active" className="px-8 py-3 rounded-[1.5rem] font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-neutral-900 data-[state=active]:text-white transition-all">In Progress</TabsTrigger>
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
                                {getOrdersByStatus(['pending', 'submitted']).length === 0 ? <EmptyState /> :
                                    getOrdersByStatus(['pending', 'submitted']).map(order =>
                                        <EnhancedOrderCard key={order.order_number} order={order} onConfirm={handleConfirmProductOrder} />
                                    )}
                            </TabsContent>
                            <TabsContent value="active" className="m-0 space-y-6">
                                {getOrdersByStatus(['confirmed', 'processing', 'shipped', 'verified', 'assigned', 'in_progress']).map(order =>
                                    <EnhancedOrderCard key={order.order_number} order={order} readOnly />
                                )}
                            </TabsContent>
                            <TabsContent value="completed" className="m-0 space-y-6">
                                {getOrdersByStatus(['delivered', 'completed']).map(order =>
                                    <EnhancedOrderCard key={order.order_number} order={order} readOnly />
                                )}
                            </TabsContent>
                            <TabsContent value="all" className="m-0 space-y-6">
                                {filteredOrders.map(order =>
                                    <EnhancedOrderCard key={order.order_number} order={order} readOnly />
                                )}
                            </TabsContent>
                        </>
                    )}
                </div>
            </Tabs>
        </div>
    );
}

function EnhancedOrderCard({ order, onConfirm, readOnly = false }: { order: UnifiedOrder, onConfirm?: (id: string) => void, readOnly?: boolean }) {
    const isPending = order.status === 'pending' || order.status === 'submitted';
    const isDesign = order.type === 'design';

    return (
        <Card className="bg-white border-neutral-100 rounded-[2.5rem] shadow-xl shadow-neutral-200/30 overflow-hidden group hover:border-primary-200 transition-all duration-500">
            {/* Category Tag (Top Right) */}
            <div className="absolute top-6 right-6 z-10">
                <Badge className={cn(
                    "px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border shadow-sm",
                    isDesign ? "bg-purple-50 text-purple-700 border-purple-100" : "bg-blue-50 text-blue-700 border-blue-100"
                )}>
                    {isDesign ? "Design Request" : "Product Order"}
                </Badge>
            </div>

            <div className="p-0 flex flex-col lg:flex-row">
                {/* Left side: Information (2/3 width) */}
                <div className="p-10 lg:w-[70%] border-r border-neutral-50 relative">
                    <div className="flex flex-wrap items-center justify-between gap-6 mb-10 pr-20"> {/* pr-20 for badge space */}
                        <div className="flex items-center gap-5">
                            <div className={cn(
                                "w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-xl",
                                isDesign ? "bg-purple-900 shadow-purple-900/20" : "bg-neutral-900 shadow-neutral-900/20"
                            )}>
                                {isDesign ? <PenTool className="w-7 h-7" /> : <Package className="w-7 h-7" />}
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                                    {isDesign ? 'Booking #' : 'Order #'}{order.order_number}
                                </p>
                                <h3 className="text-2xl font-black text-neutral-900 tracking-tight italic uppercase">{order.customer_name}</h3>
                            </div>
                        </div>
                        <Badge className={cn(
                            "px-6 py-2 rounded-full font-black uppercase text-[10px] tracking-widest",
                            isPending ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"
                        )}>
                            {isPending ? "Action Required" : order.status}
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
                                {!isDesign && (
                                    <div className="flex items-start gap-3 text-xs font-bold text-neutral-500 leading-relaxed">
                                        <Truck className="w-4 h-4 text-primary-600 mt-1 flex-shrink-0" />
                                        {order.shipping_address}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                                {isDesign ? 'Service Scope' : 'Retailer Destination'}
                            </p>
                            <div className={cn(
                                "flex items-center gap-4 px-6 py-4 rounded-3xl border",
                                isDesign ? "bg-purple-50 border-purple-100/50" : "bg-primary-50 border-primary-100/50"
                            )}>
                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-neutral-900 shadow-sm font-black">
                                    {isDesign ? <Ruler className="w-5 h-5" /> : <ArrowRightLeft className="w-5 h-5" />}
                                </div>
                                <p className="text-sm font-black text-neutral-900 uppercase italic truncate">
                                    {isDesign ? (order.service_type + ' Design') : (order.seller?.business_name || 'Generic Retailer')}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Items Preview */}
                    <div className="mt-10 pt-10 border-t border-neutral-50">
                        <div className="flex items-center gap-2 mb-6">
                            <Package className="w-4 h-4 text-neutral-400" />
                            <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                                {isDesign ? 'Project Details' : `Order Items (${order.items?.length || 0})`}
                            </p>
                        </div>

                        {isDesign ? (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {Object.entries(order.details || {}).slice(0, 4).map(([key, value]) => (
                                    <div key={key} className="bg-neutral-50 p-3 rounded-xl border border-neutral-100">
                                        <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider mb-1">{key.replace(/_/g, ' ')}</p>
                                        <p className="text-xs font-black text-neutral-900 truncate">{String(value)}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex -space-x-4 overflow-hidden">
                                {order.items?.slice(0, 5).map((item: any, idx: number) => (
                                    <div key={idx} className="w-14 h-14 rounded-2xl border-4 border-white bg-neutral-100 overflow-hidden shadow-lg transition-transform hover:-translate-y-2 hover:z-10 cursor-pointer">
                                        <img src={item.image} alt="" className="w-full h-full object-cover" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right side: Payment/Action Summary (1/3 width) */}
                <div className="bg-neutral-50/50 lg:w-[30%] p-10 flex flex-col justify-between">
                    <div className="space-y-8">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-6 flex items-center gap-2">
                                <CreditCard className="w-3 h-3" />
                                Financial Breakdown
                            </p>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center bg-white p-5 rounded-3xl shadow-sm">
                                    <span className="text-[10px] font-black uppercase text-neutral-400">Total Value</span>
                                    <span className={cn("text-xl font-black italic tracking-tighter", isDesign && "text-sm")}>
                                        {typeof order.total_amount === 'number'
                                            ? `৳${order.total_amount.toLocaleString()}`
                                            : order.total_amount}
                                    </span>
                                </div>
                                {typeof order.total_amount === 'number' && (
                                    <>
                                        <div className="flex justify-between items-center p-3 px-5">
                                            <span className="text-[10px] font-black uppercase text-neutral-400">Advance Paid</span>
                                            <span className="text-sm font-black text-green-600">৳{(order.advance_amount || 0).toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-3 px-5 border-t border-neutral-200/50">
                                            <span className="text-[10px] font-black uppercase text-neutral-900">Remaining</span>
                                            <span className="text-sm font-black text-rose-600">৳{(order.remaining_amount || (Number(order.total_amount) - (order.advance_amount || 0))).toLocaleString()}</span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="bg-white/60 p-5 rounded-3xl border border-white space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-black uppercase text-neutral-400">Status</span>
                                <Badge className={cn(
                                    "px-3 py-1 rounded-lg text-[9px] font-black uppercase",
                                    order.payment_status === 'paid' ? "bg-green-100 text-green-700" : "bg-neutral-200 text-neutral-600"
                                )}>
                                    {isDesign ? 'N/A' : (order.payment_status || 'Unpaid')}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    {!readOnly && (
                        isDesign ? (
                            <Link href={`/admin/design-orders/${order.id}`}>
                                <Button
                                    className="w-full h-16 bg-purple-900 hover:bg-purple-800 text-white rounded-[1.5rem] font-black uppercase tracking-widest shadow-xl shadow-purple-900/10 mt-10 active:scale-95 transition-all text-xs flex items-center justify-center gap-2"
                                >
                                    Manage Journey
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            </Link>
                        ) : (
                            <Button
                                onClick={() => onConfirm?.(order.id)}
                                className="w-full h-16 bg-neutral-900 hover:bg-primary-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest shadow-xl shadow-neutral-900/10 mt-10 active:scale-95 transition-all text-xs flex items-center justify-center gap-2"
                            >
                                Confirm & Route
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        )
                    )}

                    {readOnly && ((isDesign && order.status !== 'completed') || (!isDesign && order.status !== 'delivered')) && (
                        <div className="mt-10 text-center">
                            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                                Processing in progress
                            </p>
                        </div>
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
