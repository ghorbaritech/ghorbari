"use client"

import { useState, useEffect } from "react";
import { Plus, MessageCircle, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/utils/supabase/client";
import { SupportTicket, createTicket, getUserTickets } from "@/services/supportService";
import { ChatWindow } from "@/components/chat/ChatWindow";

export default function CustomerSupportPage() {
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);

    // Create Form State
    const [subject, setSubject] = useState("");
    const [category, setCategory] = useState("general");
    const [priority, setPriority] = useState("normal");
    const [description, setDescription] = useState("");
    const [creating, setCreating] = useState(false);

    const supabase = createClient();

    const fetchTickets = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            const data = await getUserTickets(user.id);
            setTickets(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTickets();
    }, []);

    const handleCreate = async () => {
        if (!subject || !description) return;
        setCreating(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            await createTicket({
                user_id: user.id,
                subject,
                category,
                priority,
                description
            });
            setIsCreateOpen(false);
            setSubject("");
            setDescription("");
            fetchTickets();
        } catch (error) {
            alert("Failed to create ticket");
        } finally {
            setCreating(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'open': return 'bg-yellow-100 text-yellow-800';
            case 'in_progress': return 'bg-blue-100 text-blue-800';
            case 'resolved': return 'bg-green-100 text-green-800';
            case 'closed': return 'bg-neutral-100 text-neutral-800';
            default: return 'bg-neutral-100';
        }
    };

    return (
        <div className="p-8 space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-neutral-900">Support Center</h1>
                    <p className="text-neutral-500 mt-1">Get help with your orders and account.</p>
                </div>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-primary-600 hover:bg-primary-700 text-white">
                            <Plus className="w-4 h-4 mr-2" /> New Ticket
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create Support Ticket</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Subject</label>
                                <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Brief summary of issue" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Category</label>
                                    <Select value={category} onValueChange={setCategory}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="general">General Inquiry</SelectItem>
                                            <SelectItem value="order">Order Issue</SelectItem>
                                            <SelectItem value="payment">Payment Problem</SelectItem>
                                            <SelectItem value="account">Account Access</SelectItem>
                                            <SelectItem value="technical">Bug Report</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Priority</label>
                                    <Select value={priority} onValueChange={setPriority}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="low">Low</SelectItem>
                                            <SelectItem value="normal">Normal</SelectItem>
                                            <SelectItem value="high">High</SelectItem>
                                            <SelectItem value="urgent">Urgent</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Description</label>
                                <Textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Describe your issue in detail..."
                                    className="h-32"
                                />
                            </div>
                            <Button onClick={handleCreate} disabled={creating || !subject || !description} className="w-full">
                                {creating ? "Creating..." : "Submit Ticket"}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1 space-y-4">
                    {tickets.length === 0 ? (
                        <div className="text-center py-12 bg-neutral-50 rounded-xl border border-dashed text-neutral-400">
                            No tickets found.
                        </div>
                    ) : (
                        tickets.map((ticket) => (
                            <Card
                                key={ticket.id}
                                className={`cursor-pointer transition-all hover:shadow-md ${selectedTicket?.id === ticket.id ? 'border-primary-500 ring-1 ring-primary-500' : 'hover:border-primary-200'}`}
                                onClick={() => setSelectedTicket(ticket)}
                            >
                                <CardContent className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <Badge variant="outline" className="font-mono text-xs text-neutral-500">{ticket.ticket_number}</Badge>
                                        <Badge className={getStatusColor(ticket.status)}>{ticket.status.replace('_', ' ')}</Badge>
                                    </div>
                                    <h4 className="font-bold text-neutral-900 line-clamp-1">{ticket.subject}</h4>
                                    <p className="text-xs text-neutral-500 mt-1 line-clamp-2">{ticket.description}</p>
                                    <div className="flex justify-between items-center mt-3 text-xs text-neutral-400">
                                        <span className="capitalize">{ticket.category}</span>
                                        <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>

                <div className="md:col-span-2">
                    {selectedTicket ? (
                        <div className="space-y-4">
                            <Card>
                                <CardHeader className="border-b pb-4">
                                    <div className="flex justify-between">
                                        <div>
                                            <CardTitle>{selectedTicket.subject}</CardTitle>
                                            <CardDescription className="mt-1">
                                                ID: {selectedTicket.ticket_number} • {selectedTicket.category} • {selectedTicket.priority} Priority
                                            </CardDescription>
                                        </div>
                                        <Badge className={getStatusColor(selectedTicket.status)}>{selectedTicket.status.replace('_', ' ')}</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <p className="text-neutral-700 whitespace-pre-wrap">{selectedTicket.description}</p>
                                </CardContent>
                            </Card>

                            <ChatWindow
                                contextId={selectedTicket.id}
                                contextType="support_ticket"
                                // We don't know the exact admin ID, but if we don't pass 'otherUserId'
                                // the chat service might need adjustment or we just rely on participant fetch.
                                // NOTE: The current ChatWindow requires 'otherUserId' to init conversation.
                                // For support, the 'other' is typically 'Support Team'.
                                // We might need to fetch the conversation differently for Support.
                                // Let's simplify: pass a placeholder or handle in Service.
                                otherUserId={selectedTicket.assigned_to || 'support-agent'}
                                title="Support Conversation"
                                className="h-[400px]"
                            />
                        </div>
                    ) : (
                        <div className="h-full flex items-center justify-center bg-neutral-50 rounded-xl border border-dashed p-12 text-neutral-400">
                            <div className="text-center">
                                <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                <p>Select a ticket to view details and chat with support.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
