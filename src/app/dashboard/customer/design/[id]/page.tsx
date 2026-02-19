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
                                {booking.service_type?.charAt(0).toUpperCase() + booking.service_type?.slice(1)} Design • Submitted {formatDistanceToNow(new Date(booking.created_at), { addSuffix: true })}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-12">

                            {/* Booking Received / Pending Section */}
                            {!['quotation', 'verified', 'in_progress', 'completed'].includes(booking.status) && (
                                <Card className="p-8 border border-neutral-100 shadow-sm bg-white rounded-[32px]">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
                                            <Send className="w-6 h-6 text-blue-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-neutral-900 tracking-tight">Booking Received</h3>
                                            <p className="text-sm font-bold text-neutral-400">We're reviewing your project</p>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <p className="text-neutral-600 leading-relaxed">
                                            Thank you for your interest in our <strong>{booking.service_type?.charAt(0).toUpperCase() + booking.service_type?.slice(1)} Design</strong> services.
                                            Our team has received your details and is currently assessing your requirements.
                                        </p>

                                        <div className="bg-neutral-50 p-6 rounded-2xl border border-neutral-100">
                                            <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-widest mb-4">What happens next?</h4>
                                            <div className="space-y-4">
                                                <div className="flex gap-4">
                                                    <div className="flex flex-col items-center">
                                                        <div className="w-3 h-3 rounded-full bg-blue-600 ring-4 ring-blue-50"></div>
                                                        <div className="w-0.5 h-full bg-blue-100 my-1"></div>
                                                    </div>
                                                    <div className="pb-4">
                                                        <p className="text-sm font-bold text-neutral-900">Request Submitted</p>
                                                        <p className="text-xs text-neutral-500 mt-1">We have received your project details (today).</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-4">
                                                    <div className="flex flex-col items-center">
                                                        <div className="w-3 h-3 rounded-full bg-neutral-200"></div>
                                                        <div className="w-0.5 h-full bg-neutral-100 my-1"></div>
                                                    </div>
                                                    <div className="pb-4">
                                                        <p className="text-sm font-bold text-neutral-400">Admin Review</p>
                                                        <p className="text-xs text-neutral-400 mt-1">Our experts will analyze your requirements.</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-4">
                                                    <div className="flex flex-col items-center">
                                                        <div className="w-3 h-3 rounded-full bg-neutral-200"></div>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-neutral-400">Quotation</p>
                                                        <p className="text-xs text-neutral-400 mt-1">You'll receive a custom quote shortly.</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 text-xs text-neutral-400 font-medium bg-blue-50/50 p-3 rounded-lg text-blue-600 w-fit">
                                            <Clock className="w-4 h-4" />
                                            Typical response time: 24-48 hours
                                        </div>
                                    </div>
                                </Card>
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
