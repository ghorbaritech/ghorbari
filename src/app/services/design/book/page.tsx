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
import { Ruler, Home, Building2, PaintBucket, BedDouble, Bath, Wind, Car, Trees, Waves, Dog, Baby, FileText, CheckCircle2, UserCircle, Map as MapIcon, Hash, CheckSquare, Star } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { designTranslations } from '@/utils/designTranslations';
import { useLanguage } from '@/context/LanguageContext';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';

// Layout Types
type UnitDetail = {
    unitId: number;
    bedrooms: string;
    drawingRooms: string;
    bathrooms: string;
    balcony: string;
    kitchen: string;
    diningRooms: string;
    additionalSpace: string;
};

type LayoutData = {
    id: number;
    isGarage: string; // 'yes' | 'no'
    numberOfUnits: string;
    unitsAreIdentical: string; // 'yes' | 'no'
    unitDetails: UnitDetail[];
};

const UnitInputs = ({ 
    layoutId, 
    unit, 
    updateFn, 
    t, 
    title 
}: { 
    layoutId: number, 
    unit: any, 
    updateFn: (lid: number, uid: number, field: string, val: string) => void, 
    t: any, 
    title: string 
}) => {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
            <h4 className="font-black text-sm text-primary-900 border-l-4 border-primary-500 pl-3 uppercase tracking-wider">{title}</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-6">
                <div className="space-y-1.5">
                    <Label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">{t.bed || "Bed"}</Label>
                    <Input 
                        type="number" 
                        placeholder="2" 
                        className="h-12 bg-white rounded-xl font-bold border-neutral-200" 
                        value={unit.bedrooms} 
                        onChange={(e) => updateFn(layoutId, unit.unitId, 'bedrooms', e.target.value)} 
                    />
                </div>
                <div className="space-y-1.5">
                    <Label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">{t.drawingRoom || "Drawing"}</Label>
                    <Input 
                        type="number" 
                        placeholder="1" 
                        className="h-12 bg-white rounded-xl font-bold border-neutral-200" 
                        value={unit.drawingRooms} 
                        onChange={(e) => updateFn(layoutId, unit.unitId, 'drawingRooms', e.target.value)} 
                    />
                </div>
                <div className="space-y-1.5">
                    <Label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">{t.bath || "Bath"}</Label>
                    <Input 
                        type="number" 
                        placeholder="2" 
                        className="h-12 bg-white rounded-xl font-bold border-neutral-200" 
                        value={unit.bathrooms} 
                        onChange={(e) => updateFn(layoutId, unit.unitId, 'bathrooms', e.target.value)} 
                    />
                </div>
                <div className="space-y-1.5">
                    <Label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">{t.balcony || "Balcony"}</Label>
                    <Input 
                        type="number" 
                        placeholder="2" 
                        className="h-12 bg-white rounded-xl font-bold border-neutral-200" 
                        value={unit.balcony} 
                        onChange={(e) => updateFn(layoutId, unit.unitId, 'balcony', e.target.value)} 
                    />
                </div>
                <div className="space-y-1.5">
                    <Label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">{t.kitchen || "Kitchen"}</Label>
                    <Input 
                        type="number" 
                        placeholder="1" 
                        className="h-12 bg-white rounded-xl font-bold border-neutral-200" 
                        value={unit.kitchen} 
                        onChange={(e) => updateFn(layoutId, unit.unitId, 'kitchen', e.target.value)} 
                    />
                </div>
                <div className="space-y-1.5">
                    <Label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">{t.dining || "Dining"}</Label>
                    <Input 
                        type="number" 
                        placeholder="1" 
                        className="h-12 bg-white rounded-xl font-bold border-neutral-200" 
                        value={unit.diningRooms} 
                        onChange={(e) => updateFn(layoutId, unit.unitId, 'diningRooms', e.target.value)} 
                    />
                </div>
                <div className="space-y-1.5 col-span-2">
                    <Label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">{(t as any).extraSpace || "Additional Space / Requirements"}</Label>
                    <Input 
                        placeholder="e.g. Study room, Store" 
                        className="h-12 bg-white rounded-xl font-bold border-neutral-200" 
                        value={unit.additionalSpace} 
                        onChange={(e) => updateFn(layoutId, unit.unitId, 'additionalSpace', e.target.value)} 
                    />
                </div>
            </div>
        </div>
    );
};


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
    const [cmsWizardData, setCmsWizardData] = useState<any>(null);

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
        landAreaInput: '',
        landAreaUnit: 'Katha',
        initialFloors: '',
        numberOfLayouts: '1',
        layoutsData: [{
            id: 1,
            isGarage: 'no',
            numberOfUnits: '1',
            unitsAreIdentical: 'yes',
            unitDetails: [{
                unitId: 1,
                bedrooms: '',
                drawingRooms: '',
                bathrooms: '',
                balcony: '',
                kitchen: '',
                diningRooms: '',
                additionalSpace: ''
            }]
        }] as LayoutData[],
        specialZones: [] as string[],
        plotOrientation: [] as string[],
        structuralVibe: '',
        soilTest: '',
        roofFeatures: [] as string[],

        designerSelectionType: '' as 'Dalankotha' | 'list' | '',
        selectedDesignerId: null as string | null,

        // Interior - Setup
        propertyType: '', // 'Full house' | 'Full Apartment' | 'Specific Area'

        // Full Building
        houseType: '', // 'Duplex' | 'Multistoried'
        intFloors: '',
        intUnitsPerFloor: '',
        intAreaPerUnit: '',
        intAreaUnit: 'sqft',

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

        // Inspiration
        inspirationLink: '',
        selectedInspirationSamples: [] as string[],
    });

    const [serviceTypes, setServiceTypes] = useState<ServiceType[]>(
        initialService ? [initialService] : []
    );

    useEffect(() => {
        async function fetchCMSData() {
            try {
                const { data } = await supabase.from('home_content').select('content').eq('section_key', 'design_wizard_structural').single();
                if (data?.content) {
                    setCmsWizardData(data.content);
                }
            } catch (err) {
                console.error("Error fetching structural wizard CMS data:", err);
            }
        }
        if (serviceTypes.includes('structural-architectural')) {
            fetchCMSData();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [JSON.stringify(serviceTypes)]);

    useEffect(() => {
        async function fetchDesigners() {
            try {
                const reqSpecs: string[] = [];
                if (serviceTypes.includes('structural-architectural')) reqSpecs.push('Structural & architectural');
                if (serviceTypes.includes('interior')) reqSpecs.push('Interior design');

                // Try specialization-filtered query first
                let query = supabase
                    .from('designers')
                    .select('*, profile:profiles(*)');

                if (reqSpecs.length > 0) {
                    query = query.overlaps('active_specializations', reqSpecs);
                }

                let { data, error } = await query;
                console.log('[Designers] specialization query:', data?.length, error);

                // Fallback 1: any designer with a matching specialization but no is_active filter
                if (!data || data.length === 0) {
                    const fb1 = await supabase
                        .from('designers')
                        .select('*, profile:profiles(*)');
                    data = fb1.data;
                    console.log('[Designers] fallback all:', data?.length, fb1.error);
                }

                if (data) {
                    const processed = data.map((d: any) => ({
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [JSON.stringify(serviceTypes)]);


    const updateData = (field: string, value: any) => {
        setFormData(prev => {
            const newData = { ...prev, [field]: value };
            // Defaults
            if (field === 'houseType' && value === 'Duplex') {
                newData.intFloors = '2';
                newData.numberOfLayouts = '1';
            }
            if (field === 'propertyType' && value === 'Full Apartment') {
                newData.numberOfLayouts = '1';
                newData.houseType = '';
            }
            return newData;
        });
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

    const updateLayoutData = (layoutId: number, field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            layoutsData: prev.layoutsData.map(l => l.id === layoutId ? { ...l, [field]: value } : l)
        }));
    };

    const updateUnitDetail = (layoutId: number, unitId: number, field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            layoutsData: prev.layoutsData.map(l => l.id === layoutId ? {
                ...l,
                unitDetails: l.unitDetails.map(u => u.unitId === unitId ? { ...u, [field]: value } : u)
            } : l)
        }));
    };

    const handleNumUnitsChange = (layoutId: number, num: string) => {
        const n = parseInt(num) || 1;
        setFormData(prev => ({
            ...prev,
            layoutsData: prev.layoutsData.map(l => {
                if (l.id !== layoutId) return l;
                const currentUnits = [...l.unitDetails];
                if (currentUnits.length === n) return { ...l, numberOfUnits: num };
                if (currentUnits.length < n) {
                    for (let i = currentUnits.length + 1; i <= n; i++) {
                        currentUnits.push({
                            unitId: i,
                            bedrooms: '',
                            drawingRooms: '',
                            bathrooms: '',
                            balcony: '',
                            kitchen: '',
                            diningRooms: '',
                            additionalSpace: ''
                        });
                    }
                } else {
                    currentUnits.splice(n);
                }
                return { ...l, numberOfUnits: num, unitDetails: currentUnits };
            })
        }));
    };

    useEffect(() => {
        const num = parseInt(formData.numberOfLayouts) || 1;
        if (formData.layoutsData.length !== num) {
            setFormData(prev => {
                const currentLayouts = [...prev.layoutsData];
                if (currentLayouts.length < num) {
                    for (let i = currentLayouts.length + 1; i <= num; i++) {
                        currentLayouts.push({
                            id: i,
                            isGarage: 'no',
                            numberOfUnits: '1',
                            unitsAreIdentical: 'yes',
                            unitDetails: [{
                                unitId: 1,
                                bedrooms: '',
                                drawingRooms: '',
                                bathrooms: '',
                                balcony: '',
                                kitchen: '',
                                diningRooms: '',
                                additionalSpace: ''
                            }]
                        });
                    }
                } else {
                    currentLayouts.splice(num);
                }
                return { ...prev, layoutsData: currentLayouts };
            });
        }
    }, [formData.numberOfLayouts]);

    const showsDesignQ = formData.designerOption === 'design' || formData.designerOption === 'both';
    const skippableListStep = formData.designerSelectionType === 'Dalankotha';



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
                if (formData.designerSelectionType === 'Dalankotha') {
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
                },
                // Add specific structural fields for backend clarity if needed
                buildingDetails: serviceTypes.includes('structural-architectural') ? {
                    landArea: formData.landAreaInput,
                    landAreaUnit: formData.landAreaUnit,
                    floors: formData.initialFloors,
                    layouts: formData.layoutsData
                } : null
            };
            delete payloadDetails.aptInspiration;
            delete payloadDetails.roomInspiration;
            delete payloadDetails.roomImage;
            delete payloadDetails.preferredDate;
            delete payloadDetails.preferredTime;
            // Clean up old fields that are now nested
            delete payloadDetails.landAreaInput;
            delete payloadDetails.landAreaUnit;
            delete payloadDetails.initialFloors;
            delete payloadDetails.layoutsData;

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
            else setStep(8);
        } else if (step === 1) {
            if (formData.designerOption === 'design') setStep(3);
            else setStep(2);
        } else if (step === 2) {
            setStep(3);
        } else if (step === 3) {
            if (showsDesignQ) setStep(4);
            else if (serviceTypes.includes('interior')) setStep(8);
            else setStep(11);
        } else if (step >= 4 && step <= 6) {
            setStep(step + 1);
        } else if (step === 7) {
            if (serviceTypes.includes('interior')) setStep(8);
            else setStep(11);
        } else if (step >= 8 && step <= 10) {
            // Interior flow
            if (step === 8) setStep(9);
            else if (step === 9) {
                if (formData.propertyType === 'Full building') setStep(10);
                else setStep(11);
            } else if (step === 10) {
                setStep(11);
            }
        } else if (step === 11) {
            // Designer route decision (Structural)
            if (serviceTypes.includes('interior')) setStep(13);
            else if (skippableListStep) setStep(13);
            else setStep(12);
        } else if (step === 12) {
            setStep(13);
        } else if (step === 13) {
            setStep(14);
        }
    };

    const prevStep = () => {
        if (step === 1) setStep(0);
        else if (step >= 2 && step <= 7) {
            if (step === 4) setStep(3);
            else setStep(step - 1);
        } else if (step === 8) {
            if (serviceTypes.includes('structural-architectural')) {
                if (showsDesignQ) setStep(7);
                else setStep(3);
            } else setStep(0);
        } else if (step === 9) {
            setStep(8);
        } else if (step === 10) {
            setStep(9);
        } else if (step === 11) {
            if (formData.propertyType === 'Full building') setStep(10);
            else setStep(9);
        } else if (step === 12) {
            setStep(11);
        } else if (step === 13) {
            if (serviceTypes.includes('interior')) setStep(11);
            else if (skippableListStep) setStep(11);
            else setStep(12);
        } else if (step === 14) {
            setStep(13);
        }
    };


    const getActiveSteps = () => {
        const active: number[] = [0];
        if (serviceTypes.includes('structural-architectural')) {
            active.push(1);
            if (formData.designerOption !== 'design') active.push(2);
            active.push(3);
            if (showsDesignQ) {
                active.push(4, 5, 6, 7);
            }
        }
        if (serviceTypes.includes('interior')) {
            active.push(8, 9);
            if (formData.propertyType === 'Full building' && (formData.houseType === 'Multistoried' || formData.houseType === 'Duplex')) active.push(10);
            active.push(11);
        }
        active.push(13, 14);
        return active;
    };

    const activeSteps = getActiveSteps();
    const totalSteps = activeSteps.length;
    const visualStep = activeSteps.indexOf(step) + 1;

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
    if (step === 1) {
        return (
            <MainLayout>
                <WizardStep
                    key={`step1-${lang}`}
                    lang={lang}
                    title={t.findDesignerTitle}
                    description={t.findDesignerDesc}
                    currentStep={visualStep - 1}
                    totalSteps={totalSteps}
                    onNext={nextStep}
                    onBack={prevStep}
                    canNext={!!formData.designerOption}
                >
                    <RadioCardGroup
                        options={[
                            { id: 'approval', label: t.buildingApproval, icon: CheckCircle2, description: t.buildingApprovalDesc },
                            { id: 'design', label: t.buildingDesign, icon: PaintBucket, description: t.buildingDesignDesc },
                            { id: 'both', label: t.bothApprovalDesign, icon: Ruler, description: t.bothApprovalDesignDesc },
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
                    title={t.docChecklistTitle}
                    description={t.docChecklistDesc}
                    currentStep={visualStep - 1}
                    totalSteps={totalSteps}
                    onNext={nextStep}
                    onBack={prevStep}
                >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                            { id: 'hasDeed', label: t.deedDoc },
                            { id: 'hasSurveyMap', label: t.surveyMap },
                            { id: 'hasMutation', label: t.mutation },
                            { id: 'hasTax', label: t.tax },
                            { id: 'hasNID', label: t.nid },
                            { id: 'hasLandPermit', label: t.landPermit },
                            { id: 'hasBuildingApproval', label: t.buildingApprovalDoc },
                        ].map((doc) => (
                            <div
                                key={doc.id}
                                className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-all ${formData[doc.id as keyof typeof formData] ? 'bg-primary-50 border-primary-600' : 'hover:bg-neutral-50'
                                    }`}
                                onClick={() => updateData(doc.id as any, !formData[doc.id as keyof typeof formData])}
                            >
                                <Checkbox checked={!!formData[doc.id as keyof typeof formData]} />
                                <span className={`text-sm font-bold ${formData[doc.id as keyof typeof formData] ? 'text-primary-900' : 'text-neutral-700'}`}>{doc.label}</span>
                            </div>
                        ))}
                    </div>
                </WizardStep>
            </MainLayout>
        );
    }

    if (step === 3) {
        return (
            <MainLayout>
                <WizardStep
                    key={`step3-${lang}`}
                    lang={lang}
                    title={(t as any).uploadDocsTitle || "Upload Documents"}
                    description={(t as any).uploadDocsDesc || "Please upload copies of the documents you've checked."}
                    currentStep={visualStep - 1}
                    totalSteps={totalSteps}
                    onNext={nextStep}
                    onBack={prevStep}
                >
                    <div className="space-y-6">
                        <div className="border-2 border-dashed border-neutral-300 rounded-3xl p-12 text-center bg-neutral-50/50 hover:bg-neutral-50 transition-colors cursor-pointer group">
                            <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                <FileText className="w-8 h-8 text-primary-600" />
                            </div>
                            <h4 className="font-black text-neutral-900 mb-1 uppercase tracking-wider text-sm">UPLOAD DOCUMENTS</h4>
                            <p className="text-neutral-500 text-xs font-bold">Max file size: 10MB</p>
                            <Input type="file" multiple className="hidden" />
                        </div>
                        <p className="text-center text-xs font-bold text-neutral-400 italic">Click to browse or drag and drop files here</p>
                    </div>
                </WizardStep>
            </MainLayout>
        );
    }

    if (step === 4) {
        return (
            <MainLayout>
                <WizardStep
                    key={`step4-land-${lang}`}
                    lang={lang}
                    title={t.spaceLayoutTitle}
                    description={t.spaceLayoutDesc}
                    currentStep={visualStep - 1}
                    totalSteps={totalSteps}
                    onNext={nextStep}
                    onBack={prevStep}
                    canNext={!!(formData.landAreaInput && formData.landAreaUnit && formData.initialFloors && formData.numberOfLayouts)}
                >
                    <div className="max-w-2xl mx-auto space-y-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-4">
                                <Label className="text-sm font-black text-neutral-400 uppercase tracking-widest">{t.landAreaQ}</Label>
                                <div className="flex gap-2">
                                    <Input
                                        type="number"
                                        placeholder="e.g. 5"
                                        className="h-14 bg-neutral-50/50 border-neutral-200 text-lg font-bold px-6 rounded-2xl"
                                        value={formData.landAreaInput}
                                        onChange={(e) => updateData('landAreaInput', e.target.value)}
                                    />
                                    <Select value={formData.landAreaUnit} onValueChange={(v) => updateData('landAreaUnit', v)}>
                                        <SelectTrigger className="w-[140px] h-14 bg-neutral-50/50 border-neutral-200 font-bold rounded-2xl">
                                            <SelectValue placeholder="Unit" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Katha">Katha</SelectItem>
                                            <SelectItem value="sqft">sqft</SelectItem>
                                            <SelectItem value="sqmeter">sqmeter</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <Label className="text-sm font-black text-neutral-400 uppercase tracking-widest">{t.floorsQ}</Label>
                                <Input
                                    type="number"
                                    placeholder="e.g. 2"
                                    className="h-14 bg-neutral-50/50 border-neutral-200 text-lg font-bold px-6 rounded-2xl"
                                    value={formData.initialFloors}
                                    onChange={(e) => updateData('initialFloors', e.target.value)}
                                />
                            </div>
                            <div className="space-y-4 md:col-span-2 pt-6 border-t border-neutral-100">
                                <Label className="text-sm font-black text-neutral-400 uppercase tracking-widest">{t.numLayoutsQ}</Label>
                                <div className="max-w-xs">
                                    <Input
                                        type="number"
                                        min="1"
                                        max="10"
                                        placeholder="e.g. 1"
                                        className="h-14 bg-neutral-50/50 border-neutral-200 text-lg font-bold px-6 rounded-2xl"
                                        value={formData.numberOfLayouts}
                                        onChange={(e) => {
                                            updateData('numberOfLayouts', e.target.value);
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </WizardStep>
            </MainLayout>
        );
    }

    if (step === 5) {
        return (
            <MainLayout>
                <WizardStep
                    key={`step5-layouts-${lang}`}
                    lang={lang}
                    title={t.numLayoutsQ || "How Many Different Layouts?"}
                    description={t.spaceLayoutDesc}
                    currentStep={visualStep - 1}
                    totalSteps={totalSteps}
                    onNext={nextStep}
                    onBack={prevStep}
                >
                    <div className="max-w-4xl mx-auto space-y-8">
                        <Tabs defaultValue="1" className="w-full">
                            <TabsList className="grid grid-cols-4 mb-8 bg-neutral-100 p-1 rounded-xl">
                                {formData.layoutsData.map((layout) => (
                                    <TabsTrigger 
                                        key={layout.id} 
                                        value={String(layout.id)}
                                        className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm font-bold text-xs py-2.5"
                                    >
                                        {t.layoutTab} {layout.id}
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                            {formData.layoutsData.map((layout) => (
                                <TabsContent key={layout.id} value={String(layout.id)} className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm space-y-6">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-100">
                                            <div className="space-y-1">
                                                <h3 className="font-bold text-lg text-neutral-800">{t.layoutTab} {layout.id} Configuration</h3>
                                                <p className="text-sm text-neutral-500">Define use and structure for this layout.</p>
                                            </div>
                                            <div className="flex items-center gap-2 bg-neutral-50 p-1.5 rounded-lg border border-neutral-200">
                                                <Label className="text-xs font-bold px-2">{t.garageQ}</Label>
                                                <div className="flex gap-1">
                                                    <Button 
                                                        variant={layout.isGarage === 'yes' ? 'default' : 'outline'} 
                                                        size="sm" 
                                                        className={`h-8 px-4 text-xs font-bold rounded-md ${layout.isGarage === 'yes' ? 'bg-primary-900 text-white' : 'text-neutral-500'}`}
                                                        onClick={() => updateLayoutData(layout.id, 'isGarage', 'yes')}
                                                    >
                                                        {t.yes}
                                                    </Button>
                                                    <Button 
                                                        variant={layout.isGarage === 'no' ? 'default' : 'outline'} 
                                                        size="sm" 
                                                        className={`h-8 px-4 text-xs font-bold rounded-md ${layout.isGarage === 'no' ? 'bg-primary-900 text-white' : 'text-neutral-500'}`}
                                                        onClick={() => updateLayoutData(layout.id, 'isGarage', 'no')}
                                                    >
                                                        {t.no}
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>

                                        {layout.isGarage === 'no' && (
                                            <>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className="space-y-3">
                                                        <Label className="font-bold text-neutral-700">{t.numUnitsQ}</Label>
                                                        <Input 
                                                            type="number" 
                                                            className="h-12 bg-neutral-50/50 border-neutral-200" 
                                                            value={layout.numberOfUnits} 
                                                            onChange={(e) => handleNumUnitsChange(layout.id, e.target.value)} 
                                                        />
                                                    </div>
                                                    <div className="space-y-3">
                                                        <Label className="font-bold text-neutral-700">{t.identicalUnitsQ}</Label>
                                                        <div className="flex gap-4">
                                                            <div className={`flex-1 border text-center font-bold text-sm rounded-xl p-3 cursor-pointer transition-all ${layout.unitsAreIdentical === 'yes' ? 'bg-primary-900 text-white shadow-md' : 'bg-neutral-50 text-neutral-700 border-neutral-200'}`} onClick={() => updateLayoutData(layout.id, 'unitsAreIdentical', 'yes')}>{t.yes}</div>
                                                            <div className={`flex-1 border text-center font-bold text-sm rounded-xl p-3 cursor-pointer transition-all ${layout.unitsAreIdentical === 'no' ? 'bg-primary-900 text-white shadow-md' : 'bg-neutral-50 text-neutral-700 border-neutral-200'}`} onClick={() => updateLayoutData(layout.id, 'unitsAreIdentical', 'no')}>{t.no}</div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="mt-8">
                                                    {layout.unitsAreIdentical === 'yes' ? (
                                                        <UnitInputs 
                                                            layoutId={layout.id} 
                                                            unit={layout.unitDetails[0]} 
                                                            updateFn={updateUnitDetail} 
                                                            t={t} 
                                                            title={`${t.unitTab} Details (All ${layout.numberOfUnits} units)`}
                                                        />
                                                    ) : (
                                                        <div className="space-y-12">
                                                            {layout.unitDetails.map((unit, idx) => (
                                                                <UnitInputs 
                                                                    key={unit.unitId}
                                                                    layoutId={layout.id} 
                                                                    unit={unit} 
                                                                    updateFn={updateUnitDetail} 
                                                                    t={t} 
                                                                    title={`${t.unitTab} ${idx + 1} Details`}
                                                                />
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </TabsContent>
                            ))}
                        </Tabs>
                    </div>
                </WizardStep>
            </MainLayout>
        );
    }

    if (step === 6) {
        return (
            <MainLayout>
                <WizardStep
                    key={`step6-plot-${lang}`}
                    lang={lang}
                    title={t.plotFeaturesTitle || "Plot Features"}
                    description={t.plotFeaturesDesc || "Tell us about your land."}
                    currentStep={visualStep - 1}
                    totalSteps={totalSteps}
                    onNext={nextStep}
                    onBack={prevStep}
                >
                    <div className="max-w-3xl mx-auto space-y-12">
                        <div className="space-y-4">
                            <Label className="text-sm font-black text-neutral-400 uppercase tracking-widest border-b pb-2 flex items-center gap-2">
                                <MapIcon className="w-4 h-4" /> {t.orientationQ}
                            </Label>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                {(['North', 'South', 'East', 'West'] as const).map(opt => (
                                    <div key={opt} className={`border rounded-xl p-4 flex items-center gap-3 cursor-pointer transition-all ${formData.plotOrientation?.includes(opt) ? 'bg-primary-50 border-primary-600 shadow-sm' : 'hover:bg-neutral-50'}`} onClick={() => toggleArrayItem('plotOrientation', opt)}>
                                        <Checkbox checked={formData.plotOrientation?.includes(opt)} />
                                        <span className="text-sm font-bold">{t[opt as keyof typeof t] || opt}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <Label className="text-sm font-black text-neutral-400 uppercase tracking-widest border-b pb-2 flex items-center gap-2">
                                <CheckSquare className="w-4 h-4" /> {t.soilTestQ}
                            </Label>
                            <div className="flex gap-4 max-w-md">
                                <div className={`flex-1 border text-center font-bold text-sm rounded-xl p-4 cursor-pointer transition-all ${formData.soilTest === 'Yes' ? 'bg-primary-900 text-white border-primary-900 shadow-md' : 'hover:bg-neutral-50 text-neutral-700'}`} onClick={() => updateData('soilTest', 'Yes')}>{t.yes}</div>
                                <div className={`flex-1 border text-center font-bold text-sm rounded-xl p-4 cursor-pointer transition-all ${formData.soilTest === 'No' ? 'bg-primary-900 text-white border-primary-900 shadow-md' : 'hover:bg-neutral-50 text-neutral-700'}`} onClick={() => updateData('soilTest', 'No')}>{t.no}</div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <Label className="text-sm font-black text-neutral-400 uppercase tracking-widest border-b pb-2 flex items-center gap-2">
                                <Waves className="w-4 h-4" /> {t.roofFeaturesQ}
                            </Label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {(['Roof garden', 'Swimming pool'] as const).map(opt => (
                                    <div key={opt} className={`border rounded-xl p-4 flex items-center gap-3 cursor-pointer transition-all ${formData.roofFeatures?.includes(opt) ? 'bg-primary-50 border-primary-600 shadow-sm' : 'hover:bg-neutral-50'}`} onClick={() => toggleArrayItem('roofFeatures', opt)}>
                                        <Checkbox checked={formData.roofFeatures?.includes(opt)} />
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

    if (step === 7) {
        return (
            <MainLayout>
                <WizardStep
                    key={`step7-struct-vibe-${lang}`}
                    lang={lang}
                    title={t.aestheticsTitle}
                    description={t.aestheticsDesc}
                    currentStep={visualStep - 1}
                    totalSteps={totalSteps}
                    onNext={nextStep}
                    onBack={prevStep}
                >
                    <RadioCardGroup
                        options={getVibeOptions(lang)}
                        selected={formData.structuralVibe}
                        onChange={(id) => updateData('structuralVibe', id)}
                        columns={2}
                    />
                </WizardStep>
            </MainLayout>
        );
    }

    if (step === 8) {
        return (
            <MainLayout>
                <WizardStep
                    key={`step8-property-type-${lang}`}
                    lang={lang}
                    title={t.propertyType || "Property Type"}
                    description={t.startJourneyDesc}
                    currentStep={visualStep - 1}
                    totalSteps={totalSteps}
                    onNext={nextStep}
                    onBack={prevStep}
                    canNext={!!formData.propertyType}
                >
                    <RadioCardGroup
                        options={[
                            { id: 'Full building', label: t.fullBuilding, icon: Building2 },
                            { id: 'Full Apartment', label: t.fullApt, icon: Home },
                            { id: 'Specific Area', label: t.specificArea, icon: BedDouble },
                        ]}
                        selected={formData.propertyType}
                        onChange={(id) => updateData('propertyType', id)}
                        columns={3}
                    />
                </WizardStep>
            </MainLayout>
        );
    }

    if (step === 9) {
        return (
            <MainLayout>
                <WizardStep
                    key={`step9-int-reqs-${lang}`}
                    lang={lang}
                    title={t.projectReqs}
                    description={t.spaceLayoutDesc}
                    currentStep={visualStep - 1}
                    totalSteps={totalSteps}
                    onNext={nextStep}
                    onBack={prevStep}
                    canNext={
                        formData.propertyType === 'Full building' ? (
                            formData.houseType === 'Multistoried' ? (!!formData.intAreaPerUnit && !!formData.intUnitsPerFloor && !!formData.numberOfLayouts && !!formData.intFloors) :
                            formData.houseType === 'Duplex' ? (!!formData.intFloors && !!formData.intUnitsPerFloor && !!formData.intAreaPerUnit && !!formData.numberOfLayouts) :
                            false
                        ) :
                        formData.propertyType === 'Full Apartment' ? (!!formData.aptSize && !!formData.intAreaUnit && !!formData.layoutsData[0].unitDetails[0].bedrooms) :
                        formData.propertyType === 'Specific Area' ? (!!formData.specificAreaType && !!formData.roomSize) :
                        false
                    }
                >
                    <div className="space-y-8 animate-in fade-in duration-500">
                        {formData.propertyType === 'Full building' && (
                            <div className="space-y-8">
                                <div className="grid grid-cols-1 gap-6">
                                    <div className="space-y-3">
                                        <Label className="text-sm font-black text-neutral-400 uppercase tracking-widest">{t.typeOfHouse}</Label>
                                        <RadioCardGroup
                                            options={[
                                                { id: 'Duplex', label: t.duplex, icon: Home },
                                                { id: 'Multistoried', label: t.multistoried, icon: Building2 },
                                            ]}
                                            selected={formData.houseType}
                                            onChange={(id) => {
                                                setFormData(prev => ({
                                                    ...prev,
                                                    houseType: id,
                                                    intFloors: prev.intFloors || (id === 'Duplex' ? '2' : '5'),
                                                    intUnitsPerFloor: prev.intUnitsPerFloor || (id === 'Duplex' ? '1' : '10'),
                                                    intAreaPerUnit: prev.intAreaPerUnit || (id === 'Duplex' ? '1500' : '2000'),
                                                    numberOfLayouts: prev.numberOfLayouts || '1'
                                                }));
                                            }}
                                            columns={2}
                                        />
                                    </div>
                                </div>

                                {formData.houseType === 'Multistoried' ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8 animate-in slide-in-from-top-4 duration-500">
                                        <div className="space-y-3 md:col-span-2 bg-neutral-50/30 p-4 rounded-2xl border border-neutral-100">
                                            <Label className="text-sm font-black text-neutral-400 uppercase tracking-widest">{(t as any).floorAreaQ || "Area of the floor"}</Label>
                                            <div className="flex gap-4">
                                                <Input type="number" placeholder="2000" className="h-14 bg-white rounded-xl flex-1 text-lg font-bold border-neutral-200" value={formData.intAreaPerUnit} onChange={(e) => updateData('intAreaPerUnit', e.target.value)} />
                                                <Select value={formData.intAreaUnit} onValueChange={(v) => updateData('intAreaUnit', v)}>
                                                    <SelectTrigger className="w-[160px] h-14 bg-white rounded-xl font-bold border-neutral-200">
                                                        <SelectValue placeholder="Unit" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="sqft">sqft</SelectItem>
                                                        <SelectItem value="Katha">Katha</SelectItem>
                                                        <SelectItem value="Decimal">Decimal</SelectItem>
                                                        <SelectItem value="Bigha">Bigha</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <Label className="text-sm font-black text-neutral-400 uppercase tracking-widest">{t.numFloors || "Number of floors"}</Label>
                                            <Input type="number" placeholder="5" className="h-14 bg-neutral-50/50 rounded-xl font-bold border-neutral-200" value={formData.intFloors} onChange={(e) => updateData('intFloors', e.target.value)} />
                                        </div>
                                        <div className="space-y-3">
                                            <Label className="text-sm font-black text-neutral-400 uppercase tracking-widest">{(t as any).totalUnitsQ || "Total units"}</Label>
                                            <Input type="number" placeholder="10" className="h-14 bg-neutral-50/50 rounded-xl font-bold border-neutral-200" value={formData.intUnitsPerFloor} onChange={(e) => updateData('intUnitsPerFloor', e.target.value)} />
                                        </div>
                                        <div className="space-y-3 md:col-span-2">
                                            <Label className="text-sm font-black text-neutral-400 uppercase tracking-widest">{(t as any).layoutCountQ || "Layout Counts"}</Label>
                                            <Input type="number" min="1" max="10" placeholder="2" className="h-14 bg-neutral-50/50 rounded-xl font-bold border-neutral-200" value={formData.numberOfLayouts} onChange={(e) => updateData('numberOfLayouts', e.target.value)} />
                                        </div>
                                    </div>
                                ) : formData.houseType === 'Duplex' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8 animate-in slide-in-from-top-4 duration-500">
                                        <div className="space-y-3 md:col-span-2 bg-neutral-50/30 p-4 rounded-2xl border border-neutral-100">
                                            <Label className="text-sm font-black text-neutral-400 uppercase tracking-widest">{t.areaEachUnit || "Area of each floor"}</Label>
                                            <div className="flex gap-4">
                                                <Input type="number" placeholder="1500" className="h-14 bg-white rounded-xl flex-1 text-lg font-bold border-neutral-200" value={formData.intAreaPerUnit} onChange={(e) => updateData('intAreaPerUnit', e.target.value)} />
                                                <Select value={formData.intAreaUnit} onValueChange={(v) => updateData('intAreaUnit', v)}>
                                                    <SelectTrigger className="w-[160px] h-14 bg-white rounded-xl font-bold border-neutral-200">
                                                        <SelectValue placeholder="Unit" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="sqft">sqft</SelectItem>
                                                        <SelectItem value="Katha">Katha</SelectItem>
                                                        <SelectItem value="Decimal">Decimal</SelectItem>
                                                        <SelectItem value="Bigha">Bigha</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <Label className="text-sm font-black text-neutral-400 uppercase tracking-widest">{t.numFloors || "Number of floors"}</Label>
                                            <Input type="number" placeholder="2" className="h-14 bg-neutral-50/50 rounded-xl font-bold border-neutral-200" value={formData.intFloors} onChange={(e) => updateData('intFloors', e.target.value)} />
                                        </div>
                                        <div className="space-y-3">
                                            <Label className="text-sm font-black text-neutral-400 uppercase tracking-widest">{t.unitsEachFloor || "Units per floor"}</Label>
                                            <Input type="number" placeholder="2" className="h-14 bg-neutral-50/50 rounded-xl font-bold border-neutral-200" value={formData.intUnitsPerFloor} onChange={(e) => updateData('intUnitsPerFloor', e.target.value)} />
                                        </div>
                                        <div className="space-y-3 md:col-span-2">
                                            <Label className="text-sm font-black text-neutral-400 uppercase tracking-widest">{(t as any).layoutCountQ || "Layout Counts"}</Label>
                                            <Input type="number" min="1" max="10" placeholder="1" className="h-14 bg-neutral-50/50 rounded-xl font-bold border-neutral-200" value={formData.numberOfLayouts} onChange={(e) => updateData('numberOfLayouts', e.target.value)} />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                        {formData.propertyType === 'Full Apartment' && (
                            <div className="space-y-10 animate-in fade-in duration-500">
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black text-primary-600 uppercase tracking-[0.2em]">{t.propertyType} Details</h4>
                                    <div className="grid grid-cols-1 gap-6">
                                        <div className="space-y-3 bg-neutral-50/30 p-6 rounded-3xl border border-neutral-100">
                                            <Label className="text-sm font-black text-neutral-400 uppercase tracking-widest">{t.aptSize}</Label>
                                            <div className="flex gap-4">
                                                <Input type="number" placeholder="1200" className="h-14 bg-white rounded-xl flex-1 text-lg font-bold border-neutral-200" value={formData.aptSize} onChange={(e) => updateData('aptSize', e.target.value)} />
                                                <Select value={formData.intAreaUnit} onValueChange={(v) => updateData('intAreaUnit', v)}>
                                                    <SelectTrigger className="w-[160px] h-14 bg-white rounded-xl font-bold border-neutral-200">
                                                        <SelectValue placeholder="Unit" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="sqft">sqft</SelectItem>
                                                        <SelectItem value="Katha">Katha</SelectItem>
                                                        <SelectItem value="Decimal">Decimal</SelectItem>
                                                        <SelectItem value="Bigha">Bigha</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white border border-neutral-200 rounded-3xl p-8 shadow-sm animate-in zoom-in-95 duration-500 delay-150">
                                    <UnitInputs 
                                        layoutId={formData.layoutsData[0].id} 
                                        unit={formData.layoutsData[0].unitDetails[0]} 
                                        updateFn={updateUnitDetail} 
                                        t={t} 
                                        title={t.aptDetailsTitle || "Apartment Room Details"}
                                    />
                                </div>
                            </div>
                        )}
                        {formData.propertyType === 'Specific Area' && (
                            <div className="space-y-10 animate-in fade-in duration-500">
                                <div className="space-y-8">
                                    <Label className="text-sm font-black text-neutral-400 uppercase tracking-widest">{t.selectAreaQ || "Select Area"}</Label>
                                    
                                    {/* Standard Areas */}
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2">
                                            <div className="h-1 w-8 bg-neutral-200 rounded-full" />
                                            <h4 className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">{t.standardAreas || "Standard Areas"}</h4>
                                        </div>
                                        <RadioCardGroup
                                            options={[
                                                { id: 'Living Room', label: t.livingRoom, image: 'https://images.unsplash.com/photo-1583847268964-b28dc2f51ac9?w=400&h=400&fit=crop' },
                                                { id: 'Drawing Room', label: t.drawingRoom, image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=400&h=400&fit=crop' },
                                                { id: 'Kitchen', label: t.kitchen, image: 'https://images.unsplash.com/photo-1556911223-e4524a73936d?w=400&h=400&fit=crop' },
                                                { id: 'Bath Room', label: t.bathRoom, image: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=400&h=400&fit=crop' },
                                                { id: 'Balcony', label: t.balcony, image: 'https://images.unsplash.com/photo-1560448204-61dc36dc98bd?w=400&h=400&fit=crop' },
                                                { id: 'Rooftop', label: t.rooftop, image: 'https://images.unsplash.com/photo-1531835597900-51ce18427dfa?w=400&h=400&fit=crop' },
                                                { id: 'Entrance', label: t.entrance, image: 'https://images.unsplash.com/photo-1585128719715-46776b56a0d1?w=400&h=400&fit=crop' },
                                            ]}
                                            selected={formData.specificAreaType}
                                            onChange={(id) => updateData('specificAreaType', id)}
                                            columns={4}
                                        />
                                    </div>

                                    {/* Exclusive/Themed Bedrooms */}
                                    <div className="space-y-4 pt-4 border-t border-dotted border-neutral-200">
                                        <div className="flex items-center gap-2">
                                            <div className="h-1 w-8 bg-primary-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                                            <h4 className="text-[10px] font-black text-primary-600 uppercase tracking-[0.2em]">{t.exclusivePremium || "Exclusive Premium Spaces"}</h4>
                                            <span className="px-2 py-0.5 bg-primary-100 text-primary-700 text-[8px] font-black uppercase tracking-widest rounded-full">Pro</span>
                                        </div>
                                        <RadioCardGroup
                                            options={[
                                                { id: 'Master Bedroom', label: t.masterBed || "Master Bedroom", image: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=400&h=400&fit=crop' },
                                                { id: 'General Bedroom', label: t.generalBed || "General Bedroom", image: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=400&h=400&fit=crop' },
                                                { id: 'New Born', label: (t as any).newBornBed || "Welcome Newborn", image: 'https://images.unsplash.com/photo-1520206151081-30cc81395726?w=400&h=400&fit=crop' },
                                                { id: 'Teenage Cave', label: (t as any).teenageCave || "Teenage Cave", image: 'https://images.unsplash.com/photo-1534349762230-e09ca054d456?w=400&h=400&fit=crop' },
                                                { id: 'Bridal Bed', label: (t as any).bridalBed || "Bridal Bed", image: 'https://images.unsplash.com/photo-1536376074432-8f274fa4bf72?w=400&h=400&fit=crop' },
                                            ]}
                                            selected={formData.specificAreaType}
                                            onChange={(id) => updateData('specificAreaType', id)}
                                            columns={3}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-neutral-100">
                                    <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                                        <Label className="text-sm font-black text-neutral-400 uppercase tracking-widest">{(t as any).roomSizeQ || "Room Size"}</Label>
                                        <div className="flex gap-4">
                                            <Input 
                                                type="number" 
                                                placeholder="200" 
                                                className="h-14 bg-neutral-50/50 rounded-xl flex-1 font-bold border-neutral-200" 
                                                value={formData.roomSize} 
                                                onChange={(e) => updateData('roomSize', e.target.value)} 
                                            />
                                            <Select value={formData.intAreaUnit} onValueChange={(v) => updateData('intAreaUnit', v)}>
                                                <SelectTrigger className="w-[120px] h-14 bg-neutral-50/50 rounded-xl font-bold border-neutral-200">
                                                    <SelectValue placeholder="Unit" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="sqft">sqft</SelectItem>
                                                    <SelectItem value="Katha">Katha</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3 pt-4 border-t border-neutral-100">
                                    <Label className="text-sm font-black text-neutral-400 uppercase tracking-widest">{(t as any).anyInstruction || "Any specific instruction"}</Label>
                                    <textarea 
                                        className="w-full min-h-[120px] p-4 rounded-3xl bg-neutral-50/50 border-2 border-neutral-100 focus:border-primary-200 focus:bg-white transition-all outline-none text-sm leading-relaxed"
                                        placeholder="e.g. I want a modern look with white theme..."
                                        value={formData.specificInstruction}
                                        onChange={(e) => updateData('specificInstruction', e.target.value)}
                                    />
                                </div>
                            </div>
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
                    key={`step10-layouts-${lang}`}
                    lang={lang}
                    title={formData.propertyType === 'Full Apartment' ? (t as any).aptDetailsTitle || "Apartment Room Details" : (t.numLayoutsQ || "How Many Different Layouts?")}
                    description={t.spaceLayoutDesc}
                    currentStep={visualStep - 1}
                    totalSteps={totalSteps}
                    onNext={nextStep}
                    onBack={prevStep}
                >
                    <div className="max-w-4xl mx-auto space-y-8">
                        <Tabs defaultValue="1" className="w-full">
                            {formData.layoutsData.length > 1 && (
                                <TabsList className="grid grid-cols-4 mb-8 bg-neutral-100 p-1 rounded-xl">
                                    {formData.layoutsData.map((layout) => (
                                        <TabsTrigger 
                                            key={layout.id} 
                                            value={String(layout.id)}
                                            className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm font-bold text-xs py-2.5"
                                        >
                                            {t.layoutTab} {layout.id}
                                        </TabsTrigger>
                                    ))}
                                </TabsList>
                            )}
                            {formData.layoutsData.map((layout) => (
                                <TabsContent key={layout.id} value={String(layout.id)} className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm space-y-6">
                                        {formData.propertyType !== 'Full Apartment' && (
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-100">
                                                <div className="space-y-1">
                                                    <h3 className="font-bold text-lg text-neutral-800">{t.layoutTab} {layout.id} Configuration</h3>
                                                    <p className="text-sm text-neutral-500">Define use and structure for this layout.</p>
                                                </div>
                                                <div className="flex items-center gap-2 bg-neutral-50 p-1.5 rounded-lg border border-neutral-200">
                                                    <Label className="text-xs font-bold px-2">{t.garageQ}</Label>
                                                    <div className="flex gap-1">
                                                        <Button 
                                                            variant={layout.isGarage === 'yes' ? 'default' : 'outline'} 
                                                            size="sm" 
                                                            className={`h-8 px-4 text-xs font-bold rounded-md ${layout.isGarage === 'yes' ? 'bg-primary-900 text-white' : 'text-neutral-500'}`}
                                                            onClick={() => updateLayoutData(layout.id, 'isGarage', 'yes')}
                                                        >
                                                            {t.yes}
                                                        </Button>
                                                        <Button 
                                                            variant={layout.isGarage === 'no' ? 'default' : 'outline'} 
                                                            size="sm" 
                                                            className={`h-8 px-4 text-xs font-bold rounded-md ${layout.isGarage === 'no' ? 'bg-primary-900 text-white' : 'text-neutral-500'}`}
                                                            onClick={() => updateLayoutData(layout.id, 'isGarage', 'no')}
                                                        >
                                                            {t.no}
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {formData.propertyType === 'Full Apartment' && (
                                            <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                                                <UnitInputs 
                                                    layoutId={layout.id} 
                                                    unit={layout.unitDetails[0]} 
                                                    updateFn={updateUnitDetail} 
                                                    t={t} 
                                                    title={t.aptDetailsTitle || "Apartment Room Details"}
                                                />
                                            </div>
                                        )}

                                        {formData.propertyType !== 'Full Apartment' && layout.isGarage === 'no' && (
                                            <>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className="space-y-3">
                                                        <Label className="font-bold text-neutral-700">{t.numUnitsQ}</Label>
                                                        <Input 
                                                            type="number" 
                                                            className="h-12 bg-neutral-50/50 border-neutral-200" 
                                                            value={layout.numberOfUnits} 
                                                            onChange={(e) => handleNumUnitsChange(layout.id, e.target.value)} 
                                                        />
                                                    </div>
                                                    <div className="space-y-3">
                                                        <Label className="font-bold text-neutral-700">{t.identicalUnitsQ}</Label>
                                                        <div className="flex gap-4">
                                                            <div className={`flex-1 border text-center font-bold text-sm rounded-xl p-3 cursor-pointer transition-all ${layout.unitsAreIdentical === 'yes' ? 'bg-primary-900 text-white shadow-md' : 'bg-neutral-50 text-neutral-700 border-neutral-200'}`} onClick={() => updateLayoutData(layout.id, 'unitsAreIdentical', 'yes')}>{t.yes}</div>
                                                            <div className={`flex-1 border text-center font-bold text-sm rounded-xl p-3 cursor-pointer transition-all ${layout.unitsAreIdentical === 'no' ? 'bg-primary-900 text-white shadow-md' : 'bg-neutral-50 text-neutral-700 border-neutral-200'}`} onClick={() => updateLayoutData(layout.id, 'unitsAreIdentical', 'no')}>{t.no}</div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="mt-8">
                                                    {layout.unitsAreIdentical === 'yes' ? (
                                                        <UnitInputs 
                                                            layoutId={layout.id} 
                                                            unit={layout.unitDetails[0]} 
                                                            updateFn={updateUnitDetail} 
                                                            t={t} 
                                                            title={`${t.unitTab} Details (All ${layout.numberOfUnits} units)`}
                                                        />
                                                    ) : (
                                                        <div className="space-y-12">
                                                            {layout.unitDetails.map((unit, idx) => (
                                                                <UnitInputs 
                                                                    key={unit.unitId}
                                                                    layoutId={layout.id} 
                                                                    unit={unit} 
                                                                    updateFn={updateUnitDetail} 
                                                                    t={t} 
                                                                    title={`${t.unitTab} ${unit.unitId} Details`}
                                                                />
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </TabsContent>
                            ))}
                        </Tabs>
                    </div>
                </WizardStep>
            </MainLayout>
        );
    }

    if (step === 11) {
        const inspirationSamples = [
            { id: 'sample1', label: 'Modern Luxury', image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=400&h=400&fit=crop' },
            { id: 'sample2', label: 'Classic Elegance', image: 'https://images.unsplash.com/photo-1592595896551-12b371d546d5?w=400&h=400&fit=crop' },
            { id: 'sample3', label: 'Minimalist Zen', image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=400&fit=crop' },
            { id: 'sample4', label: 'Vibrant Art Deco', image: 'https://images.unsplash.com/photo-1588880331179-bc9b93a8cb5e?w=400&h=400&fit=crop' },
        ];

        return (
            <MainLayout>
                <WizardStep
                    key={`step11-inspiration-${lang}`}
                    lang={lang}
                    title={(t as any).inspirationTitle || "Design Inspiration"}
                    description={(t as any).inspirationDesc || "Tell us about your style preference."}
                    currentStep={visualStep - 1}
                    totalSteps={totalSteps}
                    onNext={nextStep}
                    onBack={prevStep}
                >
                    <div className="max-w-3xl mx-auto space-y-12 animate-in fade-in duration-500">
                        <div className="space-y-6">
                            <Label className="text-sm font-black text-neutral-400 uppercase tracking-widest">{(t as any).selectFromSamples || "Select from Samples"}</Label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {inspirationSamples.map((sample) => (
                                    <div 
                                        key={sample.id}
                                        onClick={() => toggleArrayItem('selectedInspirationSamples', sample.id)}
                                        className={`group relative aspect-square rounded-2xl overflow-hidden cursor-pointer border-4 transition-all ${
                                            formData.selectedInspirationSamples.includes(sample.id)
                                                ? 'border-primary-600 scale-95 shadow-inner'
                                                : 'border-transparent hover:border-primary-200'
                                        }`}
                                    >
                                        <img src={sample.image} alt={sample.label} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                        <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${formData.selectedInspirationSamples.includes(sample.id) ? 'opacity-100' : 'opacity-0 group-hover:opacity-40'}`}>
                                            <CheckCircle2 className="w-8 h-8 text-white" />
                                        </div>
                                        <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                                            <p className="text-[10px] font-bold text-white uppercase tracking-wider truncate">{sample.label}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-6 pt-8 border-t border-neutral-100">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="h-4 w-4 rounded-full bg-primary-100 flex items-center justify-center">
                                    <div className="h-2 w-2 rounded-full bg-primary-600" />
                                </div>
                                <Label className="text-sm font-black text-neutral-700 uppercase tracking-widest">{(t as any).yourInspirationLink || "Your Inspiration Link"}</Label>
                            </div>
                            <Input 
                                type="url" 
                                placeholder={(t as any).inspirationLinkPlaceholder || "Share open link of your inspiration"} 
                                className="h-14 bg-white border-2 border-neutral-100 rounded-2xl px-6 focus:border-primary-600 focus:ring-0 transition-all font-medium text-neutral-600" 
                                value={formData.inspirationLink}
                                onChange={(e) => updateData('inspirationLink', e.target.value)}
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
                    key={`step11-route-${lang}`}
                    lang={lang}
                    title={t.chooseRouteTitle}
                    description={t.chooseRouteDesc}
                    currentStep={visualStep - 1}
                    totalSteps={totalSteps}
                    onNext={nextStep}
                    onBack={prevStep}
                    canNext={!!formData.designerSelectionType}
                >
                    <RadioCardGroup
                        options={[
                            { id: 'Dalankotha', label: t.suggestedOption, icon: CheckCircle2, description: t.suggestedOptionDesc },
                            { id: 'list', label: t.listOption, icon: UserCircle, description: t.listOptionDesc },
                        ]}
                        selected={formData.designerSelectionType}
                        onChange={(id) => updateData('designerSelectionType', id)}
                    />
                </WizardStep>
            </MainLayout>
        );
    }

    if (step === 12) {
        return (
            <MainLayout>
                <WizardStep
                    key={`step12-list-${lang}`}
                    lang={lang}
                    title={t.selectDesignerTitle}
                    description={t.selectDesignerDesc}
                    currentStep={visualStep - 1}
                    totalSteps={totalSteps}
                    onNext={nextStep}
                    onBack={prevStep}
                    canNext={!!formData.selectedDesignerId}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {designers.length === 0 && (
                            <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
                                <UserCircle className="w-16 h-16 text-neutral-200 mb-4" />
                                <p className="font-black text-neutral-400 uppercase tracking-widest text-sm">No designers available</p>
                                <p className="text-neutral-400 text-xs mt-2">Please go back and let Dalankotha suggest an expert for you.</p>
                            </div>
                        )}
                        {designers.map((designer) => (
                            <div
                                key={designer.id}
                                onClick={() => updateData('selectedDesignerId', designer.id)}
                                className={`group p-6 border-2 rounded-3xl cursor-pointer transition-all duration-300 ${
                                    formData.selectedDesignerId === designer.id
                                        ? 'bg-primary-50 border-primary-600 shadow-xl'
                                        : 'bg-white border-neutral-100 hover:border-primary-200'
                                }`}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-16 h-16 bg-neutral-100 rounded-2xl flex items-center justify-center overflow-hidden">
                                        {designer.profile?.avatar_url ? (
                                            <img src={designer.profile.avatar_url} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <UserCircle className="w-10 h-10 text-neutral-300" />
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200">
                                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                                        <span className="text-xs font-black text-amber-700">{designer.average_rating || '4.8'}</span>
                                    </div>
                                </div>

                                {/* Clickable name — opens partner profile in new tab */}
                                <Link
                                    href={`/partner/${designer.id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="group/name inline-flex items-start gap-1.5"
                                >
                                    <h3 className="font-black text-neutral-900 text-lg uppercase tracking-tight group-hover/name:text-primary-600 transition-colors leading-tight">
                                        {designer.company_name}
                                    </h3>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 mt-1 text-neutral-400 group-hover/name:text-primary-500 flex-shrink-0 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                </Link>

                                <p className="text-[10px] font-black text-neutral-400 mt-2 uppercase tracking-widest">
                                    {designer.experience_years} {t.yearsExp}
                                </p>
                                <div className="mt-6 pt-4 border-t border-neutral-100 flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-1">{t.startingFrom}</p>
                                        <p className="text-xl font-black text-neutral-900">৳{designer.base_consultation_fee?.toLocaleString() || '5,000'}</p>
                                    </div>
                                    <Button variant={formData.selectedDesignerId === designer.id ? 'default' : 'outline'} className="rounded-xl h-10 px-4 font-black text-[10px] uppercase tracking-widest">
                                        {formData.selectedDesignerId === designer.id ? t.selected : t.bookNow}
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </WizardStep>
            </MainLayout>
        );
    }

    if (step === 13) {
        return (
            <MainLayout>
                {renderScheduleStep(visualStep - 1, totalSteps, nextStep, prevStep)}
            </MainLayout>
        );
    }

    if (step === 14) {
        const selectedDesigner = designers.find(d => d.id === formData.selectedDesignerId);
        const providerName = formData.designerSelectionType === 'Dalankotha' ? t.suggestedOption : (selectedDesigner?.company_name || '-');
        const price = formData.designerOption === 'both' ? 80000 : (formData.designerOption === 'design' ? 50000 : 30000);

        return (
            <MainLayout>
                <WizardStep
                    key={`step14-review-${lang}`}
                    lang={lang}
                    title={t.reviewTitle}
                    description={t.reviewDesc}
                    currentStep={visualStep - 1}
                    totalSteps={totalSteps}
                    onNext={handleSubmit}
                    onBack={prevStep}
                    isLastStep
                    canNext={!loading}
                    nextLabel={loading ? t.generatingReq : t.completeBooking}
                >
                    <div className="max-w-2xl mx-auto">
                        <div className="bg-white rounded-3xl border-2 border-neutral-100 p-8 shadow-xl">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10 pb-8 border-b border-neutral-100">
                                <div>
                                    <h3 className="text-2xl font-black text-neutral-900 mb-1 uppercase tracking-tight">{t.tentativeQuote}</h3>
                                    <p className="text-sm font-bold text-neutral-400">{t.statusWait}</p>
                                </div>
                                <div className="text-left sm:text-right">
                                    <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">{t.startingPrice}</p>
                                    <p className="text-4xl font-black text-primary-600 tracking-tight">৳{price.toLocaleString()}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                                <div className="space-y-6">
                                    <div>
                                        <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2">{t.serviceArea}</p>
                                        <p className="text-sm font-black text-neutral-900 uppercase tracking-tight">
                                            {serviceTypes.map(s => {
                                                if (s === 'structural-architectural') return t.structuralService;
                                                if (s === 'interior') return t.interiorService;
                                                return s;
                                            }).join(" & ")}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2">{t.assignedProvider}</p>
                                        <p className="text-sm font-black text-neutral-900 uppercase tracking-tight">{providerName}</p>
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <div>
                                        <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2">Consultation Schedule</p>
                                        <p className="text-sm font-black text-neutral-900 uppercase tracking-tight">
                                            {formData.preferredDate} at {formData.preferredTime}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </WizardStep>
            </MainLayout>
        );
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
