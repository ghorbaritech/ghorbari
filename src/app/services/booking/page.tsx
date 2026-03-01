"use client"

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useServiceCart } from "@/context/ServiceCartContext";
import { useLanguage } from "@/context/LanguageContext";
import { useState, useEffect } from "react";
import { CheckCircle2, UserCheck, Loader2, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";
import { placeServiceRequest } from "./actions";
import { designTranslations } from "@/utils/designTranslations";
import { Label } from "@/components/ui/label";
import { RadioCardGroup } from "@/components/design/WizardFormComponents";
import { WizardStep } from "@/components/design/WizardStep";

// Custom Scheduler with Date Picker and 3-Column Time Slots
function ServiceScheduler({ value, onChange }: { value: any, onChange: (v: any) => void }) {
    const slots = [
        "09:00 AM", "10:00 AM", "11:00 AM",
        "12:00 PM", "01:00 PM", "02:00 PM",
        "03:00 PM", "04:00 PM", "05:00 PM",
        "06:00 PM", "07:00 PM", "08:00 PM",
        "09:00 PM", "10:00 PM", "11:00 PM"
    ];

    return (
        <div className="space-y-8">
            <div className="space-y-3">
                <label className="text-sm font-semibold text-neutral-700 block">Preferred Date</label>
                <Input
                    type="date"
                    className="h-12 px-5 rounded-xl bg-neutral-50 border-neutral-200 font-medium text-base"
                    value={value.date ? new Date(value.date).toLocaleDateString('en-CA') : ''}
                    onChange={(e) => {
                        if (e.target.value) {
                            const [y, m, d] = e.target.value.split('-').map(Number);
                            onChange({ ...value, date: new Date(y, m - 1, d).toISOString() });
                        }
                    }}
                    min={new Date().toLocaleDateString('en-CA')}
                />
            </div>

            <div className="space-y-3">
                <label className="text-sm font-semibold text-neutral-700 block">Preferred Time Slot</label>
                <div className="grid grid-cols-3 gap-3">
                    {slots.map((slot) => {
                        const isSelected = value.slot === slot;
                        return (
                            <button
                                key={slot}
                                onClick={() => onChange({ ...value, slot })}
                                className={`h-12 rounded-xl border font-medium text-sm transition-all ${isSelected
                                    ? 'bg-primary-600 border-primary-600 text-white shadow-sm'
                                    : 'bg-white border-neutral-200 text-neutral-700 hover:border-primary-300'
                                    }`}
                            >
                                {slot}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default function BookingWizardPage() {
    const { items, totalAmount, clearCart } = useServiceCart();
    const { t, language } = useLanguage();
    const lang = (language?.toLowerCase() || 'en') as 'en' | 'bn';
    const dt = designTranslations[lang] || designTranslations.en;

    const [step, setStep] = useState(0); // 0-indexed to match WizardStep
    const [assignmentType, setAssignmentType] = useState<'ghorbari_assign' | 'user_choose'>('ghorbari_assign');
    const [selectedProvider, setSelectedProvider] = useState<any>(null);
    const [schedule, setSchedule] = useState({ date: '', slot: '' });
    const [providers, setProviders] = useState<any[]>([]);
    const [requestNumber, setRequestNumber] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const [formData, setFormData] = useState({
        landAreaKatha: '', initialFloors: '', unitsPerFloor: '',
        bedroomsPerUnit: '', bathroomsPerUnit: '', kitchenPerUnit: '', balconyPerUnit: '',
        propertyType: '', aptSize: '', aptRooms: '',
        specificAreaType: '', roomSize: '', specificInstruction: '',
    });

    const updateFormData = (key: string, value: any) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    const getJourneyType = () => {
        let hasInterior = false;
        let hasStructural = false;
        items.forEach(item => {
            const catName = (item.category?.name || '').toLowerCase();
            const rootName = ((item.category as any)?.parent?.name || '').toLowerCase();
            if (catName.includes('interior') || catName.includes('paint') || catName.includes('carpentry') ||
                rootName.includes('interior') || rootName.includes('paint') || rootName.includes('carpentry')) {
                hasInterior = true;
            }
            if (catName.includes('structural') || catName.includes('construction') || catName.includes('architecture') ||
                rootName.includes('structural') || rootName.includes('construction') || rootName.includes('architecture')) {
                hasStructural = true;
            }
        });
        if (hasInterior && hasStructural) return 'both';
        if (hasInterior) return 'interior';
        if (hasStructural) return 'structural';
        return 'general';
    };

    const journeyType = getJourneyType();

    // Steps: 0=Assignment, 1=Provider (optional), 2=Schedule, 3=Details (optional), 4=Review
    // For 0-indexed WizardStep, figure out dynamic steps:
    const steps = (() => {
        const s = [
            { label: "Assign", title: "Choose Provider Route", description: "How would you like to proceed with your service?" },
        ];
        if (assignmentType === 'user_choose') {
            s.push({ label: "Select", title: "Select a Provider", description: "Choose from our verified experts" });
        }
        s.push({ label: "Schedule", title: "Schedule a Consultation", description: "When should we contact you?" });
        if (journeyType !== 'general') {
            s.push({ label: "Details", title: journeyType === 'interior' ? "Interior Details" : (journeyType === 'structural' ? "Structural Details" : "Project Details"), description: "Tell us more about your space" });
        }
        s.push({ label: "Review", title: "Review & Confirm", description: "Please review your details before submitting" });
        return s;
    })();

    const totalSteps = steps.length;
    const currentStepData = steps[step] || steps[steps.length - 1];

    const isSuccess = step >= totalSteps;

    useEffect(() => {
        if (items.length === 0 && !isSuccess) {
            router.push('/services');
        }
    }, [items, router, isSuccess]);

    useEffect(() => {
        if (assignmentType === 'user_choose' && providers.length === 0) {
            setLoading(true);
            const supabase = createClient();
            const reqServices = items.map(i => i.category?.name).filter(Boolean) as string[];

            let query = supabase.from('service_providers')
                .select('*, profile:profiles(avatar_url)')
                .eq('is_verified', true);

            if (reqServices.length > 0) {
                query = query.overlaps('active_service_types', reqServices);
            }

            query.limit(10).then(({ data }) => {
                setProviders(data || []);
                setLoading(false);
            });
        }
    }, [assignmentType, providers.length, items]);

    const handleNext = async () => {
        const currentTitle = currentStepData?.title || '';
        if (currentTitle.includes("Route")) {
            // Assignment step — no validation needed
        } else if (currentTitle.includes("Provider")) {
            if (!selectedProvider) {
                toast.error("Please select a provider or switch to Ghorbari Assign");
                return;
            }
        } else if (currentTitle.includes("Schedule")) {
            if (!schedule.date || !schedule.slot) {
                toast.error("Please select a preferred schedule");
                return;
            }
        } else if (currentTitle.includes("Confirm")) {
            // Final step — submit
            setLoading(true);
            try {
                const res = await placeServiceRequest({
                    items, assignmentType, providerId: selectedProvider?.id,
                    schedule, totalAmount, requirements: formData
                });
                if (res.error) {
                    toast.error(res.error);
                    setLoading(false);
                    return;
                }
                setRequestNumber(res.requestNumber || "");
                clearCart();
                toast.success("Service request placed successfully!");
                setStep(totalSteps); // success screen
            } catch {
                toast.error("An unexpected error occurred");
            } finally {
                setLoading(false);
            }
            return;
        }
        setStep(s => s + 1);
    };

    const handleBack = () => {
        if (step === 0) return;
        setStep(s => s - 1);
    };

    if (isSuccess) {
        return (
            <main className="min-h-screen bg-neutral-50 flex flex-col">
                <Navbar />
                <div className="flex-1 container mx-auto px-4 py-20 flex items-center justify-center">
                    <div className="max-w-md text-center space-y-8">
                        <div className="relative inline-block">
                            <div className="absolute inset-0 bg-green-500/20 blur-3xl rounded-full scale-150 animate-pulse" />
                            <div className="relative w-24 h-24 rounded-2xl bg-white border border-green-100 flex items-center justify-center mx-auto shadow-sm">
                                <CheckCircle2 className="w-12 h-12 text-green-500" />
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div className="inline-block px-4 py-1.5 bg-green-50 rounded-full border border-green-100">
                                <span className="text-xs font-semibold text-green-700">Booking Confirmed</span>
                            </div>
                            <h1 className="text-2xl font-bold text-neutral-900">Request Placed!</h1>
                            <div className="p-5 bg-white rounded-2xl border border-neutral-200 shadow-sm">
                                <p className="text-xs font-medium text-neutral-400 uppercase tracking-widest mb-1">Your Request Number</p>
                                <p className="text-lg font-bold text-neutral-900 font-mono">{requestNumber || "SRV-PENDING"}</p>
                            </div>
                            <p className="text-neutral-500 font-medium">Your service booking is under admin verification. We will notify you once approved.</p>
                        </div>
                        <div className="flex flex-col sm:flex-row justify-center gap-3">
                            <Link href="/services">
                                <Button variant="outline" className="rounded-xl px-8 h-11 font-medium border-neutral-200">
                                    More Services
                                </Button>
                            </Link>
                            <Link href="/customer/profile">
                                <Button className="rounded-xl px-8 h-11 font-medium bg-neutral-900 text-white">
                                    Track Progress
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
                <Footer />
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-neutral-50 flex flex-col">
            <Navbar />
            <div className="flex-1 flex items-start justify-center py-8">
                <WizardStep
                    title={currentStepData.title}
                    description={currentStepData.description}
                    currentStep={step}
                    totalSteps={totalSteps}
                    onNext={handleNext}
                    onBack={handleBack}
                    isFirstStep={step === 0}
                    isLastStep={step === totalSteps - 1}
                    canNext={!loading}
                    nextLabel={step === totalSteps - 1 ? (loading ? "Submitting..." : "Complete Booking") : undefined}
                    lang={lang}
                >
                    {/* Step 0: Assignment Type */}
                    {currentStepData.title.includes("Route") && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <Card
                                className={`cursor-pointer transition-all rounded-2xl overflow-hidden border-2 ${assignmentType === 'ghorbari_assign' ? 'border-primary-600 bg-white ring-4 ring-primary-50' : 'border-neutral-200 hover:border-primary-200'}`}
                                onClick={() => setAssignmentType('ghorbari_assign')}
                            >
                                <CardContent className="p-6 space-y-4 text-center">
                                    <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mx-auto">
                                        <ShieldCheck className="w-6 h-6 text-neutral-500" />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-base font-bold text-neutral-900">Suggested by Ghorbari</h3>
                                        <p className="text-sm text-neutral-500">We will assign the best verified expert for your needs automatically.</p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card
                                className={`cursor-pointer transition-all rounded-2xl overflow-hidden border-2 ${assignmentType === 'user_choose' ? 'border-primary-600 bg-white ring-4 ring-primary-50' : 'border-neutral-200 hover:border-primary-200'}`}
                                onClick={() => setAssignmentType('user_choose')}
                            >
                                <CardContent className="p-6 space-y-4 text-center">
                                    <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mx-auto">
                                        <UserCheck className="w-6 h-6 text-neutral-500" />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-base font-bold text-neutral-900">Choose from Profiles</h3>
                                        <p className="text-sm text-neutral-500">Browse eligible service provider profiles and select one yourself.</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Step: Provider Selection */}
                    {currentStepData.title.includes("Provider") && (
                        <div className="space-y-4">
                            {loading ? (
                                <div className="py-16 flex flex-col items-center gap-4">
                                    <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
                                    <p className="text-sm text-neutral-500 font-medium">Fetching experts...</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {providers.map(p => (
                                        <Card
                                            key={p.id}
                                            className={`cursor-pointer transition-all rounded-2xl border ${selectedProvider?.id === p.id ? 'border-primary-600 bg-primary-50' : 'border-neutral-200 hover:border-primary-200'}`}
                                            onClick={() => setSelectedProvider(p)}
                                        >
                                            <CardContent className="p-4 flex items-center gap-4">
                                                <div className="w-11 h-11 rounded-xl bg-neutral-100 overflow-hidden flex-shrink-0">
                                                    <img src={p.profile?.avatar_url || `https://ui-avatars.com/api/?name=${p.business_name}`} alt={p.business_name} className="w-full h-full object-cover" />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-sm text-neutral-900">{p.business_name}</h4>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-[9px] font-bold uppercase bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded">Top Rated</span>
                                                        <span className="text-xs text-neutral-400">★ 4.9 (120+ reviews)</span>
                                                    </div>
                                                </div>
                                                {selectedProvider?.id === p.id && <CheckCircle2 className="w-5 h-5 text-primary-600 flex-shrink-0" />}
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                            <Button variant="ghost" onClick={() => { setAssignmentType('ghorbari_assign'); setStep(0); }} className="text-xs text-primary-600 font-medium underline underline-offset-4 hover:no-underline">
                                Switch to Ghorbari Assign instead
                            </Button>
                        </div>
                    )}

                    {/* Step: Schedule */}
                    {currentStepData.title.includes("Schedule") && (
                        <ServiceScheduler value={schedule} onChange={setSchedule} />
                    )}

                    {/* Step: Details */}
                    {(currentStepData.title.includes("Interior") || currentStepData.title.includes("Structural") || currentStepData.title.includes("Project Details")) && (
                        <div className="space-y-6">
                            {(journeyType === 'interior' || journeyType === 'both') && (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">{dt.propertyType}</Label>
                                        <RadioCardGroup
                                            options={[
                                                { id: 'Full Building', label: dt.fullBuilding },
                                                { id: 'Full Apartment', label: dt.fullApt },
                                                { id: 'Specific Area', label: dt.specificArea }
                                            ]}
                                            selected={formData.propertyType}
                                            onChange={(v: string) => updateFormData('propertyType', v)}
                                            columns={3}
                                        />
                                    </div>
                                    {formData.propertyType === 'Full Apartment' && (
                                        <div className="grid grid-cols-2 gap-4 animate-in fade-in duration-300">
                                            <div className="space-y-2">
                                                <Label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">{dt.aptSize}</Label>
                                                <Input type="number" placeholder="e.g. 1200" value={formData.aptSize} onChange={(e) => updateFormData('aptSize', e.target.value)} className="h-11 rounded-xl bg-neutral-50 border-neutral-200" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">{dt.noOfRoom}</Label>
                                                <Input type="number" placeholder="e.g. 3" value={formData.aptRooms} onChange={(e) => updateFormData('aptRooms', e.target.value)} className="h-11 rounded-xl bg-neutral-50 border-neutral-200" />
                                            </div>
                                        </div>
                                    )}
                                    {formData.propertyType === 'Specific Area' && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-300">
                                            <div className="space-y-2">
                                                <Label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Area Type</Label>
                                                <RadioCardGroup
                                                    options={[
                                                        { id: 'Living Room', label: dt.livingRoom },
                                                        { id: 'Bed Room', label: dt.bedRoom },
                                                        { id: 'Kitchen', label: dt.kitchen },
                                                        { id: 'Bath Room', label: dt.bathRoom }
                                                    ]}
                                                    selected={formData.specificAreaType}
                                                    onChange={(v: string) => updateFormData('specificAreaType', v)}
                                                    columns={2}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">{dt.roomSize}</Label>
                                                <Input type="number" placeholder="e.g. 150" value={formData.roomSize} onChange={(e) => updateFormData('roomSize', e.target.value)} className="h-11 rounded-xl bg-neutral-50 border-neutral-200" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                            {(journeyType === 'structural' || journeyType === 'both') && (
                                <div className={`space-y-4 ${journeyType === 'both' ? 'pt-6 border-t border-neutral-100' : ''}`}>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">{dt.landAreaQ}</Label>
                                            <Input type="number" placeholder="e.g. 3.5" value={formData.landAreaKatha} onChange={(e) => updateFormData('landAreaKatha', e.target.value)} className="h-11 rounded-xl bg-neutral-50 border-neutral-200" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">{dt.floorsQ}</Label>
                                            <Input type="number" placeholder="e.g. 6" value={formData.initialFloors} onChange={(e) => updateFormData('initialFloors', e.target.value)} className="h-11 rounded-xl bg-neutral-50 border-neutral-200" />
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">{dt.anyInstruction}</Label>
                                <textarea
                                    placeholder="Tell us any more details..."
                                    value={formData.specificInstruction}
                                    onChange={(e) => updateFormData('specificInstruction', e.target.value)}
                                    className="w-full h-28 p-3 rounded-xl bg-neutral-50 border border-neutral-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-100"
                                />
                            </div>
                        </div>
                    )}

                    {/* Step: Review */}
                    {currentStepData.title.includes("Confirm") && (
                        <div className="space-y-6">
                            <div className="bg-neutral-50 rounded-2xl border border-neutral-200 p-5 space-y-5">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-xs font-medium text-neutral-400 uppercase tracking-wider mb-1">Services</p>
                                        <div className="space-y-1">
                                            {items.map(item => (
                                                <div key={item.id} className="text-sm font-semibold flex justify-between gap-4">
                                                    <span>{language === 'BN' ? item.name_bn : item.name}</span>
                                                    <span className="text-neutral-500">৳{item.unit_price.toLocaleString()}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-medium text-neutral-400 uppercase tracking-wider mb-1">Estimate</p>
                                        <p className="text-2xl font-bold text-neutral-900">৳{totalAmount.toLocaleString()}</p>
                                    </div>
                                </div>
                                <div className="border-t border-neutral-200 pt-4 grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs font-medium text-neutral-400 uppercase tracking-wider mb-1">Provider</p>
                                        <p className="text-sm font-semibold text-neutral-900">
                                            {assignmentType === 'ghorbari_assign' ? 'Ghorbari Assigned Expert' : (selectedProvider?.business_name || 'Not Selected')}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-neutral-400 uppercase tracking-wider mb-1">Schedule</p>
                                        <p className="text-sm font-semibold text-neutral-900">
                                            {schedule.date ? new Date(schedule.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' }) : '–'} | {schedule.slot || '–'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100 text-xs text-yellow-800 leading-relaxed">
                                <strong>Note:</strong> Final cost may vary based on actual measurements and scope defined during site visit. No upfront payment required.
                            </div>
                        </div>
                    )}
                </WizardStep>
            </div>
            <Footer />
        </main>
    );
}
