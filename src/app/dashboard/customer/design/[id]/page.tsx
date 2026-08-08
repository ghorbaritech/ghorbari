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
import { Separator } from "@/components/ui/separator";
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
            const { data: bookingData, error } = await supabase
                .from('design_bookings')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;

            // Fetch current user's profile
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('full_name, email, phone_number')
                    .eq('id', user.id)
                    .single();
                setBooking({ ...bookingData, profiles: profile });
            } else {
                setBooking(bookingData);
            }
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

                            {/* Negotiation & Quotation Section */}
                            {(booking.status === 'quotation' || booking.status === 'verified') && (
                                <div className="space-y-8">
                                    {/* If there is no quotation history yet */}
                                    {(!booking.quotation_history || booking.quotation_history.length === 0) && (
                                        <Card className="p-8 border border-neutral-100 shadow-sm bg-white rounded-[32px] text-center">
                                            <Clock className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                                            <h3 className="text-xl font-black text-neutral-900 mb-2">Preparing Your Quotation</h3>
                                            <p className="text-sm text-neutral-500 max-w-md mx-auto leading-relaxed font-bold">
                                                Our team has verified your requirements and is currently drafting a design proposal. You will receive an invoice proposal here shortly.
                                            </p>
                                        </Card>
                                    )}

                                    {/* Display Embedded Invoice if latest quote has line items, or fallback quote amount */}
                                    {booking.quotation_history?.length > 0 && (
                                        <div className="space-y-8">
                                            <div className="bg-white text-neutral-900 p-8 rounded-3xl shadow-lg border border-neutral-100">
                                                {/* Invoice Header */}
                                                <div className="flex justify-between items-start mb-8 pb-8 border-b border-neutral-200">
                                                    <div>
                                                        <div className="relative w-44 h-11 mb-3">
                                                            <img
                                                                src="/logo-dalankotha-dark.png"
                                                                alt="Dalan Kotha Logo"
                                                                className="object-contain object-left w-full h-full"
                                                            />
                                                        </div>
                                                        <p className="text-xs text-neutral-500 font-bold uppercase tracking-wide">Premium Design & Engineering Solutions</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <h2 className="text-xl font-black uppercase tracking-wider text-neutral-800">DESIGN PROPOSAL</h2>
                                                        <p className="text-xs text-neutral-400 font-bold uppercase mt-1">Ref: #DK-DSN-{booking.id.slice(0, 8)}</p>
                                                        <p className="text-xs text-neutral-400 font-bold uppercase">Date: {lastOffer?.date ? new Date(lastOffer.date).toLocaleDateString() : new Date().toLocaleDateString()}</p>
                                                    </div>
                                                </div>

                                                {/* Details */}
                                                <div className="grid grid-cols-2 gap-8 mb-8 pb-8 border-b border-neutral-200">
                                                    <div>
                                                        <h3 className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2">QUOTED TO:</h3>
                                                        <p className="font-extrabold text-sm text-neutral-800">{booking.profiles?.full_name || "Valued Client"}</p>
                                                        {booking.profiles?.email && <p className="text-xs text-neutral-500 font-medium mt-0.5">{booking.profiles.email}</p>}
                                                        {booking.profiles?.phone_number && <p className="text-xs text-neutral-500 font-medium mt-0.5">{booking.profiles.phone_number}</p>}
                                                    </div>
                                                    <div>
                                                        <h3 className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2">PREPARED BY:</h3>
                                                        <p className="font-extrabold text-sm text-neutral-800">Dalan Kotha Limited</p>
                                                        <p className="text-xs text-neutral-500 font-medium mt-0.5">Dhaka, Bangladesh</p>
                                                    </div>
                                                </div>

                                                {/* Line Items */}
                                                <div className="overflow-x-auto">
                                                    <table className="w-full text-left border-collapse mb-8 min-w-[500px]">
                                                        <thead>
                                                            <tr className="border-b border-neutral-300 bg-neutral-50 text-[10px] font-black text-neutral-500 uppercase tracking-wider">
                                                                <th className="py-3 px-4">#</th>
                                                                <th className="py-3 px-4">Item Description</th>
                                                                <th className="py-3 px-4">Unit</th>
                                                                <th className="py-3 px-4 text-right">Qty</th>
                                                                <th className="py-3 px-4 text-right">Unit Price</th>
                                                                <th className="py-3 px-4 text-right">Total Price</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {(lastOffer?.line_items || [
                                                                {
                                                                    description: lastOffer?.notes || "Design & Consultancy Services Quote",
                                                                    unit: "Project",
                                                                    quantity: 1,
                                                                    unitPrice: lastOffer?.amount,
                                                                    total: lastOffer?.amount
                                                                }
                                                            ]).map((item: any, idx: number) => (
                                                                <tr key={idx} className="border-b border-neutral-100 text-xs font-semibold text-neutral-800">
                                                                    <td className="py-4 px-4 text-neutral-400">{idx + 1}</td>
                                                                    <td className="py-4 px-4 font-bold text-neutral-900">{item.description}</td>
                                                                    <td className="py-4 px-4 text-neutral-500 uppercase tracking-wide">{item.unit || "-"}</td>
                                                                    <td className="py-4 px-4 text-right font-medium">{item.quantity}</td>
                                                                    <td className="py-4 px-4 text-right font-medium">৳{Number(item.unitPrice).toLocaleString()}</td>
                                                                    <td className="py-4 px-4 text-right font-bold text-neutral-900">৳{Number(item.total).toLocaleString()}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>

                                                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                                                    <div className="max-w-md">
                                                        {lastOffer?.notes && (
                                                            <>
                                                                <h4 className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1.5">Notes:</h4>
                                                                <p className="text-xs text-neutral-500 leading-relaxed font-semibold">{lastOffer.notes}</p>
                                                            </>
                                                        )}
                                                    </div>
                                                    <div className="text-right min-w-[200px] bg-neutral-50 p-4 rounded-xl border border-neutral-100 self-stretch md:self-auto flex flex-col justify-center">
                                                        <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block mb-1">TOTAL PROPOSAL AMOUNT</span>
                                                        <span className="text-2xl font-black text-neutral-900">৳{lastOffer?.amount.toLocaleString()}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Action Panel for Customer */}
                                            {lastOffer?.role === 'admin' ? (
                                                <div className="bg-white p-6 rounded-3xl border border-neutral-200 space-y-6">
                                                    <div className="flex flex-col sm:flex-row gap-4">
                                                        <Button
                                                            onClick={acceptOffer}
                                                            className="flex-1 h-14 bg-green-600 hover:bg-green-700 text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-lg shadow-green-900/10 flex items-center justify-center gap-2"
                                                        >
                                                            <Check className="w-4 h-4" /> Accept Proposal & Start Project
                                                        </Button>
                                                    </div>

                                                    <Separator />

                                                    <div className="space-y-4">
                                                        <Label className="text-xs font-black text-neutral-400 uppercase tracking-widest block">Or send a counter offer</Label>
                                                        <div className="flex gap-4">
                                                            <div className="flex-1">
                                                                <Input
                                                                    type="number"
                                                                    placeholder="Counter Offer Amount"
                                                                    className="font-black text-lg h-12 rounded-xl bg-neutral-50"
                                                                    value={offerAmount}
                                                                    onChange={(e) => setOfferAmount(e.target.value)}
                                                                />
                                                            </div>
                                                            <Button
                                                                onClick={sendCounterOffer}
                                                                className="h-12 bg-neutral-900 hover:bg-neutral-800 text-white font-black uppercase tracking-widest text-xs px-8 rounded-xl shrink-0"
                                                            >
                                                                Send Counter
                                                            </Button>
                                                        </div>
                                                        <Textarea
                                                            placeholder="Add your comments or request modifications..."
                                                            className="rounded-xl bg-neutral-50 resize-none min-h-[80px]"
                                                            value={offerNote}
                                                            onChange={(e) => setOfferNote(e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                            ) : (
                                                <Card className="p-6 border border-dashed border-neutral-200 bg-neutral-50/50 rounded-2xl text-center text-sm font-bold text-neutral-400">
                                                    Waiting for admin response... (You counter-offered ৳{lastOffer?.amount.toLocaleString()})
                                                </Card>
                                            )}
                                        </div>
                                    )}
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
                                        if (value && typeof value === 'object') {
                                            const obj = value as any;
                                            if (key === 'buildingDetails') {
                                                displayValue = `Floors: ${obj.floors || '-'}, Land Area: ${obj.landArea || '-'} ${obj.landAreaUnit || ''}`;
                                            } else {
                                                displayValue = JSON.stringify(value);
                                            }
                                        }
                                        if (!value) displayValue = '-';

                                        return (
                                            <div key={key} className="flex flex-col py-3 border-b border-neutral-200 last:border-0 gap-1">
                                                <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest">{formattedKey}</span>
                                                <span className="font-bold text-neutral-800 text-sm break-words">{String(displayValue)}</span>
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
