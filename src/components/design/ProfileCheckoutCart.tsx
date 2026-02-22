"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { createClient } from '@/utils/supabase/client';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface ProfileCheckoutCartProps {
    designerId: string;
    providerName: string;
}

export function ProfileCheckoutCart({ designerId, providerName }: ProfileCheckoutCartProps) {
    const router = useRouter();
    const supabase = createClient();

    const [loading, setLoading] = useState(false);

    const [designerOption, setDesignerOption] = useState<'both' | 'design' | 'approval'>('both');

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

    let price = 80000;
    if (designerOption === 'design') price = 50000;
    if (designerOption === 'approval') price = 30000;

    const handleSubmit = async () => {
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
                designerOption,
                ...docs,
                designerSelectionType: 'list',
                selectedDesignerId: designerId,
                tentativePrice: price
            };

            const { error } = await supabase.from('design_bookings').insert({
                user_id: user.id,
                service_type: 'structural-architectural',
                status: 'pending',
                details: payloadDetails
            });

            if (error) throw error;
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
                            <Label className="text-[12px] font-bold text-neutral-600 mb-1.5 block">Service Area</Label>
                            <select
                                value={designerOption}
                                onChange={(e) => setDesignerOption(e.target.value as any)}
                                className="w-full bg-neutral-50 border border-neutral-200 text-neutral-900 text-[14px] font-bold rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all appearance-none cursor-pointer"
                                style={{
                                    backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                                    backgroundRepeat: 'no-repeat',
                                    backgroundPosition: 'right 1rem center',
                                    backgroundSize: '1em'
                                }}
                            >
                                <option value="both">Approval & Design</option>
                                <option value="design">Building Design Only</option>
                                <option value="approval">Building Approval Only</option>
                            </select>
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
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full mt-4 bg-[#1e3a8a] py-6 rounded-xl hover:bg-[#1e3a8a]/90 text-white shadow-lg shadow-[#1e3a8a]/20 font-black text-[15px] relative overflow-hidden group"
                >
                    <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                    <span className="relative z-10">
                        {loading ? 'Processing...' : 'Complete Booking'}
                    </span>
                </Button>
                <p className="text-center text-[10px] text-neutral-400 mt-3 font-bold tracking-wide uppercase">No upfront payment required</p>
            </div>
        </div>
    );
}
