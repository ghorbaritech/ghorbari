"use client"

export const dynamic = 'force-dynamic'

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Flag, Calendar, ClipboardList, CheckCircle2, XCircle, Plus, Trash2, Upload, FileText, Send, Clock, ArrowUp, ArrowDown, Check, Edit3 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import Link from 'next/link';
import { format } from "date-fns";

interface LineItem {
    description: string;
    unit: string;
    quantity: number;
    unitPrice: number;
    total: number;
}

export default function PartnerTaskDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [booking, setBooking] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const supabase = createClient();

    const [partnerInfo, setPartnerInfo] = useState<any>(null);
    const [lineItems, setLineItems] = useState<LineItem[]>([
        { description: "", unit: "sft", quantity: 1, unitPrice: 0, total: 0 }
    ]);
    const [notes, setNotes] = useState("");
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [uploadedFileUrl, setUploadedFileUrl] = useState<string>("");
    const [uploading, setUploading] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    // Milestone State
    const [milestonesState, setMilestonesState] = useState<any[]>([]);
    const [newMilestoneTitle, setNewMilestoneTitle] = useState("");

    // Quote view state (read-only vs edit mode)
    const [isEditingQuote, setIsEditingQuote] = useState(false);

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
            if (bookingData.milestones) {
                setMilestonesState(bookingData.milestones);
            }

            // Fetch current user details
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: designer } = await supabase
                    .from('designers')
                    .select('id, company_name')
                    .eq('user_id', user.id)
                    .maybeSingle();

                const { data: seller } = await supabase
                    .from('sellers')
                    .select('id, business_name')
                    .eq('user_id', user.id)
                    .maybeSingle();

                const { data: provider } = await supabase
                    .from('service_providers')
                    .select('id, business_name')
                    .eq('user_id', user.id)
                    .maybeSingle();

                const partnerId = designer?.id || seller?.id || provider?.id;
                const partnerName = designer?.company_name || seller?.business_name || provider?.business_name || 'Partner';
                const info = { id: partnerId, name: partnerName, userId: user.id };
                setPartnerInfo(info);

                const request = bookingData.details?.survey_requests?.find((r: any) =>
                    r.partner_user_id === user.id || (partnerId && r.partner_id === partnerId)
                );
                if (request?.quote) {
                    if (request.quote.line_items?.length) {
                        setLineItems(request.quote.line_items);
                    }
                    if (request.quote.notes) setNotes(request.quote.notes);
                    if (request.quote.file_url) setUploadedFileUrl(request.quote.file_url);
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

    async function respondToSurvey(accept: boolean) {
        const request = getMyRequest();
        if (!request || !partnerInfo) return;

        const updatedRequests = booking.details.survey_requests.map((r: any) => {
            const isMe = r.partner_user_id === partnerInfo.userId || (partnerInfo.id && r.partner_id === partnerInfo.id);
            return isMe ? { ...r, status: accept ? 'accepted' : 'declined' } : r;
        });

        const updatedDetails = { ...booking.details, survey_requests: updatedRequests };
        const { error } = await supabase.from('design_bookings').update({ details: updatedDetails }).eq('id', id);

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

    function addLineItem() {
        setLineItems(prev => [...prev, { description: "", unit: "sft", quantity: 1, unitPrice: 0, total: 0 }]);
    }

    function removeLineItem(idx: number) {
        setLineItems(prev => prev.filter((_, i) => i !== idx));
    }

    function updateLineItem(idx: number, key: keyof LineItem, val: any) {
        setLineItems(prev => {
            const items = [...prev];
            (items[idx] as any)[key] = val;
            items[idx].total = Number(items[idx].quantity || 0) * Number(items[idx].unitPrice || 0);
            return items;
        });
    }

    const grandTotal = lineItems.reduce((sum, item) => sum + (Number(item.quantity || 0) * Number(item.unitPrice || 0)), 0);

    async function handleFileUpload(file: File) {
        setUploading(true);
        try {
            const ext = file.name.split('.').pop();
            const path = `partner-quotes/${id}/${partnerInfo?.userId || 'anon'}-${Date.now()}.${ext}`;
            const { error: uploadError } = await supabase.storage
                .from('documents')
                .upload(path, file, { upsert: true });

            if (uploadError) {
                console.error("Upload error:", uploadError.message);
                setUploadedFile(file);
                setUploadedFileUrl(`[File attached: ${file.name}]`);
                alert("File noted. It will be referenced in your quote.");
            } else {
                const { data: { publicUrl } } = supabase.storage.from('documents').getPublicUrl(path);
                setUploadedFile(file);
                setUploadedFileUrl(publicUrl);
                alert("File uploaded successfully!");
            }
        } catch (e) {
            setUploadedFile(file);
            setUploadedFileUrl(`[File: ${file.name}]`);
        } finally {
            setUploading(false);
        }
    }

    async function submitQuote() {
        const request = getMyRequest();
        if (!request || !partnerInfo) return;

        const hasItems = lineItems.some(i => i.description.trim());
        if (!hasItems && !uploadedFileUrl) {
            alert("Please add at least one line item or upload a quote document.");
            return;
        }

        setSubmitting(true);

        const quoteObj = {
            amount: grandTotal,
            line_items: lineItems.filter(i => i.description.trim()),
            notes: notes,
            file_url: uploadedFileUrl || null,
            date: new Date().toISOString(),
            partner_name: partnerInfo.name
        };

        const updatedRequests = booking.details.survey_requests.map((r: any) => {
            const isMe = r.partner_user_id === partnerInfo.userId || (partnerInfo.id && r.partner_id === partnerInfo.id);
            return isMe ? { ...r, quote: quoteObj } : r;
        });

        const updatedDetails = { ...booking.details, survey_requests: updatedRequests };
        const { error } = await supabase.from('design_bookings').update({ details: updatedDetails }).eq('id', id);

        if (!error) {
            setBooking({ ...booking, details: updatedDetails });
            setIsEditingQuote(false);
            alert("Your quote has been submitted successfully!");
        } else {
            alert("Failed to submit quote: " + error.message);
        }
        setSubmitting(false);
    }

    // Milestone Management Functions for Partner
    function handleAddMilestone() {
        if (!newMilestoneTitle.trim()) return;
        const updated = [
            ...milestonesState,
            { name: newMilestoneTitle.trim(), status: 'pending', due_date: '' }
        ];
        setMilestonesState(updated);
        setNewMilestoneTitle("");
    }

    function handleToggleMilestone(index: number) {
        const updated = [...milestonesState];
        updated[index].status = updated[index].status === 'completed' ? 'pending' : 'completed';
        setMilestonesState(updated);
    }

    function handleUpdateMilestoneName(index: number, name: string) {
        const updated = [...milestonesState];
        updated[index].name = name;
        setMilestonesState(updated);
    }

    function handleUpdateMilestoneDate(index: number, date: string) {
        const updated = [...milestonesState];
        updated[index].due_date = date;
        setMilestonesState(updated);
    }

    function handleDeleteMilestone(index: number) {
        const updated = milestonesState.filter((_, i) => i !== index);
        setMilestonesState(updated);
    }

    function handleMoveMilestone(index: number, direction: 'up' | 'down') {
        if ((direction === 'up' && index === 0) || (direction === 'down' && index === milestonesState.length - 1)) return;
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        const updated = [...milestonesState];
        const temp = updated[index];
        updated[index] = updated[targetIndex];
        updated[targetIndex] = temp;
        setMilestonesState(updated);
    }

    async function savePartnerMilestones() {
        const { error } = await supabase
            .from('design_bookings')
            .update({ milestones: milestonesState })
            .eq('id', id);

        if (!error) {
            setBooking({ ...booking, milestones: milestonesState });
            alert("Milestones saved successfully! Customer and Admin have been notified.");

            // 1. Notify Customer
            if (booking.user_id) {
                await supabase.from('notifications').insert({
                    user_id: booking.user_id,
                    title: 'Milestone Updated by Partner',
                    message: `${partnerInfo?.name || 'Partner'} has updated the project milestones.`,
                    link: `/dashboard/customer/design/${id}`,
                    is_read: false
                });
            }

            // 2. Notify Admin Users
            const { data: adminProfiles } = await supabase
                .from('profiles')
                .select('id')
                .eq('role', 'admin');

            if (adminProfiles?.length) {
                const adminNotifs = adminProfiles.map((adm: any) => ({
                    user_id: adm.id,
                    title: 'Partner Updated Milestones',
                    message: `${partnerInfo?.name || 'Partner'} updated milestones for project #${(id as string).slice(0, 8)}.`,
                    link: `/admin/design-orders/${id}`,
                    is_read: false
                }));
                await supabase.from('notifications').insert(adminNotifs);
            }
        } else {
            alert("Failed to save milestones: " + error.message);
        }
    }

    if (loading) return <div className="p-8">Loading...</div>;
    if (!booking) return <div className="p-8">Task not found.</div>;

    const details = booking.details || {};
    const surveyReq = getMyRequest();
    const hasSubmittedQuote = !!surveyReq?.quote;

    return (
        <div className="min-h-screen bg-[#F0F2F5] p-6 md:p-12">
            <div className="max-w-5xl mx-auto space-y-8">
                <Link href="/dashboard/partner">
                    <Button variant="ghost" className="pl-0 hover:bg-transparent hover:text-primary-600">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
                    </Button>
                </Link>

                {/* Header */}
                <div className="bg-white rounded-3xl p-8 border border-neutral-200 shadow-sm">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-3xl font-black text-neutral-900 tracking-tight italic uppercase">Work Order #{(id as string)?.slice(0, 8)}</h1>
                                <Badge className="bg-neutral-900 text-white">{booking.service_type}</Badge>
                            </div>
                            <p className="text-neutral-500 font-bold text-sm uppercase tracking-widest">
                                Assigned Project Task
                            </p>
                        </div>
                        <Badge className={`text-xs font-black uppercase px-4 py-1.5 border-none ${
                            booking.status === 'in_progress' ? 'bg-emerald-100 text-emerald-800' :
                            booking.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                            'bg-amber-100 text-amber-800'
                        }`}>
                            {booking.status?.replace(/_/g, ' ')}
                        </Badge>
                    </div>
                </div>

                {/* 1. TOP SECTION: PROJECT MILESTONES ROADMAP */}
                <Card className="p-6 md:p-8 rounded-3xl border border-neutral-200 bg-white shadow-sm space-y-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-sm font-black uppercase tracking-widest text-neutral-900 flex items-center gap-2">
                                <Clock className="w-4 h-4 text-emerald-600" /> Project Milestones Roadmap
                            </h2>
                            <p className="text-xs text-neutral-400 font-bold mt-0.5">Manage execution stages & notify admin & customer</p>
                        </div>
                        <Button onClick={savePartnerMilestones} className="h-9 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-wider rounded-xl px-5 shadow-sm">
                            Save Milestones & Notify
                        </Button>
                    </div>

                    {/* Add Custom Milestone Input */}
                    <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200/80 space-y-2">
                        <Label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block">Add New Milestone</Label>
                        <div className="flex gap-2">
                            <Input
                                type="text"
                                placeholder="e.g. 3D Architectural Render, Soft Handover"
                                className="h-10 text-xs font-bold bg-white border-neutral-200 rounded-xl"
                                value={newMilestoneTitle}
                                onChange={(e) => setNewMilestoneTitle(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleAddMilestone();
                                    }
                                }}
                            />
                            <Button
                                type="button"
                                onClick={handleAddMilestone}
                                className="h-10 px-5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-black uppercase tracking-wider rounded-xl shrink-0"
                            >
                                <Plus className="w-4 h-4 mr-1" /> Add
                            </Button>
                        </div>
                    </div>

                    {/* Milestone Timeline List */}
                    <div className="space-y-3 relative before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-neutral-100">
                        {milestonesState.map((milestone: any, idx: number) => (
                            <div key={idx} className="relative pl-8 group">
                                <div className={`absolute left-0 top-3.5 w-5 h-5 rounded-full border-4 transition-colors ${milestone.status === 'completed' ? 'border-emerald-600 bg-emerald-600' : 'border-neutral-200 bg-white'}`}></div>

                                <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-100 group-hover:border-neutral-300 transition-all space-y-2.5">
                                    <div className="flex items-center gap-2">
                                        <div className="flex flex-col gap-0.5 opacity-40 group-hover:opacity-100 transition-opacity">
                                            <button
                                                type="button"
                                                disabled={idx === 0}
                                                onClick={() => handleMoveMilestone(idx, 'up')}
                                                className="text-neutral-400 hover:text-neutral-900 disabled:opacity-20 p-0.5"
                                                title="Move Up"
                                            >
                                                <ArrowUp className="w-3 h-3" />
                                            </button>
                                            <button
                                                type="button"
                                                disabled={idx === milestonesState.length - 1}
                                                onClick={() => handleMoveMilestone(idx, 'down')}
                                                className="text-neutral-400 hover:text-neutral-900 disabled:opacity-20 p-0.5"
                                                title="Move Down"
                                            >
                                                <ArrowDown className="w-3 h-3" />
                                            </button>
                                        </div>

                                        <Input
                                            type="text"
                                            value={milestone.name}
                                            onChange={(e) => handleUpdateMilestoneName(idx, e.target.value)}
                                            className={`h-9 text-xs font-extrabold bg-transparent border-neutral-200 focus:bg-white px-3 rounded-xl ${milestone.status === 'completed' ? 'line-through text-neutral-400' : 'text-neutral-900'}`}
                                        />

                                        <Checkbox
                                            checked={milestone.status === 'completed'}
                                            onCheckedChange={() => handleToggleMilestone(idx)}
                                            className="rounded-full data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600 shrink-0"
                                            title={milestone.status === 'completed' ? 'Mark Pending' : 'Mark Completed'}
                                        />

                                        <button
                                            type="button"
                                            onClick={() => handleDeleteMilestone(idx)}
                                            className="text-neutral-300 hover:text-red-600 p-1 transition-colors shrink-0"
                                            title="Delete Milestone"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <div className="flex items-center gap-2 pt-1 border-t border-neutral-200/50">
                                        <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                                        <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">Target Date:</span>
                                        <input
                                            type="date"
                                            className="bg-white border border-neutral-200 rounded-lg px-2.5 py-1 text-[10px] font-bold text-neutral-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                            value={milestone.due_date || ''}
                                            onChange={(e) => handleUpdateMilestoneDate(idx, e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}

                        {milestonesState.length === 0 && (
                            <p className="text-xs text-neutral-400 italic text-center py-4">No milestones defined yet. Add custom milestones above.</p>
                        )}
                    </div>
                </Card>

                {/* 2. MIDDLE SECTION: SITE SURVEY & QUOTATION */}
                {surveyReq ? (
                    <div className="space-y-6">
                        {/* Survey Header */}
                        <div className="bg-neutral-900 text-white rounded-3xl p-6 md:p-8 shadow-xl space-y-6">
                            <div className="flex justify-between items-start flex-wrap gap-3">
                                <div>
                                    <Badge className="bg-emerald-600 text-white uppercase tracking-widest text-[9px] font-black px-3 py-1 mb-2">
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
                                <Badge className={`text-[10px] font-black uppercase px-4 py-1.5 border-none ${
                                    surveyReq.status === 'accepted' ? 'bg-emerald-600 text-white' :
                                    surveyReq.status === 'declined' ? 'bg-red-600 text-white' :
                                    'bg-amber-600 text-white'
                                }`}>
                                    {surveyReq.status}
                                </Badge>
                            </div>

                            {/* Pending Accept/Decline */}
                            {surveyReq.status === 'pending' && (
                                <div className="space-y-4 bg-neutral-800/50 rounded-2xl p-6">
                                    <p className="text-neutral-300 text-sm leading-relaxed font-medium">
                                        You have been invited to perform an on-site survey. Please confirm your availability for the scheduled date and time above.
                                    </p>
                                    <div className="flex gap-3">
                                        <Button
                                            onClick={() => respondToSurvey(true)}
                                            className="flex-1 h-12 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest text-xs rounded-xl"
                                        >
                                            <CheckCircle2 className="w-4 h-4 mr-2" /> Accept Survey
                                        </Button>
                                        <Button
                                            onClick={() => respondToSurvey(false)}
                                            variant="outline"
                                            className="flex-1 h-12 border-neutral-700 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white font-black uppercase tracking-widest text-xs rounded-xl"
                                        >
                                            <XCircle className="w-4 h-4 mr-2" /> Decline
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* READ-ONLY SUBMITTED QUOTE VIEW */}
                        {surveyReq.status === 'accepted' && hasSubmittedQuote && !isEditingQuote && (
                            <Card className="bg-neutral-900 text-white rounded-3xl p-6 md:p-8 shadow-xl space-y-6 border border-neutral-800">
                                <div className="flex justify-between items-start flex-wrap gap-4 pb-6 border-b border-neutral-800">
                                    <div>
                                        <Badge className="bg-emerald-600 text-white uppercase tracking-widest text-[9px] font-black px-3 py-1 mb-2">
                                            SUBMITTED QUOTE
                                        </Badge>
                                        <h3 className="text-xl font-black italic uppercase text-white tracking-tight">
                                            Submitted Price Quotation
                                        </h3>
                                        <p className="text-xs text-neutral-400 font-bold mt-1">
                                            Submitted on {surveyReq.quote.date ? format(new Date(surveyReq.quote.date), 'MMM d, yyyy @ h:mm a') : '-'}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest block">TOTAL SUBMITTED BID</span>
                                        <span className="text-3xl font-black text-emerald-400 mt-0.5 block">৳{surveyReq.quote.amount?.toLocaleString()}</span>
                                    </div>
                                </div>

                                {surveyReq.quote.line_items?.length > 0 && (
                                    <div className="space-y-2">
                                        <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">Submitted Line Items Breakdown</p>
                                        <div className="bg-neutral-950 rounded-2xl overflow-hidden border border-neutral-800">
                                            <table className="w-full text-xs text-left">
                                                <thead>
                                                    <tr className="border-b border-neutral-800 text-[9px] font-black text-neutral-500 uppercase">
                                                        <th className="p-3.5">Description</th>
                                                        <th className="p-3.5 text-center">Unit</th>
                                                        <th className="p-3.5 text-right">Qty</th>
                                                        <th className="p-3.5 text-right">Rate</th>
                                                        <th className="p-3.5 text-right">Total</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {surveyReq.quote.line_items.map((item: any, i: number) => (
                                                        <tr key={i} className="border-b border-neutral-800/60 last:border-0 font-medium text-neutral-300">
                                                            <td className="p-3.5 font-semibold text-white">{item.description}</td>
                                                            <td className="p-3.5 text-center text-neutral-400">{item.unit || 'sft'}</td>
                                                            <td className="p-3.5 text-right text-neutral-400">{item.quantity}</td>
                                                            <td className="p-3.5 text-right text-neutral-400">৳{Number(item.unitPrice || 0).toLocaleString()}</td>
                                                            <td className="p-3.5 text-right font-black text-emerald-400">৳{(Number(item.quantity||0)*Number(item.unitPrice||0)).toLocaleString()}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {surveyReq.quote.notes && (
                                    <div className="bg-neutral-800/50 p-4 rounded-2xl text-xs text-neutral-300 leading-relaxed">
                                        <span className="text-[9px] font-black text-neutral-500 uppercase block mb-1">Additional Notes / Remarks</span>
                                        {surveyReq.quote.notes}
                                    </div>
                                )}

                                {surveyReq.quote.file_url && (
                                    <a
                                        href={surveyReq.quote.file_url.startsWith('http') ? surveyReq.quote.file_url : '#'}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        download
                                        className="flex items-center gap-2 bg-blue-600/20 border border-blue-600/30 rounded-xl px-4 py-3 text-blue-300 font-bold text-xs hover:bg-blue-600/30 transition-colors w-fit"
                                    >
                                        <FileText className="w-4 h-4" />
                                        Download Attached BOQ Document ({surveyReq.quote.file_url.split('/').pop() || 'BOQ.pdf'})
                                    </a>
                                )}

                                <div className="pt-4 border-t border-neutral-800 flex justify-end">
                                    <Button
                                        onClick={() => setIsEditingQuote(true)}
                                        variant="outline"
                                        className="border-neutral-700 bg-neutral-800 text-neutral-200 hover:bg-neutral-700 hover:text-white font-bold text-xs rounded-xl flex items-center gap-2"
                                    >
                                        <Edit3 className="w-3.5 h-3.5" /> Edit / Revise Quote
                                    </Button>
                                </div>
                            </Card>
                        )}

                        {/* EDITABLE QUOTE FORM */}
                        {surveyReq.status === 'accepted' && (!hasSubmittedQuote || isEditingQuote) && (
                            <Card className="bg-neutral-900 text-white rounded-3xl p-6 md:p-8 shadow-xl space-y-6 border border-neutral-800">
                                <div className="flex justify-between items-center pb-4 border-b border-neutral-800">
                                    <div>
                                        <h3 className="text-sm font-black text-blue-400 uppercase tracking-widest">
                                            {hasSubmittedQuote ? 'Edit & Revise Quote' : 'Create Your Quote'}
                                        </h3>
                                        <p className="text-neutral-400 text-xs mt-1">
                                            Build line items and upload quote document for admin review.
                                        </p>
                                    </div>
                                    {hasSubmittedQuote && (
                                        <Button
                                            onClick={() => setIsEditingQuote(false)}
                                            variant="ghost"
                                            className="text-neutral-400 hover:text-white text-xs font-bold"
                                        >
                                            Cancel Editing
                                        </Button>
                                    )}
                                </div>

                                <div className="space-y-3">
                                    <div className="grid grid-cols-12 gap-2 px-1">
                                        <span className="col-span-5 text-[9px] font-black text-neutral-500 uppercase tracking-widest">Description</span>
                                        <span className="col-span-1 text-[9px] font-black text-neutral-500 uppercase tracking-widest">Unit</span>
                                        <span className="col-span-2 text-[9px] font-black text-neutral-500 uppercase tracking-widest text-right">Qty</span>
                                        <span className="col-span-2 text-[9px] font-black text-neutral-500 uppercase tracking-widest text-right">Rate (৳)</span>
                                        <span className="col-span-2 text-[9px] font-black text-neutral-500 uppercase tracking-widest text-right">Total</span>
                                    </div>

                                    {lineItems.map((item, idx) => (
                                        <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-neutral-950 p-3 rounded-xl border border-neutral-800">
                                            <div className="col-span-5">
                                                <input
                                                    value={item.description}
                                                    onChange={e => updateLineItem(idx, 'description', e.target.value)}
                                                    placeholder="e.g. False Ceiling Work"
                                                    className="w-full bg-neutral-900 border border-neutral-700 text-white text-xs font-semibold rounded-lg h-9 px-3 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                />
                                            </div>
                                            <div className="col-span-1">
                                                <input
                                                    value={item.unit}
                                                    onChange={e => updateLineItem(idx, 'unit', e.target.value)}
                                                    placeholder="sft"
                                                    className="w-full bg-neutral-900 border border-neutral-700 text-white text-xs font-semibold rounded-lg h-9 px-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                />
                                            </div>
                                            <div className="col-span-2">
                                                <input
                                                    type="number"
                                                    value={item.quantity}
                                                    onChange={e => updateLineItem(idx, 'quantity', Number(e.target.value))}
                                                    className="w-full bg-neutral-900 border border-neutral-700 text-white text-xs font-black rounded-lg h-9 px-2 text-right focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                />
                                            </div>
                                            <div className="col-span-2">
                                                <input
                                                    type="number"
                                                    value={item.unitPrice || ""}
                                                    onChange={e => updateLineItem(idx, 'unitPrice', Number(e.target.value))}
                                                    placeholder="0"
                                                    className="w-full bg-neutral-900 border border-neutral-700 text-white text-xs font-black rounded-lg h-9 px-2 text-right focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                />
                                            </div>
                                            <div className="col-span-1 text-right">
                                                <span className="text-xs font-black text-neutral-200">
                                                    {(Number(item.quantity || 0) * Number(item.unitPrice || 0)).toLocaleString()}
                                                </span>
                                            </div>
                                            <div className="col-span-1 flex justify-end">
                                                {lineItems.length > 1 && (
                                                    <button
                                                        onClick={() => removeLineItem(idx)}
                                                        className="text-neutral-600 hover:text-red-400 transition-colors p-1"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}

                                    <button
                                        onClick={addLineItem}
                                        className="flex items-center gap-2 text-blue-400 hover:text-blue-300 text-xs font-black uppercase tracking-widest transition-colors py-1"
                                    >
                                        <Plus className="w-3.5 h-3.5" /> Add Line Item
                                    </button>
                                </div>

                                <div className="flex justify-between items-center bg-neutral-950 px-5 py-4 rounded-xl border border-neutral-700">
                                    <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Grand Total</span>
                                    <span className="text-2xl font-black text-emerald-400">৳{grandTotal.toLocaleString()}</span>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[9px] font-black text-neutral-500 uppercase tracking-widest block">
                                        Additional Notes / Remarks
                                    </Label>
                                    <Textarea
                                        value={notes}
                                        onChange={e => setNotes(e.target.value)}
                                        placeholder="Add any notes, terms, or remarks for this quote..."
                                        className="bg-neutral-950 border-neutral-700 text-white text-sm font-semibold rounded-xl resize-none min-h-[80px] focus:ring-blue-500 placeholder:text-neutral-600"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-[9px] font-black text-neutral-500 uppercase tracking-widest block">
                                        Upload Quote Document (PDF / DOCX / Image)
                                    </Label>
                                    <div
                                        onClick={() => fileRef.current?.click()}
                                        className="border-2 border-dashed border-neutral-700 rounded-xl p-6 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-500/5 transition-all"
                                    >
                                        <Upload className="w-6 h-6 text-neutral-500 mx-auto mb-2" />
                                        <p className="text-xs font-bold text-neutral-400">
                                            {uploadedFile ? uploadedFile.name : 'Click to upload your quote file'}
                                        </p>
                                        {uploadedFileUrl && !uploadedFile && (
                                            <p className="text-[10px] text-blue-400 font-bold mt-1">Previously uploaded: ✓</p>
                                        )}
                                    </div>
                                    <input
                                        ref={fileRef}
                                        type="file"
                                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                        className="hidden"
                                        onChange={e => {
                                            const f = e.target.files?.[0];
                                            if (f) handleFileUpload(f);
                                        }}
                                    />
                                    {uploading && (
                                        <p className="text-xs text-blue-400 font-bold">Uploading...</p>
                                    )}
                                </div>

                                <Button
                                    onClick={submitQuote}
                                    disabled={submitting}
                                    className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-sm rounded-xl shadow-lg shadow-blue-900/30 flex items-center justify-center gap-2"
                                >
                                    <Send className="w-4 h-4" />
                                    {submitting ? 'Submitting...' : hasSubmittedQuote ? 'Update & Resubmit Quote' : 'Submit Quote to Admin'}
                                </Button>
                            </Card>
                        )}
                    </div>
                ) : (
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center">
                        <p className="text-amber-700 font-bold text-sm">No survey request found for your account on this project.</p>
                    </div>
                )}

                {/* 3. BOTTOM SECTION: PROJECT REQUIREMENTS */}
                <Card className="p-6 md:p-8 border border-neutral-200 bg-white rounded-3xl space-y-4">
                    <h3 className="text-sm font-black text-neutral-900 uppercase tracking-widest flex items-center gap-2">
                        <ClipboardList className="w-4 h-4 text-primary-600" /> Project Requirements & Specs
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(details).filter(([key]) => key !== 'survey_requests').map(([key, value]) => {
                            const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());
                            let displayValue: any = value;
                            if (typeof value === 'boolean') displayValue = value ? 'Yes' : 'No';
                            if (Array.isArray(value)) displayValue = value.join(', ');
                            if (value && typeof value === 'object' && !Array.isArray(value)) {
                                displayValue = Object.entries(value as object).map(([k, v]) => `${k}: ${v}`).join(' | ');
                            }
                            if (!value) displayValue = '-';

                            return (
                                <div key={key} className="bg-neutral-50 p-4 rounded-2xl border border-neutral-100 flex flex-col">
                                    <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">{formattedKey}</span>
                                    <span className="font-bold text-neutral-900 text-xs mt-1 break-words">{String(displayValue)}</span>
                                </div>
                            );
                        })}
                    </div>
                </Card>
            </div>
        </div>
    );
}
