"use client";

import { useState, ReactNode } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioCardGroup, Option } from '@/components/design/WizardFormComponents';
import { ClipboardList } from 'lucide-react';

interface PreBookingModalProps {
    isOpen: boolean;
    setIsOpen: (val: boolean) => void;
    journeyTypes: ('design' | 'approval' | 'interior')[];
    onSubmit: (scheduleData: any, projectData: any) => Promise<void>;
}

export function PreBookingModal({ isOpen, setIsOpen, journeyTypes = [], onSubmit }: PreBookingModalProps) {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Form Data - Shared
    const [scheduleData, setScheduleData] = useState({ date: '', time: '' });

    // Form Data - Design
    const [designData, setDesignData] = useState({
        landAreaKatha: '',
        initialFloors: '',
        unitsPerFloor: '',
        bedroomsPerUnit: '',
        bathroomsPerUnit: '',
        drawingRoomPerUnit: '',
        kitchenPerUnit: '',
        balconyPerUnit: '',
        othersPerUnit: '',
        plotOrientation: [] as string[],
        specialZones: [] as string[],
        soilTest: '',
        roofFeatures: [] as string[],
        structuralVibe: '',
    });

    // Form Data - Interior
    const [interiorData, setInteriorData] = useState({
        propertyType: '',
        houseType: '',
        intFloors: '',
        intUnitsPerFloor: '',
        intAreaPerUnit: '',
        aptSize: '',
        aptRooms: '',
        specificAreaType: '',
        bedRoomType: '',
        designScope: '',
        roomSize: '',
        specificInstruction: '',
    });

    const timeSlots = [
        "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
        "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM",
        "06:00 PM", "07:00 PM", "08:00 PM", "09:00 PM", "10:00 PM", "11:00 PM"
    ];

    const toggleArrayItem = (key: keyof typeof designData, value: string) => {
        setDesignData(prev => {
            const arr = prev[key] as string[];
            if (arr.includes(value)) {
                return { ...prev, [key]: arr.filter(item => item !== value) };
            }
            return { ...prev, [key]: [...arr, value] };
        });
    };

    const handleNext = () => setStep(s => s + 1);
    const handleBack = () => setStep(s => s - 1);

    const handleFinalSubmit = async () => {
        if (!scheduleData.date || !scheduleData.time) {
            alert("Please select a preferred date and time slot.");
            return;
        }
        setLoading(true);
        const payloadData = {
            design: journeyTypes.includes('design') ? designData : undefined,
            interior: journeyTypes.includes('interior') ? interiorData : undefined,
            approval: journeyTypes.includes('approval') ? true : undefined,
        };
        await onSubmit(scheduleData, payloadData);
        setLoading(false);
    };

    // Helper rendering functions for specific steps
    const renderDesignStep1 = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 max-h-[60vh] overflow-y-auto pr-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label className="text-xs font-bold text-neutral-600">Land Area (Katha)</Label>
                    <Input type="number" placeholder="e.g. 5" value={designData.landAreaKatha} onChange={(e) => setDesignData({ ...designData, landAreaKatha: e.target.value })} className="bg-neutral-50 h-11" />
                </div>
                <div className="space-y-2">
                    <Label className="text-xs font-bold text-neutral-600">Initial Floors</Label>
                    <Input type="number" placeholder="e.g. 2" value={designData.initialFloors} onChange={(e) => setDesignData({ ...designData, initialFloors: e.target.value })} className="bg-neutral-50 h-11" />
                </div>
                <div className="space-y-2">
                    <Label className="text-xs font-bold text-neutral-600">Units Per Floor</Label>
                    <Input type="number" placeholder="e.g. 2" value={designData.unitsPerFloor} onChange={(e) => setDesignData({ ...designData, unitsPerFloor: e.target.value })} className="bg-neutral-50 h-11" />
                </div>
                <div className="space-y-2">
                    <Label className="text-xs font-bold text-neutral-600">Bedrooms Per Unit</Label>
                    <Input type="number" placeholder="e.g. 3" value={designData.bedroomsPerUnit} onChange={(e) => setDesignData({ ...designData, bedroomsPerUnit: e.target.value })} className="bg-neutral-50 h-11" />
                </div>
                <div className="space-y-2">
                    <Label className="text-xs font-bold text-neutral-600">Bathrooms Per Unit</Label>
                    <Input type="number" placeholder="e.g. 2" value={designData.bathroomsPerUnit} onChange={(e) => setDesignData({ ...designData, bathroomsPerUnit: e.target.value })} className="bg-neutral-50 h-11" />
                </div>
                <div className="space-y-2">
                    <Label className="text-xs font-bold text-neutral-600">Drawing Room Per Unit</Label>
                    <Input type="number" placeholder="e.g. 1" value={designData.drawingRoomPerUnit} onChange={(e) => setDesignData({ ...designData, drawingRoomPerUnit: e.target.value })} className="bg-neutral-50 h-11" />
                </div>
                <div className="space-y-2">
                    <Label className="text-xs font-bold text-neutral-600">Kitchen Per Unit</Label>
                    <Input type="number" placeholder="e.g. 1" value={designData.kitchenPerUnit} onChange={(e) => setDesignData({ ...designData, kitchenPerUnit: e.target.value })} className="bg-neutral-50 h-11" />
                </div>
                <div className="space-y-2">
                    <Label className="text-xs font-bold text-neutral-600">Balcony Per Unit</Label>
                    <Input type="number" placeholder="e.g. 2" value={designData.balconyPerUnit} onChange={(e) => setDesignData({ ...designData, balconyPerUnit: e.target.value })} className="bg-neutral-50 h-11" />
                </div>
                <div className="space-y-2 sm:col-span-2">
                    <Label className="text-xs font-bold text-neutral-600">Other Rooms (e.g. Dining, Family living)</Label>
                    <Input type="text" placeholder="e.g. Dining, Family living" value={designData.othersPerUnit} onChange={(e) => setDesignData({ ...designData, othersPerUnit: e.target.value })} className="bg-neutral-50 h-11" />
                </div>
            </div>
        </div>
    );

    const renderDesignStep2 = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 max-h-[60vh] overflow-y-auto pr-2">
            <div className="space-y-3">
                <Label className="text-sm font-bold text-neutral-800">Plot Orientation (Facing)</Label>
                <div className="grid grid-cols-2 gap-3">
                    {(['North', 'South', 'East', 'West'] as const).map(opt => (
                        <div key={opt} className={`border rounded-xl p-3 flex items-center gap-3 cursor-pointer transition-all ${designData.plotOrientation.includes(opt) ? 'bg-primary-50 border-primary-600 shadow-sm' : 'hover:bg-neutral-50'}`} onClick={() => toggleArrayItem('plotOrientation', opt)}>
                            <Checkbox checked={designData.plotOrientation.includes(opt)} className="mt-0.5" />
                            <span className="text-sm font-bold">{opt}</span>
                        </div>
                    ))}
                </div>
            </div>
            <div className="space-y-3">
                <Label className="text-sm font-bold text-neutral-800">Special Zones Required</Label>
                <div className="grid grid-cols-2 gap-3">
                    {(['Prayer room', 'Home Office', 'Maid\'s room', 'Parking'] as const).map(opt => (
                        <div key={opt} className={`border rounded-xl p-3 flex items-center gap-3 cursor-pointer transition-all ${designData.specialZones.includes(opt) ? 'bg-primary-50 border-primary-600 shadow-sm' : 'hover:bg-neutral-50'}`} onClick={() => toggleArrayItem('specialZones', opt)}>
                            <Checkbox checked={designData.specialZones.includes(opt)} className="mt-0.5" />
                            <span className="text-sm font-bold">{opt}</span>
                        </div>
                    ))}
                </div>
            </div>
            <div className="space-y-3">
                <Label className="text-sm font-bold text-neutral-800">Roof Features</Label>
                <div className="grid grid-cols-2 gap-3">
                    {(['Roof garden', 'Swimming pool'] as const).map(opt => (
                        <div key={opt} className={`border rounded-xl p-3 flex items-center gap-3 cursor-pointer transition-all ${designData.roofFeatures.includes(opt) ? 'bg-primary-50 border-primary-600 shadow-sm' : 'hover:bg-neutral-50'}`} onClick={() => toggleArrayItem('roofFeatures', opt)}>
                            <Checkbox checked={designData.roofFeatures.includes(opt)} className="mt-0.5" />
                            <span className="text-sm font-bold">{opt}</span>
                        </div>
                    ))}
                </div>
            </div>
            <div className="space-y-3">
                <Label className="text-sm font-bold text-neutral-800">Soil Test Completed?</Label>
                <div className="flex gap-3">
                    <div className={`flex-1 border text-center font-bold text-sm rounded-xl p-3 cursor-pointer transition-all ${designData.soilTest === 'Yes' ? 'bg-primary-600 text-white border-primary-600 shadow-md' : 'hover:bg-neutral-50 text-neutral-700'}`} onClick={() => setDesignData({ ...designData, soilTest: 'Yes' })}>Yes</div>
                    <div className={`flex-1 border text-center font-bold text-sm rounded-xl p-3 cursor-pointer transition-all ${designData.soilTest === 'No' ? 'bg-primary-600 text-white border-primary-600 shadow-md' : 'hover:bg-neutral-50 text-neutral-700'}`} onClick={() => setDesignData({ ...designData, soilTest: 'No' })}>No</div>
                </div>
            </div>
        </div>
    );

    const renderDesignStep3 = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 max-h-[60vh] overflow-y-auto pr-2">
            <Label className="text-sm font-bold text-neutral-800">Aesthetics & Layout Preferences</Label>
            <RadioCardGroup
                options={[
                    { id: 'Modern', label: 'Modern / Minimalist', image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=400&h=400&fit=crop' },
                    { id: 'Traditional', label: 'Traditional / Brick', image: 'https://images.unsplash.com/photo-1592595896551-12b371d546d5?w=400&h=400&fit=crop' },
                    { id: 'Luxury', label: 'Duplex Luxury', image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=400&fit=crop' },
                    { id: 'Eco', label: 'Green / Eco-Friendly', image: 'https://images.unsplash.com/photo-1588880331179-bc9b93a8cb5e?w=400&h=400&fit=crop' }
                ]}
                selected={designData.structuralVibe}
                onChange={(id) => setDesignData({ ...designData, structuralVibe: id })}
            />
        </div>
    );

    const renderInteriorStep1 = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 max-h-[60vh] overflow-y-auto pr-2">
            <RadioCardGroup
                options={[
                    { id: 'Full house', label: 'Full house', description: "Complete interior for multi-storied or duplex." },
                    { id: 'Full Apartment', label: 'Full Apartment', description: "Complete interior for a single apartment." },
                    { id: 'Specific Area', label: 'Specific Area', description: "Kitchen, Living, Bedrooms, etc." },
                ]}
                selected={interiorData.propertyType}
                onChange={(id) => setInteriorData({ ...interiorData, propertyType: id })}
            />

            {interiorData.propertyType === 'Full Apartment' && (
                <div className="mt-6 grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label className="text-xs font-bold text-neutral-600">Apartment Size (sqft)</Label>
                        <Input type="number" placeholder="e.g. 1500" value={interiorData.aptSize} onChange={(e) => setInteriorData({ ...interiorData, aptSize: e.target.value })} className="bg-neutral-50 h-11" />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-xs font-bold text-neutral-600">Number of Rooms</Label>
                        <Input type="number" placeholder="e.g. 3" value={interiorData.aptRooms} onChange={(e) => setInteriorData({ ...interiorData, aptRooms: e.target.value })} className="bg-neutral-50 h-11" />
                    </div>
                </div>
            )}

            {interiorData.propertyType === 'Specific Area' && (
                <div className="mt-6 space-y-4">
                    <div className="pt-4 border-t border-neutral-100">
                        <Label className="text-xs font-bold text-neutral-600 mb-3 block">Select Area</Label>
                        <RadioCardGroup
                            options={[
                                { id: 'Living Room', label: 'Living Room' },
                                { id: 'Drawing Room', label: 'Drawing Room' },
                                { id: 'Bed Room', label: 'Bed Room' },
                                { id: 'Bath Room', label: 'Bath Room' },
                                { id: 'Kitchen', label: 'Kitchen' },
                                { id: 'Balcony', label: 'Balcony' },
                                { id: 'Rooftop', label: 'Rooftop' },
                                { id: 'Entrance', label: 'Entrance' },
                            ]}
                            selected={interiorData.specificAreaType}
                            onChange={(id) => setInteriorData({ ...interiorData, specificAreaType: id })}
                            columns={2}
                        />
                    </div>

                    {interiorData.specificAreaType === 'Bed Room' && (
                        <div className="pt-4 border-t border-neutral-100">
                            <Label className="text-xs font-bold text-neutral-600 mb-3 block">Bedroom Type</Label>
                            <RadioCardGroup
                                options={[
                                    { id: 'Master Bedroom', label: 'Master Bedroom' },
                                    { id: 'General Bedroom', label: 'General Bedroom' },
                                    { id: 'Welcome Newborn', label: 'Welcome Newborn' },
                                    { id: 'Teenagers Special', label: 'Teenagers Special' },
                                    { id: 'Children Bedroom', label: 'Children Bedroom' },
                                ]}
                                selected={interiorData.bedRoomType}
                                onChange={(id) => setInteriorData({ ...interiorData, bedRoomType: id })}
                                columns={2}
                            />
                        </div>
                    )}

                    {(interiorData.specificAreaType && (interiorData.specificAreaType !== 'Bed Room' || interiorData.bedRoomType)) && (
                        <>
                            <div className="pt-4 border-t border-neutral-100">
                                <Label className="text-xs font-bold text-neutral-600 mb-3 block">Design Scope</Label>
                                <RadioCardGroup
                                    options={[
                                        { id: 'Entire New Design', label: 'Entire New Design' },
                                        { id: 'Specific Renovation', label: 'Specific Renovation' },
                                    ]}
                                    selected={interiorData.designScope}
                                    onChange={(id) => setInteriorData({ ...interiorData, designScope: id })}
                                    columns={2}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-neutral-600">Room Size (sqft)</Label>
                                <Input type="number" placeholder="e.g. 150" value={interiorData.roomSize} onChange={(e) => setInteriorData({ ...interiorData, roomSize: e.target.value })} className="bg-neutral-50 h-11" />
                            </div>
                        </>
                    )}

                    <div className="space-y-2">
                        <Label className="text-xs font-bold text-neutral-600">Specific Instructions (Optional)</Label>
                        <Input type="text" placeholder="e.g. Needs modern lighting" value={interiorData.specificInstruction} onChange={(e) => setInteriorData({ ...interiorData, specificInstruction: e.target.value })} className="bg-neutral-50 h-11" />
                    </div>
                </div>
            )}
        </div>
    );

    const renderScheduleStep = () => (
        <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
            <div>
                <Label className="text-xs font-bold text-neutral-600 block mb-1.5">Preferred Date</Label>
                <Input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={scheduleData.date}
                    onChange={(e) => setScheduleData({ ...scheduleData, date: e.target.value })}
                    className="h-11 rounded-xl bg-neutral-50 border-neutral-200"
                />
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
    );

    // Setup steps array dynamically
    const steps: { title: string; desc: string; render: () => ReactNode; canNext: boolean }[] = [];

    if (journeyTypes.includes('interior')) {
        steps.push({
            title: "Interior Scope Details",
            desc: "What type of interior space are we refining?",
            render: renderInteriorStep1,
            canNext: !!interiorData.propertyType &&
                (interiorData.propertyType !== 'Specific Area' ||
                    (!!interiorData.specificAreaType &&
                        (interiorData.specificAreaType !== 'Bed Room' || !!interiorData.bedRoomType) &&
                        !!interiorData.designScope &&
                        !!interiorData.roomSize))
        });
    }

    if (journeyTypes.includes('design')) {
        steps.push({
            title: "Space and Layout",
            desc: "Let's capture the foundational scope of your building unit.",
            render: renderDesignStep1,
            canNext: !!(designData.landAreaKatha && designData.initialFloors)
        });
        steps.push({
            title: "Plot Features",
            desc: "Any special considerations for your land?",
            render: renderDesignStep2,
            canNext: true
        });
        steps.push({
            title: "Aesthetics & Style",
            desc: "Your preferred design influence.",
            render: renderDesignStep3,
            canNext: !!designData.structuralVibe
        });
    }

    if (journeyTypes.includes('approval') && !journeyTypes.includes('design')) {
        // If approval is selected but NOT design, we don't have building design steps, 
        // but we might still want a specific step? For now, the legacy logic just went to schedule.
        // We can leave it as just schedule.
    }

    // Schedule step is always last
    steps.push({
        title: "Schedule a Consultation",
        desc: "When should the designer or our admin contact you?",
        render: renderScheduleStep,
        canNext: !!(scheduleData.date && scheduleData.time)
    });

    const currentStepData = steps[step - 1] || steps[0];
    const totalSteps = steps.length;

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-white rounded-3xl">
                <div className="bg-[#f3fbfa] p-6 border-b border-neutral-100 relative">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#00a651] mb-2 block">
                        Step {step} of {totalSteps}
                    </span>
                    <DialogTitle className="text-xl font-black text-[#0a1b3d]">
                        {currentStepData.title}
                    </DialogTitle>
                    <DialogDescription className="text-neutral-500 text-sm mt-1">
                        {currentStepData.desc}
                    </DialogDescription>
                </div>

                <div className="p-6">
                    {currentStepData.render()}
                </div>

                <div className="p-6 pt-0 border-t border-neutral-100 flex gap-3 mt-2 bg-neutral-50/50">
                    <Button
                        variant="outline"
                        className="flex-1 h-12 rounded-xl border-neutral-200 font-bold"
                        onClick={step === 1 ? () => setIsOpen(false) : handleBack}
                    >
                        {step === 1 ? 'Cancel' : 'Back'}
                    </Button>

                    <Button
                        className={`flex-1 h-12 rounded-xl font-bold ${step === totalSteps
                            ? 'bg-[#00a651] hover:bg-[#009045] text-white shadow-lg shadow-[#00a651]/20'
                            : 'bg-[#0a1b3d] hover:bg-[#1a2f5c] text-white'
                            }`}
                        onClick={step === totalSteps ? handleFinalSubmit : handleNext}
                        disabled={loading || !currentStepData.canNext}
                    >
                        {loading ? 'Booking...' : step === totalSteps ? 'Confirm Request' : 'Next Step'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
