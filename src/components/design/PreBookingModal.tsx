"use client";

import { useState, ReactNode } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioCardGroup, Option } from '@/components/design/WizardFormComponents';
import { ClipboardList } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface PreBookingModalProps {
    isOpen: boolean;
    setIsOpen: (val: boolean) => void;
    journeyTypes: ('design' | 'approval' | 'interior')[];
    onSubmit: (scheduleData: any, projectData: any) => Promise<void>;
}

export function PreBookingModal({ isOpen, setIsOpen, journeyTypes = [], onSubmit }: PreBookingModalProps) {
    const { language, t } = useLanguage();
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
            alert(t.alert_schedule);
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
                    <Label className="text-xs font-bold text-neutral-600">{t.lbl_land_area}</Label>
                    <Input type="number" placeholder="e.g. 5" value={designData.landAreaKatha} onChange={(e) => setDesignData({ ...designData, landAreaKatha: e.target.value })} className="bg-neutral-50 h-11" />
                </div>
                <div className="space-y-2">
                    <Label className="text-xs font-bold text-neutral-600">{t.lbl_initial_floors}</Label>
                    <Input type="number" placeholder="e.g. 2" value={designData.initialFloors} onChange={(e) => setDesignData({ ...designData, initialFloors: e.target.value })} className="bg-neutral-50 h-11" />
                </div>
                <div className="space-y-2">
                    <Label className="text-xs font-bold text-neutral-600">{t.lbl_units_per_floor}</Label>
                    <Input type="number" placeholder="e.g. 2" value={designData.unitsPerFloor} onChange={(e) => setDesignData({ ...designData, unitsPerFloor: e.target.value })} className="bg-neutral-50 h-11" />
                </div>
                <div className="space-y-2">
                    <Label className="text-xs font-bold text-neutral-600">{t.lbl_bedrooms_per_unit}</Label>
                    <Input type="number" placeholder="e.g. 3" value={designData.bedroomsPerUnit} onChange={(e) => setDesignData({ ...designData, bedroomsPerUnit: e.target.value })} className="bg-neutral-50 h-11" />
                </div>
                <div className="space-y-2">
                    <Label className="text-xs font-bold text-neutral-600">{t.lbl_bathrooms_per_unit}</Label>
                    <Input type="number" placeholder="e.g. 2" value={designData.bathroomsPerUnit} onChange={(e) => setDesignData({ ...designData, bathroomsPerUnit: e.target.value })} className="bg-neutral-50 h-11" />
                </div>
                <div className="space-y-2">
                    <Label className="text-xs font-bold text-neutral-600">{t.lbl_drawing_per_unit}</Label>
                    <Input type="number" placeholder="e.g. 1" value={designData.drawingRoomPerUnit} onChange={(e) => setDesignData({ ...designData, drawingRoomPerUnit: e.target.value })} className="bg-neutral-50 h-11" />
                </div>
                <div className="space-y-2">
                    <Label className="text-xs font-bold text-neutral-600">{t.lbl_kitchen_per_unit}</Label>
                    <Input type="number" placeholder="e.g. 1" value={designData.kitchenPerUnit} onChange={(e) => setDesignData({ ...designData, kitchenPerUnit: e.target.value })} className="bg-neutral-50 h-11" />
                </div>
                <div className="space-y-2">
                    <Label className="text-xs font-bold text-neutral-600">{t.lbl_balcony_per_unit}</Label>
                    <Input type="number" placeholder="e.g. 2" value={designData.balconyPerUnit} onChange={(e) => setDesignData({ ...designData, balconyPerUnit: e.target.value })} className="bg-neutral-50 h-11" />
                </div>
                <div className="space-y-2 sm:col-span-2">
                    <Label className="text-xs font-bold text-neutral-600">{t.lbl_other_rooms}</Label>
                    <Input type="text" placeholder="e.g. Dining, Family living" value={designData.othersPerUnit} onChange={(e) => setDesignData({ ...designData, othersPerUnit: e.target.value })} className="bg-neutral-50 h-11" />
                </div>
            </div>
        </div>
    );

    const renderDesignStep2 = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 max-h-[60vh] overflow-y-auto pr-2">
            <div className="space-y-3">
                <Label className="text-sm font-bold text-neutral-800">{t.lbl_plot_orientation}</Label>
                <div className="grid grid-cols-2 gap-3">
                    {[
                        { id: 'North', label: t.opt_north },
                        { id: 'South', label: t.opt_south },
                        { id: 'East', label: t.opt_east },
                        { id: 'West', label: t.opt_west }
                    ].map(opt => (
                        <div key={opt.id} className={`border rounded-xl p-3 flex items-center gap-3 cursor-pointer transition-all ${designData.plotOrientation.includes(opt.id) ? 'bg-primary-50 border-primary-600 shadow-sm' : 'hover:bg-neutral-50'}`} onClick={() => toggleArrayItem('plotOrientation', opt.id)}>
                            <Checkbox checked={designData.plotOrientation.includes(opt.id)} className="mt-0.5" />
                            <span className="text-sm font-bold">{opt.label}</span>
                        </div>
                    ))}
                </div>
            </div>
            <div className="space-y-3">
                <Label className="text-sm font-bold text-neutral-800">{t.lbl_special_zones}</Label>
                <div className="grid grid-cols-2 gap-3">
                    {[
                        { id: 'Prayer room', label: t.opt_prayer },
                        { id: 'Home Office', label: t.opt_office },
                        { id: 'Maid\'s room', label: t.opt_maid },
                        { id: 'Parking', label: t.opt_parking }
                    ].map(opt => (
                        <div key={opt.id} className={`border rounded-xl p-3 flex items-center gap-3 cursor-pointer transition-all ${designData.specialZones.includes(opt.id) ? 'bg-primary-50 border-primary-600 shadow-sm' : 'hover:bg-neutral-50'}`} onClick={() => toggleArrayItem('specialZones', opt.id)}>
                            <Checkbox checked={designData.specialZones.includes(opt.id)} className="mt-0.5" />
                            <span className="text-sm font-bold">{opt.label}</span>
                        </div>
                    ))}
                </div>
            </div>
            <div className="space-y-3">
                <Label className="text-sm font-bold text-neutral-800">{t.lbl_roof_features}</Label>
                <div className="grid grid-cols-2 gap-3">
                    {[
                        { id: 'Roof garden', label: t.opt_roof_garden },
                        { id: 'Swimming pool', label: t.opt_pool }
                    ].map(opt => (
                        <div key={opt.id} className={`border rounded-xl p-3 flex items-center gap-3 cursor-pointer transition-all ${designData.roofFeatures.includes(opt.id) ? 'bg-primary-50 border-primary-600 shadow-sm' : 'hover:bg-neutral-50'}`} onClick={() => toggleArrayItem('roofFeatures', opt.id)}>
                            <Checkbox checked={designData.roofFeatures.includes(opt.id)} className="mt-0.5" />
                            <span className="text-sm font-bold">{opt.label}</span>
                        </div>
                    ))}
                </div>
            </div>
            <div className="space-y-3">
                <Label className="text-sm font-bold text-neutral-800">{t.lbl_soil_test}</Label>
                <div className="flex gap-3">
                    <div className={`flex-1 border text-center font-bold text-sm rounded-xl p-3 cursor-pointer transition-all ${designData.soilTest === 'Yes' ? 'bg-primary-600 text-white border-primary-600 shadow-md' : 'hover:bg-neutral-50 text-neutral-700'}`} onClick={() => setDesignData({ ...designData, soilTest: 'Yes' })}>{t.opt_yes}</div>
                    <div className={`flex-1 border text-center font-bold text-sm rounded-xl p-3 cursor-pointer transition-all ${designData.soilTest === 'No' ? 'bg-primary-600 text-white border-primary-600 shadow-md' : 'hover:bg-neutral-50 text-neutral-700'}`} onClick={() => setDesignData({ ...designData, soilTest: 'No' })}>{t.opt_no}</div>
                </div>
            </div>
        </div>
    );

    const renderDesignStep3 = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 max-h-[60vh] overflow-y-auto pr-2">
            <Label className="text-sm font-bold text-neutral-800">{t.lbl_aesthetics}</Label>
            <RadioCardGroup
                options={[
                    { id: 'Modern', label: t.opt_modern, image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=400&h=400&fit=crop' },
                    { id: 'Traditional', label: t.opt_traditional, image: 'https://images.unsplash.com/photo-1592595896551-12b371d546d5?w=400&h=400&fit=crop' },
                    { id: 'Luxury', label: t.opt_luxury, image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=400&fit=crop' },
                    { id: 'Eco', label: t.opt_eco, image: 'https://images.unsplash.com/photo-1588880331179-bc9b93a8cb5e?w=400&h=400&fit=crop' }
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
                    { id: 'Full house', label: t.opt_full_house, description: language === 'BN' ? "মাল্টি-স্টোরিড বা ডুপ্লেক্সের জন্য সম্পূর্ণ ইন্টেরিয়র।" : "Complete interior for multi-storied or duplex." },
                    { id: 'Full Apartment', label: t.opt_full_apartment, description: language === 'BN' ? "একটি একক অ্যাপারটমেন্টের জন্য সম্পূর্ণ ইন্টেরিয়র।" : "Complete interior for a single apartment." },
                    { id: 'Specific Area', label: t.opt_specific_area, description: language === 'BN' ? "রান্নাঘর, লিভিং, বেডরুম ইত্যাদি।" : "Kitchen, Living, Bedrooms, etc." },
                ]}
                selected={interiorData.propertyType}
                onChange={(id) => setInteriorData({ ...interiorData, propertyType: id })}
            />

            {interiorData.propertyType === 'Full Apartment' && (
                <div className="mt-6 grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label className="text-xs font-bold text-neutral-600">{t.lbl_apt_size}</Label>
                        <Input type="number" placeholder="e.g. 1500" value={interiorData.aptSize} onChange={(e) => setInteriorData({ ...interiorData, aptSize: e.target.value })} className="bg-neutral-50 h-11" />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-xs font-bold text-neutral-600">{t.lbl_num_rooms}</Label>
                        <Input type="number" placeholder="e.g. 3" value={interiorData.aptRooms} onChange={(e) => setInteriorData({ ...interiorData, aptRooms: e.target.value })} className="bg-neutral-50 h-11" />
                    </div>
                </div>
            )}

            {interiorData.propertyType === 'Specific Area' && (
                <div className="mt-6 space-y-4">
                    <div className="pt-4 border-t border-neutral-100">
                        <Label className="text-xs font-bold text-neutral-600 mb-3 block">{t.lbl_select_area}</Label>
                        <RadioCardGroup
                            options={[
                                { id: 'Living Room', label: t.opt_living },
                                { id: 'Drawing Room', label: t.opt_drawing },
                                { id: 'Bed Room', label: t.opt_bedroom },
                                { id: 'Bath Room', label: t.opt_bathroom },
                                { id: 'Kitchen', label: t.opt_kitchen },
                                { id: 'Balcony', label: t.opt_balcony },
                                { id: 'Rooftop', label: t.opt_rooftop },
                                { id: 'Entrance', label: t.opt_entrance },
                            ]}
                            selected={interiorData.specificAreaType}
                            onChange={(id) => setInteriorData({ ...interiorData, specificAreaType: id })}
                            columns={2}
                        />
                    </div>

                    {interiorData.specificAreaType === 'Bed Room' && (
                        <div className="pt-4 border-t border-neutral-100">
                            <Label className="text-xs font-bold text-neutral-600 mb-3 block">{t.lbl_bedroom_type}</Label>
                            <RadioCardGroup
                                options={[
                                    { id: 'Master Bedroom', label: t.opt_master_bed },
                                    { id: 'General Bedroom', label: t.opt_general_bed },
                                    { id: 'Welcome Newborn', label: t.opt_newborn },
                                    { id: 'Teenagers Special', label: t.opt_teenager },
                                    { id: 'Children Bedroom', label: t.opt_children },
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
                                <Label className="text-xs font-bold text-neutral-600 mb-3 block">{t.lbl_design_scope}</Label>
                                <RadioCardGroup
                                    options={[
                                        { id: 'Entire New Design', label: t.opt_entire_new },
                                        { id: 'Specific Renovation', label: t.opt_renovation },
                                    ]}
                                    selected={interiorData.designScope}
                                    onChange={(id) => setInteriorData({ ...interiorData, designScope: id })}
                                    columns={2}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-neutral-600">{t.lbl_room_size}</Label>
                                <Input type="number" placeholder="e.g. 150" value={interiorData.roomSize} onChange={(e) => setInteriorData({ ...interiorData, roomSize: e.target.value })} className="bg-neutral-50 h-11" />
                            </div>
                        </>
                    )}

                    <div className="space-y-2">
                        <Label className="text-xs font-bold text-neutral-600">{t.lbl_instructions}</Label>
                        <Input type="text" placeholder="e.g. Needs modern lighting" value={interiorData.specificInstruction} onChange={(e) => setInteriorData({ ...interiorData, specificInstruction: e.target.value })} className="bg-neutral-50 h-11" />
                    </div>
                </div>
            )}
        </div>
    );

    const renderScheduleStep = () => (
        <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
            <div>
                <Label className="text-xs font-bold text-neutral-600 block mb-1.5">{t.lbl_pref_date}</Label>
                <Input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={scheduleData.date}
                    onChange={(e) => setScheduleData({ ...scheduleData, date: e.target.value })}
                    className="h-11 rounded-xl bg-neutral-50 border-neutral-200"
                />
            </div>
            <div>
                <Label className="text-xs font-bold text-neutral-600 block mb-2">{t.lbl_pref_time}</Label>
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
            title: t.booking_interior_s1_title,
            desc: t.booking_interior_s1_desc,
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
            title: t.booking_design_s1_title,
            desc: t.booking_design_s1_desc,
            render: renderDesignStep1,
            canNext: !!(designData.landAreaKatha && designData.initialFloors)
        });
        steps.push({
            title: t.booking_design_s2_title,
            desc: t.booking_design_s2_desc,
            render: renderDesignStep2,
            canNext: true
        });
        steps.push({
            title: t.booking_design_s3_title,
            desc: t.booking_design_s3_desc,
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
        title: t.schedule_title,
        desc: t.schedule_desc,
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
                        {t.booking_step_of.replace('{step}', step.toString()).replace('{total}', totalSteps.toString())}
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
                        {step === 1 ? t.btn_cancel : t.btn_back}
                    </Button>

                    <Button
                        className={`flex-1 h-12 rounded-xl font-bold ${step === totalSteps
                            ? 'bg-[#00a651] hover:bg-[#009045] text-white shadow-lg shadow-[#00a651]/20'
                            : 'bg-[#0a1b3d] hover:bg-[#1a2f5c] text-white'
                            }`}
                        onClick={step === totalSteps ? handleFinalSubmit : handleNext}
                        disabled={loading || !currentStepData.canNext}
                    >
                        {loading ? t.status_booking : step === totalSteps ? t.btn_confirm_request : t.btn_next}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
