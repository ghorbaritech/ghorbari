"use client"

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Package, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/utils/supabase/client";
import { QuotationHistory } from "@/components/negotiation/QuotationHistory";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function SellerInquiriesPage() {
    const [inquiries, setInquiries] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedInquiry, setSelectedInquiry] = useState<any | null>(null);

    const supabase = createClient();

    const fetchInquiries = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Get Helper ID (Seller ID)
            const { data: seller } = await supabase.from('sellers').select('id').eq('user_id', user.id).single();
            if (!seller) return;

            const { data } = await supabase
                .from('product_inquiries')
                .select('*, customer:profiles(full_name, email, phone_number)')
                .eq('seller_id', seller.id)
                .order('created_at', { ascending: false });

            setInquiries(data || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInquiries();
    }, []);

    return (
        <div className="p-8 space-y-8">
            <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                    Product Inquiries
                </h1>
                <p className="text-neutral-500 mt-1">Manage negotiation requests from customers.</p>
            </div>

            <div className="grid gap-4">
                {inquiries.map((inq) => (
                    <Card key={inq.id} className="cursor-pointer hover:border-orange-200" onClick={() => setSelectedInquiry(inq)}>
                        <CardContent className="p-6 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="bg-orange-50 p-3 rounded-full">
                                    <MessageSquare className="w-6 h-6 text-orange-600" />
                                </div>
                                <div>
                                    <div className="font-bold text-lg">{inq.inquiry_number}</div>
                                    <div className="text-sm text-neutral-500">
                                        Customer: {inq.customer?.full_name} • {inq.items?.length} Items
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="text-right">
                                    <div className="font-bold text-lg text-neutral-900">
                                        {inq.agreed_amount ? `Agreed: ৳${inq.agreed_amount}` : `Requested: ৳${inq.total_amount}`}
                                    </div>
                                    <div className="text-xs text-neutral-400">{format(new Date(inq.created_at), 'MMM d')}</div>
                                </div>
                                <Badge className={
                                    inq.status === 'pending_quote' ? 'bg-yellow-100 text-yellow-800' :
                                        inq.status === 'quoted' ? 'bg-blue-100 text-blue-800' :
                                            inq.status === 'accepted' ? 'bg-green-100 text-green-800' : 'bg-neutral-100'
                                }>
                                    {inq.status === 'pending_quote' ? 'Needs Quote' : inq.status}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {inquiries.length === 0 && (
                    <div className="text-center py-12 bg-neutral-50 rounded-xl border border-dashed text-neutral-400">
                        No active inquiries.
                    </div>
                )}
            </div>

            <Dialog open={!!selectedInquiry} onOpenChange={(open) => !open && setSelectedInquiry(null)}>
                <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0">
                    <DialogHeader className="p-6 border-b">
                        <DialogTitle>Negotiation: {selectedInquiry?.inquiry_number}</DialogTitle>
                    </DialogHeader>
                    {selectedInquiry && (
                        <div className="flex-1 flex overflow-hidden">
                            <div className="w-1/2 p-6 overflow-y-auto bg-neutral-50/50 border-r">
                                <h3 className="font-bold mb-4">Items Requested</h3>
                                <div className="space-y-4">
                                    {selectedInquiry.items?.map((item: any, idx: number) => (
                                        <div key={idx} className="flex gap-4 p-3 bg-white rounded border">
                                            {item.image && <img src={item.image} className="w-12 h-12 rounded object-cover" />}
                                            <div>
                                                <div className="font-medium">{item.name}</div>
                                                <div className="text-sm text-neutral-500">Qty: {item.quantity} x ৳{item.price}</div>
                                            </div>
                                        </div>
                                    ))}
                                    <div className="pt-4 border-t flex justify-between font-bold">
                                        <span>Total Requested:</span>
                                        <span>৳{selectedInquiry.total_amount}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="w-1/2 p-6">
                                <QuotationHistory
                                    type="product"
                                    entityId={selectedInquiry.id}
                                    history={selectedInquiry.quotation_history || []}
                                    userRole="partner"
                                    status={selectedInquiry.status}
                                    onUpdate={() => {
                                        fetchInquiries();
                                        setSelectedInquiry(null);
                                    }}
                                />
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
