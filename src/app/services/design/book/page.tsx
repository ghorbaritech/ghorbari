"use client"

import { useState, useEffect, Suspense, ReactNode } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { WizardStep } from '@/components/design/WizardStep';
import { RadioCardGroup, Option } from '@/components/design/WizardFormComponents';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Ruler, Home, Building2, PaintBucket, BedDouble, Bath, Car, Trees, Waves, Dog, Baby, FileText, CheckCircle2, UserCircle, Map as MapIcon, Hash, CheckSquare, Star } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { designTranslations } from '@/utils/designTranslations';
import { useLanguage } from '@/context/LanguageContext';

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
    const lang = language.toLowerCase() as 'en' | 'bn';
    const t = designTranslations[lang];

    const [step, setStep] = useState(initialService ? 1 : 0);
    const [serviceType, setServiceType] = useState<ServiceType | null>(initialService);
    const [loading, setLoading] = useState(false);

    // Eligible designers fetched from DB
    const [designers, setDesigners] = useState<any[]>([]);

    useEffect(() => {
        // Fetch eligible designers
        async function fetchDesigners() {
            // Fetching active designers directly
            const { data } = await supabase.from('designers').select('*, profile:profiles(*)');
            if (data) setDesigners(data);
        }
        fetchDesigners();
    }, []);

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
        bedroomsPerFloor: '',
        bathroomsPerFloor: '',
        specialZones: [] as string[],
        structuralVibe: '',
        soilTest: '',
        roofFeatures: [] as string[],

        designerSelectionType: '' as 'ghorbari' | 'list' | '',
        selectedDesignerId: null as string | null,

        // Interior 
        propertyType: '',
        sqft: '',
        floorPref: '',
        ceilingPref: '',
        budget: '',
        hasKidsPets: false,
    });

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

    const nextStep = () => setStep(prev => prev + 1);
    const prevStep = () => setStep(prev => prev - 1);

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
            if (serviceType === 'structural-architectural') {
                if (formData.designerSelectionType === 'ghorbari') {
                    if (formData.designerOption === 'both') tentativePrice = 80000;
                    else if (formData.designerOption === 'design') tentativePrice = 50000;
                    else tentativePrice = 30000;
                } else {
                    tentativePrice = 60000; // Flat baseline for third-party profiles for now
                }
            } else if (serviceType === 'interior') {
                tentativePrice = 20000;
            }

            const payloadDetails = { ...formData, tentativePrice };

            const { error } = await supabase.from('design_bookings').insert({
                user_id: user.id,
                service_type: serviceType,
                status: 'pending', // Waiting for admin verification
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

    // --- Render Logic ---

    if (step === 0) {
        return (
            <MainLayout>
                <WizardStep
                    key={`step0-${lang}`}
                    lang={lang}
                    title={t.startJourneyTitle}
                    description={t.startJourneyDesc}
                    currentStep={0}
                    totalSteps={serviceType === 'structural-architectural' ? 5 : 2}
                    onNext={nextStep}
                    onBack={() => { }}
                    isFirstStep
                    canNext={!!serviceType}
                >
                    <RadioCardGroup
                        options={[
                            { id: 'structural-architectural', label: t.structuralService, icon: Building2, description: t.structuralServiceDesc },
                            { id: 'interior', label: t.interiorService, icon: PaintBucket, description: t.interiorServiceDesc },
                        ]}
                        selected={serviceType}
                        onChange={(id) => setServiceType(id as ServiceType)}
                    />
                </WizardStep>
            </MainLayout>
        );
    }

    // --- STRUCTURAL & ARCHITECTURAL ---
    if (serviceType === 'structural-architectural') {
        let showsApprovalQ = formData.designerOption === 'approval' || formData.designerOption === 'both';
        let showsDesignQ = formData.designerOption === 'design' || formData.designerOption === 'both';
        let skippableListStep = formData.designerSelectionType === 'ghorbari';

        const getDynamicTotalSteps = () => {
            let total = 8;
            if (!showsDesignQ) total -= 3;
            if (skippableListStep) total -= 1;
            return total;
        };

        let visualStep = step;
        if (!showsDesignQ && step > 2) visualStep -= 3;
        if (skippableListStep && step > 6) visualStep -= 1;

        if (step === 1) {
            return (
                <MainLayout>
                    <WizardStep
                        key={`step1-${lang}`}
                        lang={lang}
                        title={t.findDesignerTitle}
                        description={t.findDesignerDesc}
                        currentStep={visualStep}
                        totalSteps={getDynamicTotalSteps()}
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
                        title={t.docChecklistTitle}
                        description={t.docChecklistDesc}
                        currentStep={visualStep}
                        totalSteps={getDynamicTotalSteps()}
                        onNext={() => {
                            if (showsDesignQ) setStep(3);
                            else setStep(6);
                        }}
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
                        title={t.spaceLayoutTitle}
                        description={t.spaceLayoutDesc}
                        currentStep={visualStep}
                        totalSteps={getDynamicTotalSteps()}
                        onNext={() => setStep(4)}
                        onBack={() => setStep(2)}
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
                                {/* Q4: Bed per req */}
                                <div className="space-y-3">
                                    <Label className="font-bold text-neutral-700">{t.bedsQ}</Label>
                                    <Input type="number" placeholder="e.g. 3" className="h-12 bg-neutral-50/50 border-neutral-200" value={formData.bedroomsPerFloor} onChange={(e) => updateData('bedroomsPerFloor', e.target.value)} />
                                </div>
                                {/* Q5: Bath per req */}
                                <div className="space-y-3">
                                    <Label className="font-bold text-neutral-700">{t.bathsQ}</Label>
                                    <Input type="number" placeholder="e.g. 2" className="h-12 bg-neutral-50/50 border-neutral-200" value={formData.bathroomsPerFloor} onChange={(e) => updateData('bathroomsPerFloor', e.target.value)} />
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
                        title={t.plotFeaturesTitle}
                        description={t.plotFeaturesDesc}
                        currentStep={visualStep}
                        totalSteps={getDynamicTotalSteps()}
                        onNext={() => setStep(5)}
                        onBack={() => setStep(3)}
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
                        title={t.aestheticsTitle}
                        description={t.aestheticsDesc}
                        currentStep={visualStep}
                        totalSteps={getDynamicTotalSteps()}
                        onNext={() => setStep(6)}
                        onBack={() => setStep(4)}
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
                        title={t.chooseRouteTitle}
                        description={t.chooseRouteDesc}
                        currentStep={visualStep}
                        totalSteps={getDynamicTotalSteps()}
                        onNext={() => {
                            if (formData.designerSelectionType === 'ghorbari') setStep(8);
                            else setStep(7);
                        }}
                        onBack={() => {
                            if (showsDesignQ) setStep(5);
                            else setStep(2);
                        }}
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
                        title={t.selectDesignerTitle}
                        description={t.selectDesignerDesc}
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
                                                            <span key={tag} className="bg-white text-neutral-900 text-[10px] font-black px-3 py-1.5 rounded-md uppercase tracking-wide shadow-sm">
                                                                {tag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="p-6 flex flex-col flex-grow">
                                                    <div className="flex justify-between items-start mb-2 gap-3">
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 mb-1.5">
                                                                <div className="w-5 h-5 rounded-full bg-neutral-200 overflow-hidden relative shrink-0">
                                                                    {designer.profile?.avatar_url ? (
                                                                        <img src={designer.profile.avatar_url} alt={designer.profile.full_name} className="object-cover w-full h-full" />
                                                                    ) : (
                                                                        <UserCircle className="w-3 h-3 text-neutral-400 absolute inset-0 m-auto" />
                                                                    )}
                                                                </div>
                                                                <h3 className="text-[16px] md:text-lg font-black text-neutral-900 uppercase tracking-tight truncate">
                                                                    {designer.company_name || designer.contact_person_name}
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

        if (step === 8) {
            let price = 0;
            if (formData.designerOption === 'both') price = 80000;
            else if (formData.designerOption === 'design') price = 50000;
            else price = 30000;

            const selectedDesigner = designers.find((d: any) => d.id === formData.selectedDesignerId);
            const providerName = formData.designerSelectionType === 'ghorbari' ? 'Ghorbari Assigned Expert' : (selectedDesigner?.company_name || selectedDesigner?.contact_person_name || 'Selected Designer');

            return (
                <MainLayout>
                    <WizardStep
                        key={`step8-${lang}`}
                        lang={lang}
                        title={t.reviewTitle}
                        description={t.reviewDesc}
                        currentStep={visualStep}
                        totalSteps={getDynamicTotalSteps()}
                        onNext={handleSubmit}
                        onBack={() => {
                            if (formData.designerSelectionType === 'ghorbari') setStep(6);
                            else setStep(7);
                        }}
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
                                            {formData.designerOption === 'both' ? 'Both' : formData.designerOption}
                                        </span>
                                    </div>

                                    <div className="flex justify-between items-center py-5 border-b border-neutral-200/70">
                                        <span className="text-[16px] font-bold text-neutral-700">{t.assignedProvider}</span>
                                        <span className="text-[16px] font-black text-neutral-900">{providerName}</span>
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

                                {/* Design Requirements Block */}
                                {showsDesignQ && (
                                    <div className="pt-6 border-t border-neutral-200/70 mt-6">
                                        <h4 className="text-[13px] font-black text-neutral-400 uppercase tracking-widest mb-4">{t.projectReqs}</h4>
                                        <div className="grid grid-cols-2 gap-y-5 gap-x-6">
                                            <div>
                                                <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-wide">{t.landArea}</p>
                                                <p className="text-[14px] font-black text-neutral-900 mt-0.5">{formData.landAreaKatha || '-'} {t.katha}</p>
                                            </div>
                                            <div>
                                                <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-wide">{t.initialFloors}</p>
                                                <p className="text-[14px] font-black text-neutral-900 mt-0.5">{formData.initialFloors || '-'}</p>
                                            </div>
                                            <div>
                                                <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-wide">{t.layoutPerFloor}</p>
                                                <p className="text-[14px] font-black text-neutral-900 mt-0.5">
                                                    {formData.bedroomsPerFloor || '-'} {t.bed}, {formData.bathroomsPerFloor || '-'} {t.bath}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-wide">{t.soilTest}</p>
                                                <p className="text-[14px] font-black text-neutral-900 mt-0.5">{t[(formData.soilTest || '') as keyof typeof t] || formData.soilTest || '-'}</p>
                                            </div>
                                            {(formData.plotOrientation.length > 0 || formData.specialZones.length > 0 || formData.roofFeatures.length > 0) && (
                                                <div className="col-span-2">
                                                    <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-wide">{t.featuresZones}</p>
                                                    <div className="flex flex-wrap gap-2 mt-1.5">
                                                        {[...formData.plotOrientation, ...formData.specialZones, ...formData.roofFeatures].map(tag => (
                                                            <span key={tag} className="px-3 py-1 bg-neutral-100 text-neutral-700 rounded-md font-bold text-[11px] uppercase tracking-wide">
                                                                {t[tag as keyof typeof t] || tag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
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
    if (serviceType === 'interior') {
        if (step === 1) {
            return (
                <MainLayout>
                    <WizardStep
                        title="Space & Budget"
                        description="Define the scope of your interior design project."
                        currentStep={1}
                        totalSteps={2}
                        onNext={nextStep}
                        onBack={prevStep}
                        canNext={!!formData.propertyType && !!formData.sqft}
                    >
                        <div className="space-y-8">
                            <div>
                                <Label className="text-base font-bold mb-4 block">What are we designing?</Label>
                                <RadioCardGroup
                                    options={[
                                        { id: 'Full Apartment', label: 'Full Apartment', icon: Home },
                                        { id: 'Single Room', label: 'Single Room', icon: BedDouble },
                                        { id: 'Office', label: 'Office Space', icon: Building2 },
                                    ]}
                                    selected={formData.propertyType}
                                    onChange={(id) => updateData('propertyType', id)}
                                    columns={3}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <Label className="text-base font-bold mb-3 block">Size (Sq. Ft)</Label>
                                    <Input
                                        type="number"
                                        placeholder="e.g. 1200"
                                        className="h-12"
                                        value={formData.sqft}
                                        onChange={(e) => updateData('sqft', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <Label className="text-base font-bold mb-3 block">Est. Budget (Lakh)</Label>
                                    <Input
                                        type="number"
                                        placeholder="e.g. 15"
                                        className="h-12"
                                        value={formData.budget}
                                        onChange={(e) => updateData('budget', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </WizardStep>
                </MainLayout>
            );
        }

        if (step === 2) {
            return (
                <MainLayout>
                    <WizardStep
                        title="Style & Materials"
                        description="Preferences for finishes and lifestyle needs."
                        currentStep={2}
                        totalSteps={2}
                        onNext={handleSubmit}
                        onBack={prevStep}
                        isLastStep
                        canNext={!!formData.floorPref}
                    >
                        <div className="space-y-8">
                            <div>
                                <Label className="text-base font-bold mb-4 block">Floor Preference</Label>
                                <RadioCardGroup
                                    options={[
                                        { id: 'Local Tiles', label: 'Local Tiles' },
                                        { id: 'Imported Tiles', label: 'Imported Tiles' },
                                        { id: 'Marble', label: 'Marble' },
                                        { id: 'Wooden', label: 'Wooden Laminate' },
                                    ]}
                                    selected={formData.floorPref}
                                    onChange={(id) => updateData('floorPref', id)}
                                    columns={2}
                                    showCheck
                                />
                            </div>

                            <div>
                                <Label className="text-base font-bold mb-4 block">Ceiling Work</Label>
                                <RadioCardGroup
                                    options={[
                                        { id: 'Paint', label: 'Simple Paint' },
                                        { id: 'Gypsum', label: 'Gypsum False Ceiling' },
                                        { id: 'Wooden', label: 'Wooden Features' },
                                    ]}
                                    selected={formData.ceilingPref}
                                    onChange={(id) => updateData('ceilingPref', id)}
                                    columns={3}
                                    showCheck
                                />
                            </div>

                            <div className="flex items-center space-x-2 border p-6 rounded-xl cursor-pointer bg-neutral-50" onClick={() => updateData('hasKidsPets', !formData.hasKidsPets)}>
                                <Checkbox checked={formData.hasKidsPets} />
                                <div className="flex items-center gap-2">
                                    <span className="font-bold cursor-pointer">Do you have kids or pets?</span>
                                    <Baby className="w-5 h-5 text-neutral-400" />
                                    <Dog className="w-5 h-5 text-neutral-400" />
                                </div>
                            </div>
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
