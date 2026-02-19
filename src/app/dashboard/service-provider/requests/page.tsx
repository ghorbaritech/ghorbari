"use client"

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Hammer, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/utils/supabase/client";
import { QuotationHistory } from "@/components/negotiation/QuotationHistory";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function ServiceProviderRequestsPage() {
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState<any | null>(null);

    const supabase = createClient();

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Get Provider Profile ID (assuming user_id is the link)
            const { data: provider } = await supabase.from('service_providers').select('id').eq('user_id', user.id).single();
            if (!provider) return;

            const { data } = await supabase
                .from('service_requests')
                .select('*, customer:profiles(full_name, email, phone_number)')
                .eq('provider_id', provider.id)
                .order('created_at', { ascending: false });

            setRequests(data || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    return (
        <div className="p-8 space-y-8">
            <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Service Requests
                </h1>
                <p className="text-neutral-500 mt-1">Manage service bookings and negotiations.</p>
            </div>

            <div className="grid gap-4">
                {requests.map((req) => (
                    <Card key={req.id} className="cursor-pointer hover:border-blue-200" onClick={() => setSelectedRequest(req)}>
                        <CardContent className="p-6 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="bg-blue-50 p-3 rounded-full">
                                    <Hammer className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <div className="font-bold text-lg capitalize">{req.service_type.replace('_', ' ')}</div>
                                    <div className="text-sm text-neutral-500">
                                        Customer: {req.customer?.full_name} • {req.location || 'Location N/A'}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="text-right">
                                    <div className="font-bold text-lg text-neutral-900">
                                        {req.agreed_amount ? `Agreed: ৳${req.agreed_amount}` : 'Quote Needed'}
                                    </div>
                                    <div className="text-xs text-neutral-400">{format(new Date(req.created_at), 'MMM d')}</div>
                                </div>
                                <Badge className={
                                    !req.quotation_history?.length ? 'bg-yellow-100 text-yellow-800' :
                                        req.status === 'negotiation' ? 'bg-purple-100 text-purple-800' :
                                            req.status === 'accepted' ? 'bg-green-100 text-green-800' : 'bg-neutral-100'
                                }>
                                    {req.status}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {requests.length === 0 && (
                    <div className="text-center py-12 bg-neutral-50 rounded-xl border border-dashed text-neutral-400">
                        No active service requests.
                    </div>
                )}
            </div>

            <Dialog open={!!selectedRequest} onOpenChange={(open) => !open && setSelectedRequest(null)}>
                <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0">
                    <DialogHeader className="p-6 border-b">
                        <DialogTitle>Service Negotiation</DialogTitle>
                    </DialogHeader>
                    {selectedRequest && (
                        <div className="flex-1 flex overflow-hidden">
                            <div className="w-1/2 p-6 overflow-y-auto bg-neutral-50/50 border-r">
                                <h3 className="font-bold mb-4">Request Details</h3>
                                <div className="space-y-4 text-sm">
                                    <div className="bg-white p-4 rounded border">
                                        <div className="text-neutral-500 mb-1">Requirements</div>
                                        <p>{selectedRequest.description || selectedRequest.requirements || 'No details provided.'}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-white p-3 rounded border">
                                            <div className="text-neutral-500 text-xs">Date Requested</div>
                                            <div className="font-medium">{selectedRequest.scheduled_date || 'Flexible'}</div>
                                        </div>
                                        <div className="bg-white p-3 rounded border">
                                            <div className="text-neutral-500 text-xs">Location</div>
                                            <div className="font-medium">{selectedRequest.location}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="w-1/2 p-6">
                                <QuotationHistory
                                    type="service"
                                    entityId={selectedRequest.id}
                                    history={selectedRequest.quotation_history || []}
                                    userRole="partner"
                                    status={selectedRequest.status}
                                    onUpdate={() => {
                                        fetchRequests();
                                        setSelectedRequest(null);
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
