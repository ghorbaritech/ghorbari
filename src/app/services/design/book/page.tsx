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
import { Ruler, Home, Building2, PaintBucket, BedDouble, Bath, Car, Trees, Waves, Dog, Baby } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

// Service Types
type ServiceType = 'architectural' | 'structural' | 'interior';

// Question Data (to be moved to separate file later if large)
const SERVICE_OPTIONS: Option[] = [
    { id: 'architectural', label: 'Architectural Design', icon: Home, description: 'Floor plans, elevations, and 3D modeling.' },
    { id: 'structural', label: 'Structural Design', icon: Building2, description: 'Safety analysis, foundation, and detailed engineering.' },
    { id: 'interior', label: 'Interior Design', icon: PaintBucket, description: 'Decor, furniture layout, and aesthetic planning.' },
];

const VIBE_OPTIONS: Option[] = [
    { id: 'Modern', label: 'Modern / Minimalist', image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=400&h=400&fit=crop' },
    { id: 'Traditional', label: 'Traditional / Brick', image: 'https://images.unsplash.com/photo-1592595896551-12b371d546d5?w=400&h=400&fit=crop' },
    { id: 'Luxury', label: 'Duplex Luxury', image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=400&fit=crop' },
    { id: 'Eco', label: 'Green / Eco-Friendly', image: 'https://images.unsplash.com/photo-1588880331179-bc9b93a8cb5e?w=400&h=400&fit=crop' },
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

    // Initialize service type from URL if present
    const initialService = searchParams.get('service') as ServiceType | null;
    const [step, setStep] = useState(initialService ? 1 : 0);
    const [serviceType, setServiceType] = useState<ServiceType | null>(initialService);
    const [loading, setLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        // Architectural
        landArea: '',
        orientation: [] as string[],
        floors: '',
        bedrooms: '',
        bathrooms: '',
        maidRoom: false,
        parking: '',
        vibe: '',
        // Structural
        soilTest: null as boolean | null,
        futureFloors: '',
        roofFeatures: [] as string[],
        hasArchPlan: null as boolean | null,
        // Interior
        propertyType: '', // Apartment, Single Room
        sqft: '',
        floorPref: '',
        ceilingPref: '',
        budget: '',
        hasKidsPets: false,
    });

    const updateData = (key: string, value: any) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    const nextStep = () => setStep(prev => prev + 1);
    const prevStep = () => setStep(prev => prev - 1);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const user = (await supabase.auth.getUser()).data.user;

            if (!user) {
                // Redirect to login if not authenticated (should handle this better in real app)
                router.push('/login?redirect=/services/design/book');
                return;
            }

            const { error } = await supabase.from('design_bookings').insert({
                user_id: user.id,
                service_type: serviceType,
                status: 'pending',
                details: formData
            });

            if (error) throw error;

            // Success
            router.push('/dashboard/customer?booking=success');
        } catch (err) {
            console.error(err);
            alert('Failed to submit booking. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // --- Render Logic ---

    // Step 0: Service Selection
    if (step === 0) {
        return (
            <MainLayout>
                <WizardStep
                    title="Start Your Design Journey"
                    description="Select the type of design service you need to get started."
                    currentStep={0}
                    totalSteps={serviceType === 'architectural' ? 3 : 2} // Simplified logic
                    onNext={nextStep}
                    onBack={() => { }}
                    isFirstStep
                    canNext={!!serviceType}
                >
                    <RadioCardGroup
                        options={SERVICE_OPTIONS}
                        selected={serviceType}
                        onChange={(id) => setServiceType(id as ServiceType)}
                    />
                </WizardStep>
            </MainLayout>
        );
    }

    // Architectural Steps
    if (serviceType === 'architectural') {
        if (step === 1) {
            return (
                <MainLayout>
                    <WizardStep
                        title="Plot & Basic Requirements"
                        description="Tell us about your land and basic structure needs."
                        currentStep={1}
                        totalSteps={3}
                        onNext={nextStep}
                        onBack={prevStep}
                        canNext={!!formData.landArea && !!formData.floors}
                    >
                        <div className="space-y-8">
                            {/* Land Area */}
                            <div>
                                <Label className="text-base font-bold mb-3 block">Total Land Area (Katha)</Label>
                                <div className="relative">
                                    <Input
                                        type="number"
                                        placeholder="e.g. 5"
                                        className="pl-10 h-12 text-lg font-bold"
                                        value={formData.landArea}
                                        onChange={(e) => updateData('landArea', e.target.value)}
                                    />
                                    <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 w-5 h-5" />
                                </div>
                            </div>

                            {/* Floors & Parking */}
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <Label className="text-base font-bold mb-3 block">Number of Floors</Label>
                                    <Input
                                        type="number"
                                        placeholder="e.g. 4"
                                        className="h-12"
                                        value={formData.floors}
                                        onChange={(e) => updateData('floors', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <Label className="text-base font-bold mb-3 block">Parking Spots</Label>
                                    <div className="relative">
                                        <Input
                                            type="number"
                                            placeholder="e.g. 1"
                                            className="pl-10 h-12"
                                            value={formData.parking}
                                            onChange={(e) => updateData('parking', e.target.value)}
                                        />
                                        <Car className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 w-5 h-5" />
                                    </div>
                                </div>
                            </div>

                            {/* Orientation */}
                            <div>
                                <Label className="text-base font-bold mb-3 block">Plot Orientation (Facing)</Label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    {['North', 'South', 'East', 'West'].map(dir => (
                                        <div
                                            key={dir}
                                            className={`border rounded-xl p-4 flex items-center gap-3 cursor-pointer transition-all ${formData.orientation.includes(dir) ? 'bg-primary-50 border-primary-600' : 'hover:bg-neutral-50'}`}
                                            onClick={() => {
                                                const current = formData.orientation;
                                                updateData('orientation', current.includes(dir) ? current.filter(d => d !== dir) : [...current, dir]);
                                            }}
                                        >
                                            <Checkbox checked={formData.orientation.includes(dir)} />
                                            <span className="font-bold text-sm">{dir}</span>
                                        </div>
                                    ))}
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
                        title="Style & Features"
                        description="Choose the vibe and internal layout preferences."
                        currentStep={2}
                        totalSteps={3}
                        onNext={handleSubmit}
                        onBack={prevStep}
                        isLastStep
                        canNext={!!formData.vibe}
                    >
                        <div className="space-y-8">
                            {/* Rooms */}
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <Label className="text-base font-bold mb-3 block">Bedrooms (Per Unit)</Label>
                                    <div className="relative">
                                        <Input
                                            type="number"
                                            placeholder="3"
                                            className="pl-10 h-12"
                                            value={formData.bedrooms}
                                            onChange={(e) => updateData('bedrooms', e.target.value)}
                                        />
                                        <BedDouble className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 w-5 h-5" />
                                    </div>
                                </div>
                                <div>
                                    <Label className="text-base font-bold mb-3 block">Bathrooms</Label>
                                    <div className="relative">
                                        <Input
                                            type="number"
                                            placeholder="3"
                                            className="pl-10 h-12"
                                            value={formData.bathrooms}
                                            onChange={(e) => updateData('bathrooms', e.target.value)}
                                        />
                                        <Bath className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 w-5 h-5" />
                                    </div>
                                </div>
                            </div>

                            {/* Maid Room Checkbox */}
                            <div className="flex items-center space-x-2 border p-4 rounded-xl cursor-pointer" onClick={() => updateData('maidRoom', !formData.maidRoom)}>
                                <Checkbox checked={formData.maidRoom} />
                                <label className="text-sm font-bold cursor-pointer">Include Maid's Room / Service Area</label>
                            </div>

                            {/* Vibe Selection */}
                            <div>
                                <Label className="text-base font-bold mb-4 block">Choose Your Vibe</Label>
                                <RadioCardGroup
                                    options={VIBE_OPTIONS}
                                    selected={formData.vibe}
                                    onChange={(id) => updateData('vibe', id)}
                                    columns={4}
                                    showCheck
                                />
                            </div>
                        </div>
                    </WizardStep>
                </MainLayout>
            );
        }
    }

    // Structural Steps
    if (serviceType === 'structural') {
        if (step === 1) {
            return (
                <MainLayout>
                    <WizardStep
                        title="Structural Details"
                        description="Help us understand the engineering requirements."
                        currentStep={1}
                        totalSteps={2}
                        onNext={handleSubmit}
                        onBack={prevStep}
                        isLastStep
                        canNext={!!formData.futureFloors}
                    >
                        <div className="space-y-8">
                            {/* Soil Test */}
                            <div>
                                <Label className="text-base font-bold mb-4 block">Has a Soil Test been conducted?</Label>
                                <div className="grid grid-cols-2 gap-4">
                                    {['Yes', 'No'].map(opt => (
                                        <div
                                            key={opt}
                                            className={`border rounded-xl p-6 text-center cursor-pointer font-bold ${formData.soilTest === (opt === 'Yes') ? 'bg-primary-600 text-white border-primary-600' : 'bg-white hover:bg-neutral-50'}`}
                                            onClick={() => updateData('soilTest', opt === 'Yes')}
                                        >
                                            {opt}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Floors */}
                            <div>
                                <Label className="text-base font-bold mb-3 block">Total Intended Floors (Future)</Label>
                                <Input
                                    type="number"
                                    placeholder="e.g. 6"
                                    className="h-12"
                                    value={formData.futureFloors}
                                    onChange={(e) => updateData('futureFloors', e.target.value)}
                                />
                            </div>

                            {/* Roof Features */}
                            <div>
                                <Label className="text-base font-bold mb-3 block">Rooftop Plans</Label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div
                                        className={`border rounded-xl p-4 flex items-center gap-3 cursor-pointer ${formData.roofFeatures.includes('garden') ? 'bg-primary-50 border-primary-600' : ''}`}
                                        onClick={() => {
                                            const has = formData.roofFeatures.includes('garden');
                                            updateData('roofFeatures', has ? formData.roofFeatures.filter(x => x !== 'garden') : [...formData.roofFeatures, 'garden']);
                                        }}
                                    >
                                        <Checkbox checked={formData.roofFeatures.includes('garden')} />
                                        <Trees className="w-5 h-5 text-green-600" />
                                        <span className="font-bold text-sm">Roof Garden</span>
                                    </div>
                                    <div
                                        className={`border rounded-xl p-4 flex items-center gap-3 cursor-pointer ${formData.roofFeatures.includes('pool') ? 'bg-primary-50 border-primary-600' : ''}`}
                                        onClick={() => {
                                            const has = formData.roofFeatures.includes('pool');
                                            updateData('roofFeatures', has ? formData.roofFeatures.filter(x => x !== 'pool') : [...formData.roofFeatures, 'pool']);
                                        }}
                                    >
                                        <Checkbox checked={formData.roofFeatures.includes('pool')} />
                                        <Waves className="w-5 h-5 text-blue-500" />
                                        <span className="font-bold text-sm">Swimming Pool</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </WizardStep>
                </MainLayout>
            );
        }
    }

    // Interior Steps
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
                            {/* Property Type */}
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

                            {/* Size & Budget */}
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
                            {/* Flooring */}
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

                            {/* Ceiling */}
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

                            {/* Lifestyle */}
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

    // Default Fallback
    return null;
}

function MainLayout({ children }: { children: ReactNode }) {
    return (
        <main className="min-h-screen flex flex-col font-sans bg-neutral-50">
            <Navbar />
            <div className="flex-1 flex flex-col justify-center py-12">
                {children}
            </div>
            <Footer />
        </main>
    );
}
