"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { createClient } from '@/utils/supabase/client';
import { Label } from '@/components/ui/label';
import { useDesignCart } from './DesignCartProvider';
import { X } from 'lucide-react';
import { PreBookingModal } from './PreBookingModal';

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

    const isJourneyFlow = searchParams.get('flow') === 'journey';

    // Compute derived state
    const selectedPackages = packages.filter(p => selectedPackageIds.includes(p.id));
    let price = selectedPackages.reduce((sum, pkg) => sum + pkg.price, 0);

    // Apply bundle logic specific to Ghorbari if needed
    // Note: developerOption is not defined in the provided context, assuming it's meant to be passed or derived.
    // For now, this line might cause a linting error if developerOption is not available.
    // if (developerOption === 'both' && selectedPackageIds.length === 2 && price === 100000) {
    //     price = 80000;
    // }

    // Determine Journey Types from packages for the modal
    const getJourneyTypes = (): ('design' | 'approval' | 'interior')[] => {
        if (selectedPackages.length === 0) return [];

        const checkCategory = (c: any, keyword: string): boolean => {
            if (!c) return false;
            const name = c.name?.toLowerCase() || '';
            if (name.includes(keyword)) return true;
            return checkCategory(c.parent, keyword);
        };

        const types: ('design' | 'approval' | 'interior')[] = [];
        let hasBuildingLogic = false;
        let hasApproval = false;
        let hasInterior = false;

        selectedPackages.forEach(pkg => {
            const cat = pkg.category;
            // Check taxonomy tree first
            if (checkCategory(cat, 'interior')) hasInterior = true;
            if (checkCategory(cat, 'approval')) hasApproval = true;
            if (checkCategory(cat, 'building design') || checkCategory(cat, 'structural')) hasBuildingLogic = true;

            // Fallback to title keywords if category mapping is missing
            if (!hasInterior && !hasApproval && !hasBuildingLogic) {
                const title = pkg.title.toLowerCase();
                if (title.includes('interior')) hasInterior = true;
                if (title.includes('blueprint') || title.includes('architectural')) hasBuildingLogic = true;
                if (title.includes('rajuk') || title.includes('approval')) hasApproval = true;
            }
        });

        if (hasInterior) types.push('interior');
        if (hasBuildingLogic) types.push('design');
        if (hasApproval) types.push('approval');

        return types.length > 0 ? types : ['design']; // Fallback
    };
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

    // Dynamic price calculation
    if (packages.length > 0) {
        price = selectedPackages.reduce((sum, pkg) => sum + pkg.price, 0);
    } else {
        // Fallback pricing
        price = 80000;
    }

    const handleInitialCheckoutClick = () => {
        if (selectedPackageIds.length === 0) {
            alert("Please select at least one package to continue.");
            return;
        }

        // If journey flow, just submit immediately (using the basic UI from the final journey step)
        if (isJourneyFlow) {
            // For journey flow, we'd normally want to trigger submit, but we need date/time.
            // Let's just open the modal to the last step in Journey flow
            setIsModalOpen(true);
            return;
        }
        setIsModalOpen(true);
    };

    const handleModalSubmit = async (scheduleData: any, projectData: any) => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                // Keep the current URL so they return to this profile
                const currentPath = window.location.pathname;
                router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
                return;
            }

            const journeyTypes = getJourneyTypes();
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
                preferredSchedule: scheduleData,
                journeyTypes // Include the types in metadata
            };

            const serviceType = journeyTypes.includes('interior') ? 'interior' : 'architectural';

            const { error } = await supabase.from('design_bookings').insert({
                user_id: user.id,
                service_type: serviceType,
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

            {/* Modified Action Area */}
            <div className="p-6 pt-0 mt-auto bg-white border-t border-neutral-100/50">
                <Button
                    onClick={handleInitialCheckoutClick}
                    disabled={loading || selectedPackageIds.length === 0}
                    className="w-full mt-4 bg-[#1e3a8a] py-6 rounded-xl hover:bg-[#1e3a8a]/90 text-white shadow-lg shadow-[#1e3a8a]/20 font-black text-[15px] relative overflow-hidden group"
                >
                    <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                    <span className="relative z-10">
                        {loading ? 'Processing...' : 'Continue to Checkout'}
                    </span>
                </Button>
                <p className="text-center text-[10px] text-neutral-400 mt-3 font-bold tracking-wide uppercase">No upfront payment required</p>
            </div>

            <PreBookingModal
                isOpen={isModalOpen}
                setIsOpen={setIsModalOpen}
                journeyTypes={getJourneyTypes()}
                onSubmit={handleModalSubmit}
            />
        </div>
    );
}
