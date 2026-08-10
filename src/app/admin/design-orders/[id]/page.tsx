"use client"

export const dynamic = 'force-dynamic'

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { Sidebar } from "@/components/admin/Sidebar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check, UserPlus, XCircle, DollarSign, Send, Clock, Calendar, Upload, FileText, Download, Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react";
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
import { ProposalInvoice } from "@/components/admin/ProposalInvoice";

const DEFAULT_MILESTONES = [
    "Requirement Analysis",
    "On Field Assessment",
    "Verify all documents",
    "Draft Design",
    "Review and Feedback",
    "Final Design",
    "Soft Design Handover"
];

function renderDetailCard(key: string, value: any) {
    const systemKeys = ['survey_requests', 'quotation_history', 'milestones', 'selected_designer_id', 'designerOption', 'assigned_seller_id', 'assigned_designer_id'];
    if (systemKeys.includes(key)) return null;

    if (value === null || value === undefined || value === '' || value === '-' || value === 'null') return null;
    if (Array.isArray(value) && value.length === 0) return null;

    const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    
    // Custom Formatter for Building Details
    if (key === 'buildingDetails' && typeof value === 'object') {
        const { landArea, landAreaUnit, floors, layouts } = value;
        if (!landArea && !floors && (!layouts || layouts.length === 0)) return null;
        return (
            <div key={key} className="bg-neutral-50 rounded-xl p-6 border border-neutral-100 col-span-1 md:col-span-2 space-y-4">
                <Label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block border-b border-neutral-200/60 pb-2">{formattedKey}</Label>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {floors && (
                        <div>
                            <span className="text-[10px] font-bold text-neutral-400 block uppercase">Total Floors</span>
                            <span className="font-extrabold text-neutral-800 text-base">{floors}</span>
                        </div>
                    )}
                    {landArea && (
                        <div className="col-span-2">
                            <span className="text-[10px] font-bold text-neutral-400 block uppercase">Land Area</span>
                            <span className="font-extrabold text-neutral-800 text-base">{landArea} {landAreaUnit || ''}</span>
                        </div>
                    )}
                </div>

                {layouts && Array.isArray(layouts) && layouts.length > 0 && (
                    <div className="space-y-3 pt-2">
                        <span className="text-[10px] font-black text-neutral-500 block uppercase tracking-wider">Layout Configuration</span>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {layouts.map((layout: any, idx: number) => {
                                const isGarage = layout.isGarage === 'yes' || layout.isGarage === true;
                                return (
                                    <div key={layout.id || idx} className="bg-white p-4 rounded-xl border border-neutral-200/60 space-y-2">
                                        <div className="flex justify-between items-center border-b border-neutral-100 pb-1.5">
                                            <span className="font-bold text-sm text-neutral-900">Layout {layout.id || idx + 1}</span>
                                            <Badge variant="secondary" className="text-[9px] font-bold px-2 py-0.5 bg-neutral-100 text-neutral-800 border-none">
                                                {layout.numberOfUnits || 1} Units
                                            </Badge>
                                        </div>
                                        <div className="text-xs space-y-1 text-neutral-700">
                                            <p className="flex justify-between">
                                                <span className="text-neutral-400 font-medium">Garage:</span>
                                                <span className="font-bold">{isGarage ? 'Yes' : 'No'}</span>
                                            </p>
                                            {layout.unitDetails && Array.isArray(layout.unitDetails) && layout.unitDetails.map((unit: any, uIdx: number) => (
                                                <div key={uIdx} className="pt-1.5 mt-1.5 border-t border-neutral-100/60 space-y-1">
                                                    <span className="text-[9px] font-bold text-neutral-400 block uppercase tracking-tight">Unit {unit.unitId || uIdx + 1} Rooms</span>
                                                    <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px]">
                                                        {unit.bedrooms && <span>🛏️ {unit.bedrooms} Bed</span>}
                                                        {unit.bathrooms && <span>🚿 {unit.bathrooms} Bath</span>}
                                                        {unit.balcony && <span>🚪 {unit.balcony} Balcony</span>}
                                                        {unit.kitchen && <span>🍳 {unit.kitchen} Kitchen</span>}
                                                        {unit.diningRooms && <span>🍽️ {unit.diningRooms} Dining</span>}
                                                        {unit.drawingRooms && <span>🛋️ {unit.drawingRooms} Drawing</span>}
                                                    </div>
                                                    {unit.additionalSpace && (
                                                        <p className="text-[10px] text-neutral-500 italic mt-1 font-medium">
                                                            + {unit.additionalSpace}
                                                        </p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // Custom Formatter for Uploaded Documents
    if (key === 'uploadedDocsUrls' && Array.isArray(value)) {
        if (value.length === 0) return null;
        return (
            <div key={key} className="bg-neutral-50 rounded-xl p-4 border border-neutral-100">
                <Label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block mb-2">{formattedKey}</Label>
                <div className="space-y-1.5 max-w-full">
                    {value.map((doc: any, index: number) => (
                        <a
                            key={index}
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-xs font-bold text-primary-600 hover:text-primary-700 hover:underline truncate max-w-full"
                        >
                            📄 <span className="truncate">{doc.name || `Document ${index + 1}`}</span>
                        </a>
                    ))}
                </div>
            </div>
        );
    }

    // Custom Formatter for Preferred Schedule
    if (key === 'preferredSchedule' && typeof value === 'object') {
        const formattedDate = value.date ? format(new Date(value.date), 'MMM d, yyyy') : '';
        if (!formattedDate && !value.time) return null;
        return (
            <div key={key} className="bg-neutral-50 rounded-xl p-4 border border-neutral-100">
                <Label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block mb-1">{formattedKey}</Label>
                <p className="font-bold text-neutral-800 text-sm">
                    {formattedDate ? `${formattedDate} at ${value.time || '-'}` : (value.time || '-')}
                </p>
            </div>
        );
    }

    // Custom Formatter for URLs
    if (typeof value === 'string' && (value.startsWith('http://') || value.startsWith('https://'))) {
        return (
            <div key={key} className="bg-neutral-50 rounded-xl p-4 border border-neutral-100">
                <Label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block mb-1">{formattedKey}</Label>
                <a
                    href={value}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-primary-600 hover:text-primary-700 hover:underline break-all"
                >
                    Open Link ↗
                </a>
            </div>
        );
    }

    if (Array.isArray(value)) {
        if (value.length === 0) return null;
        return (
            <div key={key} className="bg-neutral-50 rounded-xl p-4 border border-neutral-100">
                <Label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block mb-1">{formattedKey}</Label>
                <p className="font-bold text-neutral-800 text-sm break-words">{value.join(', ')}</p>
            </div>
        );
    }

    if (typeof value === 'boolean') {
        return (
            <div key={key} className="bg-neutral-50 rounded-xl p-4 border border-neutral-100">
                <Label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block mb-1">{formattedKey}</Label>
                <p className="font-bold text-neutral-800 text-sm">{value ? 'Yes' : 'No'}</p>
            </div>
        );
    }

    if (typeof value === 'object') {
        const pairs = Object.entries(value).filter(([_, v]) => v !== null && v !== undefined && v !== '' && v !== '-');
        if (pairs.length === 0) return null;
        const strVal = pairs.map(([k, v]) => `${k}: ${v}`).join(' | ');
        return (
            <div key={key} className="bg-neutral-50 rounded-xl p-4 border border-neutral-100">
                <Label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block mb-1">{formattedKey}</Label>
                <p className="font-bold text-neutral-800 text-sm break-words">{strVal}</p>
            </div>
        );
    }

    return (
        <div key={key} className="bg-neutral-50 rounded-xl p-4 border border-neutral-100">
            <Label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block mb-1">{formattedKey}</Label>
            <p className="font-bold text-neutral-800 text-sm break-words">{String(value)}</p>
        </div>
    );
}

export default function DesignOrderDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [booking, setBooking] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Negotiation State
    const [quoteAmount, setQuoteAmount] = useState("");
    const [quoteNote, setQuoteNote] = useState("");
    const [proposalType, setProposalType] = useState<'simple' | 'detailed' | 'comparison'>('simple');
    const [lineItems, setLineItems] = useState<any[]>([
        { description: "", unit: "sft", quantity: 1, unitPrice: 0, total: 0 }
    ]);
    const [selectedInvoiceOffer, setSelectedInvoiceOffer] = useState<any>(null);
    const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
    const [quoteFileUrl, setQuoteFileUrl] = useState("");
    const [uploadingQuoteFile, setUploadingQuoteFile] = useState(false);
    const quoteFileRef = useRef<HTMLInputElement>(null);

    async function handleQuoteFileUpload(file: File) {
        setUploadingQuoteFile(true);
        try {
            const ext = file.name.split('.').pop();
            const path = `admin-quotes/${id}/quote-${Date.now()}.${ext}`;
            const { error: uploadError } = await supabase.storage.from('documents').upload(path, file, { upsert: true });
            if (uploadError) throw uploadError;
            const { data: { publicUrl } } = supabase.storage.from('documents').getPublicUrl(path);
            setQuoteFileUrl(publicUrl);
            alert("File uploaded!");
        } catch (e: any) {
            // Store file name as placeholder if bucket doesn't exist
            setQuoteFileUrl(`[Attached: ${file.name}]`);
        } finally {
            setUploadingQuoteFile(false);
        }
    }

    const addLineItem = () => {
        setLineItems([...lineItems, { description: "", unit: "sft", quantity: 1, unitPrice: 0, total: 0 }]);
    };

    const removeLineItem = (index: number) => {
        setLineItems(lineItems.filter((_, idx) => idx !== index));
    };

    const updateLineItem = (index: number, key: string, val: any) => {
        const items = [...lineItems];
        items[index][key] = val;
        items[index].total = Number(items[index].quantity || 0) * Number(items[index].unitPrice || 0);
        setLineItems(items);
    };

    // Schedule states for survey invitation
    const [selectedSurveyPartner, setSelectedSurveyPartner] = useState<any>(null);
    const [surveyDate, setSurveyDate] = useState("");
    const [surveyTime, setSurveyTime] = useState("");

    const handleSelectSurveyPartner = (id: string, role: 'designer' | 'seller' | 'service_provider', userId: string) => {
        resolveAndInvitePartner(id, role, userId);
    };

    async function resolveAndInvitePartner(partnerId: string, role: string, userId: string) {
        let name = "Partner";
        if (role === 'designer') {
            const { data } = await supabase.from('designers').select('company_name').eq('id', partnerId).single();
            if (data) name = data.company_name;
        } else if (role === 'seller') {
            const { data } = await supabase.from('sellers').select('business_name').eq('id', partnerId).single();
            if (data) name = data.business_name;
        } else if (role === 'service_provider') {
            const { data } = await supabase.from('service_providers').select('business_name').eq('id', partnerId).single();
            if (data) name = data.business_name;
        }

        setSelectedSurveyPartner({ id: partnerId, role, name, userId });
    }

    async function sendSurveyRequest() {
        if (!selectedSurveyPartner || !surveyDate || !surveyTime) {
            alert("Please select date and time for the survey.");
            return;
        }

        const requestObj = {
            partner_id: selectedSurveyPartner.id,
            partner_user_id: selectedSurveyPartner.userId,
            partner_name: selectedSurveyPartner.name,
            role: selectedSurveyPartner.role,
            schedule: { date: surveyDate, time: surveyTime },
            status: 'pending',
            quote: null
        };

        const currentRequests = booking.details?.survey_requests || [];
        if (currentRequests.some((r: any) => r.partner_id === selectedSurveyPartner.id)) {
            alert("This partner has already been invited.");
            return;
        }

        const updatedRequests = [...currentRequests, requestObj];
        const updatedDetails = {
            ...(booking.details || {}),
            survey_requests: updatedRequests
        };

        const { error } = await supabase
            .from('design_bookings')
            .update({ details: updatedDetails })
            .eq('id', id);

        if (!error) {
            setBooking({ ...booking, details: updatedDetails });
            alert("Survey request sent to partner!");
            
            await supabase.from('notifications').insert({
                user_id: selectedSurveyPartner.userId,
                title: 'New Survey Request',
                message: `You have received a survey request for project #${booking.id.slice(0, 8)}. Scheduled at ${surveyDate} at ${surveyTime}.`,
                link: `/dashboard/partner/design/${id}`,
                is_read: false
            });

            setSelectedSurveyPartner(null);
            setSurveyDate("");
            setSurveyTime("");
        } else {
            alert("Failed to send survey request: " + error.message);
        }
    }

    async function removePartnerSurvey(partnerId: string) {
        const currentRequests = booking.details?.survey_requests || [];
        const updatedRequests = currentRequests.filter((r: any) => r.partner_id !== partnerId);
        const updatedDetails = {
            ...(booking.details || {}),
            survey_requests: updatedRequests
        };

        const { error } = await supabase
            .from('design_bookings')
            .update({ details: updatedDetails })
            .eq('id', id);

        if (!error) {
            setBooking({ ...booking, details: updatedDetails });
            alert("Partner removed successfully.");
        } else {
            alert("Failed to remove partner: " + error.message);
        }
    }

    async function publishComparisonQuotation() {
        if (lineItems.length === 0 || !lineItems[0].description) {
            alert("Please add at least one line item in the Detailed Proposal tab first.");
            return;
        }

        const surveyRequests = booking.details?.survey_requests || [];
        const quotedPartners = surveyRequests.filter((r: any) => r.quote && r.status === 'accepted');

        if (quotedPartners.length === 0) {
            alert("No partners have submitted a quote yet.");
            return;
        }

        const comparisonLineItems = lineItems.map((item, index) => {
            const partnerRates: Record<string, number> = {};
            
            for (const p of quotedPartners) {
                const pItem = p.quote.line_items?.[index] || p.quote.line_items?.find((pi: any) => pi.description === item.description);
                partnerRates[p.partner_id] = pItem ? Number(pItem.total || 0) : 0;
            }

            return {
                description: item.description,
                unit: item.unit,
                quantity: Number(item.quantity || 0),
                unitPrice: Number(item.unitPrice || 0),
                partner_rates: partnerRates
            };
        });

        const newOffer = {
            role: 'admin',
            type: 'comparison',
            amount: lineItems.reduce((sum, item) => sum + (Number(item.quantity || 0) * Number(item.unitPrice || 0)), 0),
            notes: quoteNote || "Here is the side-by-side comparison quotation from our partners.",
            date: new Date().toISOString(),
            line_items: comparisonLineItems,
            partners: quotedPartners.map((p: any) => ({
                partner_id: p.partner_id,
                partner_name: p.partner_name,
                role: p.role,
                partner_user_id: p.partner_user_id
            }))
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
            alert("Comparison quotation published to customer!");
        } else {
            alert("Failed to publish comparison quotation: " + error.message);
        }
    }

    // Milestone State
    const [milestones, setMilestones] = useState<any[]>([]);

    const supabase = createClient();

    useEffect(() => {
        if (id) fetchBooking();
    }, [id]);

    async function fetchBooking() {
        try {
            const { data: bookingData, error: bookingError } = await supabase
                .from('design_bookings')
                .select('*, sellers(business_name), designers(company_name)')
                .eq('id', id)
                .single();

            if (bookingError) throw bookingError;

            const { data: profile } = await supabase
                .from('profiles')
                .select('full_name, phone_number, email')
                .eq('id', bookingData.user_id)
                .single();

            setBooking({ ...bookingData, profiles: profile });

            // Initialize milestones if empty
            if (!bookingData.milestones || bookingData.milestones.length === 0) {
                setMilestones(DEFAULT_MILESTONES.map(name => ({
                    name,
                    status: 'pending',
                    due_date: ''
                })));
            } else {
                setMilestones(bookingData.milestones);
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
        const finalAmount = proposalType === 'detailed'
            ? lineItems.reduce((sum, item) => sum + (Number(item.quantity || 0) * Number(item.unitPrice || 0)), 0)
            : Number(quoteAmount);

        if (!finalAmount) {
            alert("Please enter a valid quote amount.");
            return;
        }

        const newOffer = {
            role: 'admin',
            amount: finalAmount,
            notes: quoteNote,
            date: new Date().toISOString(),
            file_url: quoteFileUrl || null,
            ...(proposalType === 'detailed' && { line_items: lineItems })
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
            setLineItems([{ description: "", unit: "sft", quantity: 1, unitPrice: 0, total: 0 }]);
            alert("Quote sent successfully!");
        }
    }

    async function saveMilestones() {
        const { error } = await supabase
            .from('design_bookings')
            .update({ milestones: milestones })
            .eq('id', id);

        if (!error) {
            setBooking((prev: any) => prev ? { ...prev, milestones: milestones } : null);
            alert("Milestones saved successfully! Customer milestone roadmap updated.");
        } else {
            alert("Failed to save milestones: " + error.message);
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

    const [newMilestoneTitle, setNewMilestoneTitle] = useState("");

    function handleAddMilestone() {
        if (!newMilestoneTitle.trim()) return;
        const newMilestones = [
            ...milestones,
            { name: newMilestoneTitle.trim(), status: 'pending', due_date: '' }
        ];
        setMilestones(newMilestones);
        setNewMilestoneTitle("");
    }

    function handleUpdateMilestoneName(index: number, name: string) {
        const newMilestones = [...milestones];
        newMilestones[index].name = name;
        setMilestones(newMilestones);
    }

    function handleDeleteMilestone(index: number) {
        const newMilestones = milestones.filter((_, i) => i !== index);
        setMilestones(newMilestones);
    }

    function handleMoveMilestone(index: number, direction: 'up' | 'down') {
        if ((direction === 'up' && index === 0) || (direction === 'down' && index === milestones.length - 1)) return;
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        const newMilestones = [...milestones];
        const temp = newMilestones[index];
        newMilestones[index] = newMilestones[targetIndex];
        newMilestones[targetIndex] = temp;
        setMilestones(newMilestones);
    }

    async function assignPartner(partnerId: string, role?: 'designer' | 'seller' | 'service_provider', partnerUserId?: string) {
        let sellerId = role === 'seller' ? partnerId : null;
        const designerId = role === 'designer' ? partnerId : null;

        // If it's a designer, check if they also have a seller record for backwards compatibility
        if (role === 'designer' && partnerUserId) {
            const { data: seller } = await supabase
                .from('sellers')
                .select('id')
                .eq('user_id', partnerUserId)
                .single();
            if (seller) {
                sellerId = seller.id;
            }
        }

        const updateData: any = {
            assigned_seller_id: sellerId,
            assigned_designer_id: designerId,
            status: booking.status === 'verified' ? 'assigned' : booking.status
        };

        const { error } = await supabase
            .from('design_bookings')
            .update(updateData)
            .eq('id', id);

        if (!error) {
            setBooking({ ...booking, ...updateData });
            alert("Partner assigned successfully!");
            fetchBooking();
        } else {
            console.error("Assign error:", error);
            alert("Assignment failed: " + error.message);
        }
    }

    async function unassignPartner() {
        const { error } = await supabase
            .from('design_bookings')
            .update({
                assigned_seller_id: null,
                assigned_designer_id: null,
                status: 'verified'
            })
            .eq('id', id);

        if (!error) {
            setBooking({
                ...booking,
                assigned_seller_id: null,
                assigned_designer_id: null,
                status: 'verified'
            });
            alert("Partner removed successfully. You can now request new surveys.");
            fetchBooking();
        } else {
            console.error("Unassign error:", error);
            alert("Removal failed: " + error.message);
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
                                                    {offer.role === 'admin' && (
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => {
                                                                setSelectedInvoiceOffer(offer);
                                                                setIsInvoiceOpen(true);
                                                            }}
                                                            className="mt-3 h-8 text-[9px] font-black uppercase tracking-widest border-neutral-700 bg-neutral-800 text-white hover:bg-neutral-700 hover:text-white"
                                                        >
                                                            📄 View Proposal Invoice
                                                        </Button>
                                                    )}
                                                    <p className="text-[10px] mt-2 opacity-50 text-right">{format(new Date(offer.date), 'MMM d, h:mm a')}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Action Area */}
                                {(!lastOffer || lastOffer.role === 'customer' || booking.status === 'verified') && (
                                    <div className="bg-white p-6 rounded-2xl border border-neutral-200 space-y-4">
                                        <div className="flex gap-4 border-b border-neutral-100 pb-3">
                                            <button
                                                type="button"
                                                onClick={() => setProposalType('simple')}
                                                className={`text-xs font-black uppercase tracking-widest pb-1 border-b-2 transition-all ${proposalType === 'simple' ? 'border-primary-600 text-neutral-800' : 'border-transparent text-neutral-400 hover:text-neutral-600'}`}
                                            >
                                                Simple Quote
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setProposalType('detailed')}
                                                className={`text-xs font-black uppercase tracking-widest pb-1 border-b-2 transition-all ${proposalType === 'detailed' ? 'border-primary-600 text-neutral-800' : 'border-transparent text-neutral-400 hover:text-neutral-600'}`}
                                            >
                                                Detailed Proposal
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setProposalType('comparison')}
                                                className={`text-xs font-black uppercase tracking-widest pb-1 border-b-2 transition-all ${proposalType === 'comparison' ? 'border-blue-600 text-neutral-800' : 'border-transparent text-neutral-400 hover:text-neutral-600'}`}
                                            >
                                                Partner Quotes
                                            </button>
                                        </div>

                                        {proposalType === 'simple' ? (
                                            <div className="space-y-4">
                                                <div>
                                                    <Label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block mb-2">Send Quote Amount</Label>
                                                    <div className="flex gap-3">
                                                        <div className="flex-1">
                                                            <Input
                                                                type="number"
                                                                placeholder="Amount"
                                                                className="font-black text-lg h-12 rounded-xl"
                                                                value={quoteAmount}
                                                                onChange={(e) => setQuoteAmount(e.target.value)}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                                {/* File Upload for Simple Quote */}
                                                <div className="space-y-2">
                                                    <Label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block">Attach Quote Document (Optional)</Label>
                                                    <div
                                                        onClick={() => quoteFileRef.current?.click()}
                                                        className="border-2 border-dashed border-neutral-200 rounded-xl p-4 text-center cursor-pointer hover:border-primary-400 hover:bg-primary-50/30 transition-all"
                                                    >
                                                        <Upload className="w-5 h-5 text-neutral-400 mx-auto mb-1" />
                                                        <p className="text-xs font-bold text-neutral-400">
                                                            {uploadingQuoteFile ? 'Uploading...' : quoteFileUrl ? '✓ File attached' : 'Click to attach PDF or image'}
                                                        </p>
                                                    </div>
                                                    <input ref={quoteFileRef} type="file" accept=".pdf,.doc,.docx,.jpg,.png" className="hidden"
                                                        onChange={e => { const f = e.target.files?.[0]; if (f) handleQuoteFileUpload(f); }} />
                                                    {quoteFileUrl && quoteFileUrl.startsWith('http') && (
                                                        <a href={quoteFileUrl} target="_blank" rel="noopener noreferrer"
                                                            className="flex items-center gap-1.5 text-xs text-primary-600 font-bold hover:underline">
                                                            <FileText className="w-3.5 h-3.5" /> View Attached File ↗
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        ) : proposalType === 'comparison' ? (
                                            /* Partner Quote Comparison Tab */
                                            <div className="space-y-4">
                                                <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">All Partner Submitted Quotes</p>
                                                {(booking.details?.survey_requests || []).filter((r: any) => r.quote).length === 0 ? (
                                                    <div className="p-8 bg-neutral-50 rounded-2xl border border-dashed border-neutral-200 text-center">
                                                        <p className="text-neutral-400 text-sm font-bold">No partner quotes submitted yet.</p>
                                                        <p className="text-neutral-400 text-xs mt-1">Partners will submit their quotes after the site survey.</p>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-4">
                                                        {(booking.details?.survey_requests || []).filter((r: any) => r.quote).map((r: any, idx: number) => (
                                                            <div key={idx} className="bg-neutral-900 text-white rounded-2xl p-5 space-y-4">
                                                                {/* Partner Header */}
                                                                <div className="flex justify-between items-start">
                                                                    <div>
                                                                        <p className="font-black text-sm text-white">{r.partner_name}</p>
                                                                        <p className="text-[9px] text-neutral-400 font-bold uppercase tracking-widest mt-0.5">
                                                                            Survey: {r.schedule?.date} @ {r.schedule?.time}
                                                                        </p>
                                                                    </div>
                                                                    <div className="text-right">
                                                                        <p className="text-[9px] text-neutral-500 uppercase font-bold">Total Bid</p>
                                                                        <p className="text-xl font-black text-emerald-400">৳{r.quote.amount?.toLocaleString()}</p>
                                                                    </div>
                                                                </div>

                                                                {/* Line Items */}
                                                                {r.quote.line_items?.length > 0 && (
                                                                    <div className="space-y-2">
                                                                        <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">Line Items</p>
                                                                        <div className="bg-neutral-950 rounded-xl overflow-hidden">
                                                                            <table className="w-full text-xs">
                                                                                <thead>
                                                                                    <tr className="border-b border-neutral-800">
                                                                                        <th className="text-left p-3 font-black text-neutral-500 uppercase text-[9px]">Description</th>
                                                                                        <th className="text-center p-3 font-black text-neutral-500 uppercase text-[9px]">Unit</th>
                                                                                        <th className="text-right p-3 font-black text-neutral-500 uppercase text-[9px]">Qty</th>
                                                                                        <th className="text-right p-3 font-black text-neutral-500 uppercase text-[9px]">Rate</th>
                                                                                        <th className="text-right p-3 font-black text-neutral-500 uppercase text-[9px]">Total</th>
                                                                                    </tr>
                                                                                </thead>
                                                                                <tbody>
                                                                                    {r.quote.line_items.map((item: any, i: number) => (
                                                                                        <tr key={i} className="border-b border-neutral-800/50 last:border-0">
                                                                                            <td className="p-3 text-neutral-200 font-semibold">{item.description}</td>
                                                                                            <td className="p-3 text-neutral-400 text-center">{item.unit}</td>
                                                                                            <td className="p-3 text-neutral-400 text-right">{item.quantity}</td>
                                                                                            <td className="p-3 text-neutral-400 text-right">৳{Number(item.unitPrice || 0).toLocaleString()}</td>
                                                                                            <td className="p-3 text-neutral-200 font-black text-right">৳{(Number(item.quantity||0)*Number(item.unitPrice||0)).toLocaleString()}</td>
                                                                                        </tr>
                                                                                    ))}
                                                                                </tbody>
                                                                            </table>
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {/* Notes */}
                                                                {r.quote.notes && (
                                                                    <div className="bg-neutral-800/50 rounded-xl p-3">
                                                                        <p className="text-[9px] font-black text-neutral-500 uppercase tracking-widest mb-1">Notes</p>
                                                                        <p className="text-xs text-neutral-300 font-medium">{r.quote.notes}</p>
                                                                    </div>
                                                                )}

                                                                {/* PDF Attachment */}
                                                                {r.quote.file_url && (
                                                                    <a
                                                                        href={r.quote.file_url.startsWith('http') ? r.quote.file_url : '#'}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        download
                                                                        className="flex items-center gap-2 bg-blue-600/20 border border-blue-600/30 rounded-xl px-4 py-3 text-blue-300 font-bold text-xs hover:bg-blue-600/30 transition-colors"
                                                                    >
                                                                        <Download className="w-4 h-4" />
                                                                        Download Quote Document
                                                                        {!r.quote.file_url.startsWith('http') && (
                                                                            <span className="text-[9px] text-blue-400 ml-1">{r.quote.file_url}</span>
                                                                        )}
                                                                    </a>
                                                                )}

                                                                {/* Submitted date */}
                                                                <p className="text-[9px] text-neutral-600 font-bold uppercase tracking-widest text-right">
                                                                    Submitted: {r.quote.date ? format(new Date(r.quote.date), 'MMM d, yyyy h:mm a') : '-'}
                                                                </p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                <div className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Proposal Line Items</div>
                                                <div className="space-y-3">
                                                    {lineItems.map((item, idx) => (
                                                        <div key={idx} className="flex flex-col md:flex-row gap-3 items-start md:items-center bg-neutral-50 p-4 rounded-xl border border-neutral-100 relative">
                                                            <div className="flex-1 w-full">
                                                                <Label className="text-[9px] font-bold text-neutral-400 uppercase block mb-1">Description</Label>
                                                                <Input
                                                                    placeholder="Item description (e.g. Floor Plan)"
                                                                    value={item.description}
                                                                    onChange={(e) => updateLineItem(idx, 'description', e.target.value)}
                                                                    className="h-10 bg-white border-neutral-200 text-xs font-semibold rounded-lg"
                                                                />
                                                            </div>
                                                            <div className="w-full md:w-20">
                                                                <Label className="text-[9px] font-bold text-neutral-400 uppercase block mb-1">Unit</Label>
                                                                <Input
                                                                    placeholder="Unit"
                                                                    value={item.unit}
                                                                    onChange={(e) => updateLineItem(idx, 'unit', e.target.value)}
                                                                    className="h-10 bg-white border-neutral-200 text-xs font-semibold rounded-lg"
                                                                />
                                                            </div>
                                                            <div className="w-full md:w-20">
                                                                <Label className="text-[9px] font-bold text-neutral-400 uppercase block mb-1 text-right">Qty</Label>
                                                                <Input
                                                                    type="number"
                                                                    placeholder="Qty"
                                                                    value={item.quantity}
                                                                    onChange={(e) => updateLineItem(idx, 'quantity', Number(e.target.value))}
                                                                    className="h-10 bg-white border-neutral-200 text-xs font-semibold rounded-lg text-right"
                                                                />
                                                            </div>
                                                            <div className="w-full md:w-24">
                                                                <Label className="text-[9px] font-bold text-neutral-400 uppercase block mb-1 text-right">Unit Price</Label>
                                                                <Input
                                                                    type="number"
                                                                    placeholder="Price"
                                                                    value={item.unitPrice}
                                                                    onChange={(e) => updateLineItem(idx, 'unitPrice', Number(e.target.value))}
                                                                    className="h-10 bg-white border-neutral-200 text-xs font-semibold rounded-lg text-right"
                                                                />
                                                            </div>
                                                            <div className="w-full md:w-28 text-right font-black text-xs text-neutral-800 pr-2 pt-5">
                                                                ৳{(Number(item.quantity || 0) * Number(item.unitPrice || 0)).toLocaleString()}
                                                            </div>
                                                            {lineItems.length > 1 && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeLineItem(idx)}
                                                                    className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg transition-colors shrink-0 mt-5"
                                                                >
                                                                    <XCircle className="w-4 h-4" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="flex justify-between items-center bg-neutral-50/50 p-4 rounded-xl border border-dashed border-neutral-200">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        onClick={addLineItem}
                                                        className="h-9 px-4 border-neutral-200 hover:bg-neutral-100 text-xs font-bold rounded-lg text-neutral-600"
                                                    >
                                                        + Add Line
                                                    </Button>
                                                    <div className="text-right">
                                                        <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block mb-0.5">Calculated Total</span>
                                                        <span className="font-black text-lg text-neutral-900">৳{lineItems.reduce((sum, item) => sum + (Number(item.quantity || 0) * Number(item.unitPrice || 0)), 0).toLocaleString()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block">Deliverable Notes</Label>
                                            <Textarea
                                                placeholder="Add notes about deliverables..."
                                                className="rounded-xl resize-none min-h-[100px]"
                                                value={quoteNote}
                                                onChange={(e) => setQuoteNote(e.target.value)}
                                            />
                                        </div>

                                        <div className="pt-2 flex justify-end gap-3">
                                            {proposalType === 'detailed' && (booking.details?.survey_requests?.some((r: any) => r.quote)) && (
                                                <Button size="lg" onClick={publishComparisonQuotation} className="h-12 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black uppercase tracking-widest px-8">
                                                    Publish Comparison
                                                </Button>
                                            )}
                                            <Button size="lg" onClick={sendQuote} className="h-12 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-black uppercase tracking-widest px-10">
                                                Send Quote
                                            </Button>
                                        </div>
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
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {Object.entries(details).map(([key, value]) => renderDetailCard(key, value))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Customer & Milestones */}
                    <div className="space-y-8">
                        {/* Survey & Partner Bidding Manager */}
                        {(booking.status === 'verified' || booking.status === 'quotation' || booking.status === 'in_progress' || booking.status === 'assigned') && (
                            <div className="bg-white rounded-3xl p-6 border border-neutral-200 space-y-6">
                                <Label className="text-xs font-black text-neutral-400 uppercase tracking-widest block mb-1 flex items-center gap-2">
                                    <UserPlus className="w-4 h-4" /> Hired / Handoff Partner
                                </Label>

                                {booking.assigned_seller_id || booking.assigned_designer_id ? (
                                    <div className="bg-neutral-900 text-white p-4 rounded-2xl border border-neutral-800">
                                        <div className="flex justify-between items-center mb-1">
                                            <p className="font-bold text-xs uppercase tracking-widest text-emerald-400">Hired Partner</p>
                                            <Badge variant="secondary" className="text-[9px] bg-neutral-800 text-white border-none">
                                                ID: {(booking.assigned_seller_id || booking.assigned_designer_id).slice(0, 6)}...
                                            </Badge>
                                        </div>
                                        <p className="text-sm font-extrabold mt-1">
                                            {booking.sellers?.business_name || booking.designers?.company_name || 'Loading partner details...'}
                                        </p>
                                        <p className="text-[10px] text-neutral-400 font-medium mt-1">This partner is officially hired to execute the project milestones.</p>
                                        <Button
                                            onClick={unassignPartner}
                                            variant="ghost"
                                            className="w-full mt-3 h-8 bg-red-950/40 hover:bg-red-900/40 text-red-400 hover:text-red-300 font-bold uppercase text-[10px] tracking-wider rounded-lg border border-red-900/30"
                                        >
                                            Remove Assigned Partner
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-100 text-center">
                                        <p className="text-xs text-neutral-500 font-medium">No partner has been officially hired yet. Partners will quote after survey, and customer will choose.</p>
                                    </div>
                                )}

                                <Separator />

                                <div>
                                    <Label className="text-xs font-black text-neutral-400 uppercase tracking-widest block mb-3">Survey Requests to Partners</Label>
                                    <div className="space-y-3">
                                        {(booking.details?.survey_requests || []).map((request: any, idx: number) => (
                                            <div key={idx} className="bg-neutral-50 p-3 rounded-xl border border-neutral-100 flex justify-between items-start gap-2 relative">
                                                <div className="space-y-1">
                                                    <p className="font-bold text-xs text-neutral-900">{request.partner_name}</p>
                                                    <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">
                                                        📅 {request.schedule?.date} @ {request.schedule?.time}
                                                    </p>
                                                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                                        <Badge className={`text-[8px] font-black uppercase px-2 py-0.5 border-none ${
                                                            request.status === 'accepted' ? 'bg-green-100 text-green-700' :
                                                            request.status === 'declined' ? 'bg-red-100 text-red-700' :
                                                            'bg-amber-100 text-amber-700'
                                                        }`}>
                                                            {request.status}
                                                        </Badge>
                                                        {request.quote && (
                                                            <Badge className="text-[8px] font-black uppercase px-2 py-0.5 bg-blue-100 text-blue-700 border-none">
                                                                Quoted: ৳{request.quote.amount?.toLocaleString()}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    {/* PDF Download Link */}
                                                    {request.quote?.file_url && (
                                                        <a
                                                            href={request.quote.file_url.startsWith('http') ? request.quote.file_url : '#'}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            download
                                                            className="flex items-center gap-1 text-[9px] text-blue-600 font-bold hover:underline mt-1"
                                                        >
                                                            <Download className="w-3 h-3" /> Download Quote PDF
                                                        </a>
                                                    )}
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removePartnerSurvey(request.partner_id)}
                                                    className="text-neutral-400 hover:text-red-600 transition-colors p-1"
                                                    title="Remove Request"
                                                >
                                                    <XCircle className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                        {(booking.details?.survey_requests || []).length === 0 && (
                                            <p className="text-[10px] text-neutral-400 italic py-2">No partners have been invited for survey yet.</p>
                                        )}
                                    </div>
                                </div>

                                <Separator />

                                {/* Invite survey partners */}
                                <div className="space-y-3 bg-neutral-50 p-4 rounded-2xl border border-neutral-100">
                                    <h4 className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Add Partner to Survey</h4>
                                    
                                    {!selectedSurveyPartner ? (
                                        <AssignPartnerDialog 
                                            orderType="design" 
                                            serviceType={booking.service_type} 
                                            onAssign={handleSelectSurveyPartner} 
                                        />
                                    ) : (
                                        <div className="space-y-3">
                                            <div className="bg-neutral-900 text-white p-3 rounded-xl border border-neutral-800 flex justify-between items-center">
                                                <div>
                                                    <p className="font-bold text-xs">{selectedSurveyPartner.name}</p>
                                                    <p className="text-[8px] text-neutral-400 uppercase tracking-wider">{selectedSurveyPartner.role}</p>
                                                </div>
                                                <Button size="sm" variant="ghost" onClick={() => setSelectedSurveyPartner(null)} className="h-6 text-[9px] hover:bg-neutral-800 text-red-400 hover:text-red-300">
                                                    Cancel
                                                </Button>
                                            </div>

                                            <div className="grid grid-cols-2 gap-2">
                                                <div>
                                                    <Label className="text-[9px] font-bold text-neutral-400 uppercase block mb-1">Survey Date</Label>
                                                    <input
                                                        type="date"
                                                        value={surveyDate}
                                                        onChange={(e) => setSurveyDate(e.target.value)}
                                                        className="w-full bg-white border border-neutral-200 text-neutral-900 text-xs font-semibold rounded-lg h-9 px-2 focus:outline-none focus:ring-1 focus:ring-primary-500"
                                                    />
                                                </div>
                                                <div>
                                                    <Label className="text-[9px] font-bold text-neutral-400 uppercase block mb-1">Survey Time</Label>
                                                    <input
                                                        type="text"
                                                        placeholder="e.g. 11:00 AM"
                                                        value={surveyTime}
                                                        onChange={(e) => setSurveyTime(e.target.value)}
                                                        className="w-full bg-white border border-neutral-200 text-neutral-900 text-xs font-semibold rounded-lg h-9 px-2 focus:outline-none focus:ring-1 focus:ring-primary-500"
                                                    />
                                                </div>
                                            </div>

                                            <Button onClick={sendSurveyRequest} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-widest h-10 rounded-xl">
                                                Send Survey Request
                                            </Button>
                                        </div>
                                    )}
                                </div>
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
                        <div className="bg-white rounded-3xl p-6 border border-neutral-200 shadow-xl shadow-neutral-100 space-y-6">
                            <div className="flex justify-between items-center">
                                <h3 className="text-sm font-black text-neutral-900 uppercase tracking-widest flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-primary-600" />
                                    Project Milestones
                                </h3>
                                <Button size="sm" onClick={saveMilestones} className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider rounded-lg px-4 shadow-sm">
                                    Save Changes
                                </Button>
                            </div>

                            {/* Add New Milestone Form */}
                            <div className="bg-neutral-50 p-3.5 rounded-2xl border border-neutral-200/80 space-y-2">
                                <Label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block">Add New Milestone</Label>
                                <div className="flex gap-2">
                                    <Input
                                        type="text"
                                        placeholder="e.g. 3D Architectural Render"
                                        className="h-9 text-xs font-bold bg-white border-neutral-200 rounded-xl"
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
                                        className="h-9 px-4 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-black uppercase tracking-wider rounded-xl shrink-0"
                                    >
                                        <Plus className="w-3.5 h-3.5 mr-1" /> Add
                                    </Button>
                                </div>
                            </div>

                            {/* Milestones Timeline List */}
                            <div className="space-y-3 relative before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-neutral-100">
                                {milestones.map((milestone, idx) => (
                                    <div key={idx} className="relative pl-8 group">
                                        <div className={`absolute left-0 top-3 w-5 h-5 rounded-full border-4 transition-colors ${milestone.status === 'completed' ? 'border-primary-600 bg-primary-600' : 'border-neutral-200 bg-white'}`}></div>

                                        <div className="bg-neutral-50 p-3.5 rounded-2xl border border-neutral-100 group-hover:border-neutral-300 transition-all space-y-2.5">
                                            {/* Top Row: Re-order, Title Input, Checkbox & Delete */}
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
                                                        disabled={idx === milestones.length - 1}
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
                                                    className={`h-8 text-xs font-extrabold bg-transparent border-neutral-200 focus:bg-white px-2 rounded-lg ${milestone.status === 'completed' ? 'line-through text-neutral-400' : 'text-neutral-900'}`}
                                                />

                                                <Checkbox
                                                    checked={milestone.status === 'completed'}
                                                    onCheckedChange={() => toggleMilestone(idx)}
                                                    className="rounded-full data-[state=checked]:bg-primary-600 data-[state=checked]:border-primary-600 shrink-0"
                                                    title={milestone.status === 'completed' ? 'Mark Pending' : 'Mark Completed'}
                                                />

                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteMilestone(idx)}
                                                    className="text-neutral-300 hover:text-red-600 p-1 transition-colors shrink-0"
                                                    title="Delete Milestone"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>

                                            {/* Bottom Row: Due Date Input */}
                                            <div className="flex items-center gap-2 pt-1 border-t border-neutral-200/50">
                                                <Calendar className="w-3 h-3 text-neutral-400" />
                                                <span className="text-[9px] font-black text-neutral-400 uppercase">Target Date:</span>
                                                <input
                                                    type="date"
                                                    className="bg-white border border-neutral-200 rounded-md px-2 py-0.5 text-[10px] font-bold text-neutral-700 focus:outline-none focus:ring-1 focus:ring-primary-500"
                                                    value={milestone.due_date || ''}
                                                    onChange={(e) => updateMilestoneDate(idx, e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {milestones.length === 0 && (
                                    <p className="text-xs text-neutral-400 italic text-center py-4">No milestones defined yet. Use the form above to add custom milestones.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <ProposalInvoice 
                isOpen={isInvoiceOpen} 
                onClose={() => setIsInvoiceOpen(false)} 
                booking={booking} 
                offer={selectedInvoiceOffer} 
            />
        </>
    );
}
