"use client"

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getAdminOrders, confirmOrder, cancelOrder } from "@/services/orderService";
import {
    ShoppingBag,
    Search,
    Loader2,
    CheckCircle2,
    XCircle,
    Eye,
    Info,
    ArrowUpRight
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

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
                        total_amount: 'Pending',
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
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            alert("Session expired. Please log in again.");
            return;
        }

        try {
            await confirmOrder(orderId, user.id);
            loadData(); // Reload to refresh status
        } catch (error: any) {
            console.error("Confirmation error details:", error);
            alert(`Failed to confirm order. ${error?.message || "Check admin permissions."}`);
        }
    };

    const handleCancelOrder = async (orderId: string, isDesign: boolean) => {
        if (!confirm("Are you sure you want to cancel this order? This cannot be undone.")) return;
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            alert("Session expired. Please log in again.");
            return;
        }

        try {
            if (isDesign) {
                const { error } = await supabase
                    .from('design_bookings')
                    .update({ status: 'cancelled' })
                    .eq('id', orderId);

                if (error) throw error;
            } else {
                await cancelOrder(orderId, user.id);
            }
            loadData();
        } catch (error: any) {
            console.error("Cancellation error:", error);
            alert(`Failed to cancel order.`);
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
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase tracking-widest border border-blue-500/20">
                        <ShoppingBag className="w-3 h-3" />
                        Platform Operations
                    </div>
                    <h1 className="text-5xl font-black text-white tracking-tighter uppercase italic">
                        Order <span className="text-blue-500">Factory</span>
                    </h1>
                    <p className="text-neutral-400 font-medium">Verify, route, and manage transaction lifecycle.</p>
                </div>

                <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                    {/* Type Filter Dropdown or Buttons */}
                    <div className="bg-neutral-900 border border-neutral-800 p-1.5 rounded-2xl shadow-sm inline-flex">
                        {(['all', 'product', 'design'] as const).map((type) => (
                            <button
                                key={type}
                                onClick={() => setTypeFilter(type)}
                                className={cn(
                                    "px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                                    typeFilter === type
                                        ? "bg-neutral-800 text-white shadow-md"
                                        : "text-neutral-500 hover:bg-neutral-800/50 hover:text-white"
                                )}
                            >
                                {type === 'all' ? 'All Orders' : type + 's'}
                            </button>
                        ))}
                    </div>

                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                        <Input
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search orders..."
                            className="h-full min-h-[48px] pl-10 rounded-2xl border-neutral-800 bg-neutral-900 text-white shadow-sm focus:ring-blue-500/50 text-xs font-bold"
                        />
                    </div>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Action Required', count: getOrdersByStatus(['pending', 'submitted']).length, color: 'text-amber-400', bg: 'bg-neutral-900', border: 'border-amber-500/20' },
                    { label: 'In Progress', count: getOrdersByStatus(['confirmed', 'processing', 'shipped', 'verified', 'assigned', 'in_progress']).length, color: 'text-blue-400', bg: 'bg-neutral-900', border: 'border-blue-500/20' },
                    { label: 'Completed', count: getOrdersByStatus(['delivered', 'completed']).length, color: 'text-emerald-400', bg: 'bg-neutral-900', border: 'border-emerald-500/20' },
                    { label: 'Total Volume', count: filteredOrders.length, color: 'text-white', bg: 'bg-neutral-900', border: 'border-neutral-800' },
                ].map((stat, i) => (
                    <Card key={i} className={cn("border bg-neutral-900 shadow-sm rounded-[2rem] p-8 group transition-all duration-300 hover:bg-neutral-800", stat.border)}>
                        <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-2">{stat.label}</p>
                        <p className={cn("text-4xl font-black italic tracking-tighter", stat.color)}>{stat.count}</p>
                    </Card>
                ))}
            </div>

            {/* Status Tabs & Data Table */}
            <Tabs defaultValue="waiting" className="space-y-8">
                <TabsList className="bg-neutral-900 border border-neutral-800 p-1.5 rounded-2xl inline-flex flex-wrap h-auto w-full max-w-[800px]">
                    <TabsTrigger value="waiting" className="flex-1 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest text-neutral-500 data-[state=active]:bg-neutral-800 data-[state=active]:text-white transition-all">Action Required</TabsTrigger>
                    <TabsTrigger value="active" className="flex-1 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest text-neutral-500 data-[state=active]:bg-neutral-800 data-[state=active]:text-white transition-all">In Progress</TabsTrigger>
                    <TabsTrigger value="completed" className="flex-1 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest text-neutral-500 data-[state=active]:bg-neutral-800 data-[state=active]:text-white transition-all">Completed</TabsTrigger>
                    <TabsTrigger value="all" className="flex-1 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest text-neutral-500 data-[state=active]:bg-neutral-800 data-[state=active]:text-white transition-all">All History</TabsTrigger>
                </TabsList>

                <Card className="bg-neutral-900 border border-neutral-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-32 text-neutral-500 gap-4">
                            <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
                            <p className="font-black uppercase tracking-widest text-xs">Syncing with server...</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto w-full">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-neutral-950 border-b border-neutral-800">
                                        <th className="p-6 text-[10px] font-black uppercase tracking-widest text-neutral-500">Order ID</th>
                                        <th className="p-6 text-[10px] font-black uppercase tracking-widest text-neutral-500">Customer</th>
                                        <th className="p-6 text-[10px] font-black uppercase tracking-widest text-neutral-500">Type</th>
                                        <th className="p-6 text-[10px] font-black uppercase tracking-widest text-neutral-500">Date</th>
                                        <th className="p-6 text-[10px] font-black uppercase tracking-widest text-neutral-500">Total Value</th>
                                        <th className="p-6 text-[10px] font-black uppercase tracking-widest text-neutral-500">Status</th>
                                        <th className="p-6 text-[10px] font-black uppercase tracking-widest text-neutral-500 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <TabsContent value="waiting" className="m-0" asChild>
                                        <OrderTableRows
                                            orders={getOrdersByStatus(['pending', 'submitted'])}
                                            onConfirm={handleConfirmProductOrder}
                                            onCancel={handleCancelOrder}
                                        />
                                    </TabsContent>
                                    <TabsContent value="active" className="m-0" asChild>
                                        <OrderTableRows
                                            orders={getOrdersByStatus(['confirmed', 'processing', 'shipped', 'verified', 'assigned', 'in_progress'])}
                                            onCancel={handleCancelOrder}
                                        />
                                    </TabsContent>
                                    <TabsContent value="completed" className="m-0" asChild>
                                        <OrderTableRows
                                            orders={getOrdersByStatus(['delivered', 'completed'])}
                                        />
                                    </TabsContent>
                                    <TabsContent value="all" className="m-0" asChild>
                                        <OrderTableRows
                                            orders={filteredOrders}
                                            onConfirm={handleConfirmProductOrder}
                                            onCancel={handleCancelOrder}
                                        />
                                    </TabsContent>
                                </tbody>
                            </table>
                        </div>
                    )}
                </Card>
            </Tabs>
        </div>
    );
}

function OrderTableRows({ orders, onConfirm, onCancel }: {
    orders: UnifiedOrder[],
    onConfirm?: (id: string, isDesign: boolean) => void,
    onCancel?: (id: string, isDesign: boolean) => void
}) {
    if (orders.length === 0) {
        return (
            <tr>
                <td colSpan={7} className="p-20 text-center">
                    <div className="flex flex-col items-center justify-center text-neutral-500">
                        <ShoppingBag className="w-12 h-12 mb-4 opacity-50" />
                        <span className="font-black italic uppercase tracking-widest text-sm text-neutral-400">No Orders Found</span>
                    </div>
                </td>
            </tr>
        );
    }

    return (
        <>
            {orders.map((order) => {
                const isPending = order.status === 'pending' || order.status === 'submitted';
                const isDesign = order.type === 'design';

                return (
                    <tr key={order.order_number} className="border-b border-neutral-800 hover:bg-neutral-800/30 transition-colors group">
                        <td className="p-6 align-middle">
                            <span className="font-bold text-white text-sm">{order.order_number}</span>
                            <div className="text-[10px] font-bold text-neutral-500 uppercase mt-1">
                                {isDesign ? (order.service_type + ' Design') : (order.seller?.business_name || 'Retailer')}
                            </div>
                        </td>
                        <td className="p-6 align-middle">
                            <span className="font-bold text-white text-sm uppercase italic">{order.customer_name}</span>
                            <div className="text-xs font-medium text-neutral-500 mt-1">{order.customer_phone}</div>
                        </td>
                        <td className="p-6 align-middle">
                            <Badge className={cn(
                                "px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-sm",
                                isDesign ? "bg-purple-500/10 text-purple-400 border border-purple-500/20" : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                            )}>
                                {isDesign ? "Design" : "Product"}
                            </Badge>
                        </td>
                        <td className="p-6 align-middle">
                            <span className="text-sm font-medium text-white">{format(new Date(order.created_at), 'MMM dd, yyyy')}</span>
                            <div className="text-[10px] text-neutral-500 font-bold uppercase mt-1">{format(new Date(order.created_at), 'hh:mm a')}</div>
                        </td>
                        <td className="p-6 align-middle">
                            <span className="font-black text-white text-sm">
                                {typeof order.total_amount === 'number'
                                    ? `৳${order.total_amount.toLocaleString()}`
                                    : order.total_amount}
                            </span>
                        </td>
                        <td className="p-6 align-middle">
                            <Badge className={cn(
                                "px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest",
                                isPending ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" :
                                    order.status === 'cancelled' ? "bg-rose-500/10 text-rose-500 border border-rose-500/20" :
                                        order.status === 'completed' || order.status === 'delivered' ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" :
                                            "bg-blue-500/10 text-blue-500 border border-blue-500/20"
                            )}>
                                {order.status}
                            </Badge>
                        </td>
                        <td className="p-6 align-middle text-right space-x-2 whitespace-nowrap">
                            {isDesign ? (
                                <Link href={`/admin/design-orders/${order.id}`}>
                                    <Button size="sm" variant="outline" className="h-9 bg-neutral-950 border-neutral-800 text-neutral-300 hover:bg-purple-600 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest">
                                        Review <ArrowUpRight className="w-3 h-3 ml-1" />
                                    </Button>
                                </Link>
                            ) : (
                                <>
                                    {isPending && onConfirm && (
                                        <Button
                                            size="sm"
                                            onClick={() => onConfirm(order.id, isDesign)}
                                            className="h-9 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-900/40"
                                        >
                                            <CheckCircle2 className="w-4 h-4 mr-1" /> Confirm
                                        </Button>
                                    )}
                                </>
                            )}

                            {onCancel && (isPending || order.status === 'confirmed' || order.status === 'processing') && (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => onCancel(order.id, isDesign)}
                                    className="h-9 bg-neutral-950 border-neutral-800 text-neutral-400 hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/30 rounded-xl px-3"
                                    title="Cancel Order"
                                >
                                    <XCircle className="w-4 h-4" />
                                </Button>
                            )}
                        </td>
                    </tr>
                );
            })}
        </>
    );
}
