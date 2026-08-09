"use client"

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Flag, Calendar, ClipboardList, CheckCircle2, XCircle } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from 'next/link';
import { format } from "date-fns";

export default function DesignerSurveyDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [booking, setBooking] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    const [partnerInfo, setPartnerInfo] = useState<any>(null);
    const [partnerLineItems, setPartnerLineItems] = useState<any[]>([]);

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
            setBooking(bookingData);

            // Fetch current user details
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                // Check if user is a designer
                const { data: designer } = await supabase
                    .from('designers')
                    .select('id, company_name')
                    .eq('user_id', user.id)
                    .maybeSingle();

                // Check if user is a seller
                const { data: seller } = await supabase
                    .from('sellers')
                    .select('id, business_name')
                    .eq('user_id', user.id)
                    .maybeSingle();

                const partnerId = designer?.id || seller?.id;
                const partnerName = designer?.company_name || seller?.business_name || 'Partner';
                const info = { id: partnerId, name: partnerName, userId: user.id };
                setPartnerInfo(info);

                // Find if there is a survey request (by partner_user_id OR partner_id)
                const request = bookingData.details?.survey_requests?.find((r: any) => 
                    r.partner_user_id === user.id || (partnerId && r.partner_id === partnerId)
                );
                if (request) {
                    if (request.quote?.line_items) {
                        setPartnerLineItems(request.quote.line_items);
                    } else {
                        // Pre-populate from admin detailed proposal
                        const adminProposal = bookingData.quotation_history?.slice().reverse().find((o: any) => o.role === 'admin' && o.line_items);
                        if (adminProposal?.line_items) {
                            setPartnerLineItems(adminProposal.line_items.map((li: any) => ({
                                description: li.description,
                                unit: li.unit,
                                quantity: li.quantity,
                                unitPrice: 0,
                                total: 0
                            })));
                        }
                    }
                }
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    function getMyRequest() {
        if (!partnerInfo || !booking) return null;
        return booking.details?.survey_requests?.find((r: any) =>
            r.partner_user_id === partnerInfo.userId || (partnerInfo.id && r.partner_id === partnerInfo.id)
        );
    }

    async function respondToSurveyRequest(accept: boolean) {
        const request = getMyRequest();
        if (!request || !partnerInfo) return;

        const updatedRequests = booking.details.survey_requests.map((r: any) => {
            const isMe = r.partner_user_id === partnerInfo.userId || (partnerInfo.id && r.partner_id === partnerInfo.id);
            return isMe ? { ...r, status: accept ? 'accepted' : 'declined' } : r;
        });

        const updatedDetails = { ...booking.details, survey_requests: updatedRequests };

        const { error } = await supabase
            .from('design_bookings')
            .update({ details: updatedDetails })
            .eq('id', id);

        if (!error) {
            setBooking({ ...booking, details: updatedDetails });
            alert(`Survey request ${accept ? 'accepted' : 'declined'} successfully!`);

            if (accept) {
                await supabase.from('notifications').insert({
                    user_id: booking.user_id,
                    title: 'Partner Accepted Survey',
                    message: `${partnerInfo.name} has accepted the survey request scheduled for ${request.schedule?.date}.`,
                    link: `/dashboard/customer/design/${id}`,
                    is_read: false
                });
            }
        } else {
            alert("Failed to respond to survey request: " + error.message);
        }
    }

    async function submitSurveyQuote() {
        const request = getMyRequest();
        if (!request || !partnerInfo) return;

        const totalAmount = partnerLineItems.reduce((sum, item) => sum + (Number(item.quantity || 0) * Number(item.unitPrice || 0)), 0);

        if (!totalAmount) {
            alert("Please enter unit prices to construct a quote.");
            return;
        }

        const quoteObj = {
            amount: totalAmount,
            line_items: partnerLineItems,
            date: new Date().toISOString()
        };

        const updatedRequests = booking.details.survey_requests.map((r: any) => {
            const isMe = r.partner_user_id === partnerInfo.userId || (partnerInfo.id && r.partner_id === partnerInfo.id);
            return isMe ? { ...r, quote: quoteObj } : r;
        });

        const updatedDetails = { ...booking.details, survey_requests: updatedRequests };

        const { error } = await supabase
            .from('design_bookings')
            .update({ details: updatedDetails })
            .eq('id', id);

        if (!error) {
            setBooking({ ...booking, details: updatedDetails });
            alert("Your quote has been successfully submitted to the admin!");
        } else {
            alert("Failed to submit quote: " + error.message);
        }
    }

    const updatePartnerRate = (index: number, rate: number) => {
        const items = [...partnerLineItems];
        items[index].unitPrice = rate;
        items[index].total = Number(items[index].quantity || 0) * Number(rate || 0);
        setPartnerLineItems(items);
    };

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin w-8 h-8 border-2 border-neutral-900 border-t-transparent rounded-full" />
            </div>
        );
    }
    
    if (!booking) {
        return (
            <div className="p-8 text-center">
                <p className="text-neutral-500 font-bold">Booking not found or you don't have access to it.</p>
                <Link href="/dashboard/designer/projects">
                    <Button className="mt-4">← Back to Projects</Button>
                </Link>
            </div>
        );
    }

    const details = booking.details || {};
    const milestones = booking.milestones || [];
    const surveyReq = getMyRequest();

    return (
        <div className="p-6 md:p-8 space-y-8">
            <div className="flex items-center gap-3">
                <Link href="/dashboard/designer/projects">
                    <Button variant="ghost" className="pl-0 hover:bg-transparent hover:text-neutral-600">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Projects
                    </Button>
                </Link>
            </div>

            {/* Header */}
            <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-2xl font-black text-neutral-900 tracking-tight">
                                Design Project #{booking.id.slice(0, 8).toUpperCase()}
                            </h1>
                            <Badge className="bg-neutral-900 text-white text-xs uppercase tracking-widest">
                                {booking.service_type || 'Design'}
                            </Badge>
                        </div>
                        <p className="text-neutral-500 text-sm font-semibold">
                            Submitted {booking.created_at ? format(new Date(booking.created_at), 'MMM d, yyyy') : '-'}
                        </p>
                    </div>
                    <Badge className={`text-xs font-black uppercase px-4 py-1.5 ${
                        booking.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                        booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                        'bg-amber-100 text-amber-800'
                    }`}>
                        {booking.status?.replace(/_/g, ' ')}
                    </Badge>
                </div>
            </div>

            {/* Survey Request Card */}
            {surveyReq ? (
                <div className="bg-neutral-900 text-white rounded-2xl p-8 shadow-xl space-y-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <Badge className="bg-emerald-600 text-white uppercase tracking-widest text-[9px] font-black px-3 py-1 mb-3">
                                Survey Request
                            </Badge>
                            <h2 className="text-xl font-black italic uppercase text-white tracking-tight">
                                Site Survey & Quoting
                            </h2>
                            <p className="text-xs text-neutral-400 font-bold mt-2 flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5" />
                                Scheduled: {surveyReq.schedule?.date} @ {surveyReq.schedule?.time}
                            </p>
                        </div>
                        <Badge className={`text-[10px] font-black uppercase px-3 py-1 border-none ${
                            surveyReq.status === 'accepted' ? 'bg-green-600 text-white' :
                            surveyReq.status === 'declined' ? 'bg-red-600 text-white' :
                            'bg-amber-600 text-white'
                        }`}>
                            {surveyReq.status}
                        </Badge>
                    </div>

                    {/* Pending Actions */}
                    {surveyReq.status === 'pending' && (
                        <div className="space-y-4 bg-neutral-800/50 rounded-xl p-6">
                            <p className="text-neutral-300 text-sm leading-relaxed">
                                You have been invited to perform an on-site survey for this project. Please confirm your availability for the scheduled date and time above.
                            </p>
                            <div className="flex gap-3">
                                <Button
                                    onClick={() => respondToSurveyRequest(true)}
                                    className="flex-1 h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-widest text-xs rounded-xl"
                                >
                                    <CheckCircle2 className="w-4 h-4 mr-2" /> Accept Survey
                                </Button>
                                <Button
                                    onClick={() => respondToSurveyRequest(false)}
                                    variant="outline"
                                    className="flex-1 h-12 border-neutral-700 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white font-black uppercase tracking-widest text-xs rounded-xl"
                                >
                                    <XCircle className="w-4 h-4 mr-2" /> Decline
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Quote Submission After Acceptance */}
                    {surveyReq.status === 'accepted' && (
                        <div className="space-y-6 pt-4 border-t border-neutral-800">
                            <div>
                                <h3 className="text-sm font-black text-blue-400 uppercase tracking-widest mb-1">
                                    {surveyReq.quote ? '✓ Quote Submitted' : 'Submit Your Quote'}
                                </h3>
                                <p className="text-neutral-400 text-xs leading-relaxed">
                                    {surveyReq.quote 
                                        ? `Your total bid of ৳${surveyReq.quote.amount?.toLocaleString()} has been submitted to the admin. You can update it below if needed.`
                                        : 'Enter your unit rates for each scope item. The admin will compile these into a comparison for the customer.'
                                    }
                                </p>
                            </div>

                            {partnerLineItems.length > 0 ? (
                                <div className="space-y-4">
                                    {partnerLineItems.map((item, idx) => (
                                        <div key={idx} className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div className="flex-1">
                                                <p className="text-sm font-bold text-neutral-100">{item.description}</p>
                                                <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mt-0.5">
                                                    Unit: {item.unit || '-'} | Qty: {item.quantity}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-3 shrink-0">
                                                <div className="w-36">
                                                    <Label className="text-[9px] font-bold text-neutral-500 uppercase block mb-1 text-right">Your Rate (৳)</Label>
                                                    <input
                                                        type="number"
                                                        value={item.unitPrice || ""}
                                                        onChange={(e) => updatePartnerRate(idx, Number(e.target.value))}
                                                        className="w-full bg-neutral-900 border border-neutral-700 text-white font-black text-right text-sm rounded-lg h-10 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        placeholder="Rate"
                                                    />
                                                </div>
                                                <div className="w-28 text-right pt-4">
                                                    <span className="text-[10px] text-neutral-500 block uppercase font-bold">Total</span>
                                                    <span className="font-black text-sm text-neutral-200">
                                                        ৳{(Number(item.quantity || 0) * Number(item.unitPrice || 0)).toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    <div className="flex justify-between items-center bg-neutral-950 p-5 rounded-xl border border-neutral-800">
                                        <div>
                                            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block">Grand Total Bid</span>
                                            <span className="text-2xl font-black text-emerald-400">
                                                ৳{partnerLineItems.reduce((sum, item) => sum + (Number(item.quantity || 0) * Number(item.unitPrice || 0)), 0).toLocaleString()}
                                            </span>
                                        </div>
                                        <Button
                                            onClick={submitSurveyQuote}
                                            className="h-12 px-8 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-xs rounded-xl"
                                        >
                                            {surveyReq.quote ? 'Update Quote' : 'Submit Quote'}
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-6 bg-neutral-950 border border-dashed border-neutral-800 rounded-xl text-center text-xs font-bold text-neutral-500 italic">
                                    The admin hasn't defined line items yet. Check back soon.
                                </div>
                            )}
                        </div>
                    )}

                    {surveyReq.status === 'declined' && (
                        <div className="p-4 bg-red-950/40 border border-red-900 rounded-xl text-sm text-red-400 font-bold text-center">
                            You have declined this survey request.
                        </div>
                    )}
                </div>
            ) : (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center">
                    <p className="text-amber-700 font-bold text-sm">No survey request found for your account on this project.</p>
                </div>
            )}

            {/* Project Details + Milestones */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Milestones */}
                <div className="space-y-4">
                    <h2 className="text-lg font-black text-neutral-900 tracking-tight uppercase flex items-center gap-2">
                        <Flag className="w-5 h-5 text-neutral-400" /> Milestone Tracker
                    </h2>
                    {milestones.length === 0 ? (
                        <p className="text-neutral-400 italic text-sm">No milestones set by admin yet.</p>
                    ) : (
                        <div className="space-y-3">
                            {milestones.map((milestone: any, idx: number) => {
                                const isCompleted = milestone.status === 'completed';
                                return (
                                    <Card key={idx} className={`p-5 border-none bg-neutral-50 rounded-2xl ${isCompleted ? 'opacity-50' : ''}`}>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-black text-neutral-900">{milestone.name}</h3>
                                                {milestone.due_date && (
                                                    <p className="text-xs font-bold text-neutral-400 flex items-center gap-1 mt-1">
                                                        <Calendar className="w-3 h-3" /> Due: {new Date(milestone.due_date).toLocaleDateString()}
                                                    </p>
                                                )}
                                            </div>
                                            <Badge className={isCompleted ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}>
                                                {milestone.status}
                                            </Badge>
                                        </div>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Requirements */}
                <div>
                    <Card className="p-6 border-none bg-neutral-50 rounded-2xl">
                        <h3 className="text-sm font-black text-neutral-900 uppercase tracking-widest mb-5 flex items-center gap-2">
                            <ClipboardList className="w-4 h-4" /> Project Requirements
                        </h3>
                        <div className="space-y-3">
                            {Object.entries(details).filter(([key]) => key !== 'survey_requests').map(([key, value]) => {
                                const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                                let displayValue: any = value;
                                if (typeof value === 'boolean') displayValue = value ? 'Yes' : 'No';
                                if (Array.isArray(value)) displayValue = value.join(', ');
                                if (value && typeof value === 'object' && !Array.isArray(value)) {
                                    displayValue = Object.entries(value as object)
                                        .map(([k, v]) => `${k}: ${v}`)
                                        .join(' | ');
                                }
                                if (!value) displayValue = '-';

                                return (
                                    <div key={key} className="flex justify-between py-2.5 border-b border-neutral-200 last:border-0 gap-4">
                                        <span className="text-xs font-bold text-neutral-500 uppercase tracking-widest shrink-0">{formattedKey}</span>
                                        <span className="font-bold text-neutral-900 text-right text-sm">{String(displayValue)}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
