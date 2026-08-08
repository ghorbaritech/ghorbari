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
    const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    
    if (value === null || value === undefined || value === '') {
        return (
            <div key={key} className="bg-neutral-50 rounded-xl p-4 border border-neutral-100">
                <Label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block mb-1">{formattedKey}</Label>
                <p className="font-bold text-neutral-800 text-sm">-</p>
            </div>
        );
    }

    // Custom Formatter for Building Details
    if (key === 'buildingDetails' && typeof value === 'object') {
        const { landArea, landAreaUnit, floors, layouts } = value;
        return (
            <div key={key} className="bg-neutral-50 rounded-xl p-6 border border-neutral-100 col-span-1 md:col-span-2 space-y-4">
                <Label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block border-b border-neutral-200/60 pb-2">{formattedKey}</Label>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div>
                        <span className="text-[10px] font-bold text-neutral-400 block uppercase">Total Floors</span>
                        <span className="font-extrabold text-neutral-800 text-base">{floors || '-'}</span>
                    </div>
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
        return (
            <div key={key} className="bg-neutral-50 rounded-xl p-4 border border-neutral-100">
                <Label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block mb-1">{formattedKey}</Label>
                <p className="font-bold text-neutral-800 text-sm">
                    {formattedDate ? `${formattedDate} at ${value.time || '-'}` : '-'}
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
    const [proposalType, setProposalType] = useState<'simple' | 'detailed'>('simple');
    const [lineItems, setLineItems] = useState<any[]>([
        { description: "", unit: "sft", quantity: 1, unitPrice: 0, total: 0 }
    ]);
    const [selectedInvoiceOffer, setSelectedInvoiceOffer] = useState<any>(null);
    const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);

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
                                        </div>

                                        {proposalType === 'simple' ? (
                                            <div className="space-y-3">
                                                <Label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block">Send Quote Amount</Label>
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

                                        <div className="pt-2 flex justify-end">
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
                        {/* Partner Assignment */}
                        {(booking.status === 'verified' || booking.status === 'quotation' || booking.status === 'in_progress' || booking.status === 'assigned') && (
                            <div className="bg-white rounded-3xl p-6 border border-neutral-200">
                                <Label className="text-xs font-black text-neutral-400 uppercase tracking-widest block mb-4 flex items-center gap-2">
                                    <UserPlus className="w-4 h-4" /> Assigned Partner
                                </Label>

                                {booking.assigned_seller_id || booking.assigned_designer_id ? (
                                    <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-100">
                                        <div className="flex justify-between items-center mb-1">
                                            <p className="font-bold text-sm text-neutral-900">Partner Assigned</p>
                                            <Badge variant="outline" className="text-[10px] bg-white">
                                                ID: {(booking.assigned_seller_id || booking.assigned_designer_id).slice(0, 6)}...
                                            </Badge>
                                        </div>
                                        <p className="text-xs font-bold text-neutral-800 mt-2">
                                            {booking.sellers?.business_name || booking.designers?.company_name || 'Loading partner details...'}
                                        </p>
                                        <p className="text-xs text-neutral-500 font-medium mt-1">This partner can now manage milestones.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <p className="text-xs text-neutral-500 font-medium">Assign a verified partner to handle this project.</p>
                                        <AssignPartnerDialog 
                                            orderType="design" 
                                            serviceType={booking.service_type} 
                                            onAssign={assignPartner} 
                                        />
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

            <ProposalInvoice 
                isOpen={isInvoiceOpen} 
                onClose={() => setIsInvoiceOpen(false)} 
                booking={booking} 
                offer={selectedInvoiceOffer} 
            />
        </>
    );
}
