'use client'

import { useState } from 'react'
import { createPartner, updatePartner } from '@/app/admin/onboarding/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { useEffect, useMemo } from 'react'

import { toast } from 'sonner'
import { Shield, Loader2, UserPlus, FileCheck, Store, User, PencilRuler, Wrench, Package, Send, CheckCircle2 } from 'lucide-react'
import PartnerLegalContractForm from '@/components/forms/PartnerLegalContractForm'
import { createClient } from '@/utils/supabase/client'
import { updateOnboardingStep } from '@/app/admin/onboarding/actions'

const PRODUCT_CATEGORIES = [
    'Cement & Concrete', 'Steel & Metal', 'Tiles & Flooring',
    'Paint & Finishes', 'Electrical & Plumbing', 'Doors & Windows',
    'Sanitary & Fixtures', 'Tools & Equipment'
]

const DESIGN_SPECIALIZATIONS = [
    'Architectural Design', 'Interior Design', 'Structural Engineering',
    'Landscape Design', 'Urban Planning', '3D Visualization'
]

const SERVICE_TYPES = [
    'Construction Work', 'Plumbing Service', 'Electrical Work',
    'Painting Service', 'Carpentry', 'Masonry', 'HVAC Installation'
]

interface PartnerOnboardingFormProps {
    availableCategories?: { id: string, name: string, type?: string, name_bn?: string }[]
    initialData?: any
    userId?: string
    onCancel?: () => void
}

export default function PartnerOnboardingForm({
    availableCategories = [],
    initialData,
    userId,
    onCancel
}: PartnerOnboardingFormProps) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    const [step, setStep] = useState(initialData?.profile?.onboarding_step || 1)
    
    const persistStep = async (newStep: number) => {
        setStep(newStep)
        const effectiveId = userId || initialData?.profile?.id
        if (effectiveId) {
            await updateOnboardingStep(effectiveId, newStep)
        }
    }

    const [isCreating, setIsCreating] = useState(!userId)

    // Role States
    const [isSeller, setIsSeller] = useState(false)
    const [isDesigner, setIsDesigner] = useState(false)
    const [isServiceProvider, setIsServiceProvider] = useState(false)

    // Selection States
    const [selectedCategories, setSelectedCategories] = useState<string[]>([])
    const [selectedSpecializations, setSelectedSpecializations] = useState<string[]>([])
    const [selectedServices, setSelectedServices] = useState<string[]>([])

    // Identity State
    const [nidNumber, setNidNumber] = useState('')
    const [nidFront, setNidFront] = useState<File | null>(null)
    const [nidBack, setNidBack] = useState<File | null>(null)
    const [isOcrProcessing, setIsOcrProcessing] = useState(false)

    // Business State
    const [tradeLicense, setTradeLicense] = useState<File | null>(null)

    // Step 1 form data — captured to prefill Step 4 legal contract
    const [step1Email, setStep1Email] = useState(initialData?.email || initialData?.profile?.email || initialData?.user?.email || '')
    const [step1Phone, setStep1Phone] = useState(initialData?.profile?.phone || '')
    const [step1BusinessName, setStep1BusinessName] = useState(initialData?.businessName || '')
    const [step1PartnerName, setStep1PartnerName] = useState(initialData?.profile?.full_name || initialData?.user?.user_metadata?.full_name || '')
    const [step1Address, setStep1Address] = useState(initialData?.profile?.address || '')

    // Populate from initialData - ONLY depend on initialData
    useEffect(() => {
        if (!initialData) {
            // Reset for new only if we are currently in an 'initialData' state or explicitly resetting
            // But be careful not to trigger a reset loop. Only reset if things are actually set.
            if (isSeller || isDesigner || isServiceProvider) {
                setIsSeller(false)
                setIsDesigner(false)
                setIsServiceProvider(false)
                setSelectedCategories([])
                setSelectedSpecializations([])
                setSelectedServices([])
                setNidNumber('')
                setStep1Email('')
                setStep1Phone('')
                setStep1BusinessName('')
                setStep1PartnerName('')
                setStep1Address('')
                setStep(1)
            }
            return
        }

        // Deep synchronization with guards to prevent redundant updates
        const roles = initialData.roles || {}
        if (isSeller !== !!roles.seller) setIsSeller(!!roles.seller)
        if (isDesigner !== !!roles.designer) setIsDesigner(!!roles.designer)
        if (isServiceProvider !== !!roles.service_provider) setIsServiceProvider(!!roles.service_provider)
        
        const newCats = initialData.seller_data?.primary_categories || []
        if (JSON.stringify(selectedCategories) !== JSON.stringify(newCats)) setSelectedCategories(newCats)
        
        const newSpecs = initialData.designer_data?.specializations || []
        if (JSON.stringify(selectedSpecializations) !== JSON.stringify(newSpecs)) setSelectedSpecializations(newSpecs)
        
        const newServs = initialData.service_data?.service_types || []
        if (JSON.stringify(selectedServices) !== JSON.stringify(newServs)) setSelectedServices(newServs)
        
        const newNid = initialData.profile?.nid_number || ''
        if (nidNumber !== newNid) setNidNumber(newNid)
        
        const newEmail = initialData.email || initialData.profile?.email || initialData.user?.email || ''
        if (step1Email !== newEmail) setStep1Email(newEmail)
        
        const newPhone = initialData.profile?.phone || ''
        if (step1Phone !== newPhone) setStep1Phone(newPhone)
        
        const newBiz = initialData.businessName || ''
        if (step1BusinessName !== newBiz) setStep1BusinessName(newBiz)
        
        const newName = initialData.profile?.full_name || initialData.user?.user_metadata?.full_name || ''
        if (step1PartnerName !== newName) setStep1PartnerName(newName)
        
        const newAddr = initialData.profile?.address || ''
        if (step1Address !== newAddr) setStep1Address(newAddr)

        const newStep = initialData.profile?.onboarding_step || 1
        if (step !== newStep) setStep(newStep)

    }, [initialData]) // Effect only triggers when initialData object reference changes

    // Memoize category filters to stabilize child props
    const designCategories = useMemo(() => availableCategories.filter(c => c.type === 'design'), [availableCategories]);
    const serviceCategories = useMemo(() => availableCategories.filter(c => c.type === 'service'), [availableCategories]);
    const productCategories = useMemo(() => availableCategories.filter(c => !c.type || c.type === 'product'), [availableCategories]);

    // Stabilize fallback specialization arrays
    const fallbackDesignSpecs = useMemo(() => DESIGN_SPECIALIZATIONS.map(n => ({ id: n, name: n })), []);
    const fallbackServices = useMemo(() => SERVICE_TYPES.map(n => ({ id: n, name: n })), []);
    const fallbackProducts = useMemo(() => PRODUCT_CATEGORIES.map(n => ({ id: n, name: n })), []);

    async function uploadToSupabase(file: File, path: string) {
        const supabase = createClient()
        const { data, error } = await supabase.storage
            .from('partner-documents')
            .upload(path, file, { upsert: true })

        if (error) {
            if (error.message?.includes('Bucket not found')) {
                throw new Error('Storage bucket "partner-documents" not found. Please ensure migrations are applied.')
            }
            throw error
        }
        return supabase.storage.from('partner-documents').getPublicUrl(data.path).data.publicUrl
    }

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        setError(null)

        const rawData = Object.fromEntries(formData.entries())
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        
        const effectiveId = userId || user?.id || 'temp-upload'

        try {
            // Upload files first
            let nidFrontUrl = ''
            let nidBackUrl = ''
            let tradeLicenseUrl = ''

            if (nidFront) nidFrontUrl = await uploadToSupabase(nidFront, `${effectiveId}/nid_front_${Date.now()}`)
            if (nidBack) nidBackUrl = await uploadToSupabase(nidBack, `${effectiveId}/nid_back_${Date.now()}`)
            if (tradeLicense) tradeLicenseUrl = await uploadToSupabase(tradeLicense, `${effectiveId}/trade_license_${Date.now()}`)

            // Prepare data payload - MERGE STATE TRACKERS WITH CURRENT STEP FORM DATA
            // This is critical because Step 1 and 2 inputs are no longer in the DOM 
            // when we submit at Step 3, so rawData will miss them.
            const data = {
                ...rawData, // Keeps Step 3 business fields
                businessName: step1BusinessName || rawData.businessName,
                email: step1Email || rawData.email,
                phoneNumber: step1Phone || rawData.phoneNumber,
                fullName: step1PartnerName || rawData.fullName,
                address: step1Address || rawData.address,
                nidNumber: nidNumber,
                nidFrontUrl,
                nidBackUrl,
                tradeLicenseUrl,
                onboardingStep: step,
                roles: {
                    seller: isSeller,
                    designer: isDesigner,
                    service_provider: isServiceProvider
                },
                seller_data: isSeller ? {
                    primaryCategories: selectedCategories,
                    commissionRate: rawData.commissionRate,
                    paymentTerms: rawData.paymentTerms,
                    businessType: rawData.businessType
                } : null,
                designer_data: isDesigner ? {
                    specializations: selectedSpecializations,
                    portfolioUrl: rawData.portfolioUrl,
                    experienceYears: rawData.designExperience
                } : null,
                service_data: isServiceProvider ? {
                    serviceTypes: selectedServices,
                    experienceYears: rawData.serviceExperience
                } : null
            }

            const result = userId
                ? await updatePartner(userId, data)
                : await createPartner(data)

            if (result?.error) {
                console.error("Action error result:", result.error);
                setError(result.error)
                toast.error(result.error)
            } else {
                // Advance to Step 4 (Legal Contract) after saving business details
                persistStep(4)
            }
        } catch (e: any) {
            console.error("Partner Action Caught Error:", e);
            setError(`Failed: ${e.message || JSON.stringify(e)}`)
            toast.error('Processing failed')
        } finally {
            setLoading(false)
        }
    }

    if (initialData?.profile?.onboarding_step >= 5) {
        return (
            <div className="text-center p-12 lg:p-20 space-y-8 bg-neutral-900/50 backdrop-blur-2xl border border-white/5 rounded-[4rem] shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-600/10 blur-3xl rounded-full -mr-10 -mt-10" />
                <div className="w-24 h-24 bg-emerald-600/20 rounded-3xl flex items-center justify-center mx-auto ring-1 px-1 py-1 ring-emerald-500/20 shadow-[0_0_50px_-12px_rgba(16,185,129,0.4)]">
                    <CheckCircle2 className="w-12 h-12 text-emerald-500 shadow-sm" />
                </div>
                <div className="space-y-4">
                    <h2 className="text-4xl lg:text-5xl font-black text-white italic tracking-tighter uppercase leading-none">
                        Profile <br />
                        <span className="text-emerald-500">Verified</span>
                    </h2>
                    <p className="text-neutral-400 max-w-sm mx-auto font-medium text-sm leading-relaxed">
                        This partner profile is active and verified on the Dalankotha platform. All marketplace features are currently accessible.
                    </p>
                </div>
                <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                    <a href="/dashboard" className="w-full sm:w-auto">
                        <Button className="w-full h-14 px-10 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-lg shadow-emerald-900/40 transition-all hover:scale-[1.02] active:scale-[0.98]">
                            Go to Dashboard
                        </Button>
                    </a>
                </div>
            </div>
        )
    }

    if (success || initialData?.profile?.onboarding_step === 4) {
        const isFromSuccess = success || initialData?.profile?.onboarding_step === 4;
        return (
            <div className="text-center p-12 lg:p-20 space-y-8 animate-in zoom-in duration-700 bg-neutral-900/50 backdrop-blur-2xl border border-white/5 rounded-[4rem] shadow-2xl relative overflow-hidden">
                {/* Decorative background glow */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 blur-3xl rounded-full -mr-10 -mt-10" />
                
                <div className="w-24 h-24 bg-blue-600/20 rounded-3xl flex items-center justify-center mx-auto ring-1 px-1 py-1 ring-blue-500/20 shadow-[0_0_50px_-12px_rgba(37,99,235,0.4)]">
                    <Shield className="w-12 h-12 text-blue-500 shadow-sm" />
                </div>
                
                <div className="space-y-4">
                    <h2 className="text-4xl lg:text-5xl font-black text-white italic tracking-tighter uppercase leading-none">
                        Application <br />
                        <span className="text-blue-500">Processing</span>
                    </h2>
                    <p className="text-neutral-400 max-w-sm mx-auto font-medium text-sm leading-relaxed">
                        Your merchant profile is currently in the **Unverified** state and has been submitted to the Dalankotha Verification Team. We'll review your registration and activate your listing within 24-48 hours.
                    </p>
                </div>

                <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                    <a href="/dashboard" className="w-full sm:w-auto">
                        <Button className="w-full h-14 px-10 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-lg shadow-blue-900/40 transition-all hover:scale-[1.02] active:scale-[0.98]">
                            Go to Dashboard
                        </Button>
                    </a>
                </div>

                <div className="pt-6 border-t border-white/5">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-600">Verification ID: {initialData?.profile?.id?.slice(0, 8).toUpperCase() || 'NEW-SUBMISSION'}</p>
                </div>
            </div>
        )
    }

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, side: 'front' | 'back' | 'trade') => {
        const file = e.target.files?.[0]
        if (!file) return

        if (side === 'front') {
            setNidFront(file)
            await triggerOcr(file)
        }
        else if (side === 'back') setNidBack(file)
        else if (side === 'trade') setTradeLicense(file)
    }

    const triggerOcr = async (file: File) => {
        setIsOcrProcessing(true)
        try {
            const formData = new FormData()
            formData.append('front', file)
            
            const res = await fetch('/api/onboarding/ocr', {
                method: 'POST',
                body: formData
            })
            
            const data = await res.json()
            if (data.nidNumber || data.fullName) {
                if (data.nidNumber) setNidNumber(data.nidNumber)
                if (data.fullName) setStep1PartnerName(data.fullName)
                toast.success('Identity data extracted', {
                    description: `NID and Name mapped successfully.`
                })
            }
        } catch (err) {
            console.error('OCR Error:', err)
            toast.error('OCR parsing failed')
        } finally {
            setIsOcrProcessing(false)
        }
    }



    const renderStepIndicator = () => (
        <div className="flex justify-between items-center mb-16 px-6 max-w-4xl mx-auto">
            {[1, 2, 3, 4].map((s) => (
                <div key={s} className="flex flex-col items-center flex-1 relative group">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xs z-10 transition-all duration-700 ${step >= s ? 'bg-blue-600 text-white shadow-[0_0_30px_-5px_rgba(37,99,235,0.5)] scale-110' : 'bg-neutral-900 text-neutral-600 border border-white/5'}`}>
                        {s}
                    </div>
                    {s < 4 && (
                        <div className="h-[1px] w-full absolute top-6 left-1/2 -z-0">
                            <div className={`h-full transition-all duration-1000 ${step > s ? 'bg-blue-600 w-full' : 'bg-neutral-800 w-0'}`} />
                        </div>
                    )}
                    <span className={`text-[9px] mt-4 font-black uppercase tracking-[0.2em] transition-all duration-500 ${step >= s ? 'text-blue-400 opacity-100 translate-y-0' : 'text-neutral-600 opacity-60 translate-y-1'}`}>
                        {s === 1 ? 'Profile' : s === 2 ? 'Identity' : s === 3 ? 'Business' : 'Contract'}
                    </span>
                </div>
            ))}
        </div>
    )

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            {renderStepIndicator()}

            <form onSubmit={(e) => { 
                e.preventDefault(); 
                if (step < 3) persistStep(step + 1); 
                else if (step === 3) handleSubmit(new FormData(e.currentTarget)); 
            }} className="space-y-8">
                {/* STEP 1: BASIC INFO & ROLES */}
                {step === 1 && (
                    <div className="space-y-8">
                        {/* Account & Basic Info */}
                        <Card className="border-neutral-800 bg-neutral-900 shadow-xl rounded-3xl overflow-hidden">
                            <CardHeader className="bg-neutral-800/50 border-b border-neutral-800 flex flex-row items-center justify-between">
                                <CardTitle className="text-sm font-black uppercase tracking-widest text-neutral-400">Account Security & Contact</CardTitle>
                                {isCreating && <span className="text-[9px] font-black uppercase tracking-widest text-blue-400 bg-blue-400/10 px-2 py-1 rounded-md">Self-Service Onboarding</span>}
                            </CardHeader>
                            <CardContent className="space-y-6 pt-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] uppercase font-black tracking-widest text-neutral-500">Business Name</Label>
                                        <Input name="businessName" required defaultValue={initialData?.businessName || ''}
                                            onChange={e => setStep1BusinessName(e.target.value)}
                                            placeholder="BuildMaterials Ltd." className="h-12 bg-neutral-950 border-neutral-800 rounded-xl text-white" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] uppercase font-black tracking-widest text-neutral-500">Business Email (Login)</Label>
                                        <Input name="email" type="email" required disabled={!!userId}
                                            defaultValue={initialData?.user?.email || initialData?.email || ''}
                                            onChange={e => setStep1Email(e.target.value)}
                                            placeholder="partner@dalankotha.com" className="h-12 bg-neutral-950 border-neutral-800 rounded-xl text-white disabled:opacity-50" />
                                    </div>
                                    {!userId && (
                                        <div className="space-y-2">
                                            <Label className="text-[10px] uppercase font-black tracking-widest text-neutral-500">Temporary Password</Label>
                                            <Input name="temporaryPassword" type="text" required placeholder="Set login password" className="h-12 bg-neutral-950 border-neutral-800 rounded-xl text-white" />
                                        </div>
                                    )}
                                    <div className="space-y-2">
                                        <Label className="text-[10px] uppercase font-black tracking-widest text-neutral-500">Phone Number</Label>
                                        <div className="space-y-3">
                                            <Input name="phoneNumber" type="tel" required
                                                defaultValue={initialData?.profile?.phone || ''}
                                                onChange={e => setStep1Phone(e.target.value)}
                                                placeholder="+8801XXXXXXXXX" className="h-12 bg-neutral-950 border-neutral-800 rounded-xl text-white focus:border-blue-500 transition-colors" />
                                            <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-2xl flex items-center justify-between group hover:bg-blue-500/10 transition-all cursor-pointer" onClick={() => window.open('https://t.me/DalankothaBot', '_blank')}>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                                                        <Send className="w-4 h-4 text-blue-500" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-blue-400">Verify with Telegram</p>
                                                        <p className="text-[9px] text-neutral-500 font-medium">Free & Instant Verification</p>
                                                    </div>
                                                </div>
                                                <div className="text-[9px] font-black uppercase text-blue-400/50 group-hover:text-blue-400">Start →</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* STEP 2: IDENTITY VERIFICATION (NID OCR) */}
                {step === 2 && (
                    <div className="space-y-8">
                         <Card className="border-neutral-800 bg-neutral-900 shadow-xl rounded-[2.5rem] overflow-hidden p-8">
                            <div className="flex flex-col md:flex-row gap-12">
                                <div className="flex-1 space-y-6">
                                    <div className="space-y-2">
                                        <h3 className="text-2xl font-black text-white uppercase tracking-tighter italic">Identity <span className="text-blue-500">Verification</span></h3>
                                        <p className="text-sm text-neutral-500 font-medium">Please upload clear photos of your National ID card. Our AI will automatically extract the details.</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="relative group cursor-pointer text-center space-y-3">
                                            <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={(e) => handleFileChange(e, 'front')} />
                                            <div className={`p-6 border-2 border-dashed rounded-3xl transition-all ${nidFront ? 'border-green-500 bg-green-500/5' : 'border-neutral-800 hover:border-blue-500'}`}>
                                                <div className={`w-12 h-12 rounded-2xl mx-auto flex items-center justify-center transition-all ${nidFront ? 'bg-green-600 text-white' : 'bg-neutral-800 text-neutral-500'}`}>
                                                    {nidFront ? <Shield className="w-6 h-6" /> : <UserPlus className="w-6 h-6" />}
                                                </div>
                                                <div className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mt-3">{nidFront ? 'Front Side Uploaded' : 'NID Front Side'}</div>
                                            </div>
                                        </div>
                                        <div className="relative group cursor-pointer text-center space-y-3">
                                            <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={(e) => handleFileChange(e, 'back')} />
                                            <div className={`p-6 border-2 border-dashed rounded-3xl transition-all ${nidBack ? 'border-green-500 bg-green-500/5' : 'border-neutral-800 hover:border-blue-500'}`}>
                                                <div className={`w-12 h-12 rounded-2xl mx-auto flex items-center justify-center transition-all ${nidBack ? 'bg-green-600 text-white' : 'bg-neutral-800 text-neutral-500'}`}>
                                                    {nidBack ? <Shield className="w-6 h-6" /> : <UserPlus className="w-6 h-6" />}
                                                </div>
                                                <div className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mt-3">{nidBack ? 'Back Side Uploaded' : 'NID Back Side'}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="w-full md:w-80 space-y-6">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-[10px] uppercase font-black tracking-widest text-blue-400">OCR Extracted Data</Label>
                                            {isOcrProcessing && <Loader2 className="w-3 h-3 text-blue-500 animate-spin" />}
                                        </div>
                                        <div className="space-y-4 p-6 bg-neutral-950 rounded-3xl border border-neutral-800 font-mono">
                                            <div className="space-y-1">
                                                <span className="text-[9px] text-neutral-600 uppercase font-black">Full Name</span>
                                                <Input value={step1PartnerName} onChange={e => setStep1PartnerName(e.target.value)} className="h-8 bg-transparent border-none text-white text-xs p-0 focus-visible:ring-0" placeholder="e.g. John Doe" />
                                            </div>
                                            <div className="space-y-1">
                                                <span className="text-[9px] text-neutral-600 uppercase font-black">NID Number</span>
                                                <Input value={nidNumber} onChange={e => setNidNumber(e.target.value)} className="h-8 bg-transparent border-none text-white text-xs p-0 focus-visible:ring-0" placeholder="--- --- ---" />
                                            </div>
                                            <div className="space-y-1">
                                                <span className="text-[9px] text-neutral-600 uppercase font-black">Verification Status</span>
                                                <div className={`text-[10px] uppercase font-black ${(nidNumber || step1PartnerName) ? 'text-green-500' : 'text-yellow-500'}`}>
                                                    {isOcrProcessing ? 'Parsing...' : (nidNumber || step1PartnerName) ? 'Auto-Filled' : 'Awaiting Document'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-blue-500/5 rounded-2xl border border-blue-500/10 flex items-start gap-3">
                                        <Shield className="w-4 h-4 text-blue-400 mt-0.5" />
                                        <p className="text-[10px] leading-relaxed text-blue-300/80 font-medium">Your PII is encrypted and stored in private vaults according to Dalankotha security policies.</p>
                                    </div>
                                </div>
                            </div>
                         </Card>
                    </div>
                )}

                {/* STEP 3: BUSINESS DETAILS & TRADE LICENSE */}
                {step === 3 && (
                    <div className="space-y-8">
                        <Card className="border-neutral-800 bg-neutral-900 shadow-xl rounded-[2rem] overflow-hidden">
                            <CardHeader className="bg-neutral-800/50 border-b border-neutral-800 p-8">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-lg font-black uppercase tracking-widest text-white">Business Verification</CardTitle>
                                        <p className="text-xs text-neutral-500 font-medium mt-1">Legal documentation for marketplace compliance.</p>
                                    </div>
                                    <FileCheck className="w-8 h-8 text-blue-500" />
                                </div>
                            </CardHeader>
                            <CardContent className="p-8 space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                    <div className="space-y-6">
                                        <div className="space-y-4">
                                            <Label className="text-[10px] uppercase font-black tracking-widest text-neutral-400">Trade License (PDF/Image)</Label>
                                            <div className="relative group text-center">
                                                <input type="file" accept="image/*,application/pdf" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={(e) => handleFileChange(e, 'trade')} />
                                                <div className={`p-10 border-2 border-dashed rounded-3xl transition-all ${tradeLicense ? 'border-green-500 bg-green-500/5' : 'border-neutral-800 group-hover:border-blue-500'}`}>
                                                    <div className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center transition-all ${tradeLicense ? 'bg-green-600 text-white shadow-lg' : 'bg-neutral-800 text-neutral-500'}`}>
                                                        <FileCheck className="w-8 h-8" />
                                                    </div>
                                                    <div className="mt-4">
                                                        <div className="text-[10px] font-black uppercase tracking-widest text-white">{tradeLicense ? tradeLicense.name : 'Click to Upload'}</div>
                                                        <div className="text-[9px] text-neutral-500 font-medium uppercase mt-1">Max size 5MB • PDF, JPG, PNG</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-6">
                                        <div className="p-6 bg-blue-500/5 rounded-3xl border border-blue-500/10 space-y-4">
                                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">Merchant Policy</h4>
                                            <p className="text-[11px] leading-relaxed text-blue-100/70 font-medium">
                                                All partners must provide a valid Trade License. For individuals without a license, please contact support for Personal Seller certification. 
                                                <br/><br/>
                                                <span className="text-blue-400">Verification usually takes 24-48 business hours.</span>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                         {/* ROLE SPECIFIC SECTIONS */}
                        <div className="space-y-12 animate-in delay-200">
                            {/* Unified Category Selection Grid */}
                            <div className="space-y-12 py-10 border-t border-neutral-800">
                                {isDesigner && renderCategoryGrid(
                                    "Design & Planning",
                                    "ডিজাইন ও পরিকল্পনা",
                                    PencilRuler,
                                    designCategories.length > 0 ? designCategories : fallbackDesignSpecs,
                                    selectedSpecializations,
                                    (name) => {
                                        setSelectedSpecializations(prev => 
                                            prev.includes(name) ? prev.filter(x => x !== name) : [...prev, name]
                                        )
                                    }
                                )}

                                {isServiceProvider && renderCategoryGrid(
                                    "General Services",
                                    "সাধারণ সেবা সমূহ",
                                    Wrench,
                                    serviceCategories.length > 0 ? serviceCategories : fallbackServices,
                                    selectedServices,
                                    (name) => {
                                        setSelectedServices(prev => 
                                            prev.includes(name) ? prev.filter(x => x !== name) : [...prev, name]
                                        )
                                    }
                                )}

                                {isSeller && renderCategoryGrid(
                                    "Materials & Products",
                                    "নির্মাণ সামগ্রী ও পণ্য",
                                    Package,
                                    productCategories.length > 0 ? productCategories : fallbackProducts,
                                    selectedCategories,
                                    (name) => {
                                        setSelectedCategories(prev => 
                                            prev.includes(name) ? prev.filter(x => x !== name) : [...prev, name]
                                        )
                                    }
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 4: LEGAL (Integrated Component) */}
                {step === 4 && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                        <PartnerLegalContractForm prefillData={{
                            partnerName: step1PartnerName,
                            address: step1Address,
                            businessName: step1BusinessName,
                            email: step1Email,
                            phone: step1Phone,
                            nidPassport: nidNumber || initialData?.profile?.nid_number || '',
                            selectedServices: [...selectedSpecializations, ...selectedServices, ...selectedCategories],
                        }} />
                    </div>
                )}

                {error && <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold rounded-2xl">{error}</div>}

                {step < 4 && (
                    <div className="flex justify-between items-center pt-8 border-t border-neutral-900 px-4">
                        <Button variant="ghost" type="button" onClick={() => step > 1 ? persistStep(step - 1) : onCancel()} className="h-12 px-8 rounded-xl font-black uppercase tracking-widest text-[10px] text-neutral-500 hover:text-white">
                            {step === 1 ? 'Cancel Onboarding' : 'Previous Step'}
                        </Button>
                        <Button type="submit" disabled={loading} size="lg" className="h-14 px-12 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-blue-900/20 active:scale-95 transition-all">
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Processing...
                                </div>
                            ) : (
                                'Next Step'
                            )}
                        </Button>
                    </div>
                )}
            </form>
        </div>
    )
}

function renderCategoryGrid(title: string, titleBn: string, icon: any, items: any[], selected: string[], onToggle: (name: string) => void) {
    if (items.length === 0) return null
    const Icon = icon

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <Icon className="w-5 h-5 text-blue-500" />
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white">
                    {title} <span className="text-neutral-500 ml-1">({titleBn})</span>
                </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-3">
                {items.map(cat => (
                    <div 
                        key={cat.id || cat.name} 
                        className={`flex items-center space-x-4 p-5 rounded-2xl border transition-all cursor-pointer group ${selected.includes(cat.name) ? 'bg-blue-600 border-blue-500 text-white shadow-lg' : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-700'}`}
                        onClick={() => onToggle(cat.name)}
                    >
                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors shrink-0 ${selected.includes(cat.name) ? 'bg-white border-white' : 'border-neutral-700 bg-neutral-950'}`}>
                            {selected.includes(cat.name) && <div className="w-3 h-3 bg-blue-600 rounded-sm" />}
                        </div>
                        <div className="flex flex-col">
                            <span className={`text-[11px] font-bold uppercase tracking-wider ${selected.includes(cat.name) ? 'text-white' : 'text-neutral-200'}`}>{cat.name}</span>
                            {cat.name_bn && <span className={`text-[10px] font-medium ${selected.includes(cat.name) ? 'text-blue-100' : 'text-neutral-500'}`}>{cat.name_bn}</span>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

