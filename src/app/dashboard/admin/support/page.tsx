"use client"

import { useState, useEffect } from "react";
import { MessageSquare, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/utils/supabase/client";
import { SupportTicket, getAllTickets, updateTicketStatus } from "@/services/supportService";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { format } from "date-fns";

export default function AdminSupportPage() {
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
    const [filterStatus, setFilterStatus] = useState("all");

    const supabase = createClient();

    const fetchTickets = async () => {
        setLoading(true);
        try {
            const data = await getAllTickets(filterStatus !== 'all' ? { status: filterStatus } : undefined);
            setTickets(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTickets();
    }, [filterStatus]);

    const handleStatusUpdate = async (newStatus: string) => {
        if (!selectedTicket) return;
        try {
            const { data: { user } } = await supabase.auth.getUser();
            await updateTicketStatus(selectedTicket.id, newStatus, user?.id);
            setSelectedTicket(prev => prev ? { ...prev, status: newStatus } : null);
            fetchTickets();
        } catch (error) {
            alert("Failed to update status");
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'open': return 'bg-red-100 text-red-800';
            case 'in_progress': return 'bg-blue-100 text-blue-800';
            case 'resolved': return 'bg-green-100 text-green-800';
            case 'closed': return 'bg-neutral-100 text-neutral-800';
            default: return 'bg-neutral-100';
        }
    };

    return (
        <div className="p-8 space-y-8 h-[calc(100vh-200px)] flex flex-col">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-neutral-900">Support Tickets</h1>
                    <p className="text-neutral-500 mt-1">Manage user issues and inquiries.</p>
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 min-h-0">
                <div className="md:col-span-1 overflow-y-auto space-y-4 pr-2">
                    {tickets.map((ticket) => (
                        <Card
                            key={ticket.id}
                            className={`cursor-pointer transition-all hover:shadow-md ${selectedTicket?.id === ticket.id ? 'border-primary-500 ring-1 ring-primary-500' : 'hover:border-primary-200'}`}
                            onClick={() => setSelectedTicket(ticket)}
                        >
                            <CardContent className="p-4 relative">
                                {ticket.status === 'open' && <span className="absolute top-4 right-4 w-2 h-2 bg-red-500 rounded-full animate-pulse" />}
                                <div className="flex justify-between items-start mb-2">
                                    <Badge variant="outline" className="font-mono text-xs text-neutral-500">{ticket.ticket_number}</Badge>
                                    <Badge className={getStatusColor(ticket.status)}>{ticket.status.replace('_', ' ')}</Badge>
                                </div>
                                <h4 className="font-bold text-neutral-900 line-clamp-1">{ticket.subject}</h4>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="text-xs bg-neutral-100 px-2 py-1 rounded text-neutral-600 capitalize">{ticket.category}</span>
                                    <span className={`text-xs px-2 py-1 rounded capitalize ${ticket.priority === 'urgent' ? 'bg-red-100 text-red-700 font-bold' : 'bg-neutral-100 text-neutral-600'}`}>{ticket.priority}</span>
                                </div>
                                <div className="flex justify-between items-center mt-3 text-xs text-neutral-400">
                                    <span className="truncate max-w-[120px]">{ticket.user?.full_name || 'Unknown User'}</span>
                                    <span>{format(new Date(ticket.created_at), 'MMM d')}</span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    {tickets.length === 0 && <div className="text-center py-8 text-neutral-400">No tickets found.</div>}
                </div>

                <div className="md:col-span-2 flex flex-col h-full bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
                    {selectedTicket ? (
                        <>
                            <div className="p-6 border-b bg-neutral-50/50">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h2 className="text-xl font-bold">{selectedTicket.subject}</h2>
                                        <div className="text-sm text-neutral-500 mt-1 flex gap-2">
                                            <span>From: <span className="text-neutral-900 font-medium">{selectedTicket.user?.full_name}</span> ({selectedTicket.user?.email})</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        {(selectedTicket.status === 'open' || selectedTicket.status === 'in_progress') && (
                                            <Button size="sm" variant="outline" className="text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => handleStatusUpdate('resolved')}>
                                                <CheckCircle className="w-4 h-4 mr-2" /> Resolve
                                            </Button>
                                        )}
                                        {selectedTicket.status !== 'closed' && (
                                            <Button size="sm" variant="outline" className="text-neutral-600 hover:text-neutral-900" onClick={() => handleStatusUpdate('closed')}>
                                                <XCircle className="w-4 h-4 mr-2" /> Close
                                            </Button>
                                        )}
                                    </div>
                                </div>
                                <div className="mt-4 p-4 bg-white rounded border text-sm text-neutral-700">
                                    {selectedTicket.description}
                                </div>
                            </div>

                            <div className="flex-1 overflow-hidden p-6 bg-neutral-50">
                                <ChatWindow
                                    contextId={selectedTicket.id}
                                    contextType="support_ticket"
                                    otherUserId={selectedTicket.user_id}
                                    title={`Chat with ${selectedTicket.user?.full_name}`}
                                    className="h-full shadow-none border bg-white"
                                />
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center bg-neutral-50">
                            <div className="text-center text-neutral-400">
                                <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-20" />
                                <p>Select a ticket to view details and respond.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
