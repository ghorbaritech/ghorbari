'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { Textarea } from '@/components/ui/textarea'
import SignaturePad from '@/components/legal/SignaturePad'
import { createContract } from '@/app/admin/legal/actions'
import { toast } from 'sonner'
import { FileCheck, ChevronRight, ChevronLeft, Award, Landmark, Scale, PencilRuler, Wrench, Package, Loader2, Upload, MousePointer2, Check } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'

interface DBCategory {
    id: string;
    name: string;
    name_bn: string | null;
    type: "design" | "service" | "product";
}

interface PrefillData {
    partnerName?: string
    nidPassport?: string
    phone?: string
    email?: string
    address?: string
    businessName?: string
    selectedServices?: string[]
}

interface PartnerLegalContractFormProps {
    prefillData?: PrefillData
}

export default function PartnerLegalContractForm({ prefillData = {} }: PartnerLegalContractFormProps) {
    const router = useRouter()
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [fetchingData, setFetchingData] = useState(true)
    const [categories, setCategories] = useState<DBCategory[]>([])
    const [signature, setSignatureState] = useState('')
    const setSignature = useCallback((val: string) => setSignatureState(val), [])
    const [signatureMode, setSignatureMode] = useState<'draw' | 'upload'>('draw')
    const [formData, setFormData] = useState({
        partnerName: prefillData.partnerName || '',
        nidPassport: prefillData.nidPassport || '',
        phone: prefillData.phone || '',
        email: prefillData.email || '',
        address: prefillData.address || '',
        businessName: prefillData.businessName || '',
        tradeLicense: '',
        tinNumber: '',
        selectedServices: prefillData.selectedServices || [] as string[],
        bankAccount: '',
        bankName: '',
        branchName: '',
        mobilePayment: prefillData.phone || '',
        witnessName: '',
    })

    const totalSteps = 4
    const supabase = createClient()

    useEffect(() => {
        async function fetchInitialData() {
            try {
                // 1. Fetch categories
                const { data, error } = await supabase
                    .from('product_categories')
                    .select('id, name, name_bn, type')
                    .eq('level', 0)
                    .order('name')
                
                if (error) throw error
                if (data) setCategories(data as DBCategory[])

                // 2. Fetch User Profile + Partner record for autofill
                // Props from previous steps take priority over DB values
                const { data: { user } } = await supabase.auth.getUser()
                if (user) {
                    const [{ data: profile }, { data: partner }] = await Promise.all([
                        supabase
                            .from('profiles')
                            .select('full_name, phone, nid_number, email, address')
                            .eq('id', user.id)
                            .single(),
                        supabase
                            .from('partners')
                            .select('business_name, phone')
                            .eq('user_id', user.id)
                            .maybeSingle(),
                    ])

                    setFormData(prev => {
                        const resolvedServices = (prefillData.selectedServices || []).map(svc => {
                            const cat = (data || []).find(c => c.id === svc);
                            return cat ? cat.name : svc;
                        });

                        return {
                            ...prev,
                            // DB profile only fills gaps — prefillData (from Steps 1-3) wins
                            partnerName:  prev.partnerName  || profile?.full_name   || '',
                            nidPassport:  prev.nidPassport  || profile?.nid_number  || '',
                            phone:        prev.phone        || partner?.phone       || profile?.phone || user.phone || '',
                            email:        prev.email        || profile?.email       || user.email    || '',
                            address:      prev.address      || (profile as any)?.address || '',
                            businessName: prev.businessName || partner?.business_name || '',
                            mobilePayment: prev.mobilePayment || partner?.phone || profile?.phone || user.phone || '',
                            selectedServices: resolvedServices
                        };
                    })
                }
            } catch (err) {
                console.error("Failed to fetch initial data:", err)
                toast.error("Failed to load available services.")
            } finally {
                setFetchingData(false)
            }
        }
        fetchInitialData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const updateField = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const nextStep = () => setStep(s => Math.min(s + 1, totalSteps))
    const prevStep = () => setStep(s => Math.max(s - 1, 1))

    const handleSubmit = async () => {
        if (!signature) {
            toast.error("Signature is required to finalize the contract.")
            return
        }

        setLoading(true)
        try {
            const result = await createContract({
                ...formData,
                signatureData: signature
            })
            if (result.success) {
                toast.success("Contract successfully generated and signed!")
                setStep(5) // Success state
            } else {
                toast.error(result.error || "Failed to generate contract.")
            }
        } catch (error) {
            toast.error("A system error occurred.")
        } finally {
            setLoading(false)
        }
    }
    const handleUploadSignature = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                toast.error("File size must be less than 2MB")
                return
            }
            const reader = new FileReader()
            reader.onloadend = () => {
                setSignature(reader.result as string)
                toast.success("Signature image uploaded successfully")
            }
            reader.readAsDataURL(file)
        }
    }

    const renderCategorySection = (type: "design" | "service" | "product", title: string, titleBn: string, icon: any) => {
        const filtered = categories.filter(c => c.type === type)
        if (filtered.length === 0) return null

        const Icon = icon

        return (
            <div className="space-y-4 pt-6 border-t border-white/5 first:border-0 first:pt-0">
                <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-primary-500" />
                    <Label className="uppercase text-[10px] font-black tracking-widest text-neutral-400">
                        {title} ({titleBn})
                    </Label>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {filtered.map(opt => {
                        const isSelected = formData.selectedServices.includes(opt.id);
                        return (
                            <div 
                                key={opt.id} 
                                className={`flex items-center space-x-3 p-4 border rounded-2xl transition-all cursor-pointer group ${isSelected ? 'bg-blue-600 border-blue-500 text-white shadow-lg' : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'}`} 
                                onClick={() => {
                                    const exists = formData.selectedServices.includes(opt.id)
                                    updateField('selectedServices', exists ? formData.selectedServices.filter(i => i !== opt.id) : [...formData.selectedServices, opt.id])
                                }}
                            >
                                <div 
                                    className={`w-4 h-4 rounded-[4px] border flex items-center justify-center transition-colors pointer-events-none ${isSelected ? 'bg-white border-white text-blue-600' : 'border-neutral-700 bg-transparent text-transparent'}`}
                                >
                                    <Check className="w-3 h-3 stroke-[3]" />
                                </div>
                                <div className="flex flex-col">
                                    <span className={`text-[11px] font-bold uppercase tracking-wider ${isSelected ? 'text-white' : 'text-neutral-200'}`}>{opt.name}</span>
                                    {opt.name_bn && <span className={`text-[9px] font-medium ${isSelected ? 'text-blue-100' : 'text-neutral-500'}`}>{opt.name_bn}</span>}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        )
    }

    if (step === 5) {
        return (
            <div className="max-w-2xl mx-auto text-center p-12 space-y-6 animate-in fade-in zoom-in duration-500">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                    <FileCheck className="w-10 h-10 text-emerald-600" />
                </div>
                <h2 className="text-3xl font-black text-neutral-900 tracking-tight">Contract Signed!</h2>
                <p className="text-neutral-500 font-medium">Your merchant profile is now under review. You can now access your customized dashboard to begin setting up your marketplace listing.</p>
                <div className="flex flex-col gap-3">
                    <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white font-bold tracking-widest uppercase text-xs h-14 rounded-2xl" onClick={() => router.push('/dashboard')}>
                        Go to Dashboard
                    </Button>
                    <Button variant="ghost" size="sm" className="text-neutral-400 font-bold uppercase text-[10px]" onClick={() => window.location.reload()}>
                        Start New Agreement
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12 text-white">
            {/* Step Indicator */}
            <div className="flex justify-between items-center px-4">
                {[1, 2, 3, 4].map((s) => (
                    <div key={s} className="flex flex-col items-center flex-1 relative">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs z-10 transition-all ${step >= s ? 'bg-primary-600 text-white ring-4 ring-primary-900/40 shadow-lg shadow-blue-900/20' : 'bg-neutral-800 text-neutral-500 border border-neutral-700'}`}>
                            {s}
                        </div>
                        {s < 4 && <div className={`h-[2px] w-full absolute top-4 left-1/2 -z-0 ${step > s ? 'bg-primary-600 shadow-[0_0_10px_rgba(37,99,235,0.3)]' : 'bg-neutral-800'}`} />}
                        <span className="text-[9px] mt-2 font-black uppercase tracking-widest text-neutral-500">Step {s}</span>
                    </div>
                ))}
            </div>

            {/* Step 1: Personal Information */}
            {step === 1 && (
                <Card className="animate-in slide-in-from-right-4 duration-300 bg-neutral-900/50 backdrop-blur-3xl border-white/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.02]">
                        <Award className="w-32 h-32" />
                    </div>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2 text-white italic">
                            <Award className="w-5 h-5 text-primary-500" />
                            <span className="uppercase tracking-tight font-black">ধারা ১ — পক্ষগণের তথ্য (Party Info)</span>
                        </CardTitle>
                        <CardDescription className="text-neutral-400 font-medium">Enter the personal identification details of the partner.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] uppercase font-black tracking-widest text-neutral-500">Partner Name (পূর্ণ নাম)</Label>
                                <Input value={formData.partnerName} onChange={e => updateField('partnerName', e.target.value)} placeholder="Full Name per NID" className="bg-neutral-950 border-neutral-800 text-white rounded-xl h-11 focus:border-primary-500" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] uppercase font-black tracking-widest text-neutral-500">NID / Passport (এনআইডি নম্বর)</Label>
                                <Input value={formData.nidPassport} onChange={e => updateField('nidPassport', e.target.value)} placeholder="000 000 0000" className="bg-neutral-950 border-neutral-800 text-white rounded-xl h-11 focus:border-primary-500" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] uppercase font-black tracking-widest text-neutral-500">Phone (মোবাইল নম্বর)</Label>
                                <Input value={formData.phone} onChange={e => updateField('phone', e.target.value)} className="bg-neutral-950 border-neutral-800 text-white rounded-xl h-11 focus:border-primary-500" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] uppercase font-black tracking-widest text-neutral-500">Email (ই-মেইল)</Label>
                                <Input type="email" value={formData.email} onChange={e => updateField('email', e.target.value)} className="bg-neutral-950 border-neutral-800 text-white rounded-xl h-11 focus:border-primary-500" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] uppercase font-black tracking-widest text-neutral-500">Address (স্থায়ী ঠিকানা)</Label>
                            <Textarea value={formData.address} onChange={e => updateField('address', e.target.value)} rows={3} className="bg-neutral-950 border-neutral-800 text-white rounded-xl focus:border-primary-500" />
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Step 2: Business & Services */}
            {step === 2 && (
                <Card className="animate-in slide-in-from-right-4 duration-300 bg-neutral-900/50 backdrop-blur-3xl border-white/5 relative overflow-hidden">
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2 text-white italic">
                            <Landmark className="w-5 h-5 text-primary-500" />
                            <span className="uppercase tracking-tight font-black">ধারা ১.৩ ও ২ — ব্যবসায়িক তথ্য (Business)</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4 border-b border-white/5">
                            <div className="space-y-2">
                                <Label className="text-[10px] uppercase font-black tracking-widest text-neutral-500">Business Name (প্রতিষ্ঠানের নাম)</Label>
                                <Input value={formData.businessName} onChange={e => updateField('businessName', e.target.value)} className="bg-neutral-950 border-neutral-800 text-white rounded-xl h-11 focus:border-primary-500" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] uppercase font-black tracking-widest text-neutral-500">Trade License (ট্রেড লাইসেন্স)</Label>
                                <Input value={formData.tradeLicense} onChange={e => updateField('tradeLicense', e.target.value)} className="bg-neutral-950 border-neutral-800 text-white rounded-xl h-11 focus:border-primary-500" />
                            </div>
                        </div>
                        
                        {fetchingData ? (
                            <div className="flex flex-col items-center justify-center py-12 gap-4">
                                <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-500">Synchronizing Services...</p>
                            </div>
                        ) : (
                            <div className="space-y-8">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary-500/80">Scope of Work (কাজের পরিধি)</h3>
                                
                                {renderCategorySection('design', 'Design & Planning', 'ডিজাইন ও পরিকল্পনা', PencilRuler)}
                                {renderCategorySection('service', 'General Services', 'সাধারণ সেবা সমূহ', Wrench)}
                                {renderCategorySection('product', 'Materials & Products', 'নির্মাণ সামগ্রী ও পণ্য', Package)}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Step 3: Payment Details */}
            {step === 3 && (
                <Card className="animate-in slide-in-from-right-4 duration-300 bg-neutral-900/50 backdrop-blur-3xl border-white/5 relative overflow-hidden">
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2 text-white italic">
                            <Scale className="w-5 h-5 text-primary-500" />
                            <span className="uppercase tracking-tight font-black">ধারা ৩ — পেমেন্ট পদ্ধতি (Payment)</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] uppercase font-black tracking-widest text-neutral-500">Bank Account No. (ব্যাংক অ্যাকাউন্ট নম্বর)</Label>
                                <Input value={formData.bankAccount} onChange={e => updateField('bankAccount', e.target.value)} className="bg-neutral-950 border-neutral-800 text-white rounded-xl h-11 focus:border-primary-500" />
                            </div>
                             <div className="space-y-2">
                                <Label className="text-[10px] uppercase font-black tracking-widest text-neutral-500">Bank Name (ব্যাংকের নাম)</Label>
                                <Input value={formData.bankName} onChange={e => updateField('bankName', e.target.value)} className="bg-neutral-950 border-neutral-800 text-white rounded-xl h-11 focus:border-primary-500" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] uppercase font-black tracking-widest text-neutral-500">Branch Name (শাখার নাম)</Label>
                                <Input value={formData.branchName} onChange={e => updateField('branchName', e.target.value)} className="bg-neutral-950 border-neutral-800 text-white rounded-xl h-11 focus:border-primary-500" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] uppercase font-black tracking-widest text-neutral-500">Mobile Financial (MFS) No. (বিকাশ / নগদ)</Label>
                            <Input value={formData.mobilePayment} onChange={e => updateField('mobilePayment', e.target.value)} placeholder="01XXXXXXXXX" className="bg-neutral-950 border-neutral-800 text-white rounded-xl h-11 focus:border-primary-500" />
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Step 4: Signing */}
            {step === 4 && (
                <Card className="animate-in slide-in-from-right-4 duration-300 bg-neutral-900/50 backdrop-blur-3xl border-white/5 relative overflow-hidden shadow-2xl">
                    <CardHeader className="border-b border-white/5">
                        <CardTitle className="text-white italic font-black uppercase tracking-tight flex items-center gap-2">
                             <FileCheck className="w-5 h-5 text-primary-500" />
                             ধারা ৬ — স্বাক্ষর ও ঘোষণা (Finalize)
                        </CardTitle>
                        <CardDescription className="text-neutral-500 font-medium">By signing below, you agree to the Terms & Conditions of Dalankotha Platform.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8 pt-8">
                        <div className="space-y-4">
                            <Label className="text-[10px] uppercase font-black tracking-widest text-neutral-500 flex items-center gap-2">
                                <Award className="w-3 h-3" />
                                Witness Name (সাক্ষীর নাম)
                            </Label>
                            <Input 
                                value={formData.witnessName} 
                                onChange={e => updateField('witnessName', e.target.value)} 
                                placeholder="Full name of witness" 
                                className="bg-neutral-950 border-neutral-800 text-white rounded-2xl h-12 focus:border-primary-500 transition-all font-medium" 
                            />
                        </div>

                        <Tabs defaultValue="draw" className="w-full" onValueChange={(v) => setSignatureMode(v as any)}>
                            <div className="flex items-center justify-between mb-4">
                                <Label className="uppercase text-[10px] font-black tracking-[0.2em] text-primary-500 flex items-center gap-2">
                                    <Scale className="w-3 h-3" />
                                    Digital Signature (ডিজিটাল স্বাক্ষর)
                                </Label>
                                <TabsList className="bg-neutral-950 border border-white/5 h-10 p-1 rounded-xl">
                                    <TabsTrigger value="draw" className="text-[9px] font-black uppercase tracking-widest data-[state=active]:bg-primary-600 data-[state=active]:text-white rounded-lg px-4 transition-all">
                                        <MousePointer2 className="w-3 h-3 mr-2" />
                                        Draw
                                    </TabsTrigger>
                                    <TabsTrigger value="upload" className="text-[9px] font-black uppercase tracking-widest data-[state=active]:bg-primary-600 data-[state=active]:text-white rounded-lg px-4 transition-all">
                                        <Upload className="w-3 h-3 mr-2" />
                                        Upload
                                    </TabsTrigger>
                                </TabsList>
                            </div>

                            <TabsContent value="draw" className="animate-in fade-in zoom-in-95 duration-300">
                                <SignaturePad onSave={setSignature} />
                            </TabsContent>

                            <TabsContent value="upload" className="animate-in fade-in zoom-in-95 duration-300">
                                <div className="border-2 border-dashed border-neutral-800 rounded-2xl bg-neutral-950 p-12 text-center space-y-4 hover:border-primary-500/50 transition-all group">
                                    <div className="w-16 h-16 bg-primary-600/10 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                                        <Upload className="w-8 h-8 text-primary-500" />
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-white text-sm font-bold">Upload Digital Signature</p>
                                        <p className="text-neutral-500 text-[10px] font-medium max-w-[200px] mx-auto">SVG, PNG or JPG (recommended resolution: 500x200)</p>
                                    </div>
                                    <Input 
                                        type="file" 
                                        accept="image/*" 
                                        onChange={handleUploadSignature}
                                        className="hidden" 
                                        id="signature-upload"
                                    />
                                    <Button 
                                        type="button"
                                        variant="outline" 
                                        onClick={() => document.getElementById('signature-upload')?.click()}
                                        className="bg-primary-600 border-none hover:bg-primary-700 text-white font-black text-[10px] uppercase tracking-widest px-8 rounded-xl h-10"
                                    >
                                        Browse Files
                                    </Button>
                                    
                                    {signature && signatureMode === 'upload' && (
                                        <div className="pt-4 animate-in fade-in slide-in-from-bottom-2">
                                            <div className="relative inline-block p-2 bg-white rounded-xl shadow-2xl">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img src={signature} alt="Signature Preview" className="h-16 object-contain" />
                                                <div className="absolute -top-2 -right-2 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-neutral-950 shadow-lg">
                                                    <FileCheck className="w-3 h-3 text-white" />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            )}

            {/* Control Buttons */}
            <div className="flex justify-between items-center px-2">
                <Button variant="ghost" disabled={step === 1 || loading} onClick={prevStep} className="text-neutral-400 hover:text-white hover:bg-white/5 font-bold">
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Previous
                </Button>
                {step < 4 ? (
                    <Button onClick={nextStep} className="font-bold">
                        Next
                        <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                ) : (
                    <Button onClick={handleSubmit} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white font-black px-10 rounded-xl shadow-xl shadow-blue-900/20 uppercase tracking-widest text-xs italic">
                        {loading ? 'Generating Contract...' : 'Sign & Complete'}
                    </Button>
                )}
            </div>
        </div>
    )
}
