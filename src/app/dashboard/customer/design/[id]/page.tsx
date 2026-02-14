"use client"

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check, Clock, Calendar, DollarSign, Send, XCircle } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { formatDistanceToNow, format } from "date-fns";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from 'next/link';

export default function CustomerDesignOrderDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [booking, setBooking] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Negotiation State
    const [offerAmount, setOfferAmount] = useState("");
    const [offerNote, setOfferNote] = useState("");

    const supabase = createClient();

    useEffect(() => {
        if (id) fetchBooking();
    }, [id]);

    async function fetchBooking() {
        try {
            const { data: booking, error } = await supabase
                .from('design_bookings')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            setBooking(booking);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    async function sendCounterOffer() {
        if (!offerAmount) return;

        const newOffer = {
            role: 'customer',
            amount: Number(offerAmount),
            notes: offerNote,
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
            setBooking({ ...booking, quotation_history: updatedHistory });
            setOfferAmount("");
            setOfferNote("");
            alert("Counter offer sent!");
        }
    }

    async function acceptOffer() {
        const lastOffer = booking.quotation_history[booking.quotation_history.length - 1];
        if (!lastOffer) return;

        const { error } = await supabase
            .from('design_bookings')
            .update({
                status: 'in_progress',
                agreed_amount: lastOffer.amount
            })
            .eq('id', id);

        if (!error) {
            setBooking({ ...booking, status: 'in_progress', agreed_amount: lastOffer.amount });
            alert("Offer accepted! Project is now in progress.");
        }
    }

    if (loading) return <div className="p-8">Loading...</div>;
    if (!booking) return <div className="p-8">Order not found.</div>;

    const details = booking.details || {};
    const milestones = booking.milestones || [];
    const lastOffer = booking.quotation_history?.length > 0 ? booking.quotation_history[booking.quotation_history.length - 1] : null;

    return (
        <div className="min-h-screen bg-[#F8F9FA] p-6 md:p-12">
            <div className="max-w-5xl mx-auto">
                <Link href="/dashboard/customer">
                    <Button variant="ghost" className="mb-6 pl-0 hover:bg-transparent hover:text-primary-600">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
                    </Button>
                </Link>

                <div className="bg-white rounded-[40px] shadow-sm p-8 md:p-12">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-3xl font-black text-neutral-900 tracking-tight">Design Order #{booking.id.slice(0, 8)}</h1>
                                <Badge className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${booking.status === 'in_progress' ? 'bg-green-100 text-green-700 hover:bg-green-100' :
                                        booking.status === 'completed' ? 'bg-blue-100 text-blue-700 hover:bg-blue-100' :
                                            'bg-neutral-100 text-neutral-600 hover:bg-neutral-100'
                                    }`}>
                                    {booking.status.replace('_', ' ')}
                                </Badge>
                            </div>
                            <p className="text-neutral-500 font-bold text-sm">
                                {booking.service_type} Design • Submitted {formatDistanceToNow(new Date(booking.created_at), { addSuffix: true })}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-12">

                            {/* Negotiation Section */}
                            {(booking.status === 'quotation' || booking.status === 'verified') && (
                                <Card className="p-8 border-2 border-primary-50 bg-primary-50/20 rounded-[32px]">
                                    <div className="flex items-center gap-3 mb-8">
                                        <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                                            <DollarSign className="w-5 h-5 text-primary-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black text-neutral-900 uppercase tracking-tight">Price Negotiation</h3>
                                            <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Agree on a price to start</p>
                                        </div>
                                    </div>

                                    {booking.quotation_history?.length > 0 ? (
                                        <div className="space-y-6 mb-8">
                                            {booking.quotation_history.map((offer: any, idx: number) => (
                                                <div key={idx} className={`flex ${offer.role === 'customer' ? 'justify-end' : 'justify-start'}`}>
                                                    <div className={`max-w-[85%] p-6 rounded-3xl ${offer.role === 'customer' ? 'bg-neutral-900 text-white rounded-tr-none' : 'bg-white shadow-sm rounded-tl-none'}`}>
                                                        <p className="text-[10px] font-bold uppercase tracking-widest mb-2 opacity-70">{offer.role === 'customer' ? 'You' : 'Admin'}</p>
                                                        <p className="text-2xl font-black flex items-center gap-1 mb-2">
                                                            ৳{offer.amount.toLocaleString()}
                                                        </p>
                                                        {offer.notes && <p className="text-sm opacity-90 leading-relaxed">{offer.notes}</p>}
                                                        <p className="text-[10px] mt-4 opacity-40 text-right">{format(new Date(offer.date), 'MMM d, h:mm a')}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12 bg-white/50 rounded-3xl border border-dashed border-neutral-200 mb-8">
                                            <p className="text-neutral-400 font-bold">Waiting for initial quote from Admin...</p>
                                        </div>
                                    )}

                                    {/* Action Area */}
                                    {lastOffer?.role === 'admin' && (
                                        <div className="bg-white p-6 rounded-3xl shadow-sm">
                                            <h4 className="text-sm font-black text-neutral-900 uppercase tracking-widest mb-4">Respond to Offer</h4>

                                            <div className="flex flex-col gap-4">
                                                <Button size="lg" onClick={acceptOffer} className="w-full bg-green-600 hover:bg-green-700 text-white font-black uppercase tracking-widest h-14 rounded-2xl shadow-lg shadow-green-200">
                                                    Accept ৳{lastOffer.amount.toLocaleString()}
                                                </Button>

                                                <div className="relative my-2">
                                                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-neutral-200"></div></div>
                                                    <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-neutral-400 font-bold">Or Counter Offer</span></div>
                                                </div>

                                                <div className="flex gap-4">
                                                    <div className="relative flex-1">
                                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-neutral-400">৳</span>
                                                        <Input
                                                            type="number"
                                                            placeholder="Amount"
                                                            className="pl-8 font-black text-lg h-14 rounded-2xl border-neutral-200"
                                                            value={offerAmount}
                                                            onChange={(e) => setOfferAmount(e.target.value)}
                                                        />
                                                    </div>
                                                    <Button size="lg" onClick={sendCounterOffer} className="h-14 rounded-2xl bg-neutral-900 text-white font-black uppercase tracking-widest px-8">
                                                        Send
                                                    </Button>
                                                </div>
                                                <Textarea
                                                    placeholder="Add notes (optional)..."
                                                    className="rounded-2xl border-neutral-200 resize-none min-h-[80px]"
                                                    value={offerNote}
                                                    onChange={(e) => setOfferNote(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    )}
                                    {lastOffer?.role === 'customer' && (
                                        <div className="text-center py-4 bg-white/50 rounded-2xl border border-dashed text-neutral-400 font-bold text-sm">
                                            Waiting for admin response...
                                        </div>
                                    )}
                                </Card>
                            )}

                            {/* Milestones Section */}
                            {(booking.status === 'in_progress' || booking.status === 'completed') && (
                                <div>
                                    <h2 className="text-xl font-black text-neutral-900 tracking-tight uppercase italic flex items-center gap-2 mb-6">
                                        <Clock className="w-5 h-5 text-neutral-400" /> Project Timeline
                                    </h2>
                                    <div className="space-y-6 relative before:absolute before:left-4 before:top-4 before:bottom-4 before:w-0.5 before:bg-neutral-100">
                                        {milestones.map((milestone: any, idx: number) => {
                                            const isCompleted = milestone.status === 'completed';
                                            const isNext = !isCompleted && (idx === 0 || milestones[idx - 1].status === 'completed');

                                            return (
                                                <div key={idx} className="relative pl-12 group">
                                                    <div className={`absolute left-1.5 top-1.5 w-5 h-5 rounded-full border-4 transition-all duration-500 z-10 ${isCompleted ? 'border-primary-600 bg-primary-600' :
                                                            isNext ? 'border-primary-600 bg-white animate-pulse' : 'border-neutral-200 bg-white'
                                                        }`}>
                                                        {isCompleted && <Check className="w-3 h-3 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />}
                                                    </div>

                                                    <div className={`p-6 rounded-3xl border transition-all duration-300 ${isNext ? 'bg-primary-50/30 border-primary-200 shadow-md transform scale-[1.02]' :
                                                            isCompleted ? 'bg-white border-primary-100 opacity-80' : 'bg-white border-neutral-100 opacity-60'
                                                        }`}>
                                                        <div className="flex justify-between items-start mb-2">
                                                            <h3 className={`font-black text-lg ${isCompleted ? 'text-primary-800' : 'text-neutral-900'}`}>{milestone.name}</h3>
                                                            {isCompleted && <Badge className="bg-primary-100 text-primary-700 hover:bg-primary-100">Completed</Badge>}
                                                            {isNext && <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">In Progress</Badge>}
                                                        </div>
                                                        {milestone.due_date && (
                                                            <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-2">
                                                                <Calendar className="w-3 h-3" /> Due: {new Date(milestone.due_date).toLocaleDateString()}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {milestones.length === 0 && (
                                            <p className="text-neutral-400 pl-12 italic">Timeline will be updated by the admin soon.</p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right Column: Project Info */}
                        <div className="space-y-8">
                            <Card className="p-8 border-none bg-neutral-50 rounded-[32px]">
                                <h3 className="text-sm font-black text-neutral-900 uppercase tracking-widest mb-6">Project Details</h3>
                                <div className="space-y-4">
                                    {Object.entries(details).map(([key, value]) => {
                                        const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                                        let displayValue: any = value;
                                        if (typeof value === 'boolean') displayValue = value ? 'Yes' : 'No';
                                        if (Array.isArray(value)) displayValue = value.join(', ');
                                        if (!value) displayValue = '-';

                                        return (
                                            <div key={key} className="flex justify-between py-3 border-b border-neutral-200 last:border-0">
                                                <span className="text-xs font-bold text-neutral-500 uppercase tracking-widest">{formattedKey}</span>
                                                <span className="font-bold text-neutral-900 text-right">{displayValue}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </Card>

                            {booking.agreed_amount && (
                                <Card className="p-8 border-none bg-neutral-900 text-white rounded-[32px]">
                                    <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1">Agreed Price</p>
                                    <p className="text-4xl font-black">৳{booking.agreed_amount.toLocaleString()}</p>
                                </Card>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
