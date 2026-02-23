"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { createClient } from '@/utils/supabase/client';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useDesignCart } from './DesignCartProvider';
import { X, Check, Calendar, Clock, ClipboardList } from 'lucide-react';

interface ProfileCheckoutCartProps {
    designerId: string;
    providerName: string;
    packages?: any[];
}

export function ProfileCheckoutCart({ designerId, providerName, packages = [] }: ProfileCheckoutCartProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const supabase = createClient();
    const { selectedPackageIds, removePackage, clearCart } = useDesignCart();

    const [loading, setLoading] = useState(false);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalStep, setModalStep] = useState(1);

    // Form Data
    const [projectData, setProjectData] = useState({
        landArea: '',
        storeys: '',
        basement: 'No'
    });
    const [scheduleData, setScheduleData] = useState({
        date: '',
        time: ''
    });

    const isJourneyFlow = searchParams.get('flow') === 'journey';

    // Compute derived state
    const selectedPackages = packages.filter(p => selectedPackageIds.includes(p.id));

    // Document states
    const [docs, setDocs] = useState({
        hasDeed: false,
        hasSurveyMap: false,
        hasMutation: false,
        hasTax: false,
        hasNID: false,
        hasLandPermit: false,
        hasBuildingApproval: false,
    });

    const toggleDoc = (key: keyof typeof docs) => {
        setDocs(prev => ({ ...prev, [key]: !prev[key] }));
    };

    let price = 0;

    // Dynamic price calculation
    if (packages.length > 0) {
        price = selectedPackages.reduce((sum, pkg) => sum + pkg.price, 0);
    } else {
        // Fallback pricing
        price = 80000;
    }

    const timeSlots = [
        "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
        "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM",
        "06:00 PM", "07:00 PM", "08:00 PM", "09:00 PM", "10:00 PM", "11:00 PM"
    ];

    const handleInitialCheckoutClick = () => {
        if (selectedPackageIds.length === 0) {
            alert("Please select at least one package to continue.");
            return;
        }
        setModalStep(isJourneyFlow ? 2 : 1);
        setIsModalOpen(true);
    };

    const handleNextStep = () => {
        if (modalStep === 1) {
            if (!projectData.landArea || !projectData.storeys) {
                alert("Please fill in the required project details.");
                return;
            }
            setModalStep(2);
        }
    };

    const handleSubmit = async () => {
        if (!scheduleData.date || !scheduleData.time) {
            alert("Please select a preferred date and time slot.");
            return;
        }

        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                // Keep the current URL so they return to this profile
                const currentPath = window.location.pathname;
                router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
                return;
            }

            const payloadDetails = {
                designerOption: selectedPackageIds.length > 0 ? selectedPackageIds.join(',') : 'legacy',
                packageIds: selectedPackageIds,
                packagesInfo: selectedPackages.map(p => ({
                    id: p.id,
                    title: p.title,
                    unit: p.unit,
                    price: p.price
                })),
                ...docs,
                designerSelectionType: 'list',
                selectedDesignerId: designerId,
                tentativePrice: price,
                projectScope: isJourneyFlow ? 'Provided in Journey' : projectData,
                preferredSchedule: scheduleData
            };

            const { error } = await supabase.from('design_bookings').insert({
                user_id: user.id,
                service_type: 'architectural',
                status: 'pending',
                details: payloadDetails
            });

            if (error) throw error;
            setIsModalOpen(false);
            clearCart();
            router.push('/dashboard/customer?booking=success');
        } catch (err) {
            console.error(err);
            alert('Failed to submit booking. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-neutral-200 overflow-hidden flex flex-col sticky top-24">
            {/* Header section mirroring tentative quotation */}
            <div className="bg-[#f3fbfa] p-6 border-b border-neutral-200">
                <h3 className="text-[18px] font-black text-neutral-900 tracking-tight leading-none mb-1">Direct Checkout</h3>
                <p className="text-[11px] font-medium text-neutral-600 mb-4">Status: Waiting for Admin Verification upon submission</p>

                <div className="text-left mt-2">
                    <div className="flex items-center gap-1 font-black text-[28px] text-[#0a1b3d] leading-none">
                        <span className="text-[22px]">৳</span> {price.toLocaleString()}
                    </div>
                    <p className="text-[10px] font-black tracking-widest text-[#0a1b3d]/70 uppercase mt-1">Starting Price</p>
                </div>
            </div>

            <div className="p-6 space-y-6 flex-grow bg-white">

                {/* Service Details Block */}
                <div className="space-y-4">
                    <h4 className="text-[11px] font-black text-neutral-400 uppercase tracking-widest">Service Details</h4>

                    <div className="space-y-3">
                        <div>
                            <Label className="text-[12px] font-bold text-neutral-600 mb-1.5 block">Selected Packages</Label>

                            {selectedPackages.length > 0 ? (
                                <div className="space-y-2">
                                    {selectedPackages.map(pkg => (
                                        <div key={pkg.id} className="flex items-center justify-between bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3">
                                            <div className="flex-1 min-w-0 pr-2">
                                                <p className="text-[13px] font-bold text-neutral-900 truncate">{pkg.title}</p>
                                                <p className="text-[11px] font-bold text-primary-600">৳{pkg.price.toLocaleString()}</p>
                                            </div>
                                            <button
                                                onClick={() => removePackage(pkg.id)}
                                                className="w-6 h-6 flex items-center justify-center rounded-full bg-white border border-neutral-200 text-neutral-400 hover:text-red-500 hover:border-red-200 transition-colors flex-shrink-0"
                                                type="button"
                                                title="Remove package"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : packages.length > 0 ? (
                                <div className="bg-neutral-50 border border-dashed border-neutral-300 rounded-xl p-6 text-center">
                                    <p className="text-[12px] font-bold text-neutral-500">Pick packages from the inventory lists</p>
                                </div>
                            ) : (
                                <div className="bg-neutral-50 px-4 py-3 border border-neutral-200 rounded-xl text-center">
                                    <p className="text-[12px] font-bold text-neutral-500">Service Custom Booking</p>
                                </div>
                            )}
                        </div>

                        <div>
                            <Label className="text-[12px] font-bold text-neutral-600 mb-1 block">Assigned Provider</Label>
                            <div className="text-[14px] font-black text-neutral-900 line-clamp-1 bg-neutral-50 px-4 py-2.5 rounded-xl border border-neutral-100">
                                {providerName}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Documents Ready Block */}
                <div>
                    <h4 className="text-[11px] font-black text-neutral-400 uppercase tracking-widest mb-3">Documents Ready</h4>

                    <div className="flex flex-wrap gap-2">
                        {Object.entries(docs).map(([key, value]) => {
                            const labelMap: Record<string, string> = {
                                hasDeed: 'Deed',
                                hasSurveyMap: 'Survey Map',
                                hasMutation: 'Mutation',
                                hasTax: 'Tax',
                                hasNID: 'NID',
                                hasLandPermit: 'Land Permit',
                                hasBuildingApproval: 'Approval',
                            };
                            return (
                                <button
                                    key={key}
                                    onClick={() => toggleDoc(key as keyof typeof docs)}
                                    className={`px-3 py-1.5 rounded-full font-bold text-[11px] transition-all cursor-pointer select-none ${value
                                        ? 'bg-[#effdf5] text-[#00a651] border border-[#d6f6e5]'
                                        : 'bg-white text-neutral-500 border border-neutral-200 hover:bg-neutral-50 hover:text-neutral-700'
                                        }`}
                                >
                                    {labelMap[key]}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Action Area */}
            <div className="p-6 pt-0 mt-auto bg-white border-t border-neutral-100/50">
                <Button
                    onClick={handleInitialCheckoutClick}
                    disabled={loading || selectedPackageIds.length === 0}
                    className="w-full mt-4 bg-[#1e3a8a] py-6 rounded-xl hover:bg-[#1e3a8a]/90 text-white shadow-lg shadow-[#1e3a8a]/20 font-black text-[15px] relative overflow-hidden group"
                >
                    <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                    <span className="relative z-10">
                        Continue to Checkout
                    </span>
                </Button>
                <p className="text-center text-[10px] text-neutral-400 mt-3 font-bold tracking-wide uppercase">No upfront payment required</p>
            </div>

            {/* Checkout Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-white rounded-3xl">
                    <div className="bg-[#f3fbfa] p-6 border-b border-neutral-100">
                        <DialogTitle className="text-xl font-black text-[#0a1b3d]">
                            {modalStep === 1 ? "Project Scope Details" : "Schedule a Consultation"}
                        </DialogTitle>
                        <DialogDescription className="text-neutral-500 text-sm mt-1">
                            {modalStep === 1
                                ? "We need a few details about your property before continuing."
                                : "When should the designer or our admin contact you?"}
                        </DialogDescription>
                    </div>

                    <div className="p-6 space-y-6">
                        {modalStep === 1 && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div>
                                    <Label className="text-xs font-bold text-neutral-600 block mb-1.5">Total Land Area (approx.)</Label>
                                    <div className="relative">
                                        <Input
                                            placeholder="e.g. 5 Kata / 2400 sqft"
                                            value={projectData.landArea}
                                            onChange={(e) => setProjectData({ ...projectData, landArea: e.target.value })}
                                            className="h-11 rounded-xl bg-neutral-50 border-neutral-200"
                                        />
                                        <ClipboardList className="w-4 h-4 text-neutral-400 absolute right-4 top-1/2 -translate-y-1/2" />
                                    </div>
                                </div>
                                <div>
                                    <Label className="text-xs font-bold text-neutral-600 block mb-1.5">Number of Desired Storeys</Label>
                                    <Input
                                        type="number"
                                        placeholder="e.g. 6"
                                        value={projectData.storeys}
                                        onChange={(e) => setProjectData({ ...projectData, storeys: e.target.value })}
                                        className="h-11 rounded-xl bg-neutral-50 border-neutral-200"
                                    />
                                </div>
                                <div>
                                    <Label className="text-xs font-bold text-neutral-600 block mb-1.5">Do you need a basement?</Label>
                                    <select
                                        value={projectData.basement}
                                        onChange={(e) => setProjectData({ ...projectData, basement: e.target.value })}
                                        className="w-full h-11 rounded-xl bg-neutral-50 border border-neutral-200 px-4 text-sm font-medium outline-none"
                                    >
                                        <option value="No">No Basement</option>
                                        <option value="1 Level">1 Level Basement</option>
                                        <option value="2 Levels">2 Levels Basement</option>
                                        <option value="Unsure">Unsure</option>
                                    </select>
                                </div>
                            </div>
                        )}

                        {modalStep === 2 && (
                            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div>
                                    <Label className="text-xs font-bold text-neutral-600 block mb-1.5">Preferred Date</Label>
                                    <div className="relative">
                                        <Input
                                            type="date"
                                            min={new Date().toISOString().split('T')[0]}
                                            value={scheduleData.date}
                                            onChange={(e) => setScheduleData({ ...scheduleData, date: e.target.value })}
                                            className="h-11 rounded-xl bg-neutral-50 border-neutral-200 pr-4"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <Label className="text-xs font-bold text-neutral-600 block mb-2">Preferred Time Slot</Label>
                                    <div className="grid grid-cols-3 gap-2 max-h-[220px] overflow-y-auto p-1 pr-2 scrollbar-thin">
                                        {timeSlots.map((time) => (
                                            <button
                                                key={time}
                                                onClick={() => setScheduleData({ ...scheduleData, time })}
                                                className={`text-xs py-2.5 rounded-lg border font-bold transition-all ${scheduleData.time === time
                                                    ? 'bg-[#1e3a8a] text-white border-[#1e3a8a] shadow-md shadow-blue-900/10'
                                                    : 'bg-white text-neutral-600 border-neutral-200 hover:border-blue-300 hover:bg-blue-50'
                                                    }`}
                                            >
                                                {time}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="p-6 pt-0 border-t border-neutral-100 flex gap-3 mt-2 bg-neutral-50/50">
                        {modalStep === 2 && !isJourneyFlow ? (
                            <Button
                                variant="outline"
                                className="flex-1 h-12 rounded-xl border-neutral-200"
                                onClick={() => setModalStep(1)}
                            >
                                Back
                            </Button>
                        ) : (
                            <Button
                                variant="outline"
                                className="flex-1 h-12 rounded-xl border-neutral-200"
                                onClick={() => setIsModalOpen(false)}
                            >
                                Cancel
                            </Button>
                        )}

                        {modalStep === 1 ? (
                            <Button
                                className="flex-1 h-12 rounded-xl bg-[#0a1b3d] hover:bg-[#1a2f5c] text-white"
                                onClick={handleNextStep}
                            >
                                Next Step
                            </Button>
                        ) : (
                            <Button
                                className="flex-1 h-12 rounded-xl bg-[#00a651] hover:bg-[#009045] text-white shadow-lg shadow-[#00a651]/20"
                                onClick={handleSubmit}
                                disabled={loading || !scheduleData.date || !scheduleData.time}
                            >
                                {loading ? 'Booking...' : 'Confirm Request'}
                            </Button>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
