"use client"

import { useState, useEffect, Suspense, ReactNode } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { WizardStep } from '@/components/design/WizardStep';
import { RadioCardGroup, CheckboxCardGroup, Option } from '@/components/design/WizardFormComponents';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Ruler, Home, Building2, PaintBucket, BedDouble, Bath, Car, Trees, Waves, Dog, Baby, FileText, CheckCircle2, UserCircle, Map as MapIcon, Hash, CheckSquare, Star } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { designTranslations } from '@/utils/designTranslations';
import { useLanguage } from '@/context/LanguageContext';
import Link from 'next/link';

// Service Types
type ServiceType = 'structural-architectural' | 'interior';

// Interior Options
const getVibeOptions = (lang: string): Option[] => [
    { id: 'Modern', label: lang === 'bn' ? 'মডার্ন / মিনিমালিস্ট' : 'Modern / Minimalist', image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=400&h=400&fit=crop' },
    { id: 'Traditional', label: lang === 'bn' ? 'ঐতিহ্যবাহী / ব্রিক' : 'Traditional / Brick', image: 'https://images.unsplash.com/photo-1592595896551-12b371d546d5?w=400&h=400&fit=crop' },
    { id: 'Luxury', label: lang === 'bn' ? 'ডুপ্লেক্স লাক্সারি' : 'Duplex Luxury', image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=400&fit=crop' },
    { id: 'Eco', label: lang === 'bn' ? 'সবুজ / পরিবেশ-বান্ধব' : 'Green / Eco-Friendly', image: 'https://images.unsplash.com/photo-1588880331179-bc9b93a8cb5e?w=400&h=400&fit=crop' },
];

export default function DesignBookingPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <DesignBookingWizard />
        </Suspense>
    );
}

function DesignBookingWizard() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const supabase = createClient();

    const urlService = searchParams.get('service');
    const initialService = (urlService === 'structural' || urlService === 'architectural')
        ? 'structural-architectural'
        : urlService as ServiceType | null;

    const { language } = useLanguage();
    const lang = (language?.toLowerCase() || 'en') as 'en' | 'bn';
    const t = designTranslations[lang] || designTranslations.en;

    const [step, setStep] = useState(initialService === 'interior' ? 8 : (initialService ? 1 : 0));
    const [serviceType, setServiceType] = useState<ServiceType | null>(initialService);
    const [loading, setLoading] = useState(false);

    // Eligible designers fetched from DB
    const [designers, setDesigners] = useState<any[]>([]);

    // Form State
    const [formData, setFormData] = useState({
        // Structural/Architectural New Fields
        designerOption: '' as 'approval' | 'design' | 'both' | '',
        hasDeed: false,
        hasSurveyMap: false,
        hasMutation: false,
        hasTax: false,
        hasNID: false,
        hasLandPermit: false,
        hasBuildingApproval: false,

        // Design Questionnaire Fields
        landAreaKatha: '',
        plotOrientation: [] as string[],
        initialFloors: '',
        unitsPerFloor: '',
        bedroomsPerUnit: '',
        bathroomsPerUnit: '',
        drawingRoomPerUnit: '',
        kitchenPerUnit: '',
        balconyPerUnit: '',
        othersPerUnit: '',
        specialZones: [] as string[],
        structuralVibe: '',
        soilTest: '',
        roofFeatures: [] as string[],

        designerSelectionType: '' as 'ghorbari' | 'list' | '',
        selectedDesignerId: null as string | null,

        // Interior - Setup
        propertyType: '', // 'Full house' | 'Full Apartment' | 'Specific Area'

        // Full House
        houseType: '', // 'Duplex' | 'Multistoried'
        intFloors: '',
        intUnitsPerFloor: '',
        intAreaPerUnit: '',

        // Full Apartment
        aptSize: '',
        aptRooms: '',
        aptInspiration: null as File | null,

        // Specific Area
        specificAreaType: '', // 'Living Room' | 'Drawing Room' | 'Bed Room' | 'Bath Room' | 'Kitchen' | 'Balcony' | 'Rooftop' | 'Entrance'
        bedRoomType: '', // 'Master Bedroom' | 'General Bedroom' | 'Welcome Newborn' | 'Teenagers Special' | 'Children Bedroom'
        designScope: '', // 'Entire New Design' | 'Specific Renovation'
        roomSize: '',
        roomInspiration: null as File | null,
        roomImage: null as File | null,
        specificInstruction: '',
        preferredDate: '',
        preferredTime: '',
    });

    const [serviceTypes, setServiceTypes] = useState<ServiceType[]>(
        initialService ? [initialService] : []
    );

    useEffect(() => {
        async function fetchDesigners() {
            try {
                const reqSpecs: string[] = [];
                if (serviceTypes.includes('structural-architectural')) reqSpecs.push('Structural & architectural');
                if (serviceTypes.includes('interior')) reqSpecs.push('Interior design');

                let query = supabase.from('designers').select('*, profile:profiles(*)');

                if (reqSpecs.length > 0) {
                    query = query.overlaps('active_specializations', reqSpecs);
                }

                const { data } = await query;
                if (data) {
                    const processed = data.map(d => ({
                        ...d,
                        specializations: Array.isArray(d.specializations)
                            ? d.specializations.map((s: any) => typeof s === 'string' ? s : JSON.stringify(s))
                            : []
                    }));
                    setDesigners(processed);
                }
            } catch (err) {
                console.error("Error fetching designers:", err);
            }
        }
        fetchDesigners();
    }, [serviceTypes]);


    const updateData = (key: string, value: any) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    const toggleArrayItem = (key: keyof typeof formData, value: string) => {
        setFormData(prev => {
            const arr = prev[key] as string[];
            if (arr.includes(value)) {
                return { ...prev, [key]: arr.filter((item: string) => item !== value) };
            } else {
                return { ...prev, [key]: [...arr, value] };
            }
        });
    };

    const showsDesignQ = formData.designerOption === 'design' || formData.designerOption === 'both';
    const skippableListStep = formData.designerSelectionType === 'ghorbari';



    const handleSubmit = async () => {
        setLoading(true);
        try {
            const userResponse = await supabase.auth.getUser();
            const user = userResponse.data.user;

            if (!user) {
                router.push('/login?redirect=/services/design/book');
                return;
            }

            // Calculate tentative pricing (basic placeholder logic based on rules)
            let tentativePrice = 0;
            if (serviceTypes.includes('structural-architectural')) {
                if (formData.designerSelectionType === 'ghorbari') {
                    if (formData.designerOption === 'both') tentativePrice = 80000;
                    else if (formData.designerOption === 'design') tentativePrice = 50000;
                    else tentativePrice = 30000;
                } else {
                    tentativePrice = 60000;
                }
            }
            if (serviceTypes.includes('interior')) {
                tentativePrice += 20000;
            }

            const uploadFile = async (file: File | null) => {
                if (!file) return null;
                try {
                    const fileExt = file.name.split('.').pop();
                    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
                    const { error } = await supabase.storage.from('design_assets').upload(`document_uploads/${fileName}`, file);
                    if (error) {
                        console.error("File upload failed:", error);
                        return null;
                    }
                    const { data: urlData } = supabase.storage.from('design_assets').getPublicUrl(`document_uploads/${fileName}`);
                    return urlData.publicUrl;
                } catch (e) {
                    console.error(e);
                    return null;
                }
            };

            let aptInspirationUrl = await uploadFile(formData.aptInspiration);
            let roomInspirationUrl = await uploadFile(formData.roomInspiration);
            let roomImageUrl = await uploadFile(formData.roomImage);

            const payloadDetails: any = {
                ...formData,
                tentativePrice,
                aptInspirationUrl,
                roomInspirationUrl,
                roomImageUrl,
                preferredSchedule: {
                    date: formData.preferredDate,
                    time: formData.preferredTime
                }
            };
            delete payloadDetails.aptInspiration;
            delete payloadDetails.roomInspiration;
            delete payloadDetails.roomImage;
            delete payloadDetails.preferredDate;
            delete payloadDetails.preferredTime;

            const { error } = await supabase.from('design_bookings').insert({
                user_id: user.id,
                service_type: serviceTypes.includes('structural-architectural') ? 'architectural' : 'interior',
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

    const nextStep = () => {
        if (step === 0) {
            if (serviceTypes.includes('structural-architectural')) setStep(1);
            else if (serviceTypes.includes('interior')) setStep(8);
            else setStep(12);
        } else if (step >= 1 && step <= 7) {
            // End of Structural logic

            if (step === 1) setStep(2);
            else if (step === 2) {
                if (showsDesignQ) setStep(3);
                else setStep(6);
            }
            else if (step === 3) setStep(4);
            else if (step === 4) setStep(5);
            else if (step === 5) setStep(6);
            else if (step === 6) {
                if (skippableListStep) {
                    if (serviceTypes.includes('interior')) setStep(8);
                    else setStep(12);
                }
                else setStep(7);
            }
            else if (step === 7) {
                if (serviceTypes.includes('interior')) setStep(8);
                else setStep(12);
            }
        } else if (step >= 8 && step <= 11) {
            // End of Interior logic
            if (step === 8) setStep(9);
            else if (step === 9) setStep(10);
            else if (step === 10) setStep(11);
            else if (step === 11) setStep(12);
        } else if (step === 12) {
            setStep(13);
        }
    };

    const prevStep = () => {
        if (step === 1) setStep(0);
        else if (step > 1 && step <= 7) {

            if (step === 6 && !showsDesignQ) setStep(2);
            else if (step === 7) setStep(6);
            else setStep(step - 1);
        } else if (step === 8) {
            if (serviceTypes.includes('structural-architectural')) {
                let skippableListStep = formData.designerSelectionType === 'ghorbari';
                if (skippableListStep) setStep(6);
                else setStep(7);
            } else {
                setStep(0);
            }
        } else if (step > 8 && step <= 11) {
            setStep(step - 1);
        } else if (step === 12) {
            if (serviceTypes.includes('interior')) setStep(11);
            else if (serviceTypes.includes('structural-architectural')) {
                let skippableListStep = formData.designerSelectionType === 'ghorbari';
                if (skippableListStep) setStep(6);
                else setStep(7);
            } else {
                setStep(0);
            }
        } else if (step === 13) {
            setStep(12);
        }
    };

    const getDynamicTotalSteps = () => {
        let total = 1; // Start with Selection
        if (serviceTypes.includes('structural-architectural')) {
            let structuralTotal = 6;
            if (!showsDesignQ) structuralTotal -= 3;
            if (skippableListStep) structuralTotal -= 1;
            total += structuralTotal;
        }
        if (serviceTypes.includes('interior')) {
            total += 3; // Property, Req, Schedule
        }
        total += 2; // Extra 1 for booking schedule vs review
        return total;
    };

    const getVisualStep = () => {
        let visual = 0;
        if (step === 0) return 1;

        visual = 2; // Step 0 is step 1
        if (step >= 1 && step <= 7) {

            let structuralVisual = step;
            if (!showsDesignQ && step > 2) structuralVisual -= 3;
            if (skippableListStep && step > 6) structuralVisual -= 1;
            return visual + structuralVisual - 1;
        }

        if (serviceTypes.includes('structural-architectural')) {
            let structuralSteps = 6;
            if (!showsDesignQ) structuralSteps -= 3;
            if (skippableListStep) structuralSteps -= 1;
            visual += structuralSteps;
        }

        if (step >= 8 && step <= 11) {
            return visual + (step - 8);
        }

        if (serviceTypes.includes('interior')) {
            visual += 3;
        }

        if (step === 12) return visual;
        if (step === 13) return visual + 1;

        return visual;
    };

    const visualStep = getVisualStep();
    const totalSteps = getDynamicTotalSteps();

    const timeSlots = [
        "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
        "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM",
        "06:00 PM", "07:00 PM", "08:00 PM", "09:00 PM", "10:00 PM", "11:00 PM"
    ];

    const renderScheduleStep = (currentStep: number, totalSteps: number, next: () => void, back: () => void) => (
        <WizardStep
            key={`schedule-${lang}`}
            lang={lang}
            title={t.scheduleTitle}
            description={t.scheduleDesc}
            currentStep={currentStep}
            totalSteps={totalSteps}
            onNext={next}
            onBack={back}
            canNext={!!(formData.preferredDate && formData.preferredTime)}
        >
            <div className="max-w-md mx-auto space-y-8">
                <div className="space-y-3">
                    <Label className="font-bold text-neutral-700">{t.prefDateLabel}</Label>
                    <Input
                        type="date"
                        min={new Date().toISOString().split('T')[0]}
                        className="h-12 bg-neutral-50/50 border-neutral-200"
                        value={formData.preferredDate}
                        onChange={(e) => updateData('preferredDate', e.target.value)}
                    />
                </div>

                <div className="space-y-4">
                    <Label className="font-bold text-neutral-700">{t.prefTimeLabel}</Label>
                    <div className="grid grid-cols-3 gap-3">
                        {timeSlots.map((time) => (
                            <button
                                key={time}
                                onClick={() => updateData('preferredTime', time)}
                                className={`text-xs py-3 rounded-xl border font-bold transition-all ${formData.preferredTime === time
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
        </WizardStep>
    );

    // --- Render Logic ---

    if (step === 0) {
        return (
            <MainLayout>
                <WizardStep
                    key={`step0-${lang}`}
                    lang={lang}
                    title={t.startJourneyTitle}
                    description={t.startJourneyDesc}
                    currentStep={visualStep - 1}
                    totalSteps={totalSteps}
                    onNext={nextStep}
                    onBack={() => { }}
                    isFirstStep
                    canNext={serviceTypes.length > 0}
                >
                    <CheckboxCardGroup
                        options={[
                            { id: 'structural-architectural', label: t.structuralService, icon: Building2, description: t.structuralServiceDesc },
                            { id: 'interior', label: t.interiorService, icon: PaintBucket, description: t.interiorServiceDesc },
                        ]}
                        selected={serviceTypes}
                        onChange={(ids: string[]) => setServiceTypes(ids as ServiceType[])}
                        columns={2}
                    />
                </WizardStep>
            </MainLayout>
        );
    }

    // --- STRUCTURAL & ARCHITECTURAL ---
    if (step >= 1 && step <= 7) {
        let showsApprovalQ = formData.designerOption === 'approval' || formData.designerOption === 'both';

        let visualStep = step;
        if (!showsDesignQ && step > 2) visualStep -= 3;
        if (skippableListStep && step > 6) visualStep -= 1;
        // Adjust visual step for review if schedule is inserted
        if (step === 9) visualStep = getDynamicTotalSteps();

        if (step === 1) {
            return (
                <MainLayout>
                    <WizardStep
                        key={`step1-${lang}`}
                        lang={lang}
                        title={typeof t.findDesignerTitle === 'string' ? t.findDesignerTitle : "Find a Designer"}
                        description={typeof t.findDesignerDesc === 'string' ? t.findDesignerDesc : "Pick how you'd like to find your structural expert."}
                        currentStep={visualStep - 1}
                        totalSteps={totalSteps}
                        onNext={nextStep}
                        onBack={prevStep}
                        canNext={!!formData.designerOption}
                    >
                        <RadioCardGroup
                            options={[
                                { id: 'approval', label: t.buildingApproval, icon: FileText, description: t.buildingApprovalDesc },
                                { id: 'design', label: t.buildingDesign, icon: Building2, description: t.buildingDesignDesc },
                                { id: 'both', label: t.bothApprovalDesign, icon: CheckSquare, description: t.bothApprovalDesignDesc },
                            ]}
                            selected={formData.designerOption}
                            onChange={(id) => updateData('designerOption', id)}
                        />
                    </WizardStep>
                </MainLayout>
            );
        }

        if (step === 2) {
            return (
                <MainLayout>
                    <WizardStep
                        key={`step2-${lang}`}
                        lang={lang}
                        title={typeof t.docChecklistTitle === 'string' ? t.docChecklistTitle : "Documents"}
                        description={typeof t.docChecklistDesc === 'string' ? t.docChecklistDesc : "Help us understand your project better."}
                        currentStep={visualStep - 1}
                        totalSteps={totalSteps}
                        onNext={nextStep}
                        onBack={prevStep}
                        canNext={true}
                    >
                        <div className="space-y-8">
                            {showsApprovalQ && (
                                <div className="space-y-4">
                                    <Label className="text-lg font-bold block text-primary-900 border-b pb-2">{t.approvalDocs}</Label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className={`border rounded-xl p-4 flex items-start gap-4 cursor-pointer transition-all ${formData.hasDeed ? 'bg-primary-50 border-primary-600' : 'hover:bg-neutral-50'}`} onClick={() => updateData('hasDeed', !formData.hasDeed)}>
                                            <Checkbox checked={formData.hasDeed} className="mt-1" />
                                            <div>
                                                <span className="font-bold text-sm block">{t.deedDoc}</span>
                                                <span className="text-xs text-neutral-500">{t.deedDocDesc}</span>
                                            </div>
                                        </div>
                                        <div className={`border rounded-xl p-4 flex items-start gap-4 cursor-pointer transition-all ${formData.hasSurveyMap ? 'bg-primary-50 border-primary-600' : 'hover:bg-neutral-50'}`} onClick={() => updateData('hasSurveyMap', !formData.hasSurveyMap)}>
                                            <Checkbox checked={formData.hasSurveyMap} className="mt-1" />
                                            <div>
                                                <span className="font-bold text-sm block">{t.surveyMap}</span>
                                                <span className="text-xs text-neutral-500">{t.surveyMapDesc}</span>
                                            </div>
                                        </div>
                                        <div className={`border rounded-xl p-4 flex items-start gap-4 cursor-pointer transition-all ${formData.hasMutation ? 'bg-primary-50 border-primary-600' : 'hover:bg-neutral-50'}`} onClick={() => updateData('hasMutation', !formData.hasMutation)}>
                                            <Checkbox checked={formData.hasMutation} className="mt-1" />
                                            <div>
                                                <span className="font-bold text-sm block">{t.mutation}</span>
                                                <span className="text-xs text-neutral-500">{t.mutationDesc}</span>
                                            </div>
                                        </div>
                                        <div className={`border rounded-xl p-4 flex items-start gap-4 cursor-pointer transition-all ${formData.hasTax ? 'bg-primary-50 border-primary-600' : 'hover:bg-neutral-50'}`} onClick={() => updateData('hasTax', !formData.hasTax)}>
                                            <Checkbox checked={formData.hasTax} className="mt-1" />
                                            <div>
                                                <span className="font-bold text-sm block">{t.tax}</span>
                                                <span className="text-xs text-neutral-500">{t.taxDesc}</span>
                                            </div>
                                        </div>
                                        <div className={`border rounded-xl p-4 flex items-start gap-4 cursor-pointer transition-all ${formData.hasNID ? 'bg-primary-50 border-primary-600' : 'hover:bg-neutral-50'}`} onClick={() => updateData('hasNID', !formData.hasNID)}>
                                            <Checkbox checked={formData.hasNID} className="mt-1" />
                                            <div>
                                                <span className="font-bold text-sm block">{t.nid}</span>
                                                <span className="text-xs text-neutral-500">{t.nidDesc}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {showsDesignQ && (
                                <div className="space-y-4">
                                    <Label className="text-lg font-bold block text-primary-900 border-b pb-2">{t.designDocs}</Label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className={`border rounded-xl p-4 flex items-start gap-4 cursor-pointer transition-all ${formData.hasLandPermit ? 'bg-primary-50 border-primary-600' : 'hover:bg-neutral-50'}`} onClick={() => updateData('hasLandPermit', !formData.hasLandPermit)}>
                                            <Checkbox checked={formData.hasLandPermit} className="mt-1" />
                                            <div>
                                                <span className="font-bold text-sm block">{t.landPermit}</span>
                                                <span className="text-xs text-neutral-500">{t.landPermitDesc}</span>
                                            </div>
                                        </div>
                                        <div className={`border rounded-xl p-4 flex items-start gap-4 cursor-pointer transition-all ${formData.hasBuildingApproval ? 'bg-primary-50 border-primary-600' : 'hover:bg-neutral-50'}`} onClick={() => updateData('hasBuildingApproval', !formData.hasBuildingApproval)}>
                                            <Checkbox checked={formData.hasBuildingApproval} className="mt-1" />
                                            <div>
                                                <span className="font-bold text-sm block">{t.buildingApprovalDoc}</span>
                                                <span className="text-xs text-neutral-500">{t.buildingApprovalDocDesc}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </WizardStep>
                </MainLayout>
            );
        }

        if (step === 3 && showsDesignQ) {
            return (
                <MainLayout>
                    <WizardStep
                        key={`step3-${lang}`}
                        lang={lang}
                        title={typeof t.spaceLayoutTitle === 'string' ? t.spaceLayoutTitle : "Layout"}
                        description={typeof t.spaceLayoutDesc === 'string' ? t.spaceLayoutDesc : "Space and layout details."}
                        currentStep={visualStep - 1}
                        totalSteps={totalSteps}
                        onNext={nextStep}
                        onBack={prevStep}
                        canNext={!!formData.landAreaKatha && !!formData.initialFloors}
                    >
                        <div className="max-w-2xl mx-auto space-y-8">
                            {/* QUESTIONS grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                {/* Q1: Land Area */}
                                <div className="space-y-3">
                                    <Label className="font-bold text-neutral-700">{t.landAreaQ}</Label>
                                    <Input type="number" placeholder="e.g. 5" className="h-12 bg-neutral-50/50 border-neutral-200" value={formData.landAreaKatha} onChange={(e) => updateData('landAreaKatha', e.target.value)} />
                                </div>
                                {/* Q3: Initial floors */}
                                <div className="space-y-3">
                                    <Label className="font-bold text-neutral-700">{t.floorsQ}</Label>
                                    <Input type="number" placeholder="e.g. 2" className="h-12 bg-neutral-50/50 border-neutral-200" value={formData.initialFloors} onChange={(e) => updateData('initialFloors', e.target.value)} />
                                </div>
                            </div>

                            <div className="border-t border-neutral-200/60 pt-6 mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div className="space-y-3 text-left">
                                    <Label className="font-bold text-neutral-700">{t.unitsQ}</Label>
                                    <Input type="number" placeholder="e.g. 2" className="h-12 bg-neutral-50/50 border-neutral-200" value={formData.unitsPerFloor} onChange={(e) => updateData('unitsPerFloor', e.target.value)} />
                                </div>
                                <div className="space-y-3 text-left">
                                    <Label className="font-bold text-neutral-700">{t.bedsQ}</Label>
                                    <Input type="number" placeholder="e.g. 3" className="h-12 bg-neutral-50/50 border-neutral-200" value={formData.bedroomsPerUnit} onChange={(e) => updateData('bedroomsPerUnit', e.target.value)} />
                                </div>
                                <div className="space-y-3 text-left">
                                    <Label className="font-bold text-neutral-700">{t.bathsQ}</Label>
                                    <Input type="number" placeholder="e.g. 2" className="h-12 bg-neutral-50/50 border-neutral-200" value={formData.bathroomsPerUnit} onChange={(e) => updateData('bathroomsPerUnit', e.target.value)} />
                                </div>
                                <div className="space-y-3 text-left">
                                    <Label className="font-bold text-neutral-700">{t.drawingQ}</Label>
                                    <Input type="number" placeholder="e.g. 1" className="h-12 bg-neutral-50/50 border-neutral-200" value={formData.drawingRoomPerUnit} onChange={(e) => updateData('drawingRoomPerUnit', e.target.value)} />
                                </div>
                                <div className="space-y-3 text-left">
                                    <Label className="font-bold text-neutral-700">{t.kitchenQ}</Label>
                                    <Input type="number" placeholder="e.g. 1" className="h-12 bg-neutral-50/50 border-neutral-200" value={formData.kitchenPerUnit} onChange={(e) => updateData('kitchenPerUnit', e.target.value)} />
                                </div>
                                <div className="space-y-3 text-left">
                                    <Label className="font-bold text-neutral-700">{t.balconyQ}</Label>
                                    <Input type="number" placeholder="e.g. 2" className="h-12 bg-neutral-50/50 border-neutral-200" value={formData.balconyPerUnit} onChange={(e) => updateData('balconyPerUnit', e.target.value)} />
                                </div>
                                <div className="space-y-3 text-left sm:col-span-2 lg:col-span-3">
                                    <Label className="font-bold text-neutral-700">{t.othersQ}</Label>
                                    <Input type="text" placeholder="e.g. Dining, Family living" className="h-12 bg-neutral-50/50 border-neutral-200" value={formData.othersPerUnit} onChange={(e) => updateData('othersPerUnit', e.target.value)} />
                                </div>
                            </div>
                        </div>
                    </WizardStep>
                </MainLayout>
            );
        }

        if (step === 4 && showsDesignQ) {
            return (
                <MainLayout>
                    <WizardStep
                        key={`step4-${lang}`}
                        lang={lang}
                        title={typeof t.plotFeaturesTitle === 'string' ? t.plotFeaturesTitle : "Plot Features"}
                        description={typeof t.plotFeaturesDesc === 'string' ? t.plotFeaturesDesc : "Tell us about your land."}
                        currentStep={visualStep - 1}
                        totalSteps={totalSteps}
                        onNext={nextStep}
                        onBack={prevStep}
                        canNext={true}
                    >
                        <div className="max-w-3xl mx-auto space-y-10">
                            {/* Q2: Orientation check */}
                            <div className="space-y-4">
                                <Label className="text-lg font-bold text-neutral-800 border-b pb-2 block">{t.orientationQ}</Label>
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                    {(['North', 'South', 'East', 'West'] as const).map(opt => (
                                        <div key={opt} className={`border rounded-xl p-4 flex items-center gap-3 cursor-pointer transition-all ${formData.plotOrientation.includes(opt) ? 'bg-primary-50 border-primary-600 shadow-sm' : 'hover:bg-neutral-50'}`} onClick={() => toggleArrayItem('plotOrientation', opt)}>
                                            <Checkbox checked={formData.plotOrientation.includes(opt)} className="mt-0.5" />
                                            <span className="text-sm font-bold">{t[opt as keyof typeof t] || opt}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Q6: Special zones */}
                            <div className="space-y-4">
                                <Label className="text-lg font-bold text-neutral-800 border-b pb-2 block">{t.specialZonesQ}</Label>
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                    {(['Prayer room', 'Home Office', "Maid's room", 'Parking'] as const).map(opt => (
                                        <div key={opt} className={`border rounded-xl p-4 flex items-center gap-3 cursor-pointer transition-all ${formData.specialZones.includes(opt) ? 'bg-primary-50 border-primary-600 shadow-sm' : 'hover:bg-neutral-50'}`} onClick={() => toggleArrayItem('specialZones', opt)}>
                                            <Checkbox checked={formData.specialZones.includes(opt)} className="mt-0.5" />
                                            <span className="text-sm font-bold">{t[opt as keyof typeof t] || opt}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Q7: Soil Test */}
                            <div className="space-y-4 pt-4">
                                <Label className="text-lg font-bold text-neutral-800 border-b pb-2 block">{t.soilTestQ}</Label>
                                <div className="flex gap-4 max-w-md">
                                    <div className={`flex-1 border text-center font-bold text-sm rounded-xl p-4 cursor-pointer transition-all ${formData.soilTest === 'Yes' ? 'bg-primary-600 text-white border-primary-600 shadow-md' : 'hover:bg-neutral-50 text-neutral-700'}`} onClick={() => updateData('soilTest', 'Yes')}>{t.yes}</div>
                                    <div className={`flex-1 border text-center font-bold text-sm rounded-xl p-4 cursor-pointer transition-all ${formData.soilTest === 'No' ? 'bg-primary-600 text-white border-primary-600 shadow-md' : 'hover:bg-neutral-50 text-neutral-700'}`} onClick={() => updateData('soilTest', 'No')}>{t.no}</div>
                                </div>
                            </div>

                            {/* Q8: Features */}
                            <div className="space-y-4 pt-4">
                                <Label className="text-lg font-bold text-neutral-800 border-b pb-2 block">{t.roofFeaturesQ}</Label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    {(['Roof garden', 'Swimming pool'] as const).map(opt => (
                                        <div key={opt} className={`border rounded-xl p-4 flex items-center gap-3 cursor-pointer transition-all ${formData.roofFeatures.includes(opt) ? 'bg-primary-50 border-primary-600 shadow-sm' : 'hover:bg-neutral-50'}`} onClick={() => toggleArrayItem('roofFeatures', opt)}>
                                            <Checkbox checked={formData.roofFeatures.includes(opt)} className="mt-0.5" />
                                            <span className="text-sm font-bold">{t[opt as keyof typeof t] || opt}</span>
                                        </div>
                                    ))}
                                </div>
                                <p className="text-xs text-neutral-500 font-medium">{t.requiresLoad}</p>
                            </div>
                        </div>
                    </WizardStep>
                </MainLayout>
            );
        }

        if (step === 5 && showsDesignQ) {
            return (
                <MainLayout>
                    <WizardStep
                        key={`step5-${lang}`}
                        lang={lang}
                        title={typeof t.aestheticsTitle === 'string' ? t.aestheticsTitle : "Design Aesthetics"}
                        description={typeof t.aestheticsDesc === 'string' ? t.aestheticsDesc : "Choose the visual vibe for your building design."}
                        currentStep={visualStep - 1}
                        totalSteps={totalSteps}
                        onNext={nextStep}
                        onBack={prevStep}
                        canNext={!!formData.structuralVibe}
                    >
                        <div className="space-y-4">
                            {/* Q9: Vibe */}
                            <div className="space-y-4 block">
                                <RadioCardGroup
                                    options={getVibeOptions(lang)}
                                    selected={formData.structuralVibe}
                                    onChange={(id) => updateData('structuralVibe', id)}
                                />
                            </div>

                        </div>
                    </WizardStep>
                </MainLayout>
            );
        }

        if (step === 6) {
            return (
                <MainLayout>
                    <WizardStep
                        key={`step6-${lang}`}
                        lang={lang}
                        title={typeof t.chooseRouteTitle === 'string' ? t.chooseRouteTitle : "Choose Designer Route"}
                        description={typeof t.chooseRouteDesc === 'string' ? t.chooseRouteDesc : "How would you like to proceed with your designer?"}
                        currentStep={visualStep - 1}
                        totalSteps={totalSteps}
                        onNext={nextStep}
                        onBack={prevStep}
                        canNext={!!formData.designerSelectionType}
                    >
                        <RadioCardGroup
                            options={[
                                { id: 'ghorbari', label: t.suggestedOption, icon: CheckCircle2, description: t.suggestedOptionDesc },
                                { id: 'list', label: t.listOption, icon: UserCircle, description: t.listOptionDesc },
                            ]}
                            selected={formData.designerSelectionType}
                            onChange={(id) => updateData('designerSelectionType', id)}
                        />
                    </WizardStep>
                </MainLayout>
            );
        }

        if (step === 7) {
            return (
                <MainLayout>
                    <WizardStep
                        key={`step7-${lang}`}
                        lang={lang}
                        title={typeof t.selectDesignerTitle === 'string' ? t.selectDesignerTitle : "Select Designer"}
                        description={typeof t.selectDesignerDesc === 'string' ? t.selectDesignerDesc : "Pick a professional for your project."}
                        currentStep={visualStep}
                        totalSteps={getDynamicTotalSteps()}
                        onNext={() => setStep(8)}
                        onBack={() => setStep(6)}
                        canNext={!!formData.selectedDesignerId}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-3xl mx-auto px-4 sm:px-0">
                            {designers.length > 0 ? (
                                designers.map((designer: any) => {
                                    const isSelected = formData.selectedDesignerId === designer.id;
                                    // Use a placeholder visual if no portfolio URL exists
                                    const coverImage = designer.portfolio_url || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800';
                                    const rating = designer.rating || "4.9";
                                    const basePrice = designer.starting_price || (designer.hasDesignServices ? 50000 : 25000);

                                    return (
                                        <div
                                            key={designer.id}
                                            onClick={() => updateData('selectedDesignerId', designer.id)}
                                            className={`relative group h-full cursor-pointer transition-transform duration-300 hover:-translate-y-2 ${isSelected ? 'ring-4 ring-primary-600 rounded-xl overflow-hidden' : ''}`}
                                        >
                                            <Card className={`border-neutral-200 shadow-lg overflow-hidden h-full flex flex-col ${isSelected ? 'border-primary-600 bg-primary-50/30' : 'border-none'}`}>
                                                <div className="relative h-[250px] w-full overflow-hidden">
                                                    <img
                                                        src={coverImage}
                                                        alt={designer.company_name || 'Designer Portfolio'}
                                                        className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
                                                    />
                                                    <div className="absolute top-4 left-4 flex flex-wrap gap-2 pr-4">
                                                        {(designer.specializations || []).slice(0, 2).map((tag: string) => (
                                                            <span key={String(tag)} className="bg-white text-neutral-900 text-[10px] font-black px-3 py-1.5 rounded-md uppercase tracking-wide shadow-sm">
                                                                {String(tag)}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="p-6 flex flex-col flex-grow">
                                                    <div className="flex justify-between items-start mb-2 gap-3">
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 mb-1.5">
                                                                <Link
                                                                    href={`/partner/${designer.user_id}`}
                                                                    target="_blank"
                                                                    onClick={(e) => e.stopPropagation()}
                                                                    className="shrink-0"
                                                                >
                                                                    <div className="w-5 h-5 rounded-full bg-neutral-200 overflow-hidden relative shrink-0">
                                                                        {designer.profile?.avatar_url ? (
                                                                            <img src={designer.profile.avatar_url} alt={designer.profile.full_name} className="object-cover w-full h-full" />
                                                                        ) : (
                                                                            <UserCircle className="w-3 h-3 text-neutral-400 absolute inset-0 m-auto" />
                                                                        )}
                                                                    </div>
                                                                </Link>
                                                                <h3 className="text-[16px] md:text-lg font-black text-neutral-900 uppercase tracking-tight truncate">
                                                                    <Link
                                                                        href={`/partner/${designer.user_id}`}
                                                                        target="_blank"
                                                                        onClick={(e) => e.stopPropagation()}
                                                                        className="hover:text-primary-600 transition-colors"
                                                                    >
                                                                        {designer.company_name || designer.contact_person_name}
                                                                    </Link>
                                                                </h3>
                                                            </div>
                                                            <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-widest pl-7">
                                                                {designer.experience_years ? `${designer.experience_years} ${t.yearsExp}` : t.verifiedExpert}
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 bg-neutral-50 px-2.5 py-1.5 rounded-lg shrink-0">
                                                            <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                                                            <span className="font-black text-[15px] tracking-tight">{rating}</span>
                                                        </div>
                                                    </div>

                                                    <div className="mt-6 pt-5 border-t border-neutral-100 flex items-center justify-between gap-4 mt-auto">
                                                        <div>
                                                            <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-1">{t.startingFrom}</p>
                                                            <div className="flex items-center gap-0.5">
                                                                <span className="font-bold text-base text-neutral-900 mt-0.5">৳</span>
                                                                <span className="font-black text-2xl text-neutral-900 tracking-tight">
                                                                    {basePrice.toLocaleString()}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <Button
                                                            className={`rounded-xl px-6 font-black uppercase tracking-wider text-xs h-12 transition-all shrink-0 ${isSelected
                                                                ? 'bg-primary-600 hover:bg-primary-700 text-white'
                                                                : 'bg-black hover:bg-neutral-800 text-white'
                                                                }`}
                                                        >
                                                            {isSelected ? t.selected : t.bookNow}
                                                        </Button>
                                                    </div>
                                                </div>
                                            </Card>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="col-span-full py-12 text-center text-neutral-500 bg-white rounded-3xl border border-dashed border-neutral-200">
                                    <UserCircle className="w-12 h-12 mx-auto text-neutral-300 mb-3" />
                                    <p className="font-bold text-lg">{t.noDesigners}</p>
                                    <p className="text-sm">{t.noDesignersDesc}</p>
                                </div>
                            )}
                        </div>
                    </WizardStep>
                </MainLayout>
            );
        }

        if (step === 12) {
            return (
                <MainLayout>
                    {renderScheduleStep(visualStep - 1, totalSteps, nextStep, prevStep)}
                </MainLayout>
            );
        }

        if (step === 13) {
            let price = 0;
            if (formData.designerOption === 'both') price = 80000;
            else if (formData.designerOption === 'design') price = 50000;
            else if (formData.designerOption === 'approval') price = 30000;

            if (serviceTypes.includes('interior')) {
                price += 20000;
            }

            const selectedDesigner = designers.find((d: any) => d.id === formData.selectedDesignerId);
            const providerName = formData.designerSelectionType === 'ghorbari' ? 'Ghorbari Assigned Expert' : (selectedDesigner?.company_name || selectedDesigner?.contact_person_name || 'Selected Designer');

            return (
                <MainLayout>
                    <WizardStep
                        key={`step-review-${lang}`}
                        lang={lang}
                        title={t.reviewTitle}
                        description={t.reviewDesc}
                        currentStep={visualStep - 1}
                        totalSteps={totalSteps}
                        onNext={handleSubmit}
                        onBack={prevStep}
                        isLastStep
                        canNext={true}
                        nextLabel={loading ? t.generatingReq : t.completeBooking}
                    >
                        <div className="bg-white rounded-[16px] border border-neutral-300 shadow-sm overflow-hidden text-left mx-auto max-w-2xl mt-4">
                            {/* Inner Header Section */}
                            <div className="bg-[#f3fbfa] p-8 border-b border-neutral-300 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                <div>
                                    <h3 className="text-[22px] font-black text-neutral-900 tracking-tight">{t.tentativeQuote}</h3>
                                    <p className="text-[13px] font-medium text-neutral-600 mt-2">{t.statusWait}</p>
                                </div>
                                <div className="text-left md:text-right">
                                    <div className="flex items-center md:justify-end gap-1 font-black text-[32px] text-[#0a1b3d] leading-none">
                                        <span className="text-[26px]">৳</span> {price.toLocaleString()}
                                    </div>
                                    <p className="text-[11px] font-black tracking-widest text-[#0a1b3d]/70 uppercase mt-2">{t.startingPrice}</p>
                                </div>
                            </div>

                            {/* Body Section */}
                            <div className="p-8 space-y-8 bg-white">

                                {/* Service Details Block */}
                                <div className="space-y-1">
                                    <h4 className="text-[13px] font-black text-neutral-400 uppercase tracking-widest mb-4">{t.serviceDetails}</h4>

                                    <div className="flex justify-between items-center py-5 border-b border-neutral-200/70">
                                        <span className="text-[16px] font-bold text-neutral-700">{t.serviceArea}</span>
                                        <span className="text-[16px] font-black text-neutral-900 capitalize">
                                            {serviceTypes.map(s => s === 'structural-architectural' ? 'Structural' : 'Interior').join(', ')}
                                        </span>
                                    </div>

                                    <div className="flex justify-between items-center py-5 border-b border-neutral-200/70">
                                        <span className="text-[16px] font-bold text-neutral-700">{t.assignedProvider}</span>
                                        {selectedDesigner ? (
                                            <Link
                                                href={`/partners/${selectedDesigner.id}`}
                                                target="_blank"
                                                className="text-[16px] font-black text-primary-600 hover:underline"
                                            >
                                                {providerName}
                                            </Link>
                                        ) : (
                                            <span className="text-[16px] font-black text-neutral-900">{providerName}</span>
                                        )}
                                    </div>

                                    <div className="flex justify-between items-center py-5 border-b border-neutral-200/70">
                                        <span className="text-[16px] font-bold text-neutral-700">{t.prefDateLabel} & {t.prefTimeLabel}</span>
                                        <span className="text-[16px] font-black text-neutral-900">{String(formData.preferredDate)} | {String(formData.preferredTime)}</span>
                                    </div>
                                </div>

                                {/* Documents Ready Block */}
                                <div className="pt-2">
                                    <h4 className="text-[13px] font-black text-neutral-400 uppercase tracking-widest mb-5">{t.docsReady}</h4>

                                    <div className="flex flex-wrap gap-2.5">
                                        {formData.hasDeed && <span className="px-4 py-1.5 bg-[#effdf5] text-[#00a651] rounded-full font-bold text-[13px] border border-[#d6f6e5]">Deed</span>}
                                        {formData.hasSurveyMap && <span className="px-4 py-1.5 bg-[#effdf5] text-[#00a651] rounded-full font-bold text-[13px] border border-[#d6f6e5]">Survey Map</span>}
                                        {formData.hasMutation && <span className="px-4 py-1.5 bg-[#effdf5] text-[#00a651] rounded-full font-bold text-[13px] border border-[#d6f6e5]">Mutation</span>}
                                        {formData.hasTax && <span className="px-4 py-1.5 bg-[#effdf5] text-[#00a651] rounded-full font-bold text-[13px] border border-[#d6f6e5]">Tax</span>}
                                        {formData.hasNID && <span className="px-4 py-1.5 bg-[#effdf5] text-[#00a651] rounded-full font-bold text-[13px] border border-[#d6f6e5]">NID</span>}
                                        {formData.hasLandPermit && <span className="px-4 py-1.5 bg-[#effdf5] text-[#00a651] rounded-full font-bold text-[13px] border border-[#d6f6e5]">Land Permit</span>}
                                        {formData.hasBuildingApproval && <span className="px-4 py-1.5 bg-[#effdf5] text-[#00a651] rounded-full font-bold text-[13px] border border-[#d6f6e5]">Building Approval</span>}
                                        {(!formData.hasDeed && !formData.hasSurveyMap && !formData.hasMutation && !formData.hasTax && !formData.hasNID && !formData.hasLandPermit && !formData.hasBuildingApproval) && (
                                            <span className="text-[13px] text-neutral-400 italic font-medium px-2 py-1">{t.noDocs}</span>
                                        )}
                                    </div>
                                </div>

                                {/* Structural Requirements Block */}
                                {showsDesignQ && (
                                    <div className="pt-6 border-t border-neutral-200/70 mt-6">
                                        <h4 className="text-[13px] font-black text-neutral-400 uppercase tracking-widest mb-4">{t.projectReqs}</h4>
                                        <div className="grid grid-cols-2 gap-y-5 gap-x-6">
                                            <div>
                                                <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-wide">{t.landArea}</p>
                                                <p className="text-[14px] font-black text-neutral-900 mt-0.5">{String(formData.landAreaKatha || '-')} {t.katha}</p>
                                            </div>
                                            <div>
                                                <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-wide">{t.initialFloors}</p>
                                                <p className="text-[14px] font-black text-neutral-900 mt-0.5">{String(formData.initialFloors || '-')}</p>
                                            </div>
                                            <div className="col-span-2 mt-4 pt-4 border-t border-neutral-100">
                                                <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-wide mb-3">{t.layoutPerUnit}</p>
                                                <div className="flex flex-wrap gap-2 text-[13px] font-bold text-neutral-800">
                                                    {formData.unitsPerFloor && <span className="bg-neutral-100 px-3 py-1.5 rounded-lg border border-neutral-200 whitespace-nowrap">{String(formData.unitsPerFloor)} {t.unit}/floor</span>}
                                                    {formData.bedroomsPerUnit && <span className="bg-neutral-100 px-3 py-1.5 rounded-lg border border-neutral-200 whitespace-nowrap">{String(formData.bedroomsPerUnit)} {t.bed}</span>}
                                                    {formData.bathroomsPerUnit && <span className="bg-neutral-100 px-3 py-1.5 rounded-lg border border-neutral-200 whitespace-nowrap">{String(formData.bathroomsPerUnit)} {t.bath}</span>}
                                                    {formData.drawingRoomPerUnit && <span className="bg-neutral-100 px-3 py-1.5 rounded-lg border border-neutral-200 whitespace-nowrap">{String(formData.drawingRoomPerUnit)} {t.drawing}</span>}
                                                    {formData.kitchenPerUnit && <span className="bg-neutral-100 px-3 py-1.5 rounded-lg border border-neutral-200 whitespace-nowrap">{String(formData.kitchenPerUnit)} {t.kitchen}</span>}
                                                    {formData.balconyPerUnit && <span className="bg-neutral-100 px-3 py-1.5 rounded-lg border border-neutral-200 whitespace-nowrap">{String(formData.balconyPerUnit)} {t.balcony}</span>}
                                                    {formData.othersPerUnit && <span className="bg-neutral-100 px-3 py-1.5 rounded-lg border border-neutral-200 whitespace-nowrap">{String(formData.othersPerUnit)}</span>}
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-wide">{t.soilTest}</p>
                                                <p className="text-[14px] font-black text-neutral-900 mt-0.5">
                                                    {typeof t[(formData.soilTest || '') as keyof typeof t] === 'string' ? t[(formData.soilTest || '') as keyof typeof t] : (formData.soilTest || '-')}
                                                </p>
                                            </div>
                                            {(formData.plotOrientation.length > 0 || formData.specialZones.length > 0 || formData.roofFeatures.length > 0) && (
                                                <div className="col-span-2">
                                                    <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-wide">{t.featuresZones}</p>
                                                    <div className="flex flex-wrap gap-2 mt-1.5">
                                                        {[...formData.plotOrientation, ...formData.specialZones, ...formData.roofFeatures].map(tag => (
                                                            <span key={String(tag)} className="px-3 py-1 bg-neutral-100 text-neutral-700 rounded-md font-bold text-[11px] uppercase tracking-wide">
                                                                {typeof t[tag as keyof typeof t] === 'string' ? t[tag as keyof typeof t] : String(tag)}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Interior Specific Requirements */}
                                {serviceTypes.includes('interior') && (
                                    <div className="pt-6 border-t border-neutral-200/70 mt-6">
                                        <h4 className="text-[13px] font-black text-neutral-400 uppercase tracking-widest mb-4">{t.interiorService} Details</h4>
                                        <div className="grid grid-cols-1 gap-y-4">
                                            {formData.propertyType === 'Full building' && (
                                                <p className="text-sm font-bold text-neutral-800">{String(formData.houseType)} house, {String(formData.intFloors)} floors, {String(formData.intUnitsPerFloor)} units each.</p>
                                            )}
                                            {formData.propertyType === 'Full Apartment' && (
                                                <p className="text-sm font-bold text-neutral-800">{String(formData.aptSize)} sqft Apartment, {String(formData.aptRooms)} rooms.</p>
                                            )}
                                            {formData.propertyType === 'Specific Area' && (
                                                <p className="text-sm font-bold text-neutral-800">{String(formData.specificAreaType)} ({String(formData.bedRoomType) || 'N/A'}), {String(formData.roomSize)} sqft - {String(formData.designScope)}.</p>
                                            )}
                                            {formData.specificInstruction && (
                                                <p className="text-xs text-neutral-600 mt-2 italic">Instruction: {String(formData.specificInstruction)}</p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </WizardStep>
                </MainLayout>
            );
        }
    }

    // --- INTERIOR DESIGN ---
    if (step >= 8 && step <= 11) {
        if (step === 8) {
            return (
                <MainLayout>
                    <WizardStep
                        key={`step8-int-${lang}`}
                        lang={lang}
                        title={typeof t.startJourneyTitle === 'string' ? t.startJourneyTitle : "Start Your Design Journey"}
                        description={typeof t.startJourneyDesc === 'string' ? t.startJourneyDesc : "Select the type of design service you need to get started."}
                        currentStep={visualStep - 1}
                        totalSteps={totalSteps}
                        onNext={nextStep}
                        onBack={prevStep}
                        canNext={!!formData.propertyType}
                    >
                        <div className="space-y-8">
                            <div>
                                <Label className="text-base font-bold mb-4 block text-neutral-800">What are we designing?</Label>
                                <RadioCardGroup
                                    options={[
                                        { id: 'Full building', label: t.fullBuilding || 'Full Building', icon: Building2 },
                                        { id: 'Full Apartment', label: t.fullApt || 'Full Apartment', icon: Home },
                                        { id: 'Specific Area', label: t.specificArea || 'Specific Area', icon: BedDouble },
                                    ]}
                                    selected={formData.propertyType}
                                    onChange={(id) => updateData('propertyType', id)}
                                    columns={3}
                                />
                            </div>
                        </div>
                    </WizardStep>
                </MainLayout>
            );
        }

        if (step === 9) {
            return (
                <MainLayout>
                    <WizardStep
                        key={`step9-int-${lang}`}
                        lang={lang}
                        title={typeof t.projectReqs === 'string' ? t.projectReqs : "Project Requirements"}
                        description={typeof t.spaceLayoutDesc === 'string' ? t.spaceLayoutDesc : "Tell us about the space and requirements."}
                        currentStep={visualStep - 1}
                        totalSteps={totalSteps}
                        onNext={nextStep}
                        onBack={prevStep}
                        canNext={
                            (formData.propertyType === 'Full building' && !!formData.houseType && !!formData.intFloors && !!formData.intUnitsPerFloor && !!formData.intAreaPerUnit) ||
                            (formData.propertyType === 'Full Apartment' && !!formData.aptSize && !!formData.aptRooms) ||
                            (formData.propertyType === 'Specific Area' && !!formData.specificAreaType && (formData.specificAreaType !== 'Bed Room' || !!formData.bedRoomType) && !!formData.designScope && !!formData.roomSize)
                        }
                    >
                        <div className="space-y-8">
                            {formData.propertyType === 'Full building' && (
                                <>
                                    <div>
                                        <Label className="text-base font-bold mb-4 block text-neutral-800">{t.typeOfHouse || "Type of House"}</Label>
                                        <RadioCardGroup
                                            options={[
                                                { id: 'Duplex', label: t.duplex || 'Duplex' },
                                                { id: 'Multistoried', label: t.multistoried || 'Multistoried' },
                                            ]}
                                            selected={formData.houseType}
                                            onChange={(id) => updateData('houseType', id)}
                                            columns={2}
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-neutral-100">
                                        <div className="space-y-3">
                                            <Label className="font-bold text-neutral-700">{t.numFloors || "Number of floor"}</Label>
                                            <Input type="number" placeholder="e.g. 2" className="h-12 bg-neutral-50/50 border-neutral-200" value={formData.intFloors} onChange={(e) => updateData('intFloors', e.target.value)} />
                                        </div>
                                        <div className="space-y-3">
                                            <Label className="font-bold text-neutral-700">{t.unitsEachFloor || "Unit Each Floor"}</Label>
                                            <Input type="number" placeholder="e.g. 2" className="h-12 bg-neutral-50/50 border-neutral-200" value={formData.intUnitsPerFloor} onChange={(e) => updateData('intUnitsPerFloor', e.target.value)} />
                                        </div>
                                        <div className="space-y-3">
                                            <Label className="font-bold text-neutral-700">{t.areaEachUnit || "Area Each Unit"}</Label>
                                            <Input type="number" placeholder="e.g. 1500 sqft" className="h-12 bg-neutral-50/50 border-neutral-200" value={formData.intAreaPerUnit} onChange={(e) => updateData('intAreaPerUnit', e.target.value)} />
                                        </div>
                                    </div>
                                </>
                            )}

                            {formData.propertyType === 'Full Apartment' && (
                                <>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div className="space-y-3">
                                            <Label className="font-bold text-neutral-700">{t.aptSize || "Apartment Size"}</Label>
                                            <Input type="number" placeholder="e.g. 1200 sqft" className="h-12 bg-neutral-50/50 border-neutral-200" value={formData.aptSize} onChange={(e) => updateData('aptSize', e.target.value)} />
                                        </div>
                                        <div className="space-y-3">
                                            <Label className="font-bold text-neutral-700">{t.noOfRoom || "No of Room"}</Label>
                                            <Input type="number" placeholder="e.g. 3" className="h-12 bg-neutral-50/50 border-neutral-200" value={formData.aptRooms} onChange={(e) => updateData('aptRooms', e.target.value)} />
                                        </div>
                                    </div>
                                    <div className="space-y-3 pt-4 border-t border-neutral-100">
                                        <Label className="font-bold text-neutral-700">{t.inspiration || "Inspiration (attachment image or pdf)"}</Label>
                                        <Input type="file" accept="image/*,.pdf" className="h-12 flex items-center bg-neutral-50/50 border-neutral-200 file:mr-4 file:py-1.5 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-bold file:bg-[#effdf5] file:text-[#00a651] hover:file:bg-[#d6f6e5] cursor-pointer" onChange={(e) => updateData('aptInspiration', e.target.files?.[0] || null)} />
                                    </div>
                                </>
                            )}

                            {formData.propertyType === 'Specific Area' && (
                                <>
                                    <div>
                                        <Label className="text-base font-bold mb-4 block text-neutral-800">{t.specificArea || "Select Area"}</Label>
                                        <RadioCardGroup
                                            options={[
                                                { id: 'Living Room', label: t.livingRoom || 'Living Room' },
                                                { id: 'Drawing Room', label: t.drawingRoom || 'Drawing Room' },
                                                { id: 'Bed Room', label: t.bedRoom || 'Bed Room' },
                                                { id: 'Bath Room', label: t.bathRoom || 'Bath Room' },
                                                { id: 'Kitchen', label: t.kitchen || 'Kitchen' },
                                                { id: 'Balcony', label: t.balcony || 'Balcony' },
                                                { id: 'Rooftop', label: t.rooftop || 'Rooftop' },
                                                { id: 'Entrance', label: t.entrance || 'Entrance' },
                                            ]}
                                            selected={formData.specificAreaType}
                                            onChange={(id) => updateData('specificAreaType', id)}
                                            columns={4}
                                        />
                                    </div>

                                    {formData.specificAreaType === 'Bed Room' && (
                                        <div className="pt-4 border-t border-neutral-100">
                                            <Label className="text-base font-bold mb-4 block text-neutral-800">{t.bedRoom || "Select Bedroom Type"}</Label>
                                            <RadioCardGroup
                                                options={[
                                                    { id: 'Master Bedroom', label: t.masterBed || 'Master Bedroom' },
                                                    { id: 'General Bedroom', label: t.generalBed || 'General Bedroom' },
                                                    { id: 'Welcome Newborn', label: t.welcomeNewborn || 'Welcome Newborn' },
                                                    { id: 'Teenagers Special', label: t.teenagersSpecial || 'Teenagers Special' },
                                                    { id: 'Children Bedroom', label: t.childrenBed || 'Children Bedroom' },
                                                ]}
                                                selected={formData.bedRoomType}
                                                onChange={(id) => updateData('bedRoomType', id)}
                                                columns={3}
                                            />
                                        </div>
                                    )}

                                    {(formData.specificAreaType && (formData.specificAreaType !== 'Bed Room' || formData.bedRoomType)) && (
                                        <div className="pt-4 border-t border-neutral-100 space-y-8">
                                            <div>
                                                <Label className="text-base font-bold mb-4 block text-neutral-800">Design Scope</Label>
                                                <RadioCardGroup
                                                    options={[
                                                        { id: 'Entire New Design', label: t.entireNewDesign || 'Entire New Design' },
                                                        { id: 'Specific Renovation', label: t.specificRenovation || 'Specific Renovation' },
                                                    ]}
                                                    selected={formData.designScope}
                                                    onChange={(id) => updateData('designScope', id)}
                                                    columns={2}
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                                <div className="space-y-3">
                                                    <Label className="font-bold text-neutral-700">{t.roomSize || "Room Size"}</Label>
                                                    <Input type="number" placeholder="e.g. 150 sqft" className="h-12 bg-neutral-50/50 border-neutral-200" value={formData.roomSize} onChange={(e) => updateData('roomSize', e.target.value)} />
                                                </div>
                                                <div className="space-y-3">
                                                    <Label className="font-bold text-neutral-700">{t.anyInstruction || "Any specific instruction"}</Label>
                                                    <Input type="text" placeholder="e.g. Keep it minimal" className="h-12 bg-neutral-50/50 border-neutral-200" value={formData.specificInstruction} onChange={(e) => updateData('specificInstruction', e.target.value)} />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </WizardStep>
                </MainLayout>
            );
        }

        if (step === 10) {
            return (
                <MainLayout>
                    <WizardStep
                        key={`step10-int-${lang}`}
                        lang={lang}
                        title={t.aestheticsTitle || "Design Aesthetics"}
                        description={t.aestheticsDesc || "Choose the visual vibe for your building design."}
                        currentStep={visualStep - 1}
                        totalSteps={totalSteps}
                        onNext={nextStep}
                        onBack={prevStep}
                        canNext={!!formData.structuralVibe}
                    >
                        <div className="space-y-8">
                            <div>
                                <Label className="text-base font-bold mb-4 block text-neutral-800">Choose Style</Label>
                                <RadioCardGroup
                                    options={getVibeOptions(lang)}
                                    selected={formData.structuralVibe}
                                    onChange={(id) => updateData('structuralVibe', id)}
                                    columns={2}
                                />
                            </div>
                        </div>
                    </WizardStep>
                </MainLayout>
            );
        }

        if (step === 11) {
            return (
                <MainLayout>
                    <WizardStep
                        key={`step11-int-${lang}`}
                        lang={lang}
                        title={typeof t.chooseRouteTitle === 'string' ? t.chooseRouteTitle : "Choose Designer Route"}
                        description={typeof t.chooseRouteDesc === 'string' ? t.chooseRouteDesc : "How would you like to proceed with your designer?"}
                        currentStep={visualStep - 1}
                        totalSteps={totalSteps}
                        onNext={nextStep}
                        onBack={prevStep}
                        canNext={!!formData.designerSelectionType}
                    >
                        <div className="space-y-8">
                            <RadioCardGroup
                                options={[
                                    { id: 'ghorbari', label: t.suggestedOption, description: t.suggestedOptionDesc, icon: UserCircle },
                                    { id: 'list', label: t.listOption, description: t.listOptionDesc, icon: Star },
                                ]}
                                selected={formData.designerSelectionType}
                                onChange={(id) => updateData('designerSelectionType', id)}
                                columns={2}
                            />
                        </div>
                    </WizardStep>
                </MainLayout>
            );
        }
    }

    return null;
}

function MainLayout({ children }: { children: ReactNode }) {
    return (
        <main className="min-h-screen flex flex-col font-sans bg-neutral-50 relative">
            <Navbar />
            <div className="flex-1 flex flex-col justify-center py-12 px-4 md:px-0 mt-8 md:mt-0">
                {children}
            </div>
            <Footer />
        </main>
    );
}
