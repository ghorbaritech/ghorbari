"use client"

export const dynamic = 'force-dynamic'

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { 
    ArrowLeft, Check, Clock, Calendar, DollarSign, Send, XCircle, 
    CheckCircle2, FileText, Download, UserCheck, Sparkles, ShieldCheck, 
    MapPin, Building, ChevronRight, FileSpreadsheet, AlertCircle 
} from "lucide-react";
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

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-8">
                <div className="text-center space-y-4">
                    <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-xs font-black uppercase tracking-widest text-neutral-400">Loading Order Details...</p>
                </div>
            </div>
        );
    }

    if (!booking) return <div className="p-8 text-neutral-500 font-bold">Order not found.</div>;

    // Filter out internal/complex objects from details so raw JSON is NEVER displayed
    const rawDetails = booking.details || {};
    const detailsKeysToExclude = ['survey_requests', 'quotation_history', 'milestones'];
    const cleanDetails = Object.entries(rawDetails).filter(([k]) => !detailsKeysToExclude.includes(k));

    const surveyRequests: any[] = rawDetails.survey_requests || [];
    const milestones: any[] = booking.milestones || [];
    
    // CUSTOMER ONLY SEES QUOTES SENT BY ADMIN (from quotation_history)
    const adminOffers = (booking.quotation_history || []).filter((o: any) => o.role === 'admin' || o.role === 'customer');
    const lastAdminOffer = (booking.quotation_history || []).filter((o: any) => o.role === 'admin').pop();
    const lastOffer = booking.quotation_history?.length > 0 ? booking.quotation_history[booking.quotation_history.length - 1] : null;

    // Order Progress Stage Determination
    const hasSurvey = surveyRequests.length > 0;
    const isSurveyAccepted = surveyRequests.some((r: any) => r.status === 'accepted');
    const isQuoted = !!lastAdminOffer || ['quotation', 'in_progress', 'completed'].includes(booking.status);
    const isAcceptedOrHired = !!booking.agreed_amount || ['in_progress', 'completed'].includes(booking.status);

    return (
        <div className="min-h-screen bg-[#F8F9FA] p-4 md:p-10 font-sans">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Back Button */}
                <Link href="/dashboard/customer">
                    <Button variant="ghost" className="pl-0 hover:bg-transparent hover:text-primary-600 text-xs font-black uppercase tracking-widest text-neutral-500">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
                    </Button>
                </Link>

                {/* Hero Header Card */}
                <div className="bg-white rounded-[32px] p-6 md:p-10 shadow-sm border border-neutral-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary-50/50 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
                    
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                        <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-3">
                                <h1 className="text-2xl md:text-3xl font-black text-neutral-900 tracking-tight">
                                    Design Order #{booking.id.slice(0, 8)}
                                </h1>
                                <Badge className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border-none ${
                                    booking.status === 'in_progress' ? 'bg-emerald-100 text-emerald-800' :
                                    booking.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                                    booking.status === 'quotation' ? 'bg-amber-100 text-amber-800' :
                                    'bg-neutral-100 text-neutral-700'
                                }`}>
                                    ● {booking.status?.replace('_', ' ')}
                                </Badge>
                            </div>
                            <p className="text-xs font-bold text-neutral-500 flex items-center gap-2">
                                <Building className="w-3.5 h-3.5 text-neutral-400" />
                                {booking.service_type?.charAt(0).toUpperCase() + booking.service_type?.slice(1)} Design
                                <span>•</span>
                                <span>Placed {formatDistanceToNow(new Date(booking.created_at), { addSuffix: true })}</span>
                            </p>
                        </div>

                        {booking.agreed_amount && (
                            <div className="bg-neutral-900 text-white px-6 py-4 rounded-2xl border border-neutral-800 text-right">
                                <p className="text-[9px] font-black uppercase tracking-widest text-neutral-400">Total Agreed Price</p>
                                <p className="text-2xl font-black text-emerald-400">৳{booking.agreed_amount.toLocaleString()}</p>
                            </div>
                        )}
                    </div>

                    {/* Progress Bar Header */}
                    <div className="mt-8 pt-8 border-t border-neutral-100 grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-emerald-600">
                                <CheckCircle2 className="w-4 h-4" />
                                <span className="text-[10px] font-black uppercase tracking-wider">Step 1</span>
                            </div>
                            <p className="text-xs font-bold text-neutral-900">Order Placed</p>
                        </div>
                        <div className="space-y-1">
                            <div className={`flex items-center gap-2 ${isSurveyAccepted ? 'text-emerald-600' : 'text-neutral-400'}`}>
                                {isSurveyAccepted ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                                <span className="text-[10px] font-black uppercase tracking-wider">Step 2</span>
                            </div>
                            <p className={`text-xs font-bold ${isSurveyAccepted ? 'text-neutral-900' : 'text-neutral-400'}`}>Site Survey</p>
                        </div>
                        <div className="space-y-1">
                            <div className={`flex items-center gap-2 ${isQuoted ? 'text-emerald-600' : 'text-neutral-400'}`}>
                                {isQuoted ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                                <span className="text-[10px] font-black uppercase tracking-wider">Step 3</span>
                            </div>
                            <p className={`text-xs font-bold ${isQuoted ? 'text-neutral-900' : 'text-neutral-400'}`}>Official Quote</p>
                        </div>
                        <div className="space-y-1">
                            <div className={`flex items-center gap-2 ${isAcceptedOrHired ? 'text-emerald-600' : 'text-neutral-400'}`}>
                                {isAcceptedOrHired ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                                <span className="text-[10px] font-black uppercase tracking-wider">Step 4</span>
                            </div>
                            <p className={`text-xs font-bold ${isAcceptedOrHired ? 'text-neutral-900' : 'text-neutral-400'}`}>Execution</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left 2 Columns: Lifecycle Timeline & Official Price Quotation */}
                    <div className="lg:col-span-2 space-y-8">
                        
                        {/* 1. ORDER MILESTONE TIMELINE */}
                        <Card className="p-6 md:p-8 rounded-[32px] border border-neutral-100 bg-white shadow-sm">
                            <h2 className="text-sm font-black uppercase tracking-widest text-neutral-900 mb-6 flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-primary-600" /> Order Lifecycle & Progress
                            </h2>

                            <div className="space-y-8 relative before:absolute before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-neutral-100">
                                
                                {/* Milestone 1: Order Placed */}
                                <div className="relative pl-10">
                                    <div className="absolute left-0 top-0.5 w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-black shadow-md shadow-emerald-500/20">
                                        ✓
                                    </div>
                                    <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-100">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-extrabold text-sm text-neutral-900">Order Placed</p>
                                                <p className="text-xs text-neutral-500 mt-0.5 font-medium">Design request submitted to Dalan Kotha Engineering team.</p>
                                            </div>
                                            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                                                {format(new Date(booking.created_at), 'MMM d, yyyy')}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Milestone 2: Site Survey */}
                                <div className="relative pl-10">
                                    <div className={`absolute left-0 top-0.5 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shadow-md ${
                                        isSurveyAccepted ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-amber-400 text-neutral-900 shadow-amber-400/20'
                                    }`}>
                                        {isSurveyAccepted ? '✓' : '2'}
                                    </div>
                                    <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-100 space-y-2">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-extrabold text-sm text-neutral-900">Site Survey & Measurements</p>
                                                <p className="text-xs text-neutral-500 mt-0.5 font-medium">
                                                    {isSurveyAccepted 
                                                        ? 'Site survey scheduled & completed by Dalan Kotha survey team.'
                                                        : 'Survey request initiated with field engineers.'}
                                                </p>
                                            </div>
                                            <Badge className={`text-[9px] font-black uppercase border-none ${
                                                isSurveyAccepted ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                            }`}>
                                                {isSurveyAccepted ? 'Completed' : 'Scheduled'}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>

                                {/* Milestone 3: Official Quotation Received */}
                                <div className="relative pl-10">
                                    <div className={`absolute left-0 top-0.5 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shadow-md ${
                                        isQuoted ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-neutral-200 text-neutral-500'
                                    }`}>
                                        {isQuoted ? '✓' : '3'}
                                    </div>
                                    <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-100 space-y-2">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-extrabold text-sm text-neutral-900">Price Quotation Received</p>
                                                <p className="text-xs text-neutral-500 mt-0.5 font-medium">
                                                    {lastAdminOffer 
                                                        ? `Official price quote of ৳${lastAdminOffer.amount?.toLocaleString()} provided by Dalan Kotha.`
                                                        : 'Engineers are preparing your official price proposal.'}
                                                </p>
                                            </div>
                                            {isQuoted && (
                                                <Badge className="bg-blue-100 text-blue-700 text-[9px] font-black uppercase border-none">
                                                    Quoted
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Milestone 4: Proposal Accepted */}
                                <div className="relative pl-10">
                                    <div className={`absolute left-0 top-0.5 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shadow-md ${
                                        isAcceptedOrHired ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-neutral-200 text-neutral-500'
                                    }`}>
                                        {isAcceptedOrHired ? '✓' : '4'}
                                    </div>
                                    <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-100">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-extrabold text-sm text-neutral-900">Quotation Accepted & Project Active</p>
                                                <p className="text-xs text-neutral-500 mt-0.5 font-medium">
                                                    {isAcceptedOrHired ? 'Proposal accepted! Project execution in progress.' : 'Pending customer review and acceptance.'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </Card>

                        {/* 2. OFFICIAL ADMIN PRICE QUOTATION & INVOICE */}
                        <Card className="p-6 md:p-8 rounded-[32px] border border-neutral-100 bg-white shadow-sm space-y-6">
                            <div className="flex justify-between items-center pb-6 border-b border-neutral-100">
                                <div>
                                    <h2 className="text-sm font-black uppercase tracking-widest text-neutral-900 flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-primary-600" /> Official Price Quotation
                                    </h2>
                                    <p className="text-xs text-neutral-400 font-bold mt-1">Verified price proposal from Dalan Kotha Management</p>
                                </div>
                            </div>

                            {/* If Admin has sent an official quote (lastAdminOffer or lastOffer) */}
                            {lastAdminOffer ? (
                                <div className="space-y-6">
                                    <div className="bg-neutral-900 text-white p-6 md:p-8 rounded-3xl space-y-6 shadow-xl border border-neutral-800">
                                        {/* Invoice Header */}
                                        <div className="flex justify-between items-start pb-6 border-b border-neutral-800">
                                            <div>
                                                <p className="text-xs font-black uppercase tracking-widest text-emerald-400">DALANKOTHA OFFICIAL QUOTE</p>
                                                <p className="text-xs text-neutral-400 font-medium mt-1">Ref: #DK-DSN-{booking.id.slice(0, 8)}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">TOTAL AMOUNT</p>
                                                <p className="text-3xl font-black text-emerald-400 mt-0.5">৳{lastAdminOffer.amount?.toLocaleString()}</p>
                                            </div>
                                        </div>

                                        {/* Line Items Table if Admin sent line items */}
                                        {lastAdminOffer.line_items?.length > 0 && (
                                            <div className="space-y-2">
                                                <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">Scope Breakdown</p>
                                                <div className="bg-neutral-950 rounded-2xl overflow-hidden border border-neutral-800">
                                                    <table className="w-full text-xs text-left">
                                                        <thead>
                                                            <tr className="border-b border-neutral-800 text-[9px] font-black text-neutral-500 uppercase">
                                                                <th className="p-3">Description</th>
                                                                <th className="p-3 text-center">Unit</th>
                                                                <th className="p-3 text-right">Qty</th>
                                                                <th className="p-3 text-right">Rate</th>
                                                                <th className="p-3 text-right">Total</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {lastAdminOffer.line_items.map((item: any, i: number) => (
                                                                <tr key={i} className="border-b border-neutral-800/60 last:border-0 font-medium text-neutral-300">
                                                                    <td className="p-3 font-semibold text-white">{item.description}</td>
                                                                    <td className="p-3 text-center text-neutral-400">{item.unit || 'sft'}</td>
                                                                    <td className="p-3 text-right text-neutral-400">{item.quantity}</td>
                                                                    <td className="p-3 text-right text-neutral-400">৳{Number(item.unitPrice || 0).toLocaleString()}</td>
                                                                    <td className="p-3 text-right font-black text-white">৳{(Number(item.quantity||0)*Number(item.unitPrice||0)).toLocaleString()}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        )}

                                        {/* Notes / Remarks */}
                                        {lastAdminOffer.notes && (
                                            <div className="bg-neutral-800/50 p-4 rounded-2xl text-xs text-neutral-300 leading-relaxed">
                                                <span className="text-[9px] font-black text-neutral-500 uppercase block mb-1">Deliverable Notes & Terms</span>
                                                {lastAdminOffer.notes}
                                            </div>
                                        )}

                                        {/* Download PDF Attachment if available */}
                                        {lastAdminOffer.file_url && (
                                            <a
                                                href={lastAdminOffer.file_url.startsWith('http') ? lastAdminOffer.file_url : '#'}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                download
                                                className="flex items-center gap-2 bg-blue-600/20 border border-blue-600/30 rounded-xl px-4 py-3 text-blue-300 font-bold text-xs hover:bg-blue-600/30 transition-colors w-fit"
                                            >
                                                <Download className="w-4 h-4" />
                                                Download Official Quote Document ({lastAdminOffer.file_url.split('/').pop() || 'Quotation.pdf'})
                                            </a>
                                        )}

                                        <p className="text-[9px] text-neutral-500 font-bold text-right uppercase tracking-widest">
                                            Issued: {lastAdminOffer.date ? format(new Date(lastAdminOffer.date), 'MMM d, yyyy h:mm a') : '-'}
                                        </p>
                                    </div>

                                    {/* Action Buttons for Customer if Quotation Pending */}
                                    {booking.status === 'quotation' && (
                                        <div className="space-y-6 pt-2">
                                            <Button
                                                onClick={acceptOffer}
                                                className="w-full h-14 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-lg flex items-center justify-center gap-2"
                                            >
                                                <Check className="w-4 h-4" /> Accept Proposal & Start Execution (৳{lastAdminOffer.amount?.toLocaleString()})
                                            </Button>

                                            <div className="space-y-3 p-5 bg-neutral-50 rounded-2xl border border-neutral-200">
                                                <Label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block">Send Counter Offer</Label>
                                                <div className="flex gap-3">
                                                    <Input
                                                        type="number"
                                                        placeholder="Counter Offer Amount (৳)"
                                                        className="font-black text-sm h-11 bg-white"
                                                        value={offerAmount}
                                                        onChange={(e) => setOfferAmount(e.target.value)}
                                                    />
                                                    <Button onClick={sendCounterOffer} className="h-11 bg-neutral-900 text-white font-black uppercase text-xs px-6 rounded-xl shrink-0">
                                                        Send Counter
                                                    </Button>
                                                </div>
                                                <Textarea
                                                    placeholder="Add any remarks or scope changes..."
                                                    className="rounded-xl bg-white text-xs"
                                                    value={offerNote}
                                                    onChange={(e) => setOfferNote(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {lastOffer?.role === 'customer' && (
                                        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 text-center text-xs font-bold text-amber-800">
                                            Counter offer of ৳{lastOffer.amount?.toLocaleString()} submitted. Awaiting Dalan Kotha response.
                                        </div>
                                    )}
                                </div>
                            ) : (
                                /* Placeholder when admin hasn't sent the quote yet */
                                <div className="p-10 bg-neutral-50 rounded-3xl border border-dashed border-neutral-200 text-center space-y-3">
                                    <Clock className="w-10 h-10 text-amber-500 mx-auto" />
                                    <h3 className="text-base font-black text-neutral-900">Preparing Your Price Quote</h3>
                                    <p className="text-xs text-neutral-500 max-w-md mx-auto leading-relaxed font-medium">
                                        Our engineering team has received your survey details and is calculating the official price proposal. You will receive your quote breakdown here shortly.
                                    </p>
                                </div>
                            )}
                        </Card>

                        {/* 3. CURRENT WORK STATUS & MILESTONE TRACKER */}
                        {booking.status === 'in_progress' && (
                            <Card className="p-6 md:p-8 rounded-[32px] border border-neutral-100 bg-white shadow-sm space-y-6">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-sm font-black uppercase tracking-widest text-neutral-900 flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-emerald-600" /> Work Status & Project Milestones
                                    </h2>
                                    <Badge className="bg-emerald-100 text-emerald-800 text-[9px] font-black uppercase border-none">
                                        In Progress
                                    </Badge>
                                </div>

                                <div className="space-y-4">
                                    {milestones.length === 0 ? (
                                        <div className="p-6 bg-neutral-50 rounded-2xl border border-neutral-100 text-center space-y-1">
                                            <p className="text-xs font-bold text-neutral-700">Project Started</p>
                                            <p className="text-[10px] text-neutral-400 font-medium">Your design team is preparing your project milestone roadmap.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {milestones.map((m: any, idx: number) => (
                                                <div key={idx} className="bg-neutral-50 p-4 rounded-2xl border border-neutral-100 flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                                                            m.status === 'completed' ? 'bg-emerald-500 text-white' : 'bg-neutral-200 text-neutral-500'
                                                        }`}>
                                                            {m.status === 'completed' ? '✓' : idx + 1}
                                                        </div>
                                                        <div>
                                                            <p className={`text-xs font-extrabold ${m.status === 'completed' ? 'line-through text-neutral-400' : 'text-neutral-900'}`}>
                                                                {m.name}
                                                            </p>
                                                            {m.due_date && (
                                                                <p className="text-[9px] text-neutral-400 font-bold uppercase">
                                                                    Due: {m.due_date}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <Badge className={`text-[8px] font-black uppercase border-none ${
                                                        m.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                                    }`}>
                                                        {m.status || 'Pending'}
                                                    </Badge>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </Card>
                        )}

                    </div>

                    {/* Right Column: Project Info & Requirements */}
                    <div className="space-y-8">
                        {/* Hired / Agreed Price Card */}
                        {booking.agreed_amount && (
                            <Card className="p-6 rounded-[28px] bg-neutral-900 text-white space-y-4 border border-neutral-800">
                                <div className="flex items-center gap-2 text-emerald-400">
                                    <ShieldCheck className="w-4 h-4" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Active Execution</span>
                                </div>
                                <div>
                                    <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">Agreed Contract Price</p>
                                    <p className="text-3xl font-black text-white mt-1">৳{booking.agreed_amount.toLocaleString()}</p>
                                </div>
                                <div className="pt-3 border-t border-neutral-800 text-[10px] text-neutral-400 font-medium">
                                    Your project is being executed by Dalan Kotha engineering team.
                                </div>
                            </Card>
                        )}

                        {/* Filtered Clean Project Requirements */}
                        <Card className="p-6 rounded-[28px] border border-neutral-100 bg-white shadow-sm space-y-6">
                            <h3 className="text-xs font-black uppercase tracking-widest text-neutral-900 flex items-center gap-2">
                                <Building className="w-4 h-4 text-primary-600" /> Project Requirements
                            </h3>

                            <div className="space-y-4">
                                {cleanDetails.map(([key, value]) => {
                                    const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                                    let displayValue: any = value;

                                    if (typeof value === 'boolean') displayValue = value ? 'Yes' : 'No';
                                    else if (Array.isArray(value)) displayValue = value.join(', ');
                                    else if (value && typeof value === 'object') {
                                        const obj = value as any;
                                        if (key === 'buildingDetails') {
                                            displayValue = `Floors: ${obj.floors || '-'}, Area: ${obj.landArea || '-'} ${obj.landAreaUnit || ''}`;
                                        } else {
                                            displayValue = null; // Skip non-form objects
                                        }
                                    }

                                    if (!displayValue || displayValue === 'null') return null;

                                    return (
                                        <div key={key} className="flex flex-col py-2.5 border-b border-neutral-100 last:border-0">
                                            <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">{formattedKey}</span>
                                            <span className="font-bold text-neutral-900 text-xs mt-0.5 break-words">{String(displayValue)}</span>
                                        </div>
                                    );
                                })}

                                {cleanDetails.length === 0 && (
                                    <p className="text-xs text-neutral-400 font-medium italic">Standard interior design request.</p>
                                )}
                            </div>
                        </Card>

                        {/* Customer Support Card */}
                        <Card className="p-6 rounded-[28px] bg-primary-50/40 border border-primary-100 space-y-3">
                            <h4 className="text-xs font-black text-primary-900 uppercase tracking-wider">Need Assistance?</h4>
                            <p className="text-xs text-neutral-600 leading-relaxed font-medium">
                                Have questions about your price quote or site survey schedule? Reach out directly to our engineering support desk.
                            </p>
                            <Link href="/dashboard/customer/messages">
                                <Button className="w-full mt-2 h-10 bg-primary-600 hover:bg-primary-700 text-white font-black text-[10px] uppercase tracking-widest rounded-xl">
                                    Message Support
                                </Button>
                            </Link>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
