"use client"

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Sidebar } from "@/components/admin/Sidebar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check, UserPlus, XCircle, DollarSign, Send, Clock, Calendar } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { formatDistanceToNow, format } from "date-fns";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { AssignPartnerDialog } from "@/components/admin/AssignPartnerDialog";

const DEFAULT_MILESTONES = [
    "Requirement Analysis",
    "On Field Assessment",
    "Verify all documents",
    "Draft Design",
    "Review and Feedback",
    "Final Design",
    "Soft Design Handover"
];

export default function DesignOrderDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [booking, setBooking] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Negotiation State
    const [quoteAmount, setQuoteAmount] = useState("");
    const [quoteNote, setQuoteNote] = useState("");

    // Milestone State
    const [milestones, setMilestones] = useState<any[]>([]);

    const supabase = createClient();

    useEffect(() => {
        if (id) fetchBooking();
    }, [id]);

    async function fetchBooking() {
        try {
            const { data: booking, error: bookingError } = await supabase
                .from('design_bookings')
                .select('*')
                .eq('id', id)
                .single();

            if (bookingError) throw bookingError;

            const { data: profile } = await supabase
                .from('profiles')
                .select('full_name, phone_number, email')
                .eq('id', booking.user_id)
                .single();

            setBooking({ ...booking, profiles: profile });

            // Initialize milestones if empty
            if (!booking.milestones || booking.milestones.length === 0) {
                setMilestones(DEFAULT_MILESTONES.map(name => ({
                    name,
                    status: 'pending',
                    due_date: ''
                })));
            } else {
                setMilestones(booking.milestones);
            }

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    async function updateStatus(newStatus: string) {
        const { error } = await supabase
            .from('design_bookings')
            .update({ status: newStatus })
            .eq('id', id);

        if (!error) {
            setBooking({ ...booking, status: newStatus });
        }
    }

    async function sendQuote() {
        if (!quoteAmount) return;

        const newOffer = {
            role: 'admin',
            amount: Number(quoteAmount),
            notes: quoteNote,
            date: new Date().toISOString()
        };

        const updatedHistory = [...(booking.quotation_history || []), newOffer];

        const { error } = await supabase
            .from('design_bookings')
            .update({
                quotation_history: updatedHistory,
                status: 'quotation'
            })
            .eq('id', id);

        if (!error) {
            setBooking({ ...booking, quotation_history: updatedHistory, status: 'quotation' });
            setQuoteAmount("");
            setQuoteNote("");
            alert("Quote sent successfully!");
        }
    }

    async function saveMilestones() {
        const { error } = await supabase
            .from('design_bookings')
            .update({ milestones: milestones })
            .eq('id', id);

        if (!error) {
            alert("Milestones updated!");
        }
    }

    async function toggleMilestone(index: number) {
        const newMilestones = [...milestones];
        newMilestones[index].status = newMilestones[index].status === 'completed' ? 'pending' : 'completed';
        setMilestones(newMilestones);

        // Auto-save
        await supabase
            .from('design_bookings')
            .update({ milestones: newMilestones })
            .eq('id', id);
    }

    async function updateMilestoneDate(index: number, date: string) {
        const newMilestones = [...milestones];
        newMilestones[index].due_date = date;
        setMilestones(newMilestones);
    }

    async function assignPartner(partnerId: string) {
        // Assume verified seller for now
        const { error } = await supabase
            .from('design_bookings')
            .update({
                assigned_seller_id: partnerId,
                status: booking.status === 'verified' ? 'assigned' : booking.status
            })
            .eq('id', id);

        if (!error) {
            setBooking({ ...booking, assigned_seller_id: partnerId, status: booking.status === 'verified' ? 'assigned' : booking.status });
            alert("Partner assigned successfully!");
        }
    }

    if (loading) return <div className="p-8">Loading...</div>;
    if (!booking) return <div className="p-8">Order not found.</div>;

    const details = booking.details || {};
    const lastOffer = booking.quotation_history?.length > 0 ? booking.quotation_history[booking.quotation_history.length - 1] : null;

    return (
        <>
            <Button variant="ghost" className="mb-6 pl-0 hover:bg-transparent hover:text-primary-600" onClick={() => router.back()}>
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Orders
            </Button>

            <div className="bg-white rounded-[32px] border border-neutral-100 shadow-sm p-8 max-w-5xl">
                {/* Header */}
                <div className="flex justify-between items-start mb-8 border-b border-neutral-100 pb-8">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-2xl font-black text-neutral-900">Order #{booking.id.slice(0, 8)}</h1>
                            <Badge className="px-3 py-1 rounded-full bg-neutral-900 text-white text-xs font-bold uppercase tracking-widest">
                                {booking.status.replace('_', ' ')}
                            </Badge>
                        </div>
                        <p className="text-neutral-500 font-bold text-sm">
                            Submitted {formatDistanceToNow(new Date(booking.created_at), { addSuffix: true })}
                        </p>
                    </div>

                    <div className="flex gap-2">
                        {booking.status === 'pending' && (
                            <Button onClick={() => updateStatus('verified')} className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl">
                                <Check className="w-4 h-4 mr-2" /> Verify & Start Negotiation
                            </Button>
                        )}
                        {booking.status === 'in_progress' && (
                            <Button onClick={() => updateStatus('completed')} className="bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl">
                                <Check className="w-4 h-4 mr-2" /> Mark Project Completed
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Details & Negotiation */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Negotiation Panel */}
                        {(booking.status === 'verified' || booking.status === 'quotation') && (
                            <Card className="p-6 border-2 border-primary-50 bg-primary-50/20 rounded-3xl">
                                <div className="flex items-center gap-2 mb-6">
                                    <DollarSign className="w-5 h-5 text-primary-600" />
                                    <h3 className="text-lg font-black text-neutral-900 uppercase tracking-tight">Price Negotiation</h3>
                                </div>

                                {booking.quotation_history?.length > 0 && (
                                    <div className="mb-6 space-y-4">
                                        {booking.quotation_history.map((offer: any, idx: number) => (
                                            <div key={idx} className={`flex ${offer.role === 'admin' ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`max-w-[80%] p-4 rounded-2xl ${offer.role === 'admin' ? 'bg-neutral-900 text-white rounded-tr-none' : 'bg-white border rounded-tl-none'}`}>
                                                    <p className="text-xs font-bold uppercase tracking-widest mb-1 opacity-70">{offer.role === 'admin' ? 'You' : 'Customer'}</p>
                                                    <p className="text-xl font-black flex items-center gap-1">
                                                        ৳{offer.amount.toLocaleString()}
                                                    </p>
                                                    {offer.notes && <p className="text-sm mt-2 opacity-90">{offer.notes}</p>}
                                                    <p className="text-[10px] mt-2 opacity-50 text-right">{format(new Date(offer.date), 'MMM d, h:mm a')}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Action Area */}
                                {(!lastOffer || lastOffer.role === 'customer' || booking.status === 'verified') && (
                                    <div className="bg-white p-4 rounded-2xl border border-neutral-200">
                                        <Label className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-3 block">Send {lastOffer ? 'Counter ' : ''}Quote</Label>
                                        <div className="flex gap-4">
                                            <div className="flex-1">
                                                <Input
                                                    type="number"
                                                    placeholder="Amount"
                                                    className="font-black text-lg h-12 rounded-xl"
                                                    value={quoteAmount}
                                                    onChange={(e) => setQuoteAmount(e.target.value)}
                                                />
                                            </div>
                                            <Button size="lg" onClick={sendQuote} className="h-12 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-black uppercase tracking-widest px-8">
                                                Send
                                            </Button>
                                        </div>
                                        <Textarea
                                            placeholder="Add notes about deliverables..."
                                            className="mt-3 rounded-xl resize-none"
                                            value={quoteNote}
                                            onChange={(e) => setQuoteNote(e.target.value)}
                                        />
                                    </div>
                                )}

                                {lastOffer?.role === 'admin' && (
                                    <div className="text-center py-4 bg-white/50 rounded-2xl border border-dashed text-neutral-400 font-bold text-sm">
                                        Waiting for customer response...
                                    </div>
                                )}
                            </Card>
                        )}

                        {/* Project Details */}
                        <div>
                            <h3 className="text-sm font-black text-neutral-900 mb-4 uppercase tracking-widest flex items-center gap-2">
                                <span className="w-1 h-4 bg-neutral-900 rounded-full"></span>
                                Project Requirements
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                {Object.entries(details).map(([key, value]) => {
                                    const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                                    let displayValue: any = value;
                                    if (typeof value === 'boolean') displayValue = value ? 'Yes' : 'No';
                                    if (Array.isArray(value)) displayValue = value.join(', ');
                                    if (!value) displayValue = '-';

                                    return (
                                        <div key={key} className="bg-neutral-50 rounded-xl p-4 border border-neutral-100">
                                            <Label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block mb-1">{formattedKey}</Label>
                                            <p className="font-bold text-neutral-800 text-sm">{displayValue}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Customer & Milestones */}
                    <div className="space-y-8">
                        {/* Partner Assignment */}
                        {(booking.status === 'verified' || booking.status === 'quotation' || booking.status === 'in_progress') && (
                            <div className="bg-white rounded-3xl p-6 border border-neutral-200">
                                <Label className="text-xs font-black text-neutral-400 uppercase tracking-widest block mb-4 flex items-center gap-2">
                                    <UserPlus className="w-4 h-4" /> Assigned Partner
                                </Label>

                                {booking.assigned_seller_id ? (
                                    <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-100">
                                        <div className="flex justify-between items-center mb-1">
                                            <p className="font-bold text-sm text-neutral-900">Partner Assigned</p>
                                            <Badge variant="outline" className="text-[10px] bg-white">ID: {booking.assigned_seller_id.slice(0, 6)}...</Badge>
                                        </div>
                                        <p className="text-xs text-neutral-500 font-medium">This partner can now manage milestones.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <p className="text-xs text-neutral-500 font-medium">Assign a verified partner to handle this project.</p>
                                        <AssignPartnerDialog onAssign={assignPartner} />
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Customer Card */}
                        <div className="bg-neutral-50 rounded-3xl p-6 border border-neutral-100">
                            <Label className="text-xs font-black text-neutral-400 uppercase tracking-widest block mb-4">Customer Details</Label>
                            <div className="space-y-4">
                                <div>
                                    <p className="font-bold text-lg text-neutral-900">{booking.profiles?.full_name}</p>
                                    <p className="text-sm text-neutral-500 font-medium">{booking.profiles?.email}</p>
                                </div>
                                <div className="bg-white p-3 rounded-xl border border-neutral-200">
                                    <Label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block">Phone</Label>
                                    <p className="font-bold text-neutral-800">{booking.profiles?.phone_number}</p>
                                </div>
                            </div>
                        </div>

                        {/* Milestone Manager */}
                        {booking.status === 'in_progress' && (
                            <div className="bg-white rounded-3xl p-6 border border-neutral-200 shadow-xl shadow-neutral-100">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-sm font-black text-neutral-900 uppercase tracking-widest flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-primary-600" />
                                        Milestones
                                    </h3>
                                    <Button size="sm" variant="outline" onClick={saveMilestones} className="h-8 text-xs font-bold rounded-lg border-neutral-200">
                                        Save Changes
                                    </Button>
                                </div>

                                <div className="space-y-4 relative before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-neutral-100">
                                    {milestones.map((milestone, idx) => (
                                        <div key={idx} className="relative pl-8 group">
                                            <div className={`absolute left-0 top-1.5 w-5 h-5 rounded-full border-4 transition-colors ${milestone.status === 'completed' ? 'border-primary-600 bg-primary-600' : 'border-neutral-200 bg-white'}`}></div>

                                            <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-100 group-hover:border-primary-100 transition-colors">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className={`text-sm font-bold ${milestone.status === 'completed' ? 'text-primary-700 line-through opacity-70' : 'text-neutral-900'}`}>
                                                        {milestone.name}
                                                    </span>
                                                    <Checkbox
                                                        checked={milestone.status === 'completed'}
                                                        onCheckedChange={() => toggleMilestone(idx)}
                                                        className="rounded-full data-[state=checked]:bg-primary-600 data-[state=checked]:border-primary-600"
                                                    />
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-3 h-3 text-neutral-400" />
                                                    <input
                                                        type="date"
                                                        className="bg-transparent text-[10px] font-bold text-neutral-500 uppercase tracking-widest focus:outline-none"
                                                        value={milestone.due_date || ''}
                                                        onChange={(e) => updateMilestoneDate(idx, e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {booking.status === 'quotation' && (
                            <div className="bg-amber-50 rounded-3xl p-6 border border-amber-100">
                                <h4 className="text-amber-800 font-black text-sm uppercase tracking-widest mb-2">Quotation Sent</h4>
                                <p className="text-amber-600 text-xs font-medium">
                                    The roadmap will be editable once the customer accepts the offer and the project status moves to "In Progress".
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
