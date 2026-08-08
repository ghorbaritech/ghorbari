"use client"

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Flag, Calendar, ClipboardList } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from 'next/link';

export default function PartnerTaskDetailPage() {
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
                    .single();

                // Check if user is a seller
                const { data: seller } = await supabase
                    .from('sellers')
                    .select('id, business_name')
                    .eq('user_id', user.id)
                    .single();

                // Check if user is a service provider
                const { data: provider } = await supabase
                    .from('service_providers')
                    .select('id, business_name')
                    .eq('user_id', user.id)
                    .single();

                const partnerId = designer?.id || seller?.id || provider?.id;
                const partnerName = designer?.company_name || seller?.business_name || provider?.business_name;
                const info = { id: partnerId, name: partnerName, userId: user.id };
                setPartnerInfo(info);

                // Find if there is a survey request and initialize its line items
                const request = bookingData.details?.survey_requests?.find((r: any) => r.partner_id === partnerId);
                if (request) {
                    if (request.quote?.line_items) {
                        setPartnerLineItems(request.quote.line_items);
                    } else {
                        // Find latest admin detailed proposal to pre-populate line items
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

    async function respondToSurveyRequest(accept: boolean) {
        const request = booking.details?.survey_requests?.find((r: any) => r.partner_id === partnerInfo.id);
        if (!request) return;

        const updatedRequests = booking.details.survey_requests.map((r: any) => {
            if (r.partner_id === partnerInfo.id) {
                return { ...r, status: accept ? 'accepted' : 'declined' };
            }
            return r;
        });

        const updatedDetails = {
            ...booking.details,
            survey_requests: updatedRequests
        };

        const { error } = await supabase
            .from('design_bookings')
            .update({ details: updatedDetails })
            .eq('id', id);

        if (!error) {
            setBooking({ ...booking, details: updatedDetails });
            alert(`Survey request ${accept ? 'accepted' : 'declined'} successfully!`);

            if (accept) {
                // Notify Customer
                await supabase.from('notifications').insert({
                    user_id: booking.user_id,
                    type: 'survey_accepted',
                    title: 'Partner Accepted Survey',
                    message: `${partnerInfo.name} has accepted the survey request scheduled for ${request.schedule?.date}.`,
                    related_type: 'design_bookings',
                    related_id: id
                });
            }
        } else {
            alert("Failed to respond to survey request: " + error.message);
        }
    }

    async function submitSurveyQuote() {
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
            if (r.partner_id === partnerInfo.id) {
                return { ...r, quote: quoteObj };
            }
            return r;
        });

        const updatedDetails = {
            ...booking.details,
            survey_requests: updatedRequests
        };

        const { error } = await supabase
            .from('design_bookings')
            .update({ details: updatedDetails })
            .eq('id', id);

        if (!error) {
            setBooking({ ...booking, details: updatedDetails });
            alert("Your quote has been successfully submitted!");
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

    async function updateMilestoneStatus(index: number, newStatus: string) {
        const updatedMilestones = [...booking.milestones];
        updatedMilestones[index].status = newStatus;

        const { error } = await supabase
            .from('design_bookings')
            .update({ milestones: updatedMilestones })
            .eq('id', id);

        if (!error) {
            setBooking({ ...booking, milestones: updatedMilestones });
        } else {
            alert('Failed to update milestone');
        }
    }

    if (loading) return <div className="p-8">Loading...</div>;
    if (!booking) return <div className="p-8">Task not found.</div>;

    const details = booking.details || {};
    const milestones = booking.milestones || [];

    return (
        <div className="min-h-screen bg-[#F0F2F5] p-6 md:p-12">
            <div className="max-w-4xl mx-auto">
                <Link href="/dashboard/partner">
                    <Button variant="ghost" className="mb-6 pl-0 hover:bg-transparent hover:text-primary-600">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
                    </Button>
                </Link>

                <div className="bg-white rounded-[40px] shadow-sm p-8 md:p-12">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-3xl font-black text-neutral-900 tracking-tight italic uppercase">Work Order #{booking.id.slice(0, 8)}</h1>
                                <Badge className="bg-neutral-900 text-white">{booking.service_type}</Badge>
                            </div>
                            <p className="text-neutral-500 font-bold text-sm uppercase tracking-widest">
                                Assigned Task
                            </p>
                        </div>
                    </div>

                    {/* Survey Request Bidding Section */}
                    {partnerInfo && booking.details?.survey_requests?.some((r: any) => r.partner_id === partnerInfo.id) && (() => {
                        const surveyReq = booking.details.survey_requests.find((r: any) => r.partner_id === partnerInfo.id);
                        return (
                            <div className="mb-12 bg-neutral-900 text-white rounded-3xl p-8 border border-neutral-800 shadow-xl space-y-6">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <Badge className="bg-emerald-600 text-white uppercase tracking-widest text-[9px] font-black px-3 py-1 mb-2">
                                            Survey Request
                                        </Badge>
                                        <h2 className="text-xl font-black italic uppercase text-white tracking-tight">
                                            Site Survey & Quoting
                                        </h2>
                                        <p className="text-xs text-neutral-400 font-bold mt-1 uppercase tracking-wider">
                                            Scheduled: 📅 {surveyReq.schedule?.date} @ {surveyReq.schedule?.time}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest block">Survey Status</span>
                                        <Badge className={`text-[10px] font-black uppercase px-3 py-1 border-none mt-1 ${
                                            surveyReq.status === 'accepted' ? 'bg-green-600 text-white' :
                                            surveyReq.status === 'declined' ? 'bg-red-600 text-white' :
                                            'bg-amber-600 text-white'
                                        }`}>
                                            {surveyReq.status}
                                        </Badge>
                                    </div>
                                </div>

                                {surveyReq.status === 'pending' && (
                                    <div className="space-y-4">
                                        <p className="text-neutral-400 text-xs leading-relaxed font-semibold">
                                            Please verify if you are available to perform the on-site survey at the scheduled schedule. Once accepted, you will be able to submit your price quotation for the job.
                                        </p>
                                        <div className="flex gap-3">
                                            <Button
                                                onClick={() => respondToSurveyRequest(true)}
                                                className="flex-1 h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-widest text-xs rounded-xl"
                                            >
                                                Accept Survey
                                            </Button>
                                            <Button
                                                onClick={() => respondToSurveyRequest(false)}
                                                variant="outline"
                                                className="flex-1 h-12 border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white font-black uppercase tracking-widest text-xs rounded-xl"
                                            >
                                                Decline
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {surveyReq.status === 'accepted' && (
                                    <div className="space-y-6 pt-4 border-t border-neutral-800">
                                        <div>
                                            <h3 className="text-sm font-black text-blue-400 uppercase tracking-widest mb-1.5">Quote Submission</h3>
                                            <p className="text-neutral-400 text-xs leading-relaxed font-semibold">
                                                Please input your bid rates for each scope line item below. The customer will compare your proposal side-by-side with other bids.
                                            </p>
                                        </div>

                                        {partnerLineItems.length > 0 ? (
                                            <div className="space-y-4">
                                                <div className="space-y-3">
                                                    {partnerLineItems.map((item, idx) => (
                                                        <div key={idx} className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                            <div className="flex-1 space-y-1">
                                                                <p className="text-xs font-bold text-neutral-100">{item.description}</p>
                                                                <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                                                                    Unit: {item.unit || '-'} | Qty: {item.quantity}
                                                                </p>
                                                            </div>
                                                            <div className="flex items-center gap-3 shrink-0">
                                                                <div className="w-32">
                                                                    <Label className="text-[9px] font-bold text-neutral-500 uppercase block mb-1 text-right">Your Rate (৳)</Label>
                                                                    <input
                                                                        type="number"
                                                                        value={item.unitPrice || ""}
                                                                        onChange={(e) => updatePartnerRate(idx, Number(e.target.value))}
                                                                        className="w-full bg-neutral-900 border border-neutral-800 text-white font-black text-right text-xs rounded-lg h-9 px-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                                        placeholder="Rate"
                                                                    />
                                                                </div>
                                                                <div className="w-24 text-right pt-4">
                                                                    <span className="text-[10px] text-neutral-500 block uppercase font-bold">Total</span>
                                                                    <span className="font-black text-xs text-neutral-200">
                                                                        ৳{(Number(item.quantity || 0) * Number(item.unitPrice || 0)).toLocaleString()}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className="flex justify-between items-center bg-neutral-950 p-4 rounded-xl border border-neutral-800">
                                                    <div>
                                                        <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block">GRAND TOTAL BID</span>
                                                        <span className="text-xl font-black text-emerald-400">
                                                            ৳{partnerLineItems.reduce((sum, item) => sum + (Number(item.quantity || 0) * Number(item.unitPrice || 0)), 0).toLocaleString()}
                                                        </span>
                                                    </div>
                                                    <Button
                                                        onClick={submitSurveyQuote}
                                                        className="h-12 px-8 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-xs rounded-xl shadow-lg shadow-blue-900/20"
                                                    >
                                                        Submit Quote
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="p-6 bg-neutral-950 border border-dashed border-neutral-800 rounded-xl text-center text-xs font-bold text-neutral-500 italic">
                                                Waiting for admin to define detailed proposal line items...
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })()}

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Milestones (Editable) */}
                        <div className="space-y-8">
                            <h2 className="text-xl font-black text-neutral-900 tracking-tight uppercase flex items-center gap-2">
                                <Flag className="w-5 h-5 text-neutral-400" /> Milestone Tracker
                            </h2>
                            <div className="space-y-4">
                                {milestones.map((milestone: any, idx: number) => {
                                    const isCompleted = milestone.status === 'completed';

                                    return (
                                        <Card key={idx} className={`p-6 border-none bg-neutral-50 rounded-3xl ${isCompleted ? 'opacity-50' : ''}`}>
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h3 className="font-black text-lg text-neutral-900">{milestone.name}</h3>
                                                    {milestone.due_date && (
                                                        <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-1 mt-1">
                                                            <Calendar className="w-3 h-3" /> Due: {new Date(milestone.due_date).toLocaleDateString()}
                                                        </p>
                                                    )}
                                                </div>
                                                <Badge className={isCompleted ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}>
                                                    {milestone.status}
                                                </Badge>
                                            </div>

                                            {!isCompleted && (
                                                <Button
                                                    onClick={() => updateMilestoneStatus(idx, 'completed')}
                                                    className="w-full bg-neutral-900 text-white font-bold uppercase text-xs tracking-widest h-10 rounded-xl hover:bg-green-600 transition-colors"
                                                >
                                                    Mark as Completed
                                                </Button>
                                            )}
                                        </Card>
                                    );
                                })}
                                {milestones.length === 0 && <p className="text-neutral-400 italic">No milestones set by Admin.</p>}
                            </div>
                        </div>

                        {/* Project Details (Read Only) */}
                        <div className="space-y-6">
                            <Card className="p-8 border-none bg-neutral-50 rounded-[32px]">
                                <h3 className="text-sm font-black text-neutral-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                                    <ClipboardList className="w-4 h-4" /> Requirements
                                </h3>
                                <div className="space-y-4">
                                    {Object.entries(details).map(([key, value]) => {
                                        const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                                        let displayValue: any = value;
                                        if (typeof value === 'boolean') displayValue = value ? 'Yes' : 'No';
                                        if (Array.isArray(value)) displayValue = value.join(', ');
                                        if (value && typeof value === 'object' && !Array.isArray(value)) {
                                            displayValue = Object.entries(value)
                                                .map(([subKey, subVal]) => {
                                                    const formattedSubKey = subKey.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                                                    let displaySubVal: any = subVal;
                                                    if (typeof subVal === 'boolean') displaySubVal = subVal ? 'Yes' : 'No';
                                                    if (subVal && typeof subVal === 'object') displaySubVal = JSON.stringify(subVal);
                                                    return `${formattedSubKey}: ${displaySubVal || '-'}`;
                                                })
                                                .join(' | ');
                                        }
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

                            <Card className="p-6 border-2 border-dashed border-red-200 bg-red-50/50 rounded-3xl">
                                <p className="text-xs font-bold text-red-500 uppercase tracking-widest text-center">
                                    Confidential: Do not share these details.
                                </p>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
