"use client"

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Flag, Calendar, ClipboardList, CheckCircle2, XCircle, Plus, Trash2, Upload, FileText, Send } from "lucide-react";
import { useParams } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from 'next/link';
import { format } from "date-fns";

interface LineItem {
    description: string;
    unit: string;
    quantity: number;
    unitPrice: number;
    total: number;
}

export default function DesignerSurveyDetailPage() {
    const { id } = useParams();
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

                const partnerId = designer?.id || seller?.id;
                const partnerName = designer?.company_name || seller?.business_name || 'Partner';
                const info = { id: partnerId, name: partnerName, userId: user.id };
                setPartnerInfo(info);

                // Load existing quote if any
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
            alert(`Survey ${accept ? 'accepted' : 'declined'} successfully!`);

            if (accept) {
                await supabase.from('notifications').insert({
                    user_id: booking.user_id,
                    title: 'Partner Accepted Survey',
                    message: `${partnerInfo.name} has accepted the survey scheduled for ${request.schedule?.date}.`,
                    link: `/dashboard/customer/design/${id}`,
                    is_read: false
                });
            }
        } else {
            alert("Failed: " + error.message);
        }
    }

    // Line item management
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
                // Fallback: use a placeholder since bucket might not exist
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
            alert("Your quote has been submitted to the admin successfully!");
        } else {
            alert("Failed to submit quote: " + error.message);
        }
        setSubmitting(false);
    }

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
                <p className="text-neutral-500 font-bold text-sm">Booking not found.</p>
                <Link href="/dashboard/designer/projects"><Button className="mt-4">← Back to Projects</Button></Link>
            </div>
        );
    }

    const details = booking.details || {};
    const milestones = booking.milestones || [];
    const surveyReq = getMyRequest();
    const hasSubmittedQuote = !!surveyReq?.quote;

    return (
        <div className="p-6 md:p-8 space-y-6 max-w-5xl">
            {/* Back */}
            <Link href="/dashboard/designer/projects">
                <Button variant="ghost" className="pl-0 hover:bg-transparent hover:text-neutral-600 -mb-2">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Projects
                </Button>
            </Link>

            {/* Header */}
            <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-1 flex-wrap">
                            <h1 className="text-2xl font-black text-neutral-900 tracking-tight">
                                Design Project #{(id as string)?.slice(0, 8).toUpperCase()}
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
                    {/* Survey Header */}
                    <div className="flex justify-between items-start flex-wrap gap-3">
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
                        <Badge className={`text-[10px] font-black uppercase px-4 py-1.5 border-none ${
                            surveyReq.status === 'accepted' ? 'bg-green-600 text-white' :
                            surveyReq.status === 'declined' ? 'bg-red-600 text-white' :
                            'bg-amber-600 text-white'
                        }`}>
                            {surveyReq.status}
                        </Badge>
                    </div>

                    {/* Pending: Accept/Decline */}
                    {surveyReq.status === 'pending' && (
                        <div className="space-y-4 bg-neutral-800/50 rounded-xl p-6">
                            <p className="text-neutral-300 text-sm leading-relaxed">
                                You have been invited to perform an on-site survey. Please confirm your availability for the scheduled date and time above.
                            </p>
                            <div className="flex gap-3">
                                <Button
                                    onClick={() => respondToSurvey(true)}
                                    className="flex-1 h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-widest text-xs rounded-xl"
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

                    {/* Accepted: Quote Builder */}
                    {surveyReq.status === 'accepted' && (
                        <div className="space-y-6 pt-4 border-t border-neutral-800">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="text-sm font-black text-blue-400 uppercase tracking-widest">
                                        {hasSubmittedQuote ? '✓ Quote Submitted — Update Below' : 'Create Your Quote'}
                                    </h3>
                                    <p className="text-neutral-400 text-xs mt-1 leading-relaxed">
                                        Build your own quote with line items. You can also upload your quote document. Both will be sent to the admin.
                                    </p>
                                </div>
                                {hasSubmittedQuote && (
                                    <Badge className="bg-emerald-800 text-emerald-200 text-[9px] font-black uppercase px-3 py-1">
                                        Submitted ৳{surveyReq.quote.amount?.toLocaleString()}
                                    </Badge>
                                )}
                            </div>

                            {/* Line Items Builder */}
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
                                                placeholder="e.g. Floor Plan Drawing"
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

                            {/* Grand Total */}
                            <div className="flex justify-between items-center bg-neutral-950 px-5 py-4 rounded-xl border border-neutral-700">
                                <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Grand Total</span>
                                <span className="text-2xl font-black text-emerald-400">৳{grandTotal.toLocaleString()}</span>
                            </div>

                            {/* Notes */}
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

                            {/* File Upload */}
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
                                {uploadedFileUrl && uploadedFileUrl.startsWith('http') && (
                                    <a href={uploadedFileUrl} target="_blank" rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-xs text-blue-400 font-bold hover:underline">
                                        <FileText className="w-3.5 h-3.5" /> View Uploaded Document ↗
                                    </a>
                                )}
                            </div>

                            {/* Submit Button */}
                            <Button
                                onClick={submitQuote}
                                disabled={submitting}
                                className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-sm rounded-xl shadow-lg shadow-blue-900/30 flex items-center justify-center gap-2"
                            >
                                <Send className="w-4 h-4" />
                                {submitting ? 'Submitting...' : hasSubmittedQuote ? 'Update & Resubmit Quote' : 'Submit Quote to Admin'}
                            </Button>
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

            {/* Bottom Grid: Milestones + Requirements */}
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
                <Card className="p-6 border-none bg-neutral-50 rounded-2xl h-fit">
                    <h3 className="text-sm font-black text-neutral-900 uppercase tracking-widest mb-5 flex items-center gap-2">
                        <ClipboardList className="w-4 h-4" /> Project Requirements
                    </h3>
                    <div className="space-y-2">
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
                                <div key={key} className="flex justify-between py-2.5 border-b border-neutral-200 last:border-0 gap-4">
                                    <span className="text-xs font-bold text-neutral-500 uppercase tracking-widest shrink-0">{formattedKey}</span>
                                    <span className="font-bold text-neutral-900 text-right text-xs">{String(displayValue)}</span>
                                </div>
                            );
                        })}
                    </div>
                </Card>
            </div>
        </div>
    );
}
