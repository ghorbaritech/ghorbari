"use client"

import { useState, useEffect } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Package, Truck, CheckCircle, Clock, AlertCircle, FileText, MessageSquare, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createClient } from "@/utils/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { getApplicableMilestones, updateEntityMilestones, MilestoneStatus } from "@/services/milestoneService";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ORDER_STATUSES = [
    { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'confirmed', label: 'Confirmed', color: 'bg-blue-100 text-blue-800' },
    { value: 'processing', label: 'Processing', color: 'bg-purple-100 text-purple-800' },
    { value: 'ready_to_ship', label: 'Ready to Ship', color: 'bg-indigo-100 text-indigo-800' },
    { value: 'shipped', label: 'Shipped', color: 'bg-indigo-100 text-indigo-800' },
    { value: 'out_for_delivery', label: 'Out for Delivery', color: 'bg-orange-100 text-orange-800' },
    { value: 'delivered', label: 'Delivered', color: 'bg-green-100 text-green-800' },
    { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800' },
];

export default function SellerOrdersPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [inquiries, setInquiries] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Selection State
    const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
    const [selectedInquiry, setSelectedInquiry] = useState<any | null>(null);

    const [updating, setUpdating] = useState(false);
    const [quoteAmount, setQuoteAmount] = useState('');

    // Milestone State
    const [milestones, setMilestones] = useState<MilestoneStatus[]>([]);
    const [loadingMilestones, setLoadingMilestones] = useState(false);

    const supabase = createClient();

    const fetchData = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: seller } = await supabase.from('sellers').select('id').eq('user_id', user.id).single();
            if (!seller) return;

            // Fetch Standard Orders
            const { data: ords } = await supabase
                .from('orders')
                .select('*, customer:profiles(full_name, phone_number, email)')
                .eq('seller_id', seller.id)
                .order('created_at', { ascending: false });
            setOrders(ords || []);

            // Fetch Quote Inquiries
            const { data: inqs } = await supabase
                .from('product_inquiries')
                .select('*, customer:profiles(full_name, phone_number, email)')
                .eq('seller_id', seller.id)
                .order('created_at', { ascending: false });
            setInquiries(inqs || []);

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Load Milestones for selected Order
    useEffect(() => {
        if (!selectedOrder) return;
        const loadMilestones = async () => {
            setLoadingMilestones(true);
            try {
                let current = selectedOrder.milestones || [];
                const templateStages = await getApplicableMilestones('product'); // Default product milestones

                if (templateStages) {
                    const merged: MilestoneStatus[] = templateStages.map((stageName: string) => {
                        const existing = current.find((m: any) => m.name === stageName);
                        const isCompleted = existing?.status === 'completed';
                        return {
                            name: stageName,
                            status: isCompleted ? 'completed' : 'pending',
                            completed_at: existing?.completed_at
                        };
                    });
                    setMilestones(merged);
                } else {
                    setMilestones(current);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoadingMilestones(false);
            }
        };
        loadMilestones();
    }, [selectedOrder]);

    const updateOrderStatus = async (orderId: string, newStatus: string) => {
        if (!confirm(`Update order status to ${newStatus}?`)) return;
        setUpdating(true);
        try {
            const { error } = await supabase
                .from('orders')
                .update({ status: newStatus, updated_at: new Date().toISOString() })
                .eq('id', orderId);

            if (error) throw error;
            fetchData();
            if (selectedOrder) setSelectedOrder({ ...selectedOrder, status: newStatus });
        } catch (error) {
            alert("Failed to update status");
        } finally {
            setUpdating(false);
        }
    };

    const updateMilestone = async (index: number) => {
        const ms = [...milestones];
        const isComplete = ms[index].status === 'completed';

        ms[index] = {
            ...ms[index],
            status: isComplete ? 'pending' : 'completed',
            completed_at: isComplete ? undefined : new Date().toISOString()
        };

        setMilestones(ms);

        try {
            await updateEntityMilestones('orders', selectedOrder.id, ms);
        } catch (error) {
            alert("Failed to save milestone");
        }
    };

    const submitQuote = async (inquiryId: string) => {
        if (!quoteAmount) return alert("Please enter a quote amount");
        setUpdating(true);
        try {
            const { error } = await supabase
                .from('product_inquiries')
                .update({
                    status: 'quoted',
                    quotation_history: [{ by: 'seller', amount: parseFloat(quoteAmount), date: new Date().toISOString() }]
                })
                .eq('id', inquiryId);

            if (error) throw error;
            fetchData();
            setSelectedInquiry(null);
            setQuoteAmount('');
        } catch (error) {
            alert("Failed to send quote");
        } finally {
            setUpdating(false);
        }
    };

    const getStatusColor = (status: string) => {
        return ORDER_STATUSES.find(s => s.value === status)?.color || 'bg-neutral-100';
    };

    return (
        <div className="p-8 space-y-8 min-h-screen bg-[#F0F2F5]">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-black text-neutral-900 italic tracking-tighter uppercase">Order Command Center</h1>
                    <p className="text-neutral-500 font-bold uppercase text-xs tracking-widest mt-2">{orders.length} Active Orders • {inquiries.length} New Inquiries</p>
                </div>
            </div>

            <Tabs defaultValue="orders" className="space-y-6">
                <TabsList className="bg-white p-1 rounded-2xl border border-neutral-100 h-14">
                    <TabsTrigger value="orders" className="rounded-xl h-12 px-6 font-black uppercase text-xs tracking-widest data-[state=active]:bg-neutral-900 data-[state=active]:text-white transition-all">
                        <Package className="w-4 h-4 mr-2" /> Active Orders
                    </TabsTrigger>
                    <TabsTrigger value="quotes" className="rounded-xl h-12 px-6 font-black uppercase text-xs tracking-widest data-[state=active]:bg-neutral-900 data-[state=active]:text-white transition-all">
                        <FileText className="w-4 h-4 mr-2" /> Quote Requests
                        {inquiries.filter(i => i.status === 'pending_quote').length > 0 && (
                            <span className="ml-2 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{inquiries.filter(i => i.status === 'pending_quote').length}</span>
                        )}
                    </TabsTrigger>
                </TabsList>

                {/* ACTIVE ORDERS TAB */}
                <TabsContent value="orders" className="space-y-4">
                    {orders.length === 0 ? (
                        <Card className="p-12 text-center border-none shadow-sm rounded-[40px]">
                            <p className="text-neutral-400 font-bold uppercase text-xs tracking-widest">No active orders found.</p>
                        </Card>
                    ) : (
                        orders.map((order) => (
                            <Card key={order.id} className="cursor-pointer hover:shadow-md transition-all border-none shadow-sm rounded-3xl overflow-hidden group" onClick={() => setSelectedOrder(order)}>
                                <CardContent className="p-6 flex items-center justify-between">
                                    <div className="flex items-center gap-6">
                                        <div className="w-16 h-16 bg-neutral-100 rounded-2xl flex items-center justify-center">
                                            <Package className="w-8 h-8 text-neutral-400 group-hover:text-neutral-900 transition-colors" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <Badge className={`${getStatusColor(order.status)} border-none`}>{order.status.replace(/_/g, ' ')}</Badge>
                                                <span className="text-[10px] font-black text-neutral-300 uppercase tracking-widest">#{order.order_number || order.id.slice(0, 8)}</span>
                                            </div>
                                            <div className="font-black text-lg text-neutral-900 uppercase">{order.customer?.full_name}</div>
                                            <div className="text-xs text-neutral-500 font-bold">{format(new Date(order.created_at), 'MMM d, yyyy • h:mm a')}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-black text-2xl text-neutral-900 italic">৳{order.total_amount}</div>
                                        <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">{order.payment_status}</div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </TabsContent>

                {/* QUOTES TAB */}
                <TabsContent value="quotes" className="space-y-4">
                    {inquiries.length === 0 ? (
                        <Card className="p-12 text-center border-none shadow-sm rounded-[40px]">
                            <p className="text-neutral-400 font-bold uppercase text-xs tracking-widest">No quote requests pending.</p>
                        </Card>
                    ) : (
                        inquiries.map((inq) => (
                            <Card key={inq.id} className="cursor-pointer hover:shadow-md transition-all border-none shadow-sm rounded-3xl overflow-hidden group" onClick={() => setSelectedInquiry(inq)}>
                                <CardContent className="p-6 flex items-center justify-between">
                                    <div className="flex items-center gap-6">
                                        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center">
                                            <FileText className="w-8 h-8 text-blue-500 group-hover:scale-110 transition-transform" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50 font-bold uppercase text-[10px] tracking-widest">
                                                    {inq.status.replace(/_/g, ' ')}
                                                </Badge>
                                                <span className="text-[10px] font-black text-neutral-300 uppercase tracking-widest">#{inq.inquiry_number || inq.id.slice(0, 8)}</span>
                                            </div>
                                            <div className="font-black text-lg text-neutral-900 uppercase">{inq.customer?.full_name}</div>
                                            <div className="text-xs text-neutral-500 font-bold">{inq.items?.length || 0} Items Requested</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        {inq.status === 'pending_quote' ? (
                                            <Button size="sm" className="bg-neutral-900 text-white font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-black">
                                                Review & Quote
                                            </Button>
                                        ) : (
                                            <div className="font-black text-xl text-neutral-900 italic">৳{inq.quotation_history?.[0]?.amount || ' - '}</div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </TabsContent>
            </Tabs>

            {/* ORDER DETAILS DIALOG */}
            <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
                <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0 overflow-hidden bg-[#F0F2F5] rounded-[40px] border-none">
                    <DialogHeader className="p-8 bg-white shrink-0 flex flex-row items-center justify-between border-b border-neutral-100">
                        <div>
                            <DialogTitle className="text-2xl font-black text-neutral-900 italic tracking-tighter uppercase">Order #{selectedOrder?.order_number || selectedOrder?.id.slice(0, 8)}</DialogTitle>
                            <p className="text-neutral-400 font-bold uppercase text-[10px] tracking-widest mt-1">Placed on {selectedOrder && format(new Date(selectedOrder.created_at), 'MMM d, yyyy')}</p>
                        </div>
                        <div className="flex gap-2">
                            <Link href={`/dashboard/seller/support?order_id=${selectedOrder?.id}`}>
                                <Button variant="outline" className="h-8 rounded-full border-neutral-200 text-neutral-500 hover:text-red-600 hover:bg-red-50 hover:border-red-100 font-bold uppercase text-[10px] tracking-widest">
                                    <AlertCircle className="w-3 h-3 mr-1" /> Report Issue
                                </Button>
                            </Link>
                            <Badge className={`text-sm px-4 py-1.5 rounded-full ${selectedOrder ? getStatusColor(selectedOrder.status) : ''}`}>
                                {selectedOrder?.status.replace(/_/g, ' ')}
                            </Badge>
                        </div>
                    </DialogHeader>

                    {selectedOrder && (
                        <div className="flex-1 overflow-y-auto p-8 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Customer & Shipping */}
                                <Card className="p-6 border-none shadow-sm rounded-3xl">
                                    <h3 className="text-sm font-black text-neutral-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <Truck className="w-4 h-4 text-neutral-400" /> Delivery Details
                                    </h3>
                                    <div className="space-y-4 text-sm font-medium text-neutral-600">
                                        <div className="bg-neutral-50 p-4 rounded-2xl">
                                            <p className="font-black text-neutral-900 text-lg mb-1">{selectedOrder.customer?.full_name}</p>
                                            <p>{selectedOrder.customer?.phone_number}</p>
                                            <p className="text-neutral-400 text-xs mt-2 font-bold uppercase tracking-widest">Shipping Address</p>
                                            <p className="mt-1">{typeof selectedOrder.shipping_address === 'string' ? selectedOrder.shipping_address : JSON.stringify(selectedOrder.shipping_address)}</p>
                                        </div>
                                    </div>
                                </Card>

                                {/* Items List */}
                                <Card className="p-6 border-none shadow-sm rounded-3xl">
                                    <h3 className="text-sm font-black text-neutral-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <Package className="w-4 h-4 text-neutral-400" /> Order Items
                                    </h3>
                                    <div className="space-y-3">
                                        {selectedOrder.items?.map((item: any, idx: number) => (
                                            <div key={idx} className="flex justify-between items-center p-3 bg-neutral-50 rounded-xl">
                                                <div>
                                                    <p className="font-bold text-neutral-900">{item.name}</p>
                                                    <p className="text-xs text-neutral-500 font-bold uppercase tracking-wide">Qty: {item.quantity}</p>
                                                </div>
                                                <p className="font-black text-neutral-900">৳{item.price * item.quantity}</p>
                                            </div>
                                        ))}
                                        <div className="flex justify-between items-center pt-4 mt-4 border-t border-neutral-200">
                                            <p className="font-black text-neutral-400 uppercase text-xs tracking-widest">Total Amount</p>
                                            <p className="font-black text-xl text-neutral-900">৳{selectedOrder.total_amount}</p>
                                        </div>
                                    </div>
                                </Card>
                            </div>

                            {/* Milestones & Status Controls */}
                            <Card className="p-6 border-none shadow-sm rounded-3xl bg-neutral-900 text-white">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div>
                                        <h3 className="text-sm font-black text-neutral-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <Clock className="w-4 h-4" /> Timeline & Milestones
                                        </h3>
                                        <div className="space-y-6 relative pl-4 border-l border-neutral-700 ml-2">
                                            {loadingMilestones ? (
                                                <p className="text-xs text-neutral-500">Loading timeline...</p>
                                            ) : milestones.map((ms, idx) => {
                                                const isCompleted = ms.status === 'completed';
                                                return (
                                                    <div key={idx} className="relative group">
                                                        <button
                                                            onClick={() => updateMilestone(idx)}
                                                            className={`absolute -left-[21px] top-0 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${isCompleted ? 'bg-green-500 border-green-500' : 'bg-neutral-800 border-neutral-600 hover:border-white'}`}
                                                        >
                                                            {isCompleted && <CheckCircle className="w-3 h-3 text-white" />}
                                                        </button>
                                                        <div className="text-sm font-bold text-white leading-none mb-1">{ms.name}</div>
                                                        <div className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">
                                                            {isCompleted && ms.completed_at ? format(new Date(ms.completed_at), 'MMM d, h:mm a') : 'Pending'}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-black text-neutral-400 uppercase tracking-widest mb-4">
                                            Update Status
                                        </h3>
                                        <div className="space-y-4">
                                            <Select
                                                defaultValue={selectedOrder.status}
                                                onValueChange={(val) => updateOrderStatus(selectedOrder.id, val)}
                                                disabled={updating}
                                            >
                                                <SelectTrigger className="bg-neutral-800 border-none text-white h-12 rounded-xl font-bold">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {ORDER_STATUSES.map(status => (
                                                        <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <Button className="w-full h-12 bg-white text-neutral-900 font-black uppercase text-xs tracking-widest rounded-xl hover:bg-neutral-200">
                                                Save Changes
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* QUOTE DETAILS DIALOG */}
            <Dialog open={!!selectedInquiry} onOpenChange={(open) => !open && setSelectedInquiry(null)}>
                <DialogContent className="max-w-2xl bg-white rounded-[40px] p-8 border-none shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black text-neutral-900 italic tracking-tighter uppercase">Quote Request</DialogTitle>
                        <DialogDescription className="text-neutral-500 font-bold uppercase text-xs tracking-widest">
                            Inquiry #{selectedInquiry?.inquiry_number || selectedInquiry?.id.slice(0, 8)}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedInquiry && (
                        <div className="space-y-6 mt-4">
                            <div className="bg-neutral-50 p-6 rounded-3xl">
                                <h3 className="text-sm font-black text-neutral-900 uppercase tracking-widest mb-4">Requested Items</h3>
                                <div className="space-y-3">
                                    {selectedInquiry.items?.map((item: any, idx: number) => (
                                        <div key={idx} className="flex justify-between items-center">
                                            <span className="font-bold text-neutral-700">{item.name}</span>
                                            <Badge variant="outline" className="border-neutral-300">Qty: {item.quantity}</Badge>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {selectedInquiry.status === 'pending_quote' ? (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 pl-1">Your Quote Amount (৳)</label>
                                        <Input
                                            type="number"
                                            value={quoteAmount}
                                            onChange={(e) => setQuoteAmount(e.target.value)}
                                            className="h-14 rounded-2xl bg-neutral-50 border-none font-black text-xl"
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <Button onClick={() => submitQuote(selectedInquiry.id)} disabled={updating} className="w-full h-14 bg-neutral-900 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl hover:bg-black">
                                        {updating ? 'Sending...' : 'Send Quotation'}
                                    </Button>
                                </div>
                            ) : (
                                <div className="p-6 bg-green-50 rounded-3xl text-center">
                                    <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                                    <p className="font-black text-green-700 uppercase">Quote Sent</p>
                                    <p className="text-green-600 font-bold mt-1">৳{selectedInquiry.quotation_history?.[0]?.amount}</p>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
