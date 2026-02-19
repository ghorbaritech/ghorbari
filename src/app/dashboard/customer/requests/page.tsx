"use client"

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { MessageSquare, Package, Hammer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createClient } from "@/utils/supabase/client";
import { QuotationHistory } from "@/components/negotiation/QuotationHistory";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function CustomerRequestsPage() {
    const [inquiries, setInquiries] = useState<any[]>([]);
    const [serviceRequests, setServiceRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [selectedItem, setSelectedItem] = useState<any | null>(null);
    const [selectedType, setSelectedType] = useState<'product' | 'service' | 'design'>('product');

    const supabase = createClient();

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch Product Inquiries
            const { data: productData } = await supabase
                .from('product_inquiries')
                .select('*, seller:sellers(business_name)')
                .order('created_at', { ascending: false });

            // Fetch Service Requests
            const { data: serviceData } = await supabase
                .from('service_requests')
                .select('*') // Join designer/provider if needed
                .order('created_at', { ascending: false });

            setInquiries(productData || []);
            setServiceRequests(serviceData || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const openDetails = (item: any, type: 'product' | 'service' | 'design') => {
        setSelectedItem(item);
        setSelectedType(type);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending_quote': return <Badge variant="outline" className="text-yellow-600 border-yellow-200 bg-yellow-50">Pending Quote</Badge>;
            case 'quoted': return <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">Quote Received</Badge>;
            case 'negotiation': return <Badge variant="outline" className="text-purple-600 border-purple-200 bg-purple-50">Negotiating</Badge>;
            case 'accepted': return <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">Accepted</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <div className="p-8 space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-neutral-900">My Requests</h1>
                <p className="text-neutral-500 mt-1">Manage your quotes and service inquiries.</p>
            </div>

            <Tabs defaultValue="product" className="w-full">
                <TabsList className="mb-4">
                    <TabsTrigger value="product">Product Inquiries ({inquiries.length})</TabsTrigger>
                    <TabsTrigger value="service">Services ({serviceRequests.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="product" className="space-y-4">
                    {inquiries.map((inq) => (
                        <Card key={inq.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => openDetails(inq, 'product')}>
                            <CardContent className="p-6 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="bg-primary-50 p-3 rounded-full">
                                        <Package className="w-6 h-6 text-primary-600" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-lg">{inq.inquiry_number}</div>
                                        <div className="text-sm text-neutral-500">
                                            {inq.items?.length} items • Seller: {inq.seller?.business_name}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <div className="font-bold text-lg">৳{inq.agreed_amount || inq.total_amount || 0}</div>
                                        <div className="text-xs text-neutral-400">{format(new Date(inq.created_at), 'MMM d, yyyy')}</div>
                                    </div>
                                    {getStatusBadge(inq.status)}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    {inquiries.length === 0 && <div className="text-center py-12 text-neutral-400">No product inquiries found.</div>}
                </TabsContent>

                <TabsContent value="service" className="space-y-4">
                    {serviceRequests.map((req) => (
                        <Card key={req.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => openDetails(req, 'service')}>
                            <CardContent className="p-6 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="bg-secondary-50 p-3 rounded-full">
                                        <Hammer className="w-6 h-6 text-secondary-600" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-lg capitalize">{req.service_type.replace('_', ' ')}</div>
                                        <div className="text-sm text-neutral-500">
                                            {req.request_number}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <div className="font-bold text-lg">
                                            {req.agreed_amount ? `৳${req.agreed_amount}` : 'Pending Quote'}
                                        </div>
                                        <div className="text-xs text-neutral-400">{format(new Date(req.created_at), 'MMM d, yyyy')}</div>
                                    </div>
                                    {getStatusBadge(req.status)}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    {serviceRequests.length === 0 && <div className="text-center py-12 text-neutral-400">No service requests found.</div>}
                </TabsContent>
            </Tabs>

            <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
                <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0 overflow-hidden">
                    <DialogHeader className="p-6 border-b">
                        <DialogTitle>Negotiation Details</DialogTitle>
                    </DialogHeader>
                    {selectedItem && (
                        <div className="flex-1 flex overflow-hidden">
                            <div className="w-1/2 p-6 overflow-y-auto border-r bg-neutral-50/50">
                                <h3 className="font-bold mb-4 text-lg">Request Info</h3>
                                <pre className="text-xs bg-white p-4 rounded border overflow-auto">
                                    {JSON.stringify(selectedItem.items || selectedItem.requirements, null, 2)}
                                </pre>
                            </div>
                            <div className="w-1/2 p-6 bg-white">
                                <QuotationHistory
                                    type={selectedType}
                                    entityId={selectedItem.id}
                                    history={selectedItem.quotation_history || []}
                                    userRole="customer"
                                    status={selectedItem.status}
                                    onUpdate={() => {
                                        fetchData();
                                        setSelectedItem(null); // Close to refresh or refetch item
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
